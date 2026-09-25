import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import { getStatusBadgeColor } from "../../utils/helpers";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";

const ManageAlumni = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [branch, setBranch] = useState("");

  useEffect(() => {
    fetchAlumni();
  }, [search, status, branch]);

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (status) params.verificationStatus = status;
      if (branch) params.branch = branch;
      const res = await adminAPI.getAllAlumni(params);
      //setAlumni(res.data.alumni);
      setAlumni(res.data.data );
    } catch (error) {
      console.error("Fetch error:", error);
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
            <h1 className="text-2xl font-bold text-gray-900">All Alumni 🎓</h1>
            <p className="text-gray-600">
              View and manage all registered alumni
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  className="input-field"
                  placeholder="🔍 Search by name or reg number..."
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
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <select
                  className="input-field"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                >
                  <option value="">All Branches</option>
                  <option value="Computer Science Engineering">CSE</option>
                  <option value="Information Technology">IT</option>
                  <option value="Electronics and Communication">ECE</option>
                  <option value="Electrical Engineering">EEE</option>
                  <option value="Mechanical Engineering">Mechanical</option>
                  <option value="Civil Engineering">Civil</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      #
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Reg No
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Branch
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Batch
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Company
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Status
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
                  ) : alumni.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center py-10 text-gray-400"
                      >
                        No alumni found
                      </td>
                    </tr>
                  ) : (
                    alumni.map((al, index) => (
                      <tr key={al.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-primary-600">
                            {al.registrationNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-purple-600">
                                {/* {al.personalInfo?.firstName?.[0]} */}
                                {al.firstName?.[0]}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {/* {al.personalInfo?.firstName}{" "}
                                {al.personalInfo?.lastName} */}
                                {al.firstName} {al.lastName}
                              </p>
                              <p className="text-xs text-gray-400">
                                {/* {al.userId?.email} */}
                                {al.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {/* {al.academicInfo?.branch || "—"} */}
                          {al.branch || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {/* {al.academicInfo?.graduationYear || "—"} */}
                          {al.graduationYear || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {/* {al.currentRole?.company || "—"} */}
                          {al.currentCompany || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusBadgeColor(al.verificationStatus)}`}
                          >
                            {/* {al.verificationStatus === "verified"
                              ? "Verified"
                              : al.verificationStatus?.charAt(0).toUpperCase() +
                                al.verificationStatus?.slice(1)} */}

                                {al.verificationStatus?.toLowerCase() === "approved"
                              ? "Verified"
                              : al.verificationStatus?.charAt(0).toUpperCase() + al.verificationStatus?.slice(1).toLowerCase()}
                          </span>
                        </td>
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

export default ManageAlumni;
