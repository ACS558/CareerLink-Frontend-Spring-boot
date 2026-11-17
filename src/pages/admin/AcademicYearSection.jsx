import { useEffect, useState } from "react";
import { adminAPI } from "../../services/api";
import { getStatusBadgeColor, getCGPAColor } from "../../utils/helpers";

const PAGE_SIZE = 10;

const AcademicYearSection = ({ year, label, count, isOpen, onToggle, filters, refreshKey, onExtend }) => {
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetch only while the banner is open; collapsed banners cost nothing.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const params = { page: page - 1, size: PAGE_SIZE, academicYear: year };
        if (filters.search) params.search = filters.search;
        if (filters.branch) params.branch = filters.branch;
        if (filters.placementStatus) params.placementStatus = filters.placementStatus;

        const res = await adminAPI.getAllStudents(params);
        if (cancelled) return;
        const data = res.data.data;
        setStudents(data.content);
        setTotalPages(Math.max(data.totalPages, 1));
      } catch (error) {
        console.error("Fetch students error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, page, year, filters, refreshKey]);

  return (
    <section className="bg-white rounded-lg shadow-md overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(year)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition text-left"
      >
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🎓</span>
          <h2 className="text-lg font-bold text-gray-900">{label}</h2>
          <span className="text-xs font-semibold bg-primary-100 text-primary-700 px-3 py-1 rounded-full">
            {count} student{count !== 1 ? "s" : ""}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-gray-200">
          {loading && students.length === 0 ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white border-b">
                    <tr>
                      {["#", "Reg No", "Name", "Branch", "CGPA", "Skills", "Placement", "Account", "Expiry", "Action"].map(
                        (h) => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {students.map((student, index) => {
                      const fullName = [student.firstName, student.lastName].filter(Boolean).join(" ");
                      return (
                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-500">{(page - 1) * PAGE_SIZE + index + 1}</td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-primary-600">{student.registrationNumber}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-primary-600">
                                  {(student.firstName || student.registrationNumber || "?")[0]}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {fullName || <span className="italic text-gray-400">Profile incomplete</span>}
                                </p>
                                <p className="text-xs text-gray-400">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{student.branch || "—"}</td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-bold ${getCGPAColor(student.cgpa)}`}>
                              {student.cgpa ?? "—"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {student.skills?.slice(0, 3).map((skill, i) => (
                                <span key={i} className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                                  {skill}
                                </span>
                              ))}
                              {student.skills?.length > 3 && (
                                <span className="text-xs text-gray-400">+{student.skills.length - 3}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusBadgeColor(student.placementStatus)}`}
                            >
                              {student.placementStatus?.toLowerCase() === "placed" ? "Placed" : "Unplaced"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusBadgeColor(student.accountStatus)}`}
                            >
                              {student.accountStatus?.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {student.expiryDate ? new Date(student.expiryDate).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => onExtend(student)}
                              className="text-primary-600 hover:underline text-sm font-medium"
                            >
                              Extend
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-3 border-t bg-gray-50">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="px-4 py-1 text-sm border rounded-lg bg-white disabled:opacity-40"
                  >
                    ← Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="px-4 py-1 text-sm border rounded-lg bg-white disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
};

export default AcademicYearSection;