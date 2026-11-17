import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getMenuItems = (role, roleLevel) => {
    const menus = {
      student: [
        { path: "/student/dashboard", label: "Dashboard", icon: "📊" },
        { path: "/student/feed", label: "Feed", icon: "📰" },
        { path: "/student/profile", label: "My Profile", icon: "👤" },
        { path: "/student/jobs", label: "Browse Jobs", icon: "💼" },
        { path: "/student/referrals", label: "Browse Referrals", icon: "📌" },
        { path: "/student/applications", label: "My Applications", icon: "📝" },
        { path: "/student/placements", label: "My Placements", icon: "🏆" },
        { path: "/notifications", label: "Notifications", icon: "🔔" },
      ],
      recruiter: [
        { path: "/recruiter/dashboard", label: "Dashboard", icon: "📊" },
        { path: "/recruiter/feed", label: "Feed", icon: "📰" },
        { path: "/recruiter/profile", label: "Company Profile", icon: "🏢" },
        { path: "/recruiter/jobs", label: "My Jobs", icon: "💼" },
        { path: "/recruiter/post-job", label: "Post Job", icon: "➕" },
        { path: "/notifications", label: "Notifications", icon: "🔔" },
      ],
      admin: [
        { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
        { path: "/admin/feed", label: "Feed", icon: "📰" },
        { path: "/admin/profile", label: "My Profile", icon: "👤" },
        {
          path: "/admin/recruiters/pending",
          label: "Pending Recruiters",
          icon: "🏢",
        },
        { path: "/admin/alumni/pending", label: "Pending Alumni", icon: "🎓" },
        { path: "/admin/students", label: "Manage Students", icon: "👥" },
        { path: "/admin/recruiters", label: "All Recruiters", icon: "🏢" },
        { path: "/admin/alumni", label: "All Alumni", icon: "🎓" },
        { path: "/admin/jobs", label: "All Jobs", icon: "💼" },
        { path: "/admin/jobs/pending", label: "Pending Jobs", icon: "⏳" },
        {
          path: "/admin/referrals/pending",
          label: "Pending Referrals",
          icon: "📌",
        },
        { path: "/admin/referrals", label: "All Referrals", icon: "📎" },

        { path: "/admin/applications", label: "All Applications", icon: "📝" },
        {
          path: "/admin/extension-requests",
          label: "Extension Requests",
          icon: "⏰",
        },
        { path: "/admin/analytics", label: "Analytics", icon: "📈" },
        ...(roleLevel === "super_admin"
          ? [
              {
                path: "/admin/admin-management",
                label: "Admin Management",
                icon: "🛠️",
              },
            ]
          : []),
        { path: "/notifications", label: "Notifications", icon: "🔔" },
      ],
      alumni: [
        { path: "/alumni/dashboard", label: "Dashboard", icon: "📊" },
        { path: "/alumni/feed", label: "Feed", icon: "📰" },
        { path: "/alumni/profile", label: "My Profile", icon: "👤" },
        { path: "/alumni/referrals", label: "My Referrals", icon: "🔗" },
        { path: "/alumni/post-referral", label: "Post Referral", icon: "➕" },
        { path: "/notifications", label: "Notifications", icon: "🔔" },
      ],
    };
    return menus[role] || [];
  };

  const menuItems = getMenuItems(user?.role, user?.roleLevel);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="w-64 shrink-0 bg-white shadow-md sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? "bg-primary-100 text-primary-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
