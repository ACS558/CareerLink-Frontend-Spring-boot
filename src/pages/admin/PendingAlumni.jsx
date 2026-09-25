import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import toast from "react-hot-toast";

const PendingAlumni = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlumnus, setSelectedAlumnus] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingAlumni();
  }, []);

  const fetchPendingAlumni = async () => {
    try {
      const res = await adminAPI.getPendingAlumni();
      //setAlumni(res.data.alumni);
      setAlumni(res.data.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const approveAlumnus = async (id, name) => {
    setActionLoading(true);
    try {
      await adminAPI.verifyAlumni(id, {
        action: "approve",
        verificationNotes: "Verified by admin",
      });
      toast.success(`${name} has been verified!`);
      setAlumni(alumni.filter((a) => a.id !== id)); // was a._id
    } catch (error) {
      console.error("Approve error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const rejectAlumnus = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please enter a reason");
      return;
    }
    setActionLoading(true);
    try {
      //const name = `${selectedAlumnus.personalInfo.firstName} ${selectedAlumnus.personalInfo.lastName}`;
       const name = `${selectedAlumnus.firstName} ${selectedAlumnus.lastName}`; 
      
      await adminAPI.verifyAlumni(selectedAlumnus.id, { // was selectedAlumnus._id
        action: "reject",
        rejectionReason: rejectReason,
      });
      toast.success(`${name} has been rejected.`);
      setAlumni(alumni.filter((a) => a.id !== selectedAlumnus.id)); // was a._id / selectedAlumnus._id
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedAlumnus(null);
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
              Pending Alumni 🎓
            </h1>
            <p className="text-gray-600">
              Review and verify alumni registrations
            </p>
          </div>

          <div className="mb-4">
            <span className="inline-block bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1 rounded-full">
              {alumni.length} Pending Verification
            </span>
          </div>

          {alumni.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <span className="text-5xl">✅</span>
              <p className="text-gray-500 mt-3 text-lg">No pending alumni</p>
              <p className="text-gray-400 text-sm">
                All alumni registrations have been processed
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {alumni.map((alumnus) => {
                //const fullName = `${alumnus.personalInfo.firstName} ${alumnus.personalInfo.lastName}`;
                const fullName = `${alumnus.firstName} ${alumnus.lastName}`; // was personalInfo.firstName/.lastName
                
                return (
                  <div
                    key={alumnus.id}
                    className="bg-white rounded-lg shadow-md p-6"
                  >
                    <div className="flex items-start justify-between">
                      {/* Alumni Info */}
                      <div className="flex items-start space-x-4">
                        <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-purple-600">
                            {/* {alumnus.personalInfo.firstName[0]} */}
                            {alumnus.firstName?.[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {fullName}
                          </h3>
                          {/* <p className="text-sm text-gray-500">
                            {alumnus.registrationNumber} •{" "}
                            {alumnus.academicInfo.branch} • Batch{" "}
                            {alumnus.academicInfo.graduationYear}
                          </p> */}

                          <p className="text-sm text-gray-500">
                            {alumnus.registrationNumber} • {alumnus.branch} • Batch {alumnus.graduationYear}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Registered:{" "}
                            {new Date(alumnus.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <button
                          onClick={() => approveAlumnus(alumnus.id, fullName)}
                          disabled={actionLoading}
                          className="btn-success px-5 py-2 text-sm"
                        >
                          ✅ Verify
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAlumnus(alumnus);
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
                        <p className="text-xs text-gray-400">Registration No</p>
                        <p className="text-sm font-bold text-primary-600">
                          {alumnus.registrationNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Branch</p>
                        <p className="text-sm font-medium text-gray-700">
                          {/* {alumnus.academicInfo.branch} */}
                          {alumnus.branch}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Graduation Year</p>
                        <p className="text-sm font-medium text-gray-700">
                          {/* {alumnus.academicInfo.graduationYear} */}
                          {alumnus.graduationYear}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Email</p>
                        <p className="text-sm font-medium text-gray-700">
                          {/* {alumnus.userId.email} */}
                          {alumnus.email}
                        </p>
                      </div>
                    </div>

                    {/* Current Role */}
                   {alumnus.currentCompany && ( // was alumnus.currentRole?.company
                      <div className="mt-3 pt-3 border-t flex space-x-6">
                        <div>
                          <p className="text-xs text-gray-400">
                            Current Company
                          </p>
                          <p className="text-sm font-medium text-gray-700">
                            {/* {alumnus.currentRole.company} */}
                            {alumnus.currentCompany}
                          </p>
                        </div>
                        {alumnus.currentDesignation && ( // was alumnus.currentRole.designation
                          <div>
                            <p className="text-xs text-gray-400">Designation</p>
                            <p className="text-sm font-medium text-gray-700">
                              {/* {alumnus.currentRole.designation} */}
                              {alumnus.currentDesignation}
                            </p>
                          </div>
                        )}
                         {alumnus.experience ? ( // was alumnus.currentRole.experience
                          <div>
                            <p className="text-xs text-gray-400">Experience</p>
                            <p className="text-sm font-medium text-gray-700">
                              {/* {alumnus.currentRole.experience} yrs */}
                              {alumnus.experience} yrs
                            </p>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Reject Modal */}
          {showRejectModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  Reject Alumni
                </h4>
                <p className="text-sm text-gray-500 mb-4">
                  Rejecting:{" "}
                  <span className="font-semibold text-gray-700">
                  {selectedAlumnus?.firstName} {selectedAlumnus?.lastName} {/* was personalInfo?.firstName/.lastName */}
                  
                  </span>
                </p>
                <div>
                  <label className="label">Reason for Rejection *</label>
                  <textarea
                    className="input-field"
                    rows="3"
                    placeholder="Enter reason..."
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
                    onClick={rejectAlumnus}
                    disabled={actionLoading}
                    className="btn-danger px-6 py-2"
                  >
                    {actionLoading ? "Rejecting..." : "Reject Alumni"}
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

export default PendingAlumni;
