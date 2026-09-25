import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import { getStatusBadgeColor } from "../../utils/helpers";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";

const ManageRecruiters = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchRecruiters();
  }, [search, status]);

  const fetchRecruiters = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (status) params.verificationStatus = status;
      const res = await adminAPI.getAllRecruiters(params);
      //setRecruiters(res.data.recruiters);
      setRecruiters(res.data.data);
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
            <h1 className="text-2xl font-bold text-gray-900">
              All Recruiters 🏢
            </h1>
            <p className="text-gray-600">
              View and manage all registered recruiters
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  className="input-field"
                  placeholder="🔍 Search by company name..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
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
                      Company
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Industry
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Location
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Contact
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Registered
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
                  ) : recruiters.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center py-10 text-gray-400"
                      >
                        No recruiters found
                      </td>
                    </tr>
                  ) : (
                    // recruiters.map((rec, index) => (
                    //   <tr key={rec._id} className="hover:bg-gray-50">
                    //     <td className="px-6 py-4 text-sm text-gray-500">
                    //       {index + 1}
                    //     </td>
                    //     <td className="px-6 py-4">
                    //       <div className="flex items-center space-x-3">
                    //         <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    //           <span className="text-sm font-bold text-green-600">
                    //             {rec.companyInfo.companyName[0]}
                    //           </span>
                    //         </div>
                    //         <div>
                    //           <p className="text-sm font-semibold text-gray-900">
                    //             {rec.companyInfo.companyName}
                    //           </p>
                    //           <p className="text-xs text-gray-400">
                    //             {rec.userId?.email}
                    //           </p>
                    //         </div>
                    //       </div>
                    //     </td>
                    //     <td className="px-6 py-4 text-sm text-gray-700">
                    //       {rec.companyInfo.industry}
                    //     </td>
                    //     <td className="px-6 py-4 text-sm text-gray-700">
                    //       {rec.companyInfo.location}
                    //     </td>
                    //     <td className="px-6 py-4 text-sm text-gray-700">
                    //       {rec.contactPerson.name}
                    //     </td>
                    //     <td className="px-6 py-4">
                    //       <span
                    //         className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusBadgeColor(rec.verificationStatus)}`}
                    //       >
                    //         {rec.verificationStatus?.charAt(0).toUpperCase() +
                    //           rec.verificationStatus?.slice(1)}
                    //       </span>
                    //     </td>
                    //     <td className="px-6 py-4 text-sm text-gray-500">
                    //       {new Date(rec.createdAt).toLocaleDateString()}
                    //     </td>
                    //   </tr>
                    // ))
                                        recruiters.map((rec, index) => (
                      <tr key={rec.id} className="hover:bg-gray-50"> {/* was rec._id */}
                        <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-bold text-green-600">{rec.companyName?.[0]}</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{rec.companyName}</p>
                              <p className="text-xs text-gray-400">{rec.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{rec.industry}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{rec.location}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{rec.contactName}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusBadgeColor(rec.verificationStatus)}`}>
                            {rec.verificationStatus?.charAt(0).toUpperCase() + rec.verificationStatus?.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(rec.createdAt).toLocaleDateString()}</td>
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

export default ManageRecruiters;
