import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { authAPI } from "../../services/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) return toast.error("Passwords do not match");
    setLoading(true);
    try {
      await authAPI.resetPassword({ token, newPassword });
      toast.success("Password reset. Please log in.");
      navigate("/login");
    } catch { /* handled by interceptor */ }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Choose a New Password</h3>

        {!token ? (
          <div className="text-center space-y-4">
            <p className="text-gray-700">This reset link is incomplete. Please request a new one.</p>
            <Link to="/forgot-password" className="text-primary-600 hover:underline">Request a new link</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">New password</label>
              <input type="password" className="input-field" value={newPassword}
                     required minLength={6} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div>
              <label className="label">Confirm new password</label>
              <input type="password" className="input-field" value={confirm}
                     required onChange={(e) => setConfirm(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3">
              {loading ? "Saving..." : "Reset password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;