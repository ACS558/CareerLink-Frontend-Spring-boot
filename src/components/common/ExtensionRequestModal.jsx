import { useState } from "react";
import { studentAPI } from "../../services/api";
import toast from "react-hot-toast";

const ExtensionRequestModal = ({ onClose }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Please enter a reason");
      return;
    }
    setLoading(true);
    try {
      await studentAPI.requestExtension(reason.trim());
      toast.success("Extension request submitted! An admin will review it.");
      onClose();
    } catch (error) {
      // the api.js interceptor already shows the server's error message
      console.error("Extension request error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Account Extension</h2>
        <p className="text-sm text-gray-500 mb-4">
          Tell the placement cell why you need more time on the platform.
        </p>
        <form onSubmit={handleSubmit}>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 mb-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. I need to download my data / still in interview process..."
          />
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExtensionRequestModal;