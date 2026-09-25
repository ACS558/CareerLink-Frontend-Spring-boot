import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";
//import socket from "../../socket/socketClient";

const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    emailOrRegNo: "",
    password: "",
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
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      //const { token, user, lastLogin } = response.data;

      const { token, userId, email, role, name, previousLastLogin, roleLevel } = response.data.data;

      console.log("🟢 Login response:", response.data.data);
      //console.log("🕒 Last login from backend:", lastLogin);
      console.log("🕒 Last login from backend:", previousLastLogin);

      //Note: socket connection is handled inside AuthContext.login() itself —
      // no need to call socket.connect() separately here.
      /* console.log("🔌 Connecting to Socket.IO...");
      socket.connect(token); */
      
      //this line added while building the backend on Spring boot. The backend built on node.js and Express.js was sending user object in the response, but the backend built on Spring boot is sending userId, email, role, name and previousLastLogin instead of user object. So we need to create a user object here before calling login() function.
      const user = { userId, email, role, name, roleLevel }; 
      toast.success("Login successful!");
      //login(token, user, lastLogin);
      login(token, user, previousLastLogin);
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-3xl">C</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">CareerLink</h2>
          <p className="mt-2 text-gray-600">
            AI-Powered Campus Placement Portal
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Login to Your Account
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Email or Registration Number</label>
              <input
                type="text"
                name="emailOrRegNo"
                value={formData.emailOrRegNo}
                onChange={handleChange}
                placeholder="student@college.edu or Y22ACS558"
                className="input-field"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Students/Alumni can use email or registration number
              </p>
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Register Links */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600 mb-3">
              Don't have an account? Register as:
            </p>
            <div className="grid grid-cols-3 gap-3">
              <Link
                to="/register/student"
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium text-center"
              >
                Student
              </Link>
              <Link
                to="/register/recruiter"
                className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium text-center"
              >
                Recruiter
              </Link>
              <Link
                to="/register/alumni"
                className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium text-center"
              >
                Alumni
              </Link>
              {/* Admin registration disabled for security reasons
<Link
  to="/register/admin"
  className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium text-center"
>
  Admin
</Link>
*/}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
