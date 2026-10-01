import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";

const RegisterRecruiter = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    industry: "",
    website: "",
    companySize: "",
    location: "",
    description: "",
    contactPersonName: "",
    contactPersonDesignation: "",
    contactPersonPhone: "",
    contactPersonEmail: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...submitData } = formData;
      await authAPI.registerRecruiter(submitData);

      toast.success("Registration successful! Awaiting admin verification.");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  }; */


    const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        industry: formData.industry,
        website: formData.website,
        companySize: formData.companySize,
        location: formData.location,
          description: formData.description,
        contactName: formData.contactPersonName,
        contactDesignation: formData.contactPersonDesignation,
        contactPhone: formData.contactPersonPhone,
        contactEmail: formData.contactPersonEmail,
      };
      await authAPI.registerRecruiter(submitData);

      toast.success("Registration successful! Awaiting admin verification.");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-3xl">C</span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">
            Recruiter Registration
          </h2>
          <p className="mt-2 text-gray-600">
            Register your company on CareerLink
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="recruiter@company.com"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="input-field"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Company Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Company Name *</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="TechCorp Inc."
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Industry *</label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="Information Technology"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://company.com"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Company Size</label>
                  <select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-100">51-100 employees</option>
                    <option value="101-500">101-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="label">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Bangalore, India"
                    className="input-field"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Company Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tell us about your company..."
                    className="input-field"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            {/* Contact Person */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Person Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Name *</label>
                  <input
                    type="text"
                    name="contactPersonName"
                    value={formData.contactPersonName}
                    onChange={handleChange}
                    placeholder="John Manager"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Designation *</label>
                  <input
                    type="text"
                    name="contactPersonDesignation"
                    value={formData.contactPersonDesignation}
                    onChange={handleChange}
                    placeholder="HR Manager"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Phone *</label>
                  <input
                    type="tel"
                    name="contactPersonPhone"
                    value={formData.contactPersonPhone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input
                    type="email"
                    name="contactPersonEmail"
                    value={formData.contactPersonEmail}
                    onChange={handleChange}
                    placeholder="john@company.com"
                    className="input-field"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3"
            >
              {loading ? "Registering..." : "Register as Recruiter"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary-600 font-medium hover:text-primary-700"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterRecruiter;
