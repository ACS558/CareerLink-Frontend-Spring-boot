import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import { formatDate } from "../../utils/helpers";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import toast from "react-hot-toast";

const PendingJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingJobs();
  }, []);

  const fetchPendingJobs = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPendingJobs();
      //setJobs(res.data.jobs);
      setJobs(res.data.data);
    } catch (error) {
      console.error("Fetch pending jobs error:", error);
    } finally {
      setLoading(false);
    }
  };

  const approveJob = async (id, title) => {
    setActionLoading(true);
    try {
      await adminAPI.verifyJob(id, {
        action: "approve",
        approvalNotes: "Approved by admin",
      });
      toast.success(`"${title}" has been approved!`);
       setJobs(jobs.filter((j) => j.id !== id)); // was j._id
    } catch (error) {
      console.error("Approve error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const rejectJob = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }
    setActionLoading(true);
    try {
       await adminAPI.verifyJob(selectedJob.id, { action: "reject", rejectionReason }); // was selectedJob._id
      toast.success(`"${selectedJob.title}" has been rejected.`);
     setJobs(jobs.filter((j) => j.id !== selectedJob.id)); // was j._id / selectedJob._id
      setShowRejectModal(false);
      setRejectionReason("");
      setSelectedJob(null);
    } catch (error) {
      console.error("Reject error:", error);
    } finally {
      setActionLoading(false);
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
            <h1 className="text-2xl font-bold text-gray-900">
              Pending Job Approvals 💼
            </h1>
            <p className="text-gray-600">
              Review and approve/reject job postings
            </p>
          </div>

          {/* Count Badge */}
          <div className="mb-4">
            <span className="inline-block bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1 rounded-full">
              {jobs.length} Pending Approval
            </span>
          </div>

          {jobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <span className="text-5xl">✅</span>
              <p className="text-gray-500 mt-3 text-lg">
                No pending job approvals
              </p>
              <p className="text-gray-400 text-sm">
                All job postings have been processed
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-lg shadow-md p-6"> {/* was job._id */}
                  <div className="flex items-start justify-between">
                    {/* Job Info */}
                    <div className="flex-1">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl font-bold text-green-600">
                            {job.companyName?.[0] || "C"} {/* was recruiterId?.companyInfo?.companyName?.[0] */}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {job.title}
                          </h3>
                          <p className="text-gray-600 font-medium mb-2">{job.companyName}</p> {/* was recruiterId?.companyInfo?.companyName */}
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                            <span>📍 {job.location}</span>
                            <span>💼 {job.jobType}</span>
                            <span>🏢 {job.workMode}</span>
                            {job.salaryMin && ( // was job.salaryRange?.min
                               <span>💰 {job.salaryMin}-{job.salaryMax} {job.salaryType}</span> // was salaryRange.min/.max
                            )}
                            <span>📅 {job.numberOfOpenings} opening(s)</span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {job.description}
                        </p>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-xs text-gray-400">Company Email</p>
                          <p className="text-sm font-medium text-gray-700">{job.recruiterEmail}</p> {/* was recruiterId?.userId?.email */}
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Posted Date</p>
                          <p className="text-sm font-medium text-gray-700">
                            {formatDate(job.createdAt)}
                          </p>
                        </div>
                        {job.applicationDeadline && (
                          <div>
                            <p className="text-xs text-gray-400">Deadline</p>
                            <p className="text-sm font-medium text-gray-700">
                              {formatDate(job.applicationDeadline)}
                            </p>
                          </div>
                        )}
                       {job.minCgpa && ( // was eligibilityCriteria?.minCGPA
                          <div>
                            <p className="text-xs text-gray-400">Min CGPA</p>
                            <p className="text-sm font-medium text-gray-700">
                              {/* {job.eligibilityCriteria.minCGPA} */}
                              {job.minCgpa}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Eligibility Criteria */}
                     {(job.eligibleBranches?.length > 0 || job.skillsRequired?.length > 0) && ( // was eligibilityCriteria?.branches
                        <div className="mt-4 pt-4 border-t">
                         {job.eligibleBranches?.length > 0 && ( // was eligibilityCriteria?.branches
                            <div className="mb-2">
                              <p className="text-xs text-gray-400 mb-1">
                                Eligible Branches
                              </p>
                              <div className="flex flex-wrap gap-2">
                               {job.eligibleBranches.map((branch, i) => ( // was eligibilityCriteria.branches
                                    <span
                                      key={i}
                                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                                    >
                                      {branch}
                                    </span>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                          {job.skillsRequired?.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-400 mb-1">
                                Required Skills
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {job.skillsRequired.map((skill, i) => (
                                  <span
                                    key={i}
                                    className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2 ml-6">
                      <button
                        onClick={() => approveJob(job.id, job.title)} 
                        disabled={actionLoading}
                        className="btn-success px-6 py-2 text-sm whitespace-nowrap"
                      >  {/* was job._id */}
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setShowRejectModal(true);
                        }}
                        disabled={actionLoading}
                        className="btn-danger px-6 py-2 text-sm whitespace-nowrap"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reject Modal */}
          {showRejectModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  Reject Job Posting
                </h4>
                <p className="text-sm text-gray-500 mb-4">
                  Rejecting:{" "}
                  <span className="font-semibold text-gray-700">
                    "{selectedJob?.title}"
                  </span>
                </p>
                <div>
                  <label className="label">Reason for Rejection *</label>
                  <textarea
                    className="input-field"
                    rows="4"
                    placeholder="Enter reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-5">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectionReason("");
                      setSelectedJob(null);
                    }}
                    className="btn-secondary px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={rejectJob}
                    disabled={actionLoading}
                    className="btn-danger px-6 py-2"
                  >
                    {actionLoading ? "Rejecting..." : "Reject Job"}
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

export default PendingJobs;
