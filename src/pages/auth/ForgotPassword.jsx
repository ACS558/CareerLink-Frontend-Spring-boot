import { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../../services/api";

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // Error toasts come from the axios interceptor, so none are added here.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(identifier);
      setSent(true);
    } catch { /* handled by interceptor */ }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Forgot Password</h3>

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-gray-700">
              If an account exists for <b>{identifier}</b>, we've emailed a password reset link.
              It expires in 30 minutes.
            </p>
            <p className="text-sm text-gray-500">Didn't get it? Check spam, or wait a minute and try again.</p>
            <button onClick={() => setSent(false)} className="text-sm text-primary-600 hover:underline">
              Try again
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-sm text-gray-600 text-center">
              Enter your email or registration number and we'll send you a reset link.
            </p>
            <div>
              <label className="label">Email or Registration Number</label>
              <input className="input-field" value={identifier} required
                     onChange={(e) => setIdentifier(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3">
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="text-primary-600 hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;