//Below is the code used for the backend built on spring boot

import { useState, useEffect } from "react";
import { alumniAPI } from "../../services/api";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import toast from "react-hot-toast";

const AlumniProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({ firstName: "", lastName: "", phoneNumber: "" });
  const [currentRole, setCurrentRole] = useState({ company: "", designation: "", location: "", experience: "", startDate: "" });
  const [externalLinks, setExternalLinks] = useState([]);
  const [socialLinks, setSocialLinks] = useState({ linkedin: "", twitter: "" });
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [newLink, setNewLink] = useState({ name: "", url: "" });
  const [regNumber, setRegNumber] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await alumniAPI.getProfile();
      const p = res.data.data; // was res.data.profile
      setRegNumber(p.registrationNumber || "");
      setPersonalInfo({
        firstName: p.firstName || "",
        lastName: p.lastName || "",
        phoneNumber: p.phoneNumber || "",
      });
      setCurrentRole({
        company: p.currentCompany || "",
        designation: p.currentDesignation || "",
        location: p.currentLocation || "",
        experience: p.experience || "",
        startDate: p.startDate ? p.startDate.split("T")[0] : "",
      });
      setExternalLinks(p.externalLinks || []);
      setSocialLinks({
        linkedin: p.linkedin || "",
        twitter: p.twitter || "",
      });
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Backend's PUT /alumni/profile is a FULL replace — every field must be
  // sent every time, or missing sections get cleared.
  const buildFullPayload = (overrides = {}) => ({
    firstName: personalInfo.firstName,
    lastName: personalInfo.lastName,
    phoneNumber: personalInfo.phoneNumber,
    currentCompany: currentRole.company,
    currentDesignation: currentRole.designation,
    currentLocation: currentRole.location,
    experience: currentRole.experience ? Number(currentRole.experience) : 0,
    startDate: currentRole.startDate || null,
    linkedin: socialLinks.linkedin,
    twitter: socialLinks.twitter,
    externalLinks,
    ...overrides,
  });

  const savePersonalInfo = async () => {
    setSaving(true);
    try {
      await alumniAPI.updateProfile(buildFullPayload());
      toast.success("Personal info updated!");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const saveCurrentRole = async () => {
    setSaving(true);
    try {
      await alumniAPI.updateProfile(buildFullPayload());
      toast.success("Current role updated!");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const saveSocialLinks = async () => {
    setSaving(true);
    try {
      await alumniAPI.updateProfile(buildFullPayload());
      toast.success("Social links updated!");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const addExternalLink = async () => {
    if (!newLink.name || !newLink.url) {
      toast.error("Name and URL required");
      return;
    }
    const updated = [...externalLinks, newLink];
    setExternalLinks(updated);
    try {
      await alumniAPI.updateProfile(buildFullPayload({ externalLinks: updated }));
      toast.success("Link added!");
      setNewLink({ name: "", url: "" });
      setShowLinkModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const removeExternalLink = async (index) => {
    const updated = externalLinks.filter((_, i) => i !== index);
    setExternalLinks(updated);
    await alumniAPI.updateProfile(buildFullPayload({ externalLinks: updated }));
    toast.success("Link removed!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Alumni Profile</h1>
            <p className="text-gray-600">Manage your alumni profile information</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input type="text" className="input-field" value={personalInfo.firstName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })} />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input type="text" className="input-field" value={personalInfo.lastName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })} />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input type="tel" className="input-field" value={personalInfo.phoneNumber}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phoneNumber: e.target.value })} placeholder="+91 9876543210" />
              </div>
              <div>
                <label className="label">Registration Number</label>
                <input type="text" className="input-field bg-gray-100" value={regNumber} disabled />
              </div>
            </div>
            <button onClick={savePersonalInfo} disabled={saving} className="mt-6 btn-primary px-8 py-2">
              {saving ? "Saving..." : "Save Personal Info"}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Role</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Company</label>
                <input type="text" className="input-field" value={currentRole.company}
                  onChange={(e) => setCurrentRole({ ...currentRole, company: e.target.value })} placeholder="Google India" />
              </div>
              <div>
                <label className="label">Designation</label>
                <input type="text" className="input-field" value={currentRole.designation}
                  onChange={(e) => setCurrentRole({ ...currentRole, designation: e.target.value })} placeholder="Software Engineer" />
              </div>
              <div>
                <label className="label">Location</label>
                <input type="text" className="input-field" value={currentRole.location}
                  onChange={(e) => setCurrentRole({ ...currentRole, location: e.target.value })} placeholder="Bangalore, India" />
              </div>
              <div>
                <label className="label">Experience (years)</label>
                <input type="number" className="input-field" value={currentRole.experience}
                  onChange={(e) => setCurrentRole({ ...currentRole, experience: e.target.value })} min="0" />
              </div>
              <div>
                <label className="label">Start Date</label>
                <input type="date" className="input-field" value={currentRole.startDate}
                  onChange={(e) => setCurrentRole({ ...currentRole, startDate: e.target.value })} />
              </div>
            </div>
            <button onClick={saveCurrentRole} disabled={saving} className="mt-6 btn-primary px-8 py-2">
              {saving ? "Saving..." : "Save Current Role"}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">LinkedIn</label>
                <input type="url" className="input-field" value={socialLinks.linkedin}
                  onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." />
              </div>
              <div>
                <label className="label">Twitter</label>
                <input type="url" className="input-field" value={socialLinks.twitter}
                  onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })} placeholder="https://twitter.com/..." />
              </div>
            </div>
            <button onClick={saveSocialLinks} disabled={saving} className="mt-6 btn-primary px-8 py-2">
              {saving ? "Saving..." : "Save Social Links"}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">External Links</h2>
              <button onClick={() => setShowLinkModal(true)} className="btn-primary px-4 py-2 text-sm">+ Add Link</button>
            </div>
            {externalLinks.length > 0 ? (
              <div className="space-y-2">
                {externalLinks.map((link, index) => (
                  <div key={index} className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{link.name}</p>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline">
                        {link.url}
                      </a>
                    </div>
                    <button onClick={() => removeExternalLink(index)} className="text-red-400 hover:text-red-600">🗑️</button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No external links added yet.</p>
            )}

            {showLinkModal && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Add External Link</h4>
                  <div className="space-y-3">
                    <input type="text" className="input-field" placeholder="Link Name *" value={newLink.name}
                      onChange={(e) => setNewLink({ ...newLink, name: e.target.value })} />
                    <input type="url" className="input-field" placeholder="URL *" value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })} />
                  </div>
                  <div className="flex justify-end space-x-3 mt-5">
                    <button onClick={() => setShowLinkModal(false)} className="btn-secondary px-4 py-2">Cancel</button>
                    <button onClick={addExternalLink} className="btn-primary px-6 py-2">Add Link</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AlumniProfile;


//Below code is commented out because it was used for the backend built on node.js and express.js

// import { useState, useEffect } from "react";
// import { alumniAPI } from "../../services/api";
// import Navbar from "../../components/common/Navbar";
// import Sidebar from "../../components/common/Sidebar";
// import toast from "react-hot-toast";

// const AlumniProfile = () => {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [personalInfo, setPersonalInfo] = useState({
//     firstName: "",
//     lastName: "",
//     phoneNumber: "",
//   });
//   const [currentRole, setCurrentRole] = useState({
//     company: "",
//     designation: "",
//     location: "",
//     experience: "",
//     startDate: "",
//   });
//   const [externalLinks, setExternalLinks] = useState([]);
//   const [socialLinks, setSocialLinks] = useState({ linkedin: "", twitter: "" });
//   const [showLinkModal, setShowLinkModal] = useState(false);
//   const [newLink, setNewLink] = useState({ name: "", url: "" });
//   const [regNumber, setRegNumber] = useState("");

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   const fetchProfile = async () => {
//     try {
//       const res = await alumniAPI.getProfile();
//       const p = res.data.profile;
//       setRegNumber(p.registrationNumber || "");
//       setPersonalInfo({
//         firstName: p.personalInfo?.firstName || "",
//         lastName: p.personalInfo?.lastName || "",
//         phoneNumber: p.personalInfo?.phoneNumber || "",
//       });
//       setCurrentRole({
//         company: p.currentRole?.company || "",
//         designation: p.currentRole?.designation || "",
//         location: p.currentRole?.location || "",
//         experience: p.currentRole?.experience || "",
//         startDate: p.currentRole?.startDate
//           ? p.currentRole.startDate.split("T")[0]
//           : "",
//       });
//       setExternalLinks(p.externalLinks || []);
//       setSocialLinks({
//         linkedin: p.socialLinks?.linkedin || "",
//         twitter: p.socialLinks?.twitter || "",
//       });
//     } catch (error) {
//       console.error("Fetch error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const savePersonalInfo = async () => {
//     setSaving(true);
//     try {
//       await alumniAPI.updateProfile({ personalInfo });
//       toast.success("Personal info updated!");
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const saveCurrentRole = async () => {
//     setSaving(true);
//     try {
//       await alumniAPI.updateProfile({ currentRole });
//       toast.success("Current role updated!");
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const saveSocialLinks = async () => {
//     setSaving(true);
//     try {
//       await alumniAPI.updateProfile({ socialLinks });
//       toast.success("Social links updated!");
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const addExternalLink = async () => {
//     if (!newLink.name || !newLink.url) {
//       toast.error("Name and URL required");
//       return;
//     }
//     const updated = [...externalLinks, newLink];
//     setExternalLinks(updated);
//     try {
//       await alumniAPI.updateProfile({ externalLinks: updated });
//       toast.success("Link added!");
//       setNewLink({ name: "", url: "" });
//       setShowLinkModal(false);
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   const removeExternalLink = async (index) => {
//     const updated = externalLinks.filter((_, i) => i !== index);
//     setExternalLinks(updated);
//     await alumniAPI.updateProfile({ externalLinks: updated });
//     toast.success("Link removed!");
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <Navbar />
//       <div className="flex">
//         <Sidebar />
//         <main className="flex-1 p-8">
//           <div className="mb-6">
//             <h1 className="text-2xl font-bold text-gray-900">Alumni Profile</h1>
//             <p className="text-gray-600">
//               Manage your alumni profile information
//             </p>
//           </div>

//           {/* Personal Info */}
//           <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">
//               Personal Information
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="label">First Name</label>
//                 <input
//                   type="text"
//                   className="input-field"
//                   value={personalInfo.firstName}
//                   onChange={(e) =>
//                     setPersonalInfo({
//                       ...personalInfo,
//                       firstName: e.target.value,
//                     })
//                   }
//                 />
//               </div>
//               <div>
//                 <label className="label">Last Name</label>
//                 <input
//                   type="text"
//                   className="input-field"
//                   value={personalInfo.lastName}
//                   onChange={(e) =>
//                     setPersonalInfo({
//                       ...personalInfo,
//                       lastName: e.target.value,
//                     })
//                   }
//                 />
//               </div>
//               <div>
//                 <label className="label">Phone Number</label>
//                 <input
//                   type="tel"
//                   className="input-field"
//                   value={personalInfo.phoneNumber}
//                   onChange={(e) =>
//                     setPersonalInfo({
//                       ...personalInfo,
//                       phoneNumber: e.target.value,
//                     })
//                   }
//                   placeholder="+91 9876543210"
//                 />
//               </div>
//               <div>
//                 <label className="label">Registration Number</label>
//                 <input
//                   type="text"
//                   className="input-field bg-gray-100"
//                   value={regNumber}
//                   disabled
//                 />
//               </div>
//             </div>
//             <button
//               onClick={savePersonalInfo}
//               disabled={saving}
//               className="mt-6 btn-primary px-8 py-2"
//             >
//               {saving ? "Saving..." : "Save Personal Info"}
//             </button>
//           </div>

//           {/* Current Role */}
//           <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">
//               Current Role
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="label">Company</label>
//                 <input
//                   type="text"
//                   className="input-field"
//                   value={currentRole.company}
//                   onChange={(e) =>
//                     setCurrentRole({ ...currentRole, company: e.target.value })
//                   }
//                   placeholder="Google India"
//                 />
//               </div>
//               <div>
//                 <label className="label">Designation</label>
//                 <input
//                   type="text"
//                   className="input-field"
//                   value={currentRole.designation}
//                   onChange={(e) =>
//                     setCurrentRole({
//                       ...currentRole,
//                       designation: e.target.value,
//                     })
//                   }
//                   placeholder="Software Engineer"
//                 />
//               </div>
//               <div>
//                 <label className="label">Location</label>
//                 <input
//                   type="text"
//                   className="input-field"
//                   value={currentRole.location}
//                   onChange={(e) =>
//                     setCurrentRole({ ...currentRole, location: e.target.value })
//                   }
//                   placeholder="Bangalore, India"
//                 />
//               </div>
//               <div>
//                 <label className="label">Experience (years)</label>
//                 <input
//                   type="number"
//                   className="input-field"
//                   value={currentRole.experience}
//                   onChange={(e) =>
//                     setCurrentRole({
//                       ...currentRole,
//                       experience: e.target.value,
//                     })
//                   }
//                   min="0"
//                 />
//               </div>
//               <div>
//                 <label className="label">Start Date</label>
//                 <input
//                   type="date"
//                   className="input-field"
//                   value={currentRole.startDate}
//                   onChange={(e) =>
//                     setCurrentRole({
//                       ...currentRole,
//                       startDate: e.target.value,
//                     })
//                   }
//                 />
//               </div>
//             </div>
//             <button
//               onClick={saveCurrentRole}
//               disabled={saving}
//               className="mt-6 btn-primary px-8 py-2"
//             >
//               {saving ? "Saving..." : "Save Current Role"}
//             </button>
//           </div>

//           {/* Social Links */}
//           <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">
//               Social Links
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="label">LinkedIn</label>
//                 <input
//                   type="url"
//                   className="input-field"
//                   value={socialLinks.linkedin}
//                   onChange={(e) =>
//                     setSocialLinks({ ...socialLinks, linkedin: e.target.value })
//                   }
//                   placeholder="https://linkedin.com/in/..."
//                 />
//               </div>
//               <div>
//                 <label className="label">Twitter</label>
//                 <input
//                   type="url"
//                   className="input-field"
//                   value={socialLinks.twitter}
//                   onChange={(e) =>
//                     setSocialLinks({ ...socialLinks, twitter: e.target.value })
//                   }
//                   placeholder="https://twitter.com/..."
//                 />
//               </div>
//             </div>
//             <button
//               onClick={saveSocialLinks}
//               disabled={saving}
//               className="mt-6 btn-primary px-8 py-2"
//             >
//               {saving ? "Saving..." : "Save Social Links"}
//             </button>
//           </div>

//           {/* External Links */}
//           <div className="bg-white rounded-lg shadow-md p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-lg font-semibold text-gray-900">
//                 External Links
//               </h2>
//               <button
//                 onClick={() => setShowLinkModal(true)}
//                 className="btn-primary px-4 py-2 text-sm"
//               >
//                 + Add Link
//               </button>
//             </div>
//             {externalLinks.length > 0 ? (
//               <div className="space-y-2">
//                 {externalLinks.map((link, index) => (
//                   <div
//                     key={index}
//                     className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3"
//                   >
//                     <div>
//                       <p className="font-medium text-gray-900 text-sm">
//                         {link.name}
//                       </p>
//                       <a
//                         href={link.url}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-xs text-primary-600 hover:underline"
//                       >
//                         {link.url}
//                       </a>
//                     </div>
//                     <button
//                       onClick={() => removeExternalLink(index)}
//                       className="text-red-400 hover:text-red-600"
//                     >
//                       🗑️
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-gray-400">No external links added yet.</p>
//             )}

//             {showLinkModal && (
//               <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//                 <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
//                   <h4 className="text-lg font-bold text-gray-900 mb-4">
//                     Add External Link
//                   </h4>
//                   <div className="space-y-3">
//                     <input
//                       type="text"
//                       className="input-field"
//                       placeholder="Link Name *"
//                       value={newLink.name}
//                       onChange={(e) =>
//                         setNewLink({ ...newLink, name: e.target.value })
//                       }
//                     />
//                     <input
//                       type="url"
//                       className="input-field"
//                       placeholder="URL *"
//                       value={newLink.url}
//                       onChange={(e) =>
//                         setNewLink({ ...newLink, url: e.target.value })
//                       }
//                     />
//                   </div>
//                   <div className="flex justify-end space-x-3 mt-5">
//                     <button
//                       onClick={() => setShowLinkModal(false)}
//                       className="btn-secondary px-4 py-2"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       onClick={addExternalLink}
//                       className="btn-primary px-6 py-2"
//                     >
//                       Add Link
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default AlumniProfile;
