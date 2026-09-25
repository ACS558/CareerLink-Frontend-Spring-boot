//Below is the code used for the backend built on Spring boot.

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { applicationAPI } from "../../services/api";
import {
  getApplicationStatusColor,
  getApplicationStatusLabel,
  formatDate,
  formatEnum,
  canWithdrawApplication,
} from "../../utils/helpers";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import toast from "react-hot-toast";

const MyApplications = () => {
  const [allApplications, setAllApplications] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    if (!filterStatus) {
      setApplications(allApplications);
    } else {
      setApplications(
        allApplications.filter((a) => a.status?.toLowerCase() === filterStatus)
      );
    }
  }, [filterStatus, allApplications]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      // Backend doesn't support server-side status filtering here;
      // filtering is done client-side below.
      const res = await applicationAPI.getMyApplications();
      setAllApplications(res.data.data);
    } catch (error) {
      console.error("Fetch applications error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (id, jobTitle) => {
    if (!window.confirm(`Withdraw your application for "${jobTitle}"?`)) return;
    try {
      await applicationAPI.withdrawApplication(id);
      toast.success("Application withdrawn successfully");
      fetchApplications();
    } catch (error) {
      console.error("Withdraw error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Applications 📝</h1>
            <p className="text-gray-600">Track all your job applications</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field w-48"
              >
                <option value="">All Applications</option>
                <option value="applied">Applied</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
                <option value="selected">Selected</option>
                <option value="pending">On Hold</option>
              </select>
              <span className="text-sm text-gray-500">{applications.length} application(s)</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <span className="text-5xl">📭</span>
              <p className="text-gray-500 mt-3 text-lg">No applications yet</p>
              <Link to="/student/jobs" className="mt-4 inline-block btn-primary px-6 py-2">
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{app.jobTitle}</h3>
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${getApplicationStatusColor(app.status)}`}
                        >
                          {getApplicationStatusLabel(app.status)}
                        </span>
                      </div>
                      <p className="text-gray-600 font-medium mb-3">{app.companyName}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                        <span>📍 {app.location}</span>
                        <span>💼 {formatEnum(app.jobType)}</span>
                        <span>🏢 {formatEnum(app.workMode)}</span>
                        {app.salaryMin && (
                          <span>💰 {app.salaryMin}-{app.salaryMax} {app.salaryType}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>Applied: {formatDate(app.appliedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>Applied: {formatDate(app.appliedAt)}</span>
                        {app.shortlistedAt && <span>Shortlisted: {formatDate(app.shortlistedAt)}</span>}
                        {app.selectedAt && <span>Selected: {formatDate(app.selectedAt)}</span>}
                      </div>
                      {app.status === "REJECTED" && app.rejectionReason && (
                        <p className="mt-2 text-sm text-red-600">
                          <span className="font-semibold">Reason:</span> {app.rejectionReason}
                        </p>
                      )}

                      {app.atsScore?.score != null && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">🎯</span>
                              <span className="font-semibold text-gray-900">ATS Match Score</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-16 h-16 rounded-full flex items-center justify-center"
                                style={{ background: `conic-gradient(#3b82f6 ${app.atsScore.score * 3.6}deg, #e5e7eb 0deg)` }}
                              >
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                  <span className="text-lg font-bold text-primary-600">{app.atsScore.score}%</span>
                                </div>
                              </div>
                              <span
                                className={`text-sm font-semibold px-3 py-1 rounded-full ${
                                  app.atsScore.recommendation === "Highly recommended"
                                    ? "bg-green-100 text-green-800"
                                    : app.atsScore.recommendation === "Recommended"
                                      ? "bg-blue-100 text-blue-800"
                                      : app.atsScore.recommendation === "Maybe"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                }`}
                              >
                                {app.atsScore.recommendation}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {app.atsScore.strengths?.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-green-700 mb-1">✓ Strengths</p>
                                <ul className="text-xs text-gray-700 space-y-0.5">
                                  {app.atsScore.strengths.slice(0, 3).map((s, i) => (
                                    <li key={i}>• {s}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {app.atsScore.weaknesses?.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-orange-700 mb-1">⚠ Areas to Improve</p>
                                <ul className="text-xs text-gray-700 space-y-0.5">
                                  {app.atsScore.weaknesses.slice(0, 3).map((w, i) => (
                                    <li key={i}>• {w}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <Link to={`/student/jobs/${app.jobId}`} className="btn-primary px-4 py-1 text-sm text-center whitespace-nowrap">
                        View Job
                      </Link>
                      {canWithdrawApplication(app.status) && (
                        <button
                          onClick={() => handleWithdraw(app.id, app.jobTitle)}
                          className="btn-danger px-4 py-1 text-sm whitespace-nowrap"
                        >
                          Withdraw
                        </button>
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

export default MyApplications;

//Below code is commented because it was used for the backend built on node.js and express.js

// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { applicationAPI } from "../../services/api";
// import {
//   getApplicationStatusColor,
//   getApplicationStatusLabel,
//   formatDate,
//   canWithdrawApplication,
// } from "../../utils/helpers";
// import Navbar from "../../components/common/Navbar";
// import Sidebar from "../../components/common/Sidebar";
// import toast from "react-hot-toast";

// const MyApplications = () => {
//   const [applications, setApplications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filterStatus, setFilterStatus] = useState("");

//   useEffect(() => {
//     fetchApplications();
//   }, [filterStatus]);

//   const fetchApplications = async () => {
//     setLoading(true);
//     try {
//       const params = {};
//       if (filterStatus) params.status = filterStatus;
//       const res = await applicationAPI.getMyApplications(params);
//       setApplications(res.data.applications);
//     } catch (error) {
//       console.error("Fetch applications error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleWithdraw = async (id, jobTitle) => {
//     if (!window.confirm(`Withdraw your application for "${jobTitle}"?`)) return;
//     try {
//       await applicationAPI.withdrawApplication(id);
//       toast.success("Application withdrawn successfully");
//       fetchApplications();
//     } catch (error) {
//       console.error("Withdraw error:", error);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <Navbar />
//       <div className="flex">
//         <Sidebar />
//         <main className="flex-1 p-8">
//           <div className="mb-6">
//             <h1 className="text-2xl font-bold text-gray-900">
//               My Applications 📝
//             </h1>
//             <p className="text-gray-600">Track all your job applications</p>
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
//                 <option value="">All Applications</option>
//                 <option value="applied">Applied</option>
//                 <option value="shortlisted">Shortlisted</option>
//                 <option value="rejected">Rejected</option>
//                 <option value="selected">Selected</option>
//                 <option value="on-hold">On Hold</option>
//               </select>
//               <span className="text-sm text-gray-500">
//                 {applications.length} application(s)
//               </span>
//             </div>
//           </div>

//           {/* Applications List */}
//           {loading ? (
//             <div className="flex justify-center py-12">
//               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
//             </div>
//           ) : applications.length === 0 ? (
//             <div className="bg-white rounded-lg shadow-md p-12 text-center">
//               <span className="text-5xl">📭</span>
//               <p className="text-gray-500 mt-3 text-lg">No applications yet</p>
//               <Link
//                 to="/student/jobs"
//                 className="mt-4 inline-block btn-primary px-6 py-2"
//               >
//                 Browse Jobs
//               </Link>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {applications.map((app) => (
//                 <div
//                   key={app._id}
//                   className="bg-white rounded-lg shadow-md p-6"
//                 >
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1">
//                       <div className="flex items-center space-x-3 mb-2">
//                         <h3 className="text-xl font-bold text-gray-900">
//                           {app.jobId?.title}
//                         </h3>
//                         <span
//                           className={`text-xs font-semibold px-3 py-1 rounded-full ${getApplicationStatusColor(app.status)}`}
//                         >
//                           {getApplicationStatusLabel(app.status)}
//                         </span>
//                       </div>
//                       <p className="text-gray-600 font-medium mb-3">
//                         {app.jobId?.recruiterId?.companyInfo?.companyName}
//                       </p>
//                       <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
//                         <span>📍 {app.jobId?.location}</span>
//                         <span>💼 {app.jobId?.jobType}</span>
//                         <span>🏢 {app.jobId?.workMode}</span>
//                         {app.jobId?.salaryRange?.min && (
//                           <span>
//                             💰 {app.jobId.salaryRange.min}-
//                             {app.jobId.salaryRange.max} {app.jobId.salaryType}
//                           </span>
//                         )}
//                       </div>
//                       <div className="flex items-center space-x-4 text-xs text-gray-400">
//                         <span>Applied: {formatDate(app.appliedAt)}</span>
//                         {app.shortlistedAt && (
//                           <span>
//                             Shortlisted: {formatDate(app.shortlistedAt)}
//                           </span>
//                         )}
//                         {app.selectedAt && (
//                           <span>Selected: {formatDate(app.selectedAt)}</span>
//                         )}
//                       </div>
//                       {/* ATS Score */}
//                       {app.atsScore?.score && (
//                         <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
//                           <div className="flex items-center justify-between mb-3">
//                             <div className="flex items-center space-x-2">
//                               <span className="text-2xl">🎯</span>
//                               <span className="font-semibold text-gray-900">
//                                 ATS Match Score
//                               </span>
//                             </div>
//                             <div className="flex items-center space-x-2">
//                               <div
//                                 className="w-16 h-16 rounded-full flex items-center justify-center"
//                                 style={{
//                                   background: `conic-gradient(#3b82f6 ${app.atsScore.score * 3.6}deg, #e5e7eb 0deg)`,
//                                 }}
//                               >
//                                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
//                                   <span className="text-lg font-bold text-primary-600">
//                                     {app.atsScore.score}%
//                                   </span>
//                                 </div>
//                               </div>
//                               <span
//                                 className={`text-sm font-semibold px-3 py-1 rounded-full ${
//                                   app.atsScore.recommendation ===
//                                   "Highly recommended"
//                                     ? "bg-green-100 text-green-800"
//                                     : app.atsScore.recommendation ===
//                                         "Recommended"
//                                       ? "bg-blue-100 text-blue-800"
//                                       : app.atsScore.recommendation === "Maybe"
//                                         ? "bg-yellow-100 text-yellow-800"
//                                         : "bg-red-100 text-red-800"
//                                 }`}
//                               >
//                                 {app.atsScore.recommendation}
//                               </span>
//                             </div>
//                           </div>

//                           <div className="grid grid-cols-2 gap-3">
//                             {app.atsScore.strengths?.length > 0 && (
//                               <div>
//                                 <p className="text-xs font-semibold text-green-700 mb-1">
//                                   ✓ Strengths
//                                 </p>
//                                 <ul className="text-xs text-gray-700 space-y-0.5">
//                                   {app.atsScore.strengths
//                                     .slice(0, 3)
//                                     .map((strength, i) => (
//                                       <li key={i}>• {strength}</li>
//                                     ))}
//                                 </ul>
//                               </div>
//                             )}
//                             {app.atsScore.weaknesses?.length > 0 && (
//                               <div>
//                                 <p className="text-xs font-semibold text-orange-700 mb-1">
//                                   ⚠ Areas to Improve
//                                 </p>
//                                 <ul className="text-xs text-gray-700 space-y-0.5">
//                                   {app.atsScore.weaknesses
//                                     .slice(0, 3)
//                                     .map((weakness, i) => (
//                                       <li key={i}>• {weakness}</li>
//                                     ))}
//                                 </ul>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       )}
//                       {app.rejectionReason && (
//                         <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
//                           <p className="text-sm text-red-800">
//                             <strong>Rejection Reason:</strong>{" "}
//                             {app.rejectionReason}
//                           </p>
//                         </div>
//                       )}
//                       {app.recruiterNotes && (
//                         <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                           <p className="text-sm text-blue-800">
//                             <strong>Recruiter Notes:</strong>{" "}
//                             {app.recruiterNotes}
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                     <div className="flex flex-col space-y-2 ml-4">
//                       <Link
//                         to={`/student/jobs/${app.jobId?._id}`}
//                         className="btn-primary px-4 py-1 text-sm text-center whitespace-nowrap"
//                       >
//                         View Job
//                       </Link>
//                       {canWithdrawApplication(app.status) && (
//                         <button
//                           onClick={() =>
//                             handleWithdraw(app._id, app.jobId?.title)
//                           }
//                           className="btn-danger px-4 py-1 text-sm whitespace-nowrap"
//                         >
//                           Withdraw
//                         </button>
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

// export default MyApplications;