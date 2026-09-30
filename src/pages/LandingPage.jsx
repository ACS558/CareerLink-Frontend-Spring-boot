import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: "🎯",
      title: "Smart Job Matching",
      description:
        "AI-powered ATS scoring matches your profile with the right opportunities",
    },
    {
      icon: "📄",
      title: "Resume Intelligence",
      description:
        "Automatic resume parsing fills your profile instantly with AI",
    },
    {
      icon: "🏢",
      title: "Direct Recruiter Access",
      description: "Connect directly with top companies recruiting on campus",
    },
    {
      icon: "📊",
      title: "Application Tracking",
      description:
        "Track every application status in real-time from one dashboard",
    },
    {
      icon: "🎓",
      title: "Alumni Network",
      description: "Get career advice and mentorship from successful alumni",
    },
    {
      icon: "🔔",
      title: "Instant Notifications",
      description:
        "Never miss an opportunity with real-time job alerts and updates",
    },
  ];

  const stats = [
    { number: "500+", label: "Students Registered" },
    { number: "100+", label: "Companies Hiring" },
    { number: "250+", label: "Jobs Posted" },
    { number: "85%", label: "Placement Rate" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                CareerLink
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                How It Works
              </a>
              <a
                href="#stats"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Stats
              </a>
              <button
                onClick={() => navigate("/login")}
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2 border-t border-gray-200">
              <a
                href="#features"
                className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#stats"
                className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Stats
              </a>
              <button
                onClick={() => navigate("/login")}
                className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/login")}
                className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-block">
                <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
                  AI-Powered Campus Placement Platform
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Your Career
                <br />
                <span className="text-blue-600">Starts Here</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Connect with top companies, track applications, and land your
                dream job with AI-powered resume matching and intelligent career
                guidance.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/login")}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition text-lg font-medium"
                >
                  Get Started Free
                </button>
                <button
                  onClick={() =>
                    document
                      .getElementById("features")
                      .scrollIntoView({ behavior: "smooth" })
                  }
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:border-gray-400 transition text-lg font-medium"
                >
                  Learn More
                </button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-white"></div>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="font-semibold text-gray-900">
                    500+ Students
                  </div>
                  <div>Already registered</div>
                </div>
              </div>
            </div>

            {/* Right Content - Visual */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 shadow-xl">
                {/* Mock Dashboard */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-2xl">👤</span>
                      </div>
                      <div>
                        <div className="font-semibold">Welcome Back!</div>
                        <div className="text-sm text-blue-100">
                          Track your applications
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-xl">
                        <div className="text-3xl font-bold text-blue-600">
                          12
                        </div>
                        <div className="text-sm text-gray-600">
                          Applications
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-xl">
                        <div className="text-3xl font-bold text-green-600">
                          3
                        </div>
                        <div className="text-sm text-gray-600">Shortlisted</div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg">💼</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Software Engineer
                            </div>
                            <div className="text-xs text-gray-500">
                              Google • Applied
                            </div>
                          </div>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          New
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg">🎯</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Product Manager
                            </div>
                            <div className="text-xs text-gray-500">
                              Microsoft • Shortlisted
                            </div>
                          </div>
                        </div>
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                          ✓
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">✨</span>
                  <div>
                    <div className="text-xs text-gray-500">ATS Score</div>
                    <div className="text-lg font-bold text-green-600">92%</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🔔</span>
                  <div>
                    <div className="text-xs text-gray-500">New Jobs</div>
                    <div className="text-lg font-bold text-blue-600">15</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to streamline your campus placement
              journey from start to finish
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-20 bg-gradient-to-br from-blue-50 to-white px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes and land your dream job
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Your Profile",
                description:
                  "Upload your resume and fill your profile with skills, projects, and experience",
              },
              {
                step: "02",
                title: "Browse & Apply",
                description:
                  "Explore job opportunities with AI-powered matching. See your ATS score before applying",
              },
              {
                step: "03",
                title: "Track & Succeed",
                description:
                  "Monitor all applications in one place. Get real-time updates and connect with recruiters",
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                {index < 2 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent -translate-x-8"></div>
                )}
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                  <div className="text-6xl font-bold text-blue-100 mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-12 text-center text-white shadow-2xl">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Start Your Career Journey?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of students who have successfully landed their dream
              jobs through CareerLink
            </p>
            <button
              onClick={() => navigate("/login")}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition text-lg font-semibold shadow-lg"
            >
              Get Started Now - It's Free
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">C</span>
                </div>
                <span className="text-xl font-bold">CareerLink</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered campus placement platform connecting students with
                their dream careers.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#features" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:text-white transition"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#stats" className="hover:text-white transition">
                    Statistics
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    FAQs
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 CareerLink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
