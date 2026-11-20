import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { authAPI } from "../../services/api";

const EmailVerification = ({ email, onEmailChange, verified, onVerifiedChange, placeholder }) => {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const reset = () => {
    setOtpSent(false);
    setOtp("");
    setCooldown(0);
    onVerifiedChange(false);
  };

  const handleChange = (e) => {
    onEmailChange(e);
    reset();
  };

  // Error toasts come from the axios interceptor, so only success is toasted here.
  const sendOtp = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }
    setSending(true);
    try {
      await authAPI.sendRegisterOtp(email);
      toast.success("Code sent. Check your inbox (and spam folder).");
      setOtpSent(true);
      setOtp("");
      setCooldown(60);
    } catch { /* handled by interceptor */ }
    finally { setSending(false); }
  };

  const verifyOtp = async () => {
    setVerifying(true);
    try {
      await authAPI.verifyRegisterOtp(email, otp);
      toast.success("Email verified");
      onVerifiedChange(true);
    } catch { /* handled by interceptor */ }
    finally { setVerifying(false); }
  };

  return (
    <div>
      <label className="label">Email *</label>
      <div className="flex gap-2">
        <input
          type="email"
          name="email"
          value={email}
          onChange={handleChange}
          readOnly={verified}
          placeholder={placeholder}
          className="input-field flex-1"
          required
        />
        {verified ? (
          <button type="button" onClick={reset} className="px-3 text-sm text-primary-600 hover:underline">
            Change
          </button>
        ) : (
          <button
            type="button"
            onClick={sendOtp}
            disabled={sending || cooldown > 0 || !email}
            className="btn-primary px-4 whitespace-nowrap disabled:opacity-50"
          >
            {sending ? "Sending..." : otpSent ? (cooldown > 0 ? `Resend (${cooldown}s)` : "Resend") : "Verify"}
          </button>
        )}
      </div>

      {verified && <p className="text-sm text-green-600 mt-1">✓ Email verified</p>}

      {!verified && otpSent && (
        <div className="mt-3">
          <div className="flex gap-2">
            <input
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="6-digit code"
              className="input-field flex-1 tracking-widest"
            />
            <button
              type="button"
              onClick={verifyOtp}
              disabled={verifying || otp.length !== 6}
              className="btn-primary px-4 whitespace-nowrap disabled:opacity-50"
            >
              {verifying ? "Verifying..." : "Verify code"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">The code expires in 10 minutes.</p>
        </div>
      )}

      {!verified && !otpSent && (
        <button type="button" onClick={() => setOtpSent(true)} className="text-xs text-primary-600 hover:underline mt-1">
          Already have a code?
        </button>
      )}
    </div>
  );
};

export default EmailVerification;