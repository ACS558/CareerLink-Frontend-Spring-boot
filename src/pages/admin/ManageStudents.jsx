import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminAPI } from "../../services/api";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import AcademicYearSection from "../../components/admin/AcademicYearSection";

const BRANCHES = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"];

const ManageStudents = () => {
  // what the admin is typing/selecting
  const [searchInput, setSearchInput] = useState("");
  const [branch, setBranch] = useState("");
  const [placementStatus, setPlacementStatus] = useState("");
  // what is actually applied (search is debounced)
  const [filters, setFilters] = useState({ search: "", branch: "", placementStatus: "" });

  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openYears, setOpenYears] = useState(new Set());
  const [refreshKey, setRefreshKey] = useState(0);

  const [studentToExtend, setStudentToExtend] = useState(null);
  const [extendDays, setExtendDays] = useState(30);
  const [extending, setExtending] = useState(false);

  // Debounce the filter inputs so we don't query on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = { search: searchInput.trim(), branch, placementStatus };
      setFilters((prev) =>
        prev.search === next.search && prev.branch === next.branch && prev.placementStatus === next.placementStatus
          ? prev
          : next,
      );
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, branch, placementStatus]);

  // Load the academic-year banners (with counts) whenever filters change.
  useEffect(() => {
    let cancelled = false;
    const loadYears = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.branch) params.branch = filters.branch;
        if (filters.placementStatus) params.placementStatus = filters.placementStatus;
        const res = await adminAPI.getStudentAcademicYears(params);
        if (!cancelled) setYears(res.data.data);
      } catch (error) {
        console.error("Fetch academic years error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadYears();
    return () => {
      cancelled = true;
    };
  }, [filters]);

  const toggleYear = useCallback((year) => {
    setOpenYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  }, []);

  const handleExtend = async () => {
    if (!studentToExtend) return;
    if (!extendDays || Number(extendDays) < 1) {
      toast.error("Enter a valid number of days");
      return;
    }
    setExtending(true);
    try {
      await adminAPI.extendStudent(studentToExtend.id, Number(extendDays));
      toast.success(`Account extended by ${extendDays} days`);
      setStudentToExtend(null);
      setExtendDays(30);
      setRefreshKey((k) => k + 1); // open banners reload in place
    } catch (error) {
      console.error("Extend error:", error);
      toast.error(error.response?.data?.message || "Failed to extend account");
    } finally {
      setExtending(false);
    }
  };

  const totalStudents = years.reduce((sum, y) => sum + y.studentCount, 0);
  const filterKey = `${filters.search}|${filters.branch}|${filters.placementStatus}`;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Manage Students 👥</h1>
            <p className="text-gray-600">View, search, and filter students grouped by academic year</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="input-field"
                placeholder="🔍 Search by name or registration number..."
              />
              <select value={branch} onChange={(e) => setBranch(e.target.value)} className="input-field">
                <option value="">All Branches</option>
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <select
                value={placementStatus}
                onChange={(e) => setPlacementStatus(e.target.value)}
                className="input-field"
              >
                <option value="">All Status</option>
                <option value="placed">Placed</option>
                <option value="unplaced">Unplaced</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{totalStudents}</span> student{totalStudents !== 1 ? "s" : ""} across{" "}
              <span className="font-semibold">{years.length}</span> academic year{years.length !== 1 ? "s" : ""}
            </p>
            {years.length > 0 && (
              <div className="space-x-4 text-sm">
                <button
                  onClick={() => setOpenYears(new Set(years.map((y) => y.academicYear)))}
                  className="text-primary-600 hover:underline"
                >
                  Expand all
                </button>
                <button onClick={() => setOpenYears(new Set())} className="text-primary-600 hover:underline">
                  Collapse all
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          ) : years.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">No students found</div>
          ) : (
            <div className="space-y-4">
              {years.map((y) => (
                <AcademicYearSection
                  key={`${y.academicYear}|${filterKey}`}
                  year={y.academicYear}
                  label={y.label}
                  count={y.studentCount}
                  isOpen={openYears.has(y.academicYear)}
                  onToggle={toggleYear}
                  filters={filters}
                  refreshKey={refreshKey}
                  onExtend={setStudentToExtend}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {studentToExtend && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Extend Account</h2>
            <div className="mb-4 bg-gray-50 p-4 rounded-lg">
              <p className="font-bold text-gray-900">
                {[studentToExtend.firstName, studentToExtend.lastName].filter(Boolean).join(" ") ||
                  studentToExtend.registrationNumber}
              </p>
              <p className="text-sm text-gray-600">{studentToExtend.registrationNumber}</p>
              <p className="text-sm text-gray-500 mt-1">
                Current status: {studentToExtend.accountStatus?.replace(/_/g, " ")}
              </p>
            </div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Extend by (days)</label>
            <input
              type="number"
              min="1"
              value={extendDays}
              onChange={(e) => setExtendDays(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 mb-6"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setStudentToExtend(null)}
                disabled={extending}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExtend}
                disabled={extending}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold disabled:opacity-50"
              >
                {extending ? "Extending..." : "Extend Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;




// import { useState, useEffect } from "react";
// import { adminAPI } from "../../services/api";
// import { getStatusBadgeColor, getCGPAColor } from "../../utils/helpers";
// import Navbar from "../../components/common/Navbar";
// import Sidebar from "../../components/common/Sidebar";

// const ManageStudents = () => {
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [branch, setBranch] = useState("");
//   const [placementStatus, setPlacementStatus] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalStudents, setTotalStudents] = useState(0);
//     const [showExtendModal, setShowExtendModal] = useState(false);
//   const [studentToExtend, setStudentToExtend] = useState(null);
//   const [extendDays, setExtendDays] = useState(30);
//   const [extending, setExtending] = useState(false);

//   useEffect(() => {
//     fetchStudents();
//   }, [search, branch, placementStatus, currentPage]);

//   const fetchStudents = async () => {
//     setLoading(true);
//     try {
//       //const params = { page: currentPage, limit: 10 };
//        const params = { page: currentPage - 1, size: 10 };
//       if (search) params.search = search;
//       if (branch) params.branch = branch;
//       if (placementStatus) params.placementStatus = placementStatus;
//       const res = await adminAPI.getAllStudents(params);
//       const page = res.data.data; // Spring's Page<T> wrapper
//       // setStudents(res.data.students);
//       // setTotalPages(res.data.totalPages);
//       // setTotalStudents(res.data.totalStudents);
//       setStudents(page.content); 
//       setTotalPages(page.totalPages); 
//       setTotalStudents(page.totalElements); 
//     } catch (error) {
//       console.error("Fetch error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//     const handleExtend = async () => {
//     if (!studentToExtend) return;
//     setExtending(true);
//     try {
//       await adminAPI.extendStudent(studentToExtend.id, Number(extendDays));
//       toast.success(`Account extended by ${extendDays} days`);
//       setShowExtendModal(false);
//       setStudentToExtend(null);
//       setExtendDays(30);
//       fetchStudents();
//     } catch (error) {
//       console.error("Extend error:", error);
//       toast.error(error.response?.data?.message || "Failed to extend account");
//     } finally {
//       setExtending(false);
//     }
//   };

//   const handleSearchChange = (e) => {
//     setSearch(e.target.value);
//     setCurrentPage(1);
//   };
//   const handleBranchChange = (e) => {
//     setBranch(e.target.value);
//     setCurrentPage(1);
//   };
//   const handleStatusChange = (e) => {
//     setPlacementStatus(e.target.value);
//     setCurrentPage(1);
//   };

//   // Pagination helper - show limited page numbers
//   const getPageNumbers = () => {
//     const pages = [];
//     const maxVisible = 5;
//     let start = Math.max(1, currentPage - 2);
//     let end = Math.min(totalPages, start + maxVisible - 1);
//     if (end - start < maxVisible - 1) {
//       start = Math.max(1, end - maxVisible + 1);
//     }
//     for (let i = start; i <= end; i++) {
//       pages.push(i);
//     }
//     return pages;
//   };

//   return (
//     <div className="h-screen flex flex-col bg-gray-100">
//       {/* Full width Navbar */}
//       <div className="flex-shrink-0">
//         <Navbar />
//       </div>

//       {/* Sidebar + Content */}
//       <div className="flex flex-1 overflow-hidden">
//         {/* Sidebar */}
//         <div className="w-64 flex-shrink-0 overflow-y-auto bg-white shadow-md">
//           <Sidebar />
//         </div>

//         {/* Main Content */}
//         <main className="flex-1 overflow-y-auto p-8">
//           <div className="mb-6">
//             <h1 className="text-2xl font-bold text-gray-900">
//               Manage Students 👥
//             </h1>
//             <p className="text-gray-600">
//               View, search, and filter all registered students
//             </p>
//           </div>

//           {/* Filters Row */}
//           <div className="bg-white rounded-lg shadow-md p-4 mb-6">
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//               <div className="md:col-span-2">
//                 <input
//                   type="text"
//                   className="input-field"
//                   placeholder="🔍 Search by name or registration number..."
//                   value={search}
//                   onChange={handleSearchChange}
//                 />
//               </div>
//               <div>
//                 <select
//                   className="input-field"
//                   value={branch}
//                   onChange={handleBranchChange}
//                 >
//                   <option value="">All Branches</option>
//                   <option value="CSE">CSE</option>
//                   <option value="IT">IT</option>
//                   <option value="ECE">ECE</option>
//                   <option value="EEE">EEE</option>
//                   <option value="Mechanical">Mechanical</option>
//                   <option value="Civil">Civil</option>
//                 </select>
//               </div>
//               <div>
//                 <select
//                   className="input-field"
//                   value={placementStatus}
//                   onChange={handleStatusChange}
//                 >
//                   <option value="">All Status</option>
//                   <option value="placed">Placed</option>
//                   <option value="unplaced">Unplaced</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Results Count */}
//           <div className="flex items-center justify-between mb-4">
//             <p className="text-sm text-gray-500">
//               Showing <span className="font-semibold">{students.length}</span>{" "}
//               of <span className="font-semibold">{totalStudents}</span> students
//             </p>
//             <p className="text-sm text-gray-500">
//               Page {currentPage} of {totalPages}
//             </p>
//           </div>

//           {/* Students Table */}
//           <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="bg-gray-50 border-b border-gray-200">
//                     <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                       #
//                     </th>
//                     <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                       Reg No
//                     </th>
//                     <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                       Name
//                     </th>
//                     <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                       Branch
//                     </th>
//                     <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                       CGPA
//                     </th>
//                     <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                       Skills
//                     </th>
//                     <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                       Status
//                     </th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Account Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Expiry</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   {loading ? (
//                     <tr>
//                       <td colSpan="7" className="text-center py-10">
//                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
//                       </td>
//                     </tr>
//                   ) : students.length === 0 ? (
//                     <tr>
//                       <td
//                         colSpan="7"
//                         className="text-center py-10 text-gray-400"
//                       >
//                         No students found
//                       </td>
//                     </tr>
//                   ) : (
//                     // students.map((student, index) => (
//                     //   <tr
//                     //     key={student._id}
//                     //     className="hover:bg-gray-50 transition-colors"
//                     //   >
//                     //     <td className="px-6 py-4 text-sm text-gray-500">
//                     //       {(currentPage - 1) * 10 + index + 1}
//                     //     </td>
//                     //     <td className="px-6 py-4">
//                     //       <span className="text-sm font-bold text-primary-600">
//                     //         {student.registrationNumber}
//                     //       </span>
//                     //     </td>
//                     //     <td className="px-6 py-4">
//                     //       <div className="flex items-center space-x-3">
//                     //         <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
//                     //           <span className="text-sm font-bold text-primary-600">
//                     //             {(student.personalInfo?.firstName || "?")[0]}
//                     //           </span>
//                     //         </div>
//                     //         <div>
//                     //           <p className="text-sm font-semibold text-gray-900">
//                     //             {student.personalInfo?.firstName}{" "}
//                     //             {student.personalInfo?.lastName}
//                     //           </p>
//                     //           <p className="text-xs text-gray-400">
//                     //             {student.userId?.email}
//                     //           </p>
//                     //         </div>
//                     //       </div>
//                     //     </td>
//                     //     <td className="px-6 py-4 text-sm text-gray-700">
//                     //       {student.academicInfo?.branch || "—"}
//                     //     </td>
//                     //     <td className="px-6 py-4">
//                     //       <span
//                     //         className={`text-sm font-bold ${getCGPAColor(student.academicInfo?.cgpa)}`}
//                     //       >
//                     //         {student.academicInfo?.cgpa || "—"}
//                     //       </span>
//                     //     </td>
//                     //     <td className="px-6 py-4">
//                     //       <div className="flex flex-wrap gap-1">
//                     //         {student.skills?.slice(0, 3).map((skill, i) => (
//                     //           <span
//                     //             key={i}
//                     //             className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded"
//                     //           >
//                     //             {skill}
//                     //           </span>
//                     //         ))}
//                     //         {student.skills?.length > 3 && (
//                     //           <span className="text-xs text-gray-400">
//                     //             +{student.skills.length - 3}
//                     //           </span>
//                     //         )}
//                     //       </div>
//                     //     </td>
//                     //     <td className="px-6 py-4">
//                     //       <span
//                     //         className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusBadgeColor(student.placementStatus)}`}
//                     //       >
//                     //         {student.placementStatus === "placed"
//                     //           ? "Placed"
//                     //           : "Unplaced"}
//                     //       </span>
//                     //     </td>
//                     //   </tr>
//                     // ))

//                       students.map((student, index) => (
//                       <tr key={student.id} className="hover:bg-gray-50 transition-colors"> {/* was student._id */}
//                         <td className="px-6 py-4 text-sm text-gray-500">{(currentPage - 1) * 10 + index + 1}</td>
//                         <td className="px-6 py-4">
//                           <span className="text-sm font-bold text-primary-600">{student.registrationNumber}</span>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="flex items-center space-x-3">
//                             <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
//                               <span className="text-sm font-bold text-primary-600">{(student.firstName || "?")[0]}</span>
//                             </div>
//                             <div>
//                               <p className="text-sm font-semibold text-gray-900">{student.firstName} {student.lastName}</p>
//                               <p className="text-xs text-gray-400">{student.email}</p>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 text-sm text-gray-700">{student.branch || "—"}</td>
//                         <td className="px-6 py-4">
//                           <span className={`text-sm font-bold ${getCGPAColor(student.cgpa)}`}>{student.cgpa || "—"}</span>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="flex flex-wrap gap-1">
//                             {student.skills?.slice(0, 3).map((skill, i) => (
//                               <span key={i} className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">{skill}</span>
//                             ))}
//                             {student.skills?.length > 3 && (
//                               <span className="text-xs text-gray-400">+{student.skills.length - 3}</span>
//                             )}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusBadgeColor(student.placementStatus)}`}>
//                             {student.placementStatus?.toLowerCase() === "placed" ? "Placed" : "Unplaced"}
//                           </span>
//                         </td>
//                                                 <td className="px-6 py-4">
//                           <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusBadgeColor(student.accountStatus)}`}>
//                             {student.accountStatus?.replace(/_/g, " ")}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 text-sm text-gray-500">
//                           {student.expiryDate ? new Date(student.expiryDate).toLocaleDateString() : "—"}
//                         </td>
//                         <td className="px-6 py-4">
//                           <button
//                             onClick={() => { setStudentToExtend(student); setShowExtendModal(true); }}
//                             className="text-primary-600 hover:underline text-sm font-medium"
//                           >
//                             Extend
//                           </button>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                   {showExtendModal && studentToExtend && (
//         <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
//             <h2 className="text-2xl font-bold text-gray-900 mb-4">Extend Account</h2>
//             <div className="mb-4 bg-gray-50 p-4 rounded-lg">
//               <p className="font-bold text-gray-900">{studentToExtend.firstName} {studentToExtend.lastName}</p>
//               <p className="text-sm text-gray-600">{studentToExtend.registrationNumber}</p>
//               <p className="text-sm text-gray-500 mt-1">
//                 Current status: {studentToExtend.accountStatus?.replace(/_/g, " ")}
//               </p>
//             </div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">Extend by (days)</label>
//             <input
//               type="number"
//               min="1"
//               value={extendDays}
//               onChange={(e) => setExtendDays(e.target.value)}
//               className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 mb-6"
//             />
//             <div className="flex space-x-3">
//               <button
//                 onClick={() => { setShowExtendModal(false); setStudentToExtend(null); }}
//                 disabled={extending}
//                 className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold disabled:opacity-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleExtend}
//                 disabled={extending}
//                 className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold disabled:opacity-50"
//               >
//                 {extending ? "Extending..." : "Extend Account"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination - smart with limited page numbers */}
//             {totalPages > 1 && (
//               <div className="flex items-center justify-center gap-1 px-6 py-4 border-t flex-wrap">
//                 {/* First page */}
//                 {currentPage > 3 && (
//                   <>
//                     <button
//                       onClick={() => setCurrentPage(1)}
//                       className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50"
//                     >
//                       1
//                     </button>
//                     <span className="text-gray-400 text-sm">...</span>
//                   </>
//                 )}

//                 {/* Prev button */}
//                 <button
//                   onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                   disabled={currentPage === 1}
//                   className="px-3 py-1 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
//                 >
//                   ← Prev
//                 </button>

//                 {/* Page numbers - only show 5 at a time */}
//                 {getPageNumbers().map((page) => (
//                   <button
//                     key={page}
//                     onClick={() => setCurrentPage(page)}
//                     className={`px-3 py-1 rounded-lg text-sm ${
//                       currentPage === page
//                         ? "bg-primary-600 text-white"
//                         : "border hover:bg-gray-50"
//                     }`}
//                   >
//                     {page}
//                   </button>
//                 ))}

//                 {/* Next button */}
//                 <button
//                   onClick={() =>
//                     setCurrentPage((p) => Math.min(totalPages, p + 1))
//                   }
//                   disabled={currentPage === totalPages}
//                   className="px-3 py-1 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
//                 >
//                   Next →
//                 </button>

//                 {/* Last page */}
//                 {currentPage < totalPages - 2 && (
//                   <>
//                     <span className="text-gray-400 text-sm">...</span>
//                     <button
//                       onClick={() => setCurrentPage(totalPages)}
//                       className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50"
//                     >
//                       {totalPages}
//                     </button>
//                   </>
//                 )}
//               </div>
//             )}
                  
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default ManageStudents;
