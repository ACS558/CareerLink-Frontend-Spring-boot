import { useEffect, useState } from "react";
import { alumniAPI } from "../../services/api";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import toast from "react-hot-toast";

const MyReferrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReferrals = async () => {
    try {
      const res = await alumniAPI.getMyReferrals();
       setReferrals(res.data.data); // was res.data.referrals
    } catch (error) {
      toast.error("Failed to load referrals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const deleteReferral = async (id) => {
    if (!window.confirm("Delete this referral?")) return;

    try {
      await alumniAPI.deleteReferral(id);
      toast.success("Referral deleted");
      fetchReferrals();
    } catch (error) {
      toast.error("Failed to delete referral");
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">My Referrals</h1>

          <div className="grid gap-4">
            {referrals.map((ref) => (
               <div key={ref.id} className="bg-white shadow rounded-lg p-6 flex justify-between"> {/* was ref._id */}
                <div>
                  <h2 className="font-bold text-lg">
                    {ref.company} — {ref.role}
                  </h2>

                  <p className="text-gray-600">{ref.location}</p>

                  <a
                    href={ref.referralLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 text-sm"
                  >
                    View Referral Link
                  </a>

                  <p className="text-sm text-gray-500 mt-2">
                    {ref.description}
                  </p>
                </div>

                <button onClick={() => deleteReferral(ref.id)} className="text-red-600 hover:underline"> {/* was ref._id */}
                  Delete
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyReferrals;
