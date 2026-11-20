import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { authAPI } from "../../services/api";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;
const EMPTY = Array(OTP_LENGTH).fill("");

const EmailVerification = ({ email, onEmailChange, verified, onVerifiedChange, placeholder }) => {
  const [otpSent, setOtpSent] = useState(false);
  const [digits, setDigits] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef([]);

  // Countdown for the resend timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Cursor goes to the first box when the boxes appear, and again after a wrong code
  useEffect(() => {
    if (otpSent && !verified && !verifying) inputsRef.current[0]?.focus();
  }, [otpSent, verified, verifying]);

  const reset = () => {
    setOtpSent(false);
    setDigits(EMPTY);
    setCooldown(0);
    onVerifiedChange(false);
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
      setDigits(EMPTY);
      setOtpSent(true);
      setCooldown(RESEND_SECONDS);
      inputsRef.current[0]?.focus();
    } catch { /* handled by interceptor */ }
    finally { setSending(false); }
  };

  const verifyCode = async (code) => {
    setVerifying(true);
    try {
      await authAPI.verifyRegisterOtp(email, code);
      toast.success("Email verified");
      onVerifiedChange(true);
    } catch {
      setDigits(EMPTY); // wrong code: clear the boxes and let the user retry
    } finally {
      setVerifying(false);
    }
  };

  // Every change goes through here, and the 6th digit triggers the verification automatically
  const update = (next) => {
    setDigits(next);
    const code = next.join("");
    if (code.length === OTP_LENGTH) verifyCode(code);
  };

  const handleDigitChange = (i, value) => {
    const d = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    if (d && i < OTP_LENGTH - 1) inputsRef.current[i + 1]?.focus();
    update(next);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Enter") e.preventDefault(); // don't submit the registration form
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      const next = [...digits];
      next[i - 1] = "";
      setDigits(next);
      inputsRef.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) inputsRef.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < OTP_LENGTH - 1) inputsRef.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...EMPTY];
    pasted.split("").forEach((c, idx) => (next[idx] = c));
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    update(next);
  };

  const locked = otpSent || verified; // email can't be edited while a code is pending or after verification

  return (
    <div>
      <label className="label">Email *</label>
      <div className="flex gap-2">
        <input
          type="email"
          name="email"
          value={email}
          onChange={onEmailChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (!locked && email) sendOtp();
            }
          }}
          readOnly={locked}
          placeholder={placeholder}
          className={`input-field flex-1 ${locked ? "bg-gray-50" : ""}`}
          required
        />
        {locked ? (
          <button type="button" onClick={reset} className="px-3 text-sm text-primary-600 hover:underline">
            Change
          </button>
        ) : (
          <button
            type="button"
            onClick={sendOtp}
            disabled={sending || !email}
            className="btn-primary px-4 whitespace-nowrap disabled:opacity-50"
          >
            {sending ? "Sending..." : "Verify"}
          </button>
        )}
      </div>

      {verified && <p className="text-sm text-green-600 mt-1">✓ Email verified</p>}

      {otpSent && !verified && (
        <div className="mt-4">
          <div className="flex gap-2" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="text"
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={d}
                disabled={verifying}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onFocus={(e) => e.target.select()}
                className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent disabled:bg-gray-100"
              />
            ))}
          </div>

          <p className="text-sm text-gray-500 mt-3">
            {verifying ? (
              "Verifying..."
            ) : cooldown > 0 ? (
              `Didn’t get it? Resend in ${cooldown}s`
            ) : (
              <>
                Didn’t get it?{" "}
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={sending}
                  className="text-primary-600 font-medium hover:underline"
                >
                  Resend
                </button>
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default EmailVerification;