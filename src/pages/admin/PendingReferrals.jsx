import { useEffect, useState } from "react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";

import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";

const PendingReferrals = () => {
  const [referrals, setReferrals] = useState([]);

  const fetchPendingReferrals = async () => {
    try {
      const res = await adminAPI.getPendingReferrals();
      setReferrals(res.data.data); // was res.data.referrals
    } catch (error) {
      toast.error("Failed to load referrals");
    }
  };

  useEffect(() => {
    fetchPendingReferrals();
  }, []);

  const verifyReferral = async (id, status) => {
    try {
      const res = await adminAPI.verifyReferral(id, status);

      if (res.data.success) {
        toast.success(
          status === "approved"
            ? "Referral approved successfully"
            : "Referral rejected successfully",
        );

        fetchPendingReferrals();
      } else {
        toast.error(res.data.message || "Failed to update referral");
      }
    } catch (error) {
      console.error("Verify referral error:", error);
      toast.error(error.response?.data?.message || "Failed to verify referral");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">Pending Referrals 📌</h1>

          {referrals.length === 0 ? (
            <div className="text-gray-500">No pending referrals</div>
          ) : (
            <div className="grid gap-4">
              {referrals.map((ref) => (
               <div key={ref.id} className="bg-white p-5 shadow rounded-lg"> {/* was ref._id */}
                  <h2 className="text-lg font-semibold">
                    {ref.company} — {ref.role}
                  </h2>

                  <p className="text-gray-600">{ref.location}</p>

                  <p className="text-sm mt-2">{ref.description}</p>

                  <div className="flex gap-3 mt-4">
                    <button onClick={() => verifyReferral(ref.id, "approve")} className="bg-green-600 text-white px-4 py-1 rounded"> {/* was ref._id */}
                      Approve
                    </button>

                    <button onClick={() => verifyReferral(ref.id, "reject")} className="bg-red-600 text-white px-4 py-1 rounded"> {/* was ref._id */}
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PendingReferrals;
