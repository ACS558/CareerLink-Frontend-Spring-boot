import { useState, useEffect } from "react";
import { notificationAPI } from "../../services/api";
import { formatDistanceToNow } from "date-fns";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getNotifications({ size: 50 }); // was { limit: 50 }
      setActivities(res.data.data.content); // was res.data.notifications
    } catch (error) {
      console.error("Fetch activities error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      job_approved: "✅",
      job_rejected: "❌",
      application_received: "📝",
      application_shortlisted: "🎉",
      application_rejected: "📋",
      application_selected: "🎊",
      recruiter_approved: "✅",
      recruiter_rejected: "❌",
      alumni_approved: "✅",
      alumni_rejected: "❌",
    };
    return icons[type?.toLowerCase()] || "🔔"; // was icons[type]
  };

  const getActivityColor = (type) => {
    const t = type?.toLowerCase() || ""; // backend sends uppercase enum names
    if (t.includes("approved") || t.includes("selected") || t.includes("shortlisted")) {
      return "bg-green-100 text-green-800 border-green-300";
    }
    if (t.includes("rejected")) {
      return "bg-red-100 text-red-800 border-red-300";
    }
    return "bg-blue-100 text-blue-800 border-blue-300";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Activity Feed 📋
            </h1>
            <p className="text-gray-600">Your recent activity timeline</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <span className="text-5xl">📭</span>
              <p className="text-gray-500 mt-3 text-lg">No activities yet</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

              {/* Activities */}
              <div className="space-y-6">
                {activities.map((activity, index) => (
                  <div key={activity.id} className="relative flex items-start space-x-6"> {/* was activity._id */}
                    {/* Timeline Dot */}
                    <div
                      className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full border-4 border-white flex items-center justify-center ${getActivityColor(activity.type)}`}
                    >
                      <span className="text-2xl">
                        {getActivityIcon(activity.type)}
                      </span>
                    </div>

                    {/* Activity Card */}
                    <div className="flex-1 bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {activity.title}
                        </h3>
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(activity.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {activity.message}
                      </p>

                      {/* Metadata */}
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                                                <span className="capitalize">
                          {activity.type.toLowerCase().replace(/_/g, " ")} {/* was activity.type.replace without lowercase */}
                        </span>
                        {activity.priority?.toLowerCase() === "high" && ( // was === "high"
                          <span className="text-red-600 font-semibold">
                            High Priority
                          </span>
                        )}
                        {activity.isRead && <span>✓ Read</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ActivityFeed;
