import { useEffect, useState } from "react";
import { studentAPI } from "../../services/api";
import toast from "react-hot-toast";

import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";

const BrowseReferrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReferrals = async () => {
    try {
      const res = await studentAPI.getReferrals();
     // setReferrals(res.data.referrals);
      setReferrals(res.data.data.content || res.data.data);
    } catch (error) {
      toast.error("Failed to load referrals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navbar */}
      <Navbar />

      <div className="flex">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">Referral Opportunities</h1>

          {loading ? (
            <div className="text-center text-gray-500">
              Loading referrals...
            </div>
          ) : referrals.length === 0 ? (
            <div className="text-gray-500">
              No referrals available right now
            </div>
          ) : (
            <div className="grid gap-4">
              {referrals.map((ref) => (
                <div
                  //key={ref._id}
                  key={ref.id}
                  className="bg-white shadow rounded-lg p-5 border"
                >
                  <h2 className="text-lg font-semibold">
                    {ref.company} — {ref.role}
                  </h2>

                  <p className="text-gray-600">
                    Location: {ref.location || "Not specified"}
                  </p>

                  <p className="text-sm mt-2 text-gray-700">
                    {ref.description}
                  </p>

                  <a
                    href={ref.referralLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-blue-600 font-medium hover:underline"
                  >
                    Apply via Referral →
                  </a>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BrowseReferrals;
