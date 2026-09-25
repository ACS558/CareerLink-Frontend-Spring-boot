import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ ADD THIS IMPORT
import { adminAPI } from "../../services/api";
import { getStatusBadgeColor, formatDate } from "../../utils/helpers";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";

const ManageJobs = () => {
  const navigate = useNavigate(); // ✅ ADD THIS
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchJobs();
  }, [search, status]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (status) params.approvalStatus = status;
      const res = await adminAPI.getAllJobs(params);
      //setJobs(res.data.jobs);
      setJobs(res.data.data);
    } catch (error) {
      console.error("Fetch jobs error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADD THIS FUNCTION
  // const handleJobClick = (job) => {
  //   // Only allow clicking on approved jobs
  //   if (job.approvalStatus === "approved") {
  //     navigate(`/admin/jobs/${job._id}`);
  //   }
  // };

   const handleJobClick = (job) => {
    if (job.approvalStatus?.toLowerCase() === "approved") { 
      navigate(`/admin/jobs/${job.id}`); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">All Jobs 💼</h1>
            <p className="text-gray-600">View and manage all job postings</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  className="input-field"
                  placeholder="🔍 Search by job title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div>
                <select
                  className="input-field"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Count */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{jobs.length}</span>{" "}
              job(s)
            </p>
          </div>

          {/* Jobs Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      #
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Job Title
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Company
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Location
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Posted
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                      </td>
                    </tr>
                  ) : jobs.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center py-10 text-gray-400"
                      >
                        No jobs found
                      </td>
                    </tr>
                  ) : (
                    // jobs.map((job, index) => (
                    //   <tr
                    //     key={job._id}
                    //     onClick={() => handleJobClick(job)} // ✅ ADD THIS
                    //     className={`hover:bg-gray-50 transition ${
                    //       // ✅ UPDATE THIS
                    //       job.approvalStatus === "approved"
                    //         ? "cursor-pointer hover:bg-blue-50"
                    //         : "cursor-not-allowed opacity-60"
                    //     }`}
                    //   >
                    //     <td className="px-6 py-4 text-sm text-gray-500">
                    //       {index + 1}
                    //     </td>
                    //     <td className="px-6 py-4">
                    //       <div className="flex items-center space-x-2">
                    //         {" "}
                    //         {/* ✅ ADD THIS */}
                    //         <div>
                    //           <p className="text-sm font-semibold text-gray-900">
                    //             {job.title}
                    //           </p>
                    //           <p className="text-xs text-gray-500">
                    //             {job.jobType} • {job.workMode}
                    //           </p>
                    //         </div>
                    //         {/* ✅ ADD CLICK INDICATOR FOR APPROVED JOBS */}
                    //         {job.approvalStatus === "approved" && (
                    //           <svg
                    //             className="w-4 h-4 text-blue-600"
                    //             fill="none"
                    //             stroke="currentColor"
                    //             viewBox="0 0 24 24"
                    //           >
                    //             <path
                    //               strokeLinecap="round"
                    //               strokeLinejoin="round"
                    //               strokeWidth={2}
                    //               d="M9 5l7 7-7 7"
                    //             />
                    //           </svg>
                    //         )}
                    //       </div>
                    //     </td>
                    //     <td className="px-6 py-4">
                    //       <p className="text-sm font-medium text-gray-700">
                    //         {job.recruiterId?.companyInfo?.companyName}
                    //       </p>
                    //       <p className="text-xs text-gray-400">
                    //         {job.recruiterId?.userId?.email}
                    //       </p>
                    //     </td>
                    //     <td className="px-6 py-4 text-sm text-gray-700">
                    //       {job.location}
                    //     </td>
                    //     <td className="px-6 py-4 text-sm text-gray-700">
                    //       {job.jobType}
                    //     </td>
                    //     <td className="px-6 py-4">
                    //       <span
                    //         className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusBadgeColor(job.approvalStatus)}`}
                    //       >
                    //         {job.approvalStatus.charAt(0).toUpperCase() +
                    //           job.approvalStatus.slice(1)}
                    //       </span>
                    //     </td>
                    //     <td className="px-6 py-4 text-sm text-gray-500">
                    //       {formatDate(job.createdAt)}
                    //     </td>
                    //   </tr>
                    // ))
                                        jobs.map((job, index) => (
                      <tr
                        key={job.id} // was job._id
                        onClick={() => handleJobClick(job)}
                        className={`hover:bg-gray-50 transition ${
                          job.approvalStatus?.toLowerCase() === "approved" 
                            ? "cursor-pointer hover:bg-blue-50"
                            : "cursor-not-allowed opacity-60"
                        }`}
                      >
                        <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{job.title}</p>
                              <p className="text-xs text-gray-500">{job.jobType} • {job.workMode}</p>
                            </div>
                            {job.approvalStatus?.toLowerCase() === "approved" && ( 
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-700">{job.companyName}</p>
                          <p className="text-xs text-gray-400">{job.recruiterEmail}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{job.location}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{job.jobType}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusBadgeColor(job.approvalStatus)}`}>
                            {job.approvalStatus.charAt(0).toUpperCase() + job.approvalStatus.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(job.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ✅ ADD HELPER TEXT */}
          {/* {jobs.some((job) => job.approvalStatus === "approved") && ( */}
          {jobs.some((job) => job.approvalStatus?.toLowerCase() === "approved") && ( 
            <div className="mt-4 text-sm text-gray-600">
              💡 Click on any{" "}
              <span className="font-semibold text-blue-600">approved</span> job
              to view applications and export data
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ManageJobs;
