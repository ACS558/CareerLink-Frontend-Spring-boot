import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import EmailVerification from "../../components/auth/EmailVerification";
import toast from "react-hot-toast";

const RegisterStudent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    registrationNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailVerified) {
      toast.error("Please verify your email first");
      return;
    }
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
      await authAPI.registerStudent(submitData);

      toast.success("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
  console.error("Registration error:", error);
  if (error.response?.data?.message?.includes("verify your email")) {
    setEmailVerified(false);
  }
} finally {
  setLoading(false);
}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-3xl">C</span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Student Registration</h2>
          <p className="mt-2 text-gray-600">Join CareerLink as a Student</p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <EmailVerification
              email={formData.email}
              onEmailChange={handleChange}
              verified={emailVerified}
              onVerifiedChange={setEmailVerified}
              placeholder="student@college.edu"
            />

            <fieldset disabled={!emailVerified} className="space-y-5 disabled:opacity-50">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Mohammad Ali"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">Registration Number</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="Y22ACS558"
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

              <button type="submit" disabled={loading} className="w-full btn-primary py-3">
                {loading ? "Registering..." : "Register as Student"}
              </button>
            </fieldset>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterStudent;


// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { authAPI } from "../../services/api";
// import toast from "react-hot-toast";

// const RegisterStudent = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     registrationNumber: "",
//     password: "",
//     confirmPassword: "",
//   });
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Validation
//     if (formData.password !== formData.confirmPassword) {
//       toast.error("Passwords do not match");
//       return;
//     }

//     if (formData.password.length < 6) {
//       toast.error("Password must be at least 6 characters");
//       return;
//     }

//     setLoading(true);

//     try {
//       const { confirmPassword, ...submitData } = formData;
//       await authAPI.registerStudent(submitData);

//       toast.success("Registration successful! Please login.");
//       navigate("/login");
//     } catch (error) {
//       console.error("Registration error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <Link to="/login" className="inline-flex justify-center mb-4">
//             <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
//               <span className="text-white font-bold text-3xl">C</span>
//             </div>
//           </Link>
//           <h2 className="text-3xl font-bold text-gray-900">
//             Student Registration
//           </h2>
//           <p className="mt-2 text-gray-600">Join CareerLink as a Student</p>
//         </div>

//         {/* Registration Form */}
//         <div className="bg-white rounded-xl shadow-xl p-8">
//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div>
//               <label className="label">Full Name</label>
//               <input
//                 type="text"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 placeholder="Mohammad Ali"
//                 className="input-field"
//                 required
//               />
//             </div>

//             <div>
//               <label className="label">Email</label>
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 placeholder="student@college.edu"
//                 className="input-field"
//                 required
//               />
//             </div>

//             <div>
//               <label className="label">Registration Number</label>
//               <input
//                 type="text"
//                 name="registrationNumber"
//                 value={formData.registrationNumber}
//                 onChange={handleChange}
//                 placeholder="Y22ACS558"
//                 className="input-field"
//                 required
//               />
//             </div>

//             <div>
//               <label className="label">Password</label>
//               <input
//                 type="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 placeholder="Min. 6 characters"
//                 className="input-field"
//                 required
//               />
//             </div>

//             <div>
//               <label className="label">Confirm Password</label>
//               <input
//                 type="password"
//                 name="confirmPassword"
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 placeholder="Re-enter password"
//                 className="input-field"
//                 required
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full btn-primary py-3"
//             >
//               {loading ? "Registering..." : "Register as Student"}
//             </button>
//           </form>

//           {/* Login Link */}
//           <div className="mt-6 text-center">
//             <p className="text-sm text-gray-600">
//               Already have an account?{" "}
//               <Link
//                 to="/login"
//                 className="text-primary-600 font-medium hover:text-primary-700"
//               >
//                 Login here
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RegisterStudent;
