import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import toast from "react-hot-toast";

const PendingRecruiters = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingRecruiters();
  }, []);

  const fetchPendingRecruiters = async () => {
    try {
      const res = await adminAPI.getPendingRecruiters();
      //setRecruiters(res.data.recruiters);
      setRecruiters(res.data.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const approveRecruiter = async (id, companyName) => {
    setActionLoading(true);
    try {
      await adminAPI.verifyRecruiter(id, {
        action: "approve",
        verificationNotes: "Approved by admin",
      });
      toast.success(`${companyName} has been approved!`);
      setRecruiters(recruiters.filter((r) => r.id !== id)); // was r._id
    } catch (error) {
      console.error("Approve error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const rejectRecruiter = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please enter a reason");
      return;
    }
    setActionLoading(true);
    try {
       await adminAPI.verifyRecruiter(selectedRecruiter.id, { action: "reject", rejectionReason: rejectReason }); // was selectedRecruiter._id
      toast.success(`${selectedRecruiter.companyName} has been rejected.`); // was companyInfo.companyName
            setRecruiters(recruiters.filter((r) => r.id !== selectedRecruiter.id)); // was r._id / selectedRecruiter._id
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedRecruiter(null);
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
              Pending Recruiters 🏢
            </h1>
            <p className="text-gray-600">
              Review and approve/reject recruiter registrations
            </p>
          </div>

          {/* Count Badge */}
          <div className="mb-4">
            <span className="inline-block bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1 rounded-full">
              {recruiters.length} Pending Approval
            </span>
          </div>

          {recruiters.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <span className="text-5xl">✅</span>
              <p className="text-gray-500 mt-3 text-lg">
                No pending recruiters
              </p>
              <p className="text-gray-400 text-sm">
                All recruiter registrations have been processed
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recruiters.map((recruiter) => (
                <div key={recruiter.id} className="bg-white rounded-lg shadow-md p-6"> {/* was recruiter._id */}
                  <div className="flex items-start justify-between">
                    {/* Company Info */}
                    <div className="flex items-start space-x-4">
                      <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl font-bold text-green-600">{recruiter.companyName?.[0]}</span> {/* was companyInfo.companyName[0] */}
                      </div>
                      <div>
                         <h3 className="text-lg font-bold text-gray-900">{recruiter.companyName}</h3> {/* was companyInfo.companyName */}
                        <p className="text-sm text-gray-500">{recruiter.industry} • {recruiter.location}</p> {/* was companyInfo.industry/.location */}
                        <p className="text-xs text-gray-400 mt-1">
                          Registered:{" "}
                          {new Date(recruiter.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button onClick={() => approveRecruiter(recruiter.id, recruiter.companyName)} disabled={actionLoading} className="btn-success px-5 py-2 text-sm"> {/* was recruiter._id, companyInfo.companyName */}
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRecruiter(recruiter);
                          setShowRejectModal(true);
                        }}
                        disabled={actionLoading}
                        className="btn-danger px-5 py-2 text-sm"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Size</p>
                       <p className="text-sm font-medium text-gray-700">{recruiter.companySize || "—"}</p> {/* was companyInfo.companySize */}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Website</p>
                      {/* {recruiter.companyInfo.website ? (
                        <a
                          href={recruiter.companyInfo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:underline"
                        >
                          {recruiter.companyInfo.website}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-500">—</p>
                      )} */}
                      {recruiter.website ? ( // was companyInfo.website
                        <a href={recruiter.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline">
                          {recruiter.website}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-500">—</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Contact</p>
                       <p className="text-sm font-medium text-gray-700">{recruiter.contactName}</p> {/* was contactPerson.name */}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Email</p>
                     <p className="text-sm font-medium text-gray-700">{recruiter.email}</p> {/* was userId.email */}
                    </div>
                  </div>

                  {/* Description */}
                   {recruiter.description && ( // was companyInfo.description
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-gray-400">About Company</p>
                      <p className="text-sm text-gray-600">{recruiter.description}</p> {/* was companyInfo.description */}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reject Modal */}
          {showRejectModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  Reject Recruiter
                </h4>
                <p className="text-sm text-gray-500 mb-4">
                  Rejecting:{" "}
                  <span className="font-semibold text-gray-700">
                     {selectedRecruiter?.companyName} {/* was companyInfo?.companyName */}
                  </span>
                </p>
                <div>
                  <label className="label">Reason for Rejection *</label>
                  <textarea
                    className="input-field"
                    rows="3"
                    placeholder="Enter reason for rejection..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-5">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectReason("");
                    }}
                    className="btn-secondary px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={rejectRecruiter}
                    disabled={actionLoading}
                    className="btn-danger px-6 py-2"
                  >
                    {actionLoading ? "Rejecting..." : "Reject Recruiter"}
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

export default PendingRecruiters;
