import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import {
  studentAPI,
  recruiterAPI,
  adminAPI,
  alumniAPI,
} from "../../services/api";
import NotificationBell from "./NotificationBell";
import socket from "../../socket/socketClient";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      let res;
      if (user.role === "student") {
        res = await studentAPI.getProfile();
      } else if (user.role === "recruiter") {
        res = await recruiterAPI.getProfile();
      } else if (user.role === "admin") {
        res = await adminAPI.getProfile();
      } else if (user.role === "alumni") {
        res = await alumniAPI.getProfile();
      }
     // setProfile(res?.data?.profile);
      setProfile(res?.data?.data); //for the backend built on Spring boot
    } catch (error) {
      console.error("Fetch profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATED: Disconnect socket on logout
  const handleLogout = () => {
    console.log("🔌 Disconnecting socket...");
    socket.disconnect();
    logout();
  };

  const getRoleName = (role) => {
    const roles = {
      student: "Student",
      recruiter: "Recruiter",
      admin: "Admin",
      alumni: "Alumni",
    };
    return roles[role] || "User";
  };

  const getDashboardLink = (role) => {
    const links = {
      student: "/student/dashboard",
      recruiter: "/recruiter/dashboard",
      admin: "/admin/dashboard",
      alumni: "/alumni/dashboard",
    };
    return links[role] || "/";
  };

  const getProfileInitial = () => {
    if (user?.role === "student" && profile?.personalInfo?.firstName) {
      return profile.personalInfo.firstName[0].toUpperCase();
    }
    if (user?.role === "recruiter" && profile?.companyInfo?.companyName) {
      return profile.companyInfo.companyName[0].toUpperCase();
    }
   // if (user?.role === "admin" && profile?.name) {
    if (user?.role === "admin" && profile?.firstName) {
      //return profile.name[0].toUpperCase();
      return profile.firstName[0].toUpperCase();
    }
    if (user?.role === "alumni" && profile?.personalInfo?.firstName) {
      return profile.personalInfo.firstName[0].toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || "U";
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to={getDashboardLink(user?.role)}
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900">CareerLink</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Role Badge */}
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              {getRoleName(user?.role)}
            </span>

            {/* Email */}
            <span className="text-sm text-gray-600 hidden md:block">
              {user?.email}
            </span>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Profile Photo/Avatar */}
            {!loading && (
              <div className="flex items-center">
                {/* Student Photo */}
               {/* {user?.role === "student" && profile?.photo?.url ? ( */}
                {user?.role === "student" && profile?.photoUrl ? (
                  <img
                   // src={profile.photo.url}
                    src={profile.photoUrl} //for the backend built on Spring boot
                    alt="Profile"
                    className="w-9 h-9 rounded-full object-cover border-2 border-primary-200"
                  />
                ) : /* Recruiter Logo */
                user?.role === "recruiter" &&
                  //profile?.companyInfo?.companyLogo?.url ? (
                  profile?.companyLogoUrl ? (
                  <img
                    //src={profile.companyInfo.companyLogo.url}
                    src={profile.companyLogoUrl} //for the backend built on Spring boot
                    alt="Company Logo"
                    className="w-9 h-9 rounded-lg object-contain border border-gray-200 p-1 bg-white"
                  />
                ) : (
                  /* Fallback Avatar with Initial */
                  <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-sm">
                      {getProfileInitial()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
