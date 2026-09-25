import { useEffect, useState } from "react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";

import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";

const ManageReferrals = () => {
  const [referrals, setReferrals] = useState([]);

  const fetchReferrals = async () => {
    try {
      const res = await adminAPI.getAllReferrals();
      //setReferrals(res.data.referrals);
      setReferrals(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch referrals");
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">All Referrals 📎</h1>

          <div className="grid gap-4">
            {referrals.map((ref) => (
              <div key={ref.id} className="bg-white p-5 shadow rounded-lg">
                <h2 className="text-lg font-semibold">
                  {ref.company} — {ref.role}
                </h2>

               // <p>Status: {ref.approvalStatus}</p>
               <p>Status: {ref.approvalStatus?.charAt(0).toUpperCase() + ref.approvalStatus?.slice(1).toLowerCase()}</p>

                <p className="text-gray-600">{ref.location}</p>

                <a
                  href={ref.referralLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600"
                >
                  View Referral →
                </a>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageReferrals;
