//Below is the code for the backend built on spring boot

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { jobAPI } from "../../services/api";
import { getStatusBadgeColor, formatDate } from "../../utils/helpers";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import toast from "react-hot-toast";

const RecruiterJobs = () => {
  const [allJobs, setAllJobs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (!filterStatus) {
      setJobs(allJobs);
    } else {
      setJobs(allJobs.filter((j) => j.approvalStatus?.toLowerCase() === filterStatus));
    }
  }, [filterStatus, allJobs]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // Backend doesn't filter by approvalStatus server-side; filtered client-side above.
      const res = await jobAPI.getMyJobs();
      setAllJobs(res.data.data);
    } catch (error) {
      console.error("Fetch jobs error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await jobAPI.deleteJob(id);
      toast.success("Job deleted successfully");
      fetchJobs();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Job Postings 💼</h1>
              <p className="text-gray-600">Manage your job listings</p>
            </div>
            <Link to="/recruiter/post-job" className="btn-primary px-6 py-2">
              + Post New Job
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-48">
                <option value="">All Jobs</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <span className="text-sm text-gray-500">{jobs.length} job(s)</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <span className="text-5xl">📭</span>
              <p className="text-gray-500 mt-3">No jobs posted yet</p>
              <Link to="/recruiter/post-job" className="mt-4 inline-block btn-primary px-6 py-2">
                Post Your First Job
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadgeColor(job.approvalStatus)}`}>
                          {job.approvalStatus.charAt(0).toUpperCase() + job.approvalStatus.slice(1).toLowerCase()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                        <span>📍 {job.location}</span>
                        <span>💼 {job.jobType}</span>
                        <span>🏢 {job.workMode}</span>
                        {job.salaryMin && (
                          <span>💰 {job.salaryMin}-{job.salaryMax} {job.salaryType}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{job.description.substring(0, 150)}...</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>Posted: {formatDate(job.createdAt)}</span>
                        {job.approvedAt && <span>Approved: {formatDate(job.approvedAt)}</span>}
                        {job.numberOfOpenings && <span>Openings: {job.numberOfOpenings}</span>}
                      </div>
                      {job.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">
                            <strong>Rejection Reason:</strong> {job.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <Link to={`/recruiter/jobs/${job.id}`} className="btn-primary px-4 py-1 text-sm text-center">
                        View
                      </Link>
                      {job.approvalStatus?.toLowerCase() === "approved" && (
                        <Link to={`/recruiter/jobs/${job.id}/applications`} className="btn-success px-4 py-1 text-sm text-center">
                          Applications
                        </Link>
                      )}
                      {job.approvalStatus?.toLowerCase() === "pending" && (
                        <>
                          <Link to={`/recruiter/jobs/${job.id}/edit`} className="btn-secondary px-4 py-1 text-sm text-center">
                            Edit
                          </Link>
                          <button onClick={() => handleDelete(job.id, job.title)} className="btn-danger px-4 py-1 text-sm">
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RecruiterJobs;


//Below code is commented out because it was used for the backend built on node.js and express.js.

// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { jobAPI } from "../../services/api";
// import { getStatusBadgeColor, formatDate } from "../../utils/helpers";
// import Navbar from "../../components/common/Navbar";
// import Sidebar from "../../components/common/Sidebar";
// import toast from "react-hot-toast";

// const RecruiterJobs = () => {
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filterStatus, setFilterStatus] = useState("");

//   useEffect(() => {
//     fetchJobs();
//   }, [filterStatus]);

//   const fetchJobs = async () => {
//     setLoading(true);
//     try {
//       const params = {};
//       if (filterStatus) params.approvalStatus = filterStatus;
//       const res = await jobAPI.getMyJobs(params);
//       setJobs(res.data.jobs);
//     } catch (error) {
//       console.error("Fetch jobs error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id, title) => {
//     if (!window.confirm(`Delete "${title}"?`)) return;
//     try {
//       await jobAPI.deleteJob(id);
//       toast.success("Job deleted successfully");
//       fetchJobs();
//     } catch (error) {
//       console.error("Delete error:", error);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <Navbar />
//       <div className="flex">
//         <Sidebar />
//         <main className="flex-1 p-8">
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">
//                 My Job Postings 💼
//               </h1>
//               <p className="text-gray-600">Manage your job listings</p>
//             </div>
//             <Link to="/recruiter/post-job" className="btn-primary px-6 py-2">
//               + Post New Job
//             </Link>
//           </div>

//           {/* Filter */}
//           <div className="bg-white rounded-lg shadow-md p-4 mb-6">
//             <div className="flex items-center space-x-4">
//               <label className="text-sm font-medium text-gray-700">
//                 Filter by Status:
//               </label>
//               <select
//                 value={filterStatus}
//                 onChange={(e) => setFilterStatus(e.target.value)}
//                 className="input-field w-48"
//               >
//                 <option value="">All Jobs</option>
//                 <option value="pending">Pending</option>
//                 <option value="approved">Approved</option>
//                 <option value="rejected">Rejected</option>
//               </select>
//               <span className="text-sm text-gray-500">
//                 {jobs.length} job(s)
//               </span>
//             </div>
//           </div>

//           {/* Jobs List */}
//           {loading ? (
//             <div className="flex justify-center py-12">
//               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
//             </div>
//           ) : jobs.length === 0 ? (
//             <div className="bg-white rounded-lg shadow-md p-12 text-center">
//               <span className="text-5xl">📭</span>
//               <p className="text-gray-500 mt-3">No jobs posted yet</p>
//               <Link
//                 to="/recruiter/post-job"
//                 className="mt-4 inline-block btn-primary px-6 py-2"
//               >
//                 Post Your First Job
//               </Link>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {jobs.map((job) => (
//                 <div
//                   key={job._id}
//                   className="bg-white rounded-lg shadow-md p-6"
//                 >
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1">
//                       <div className="flex items-center space-x-3 mb-2">
//                         <h3 className="text-xl font-bold text-gray-900">
//                           {job.title}
//                         </h3>
//                         <span
//                           className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadgeColor(job.approvalStatus)}`}
//                         >
//                           {job.approvalStatus.charAt(0).toUpperCase() +
//                             job.approvalStatus.slice(1)}
//                         </span>
//                       </div>
//                       <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
//                         <span>📍 {job.location}</span>
//                         <span>💼 {job.jobType}</span>
//                         <span>🏢 {job.workMode}</span>
//                         {job.salaryRange?.min && (
//                           <span>
//                             💰 {job.salaryRange.min}-{job.salaryRange.max}{" "}
//                             {job.salaryType}
//                           </span>
//                         )}
//                       </div>
//                       <p className="text-sm text-gray-600 mb-3">
//                         {job.description.substring(0, 150)}...
//                       </p>
//                       <div className="flex items-center space-x-4 text-xs text-gray-400">
//                         <span>Posted: {formatDate(job.createdAt)}</span>
//                         {job.approvedAt && (
//                           <span>Approved: {formatDate(job.approvedAt)}</span>
//                         )}
//                         {job.numberOfOpenings && (
//                           <span>Openings: {job.numberOfOpenings}</span>
//                         )}
//                       </div>
//                       {job.rejectionReason && (
//                         <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
//                           <p className="text-sm text-red-800">
//                             <strong>Rejection Reason:</strong>{" "}
//                             {job.rejectionReason}
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                     {/* Action Buttons */}
//                     <div className="flex flex-col space-y-2 ml-4">
//                       <Link
//                         to={`/recruiter/jobs/${job._id}`}
//                         className="btn-primary px-4 py-1 text-sm text-center"
//                       >
//                         View
//                       </Link>
//                       {job.approvalStatus === "approved" && (
//                         <Link
//                           to={`/recruiter/jobs/${job._id}/applications`}
//                           className="btn-success px-4 py-1 text-sm text-center"
//                         >
//                           Applications
//                         </Link>
//                       )}
//                       {job.approvalStatus === "pending" && (
//                         <>
//                           <Link
//                             to={`/recruiter/jobs/${job._id}/edit`}
//                             className="btn-secondary px-4 py-1 text-sm text-center"
//                           >
//                             Edit
//                           </Link>
//                           <button
//                             onClick={() => handleDelete(job._id, job.title)}
//                             className="btn-danger px-4 py-1 text-sm"
//                           >
//                             Delete
//                           </button>
//                         </>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default RecruiterJobs;
