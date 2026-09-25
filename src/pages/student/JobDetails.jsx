//below is the code used for the backend built on spring boot

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jobAPI, applicationAPI } from "../../services/api";
import { formatDate, formatEnum } from "../../utils/helpers";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import toast from "react-hot-toast";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  useEffect(() => {
    fetchJob();
    checkIfApplied();
  }, [id]);

  const fetchJob = async () => {
    try {
      const res = await jobAPI.getJobById(id);
      setJob(res.data.data);
    } catch (error) {
      console.error("Fetch job error:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfApplied = async () => {
    try {
      const res = await applicationAPI.getMyApplications();
      const applied = res.data.data.some((app) => String(app.jobId) === String(id));
      setHasApplied(applied);
    } catch (error) {
      console.error("Check applied error:", error);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await applicationAPI.applyForJob({ jobId: id, coverLetter });
      toast.success("Application submitted successfully!");
      setHasApplied(true);
      setShowApplyModal(false);
      setCoverLetter("");
    } catch (error) {
      console.error("Apply error:", error.response?.data?.message || error.message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl">😕</span>
          <p className="text-gray-500 mt-3">Job not found</p>
          <button onClick={() => navigate("/student/jobs")} className="mt-4 btn-primary px-6 py-2">
            Back to Jobs
          </button>
        </div>
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
            <button
              onClick={() => navigate("/student/jobs")}
              className="text-primary-600 hover:text-primary-700 mb-4 flex items-center"
            >
              ← Back to Jobs
            </button>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-green-100 rounded-xl flex items-center justify-center overflow-hidden">
                  {job.companyLogoUrl ? (
                    <img src={job.companyLogoUrl} alt="Company Logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <span className="text-3xl font-bold text-green-600">
                      {job.companyName?.[0] || "C"}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">{job.title}</h1>
                  <p className="text-xl text-gray-600 mb-2">{job.companyName}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    <span>📍 {job.location}</span>
                    <span>💼 {formatEnum(job.jobType)}</span>
                    <span>🏢 {formatEnum(job.workMode)}</span>
                    {job.salaryMin && (
                      <span>💰 {job.salaryMin}-{job.salaryMax} {job.salaryType}</span>
                    )}
                  </div>
                </div>
              </div>
              {hasApplied ? (
                <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-6 py-3 rounded-lg">
                  <span>✅</span>
                  <span className="font-semibold">Applied</span>
                </div>
              ) : (
                <button onClick={() => setShowApplyModal(true)} className="btn-primary px-8 py-3 text-lg">
                  Apply Now
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
              </div>

              {job.skillsRequired?.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skillsRequired.map((skill, i) => (
                      <span key={i} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About the Company</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Company Name</span>
                    <span className="font-semibold text-gray-900">{job.companyName}</span>
                  </div>
                  {job.industry && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Industry</span>
                      <span className="font-semibold text-gray-900">{job.industry}</span>
                    </div>
                  )}
                  {job.companySize && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Company Size</span>
                      <span className="font-semibold text-gray-900">{job.companySize}</span>
                    </div>
                  )}
                  {job.website && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Website</span>
                      <a href={job.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                        Visit Website →
                      </a>
                    </div>
                  )}
                  {job.companyDescription && (
                    <div className="pt-3 border-t">
                      <p className="text-gray-600">{job.companyDescription}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Job Overview</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Posted Date</p>
                    <p className="font-semibold text-gray-900">{formatDate(job.createdAt)}</p>
                  </div>
                  {job.applicationDeadline && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Application Deadline</p>
                      <p className="font-semibold text-gray-900">{formatDate(job.applicationDeadline)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Number of Openings</p>
                    <p className="font-semibold text-gray-900">{job.numberOfOpenings || 1}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Job Type</p>
                    <p className="font-semibold text-gray-900">{formatEnum(job.jobType)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Work Mode</p>
                    <p className="font-semibold text-gray-900">{formatEnum(job.workMode)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Eligibility Criteria</h2>
                <div className="space-y-3">
                  {job.minCgpa && (
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">📊</span>
                      <div>
                        <p className="text-xs text-gray-500">Minimum CGPA</p>
                        <p className="font-semibold text-gray-900">{job.minCgpa}</p>
                      </div>
                    </div>
                  )}
                  {job.maxBacklogs !== undefined && (
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">📚</span>
                      <div>
                        <p className="text-xs text-gray-500">Maximum Backlogs</p>
                        <p className="font-semibold text-gray-900">{job.maxBacklogs}</p>
                      </div>
                    </div>
                  )}
                  {job.eligibleBranches?.length > 0 && (
                    <div className="flex items-start space-x-2">
                      <span className="text-2xl">🎓</span>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Eligible Branches</p>
                        <div className="flex flex-wrap gap-1">
                          {job.eligibleBranches.map((branch, i) => (
                            <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {branch}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {job.graduationYears?.length > 0 && (
                    <div className="flex items-start space-x-2">
                      <span className="text-2xl">📅</span>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Graduation Years</p>
                        <p className="font-semibold text-gray-900">{job.graduationYears.join(", ")}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {hasApplied ? (
                <button onClick={() => navigate("/student/applications")} className="w-full btn-secondary py-3 text-lg">
                  View My Applications
                </button>
              ) : (
                <button onClick={() => setShowApplyModal(true)} className="w-full btn-primary py-3 text-lg">
                  Apply for this Job
                </button>
              )}
            </div>
          </div>

          {showApplyModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
                <h4 className="text-xl font-bold text-gray-900 mb-2">Apply for {job.title}</h4>
                <p className="text-sm text-gray-500 mb-4">at {job.companyName}</p>
                <div className="mb-4">
                  <label className="label">Cover Letter (Optional)</label>
                  <textarea
                    className="input-field"
                    rows="6"
                    placeholder="Tell the recruiter why you're a great fit for this role..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button onClick={() => setShowApplyModal(false)} className="btn-secondary px-6 py-2">
                    Cancel
                  </button>
                  <button onClick={handleApply} disabled={applying} className="btn-primary px-8 py-2">
                    {applying ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default JobDetails;



//Below code is commented beacause it was used for the backend built on node.js and express.js

// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { jobAPI, applicationAPI } from "../../services/api";
// import { formatDate } from "../../utils/helpers";
// import Navbar from "../../components/common/Navbar";
// import Sidebar from "../../components/common/Sidebar";
// import toast from "react-hot-toast";

// const JobDetails = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [job, setJob] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [applying, setApplying] = useState(false);
//   const [hasApplied, setHasApplied] = useState(false);
//   const [showApplyModal, setShowApplyModal] = useState(false);
//   const [coverLetter, setCoverLetter] = useState("");

//   useEffect(() => {
//     fetchJob();
//     checkIfApplied();
//   }, [id]);

//   const fetchJob = async () => {
//     try {
//       const res = await jobAPI.getJobById(id);
//       setJob(res.data.job);
//     } catch (error) {
//       console.error("Fetch job error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const checkIfApplied = async () => {
//     try {
//       const res = await applicationAPI.getMyApplications();
//       const applied = res.data.applications.some((app) => app.jobId._id === id);
//       setHasApplied(applied);
//     } catch (error) {
//       console.error("Check applied error:", error);
//     }
//   };

//   const handleApply = async () => {
//     setApplying(true);
//     try {
//       await applicationAPI.applyForJob({ jobId: id, coverLetter });
//       toast.success("Application submitted successfully!");
//       setHasApplied(true);
//       setShowApplyModal(false);
//       setCoverLetter("");
//     } catch (error) {
//       console.error(
//         "Apply error:",
//         error.response?.data?.message || error.message,
//       );
//     } finally {
//       setApplying(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//       </div>
//     );
//   }

//   if (!job) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <span className="text-5xl">😕</span>
//           <p className="text-gray-500 mt-3">Job not found</p>
//           <button
//             onClick={() => navigate("/student/jobs")}
//             className="mt-4 btn-primary px-6 py-2"
//           >
//             Back to Jobs
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <Navbar />
//       <div className="flex">
//         <Sidebar />
//         <main className="flex-1 p-8">
//           {/* Header */}
//           <div className="mb-6">
//             <button
//               onClick={() => navigate("/student/jobs")}
//               className="text-primary-600 hover:text-primary-700 mb-4 flex items-center"
//             >
//               ← Back to Jobs
//             </button>
//             <div className="flex items-start justify-between">
//               <div className="flex items-start space-x-4">
//                 <div className="w-20 h-20 bg-green-100 rounded-xl flex items-center justify-center overflow-hidden">
//                   {job.recruiterId?.companyInfo?.companyLogo?.url ? (
//                     <img
//                       src={job.recruiterId.companyInfo.companyLogo.url}
//                       alt="Company Logo"
//                       className="w-full h-full object-contain p-2"
//                     />
//                   ) : (
//                     <span className="text-3xl font-bold text-green-600">
//                       {job.recruiterId?.companyInfo?.companyName?.[0] || "C"}
//                     </span>
//                   )}
//                 </div>
//                 <div>
//                   <h1 className="text-3xl font-bold text-gray-900 mb-1">
//                     {job.title}
//                   </h1>
//                   <p className="text-xl text-gray-600 mb-2">
//                     {job.recruiterId?.companyInfo?.companyName}
//                   </p>
//                   <div className="flex flex-wrap gap-3 text-sm text-gray-600">
//                     <span>📍 {job.location}</span>
//                     <span>💼 {job.jobType}</span>
//                     <span>🏢 {job.workMode}</span>
//                     {job.salaryRange?.min && (
//                       <span>
//                         💰 {job.salaryRange.min}-{job.salaryRange.max}{" "}
//                         {job.salaryType}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//               {hasApplied ? (
//                 <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-6 py-3 rounded-lg">
//                   <span>✅</span>
//                   <span className="font-semibold">Applied</span>
//                 </div>
//               ) : (
//                 <button
//                   onClick={() => setShowApplyModal(true)}
//                   className="btn-primary px-8 py-3 text-lg"
//                 >
//                   Apply Now
//                 </button>
//               )}
//             </div>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* Main Content */}
//             <div className="lg:col-span-2 space-y-6">
//               {/* Job Description */}
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h2 className="text-xl font-bold text-gray-900 mb-4">
//                   Job Description
//                 </h2>
//                 <p className="text-gray-700 whitespace-pre-line">
//                   {job.description}
//                 </p>
//               </div>

//               {/* Skills Required */}
//               {job.skillsRequired?.length > 0 && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h2 className="text-xl font-bold text-gray-900 mb-4">
//                     Required Skills
//                   </h2>
//                   <div className="flex flex-wrap gap-2">
//                     {job.skillsRequired.map((skill, i) => (
//                       <span
//                         key={i}
//                         className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium"
//                       >
//                         {skill}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Company Info */}
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h2 className="text-xl font-bold text-gray-900 mb-4">
//                   About the Company
//                 </h2>
//                 <div className="space-y-3">
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">Company Name</span>
//                     <span className="font-semibold text-gray-900">
//                       {job.recruiterId?.companyInfo?.companyName}
//                     </span>
//                   </div>
//                   {job.recruiterId?.companyInfo?.industry && (
//                     <div className="flex justify-between">
//                       <span className="text-gray-500">Industry</span>
//                       <span className="font-semibold text-gray-900">
//                         {job.recruiterId.companyInfo.industry}
//                       </span>
//                     </div>
//                   )}
//                   {job.recruiterId?.companyInfo?.companySize && (
//                     <div className="flex justify-between">
//                       <span className="text-gray-500">Company Size</span>
//                       <span className="font-semibold text-gray-900">
//                         {job.recruiterId.companyInfo.companySize}
//                       </span>
//                     </div>
//                   )}
//                   {job.recruiterId?.companyInfo?.website && (
//                     <div className="flex justify-between">
//                       <span className="text-gray-500">Website</span>
//                       <a
//                         href={job.recruiterId.companyInfo.website}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-primary-600 hover:underline"
//                       >
//                         Visit Website →
//                       </a>
//                     </div>
//                   )}
//                   {job.recruiterId?.companyInfo?.description && (
//                     <div className="pt-3 border-t">
//                       <p className="text-gray-600">
//                         {job.recruiterId.companyInfo.description}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Sidebar */}
//             <div className="space-y-6">
//               {/* Quick Info */}
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h2 className="text-lg font-bold text-gray-900 mb-4">
//                   Job Overview
//                 </h2>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-xs text-gray-500 mb-1">Posted Date</p>
//                     <p className="font-semibold text-gray-900">
//                       {formatDate(job.createdAt)}
//                     </p>
//                   </div>
//                   {job.applicationDeadline && (
//                     <div>
//                       <p className="text-xs text-gray-500 mb-1">
//                         Application Deadline
//                       </p>
//                       <p className="font-semibold text-gray-900">
//                         {formatDate(job.applicationDeadline)}
//                       </p>
//                     </div>
//                   )}
//                   <div>
//                     <p className="text-xs text-gray-500 mb-1">
//                       Number of Openings
//                     </p>
//                     <p className="font-semibold text-gray-900">
//                       {job.numberOfOpenings || 1}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500 mb-1">Job Type</p>
//                     <p className="font-semibold text-gray-900">{job.jobType}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500 mb-1">Work Mode</p>
//                     <p className="font-semibold text-gray-900">
//                       {job.workMode}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Eligibility Criteria */}
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h2 className="text-lg font-bold text-gray-900 mb-4">
//                   Eligibility Criteria
//                 </h2>
//                 <div className="space-y-3">
//                   {job.eligibilityCriteria?.minCGPA && (
//                     <div className="flex items-center space-x-2">
//                       <span className="text-2xl">📊</span>
//                       <div>
//                         <p className="text-xs text-gray-500">Minimum CGPA</p>
//                         <p className="font-semibold text-gray-900">
//                           {job.eligibilityCriteria.minCGPA}
//                         </p>
//                       </div>
//                     </div>
//                   )}
//                   {job.eligibilityCriteria?.maxBacklogs !== undefined && (
//                     <div className="flex items-center space-x-2">
//                       <span className="text-2xl">📚</span>
//                       <div>
//                         <p className="text-xs text-gray-500">
//                           Maximum Backlogs
//                         </p>
//                         <p className="font-semibold text-gray-900">
//                           {job.eligibilityCriteria.maxBacklogs}
//                         </p>
//                       </div>
//                     </div>
//                   )}
//                   {job.eligibilityCriteria?.branches?.length > 0 && (
//                     <div className="flex items-start space-x-2">
//                       <span className="text-2xl">🎓</span>
//                       <div>
//                         <p className="text-xs text-gray-500 mb-1">
//                           Eligible Branches
//                         </p>
//                         <div className="flex flex-wrap gap-1">
//                           {job.eligibilityCriteria.branches.map((branch, i) => (
//                             <span
//                               key={i}
//                               className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
//                             >
//                               {branch}
//                             </span>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                   {job.eligibilityCriteria?.graduationYears?.length > 0 && (
//                     <div className="flex items-start space-x-2">
//                       <span className="text-2xl">📅</span>
//                       <div>
//                         <p className="text-xs text-gray-500 mb-1">
//                           Graduation Years
//                         </p>
//                         <p className="font-semibold text-gray-900">
//                           {job.eligibilityCriteria.graduationYears.join(", ")}
//                         </p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Apply Button */}
//               {hasApplied ? (
//                 <button
//                   onClick={() => navigate("/student/applications")}
//                   className="w-full btn-secondary py-3 text-lg"
//                 >
//                   View My Applications
//                 </button>
//               ) : (
//                 <button
//                   onClick={() => setShowApplyModal(true)}
//                   className="w-full btn-primary py-3 text-lg"
//                 >
//                   Apply for this Job
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Apply Modal */}
//           {showApplyModal && (
//             <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//               <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
//                 <h4 className="text-xl font-bold text-gray-900 mb-2">
//                   Apply for {job.title}
//                 </h4>
//                 <p className="text-sm text-gray-500 mb-4">
//                   at {job.recruiterId?.companyInfo?.companyName}
//                 </p>
//                 <div className="mb-4">
//                   <label className="label">Cover Letter (Optional)</label>
//                   <textarea
//                     className="input-field"
//                     rows="6"
//                     placeholder="Tell the recruiter why you're a great fit for this role..."
//                     value={coverLetter}
//                     onChange={(e) => setCoverLetter(e.target.value)}
//                   />
//                 </div>
//                 <div className="flex justify-end space-x-3">
//                   <button
//                     onClick={() => setShowApplyModal(false)}
//                     className="btn-secondary px-6 py-2"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={handleApply}
//                     disabled={applying}
//                     className="btn-primary px-8 py-2"
//                   >
//                     {applying ? "Submitting..." : "Submit Application"}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default JobDetails;
