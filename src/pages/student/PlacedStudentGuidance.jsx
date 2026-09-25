import { useState } from "react";
import { studentAPI } from "../../services/api";
import toast from "react-hot-toast";

const PlacedStudentGuidance = ({ daysLeft, student }) => {
  const [isExporting, setIsExporting] = useState(false);
  const placements =
    student.placements?.length > 0
      ? student.placements
      : student.placedCompany
        ? [
            {
              company: student.placedCompany,
              //package: student.package,
              package: student.placedPackage,
              status: "accepted",
              isPrimary: true,
            },
          ]
        : [];

  // ✅ FIX: Define sortedPlacements BEFORE using it
  const sortedPlacements = [...placements].sort((a, b) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    return (b.package || 0) - (a.package || 0);
  });
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      await studentAPI.trackDownload("Placement Journey Data");
      toast.success("Data export will be available soon!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  const successTips = [
    {
      icon: "💡",
      title: "Be Curious & Ask Questions",
      desc: "Don't hesitate to seek help from senior team members",
      color: "blue",
    },
    {
      icon: "📝",
      title: "Document Your Learnings",
      desc: "Keep notes of new concepts and best practices",
      color: "purple",
    },
    {
      icon: "🤝",
      title: "Build Relationships",
      desc: "Network with colleagues across different teams",
      color: "green",
    },
    {
      icon: "🎯",
      title: "Set Clear Goals",
      desc: "Define what you want to achieve in your first 90 days",
      color: "orange",
    },
  ];

  const colorVariants = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "bg-blue-100",
      text: "text-blue-600",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      icon: "bg-purple-100",
      text: "text-purple-600",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "bg-green-100",
      text: "text-green-600",
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      icon: "bg-orange-100",
      text: "text-orange-600",
    },
  };

  return (
    <div className="space-y-6">
      {/* Congratulations Header */}
      <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -ml-32 -mb-32"></div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 text-yellow-300 opacity-60 text-2xl animate-bounce">
            🎊
          </div>
          <div className="absolute top-20 right-20 text-yellow-200 opacity-60 text-3xl animate-pulse">
            ✨
          </div>
          <div className="absolute bottom-10 left-20 text-yellow-400 opacity-60 text-xl animate-bounce delay-100">
            🎉
          </div>
          <div className="absolute bottom-20 right-10 text-yellow-300 opacity-60 text-2xl animate-pulse delay-200">
            ⭐
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-white/20 p-5 rounded-3xl backdrop-blur-sm animate-bounce-slow">
              <span className="text-6xl">🎉</span>
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-2">Congratulations!</h2>
              <p className="text-green-100 text-lg">
                {sortedPlacements.length > 1
                  ? `You've received ${sortedPlacements.length} job offers!`
                  : "You've been placed successfully - Your career journey begins!"}
              </p>
            </div>
          </div>

          {/* ✅ MULTIPLE PLACEMENTS DISPLAY */}
          {sortedPlacements.length > 0 && (
            <div className="space-y-4">
              {sortedPlacements.map((placement, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <span className="text-2xl">
                          {placement.isPrimary ? "🏆" : "🌟"}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-green-200 block mb-1">
                          {placement.isPrimary
                            ? "Primary Offer"
                            : `Offer ${index + 1}`}
                        </span>
                        {placement.jobTitle && (
                          <span className="text-xs text-green-300">
                            {placement.jobTitle}
                          </span>
                        )}
                      </div>
                    </div>
                    {placement.status && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          //placement.status === "accepted"
                          placement.status?.toLowerCase() === "accepted"
                            ? "bg-green-500/30 text-green-100"
                            //: placement.status === "declined"
                            : placement.status?.toLowerCase() === "declined"
                              ? "bg-red-500/30 text-red-100"
                              : "bg-yellow-500/30 text-yellow-100"
                        }`}
                      >
                        {placement.status.charAt(0).toUpperCase() +
                          placement.status.slice(1)}
                      </span>
                    )}
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <svg
                          className="w-5 h-5 text-green-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        <div className="text-sm text-green-200 font-medium">
                          Company
                        </div>
                      </div>
                      <div className="text-2xl font-bold">
                        {placement.company}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <svg
                          className="w-5 h-5 text-green-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div className="text-sm text-green-200 font-medium">
                          Package
                        </div>
                      </div>
                      <div className="text-2xl font-bold">
                        ₹{placement.packageOffered || placement.package} LPA
                      </div>
                    </div>

                    {placement.offerDate && (
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <svg
                            className="w-5 h-5 text-green-200"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <div className="text-sm text-green-200 font-medium">
                            Offer Date
                          </div>
                        </div>
                        <div className="text-lg font-semibold">
                          {new Date(placement.offerDate).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expiry Warning - Softer for Placed Students */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-5 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-3 rounded-full">
            <svg
              className="w-6 h-6 text-blue-600"
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
          </div>
          <div>
            <p className="font-semibold text-blue-900 text-lg">
              Account expires in {daysLeft} day{daysLeft !== 1 ? "s" : ""}
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Download your placement journey data before your account closes
            </p>
          </div>
        </div>
      </div>

      {/* Export Data Section - Enhanced */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-3 rounded-xl">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Export Your Journey
            </h3>
            <p className="text-gray-600">
              Download your complete placement data
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl p-6 mb-6 border border-gray-200">
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Applications history</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Profile information</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Resume and documents</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Placement details</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleExportData}
          disabled={isExporting}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isExporting ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
              <span>Download All Data</span>
            </>
          )}
        </button>
      </div>

      {/* Success Tips - Enhanced Cards */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-green-500 to-teal-500 p-3 rounded-xl">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Tips for Success
            </h3>
            <p className="text-gray-600">
              Make the most of your new opportunity
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {successTips.map((tip, idx) => {
            const colors = colorVariants[tip.color];
            return (
              <div
                key={idx}
                className={`${colors.bg} border-2 ${colors.border} rounded-xl p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`${colors.icon} p-3 rounded-xl flex-shrink-0`}
                  >
                    <span className="text-3xl">{tip.icon}</span>
                  </div>
                  <div>
                    <h4 className={`font-bold text-lg ${colors.text} mb-2`}>
                      {tip.title}
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white text-center shadow-xl">
        <svg
          className="w-12 h-12 mx-auto mb-4 opacity-50"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
        <p className="text-2xl font-bold mb-2">
          "The future belongs to those who believe in the beauty of their
          dreams"
        </p>
        <p className="text-indigo-200">
          Congratulations on taking this important step in your career journey!
          🚀
        </p>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
};

export default PlacedStudentGuidance;
