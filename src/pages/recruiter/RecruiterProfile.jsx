//Below is the code used for the backend built on spring boot.

import { useState, useEffect } from "react";
import { recruiterAPI, uploadAPI } from "../../services/api";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import toast from "react-hot-toast";

const RecruiterProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "", industry: "", website: "", companySize: "", location: "", description: "",
  });
  const [contactPerson, setContactPerson] = useState({
    name: "", designation: "", phoneNumber: "", email: "",
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await recruiterAPI.getProfile();
      const p = res.data.data;
      setProfile(p);
      setCompanyInfo({
        companyName: p.companyName || "",
        industry: p.industry || "",
        website: p.website || "",
        companySize: p.companySize || "",
        location: p.location || "",
        description: p.description || "",
      });
      setContactPerson({
        name: p.contactName || "",
        designation: p.contactDesignation || "",
        phoneNumber: p.contactPhone || "",
        email: p.contactEmail || "",
      });
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // CRITICAL: our backend's PUT /recruiter/profile is a FULL replace — every
  // field must be sent every time, or the other section gets cleared.
  const buildFullPayload = () => ({
    companyName: companyInfo.companyName,
    industry: companyInfo.industry,
    location: companyInfo.location,
    website: companyInfo.website,
    companySize: companyInfo.companySize,
    description: companyInfo.description,
    contactName: contactPerson.name,
    contactDesignation: contactPerson.designation,
    contactPhone: contactPerson.phoneNumber,
    contactEmail: contactPerson.email,
  });

  const saveCompanyInfo = async () => {
    setSaving(true);
    try {
      await recruiterAPI.updateProfile(buildFullPayload());
      toast.success("Company info updated!");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const saveContactPerson = async () => {
    setSaving(true);
    try {
      await recruiterAPI.updateProfile(buildFullPayload());
      toast.success("Contact person updated!");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPEG, PNG, and WEBP images are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploadingLogo(true);
    try {
      await uploadAPI.uploadLogo(file);
      toast.success("Company logo uploaded successfully!");
      fetchProfile();
    } catch (error) {
      console.error("Logo upload error:", error);
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
            <p className="text-gray-600">Manage your company and contact details</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Logo</h2>
            <div className="flex items-start space-x-6">
              <div className="w-32 h-32 bg-green-100 rounded-lg flex items-center justify-center overflow-hidden">
                {profile?.companyLogoUrl ? (
                  <img src={profile.companyLogoUrl} alt="Company Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-5xl font-bold text-green-600">{(companyInfo.companyName || "?")[0]}</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-3">Upload your company logo (JPEG, PNG, WEBP. Max 5MB)</p>
                <label className="btn-primary px-6 py-2 cursor-pointer inline-block">
                  {uploadingLogo ? "Uploading..." : "Upload Logo"}
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Company Name</label>
                <input type="text" className="input-field" value={companyInfo.companyName}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, companyName: e.target.value })} placeholder="Company name" />
              </div>
              <div>
                <label className="label">Industry</label>
                <input type="text" className="input-field" value={companyInfo.industry}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, industry: e.target.value })} placeholder="Information Technology" />
              </div>
              <div>
                <label className="label">Website</label>
                <input type="url" className="input-field" value={companyInfo.website}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, website: e.target.value })} placeholder="https://company.com" />
              </div>
              <div>
                <label className="label">Company Size</label>
                <select className="input-field" value={companyInfo.companySize}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, companySize: e.target.value })}>
                  <option value="">Select size</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-100">51-100</option>
                  <option value="101-500">101-500</option>
                  <option value="501-1000">501-1000</option>
                  <option value="1000+">1000+</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="label">Location</label>
                <input type="text" className="input-field" value={companyInfo.location}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, location: e.target.value })} placeholder="Bangalore, India" />
              </div>
              <div className="md:col-span-2">
                <label className="label">Description</label>
                <textarea className="input-field" rows="3" value={companyInfo.description}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, description: e.target.value })} placeholder="Tell students about your company..." />
              </div>
            </div>
            <button onClick={saveCompanyInfo} disabled={saving} className="mt-6 btn-primary px-8 py-2">
              {saving ? "Saving..." : "Save Company Info"}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Person</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Name</label>
                <input type="text" className="input-field" value={contactPerson.name}
                  onChange={(e) => setContactPerson({ ...contactPerson, name: e.target.value })} placeholder="John Manager" />
              </div>
              <div>
                <label className="label">Designation</label>
                <input type="text" className="input-field" value={contactPerson.designation}
                  onChange={(e) => setContactPerson({ ...contactPerson, designation: e.target.value })} placeholder="HR Manager" />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input type="tel" className="input-field" value={contactPerson.phoneNumber}
                  onChange={(e) => setContactPerson({ ...contactPerson, phoneNumber: e.target.value })} placeholder="+91 9876543210" />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input-field" value={contactPerson.email}
                  onChange={(e) => setContactPerson({ ...contactPerson, email: e.target.value })} placeholder="john@company.com" />
              </div>
            </div>
            <button onClick={saveContactPerson} disabled={saving} className="mt-6 btn-primary px-8 py-2">
              {saving ? "Saving..." : "Save Contact Person"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RecruiterProfile;


//Below code is commented out because it was used for the backend built on node.js and express.js

// import { useState, useEffect } from "react";
// import { recruiterAPI } from "../../services/api";
// import Navbar from "../../components/common/Navbar";
// import Sidebar from "../../components/common/Sidebar";
// import toast from "react-hot-toast";
// import { uploadAPI } from "../../services/api";

// const RecruiterProfile = () => {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [companyInfo, setCompanyInfo] = useState({
//     companyName: "",
//     industry: "",
//     website: "",
//     companySize: "",
//     location: "",
//     description: "",
//   });
//   const [contactPerson, setContactPerson] = useState({
//     name: "",
//     designation: "",
//     phoneNumber: "",
//     email: "",
//   });
//   const [uploadingLogo, setUploadingLogo] = useState(false);

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   const fetchProfile = async () => {
//     try {
//       const res = await recruiterAPI.getProfile();
//       const p = res.data.profile;
//       setCompanyInfo({
//         companyName: p.companyInfo?.companyName || "",
//         industry: p.companyInfo?.industry || "",
//         website: p.companyInfo?.website || "",
//         companySize: p.companyInfo?.companySize || "",
//         location: p.companyInfo?.location || "",
//         description: p.companyInfo?.description || "",
//         companyLogo: p.companyInfo?.companyLogo || null,
//       });
//       setContactPerson({
//         name: p.contactPerson?.name || "",
//         designation: p.contactPerson?.designation || "",
//         phoneNumber: p.contactPerson?.phoneNumber || "",
//         email: p.contactPerson?.email || "",
//       });
//     } catch (error) {
//       console.error("Fetch error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const saveCompanyInfo = async () => {
//     setSaving(true);
//     try {
//       await recruiterAPI.updateProfile({ companyInfo });
//       toast.success("Company info updated!");
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const saveContactPerson = async () => {
//     setSaving(true);
//     try {
//       await recruiterAPI.updateProfile({ contactPerson });
//       toast.success("Contact person updated!");
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//       </div>
//     );
//   }

//   const handleLogoUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     // Validate file type
//     if (
//       !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
//         file.type,
//       )
//     ) {
//       toast.error("Only JPEG, PNG, and WEBP images are allowed");
//       return;
//     }

//     // Validate file size (5MB)
//     if (file.size > 5 * 1024 * 1024) {
//       toast.error("File size must be less than 5MB");
//       return;
//     }

//     setUploadingLogo(true);
//     try {
//       await uploadAPI.uploadLogo(file);
//       toast.success("Company logo uploaded successfully!");
//       fetchProfile();
//     } catch (error) {
//       console.error("Logo upload error:", error);
//     } finally {
//       setUploadingLogo(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <Navbar />
//       <div className="flex">
//         <Sidebar />
//         <main className="flex-1 p-8">
//           <div className="mb-6">
//             <h1 className="text-2xl font-bold text-gray-900">
//               Company Profile
//             </h1>
//             <p className="text-gray-600">
//               Manage your company and contact details
//             </p>
//           </div>
//           {/* Company Logo */}
//           <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">
//               Company Logo
//             </h2>
//             <div className="flex items-start space-x-6">
//               <div className="w-32 h-32 bg-green-100 rounded-lg flex items-center justify-center overflow-hidden">
//                 {companyInfo.companyLogo?.url ? (
//                   <img
//                     src={companyInfo.companyLogo.url}
//                     alt="Company Logo"
//                     className="w-full h-full object-contain"
//                   />
//                 ) : (
//                   <span className="text-5xl font-bold text-green-600">
//                     {(companyInfo.companyName || "?")[0]}
//                   </span>
//                 )}
//               </div>
//               <div className="flex-1">
//                 <p className="text-sm text-gray-600 mb-3">
//                   Upload your company logo (JPEG, PNG, WEBP. Max 5MB)
//                 </p>
//                 <label className="btn-primary px-6 py-2 cursor-pointer inline-block">
//                   {uploadingLogo ? "Uploading..." : "Upload Logo"}
//                   <input
//                     type="file"
//                     accept="image/jpeg,image/jpg,image/png,image/webp"
//                     onChange={handleLogoUpload}
//                     disabled={uploadingLogo}
//                     className="hidden"
//                   />
//                 </label>
//               </div>
//             </div>
//           </div>

//           {/* Company Information */}
//           <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">
//               Company Information
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="label">Company Name</label>
//                 <input
//                   type="text"
//                   className="input-field"
//                   value={companyInfo.companyName}
//                   onChange={(e) =>
//                     setCompanyInfo({
//                       ...companyInfo,
//                       companyName: e.target.value,
//                     })
//                   }
//                   placeholder="Company name"
//                 />
//               </div>
//               <div>
//                 <label className="label">Industry</label>
//                 <input
//                   type="text"
//                   className="input-field"
//                   value={companyInfo.industry}
//                   onChange={(e) =>
//                     setCompanyInfo({ ...companyInfo, industry: e.target.value })
//                   }
//                   placeholder="Information Technology"
//                 />
//               </div>
//               <div>
//                 <label className="label">Website</label>
//                 <input
//                   type="url"
//                   className="input-field"
//                   value={companyInfo.website}
//                   onChange={(e) =>
//                     setCompanyInfo({ ...companyInfo, website: e.target.value })
//                   }
//                   placeholder="https://company.com"
//                 />
//               </div>
//               <div>
//                 <label className="label">Company Size</label>
//                 <select
//                   className="input-field"
//                   value={companyInfo.companySize}
//                   onChange={(e) =>
//                     setCompanyInfo({
//                       ...companyInfo,
//                       companySize: e.target.value,
//                     })
//                   }
//                 >
//                   <option value="">Select size</option>
//                   <option value="1-10">1-10</option>
//                   <option value="11-50">11-50</option>
//                   <option value="51-100">51-100</option>
//                   <option value="101-500">101-500</option>
//                   <option value="501-1000">501-1000</option>
//                   <option value="1000+">1000+</option>
//                 </select>
//               </div>
//               <div className="md:col-span-2">
//                 <label className="label">Location</label>
//                 <input
//                   type="text"
//                   className="input-field"
//                   value={companyInfo.location}
//                   onChange={(e) =>
//                     setCompanyInfo({ ...companyInfo, location: e.target.value })
//                   }
//                   placeholder="Bangalore, India"
//                 />
//               </div>
//               <div className="md:col-span-2">
//                 <label className="label">Description</label>
//                 <textarea
//                   className="input-field"
//                   rows="3"
//                   value={companyInfo.description}
//                   onChange={(e) =>
//                     setCompanyInfo({
//                       ...companyInfo,
//                       description: e.target.value,
//                     })
//                   }
//                   placeholder="Tell students about your company..."
//                 />
//               </div>
//             </div>
//             <button
//               onClick={saveCompanyInfo}
//               disabled={saving}
//               className="mt-6 btn-primary px-8 py-2"
//             >
//               {saving ? "Saving..." : "Save Company Info"}
//             </button>
//           </div>

//           {/* Contact Person */}
//           <div className="bg-white rounded-lg shadow-md p-6">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">
//               Contact Person
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="label">Name</label>
//                 <input
//                   type="text"
//                   className="input-field"
//                   value={contactPerson.name}
//                   onChange={(e) =>
//                     setContactPerson({ ...contactPerson, name: e.target.value })
//                   }
//                   placeholder="John Manager"
//                 />
//               </div>
//               <div>
//                 <label className="label">Designation</label>
//                 <input
//                   type="text"
//                   className="input-field"
//                   value={contactPerson.designation}
//                   onChange={(e) =>
//                     setContactPerson({
//                       ...contactPerson,
//                       designation: e.target.value,
//                     })
//                   }
//                   placeholder="HR Manager"
//                 />
//               </div>
//               <div>
//                 <label className="label">Phone Number</label>
//                 <input
//                   type="tel"
//                   className="input-field"
//                   value={contactPerson.phoneNumber}
//                   onChange={(e) =>
//                     setContactPerson({
//                       ...contactPerson,
//                       phoneNumber: e.target.value,
//                     })
//                   }
//                   placeholder="+91 9876543210"
//                 />
//               </div>
//               <div>
//                 <label className="label">Email</label>
//                 <input
//                   type="email"
//                   className="input-field"
//                   value={contactPerson.email}
//                   onChange={(e) =>
//                     setContactPerson({
//                       ...contactPerson,
//                       email: e.target.value,
//                     })
//                   }
//                   placeholder="john@company.com"
//                 />
//               </div>
//             </div>
//             <button
//               onClick={saveContactPerson}
//               disabled={saving}
//               className="mt-6 btn-primary px-8 py-2"
//             >
//               {saving ? "Saving..." : "Save Contact Person"}
//             </button>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default RecruiterProfile;
