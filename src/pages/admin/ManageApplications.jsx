import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import {
  getApplicationStatusColor,
  getApplicationStatusLabel,
  formatDate,
} from "../../utils/helpers";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";

const ManageApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    fetchApplications();
  }, [filterStatus]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const res = await adminAPI.getAllApplications(params);
      //setApplications(res.data.applications);
      setApplications(res.data.data);
    } catch (error) {
      console.error("Fetch applications error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              All Applications 📝
            </h1>
            <p className="text-gray-600">Monitor all job applications</p>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                Filter by Status:
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field w-48"
              >
                <option value="">All Status</option>
                <option value="applied">Applied</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
                <option value="selected">Selected</option>
                <option value="on-hold">On Hold</option>
              </select>
              <span className="text-sm text-gray-500">
                {applications.length} application(s)
              </span>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      #
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Student
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Job Title
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Company
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Applied
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                      </td>
                    </tr>
                  ) : applications.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-10 text-gray-400"
                      >
                        No applications found
                      </td>
                    </tr>
                  ) : (
                    // applications.map((app, index) => (
                    //   <tr key={app._id} className="hover:bg-gray-50">
                    //     <td className="px-6 py-4 text-sm text-gray-500">
                    //       {index + 1}
                    //     </td>
                    //     <td className="px-6 py-4">
                    //       <p className="text-sm font-medium text-gray-900">
                    //         {app.studentId?.personalInfo?.firstName}{" "}
                    //         {app.studentId?.personalInfo?.lastName}
                    //       </p>
                    //       <p className="text-xs text-gray-500">
                    //         {app.studentId?.registrationNumber}
                    //       </p>
                    //     </td>
                    //     <td className="px-6 py-4 text-sm text-gray-700">
                    //       {app.jobId?.title}
                    //     </td>
                    //     <td className="px-6 py-4 text-sm text-gray-700">
                    //       {app.jobId?.recruiterId?.companyInfo?.companyName}
                    //     </td>
                    //     <td className="px-6 py-4">
                    //       <span
                    //         className={`text-xs font-semibold px-2 py-1 rounded-full ${getApplicationStatusColor(app.status)}`}
                    //       >
                    //         {getApplicationStatusLabel(app.status)}
                    //       </span>
                    //     </td>
                    //     <td className="px-6 py-4 text-sm text-gray-500">
                    //       {formatDate(app.appliedAt)}
                    //     </td>
                    //   </tr>
                    // ))
                    applications.map((app, index) => (
                      <tr key={app.id} className="hover:bg-gray-50"> {/* was app._id */}
                        <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">{app.studentName}</p>
                          <p className="text-xs text-gray-500">{app.registrationNumber}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{app.jobTitle}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{app.companyName}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getApplicationStatusColor(app.status)}`}>
                            {getApplicationStatusLabel(app.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(app.appliedAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageApplications;
