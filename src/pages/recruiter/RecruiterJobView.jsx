import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { jobAPI } from "../../services/api";
import { getStatusBadgeColor, formatDate } from "../../utils/helpers";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";

const RecruiterJobView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const res = await jobAPI.getJobById(id);
      setJob(res.data.data);
      //setJob(res.data.job);
    } catch (error) {
      console.error("Fetch job error:", error);
    } finally {
      setLoading(false);
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
          <button
            onClick={() => navigate("/recruiter/jobs")}
            className="mt-4 btn-primary px-6 py-2"
          >
            Back to My Jobs
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
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate("/recruiter/jobs")}
              className="text-primary-600 hover:text-primary-700 mb-4 flex items-center"
            >
              ← Back to My Jobs
            </button>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {job.title}
                  </h1>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeColor(job.approvalStatus)}`}
                  >
                    {/* {job.approvalStatus.charAt(0).toUpperCase() +
                      job.approvalStatus.slice(1)} */}
                      {job.approvalStatus.charAt(0).toUpperCase() + job.approvalStatus.slice(1).toLowerCase()}
                  
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>📍 {job.location}</span>
                  <span>💼 {job.jobType}</span>
                  <span>🏢 {job.workMode}</span>
                  {/* {job.salaryRange?.min && (
                    <span>
                      💰 {job.salaryRange.min}-{job.salaryRange.max}{" "}
                      {job.salaryType}
                    </span>
                  )} */}
                  {job.salaryMin && (
                    <span>💰 {job.salaryMin}-{job.salaryMax} {job.salaryType}</span>
                  )}
                </div>
              </div>
              {/* {job.approvalStatus === "approved" && (
                <Link
                  to={`/recruiter/jobs/${job._id}/applications`}
                  className="btn-success px-6 py-3"
                >
                  View Applications
                </Link>
              )} */}
              {job.approvalStatus?.toLowerCase() === "approved" && (
                <Link to={`/recruiter/jobs/${job.id}/applications`} className="btn-success px-6 py-3">
                  View Applications
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Description */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Job Description
                </h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {job.description}
                </p>
              </div>

              {/* Skills Required */}
              {job.skillsRequired?.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Required Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skillsRequired.map((skill, i) => (
                      <span
                        key={i}
                        className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Messages */}
              {/* {job.approvalStatus === "pending" && ( */}
              {job.approvalStatus?.toLowerCase() === "pending" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 font-semibold">
                    ⏳ Awaiting Admin Approval
                  </p>
                  <p className="text-yellow-700 text-sm mt-1">
                    Your job posting is under review by the placement cell.
                  </p>
                </div>
              )}

              {/* {job.approvalStatus === "rejected" && job.rejectionReason && ( */}
              {job.approvalStatus?.toLowerCase() === "rejected" && job.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-semibold">
                    ❌ Job Posting Rejected
                  </p>
                  <p className="text-red-700 text-sm mt-1">
                    <strong>Reason:</strong> {job.rejectionReason}
                  </p>
                </div>
              )}

              {job.approvalNotes && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-semibold">
                    ✅ Approval Notes
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    {job.approvalNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Job Details
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Posted Date</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(job.createdAt)}
                    </p>
                  </div>
                  {job.approvedAt && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Approved Date
                      </p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(job.approvedAt)}
                      </p>
                    </div>
                  )}
                  {job.applicationDeadline && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Application Deadline
                      </p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(job.applicationDeadline)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Number of Openings
                    </p>
                    <p className="font-semibold text-gray-900">
                      {job.numberOfOpenings || 1}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Job Type</p>
                    <p className="font-semibold text-gray-900">{job.jobType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Work Mode</p>
                    <p className="font-semibold text-gray-900">
                      {job.workMode}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <p className="font-semibold text-gray-900">
                      {job.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Eligibility Criteria */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Eligibility Criteria
                </h2>
                <div className="space-y-3">
                  {/* {job.eligibilityCriteria?.minCGPA && ( */}
                  {job.minCgpa && (
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">📊</span>
                      <div>
                        <p className="text-xs text-gray-500">Minimum CGPA</p>
                        <p className="font-semibold text-gray-900">
                          {/* {job.eligibilityCriteria.minCGPA} */}
                          {job.minCgpa}
                        </p>
                      </div>
                    </div>
                  )}
                  {/* {job.eligibilityCriteria?.maxBacklogs !== undefined && ( */}
                  {job.maxBacklogs !== undefined && (
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">📚</span>
                      <div>
                        <p className="text-xs text-gray-500">
                          Maximum Backlogs
                        </p>
                        <p className="font-semibold text-gray-900">
                          {/* {job.eligibilityCriteria.maxBacklogs} */}
                          {job.maxBacklogs}
                        </p>
                      </div>
                    </div>
                  )}
                  {/* {job.eligibilityCriteria?.branches?.length > 0 && ( */}
                  {job.eligibleBranches?.length > 0 && (
                    <div className="flex items-start space-x-2">
                      <span className="text-2xl">🎓</span>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Eligible Branches
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {/* {job.eligibilityCriteria.branches.map((branch, i) => ( */}
                          {job.eligibleBranches.map((branch, i) => (
                            <span
                              key={i}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                            >
                              {branch}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* {job.eligibilityCriteria?.graduationYears?.length > 0 && ( */}
                  {job.graduationYears?.length > 0 && (
                    <div className="flex items-start space-x-2">
                      <span className="text-2xl">📅</span>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Graduation Years
                        </p>
                        <p className="font-semibold text-gray-900">
                          {/* {job.eligibilityCriteria.graduationYears.join(", ")} */}
                          {job.graduationYears.join(", ")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {/* {job.approvalStatus === "approved" && ( */}
             {job.approvalStatus?.toLowerCase() === "approved" && (
                <Link
                  to={`/recruiter/jobs/${job.id}/applications`}
                  className="block w-full btn-primary py-3 text-center text-lg"
                >
                  View Applications
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RecruiterJobView;
