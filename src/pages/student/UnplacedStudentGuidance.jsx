import { useState } from "react";
import CareerPathGuideModal from "./CareerPathGuideModal";
import ExtensionRequestModal from "../../components/common/ExtensionRequestModal";

const UnplacedStudentGuidance = () => {
  const [showModal, setShowModal] = useState(false);

  const [showGuideModal, setShowGuideModal] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);

  const careerPaths = [
    {
      icon: "🎓",
      title: "Higher Education",
      desc: "Pursue M.Tech, MS, MBA, or PhD for advanced learning",
      pathType: "higher_education",
      gradient: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      icon: "💻",
      title: "Skill Development",
      desc: "Learn new skills through online courses and certifications",
      pathType: "skill_development",
      gradient: "from-purple-500 to-pink-600",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      icon: "🏢",
      title: "Off-Campus Jobs",
      desc: "Apply to companies hiring throughout the year",
      pathType: "off_campus",
      gradient: "from-green-500 to-teal-600",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      icon: "💼",
      title: "Freelancing",
      desc: "Start freelancing or take up internships to gain experience",
      pathType: "freelancing",
      gradient: "from-orange-500 to-red-600",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Animation */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

        <div className="relative flex items-center space-x-4">
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
            <span className="text-5xl">🎯</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Explore Your Career Options
            </h2>
            <p className="text-blue-100 text-lg">
              Many paths lead to success - choose yours
            </p>
          </div>
        </div>
      </div>

      {/* Expiry Warning - Enhanced */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 p-5 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
                        <div>
              <p className="font-bold text-orange-900 text-lg">
                Your account has expired
              </p>
              <p className="text-sm text-orange-700 mt-1">
                Explore your career options below, or request an extension if
                you need more time on the platform
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
          >
            Request Extension
          </button>
        </div>
      </div>

      {/* Career Paths - Enhanced Cards */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg mr-3">
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </span>
          Career Path Options
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {careerPaths.map((path, idx) => (
            <div
              key={idx}
              className="group bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`${path.iconBg} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300`}
                >
                  <span className="text-4xl">{path.icon}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {path.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {path.desc}
                  </p>

                  {/* ✅ Explore Button */}
                  <button
                    onClick={() => {
                      setSelectedPath(path.pathType);
                      setShowGuideModal(true);
                    }}
                    className="flex items-center text-blue-600 font-semibold hover:text-blue-700 transition"
                  >
                    <span>Explore this path</span>
                    <svg
                      className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions - New Section */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <span className="text-2xl mr-2">📥</span>
          Your Data
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <button className="flex items-center space-x-3 px-5 py-4 bg-white hover:bg-blue-50 rounded-xl transition border border-gray-200 hover:border-blue-300 group">
            <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="font-semibold text-gray-700 group-hover:text-blue-600 transition">
              Download Applications History
            </span>
          </button>

          <button className="flex items-center space-x-3 px-5 py-4 bg-white hover:bg-purple-50 rounded-xl transition border border-gray-200 hover:border-purple-300 group">
            <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
            </div>
            <span className="font-semibold text-gray-700 group-hover:text-purple-600 transition">
              Export Profile Data
            </span>
          </button>
        </div>
      </div>

      {/* Extension Modal - Enhanced */}
            {showModal && <ExtensionRequestModal onClose={() => setShowModal(false)} />}
      {/* ✅ Career Path Guide Modal */}
      {showGuideModal && (
        <CareerPathGuideModal
          pathType={selectedPath}
          onClose={() => {
            setShowGuideModal(false);
            setSelectedPath(null);
          }}
        />
      )}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UnplacedStudentGuidance;
