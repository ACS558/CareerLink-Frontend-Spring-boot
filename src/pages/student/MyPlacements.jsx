import { useState, useEffect } from "react";
import { studentAPI } from "../../services/api";
import toast from "react-hot-toast";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";

const MyPlacements = () => {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlacements();
  }, []);

  const fetchPlacements = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getPlacements();
      console.log("Placements response:", response.data); 
      //setPlacements(response.data.placements || []);
      setPlacements(response.data.data || []);
    } catch (error) {
      console.error("Fetch placements error:", error);
      toast.error("Failed to load placements");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              My Placements 🏆
            </h1>
            <p className="text-gray-600 mt-1">
              Track all your job offers • Placements are automatically created
              when you're selected
            </p>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
            <div className="flex items-start space-x-3">
              <svg
                className="w-6 h-6 text-blue-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="text-blue-900 font-semibold">How it works</h3>
                <p className="text-blue-700 text-sm mt-1">
                  When a company selects you through the platform, a placement
                  record is automatically created here. These are your official
                  placement records.
                </p>
              </div>
            </div>
          </div>

          {/* Placements List */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : placements.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-500 text-lg mb-2">No placements yet</p>
              <p className="text-gray-400 text-sm mb-4">
                Apply to jobs and placements will appear here when companies
                select you
              </p>
              <button
                onClick={() => (window.location.href = "/student/jobs")}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Browse Jobs →
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {placements.map((placement, index) => (
                <div
                  //key={placement._id || index}
                  key={placement.id || index}
                  className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-200 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <span className="text-3xl">🏢</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-2xl font-bold text-gray-900">
                              {placement.company}
                            </h3>
                            {/* Show "From Application" badge */}
                            {/* {placement.metadata?.applicationId && ( */}
                           { placement.relatedApplicationId && (
                              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">
                                From Application
                              </span>
                            )}
                          </div>
                          {placement.jobTitle && (
                            <p className="text-gray-600 mt-1 text-lg">
                              {placement.jobTitle}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* ✅ ONLY Package and Offer Date - NO STATUS */}
                      <div className="grid md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Package</p>
                          <p className="text-2xl font-bold text-gray-900">
                           // ₹{placement.package} LPA
                            ₹{placement.packageOffered} LPA
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Offer Date
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {new Date(placement.offerDate).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Joining Date (if available) */}
                      {placement.joiningDate && (
                        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-700">
                            <strong>Expected Joining:</strong>{" "}
                            {new Date(placement.joiningDate).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {placements.length > 0 && (
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Total Placements
                  </h3>
                  <p className="text-gray-600 text-sm">
                    You have received {placements.length} placement offer
                    {placements.length > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-blue-600">
                    {placements.length}
                  </p>
                  <p className="text-sm text-gray-600">
                    Offer{placements.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPlacements;
