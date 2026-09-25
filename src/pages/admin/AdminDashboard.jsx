import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import api from "../../services/api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/analytics/admin/dashboard");
      if (response.data.success) {
        setStats(response.data.data);
        //setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-8">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const COLORS = ["#3B82F6", "#10B981", "#EF4444", "#8B5CF6", "#F59E0B"];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">System overview and analytics</p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.users?.total || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.users?.students || 0} students,{" "}
                    {stats?.users?.recruiters || 0} recruiters
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Jobs */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Total Jobs
                  </p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {stats?.jobs?.total || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.jobs?.active || 0} active,{" "}
                    {stats?.jobs?.pending || 0} pending
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <svg
                    className="w-8 h-8 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Applications */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Total Applications
                  </p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {stats?.applications?.total || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.applications?.shortlisted || 0} shortlisted
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Placements */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Placement Rate
                  </p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {stats?.placements?.percentage || 0}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.placements?.placed || 0} placed students
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Package Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    Average Package
                  </p>
                  <p className="text-4xl font-bold mt-2">
                    ₹{stats?.placements?.avgPackage || 0} LPA
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-full">
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">
                    Highest Package
                  </p>
                  <p className="text-4xl font-bold mt-2">
                    ₹{stats?.placements?.highestPackage || 0} LPA
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-full">
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Application Trend */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Application Trend (Last 30 Days)
              </h3>
              {stats?.charts?.applicationTrend &&
              stats.charts.applicationTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={stats.charts.applicationTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                     // dataKey="applications"
                      stroke="#7C3AED"
                      strokeWidth={2}
                      name="Applications"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <p>No application data yet</p>
                </div>
              )}
            </div>

            {/* Status Distribution */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Application Status Distribution
              </h3>
              {stats?.charts?.statusDistribution &&
              stats.charts.statusDistribution.filter((s) => s.value > 0)
                .length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={stats.charts.statusDistribution.filter(
                        //(s) => s.value > 0,
                        (s) => s.count > 0,
                      )}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      // label={({ name, percent }) =>
                      //   `${name}: ${(percent * 100).toFixed(0)}%`
                      // }
                      label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      //dataKey="value"
                    >
                      {stats.charts.statusDistribution
                        .filter((s) => s.count > 0)
                        //.filter((s) => s.value > 0)
                        .map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <p>No application data yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Branch Distribution Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Branch-wise Applications
            </h3>
            {stats?.charts?.branchDistribution &&
            stats.charts.branchDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.charts.branchDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="branch" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3B82F6" name="Applications" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p>No branch data yet</p>
              </div>
            )}
          </div>

          {/* Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Jobs */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Jobs
                </h3>
                <button
                  onClick={() => navigate("/admin/jobs")}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  View All →
                </button>
              </div>
              {stats?.recentActivities?.jobs &&
              stats.recentActivities.jobs.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentActivities.jobs.map((job, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">{job.title}</p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            job.status?.toLowerCase() === "approved"
                            //job.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : job.status?.toLowerCase() === "pending"
                             // : job.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {/* {job.status} */}
                          {job.status?.charAt(0).toUpperCase() + job.status?.slice(1).toLowerCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{job.company}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(job.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No recent jobs</p>
                </div>
              )}
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Applications
                </h3>
                <button
                  onClick={() => navigate("/admin/applications")}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  View All →
                </button>
              </div>
              {stats?.recentActivities?.applications &&
              stats.recentActivities.applications.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentActivities.applications.map((app, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">
                          {app.student}
                        </p>
                        {/* <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            app.status === "selected"
                              ? "bg-purple-100 text-purple-700"
                              : app.status === "shortlisted"
                                ? "bg-green-100 text-green-700"
                                : app.status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {app.status}
                        </span> */}
                                                <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            app.status?.toLowerCase() === "selected"
                              ? "bg-purple-100 text-purple-700"
                              : app.status?.toLowerCase() === "shortlisted"
                                ? "bg-green-100 text-green-700"
                                : app.status?.toLowerCase() === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {app.status?.charAt(0).toUpperCase() + app.status?.slice(1).toLowerCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{app.job}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(app.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No recent applications</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
