import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import { getStatusBadgeColor, getCGPAColor } from "../../utils/helpers";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState("");
  const [placementStatus, setPlacementStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    fetchStudents();
  }, [search, branch, placementStatus, currentPage]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      //const params = { page: currentPage, limit: 10 };
       const params = { page: currentPage - 1, size: 10 };
      if (search) params.search = search;
      if (branch) params.branch = branch;
      if (placementStatus) params.placementStatus = placementStatus;
      const res = await adminAPI.getAllStudents(params);
      // setStudents(res.data.students);
      // setTotalPages(res.data.totalPages);
      // setTotalStudents(res.data.totalStudents);
      setStudents(page.content); 
      setTotalPages(page.totalPages); 
      setTotalStudents(page.totalElements); 
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };
  const handleBranchChange = (e) => {
    setBranch(e.target.value);
    setCurrentPage(1);
  };
  const handleStatusChange = (e) => {
    setPlacementStatus(e.target.value);
    setCurrentPage(1);
  };

  // Pagination helper - show limited page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Full width Navbar */}
      <div className="flex-shrink-0">
        <Navbar />
      </div>

      {/* Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 overflow-y-auto bg-white shadow-md">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Manage Students 👥
            </h1>
            <p className="text-gray-600">
              View, search, and filter all registered students
            </p>
          </div>

          {/* Filters Row */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  className="input-field"
                  placeholder="🔍 Search by name or registration number..."
                  value={search}
                  onChange={handleSearchChange}
                />
              </div>
              <div>
                <select
                  className="input-field"
                  value={branch}
                  onChange={handleBranchChange}
                >
                  <option value="">All Branches</option>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                </select>
              </div>
              <div>
                <select
                  className="input-field"
                  value={placementStatus}
                  onChange={handleStatusChange}
                >
                  <option value="">All Status</option>
                  <option value="placed">Placed</option>
                  <option value="unplaced">Unplaced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold">{students.length}</span>{" "}
              of <span className="font-semibold">{totalStudents}</span> students
            </p>
            <p className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </p>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Reg No
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Branch
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      CGPA
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Skills
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                  ) : students.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center py-10 text-gray-400"
                      >
                        No students found
                      </td>
                    </tr>
                  ) : (
                    // students.map((student, index) => (
                    //   <tr
                    //     key={student._id}
                    //     className="hover:bg-gray-50 transition-colors"
                    //   >
                    //     <td className="px-6 py-4 text-sm text-gray-500">
                    //       {(currentPage - 1) * 10 + index + 1}
                    //     </td>
                    //     <td className="px-6 py-4">
                    //       <span className="text-sm font-bold text-primary-600">
                    //         {student.registrationNumber}
                    //       </span>
                    //     </td>
                    //     <td className="px-6 py-4">
                    //       <div className="flex items-center space-x-3">
                    //         <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    //           <span className="text-sm font-bold text-primary-600">
                    //             {(student.personalInfo?.firstName || "?")[0]}
                    //           </span>
                    //         </div>
                    //         <div>
                    //           <p className="text-sm font-semibold text-gray-900">
                    //             {student.personalInfo?.firstName}{" "}
                    //             {student.personalInfo?.lastName}
                    //           </p>
                    //           <p className="text-xs text-gray-400">
                    //             {student.userId?.email}
                    //           </p>
                    //         </div>
                    //       </div>
                    //     </td>
                    //     <td className="px-6 py-4 text-sm text-gray-700">
                    //       {student.academicInfo?.branch || "—"}
                    //     </td>
                    //     <td className="px-6 py-4">
                    //       <span
                    //         className={`text-sm font-bold ${getCGPAColor(student.academicInfo?.cgpa)}`}
                    //       >
                    //         {student.academicInfo?.cgpa || "—"}
                    //       </span>
                    //     </td>
                    //     <td className="px-6 py-4">
                    //       <div className="flex flex-wrap gap-1">
                    //         {student.skills?.slice(0, 3).map((skill, i) => (
                    //           <span
                    //             key={i}
                    //             className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded"
                    //           >
                    //             {skill}
                    //           </span>
                    //         ))}
                    //         {student.skills?.length > 3 && (
                    //           <span className="text-xs text-gray-400">
                    //             +{student.skills.length - 3}
                    //           </span>
                    //         )}
                    //       </div>
                    //     </td>
                    //     <td className="px-6 py-4">
                    //       <span
                    //         className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusBadgeColor(student.placementStatus)}`}
                    //       >
                    //         {student.placementStatus === "placed"
                    //           ? "Placed"
                    //           : "Unplaced"}
                    //       </span>
                    //     </td>
                    //   </tr>
                    // ))

                                        students.map((student, index) => (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors"> {/* was student._id */}
                        <td className="px-6 py-4 text-sm text-gray-500">{(currentPage - 1) * 10 + index + 1}</td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-primary-600">{student.registrationNumber}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-primary-600">{(student.firstName || "?")[0]}</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{student.firstName} {student.lastName}</p>
                              <p className="text-xs text-gray-400">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{student.branch || "—"}</td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-bold ${getCGPAColor(student.cgpa)}`}>{student.cgpa || "—"}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {student.skills?.slice(0, 3).map((skill, i) => (
                              <span key={i} className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">{skill}</span>
                            ))}
                            {student.skills?.length > 3 && (
                              <span className="text-xs text-gray-400">+{student.skills.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusBadgeColor(student.placementStatus)}`}>
                            {student.placementStatus?.toLowerCase() === "placed" ? "Placed" : "Unplaced"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination - smart with limited page numbers */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 px-6 py-4 border-t flex-wrap">
                {/* First page */}
                {currentPage > 3 && (
                  <>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50"
                    >
                      1
                    </button>
                    <span className="text-gray-400 text-sm">...</span>
                  </>
                )}

                {/* Prev button */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  ← Prev
                </button>

                {/* Page numbers - only show 5 at a time */}
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      currentPage === page
                        ? "bg-primary-600 text-white"
                        : "border hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Next button */}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  Next →
                </button>

                {/* Last page */}
                {currentPage < totalPages - 2 && (
                  <>
                    <span className="text-gray-400 text-sm">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageStudents;
