import { useEffect, useState } from "react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
  });

  const fetchAdmins = async () => {
    try {
      const res = await adminAPI.getAllAdmins();
      setAdmins(res.data.data);
      //setAdmins(res.data.admins);
    } catch (error) {
      toast.error("Failed to load admins");
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    try {
      await adminAPI.createAdmin(formData);

      toast.success("Admin created successfully");

      setFormData({
        name: "",
        email: "",
        password: "",
        department: "",
      });

      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create admin");
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;

    try {
      await adminAPI.deleteAdmin(id);

      toast.success("Admin deleted");

      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete admin");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-8">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Admin Management</h1>

            {/* Create Admin Form */}

            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Create New Admin</h2>

              <form
                onSubmit={handleCreateAdmin}
                className="grid grid-cols-2 gap-4"
              >
                <input
                  type="text"
                  name="name"
                  placeholder="Admin Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  required
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Admin Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  required
                />

                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  required
                />

                <input
                  type="text"
                  name="department"
                  placeholder="Department"
                  value={formData.department}
                  onChange={handleChange}
                  className="input-field"
                />

                <button type="submit" className="col-span-2 btn-primary py-2">
                  Create Admin
                </button>
              </form>
            </div>

            {/* Admin List */}

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Existing Admins</h2>

              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Email</th>
                    <th className="text-left py-2">Role</th>
                    <th className="text-left py-2">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {/* {admins.map((admin) => (
                    <tr key={admin._id} className="border-b">
                      <td className="py-2">{admin.personalInfo?.name}</td>

                      <td className="py-2">{admin.userId?.email}</td>

                      <td className="py-2 capitalize">{admin.roleLevel}</td>

                      <td className="py-2">
                        {admin.roleLevel !== "super_admin" && (
                          <button
                            onClick={() => handleDeleteAdmin(admin._id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))} */}
                  {admins.map((admin) => (
                    <tr key={admin.id} className="border-b">
                      <td className="py-2">{[admin.firstName, admin.lastName].filter(Boolean).join(" ")}</td>
                      <td className="py-2">{admin.email}</td>
                      <td className="py-2">{formatEnum(admin.roleLevel)}</td>
                      <td className="py-2">
                        {admin.roleLevel?.toUpperCase() !== "SUPER_ADMIN" && (
                          <button onClick={() => handleDeleteAdmin(admin.id)} className="text-red-600 hover:underline">
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}  
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminManagement;
