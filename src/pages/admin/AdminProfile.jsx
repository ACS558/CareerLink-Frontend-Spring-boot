import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import toast from "react-hot-toast";

const AdminProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    department: "",
    phoneNumber: "",
    email: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await adminAPI.getProfile();
      const p = res.data.data;
      //const p = res.data.profile;
      setProfile({
        name: [p.firstName, p.lastName].filter(Boolean).join(" "),
       // name: p.name || "",
        department: p.department || "",
        phoneNumber: p.phoneNumber || "",
        email: p.email || "",
      });
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      // await adminAPI.updateProfile({
      //   name: profile.name,
      //   department: profile.department,
      //   phoneNumber: profile.phoneNumber,
      const [firstName, ...rest] = profile.name.trim().split(" ");
      const lastName = rest.join(" ");
      await adminAPI.updateProfile({
        firstName: firstName || "",
        lastName: lastName || "",
        department: profile.department,
        phoneNumber: profile.phoneNumber,
      });
      toast.success("Profile updated!");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
            <p className="text-gray-600">Manage your admin account details</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Avatar */}
            <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-red-600">
                  {(profile.name || "?")[0]}
                </span>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {profile.name}
                </p>
                <p className="text-gray-500">{profile.department}</p>
                <p className="text-sm text-gray-400">{profile.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  placeholder="Dr. Placement Officer"
                />
              </div>
              <div>
                <label className="label">Department</label>
                <input
                  type="text"
                  className="input-field"
                  value={profile.department}
                  onChange={(e) =>
                    setProfile({ ...profile, department: e.target.value })
                  }
                  placeholder="Training & Placement Cell"
                />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  className="input-field"
                  value={profile.phoneNumber}
                  onChange={(e) =>
                    setProfile({ ...profile, phoneNumber: e.target.value })
                  }
                  placeholder="+91 9999999999"
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input-field bg-gray-100"
                  value={profile.email}
                  disabled
                />
              </div>
            </div>

            <button
              onClick={saveProfile}
              disabled={saving}
              className="mt-6 btn-primary px-8 py-2"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminProfile;
