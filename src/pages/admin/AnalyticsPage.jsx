import { useState, useEffect } from "react";
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
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    branch: "",
    company: "",
  });
  const [branches, setBranches] = useState([
    "CSE",
    "IT",
    "ECE",
    "EEE",
    "MECH",
    "CIVIL",
    "AIDS",
    "AIML",
  ]);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    fetchAnalytics();
    fetchCompanies();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.branch) params.branch = filters.branch;
      if (filters.company) params.company = filters.company;

      const response = await api.get("/analytics/admin/advanced", { params });
      if (response.data.success) {
        setAnalytics(response.data.data);
        //setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      // ✅ IMPROVED: Get companies from analytics data
      const response = await api.get("/analytics/admin/advanced");

      //if (response.data.success && response.data.analytics?.companyWise) {
      if (response.data.success && response.data.data?.companyWise) {
        const companyList = response.data.analytics.companyWise
          .map((c) => c.company)
          .filter((c) => c && c !== "Unknown");
        setCompanies([...new Set(companyList)]);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleApplyFilters = () => {
    fetchAnalytics();
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      branch: "",
      company: "",
    });
    setTimeout(fetchAnalytics, 100);
  };

  const handleExport = async (type) => {
    try {
      setExporting(true);

      // ✅ PASS FILTERS TO EXPORT
      const params = {
        type,
        format: "json",
        branch: filters.branch || undefined,
        company: filters.company || undefined,
      };

      const response = await api.get("/analytics/admin/export", { params });

      if (response.data.success) {
        // Convert to CSV
        const data = response.data.data;
        if (data.length === 0) {
          alert("No data to export");
          return;
        }

        const headers = Object.keys(data[0]);
        const csv = [
          headers.join(","),
          ...data.map((row) =>
            headers.map((h) => `"${row[h] || ""}"`).join(","),
          ),
        ].join("\n");

        // ✅ FILENAME WITH FILTERS
        const timestamp = new Date().toISOString().split("T")[0];
        const branchSuffix = filters.branch ? `_${filters.branch}` : "";
        const companySuffix = filters.company
          ? `_${filters.company.replace(/\s+/g, "_")}`
          : "";

        const filename = `${type}${branchSuffix}${companySuffix}_${timestamp}.csv`;

        // Download
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#EF4444",
    "#8B5CF6",
    "#F59E0B",
    "#06B6D4",
    "#EC4899",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Advanced Analytics
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive insights and data analysis
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <div className="flex gap-3">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-semibold"
                >
                  Reset
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition font-semibold"
                >
                  Apply Filters
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Branch Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch
                </label>
                <select
                  name="branch"
                  value={filters.branch}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Branches</option>
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>

              {/* Company Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <select
                  name="company"
                  value={filters.company}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Companies</option>
                  {companies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ✅ NEW: Active Filters Indicator */}
          {(filters.branch ||
            filters.company ||
            filters.startDate ||
            filters.endDate) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-800 font-semibold mb-2">
                    📊 Active Filters:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {filters.branch && (
                      <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold">
                        Branch: {filters.branch}
                      </span>
                    )}
                    {filters.company && (
                      <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-semibold">
                        Company: {filters.company}
                      </span>
                    )}
                    {filters.startDate && (
                      <span className="px-3 py-1 bg-orange-600 text-white rounded-full text-xs font-semibold">
                        From: {filters.startDate}
                      </span>
                    )}
                    {filters.endDate && (
                      <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-semibold">
                        To: {filters.endDate}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

          {/* Export Buttons */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Export Data
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => handleExport("students")}
                disabled={exporting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>{exporting ? "Exporting..." : "Export Students"}</span>
              </button>
              <button
                onClick={() => handleExport("applications")}
                disabled={exporting}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-semibold flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>
                  {exporting ? "Exporting..." : "Export Applications"}
                </span>
              </button>
              <button
                onClick={() => handleExport("jobs")}
                disabled={exporting}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 font-semibold flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>{exporting ? "Exporting..." : "Export Jobs"}</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading analytics...</p>
              </div>
            </div>
          ) : analytics ? (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                  <p className="text-blue-100 text-sm font-medium">
                    Total Applications
                  </p>
                  <p className="text-4xl font-bold mt-2">
                    {analytics.overview?.totalApplications || 0}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                  <p className="text-green-100 text-sm font-medium">
                    Total Selected
                  </p>
                  <p className="text-4xl font-bold mt-2">
                    {analytics.overview?.totalSelected || 0}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                  <p className="text-purple-100 text-sm font-medium">
                    Success Rate
                  </p>
                  <p className="text-4xl font-bold mt-2">
                    {analytics.overview?.overallSuccessRate || 0}%
                  </p>
                </div>
              </div>

              {/* Branch-wise Analysis */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Branch-wise Performance
                </h3>
                {analytics.branchWise && analytics.branchWise.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={analytics.branchWise}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="branch" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="totalApplications"
                        fill="#3B82F6"
                        name="Applications"
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="selected"
                        fill="#10B981"
                        name="Selected"
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="avgAtsScore"
                        //dataKey="avgATSScore"
                        fill="#F59E0B"
                        name="Avg ATS Score"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No branch data available
                  </p>
                )}
              </div>

              {/* Company-wise Analysis */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Company-wise Hiring
                </h3>
                {analytics.companyWise && analytics.companyWise.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Company
                          </th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700">
                            Applications
                          </th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700">
                            Hired
                          </th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700">
                            Jobs Posted
                          </th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700">
                            Success Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.companyWise
                          .slice(0, 10)
                          .map((company, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              <td className="py-3 px-4 font-medium">
                                {company.company}
                              </td>
                              <td className="text-center py-3 px-4">
                                {company.totalApplications}
                              </td>
                              <td className="text-center py-3 px-4 text-green-600 font-semibold">
                                {company.hired}
                              </td>
                              <td className="text-center py-3 px-4">
                                {company.jobsPosted}
                              </td>
                              <td className="text-center py-3 px-4">
                                {company.totalApplications > 0
                                  ? `${Math.round((company.hired / company.totalApplications) * 100)}%`
                                  : "0%"}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No company data available
                  </p>
                )}
              </div>

              {/* CGPA vs Success Rate */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    CGPA vs Success Rate
                  </h3>
                  {analytics.cgpaAnalysis &&
                  analytics.cgpaAnalysis.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.cgpaAnalysis}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="cgpaRange" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="successRate"
                          fill="#8B5CF6"
                          name="Success Rate %"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      No CGPA data available
                    </p>
                  )}
                </div>

                {/* Top Skills */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Top Skills in Demand
                  </h3>
                  {analytics.topSkills && analytics.topSkills.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.topSkills.map((skill, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-gray-700 font-medium">
                            {skill.skill}
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${(skill.demand / analytics.topSkills[0].demand) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-8 text-right">
                              {skill.demand}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      No skill data available
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Click "Apply Filters" to view analytics
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
