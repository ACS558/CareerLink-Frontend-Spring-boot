//Below is the code used for the backend built on spring boot

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";

const AdminJobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [bulkRegistrationNumbers, setBulkRegistrationNumbers] = useState("");
  const [bulkTargetStatus, setBulkTargetStatus] = useState("shortlisted");
  const [bulkUnmatchedAction, setBulkUnmatchedAction] = useState("rejected");
  const [bulkPreview, setBulkPreview] = useState(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getJobDetails(jobId);
      const d = response.data.data; // was response.data (top level)
      setJob(d.job);
      setApplications(d.applications);
      setStats(d.stats);
    } catch (error) {
      console.error("Fetch job details error:", error);
      toast.error("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
    const query = searchQuery.trim().toUpperCase();
    const results = filteredApplications.filter((app) =>
      (app.registrationNumber || "").toUpperCase().includes(query)
    );
    setSearchResults(results);
    setIsSearching(true);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const filteredApplications =
    filter === "all" ? applications : applications.filter((app) => app.status?.toLowerCase() === filter);

  const handleBulkUpdatePreview = () => {
    const regNos = bulkRegistrationNumbers
      .split(/[\n,]+/)
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length > 0);

    if (regNos.length === 0) {
      toast.error("Please enter at least one registration number");
      return;
    }

    const matched = [];
    const unmatched = [];
    const notFound = [];

    filteredApplications.forEach((app) => {
      const regNo = app.registrationNumber?.toUpperCase();
      if (regNos.includes(regNo)) matched.push(app);
      else unmatched.push(app);
    });

    regNos.forEach((regNo) => {
      const exists = filteredApplications.some((app) => app.registrationNumber?.toUpperCase() === regNo);
      if (!exists) notFound.push(regNo);
    });

    setBulkPreview({
      matched, unmatched, notFound,
      targetStatus: bulkTargetStatus,
      unmatchedAction: bulkUnmatchedAction,
    });
  };

  const handleBulkUpdateConfirm = async () => {
    if (!bulkPreview) return;
    try {
      setBulkUpdating(true);

      const matchedAppIds = bulkPreview.matched.map((app) => app.id);
      const unmatchedAppIds =
        bulkPreview.unmatchedAction !== "keep" ? bulkPreview.unmatched.map((app) => app.id) : [];

      if (matchedAppIds.length > 0) {
        await adminAPI.bulkUpdateApplications({
          applicationIds: matchedAppIds,
          status: bulkPreview.targetStatus.toUpperCase(),
        });
      }
      if (unmatchedAppIds.length > 0) {
        await adminAPI.bulkUpdateApplications({
          applicationIds: unmatchedAppIds,
          status: bulkPreview.unmatchedAction.toUpperCase(),
        });
      }

      toast.success(
        `✅ ${matchedAppIds.length} marked as ${bulkPreview.targetStatus}` +
          (unmatchedAppIds.length > 0 ? ` and ${unmatchedAppIds.length} marked as ${bulkPreview.unmatchedAction}` : "")
      );

      setShowBulkUpdateModal(false);
      setBulkRegistrationNumbers("");
      setBulkPreview(null);
      fetchJobDetails(); // refresh from source of truth instead of manual local patching
    } catch (error) {
      console.error("Bulk update error:", error);
      toast.error(error.response?.data?.message || "Failed to update applications");
    } finally {
      setBulkUpdating(false);
    }
  };

  const closeBulkUpdateModal = () => {
    setShowBulkUpdateModal(false);
    setBulkRegistrationNumbers("");
    setBulkPreview(null);
    setBulkTargetStatus("shortlisted");
    setBulkUnmatchedAction("rejected");
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast.error("Please select a status");
      return;
    }
    try {
      setProcessing(true);
      await adminAPI.adminUpdateApplicationStatus(selectedApp.id, {
        status: newStatus.toUpperCase(), // backend enum requires exact uppercase match
        recruiterNotes: adminNotes, // our backend field is named recruiterNotes, not adminNotes
      });

      toast.success("Status updated successfully");
      setShowStatusModal(false);
      setSelectedApp(null);
      setNewStatus("");
      setAdminNotes("");
      fetchJobDetails();
    } catch (error) {
      console.error("Update status error:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setProcessing(false);
    }
  };

  const handleExport = async (exportFilter) => {
    try {
      setExporting(true);
      const response = await adminAPI.exportJobApplications(jobId, exportFilter);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const filename = `${job.title.replace(/[^a-z0-9]/gi, "_")}_${exportFilter}_applications.xlsx`;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`Exported ${exportFilter === "selected" ? "selected" : "all"} applications`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export applications");
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
      applied: "bg-blue-100 text-blue-700 border-blue-300",
      shortlisted: "bg-blue-100 text-blue-700 border-blue-300",
      selected: "bg-green-100 text-green-700 border-green-300",
      rejected: "bg-red-100 text-red-700 border-red-300",
    };
    const key = status?.toLowerCase();
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[key] || styles.pending}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : "Pending"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-8 text-center">
            <p className="text-gray-500">Job not found</p>
            <button onClick={() => navigate("/admin/jobs")} className="mt-4 text-blue-600 hover:text-blue-700 font-semibold">
              ← Back to All Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <button onClick={() => navigate("/admin/jobs")} className="mb-4 text-blue-600 hover:text-blue-700 font-semibold flex items-center">
            ← Back to All Jobs
          </button>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                <p className="text-gray-600 mt-1 text-lg">{job.companyName || "Company"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold">{job.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Job Type</p>
                <p className="font-semibold">{job.jobType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Package</p>
                <p className="font-semibold">₹{job.salaryMax || job.salaryMin || "N/A"} LPA</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Posted</p>
                <p className="font-semibold">{new Date(job.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-4 border-2 border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg shadow-sm p-4 border-2 border-yellow-200">
                <p className="text-sm text-yellow-700 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
              </div>
              <div className="bg-blue-50 rounded-lg shadow-sm p-4 border-2 border-blue-200">
                <p className="text-sm text-blue-700 mb-1">Shortlisted</p>
                <p className="text-2xl font-bold text-blue-800">{stats.shortlisted}</p>
              </div>
              <div className="bg-green-50 rounded-lg shadow-sm p-4 border-2 border-green-200">
                <p className="text-sm text-green-700 mb-1">Selected</p>
                <p className="text-2xl font-bold text-green-800">{stats.selected}</p>
              </div>
              <div className="bg-red-50 rounded-lg shadow-sm p-4 border-2 border-red-200">
                <p className="text-sm text-red-700 mb-1">Rejected</p>
                <p className="text-2xl font-bold text-red-800">{stats.rejected}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex-1 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Search by registration number (e.g., Y22CS101)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button onClick={handleSearch} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold">
                Search
              </button>
              {isSearching && (
                <button onClick={handleClearSearch} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-semibold">
                  Clear
                </button>
              )}
            </div>
            {isSearching && (
              <p className="text-sm text-gray-600 mt-2">
                Showing {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for "{searchQuery}"
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {["all", "pending", "shortlisted", "selected", "rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    filter === status ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3 mb-6">
            <button onClick={() => setShowBulkUpdateModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-semibold">
              Bulk Update
            </button>
            <button
              onClick={() => handleExport("selected")}
              disabled={exporting || stats?.selected === 0}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {exporting ? "Exporting..." : "Export Selected"}
            </button>
            <button onClick={() => handleExport("all")} disabled={exporting} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold">
              {exporting ? "Exporting..." : "Export All"}
            </button>
          </div>

          <div className="space-y-4">
            {(isSearching ? searchResults : filteredApplications).length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-500">
                  {isSearching ? `No applications found for "${searchQuery}"` : "No applications found"}
                </p>
                {isSearching && (
                  <button onClick={handleClearSearch} className="mt-4 text-blue-600 hover:text-blue-700 font-semibold">
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              (isSearching ? searchResults : filteredApplications).map((app) => (
                <div key={app.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="bg-blue-100 p-3 rounded-lg">👤</div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{app.studentName}</h3>
                          <p className="text-sm text-gray-600">{app.registrationNumber}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mb-3 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Branch</p>
                          <p className="font-semibold text-gray-900">{app.studentBranch || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">CGPA</p>
                          <p className="font-semibold text-gray-900">{app.studentCgpa || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Graduation</p>
                          <p className="font-semibold text-gray-900 text-sm">{app.studentGraduationYear || "N/A"}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {getStatusBadge(app.status)}
                        <span className="text-sm text-gray-500">Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        const validStatuses = ["pending", "shortlisted", "selected", "rejected"];
                        const current = app.status?.toLowerCase();
                        setNewStatus(validStatuses.includes(current) ? current : "pending");
                        setShowStatusModal(true);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold ml-4"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showStatusModal && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Update Status</h2>

            <div className="mb-4 bg-gray-50 p-4 rounded-lg">
              <p className="font-bold text-lg text-gray-900">{selectedApp.studentName}</p>
              <p className="text-sm text-gray-600">{selectedApp.registrationNumber}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="applied">Applied</option>
                <option value="pending">Pending</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="selected">Selected</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Add notes..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => { setShowStatusModal(false); setSelectedApp(null); setNewStatus(""); setAdminNotes(""); }}
                disabled={processing}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button onClick={handleUpdateStatus} disabled={processing} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50">
                {processing ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">🔄 Bulk Update Status</h2>
                <button onClick={closeBulkUpdateModal} className="text-gray-400 hover:text-gray-600 transition">✕</button>
              </div>

              {!bulkPreview ? (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">1️⃣ Update selected students to:</label>
                    <select
                      value={bulkTargetStatus}
                      onChange={(e) => setBulkTargetStatus(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="selected">Selected</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">2️⃣ Enter Registration Numbers:</label>
                    <p className="text-xs text-gray-600 mb-2">One per line or comma-separated (e.g., Y22CS101, Y22CS102)</p>
                    <textarea
                      value={bulkRegistrationNumbers}
                      onChange={(e) => setBulkRegistrationNumbers(e.target.value)}
                      placeholder="Y22CS101&#10;Y22CS102&#10;Y22CS105"
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">3️⃣ What to do with other applications?</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" value="keep" checked={bulkUnmatchedAction === "keep"} onChange={(e) => setBulkUnmatchedAction(e.target.value)} />
                        <span className="text-sm text-gray-700">Keep their current status</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" value="rejected" checked={bulkUnmatchedAction === "rejected"} onChange={(e) => setBulkUnmatchedAction(e.target.value)} />
                        <span className="text-sm text-gray-700">Mark all others as Rejected</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" value="pending" checked={bulkUnmatchedAction === "pending"} onChange={(e) => setBulkUnmatchedAction(e.target.value)} />
                        <span className="text-sm text-gray-700">Mark all others as Pending</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button onClick={closeBulkUpdateModal} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-gray-700">Cancel</button>
                    <button onClick={handleBulkUpdatePreview} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">Preview Changes →</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">
                        ✅ To be marked as {bulkPreview.targetStatus.toUpperCase()} ({bulkPreview.matched.length} students):
                      </h3>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {bulkPreview.matched.map((app) => (
                          <p key={app.id} className="text-sm text-green-800">
                            • {app.registrationNumber} - {app.studentName}
                          </p>
                        ))}
                      </div>
                    </div>

                    {bulkPreview.unmatchedAction !== "keep" && bulkPreview.unmatched.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="font-semibold text-red-900 mb-2">
                          ❌ To be marked as {bulkPreview.unmatchedAction.toUpperCase()} ({bulkPreview.unmatched.length} students):
                        </h3>
                        <p className="text-sm text-red-700">All other {bulkPreview.unmatched.length} applications</p>
                      </div>
                    )}

                    {bulkPreview.notFound.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Not found ({bulkPreview.notFound.length}):</h3>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {bulkPreview.notFound.map((regNo, idx) => (
                            <p key={idx} className="text-sm text-yellow-800">• {regNo}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={() => setBulkPreview(null)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-gray-700">← Back</button>
                    <button
                      onClick={handleBulkUpdateConfirm}
                      disabled={bulkUpdating || bulkPreview.matched.length === 0}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
                    >
                      {bulkUpdating ? "Updating..." : `Confirm Update (${bulkPreview.matched.length} students) →`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobDetails;



//Below code is commented out beacuase it was used for the backend built on node.js and express.js

// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { adminAPI } from "../../services/api";
// import toast from "react-hot-toast";
// import Navbar from "../../components/common/Navbar";
// import Sidebar from "../../components/common/Sidebar";

// const AdminJobDetails = () => {
//   const { jobId } = useParams();
//   const navigate = useNavigate();
//   const [job, setJob] = useState(null);
//   const [applications, setApplications] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState("all");
//   const [selectedApp, setSelectedApp] = useState(null);
//   const [showStatusModal, setShowStatusModal] = useState(false);
//   const [newStatus, setNewStatus] = useState("");
//   const [adminNotes, setAdminNotes] = useState("");
//   const [processing, setProcessing] = useState(false);
//   const [exporting, setExporting] = useState(false);

//   // Search feature
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [isSearching, setIsSearching] = useState(false);

//   // Bulk update feature
//   const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
//   const [bulkRegistrationNumbers, setBulkRegistrationNumbers] = useState("");
//   const [bulkTargetStatus, setBulkTargetStatus] = useState("shortlisted");
//   const [bulkUnmatchedAction, setBulkUnmatchedAction] = useState("rejected");
//   const [bulkPreview, setBulkPreview] = useState(null);
//   const [bulkUpdating, setBulkUpdating] = useState(false);

//   useEffect(() => {
//     fetchJobDetails();
//   }, [jobId]);

//   const fetchJobDetails = async () => {
//     try {
//       setLoading(true);
//       const response = await adminAPI.getJobDetails(jobId);
//       setJob(response.data.job);
//       setApplications(response.data.applications);
//       setStats(response.data.stats);
//     } catch (error) {
//       console.error("Fetch job details error:", error);
//       toast.error("Failed to load job details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // SEARCH HANDLERS
//   const handleSearch = () => {
//     if (!searchQuery.trim()) {
//       setIsSearching(false);
//       setSearchResults([]);
//       return;
//     }

//     const query = searchQuery.trim().toUpperCase();
//     const results = filteredApplications.filter((app) => {
//       const regNo = app.studentId?.registrationNumber?.toUpperCase() || "";
//       return regNo.includes(query);
//     });

//     setSearchResults(results);
//     setIsSearching(true);
//   };

//   const handleClearSearch = () => {
//     setSearchQuery("");
//     setSearchResults([]);
//     setIsSearching(false);
//   };

//   const handleSearchKeyPress = (e) => {
//     if (e.key === "Enter") {
//       handleSearch();
//     }
//   };

//   // BULK UPDATE HANDLERS
//   const handleBulkUpdatePreview = () => {
//     const regNos = bulkRegistrationNumbers
//       .split(/[\n,]+/)
//       .map((s) => s.trim().toUpperCase())
//       .filter((s) => s.length > 0);

//     if (regNos.length === 0) {
//       toast.error("Please enter at least one registration number");
//       return;
//     }

//     const matched = [];
//     const unmatched = [];
//     const notFound = [];

//     filteredApplications.forEach((app) => {
//       const regNo = app.studentId?.registrationNumber?.toUpperCase();
//       if (regNos.includes(regNo)) {
//         matched.push(app);
//       } else {
//         unmatched.push(app);
//       }
//     });

//     regNos.forEach((regNo) => {
//       const exists = filteredApplications.some(
//         (app) => app.studentId?.registrationNumber?.toUpperCase() === regNo,
//       );
//       if (!exists) {
//         notFound.push(regNo);
//       }
//     });

//     setBulkPreview({
//       matched,
//       unmatched,
//       notFound,
//       targetStatus: bulkTargetStatus,
//       unmatchedAction: bulkUnmatchedAction,
//     });
//   };

//   const handleBulkUpdateConfirm = async () => {
//     if (!bulkPreview) return;

//     try {
//       setBulkUpdating(true);

//       const matchedAppIds = bulkPreview.matched.map((app) => app._id);
//       const unmatchedAppIds =
//         bulkPreview.unmatchedAction !== "keep"
//           ? bulkPreview.unmatched.map((app) => app._id)
//           : [];

//       // Update matched applications
//       if (matchedAppIds.length > 0) {
//         await adminAPI.bulkUpdateApplications({
//           applicationIds: matchedAppIds,
//           status: bulkPreview.targetStatus,
//         });
//       }

//       // Update unmatched applications
//       if (unmatchedAppIds.length > 0) {
//         await adminAPI.bulkUpdateApplications({
//           applicationIds: unmatchedAppIds,
//           status: bulkPreview.unmatchedAction,
//         });
//       }

//       // Update local state
//       setApplications((prevApps) =>
//         prevApps.map((app) => {
//           if (matchedAppIds.includes(app._id)) {
//             return { ...app, status: bulkPreview.targetStatus };
//           }
//           if (unmatchedAppIds.includes(app._id)) {
//             return { ...app, status: bulkPreview.unmatchedAction };
//           }
//           return app;
//         }),
//       );

//       toast.success(
//         `✅ ${matchedAppIds.length} marked as ${bulkPreview.targetStatus}` +
//           (unmatchedAppIds.length > 0
//             ? ` and ${unmatchedAppIds.length} marked as ${bulkPreview.unmatchedAction}`
//             : ""),
//       );

//       // Reset modal
//       setShowBulkUpdateModal(false);
//       setBulkRegistrationNumbers("");
//       setBulkPreview(null);
//     } catch (error) {
//       console.error("Bulk update error:", error);
//       toast.error(
//         error.response?.data?.message || "Failed to update applications",
//       );
//     } finally {
//       setBulkUpdating(false);
//     }
//   };

//   const closeBulkUpdateModal = () => {
//     setShowBulkUpdateModal(false);
//     setBulkRegistrationNumbers("");
//     setBulkPreview(null);
//     setBulkTargetStatus("shortlisted");
//     setBulkUnmatchedAction("rejected");
//   };

//   const filteredApplications =
//     filter === "all"
//       ? applications
//       : applications.filter((app) => app.status === filter);

//   const handleUpdateStatus = async () => {
//     if (!newStatus) {
//       toast.error("Please select a status");
//       return;
//     }

//     try {
//       setProcessing(true);
//       await adminAPI.adminUpdateApplicationStatus(selectedApp._id, {
//         status: newStatus,
//         adminNotes,
//       });

//       toast.success("Status updated successfully");
//       setShowStatusModal(false);
//       setSelectedApp(null);
//       setNewStatus("");
//       setAdminNotes("");
//       fetchJobDetails();
//     } catch (error) {
//       console.error("Update status error:", error);
//       toast.error(error.response?.data?.message || "Failed to update status");
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleExport = async (exportFilter) => {
//     try {
//       setExporting(true);
//       const response = await adminAPI.exportJobApplications(
//         jobId,
//         exportFilter,
//       );

//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       const filename = `${job.title.replace(/[^a-z0-9]/gi, "_")}_${exportFilter}_applications.xlsx`;
//       link.setAttribute("download", filename);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();

//       toast.success(
//         `Exported ${exportFilter === "selected" ? "selected" : "all"} applications`,
//       );
//     } catch (error) {
//       console.error("Export error:", error);
//       toast.error("Failed to export applications");
//     } finally {
//       setExporting(false);
//     }
//   };

//   const getStatusBadge = (status) => {
//     const styles = {
//       pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
//       shortlisted: "bg-blue-100 text-blue-700 border-blue-300",
//       selected: "bg-green-100 text-green-700 border-green-300",
//       rejected: "bg-red-100 text-red-700 border-red-300",
//     };

//     return (
//       <span
//         className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}
//       >
//         {status.charAt(0).toUpperCase() + status.slice(1)}
//       </span>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Navbar />
//         <div className="flex">
//           <Sidebar />
//           <div className="flex-1 flex items-center justify-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!job) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Navbar />
//         <div className="flex">
//           <Sidebar />
//           <div className="flex-1 p-8 text-center">
//             <p className="text-gray-500">Job not found</p>
//             <button
//               onClick={() => navigate("/admin/jobs")}
//               className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
//             >
//               ← Back to All Jobs
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />
//       <div className="flex">
//         <Sidebar />
//         <div className="flex-1 p-8">
//           <button
//             onClick={() => navigate("/admin/jobs")}
//             className="mb-4 text-blue-600 hover:text-blue-700 font-semibold flex items-center"
//           >
//             <svg
//               className="w-5 h-5 mr-1"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M15 19l-7-7 7-7"
//               />
//             </svg>
//             Back to All Jobs
//           </button>

//           {/* Job Header */}
//           <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//             <div className="flex items-start justify-between mb-4">
//               <div>
//                 <h1 className="text-3xl font-bold text-gray-900">
//                   {job.title}
//                 </h1>
//                 <p className="text-gray-600 mt-1 text-lg">
//                   {job.recruiterId?.companyInfo?.companyName || "Company"}
//                 </p>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <div>
//                 <p className="text-sm text-gray-600">Location</p>
//                 <p className="font-semibold">{job.location}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600">Job Type</p>
//                 <p className="font-semibold">{job.jobType}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600">Package</p>
//                 <p className="font-semibold">
//                   ₹{job.package || job.salaryRange?.max || "N/A"} LPA
//                 </p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600">Posted</p>
//                 <p className="font-semibold">
//                   {new Date(job.createdAt).toLocaleDateString()}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Stats Cards */}
//           {stats && (
//             <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
//               <div className="bg-white rounded-lg shadow-sm p-4 border-2 border-gray-200">
//                 <p className="text-sm text-gray-600 mb-1">Total</p>
//                 <p className="text-2xl font-bold text-gray-900">
//                   {stats.total}
//                 </p>
//               </div>
//               <div className="bg-yellow-50 rounded-lg shadow-sm p-4 border-2 border-yellow-200">
//                 <p className="text-sm text-yellow-700 mb-1">Pending</p>
//                 <p className="text-2xl font-bold text-yellow-800">
//                   {stats.pending}
//                 </p>
//               </div>
//               <div className="bg-blue-50 rounded-lg shadow-sm p-4 border-2 border-blue-200">
//                 <p className="text-sm text-blue-700 mb-1">Shortlisted</p>
//                 <p className="text-2xl font-bold text-blue-800">
//                   {stats.shortlisted}
//                 </p>
//               </div>
//               <div className="bg-green-50 rounded-lg shadow-sm p-4 border-2 border-green-200">
//                 <p className="text-sm text-green-700 mb-1">Selected</p>
//                 <p className="text-2xl font-bold text-green-800">
//                   {stats.selected}
//                 </p>
//               </div>
//               <div className="bg-red-50 rounded-lg shadow-sm p-4 border-2 border-red-200">
//                 <p className="text-sm text-red-700 mb-1">Rejected</p>
//                 <p className="text-2xl font-bold text-red-800">
//                   {stats.rejected}
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Search Bar */}
//           <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
//             <div className="flex items-center space-x-3">
//               <div className="flex-1 flex items-center space-x-2">
//                 <svg
//                   className="w-5 h-5 text-gray-400"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//                   />
//                 </svg>
//                 <input
//                   type="text"
//                   placeholder="Search by registration number (e.g., Y22CS101)"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   onKeyPress={handleSearchKeyPress}
//                   className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <button
//                 onClick={handleSearch}
//                 className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
//               >
//                 Search
//               </button>
//               {isSearching && (
//                 <button
//                   onClick={handleClearSearch}
//                   className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
//                 >
//                   Clear
//                 </button>
//               )}
//             </div>
//             {isSearching && (
//               <p className="text-sm text-gray-600 mt-2">
//                 Showing {searchResults.length} result
//                 {searchResults.length !== 1 ? "s" : ""} for "{searchQuery}"
//               </p>
//             )}
//           </div>

//           {/* Filter Tabs */}
//           <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
//             <div className="flex flex-wrap gap-2">
//               {["all", "pending", "shortlisted", "selected", "rejected"].map(
//                 (status) => (
//                   <button
//                     key={status}
//                     onClick={() => setFilter(status)}
//                     className={`px-4 py-2 rounded-lg font-semibold transition ${
//                       filter === status
//                         ? "bg-blue-600 text-white"
//                         : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                     }`}
//                   >
//                     {status.charAt(0).toUpperCase() + status.slice(1)}
//                   </button>
//                 ),
//               )}
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex items-center space-x-3 mb-6">
//             <button
//               onClick={() => setShowBulkUpdateModal(true)}
//               className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-semibold flex items-center space-x-2"
//             >
//               <svg
//                 className="w-5 h-5"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
//                 />
//               </svg>
//               <span>Bulk Update</span>
//             </button>

//             <button
//               onClick={() => handleExport("selected")}
//               disabled={exporting || stats?.selected === 0}
//               className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center space-x-2"
//             >
//               <svg
//                 className="w-5 h-5"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                 />
//               </svg>
//               <span>{exporting ? "Exporting..." : "Export Selected"}</span>
//             </button>

//             <button
//               onClick={() => handleExport("all")}
//               disabled={exporting}
//               className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold flex items-center space-x-2"
//             >
//               <svg
//                 className="w-5 h-5"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                 />
//               </svg>
//               <span>{exporting ? "Exporting..." : "Export All"}</span>
//             </button>
//           </div>

//           {/* Applications List */}
//           <div className="space-y-4">
//             {(isSearching ? searchResults : filteredApplications).length ===
//             0 ? (
//               <div className="bg-white rounded-lg shadow-sm p-12 text-center">
//                 <svg
//                   className="w-16 h-16 text-gray-400 mx-auto mb-4"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
//                   />
//                 </svg>
//                 <p className="text-gray-500">
//                   {isSearching
//                     ? `No applications found for "${searchQuery}"`
//                     : "No applications found"}
//                 </p>
//                 {isSearching && (
//                   <button
//                     onClick={handleClearSearch}
//                     className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
//                   >
//                     Clear Search
//                   </button>
//                 )}
//               </div>
//             ) : (
//               (isSearching ? searchResults : filteredApplications).map(
//                 (app) => {
//                   const student = app.studentId;
//                   return (
//                     <div
//                       key={app._id}
//                       className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition border border-gray-200"
//                     >
//                       <div className="flex items-start justify-between">
//                         <div className="flex-1">
//                           <div className="flex items-center space-x-4 mb-3">
//                             <div className="bg-blue-100 p-3 rounded-lg">
//                               <svg
//                                 className="w-6 h-6 text-blue-600"
//                                 fill="none"
//                                 stroke="currentColor"
//                                 viewBox="0 0 24 24"
//                               >
//                                 <path
//                                   strokeLinecap="round"
//                                   strokeLinejoin="round"
//                                   strokeWidth={2}
//                                   d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//                                 />
//                               </svg>
//                             </div>
//                             <div>
//                               <h3 className="text-lg font-bold text-gray-900">
//                                 {student.personalInfo?.firstName}{" "}
//                                 {student.personalInfo?.lastName}
//                               </h3>
//                               <p className="text-sm text-gray-600">
//                                 {student.registrationNumber}
//                               </p>
//                             </div>
//                           </div>

//                           <div className="grid md:grid-cols-3 gap-4 mb-3 bg-gray-50 p-4 rounded-lg">
//                             <div>
//                               <p className="text-xs text-gray-500 mb-1">
//                                 Branch
//                               </p>
//                               <p className="font-semibold text-gray-900">
//                                 {student.academicInfo?.branch || "N/A"}
//                               </p>
//                             </div>
//                             <div>
//                               <p className="text-xs text-gray-500 mb-1">
//                                 Phone
//                               </p>
//                               <p className="font-semibold text-gray-900">
//                                 {student.personalInfo?.phoneNumber || "N/A"}
//                               </p>
//                             </div>
//                             <div>
//                               <p className="text-xs text-gray-500 mb-1">
//                                 Email
//                               </p>
//                               <p className="font-semibold text-gray-900 text-sm truncate">
//                                 {student.personalInfo?.email || "N/A"}
//                               </p>
//                             </div>
//                           </div>

//                           <div className="flex items-center space-x-4">
//                             {getStatusBadge(app.status)}
//                             <span className="text-sm text-gray-500">
//                               Applied:{" "}
//                               {new Date(app.createdAt).toLocaleDateString()}
//                             </span>
//                           </div>
//                         </div>

//                         <button
//                           onClick={() => {
//                             setSelectedApp(app);
//                             // ✅ Fallback to "pending" if status is invalid
//                             const validStatuses = [
//                               "pending",
//                               "shortlisted",
//                               "selected",
//                               "rejected",
//                             ];
//                             setNewStatus(
//                               validStatuses.includes(app.status)
//                                 ? app.status
//                                 : "pending",
//                             );
//                             setShowStatusModal(true);
//                           }}
//                           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold ml-4"
//                         >
//                           Update Status
//                         </button>
//                       </div>
//                     </div>
//                   );
//                 },
//               )
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Update Status Modal */}
//       {showStatusModal && selectedApp && (
//         <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
//             <h2 className="text-2xl font-bold text-gray-900 mb-6">
//               Update Status
//             </h2>

//             <div className="mb-4 bg-gray-50 p-4 rounded-lg">
//               <p className="font-bold text-lg text-gray-900">
//                 {selectedApp.studentId.personalInfo?.firstName}{" "}
//                 {selectedApp.studentId.personalInfo?.lastName}
//               </p>
//               <p className="text-sm text-gray-600">
//                 {selectedApp.studentId.registrationNumber}
//               </p>
//             </div>

//             <div className="mb-4">
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 New Status
//               </label>
//               <select
//                 value={newStatus}
//                 onChange={(e) => setNewStatus(e.target.value)}
//                 className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="applied">Applied</option>
//                 <option value="pending">Pending</option>
//                 <option value="shortlisted">Shortlisted</option>
//                 <option value="selected">Selected</option>
//                 <option value="rejected">Rejected</option>
//               </select>
//             </div>

//             <div className="mb-6">
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Notes (Optional)
//               </label>
//               <textarea
//                 value={adminNotes}
//                 onChange={(e) => setAdminNotes(e.target.value)}
//                 className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 rows={3}
//                 placeholder="Add notes..."
//               />
//             </div>

//             <div className="flex space-x-3">
//               <button
//                 onClick={() => {
//                   setShowStatusModal(false);
//                   setSelectedApp(null);
//                   setNewStatus("");
//                   setAdminNotes("");
//                 }}
//                 disabled={processing}
//                 className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-gray-700 disabled:opacity-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleUpdateStatus}
//                 disabled={processing}
//                 className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
//               >
//                 {processing ? "Updating..." : "Update"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Bulk Update Modal */}
//       {showBulkUpdateModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-2xl font-bold text-gray-900">
//                   🔄 Bulk Update Status
//                 </h2>
//                 <button
//                   onClick={closeBulkUpdateModal}
//                   className="text-gray-400 hover:text-gray-600 transition"
//                 >
//                   <svg
//                     className="w-6 h-6"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M6 18L18 6M6 6l12 12"
//                     />
//                   </svg>
//                 </button>
//               </div>

//               {!bulkPreview ? (
//                 <>
//                   <div className="mb-6">
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       1️⃣ Update selected students to:
//                     </label>
//                     <select
//                       value={bulkTargetStatus}
//                       onChange={(e) => setBulkTargetStatus(e.target.value)}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     >
//                       <option value="pending">Pending</option>
//                       <option value="shortlisted">Shortlisted</option>
//                       <option value="selected">Selected</option>
//                       <option value="rejected">Rejected</option>
//                     </select>
//                   </div>

//                   <div className="mb-6">
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       2️⃣ Enter Registration Numbers:
//                     </label>
//                     <p className="text-xs text-gray-600 mb-2">
//                       One per line or comma-separated (e.g., Y22CS101, Y22CS102)
//                     </p>
//                     <textarea
//                       value={bulkRegistrationNumbers}
//                       onChange={(e) =>
//                         setBulkRegistrationNumbers(e.target.value)
//                       }
//                       placeholder="Y22CS101&#10;Y22CS102&#10;Y22CS105"
//                       rows={8}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
//                     />
//                   </div>

//                   <div className="mb-6">
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       3️⃣ What to do with other applications?
//                     </label>
//                     <div className="space-y-2">
//                       <label className="flex items-center space-x-2 cursor-pointer">
//                         <input
//                           type="radio"
//                           value="keep"
//                           checked={bulkUnmatchedAction === "keep"}
//                           onChange={(e) =>
//                             setBulkUnmatchedAction(e.target.value)
//                           }
//                           className="text-blue-600"
//                         />
//                         <span className="text-sm text-gray-700">
//                           Keep their current status
//                         </span>
//                       </label>
//                       <label className="flex items-center space-x-2 cursor-pointer">
//                         <input
//                           type="radio"
//                           value="rejected"
//                           checked={bulkUnmatchedAction === "rejected"}
//                           onChange={(e) =>
//                             setBulkUnmatchedAction(e.target.value)
//                           }
//                           className="text-blue-600"
//                         />
//                         <span className="text-sm text-gray-700">
//                           Mark all others as Rejected
//                         </span>
//                       </label>
//                       <label className="flex items-center space-x-2 cursor-pointer">
//                         <input
//                           type="radio"
//                           value="pending"
//                           checked={bulkUnmatchedAction === "pending"}
//                           onChange={(e) =>
//                             setBulkUnmatchedAction(e.target.value)
//                           }
//                           className="text-blue-600"
//                         />
//                         <span className="text-sm text-gray-700">
//                           Mark all others as Pending
//                         </span>
//                       </label>
//                     </div>
//                   </div>

//                   <div className="flex justify-end space-x-3">
//                     <button
//                       onClick={closeBulkUpdateModal}
//                       className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-gray-700"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       onClick={handleBulkUpdatePreview}
//                       className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
//                     >
//                       Preview Changes →
//                     </button>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <div className="space-y-4">
//                     <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                       <h3 className="font-semibold text-green-900 mb-2">
//                         ✅ To be marked as{" "}
//                         {bulkPreview.targetStatus.toUpperCase()} (
//                         {bulkPreview.matched.length} students):
//                       </h3>
//                       <div className="max-h-40 overflow-y-auto space-y-1">
//                         {bulkPreview.matched.map((app) => (
//                           <p key={app._id} className="text-sm text-green-800">
//                             • {app.studentId?.registrationNumber} -{" "}
//                             {app.studentId?.personalInfo?.firstName}{" "}
//                             {app.studentId?.personalInfo?.lastName}
//                           </p>
//                         ))}
//                       </div>
//                     </div>

//                     {bulkPreview.unmatchedAction !== "keep" &&
//                       bulkPreview.unmatched.length > 0 && (
//                         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//                           <h3 className="font-semibold text-red-900 mb-2">
//                             ❌ To be marked as{" "}
//                             {bulkPreview.unmatchedAction.toUpperCase()} (
//                             {bulkPreview.unmatched.length} students):
//                           </h3>
//                           <p className="text-sm text-red-700">
//                             All other {bulkPreview.unmatched.length}{" "}
//                             applications
//                           </p>
//                         </div>
//                       )}

//                     {bulkPreview.notFound.length > 0 && (
//                       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//                         <h3 className="font-semibold text-yellow-900 mb-2">
//                           ⚠️ Not found ({bulkPreview.notFound.length}):
//                         </h3>
//                         <div className="max-h-32 overflow-y-auto space-y-1">
//                           {bulkPreview.notFound.map((regNo, idx) => (
//                             <p key={idx} className="text-sm text-yellow-800">
//                               • {regNo}
//                             </p>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   <div className="flex justify-end space-x-3 mt-6">
//                     <button
//                       onClick={() => setBulkPreview(null)}
//                       className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-gray-700"
//                     >
//                       ← Back
//                     </button>
//                     <button
//                       onClick={handleBulkUpdateConfirm}
//                       disabled={
//                         bulkUpdating || bulkPreview.matched.length === 0
//                       }
//                       className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
//                     >
//                       {bulkUpdating
//                         ? "Updating..."
//                         : `Confirm Update (${bulkPreview.matched.length} students) →`}
//                     </button>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminJobDetails;
