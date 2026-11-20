import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";
import EmailVerification from "../../components/auth/EmailVerification";

const RegisterAlumni = () => {
  const navigate = useNavigate();
  const [emailVerified, setEmailVerified] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    registrationNumber: "",
    branch: "",
    graduationYear: "",
    currentCompany: "",
    currentRole: "",
    experience: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailVerified) { toast.error("Please verify your email first"); return; }


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
      await authAPI.registerAlumni(submitData);

      toast.success("Registration successful! Awaiting admin verification.");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex justify-center mb-4">
            <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-3xl">C</span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">
            Alumni Registration
          </h2>
          <p className="mt-2 text-gray-600">Join CareerLink as an Alumni</p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

                  <EmailVerification
              email={formData.email}
              onEmailChange={handleChange}
              verified={emailVerified}
              onVerifiedChange={setEmailVerified}
              placeholder="alumni@gmail.com"
            />
            
              <fieldset
              disabled={!emailVerified}
              className="space-y-5 min-w-0 disabled:opacity-50"
            >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Arjun Kumar"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="alumni@gmail.com"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">Registration Number *</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="Y20ACS234"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">Branch *</label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Select Branch</option>
                  <option value="Computer Science Engineering">CSE</option>
                  <option value="Information Technology">IT</option>
                  <option value="Electronics and Communication">ECE</option>
                  <option value="Electrical Engineering">EEE</option>
                  <option value="Mechanical Engineering">Mechanical</option>
                  <option value="Civil Engineering">Civil</option>
                </select>
              </div>

              <div>
                <label className="label">Graduation Year *</label>
                <input
                  type="number"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  placeholder="2024"
                  className="input-field"
                  required
                  min="2000"
                  max="2030"
                />
              </div>

              <div>
                <label className="label">Current Company</label>
                <input
                  type="text"
                  name="currentCompany"
                  value={formData.currentCompany}
                  onChange={handleChange}
                  placeholder="Google India"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Current Role</label>
                <input
                  type="text"
                  name="currentRole"
                  value={formData.currentRole}
                  onChange={handleChange}
                  placeholder="Software Engineer"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Years of Experience</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="2"
                  className="input-field"
                  min="0"
                  max="50"
                />
              </div>

              <div>
                <label className="label">Password *</label>
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
                <label className="label">Confirm Password *</label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3"
            >
              {loading ? "Registering..." : "Register as Alumni"}
            </button>
            </fieldset>
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

export default RegisterAlumni;
