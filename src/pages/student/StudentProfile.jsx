import { useState, useEffect } from "react";
import { studentAPI } from "../../services/api";
import { getCompletionColor } from "../../utils/helpers";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import toast from "react-hot-toast";
import { uploadAPI } from "../../services/api";


//Below is the code used for the backend built on spring boot

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({
    firstName: "", lastName: "", phoneNumber: "", dateOfBirth: "", gender: "",
  });
  const [academicInfo, setAcademicInfo] = useState({
    department: "", branch: "", semester: "", cgpa: "", percentage: "", backlogs: 0, graduationYear: "",
  });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [projects, setProjects] = useState([]);
  const [internships, setInternships] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [externalLinks, setExternalLinks] = useState([]);
  const [socialLinks, setSocialLinks] = useState({ linkedin: "", github: "", portfolio: "", twitter: "" });

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showInternshipModal, setShowInternshipModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  const [newProject, setNewProject] = useState({ title: "", description: "", technologies: "", liveLink: "", githubLink: "" });
  const [newInternship, setNewInternship] = useState({ companyName: "", role: "", duration: "", startDate: "", endDate: "" });
  const [newCert, setNewCert] = useState({ name: "", issuedBy: "", issueDate: "", credentialUrl: "" });
  const [newLink, setNewLink] = useState({ name: "", url: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const [profileRes, completionRes] = await Promise.all([
        studentAPI.getProfile(),
        studentAPI.getProfileCompletion(),
      ]);
      const p = profileRes.data.data;
      setProfile(p);
      setCompletion(completionRes.data.data);

      setPersonalInfo({
        firstName: p.firstName || "",
        lastName: p.lastName || "",
        phoneNumber: p.phoneNumber || "",
        dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split("T")[0] : "",
        gender: p.gender || "",
      });
      setAcademicInfo({
        department: p.department || "",
        branch: p.branch || "",
        semester: p.semester || "",
        cgpa: p.cgpa || "",
        percentage: p.percentage || "",
        backlogs: p.backlogs || 0,
        graduationYear: p.graduationYear || "",
      });
      setSkills(p.skills || []);
      setProjects(p.projects || []);
      setInternships(p.internships || []);
      setCertifications(p.certifications || []);
      setExternalLinks(p.externalLinks || []);
      setSocialLinks({
        linkedin: p.linkedin || "",
        github: p.github || "",
        portfolio: p.portfolio || "",
        twitter: p.twitter || "",
      });
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // CRITICAL: our backend's PUT /student/profile is a FULL replace — every
  // field must be sent on every save, or missing ones get cleared/nulled.
  // This builds the complete current state, with `overrides` for whatever
  // section is actually being changed.
  const buildFullPayload = (overrides = {}) => ({
    firstName: personalInfo.firstName,
    lastName: personalInfo.lastName,
    phoneNumber: personalInfo.phoneNumber,
    dateOfBirth: personalInfo.dateOfBirth || null,
    gender: personalInfo.gender,
    department: academicInfo.department,
    branch: academicInfo.branch,
    semester: academicInfo.semester ? Number(academicInfo.semester) : null,
    cgpa: academicInfo.cgpa ? Number(academicInfo.cgpa) : null,
    percentage: academicInfo.percentage ? Number(academicInfo.percentage) : null,
    backlogs: academicInfo.backlogs ? Number(academicInfo.backlogs) : 0,
    graduationYear: academicInfo.graduationYear ? Number(academicInfo.graduationYear) : null,
    skills,
    linkedin: socialLinks.linkedin,
    github: socialLinks.github,
    portfolio: socialLinks.portfolio,
    twitter: socialLinks.twitter,
    projects,
    internships,
    certifications,
    externalLinks,
    ...overrides,
  });

  const savePersonalInfo = async () => {
    setSaving(true);
    try {
      await studentAPI.updateProfile(buildFullPayload());
      toast.success("Personal info updated!");
      fetchProfile();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const saveAcademicInfo = async () => {
    setSaving(true);
    try {
      await studentAPI.updateProfile(buildFullPayload());
      toast.success("Academic info updated!");
      fetchProfile();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const saveSocialLinks = async () => {
    setSaving(true);
    try {
      await studentAPI.updateProfile(buildFullPayload());
      toast.success("Social links updated!");
      fetchProfile();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      const updated = [...skills, skillInput.trim()];
      setSkills(updated);
      setSkillInput("");
      studentAPI
        .updateProfile(buildFullPayload({ skills: updated }))
        .then(() => toast.success("Skill added!"))
        .catch(console.error);
    }
  };

  const removeSkill = (index) => {
    const updated = skills.filter((_, i) => i !== index);
    setSkills(updated);
    studentAPI
      .updateProfile(buildFullPayload({ skills: updated }))
      .then(() => toast.success("Skill removed!"))
      .catch(console.error);
  };

  const addProject = async () => {
    if (!newProject.title) {
      toast.error("Title is required");
      return;
    }
    const proj = {
      ...newProject,
      technologies: newProject.technologies.split(",").map((t) => t.trim()).filter(Boolean),
    };
    const updated = [...projects, proj];
    setProjects(updated);
    try {
      await studentAPI.updateProfile(buildFullPayload({ projects: updated }));
      toast.success("Project added!");
      setNewProject({ title: "", description: "", technologies: "", liveLink: "", githubLink: "" });
      setShowProjectModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const removeProject = async (index) => {
    const updated = projects.filter((_, i) => i !== index);
    setProjects(updated);
    await studentAPI.updateProfile(buildFullPayload({ projects: updated }));
    toast.success("Project removed!");
  };

  const addInternship = async () => {
    if (!newInternship.companyName || !newInternship.role) {
      toast.error("Company and role required");
      return;
    }
    const updated = [...internships, newInternship];
    setInternships(updated);
    try {
      await studentAPI.updateProfile(buildFullPayload({ internships: updated }));
      toast.success("Internship added!");
      setNewInternship({ companyName: "", role: "", duration: "", startDate: "", endDate: "" });
      setShowInternshipModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const removeInternship = async (index) => {
    const updated = internships.filter((_, i) => i !== index);
    setInternships(updated);
    await studentAPI.updateProfile(buildFullPayload({ internships: updated }));
    toast.success("Internship removed!");
  };

  const addCertification = async () => {
    if (!newCert.name) {
      toast.error("Name is required");
      return;
    }
    const updated = [...certifications, newCert];
    setCertifications(updated);
    try {
      await studentAPI.updateProfile(buildFullPayload({ certifications: updated }));
      toast.success("Certification added!");
      setNewCert({ name: "", issuedBy: "", issueDate: "", credentialUrl: "" });
      setShowCertModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const removeCertification = async (index) => {
    const updated = certifications.filter((_, i) => i !== index);
    setCertifications(updated);
    await studentAPI.updateProfile(buildFullPayload({ certifications: updated }));
    toast.success("Certification removed!");
  };

  const addExternalLink = async () => {
    if (!newLink.name || !newLink.url) {
      toast.error("Name and URL required");
      return;
    }
    const updated = [...externalLinks, newLink];
    setExternalLinks(updated);
    try {
      await studentAPI.updateProfile(buildFullPayload({ externalLinks: updated }));
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
    await studentAPI.updateProfile(buildFullPayload({ externalLinks: updated }));
    toast.success("Link removed!");
  };

  const tabs = [
    { id: "uploads", label: "Photo & Resume", icon: "📤" },
    { id: "personal", label: "Personal", icon: "👤" },
    { id: "academic", label: "Academic", icon: "📚" },
    { id: "skills", label: "Skills", icon: "💻" },
    { id: "projects", label: "Projects", icon: "🛠️" },
    { id: "internships", label: "Internships", icon: "🏢" },
    { id: "certifications", label: "Certs", icon: "🏆" },
    { id: "links", label: "Links", icon: "🔗" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const handlePhotoUpload = async (e) => {
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

    setUploadingPhoto(true);
    try {
      const response = await uploadAPI.uploadPhoto(file);
      setProfile(response.data.data); // backend returns the full updated profile
      toast.success("Photo uploaded successfully!");
    } catch (error) {
      console.error("Photo upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (
      !["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)
    ) {
      toast.error("Only PDF, DOC, and DOCX files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploadingResume(true);
    try {
      const response = await uploadAPI.uploadResume(file);
      setProfile(response.data.data); // backend returns the full updated profile
      toast.success("Resume uploaded and parsed successfully!");
      fetchProfile(); // refresh profile completion status too
    } catch (error) {
      console.error("Resume upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload resume");
    } finally {
      setUploadingResume(false);
      e.target.value = "";
    }
  };

  const handleDeletePhoto = async () => {
    if (!window.confirm("Delete your profile photo?")) return;
    try {
      await uploadAPI.deletePhoto();
      toast.success("Photo deleted successfully");
      fetchProfile();
    } catch (error) {
      console.error("Delete photo error:", error);
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm("Delete your resume?")) return;
    try {
      await uploadAPI.deleteResume();
      toast.success("Resume deleted successfully");
      fetchProfile();
    } catch (error) {
      console.error("Delete resume error:", error);
    }
  };



//Below is the code commented because it was used for the backend built on node.js and express.js

/* const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [photoFile, setPhotoFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
  });
  const [academicInfo, setAcademicInfo] = useState({
    department: "",
    branch: "",
    semester: "",
    cgpa: "",
    percentage: "",
    backlogs: 0,
    graduationYear: "",
  });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [projects, setProjects] = useState([]);
  const [internships, setInternships] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [externalLinks, setExternalLinks] = useState([]);
  const [socialLinks, setSocialLinks] = useState({
    linkedin: "",
    github: "",
    portfolio: "",
  });

  // Modal states for adding items
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showInternshipModal, setShowInternshipModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  // New item forms
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    technologies: "",
    liveLink: "",
    githubLink: "",
  });
  const [newInternship, setNewInternship] = useState({
    companyName: "",
    role: "",
    duration: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const [newCert, setNewCert] = useState({
    name: "",
    issuedBy: "",
    issueDate: "",
    credentialUrl: "",
  });
  const [newLink, setNewLink] = useState({ name: "", url: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await studentAPI.getProfile();
      const p = res.data.profile;
      console.log("Fetched profile:", res.data.profile); // Debug log
      console.log("Photo URL:", res.data.profile?.photo?.url); // Debug log
      console.log("Resume URL:", res.data.profile?.resume?.url); // Debug log
      setProfile(p);
      setPersonalInfo({
        firstName: p.personalInfo?.firstName || "",
        lastName: p.personalInfo?.lastName || "",
        phoneNumber: p.personalInfo?.phoneNumber || "",
        dateOfBirth: p.personalInfo?.dateOfBirth
          ? p.personalInfo.dateOfBirth.split("T")[0]
          : "",
        gender: p.personalInfo?.gender || "",
      });
      setAcademicInfo({
        department: p.academicInfo?.department || "",
        branch: p.academicInfo?.branch || "",
        semester: p.academicInfo?.semester || "",
        cgpa: p.academicInfo?.cgpa || "",
        percentage: p.academicInfo?.percentage || "",
        backlogs: p.academicInfo?.backlogs || 0,
        graduationYear: p.academicInfo?.graduationYear || "",
      });
      setSkills(p.skills || []);
      setProjects(p.projects || []);
      setInternships(p.internships || []);
      setCertifications(p.certifications || []);
      setExternalLinks(p.externalLinks || []);
      setSocialLinks({
        linkedin: p.socialLinks?.linkedin || "",
        github: p.socialLinks?.github || "",
        portfolio: p.socialLinks?.portfolio || "",
      });
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Save personal info
  const savePersonalInfo = async () => {
    setSaving(true);
    try {
      await studentAPI.updateProfile({ personalInfo });
      toast.success("Personal info updated!");
      fetchProfile();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // Save academic info
  const saveAcademicInfo = async () => {
    setSaving(true);
    try {
      await studentAPI.updateProfile({ academicInfo });
      toast.success("Academic info updated!");
      fetchProfile();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // Save social links
  const saveSocialLinks = async () => {
    setSaving(true);
    try {
      await studentAPI.updateProfile({ socialLinks });
      toast.success("Social links updated!");
      fetchProfile();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // Add skill
  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      const updated = [...skills, skillInput.trim()];
      setSkills(updated);
      setSkillInput("");
      studentAPI
        .updateProfile({ skills: updated })
        .then(() => toast.success("Skill added!"))
        .catch(console.error);
    }
  };

  // Remove skill
  const removeSkill = (index) => {
    const updated = skills.filter((_, i) => i !== index);
    setSkills(updated);
    studentAPI
      .updateProfile({ skills: updated })
      .then(() => toast.success("Skill removed!"))
      .catch(console.error);
  };

  // Add project
  const addProject = async () => {
    if (!newProject.title) {
      toast.error("Title is required");
      return;
    }
    const proj = {
      ...newProject,
      technologies: newProject.technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    const updated = [...projects, proj];
    setProjects(updated);
    try {
      await studentAPI.updateProfile({ projects: updated });
      toast.success("Project added!");
      setNewProject({
        title: "",
        description: "",
        technologies: "",
        liveLink: "",
        githubLink: "",
      });
      setShowProjectModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Remove project
  const removeProject = async (index) => {
    const updated = projects.filter((_, i) => i !== index);
    setProjects(updated);
    await studentAPI.updateProfile({ projects: updated });
    toast.success("Project removed!");
  };

  // Add internship
  const addInternship = async () => {
    if (!newInternship.companyName || !newInternship.role) {
      toast.error("Company and role required");
      return;
    }
    const updated = [...internships, newInternship];
    setInternships(updated);
    try {
      await studentAPI.updateProfile({ internships: updated });
      toast.success("Internship added!");
      setNewInternship({
        companyName: "",
        role: "",
        duration: "",
        description: "",
        startDate: "",
        endDate: "",
      });
      setShowInternshipModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Remove internship
  const removeInternship = async (index) => {
    const updated = internships.filter((_, i) => i !== index);
    setInternships(updated);
    await studentAPI.updateProfile({ internships: updated });
    toast.success("Internship removed!");
  };

  // Add certification
  const addCertification = async () => {
    if (!newCert.name) {
      toast.error("Name is required");
      return;
    }
    const updated = [...certifications, newCert];
    setCertifications(updated);
    try {
      await studentAPI.updateProfile({ certifications: updated });
      toast.success("Certification added!");
      setNewCert({ name: "", issuedBy: "", issueDate: "", credentialUrl: "" });
      setShowCertModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Remove certification
  const removeCertification = async (index) => {
    const updated = certifications.filter((_, i) => i !== index);
    setCertifications(updated);
    await studentAPI.updateProfile({ certifications: updated });
    toast.success("Certification removed!");
  };

  // Add external link
  const addExternalLink = async () => {
    if (!newLink.name || !newLink.url) {
      toast.error("Name and URL required");
      return;
    }
    const updated = [...externalLinks, newLink];
    setExternalLinks(updated);
    try {
      await studentAPI.updateProfile({ externalLinks: updated });
      toast.success("Link added!");
      setNewLink({ name: "", url: "" });
      setShowLinkModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Remove external link
  const removeExternalLink = async (index) => {
    const updated = externalLinks.filter((_, i) => i !== index);
    setExternalLinks(updated);
    await studentAPI.updateProfile({ externalLinks: updated });
    toast.success("Link removed!");
  };

  const tabs = [
    { id: "uploads", label: "Photo & Resume", icon: "📤" },
    { id: "personal", label: "Personal", icon: "👤" },
    { id: "academic", label: "Academic", icon: "📚" },
    { id: "skills", label: "Skills", icon: "💻" },
    { id: "projects", label: "Projects", icon: "🛠️" },
    { id: "internships", label: "Internships", icon: "🏢" },
    { id: "certifications", label: "Certs", icon: "🏆" },
    { id: "links", label: "Links", icon: "🔗" },
  ]; */

/*   if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (
      !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
        file.type,
      )
    ) {
      toast.error("Only JPEG, PNG, and WEBP images are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploadingPhoto(true);
    try {
      const response = await uploadAPI.uploadPhoto(file);
      console.log("Photo upload response:", response.data);

      // IMPORTANT: Update state immediately with the response
      if (response.data.photo) {
        setProfile((prev) => ({
          ...prev,
          photo: response.data.photo,
        }));
        console.log("Photo state updated:", response.data.photo);
      }

      toast.success("Photo uploaded successfully!");

      // Also fetch full profile to ensure everything is in sync
      setTimeout(() => {
        fetchProfile();
      }, 500);
    } catch (error) {
      console.error("Photo upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
      e.target.value = ""; // Reset file input
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (
      ![
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(file.type)
    ) {
      toast.error("Only PDF, DOC, and DOCX files are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploadingResume(true);
    try {
      const response = await uploadAPI.uploadResume(file);
      console.log("Resume upload response:", response.data);

      // IMPORTANT: Update state immediately
      if (response.data.resume) {
        setProfile((prev) => ({
          ...prev,
          resume: response.data.resume,
        }));
        console.log("Resume state updated:", response.data.resume);
      }

      toast.success("Resume uploaded and parsed successfully!");

      if (response.data.parsedData) {
        toast.success("Profile auto-filled from resume!", { duration: 3000 });
      }

      // Fetch full profile to get updated skills/projects
      setTimeout(() => {
        fetchProfile();
      }, 500);
    } catch (error) {
      console.error("Resume upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload resume");
    } finally {
      setUploadingResume(false);
      e.target.value = ""; // Reset file input
    }
  };

  const handleDeletePhoto = async () => {
    if (!window.confirm("Delete your profile photo?")) return;
    try {
      await uploadAPI.deletePhoto();
      toast.success("Photo deleted successfully");
      fetchProfile();
    } catch (error) {
      console.error("Delete photo error:", error);
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm("Delete your resume?")) return;
    try {
      await uploadAPI.deleteResume();
      toast.success("Resume deleted successfully");
      fetchProfile();
    } catch (error) {
      console.error("Delete resume error:", error);
    }
  }; */

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600">
                Manage and update your profile information
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">Completion:</span>
              {/* <span
                className={`font-bold text-lg ${getCompletionColor(profile?.completionPercentage || 0)}`}
              >
                {profile?.completionPercentage || 0}%
              </span> */}
                            <span className={`font-bold text-lg ${getCompletionColor(completion?.completionPercentage || 0)}`}>
                {completion?.completionPercentage || 0}%
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="flex overflow-x-auto border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "border-b-2 border-primary-600 text-primary-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* UPLOADS TAB */}
              {activeTab === "uploads" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Photo & Resume
                  </h3>

                  {/* Profile Photo */}
                  <div className="mb-8 pb-8 border-b">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Profile Photo
                    </h4>
                    <div className="flex items-start space-x-6">
                      <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                        {/* {profile?.photo?.url ? ( */}
                        {profile?.photoUrl ? (
                          <img
                            //src={profile.photo.url}
                            src={profile?.photoUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            //key={profile.photo.url}
                            key={profile?.photoUrl}
                          />
                        ) : (
                          <span className="text-5xl font-bold text-primary-600">
                            {/* {(profile?.personalInfo?.firstName || "?")[0]} */}
                            {(profile?.firstName || "?")[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-3">
                          Upload a professional photo (JPEG, PNG, WEBP. Max 5MB)
                        </p>

                        {/* Show upload status */}
                        {/* {profile?.photo?.url && ( */}
                        {profile?.photoUrl && (
                          <p className="text-xs text-green-600 mb-2">
                            ✓ Photo uploaded successfully
                          </p>
                        )}

                        <div className="flex space-x-3">
                          <label className="btn-primary px-4 py-2 cursor-pointer">
                            {uploadingPhoto
                              ? "Uploading..."
                              : profile?.photoUrl
                              //: profile?.photo?.url
                                ? "Change Photo"
                                : "Upload Photo"}
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              onChange={handlePhotoUpload}
                              disabled={uploadingPhoto}
                              className="hidden"
                            />
                          </label>
                          {/* {profile?.photo?.url && ( */}
                          {profile?.photoUrl && (
                            <button
                              onClick={handleDeletePhoto}
                              className="btn-danger px-4 py-2"
                            >
                              Delete Photo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resume */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Resume</h4>
                    {/* {profile?.resume?.url ? ( */}
                    {profile?.resumeUrl ? (
                      <div className="space-y-3">
                        {/* Uploaded Resume Display */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <span className="text-3xl">📄</span>
                              <div>
                                <p className="font-semibold text-green-800">
                                  Resume Uploaded
                                </p>
                                <p className="text-sm text-green-700 mt-1">
                                  Uploaded on:{" "}
                                  {/* {new Date(
                                    profile.resume.uploadedAt,
                                  ).toLocaleDateString()} */}
                                  {new Date(profile.resumeUploadedAt).toLocaleDateString()}
                                </p>
                                {/* {profile.resume.parsedData && (
                                  <p className="text-xs text-green-600 mt-1">
                                    ✓ AI-parsed and auto-filled
                                  </p>
                                )} */}
                                <p className="text-xs text-green-600 mt-1">
                                  ✓ AI-parsed and auto-filled
                                </p>
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              <button
                                onClick={handleDeleteResume}
                                className="btn-danger px-4 py-1 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Upload New Resume Button */}
                        <div className="text-center">
                          <label className="btn-secondary px-6 py-2 cursor-pointer inline-block">
                            {uploadingResume
                              ? "Uploading & Parsing..."
                              : "Upload New Resume"}
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                              onChange={handleResumeUpload}
                              disabled={uploadingResume}
                              className="hidden"
                            />
                          </label>
                        </div>
                        {/* Resume Preview */}
                        <div className="mt-6">
                          <h5 className="font-semibold text-gray-800 mb-4">
                            Resume Preview
                          </h5>

                          <div className="border border-gray-200 rounded-xl bg-gray-100 flex justify-center py-8">
                            <iframe
                              //src={profile.resume.url.replace(
                              src={profile.resumeUrl.replace(
                                "/upload/",
                                "/upload/f_auto,w_900/",
                              )}
                              title="Resume Preview"
                              className="w-[900px] aspect-[1/1.414] bg-white shadow-lg rounded"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3 mb-3">
                          <span className="text-3xl">📤</span>
                          <div>
                            <p className="font-semibold text-blue-800">
                              Upload Your Resume
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                              Upload your resume and we'll automatically extract
                              your skills, projects, and experience!
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              Accepted formats: PDF, DOC, DOCX (Max 5MB)
                            </p>
                          </div>
                        </div>
                        <label className="btn-primary px-6 py-2 cursor-pointer inline-block">
                          {uploadingResume
                            ? "Uploading & Parsing..."
                            : "Upload Resume"}
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleResumeUpload}
                            disabled={uploadingResume}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* PERSONAL INFO TAB */}
              {activeTab === "personal" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">First Name</label>
                      <input
                        type="text"
                        className="input-field"
                        value={personalInfo.firstName}
                        onChange={(e) =>
                          setPersonalInfo({
                            ...personalInfo,
                            firstName: e.target.value,
                          })
                        }
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="label">Last Name</label>
                      <input
                        type="text"
                        className="input-field"
                        value={personalInfo.lastName}
                        onChange={(e) =>
                          setPersonalInfo({
                            ...personalInfo,
                            lastName: e.target.value,
                          })
                        }
                        placeholder="Last name"
                      />
                    </div>
                    <div>
                      <label className="label">Phone Number</label>
                      <input
                        type="tel"
                        className="input-field"
                        value={personalInfo.phoneNumber}
                        onChange={(e) =>
                          setPersonalInfo({
                            ...personalInfo,
                            phoneNumber: e.target.value,
                          })
                        }
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <div>
                      <label className="label">Date of Birth</label>
                      <input
                        type="date"
                        className="input-field"
                        value={personalInfo.dateOfBirth}
                        onChange={(e) =>
                          setPersonalInfo({
                            ...personalInfo,
                            dateOfBirth: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="label">Gender</label>
                      <select
                        className="input-field"
                        value={personalInfo.gender}
                        onChange={(e) =>
                          setPersonalInfo({
                            ...personalInfo,
                            gender: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Email Field - READ ONLY */}
                    <div>
                      <label className="label">Email Address</label>
                      <input
                        type="email"
                        //value={profile.personalInfo?.email || ""}
                         value={profile.email || ""}
                        disabled
                        className="input-field"
                      />
                    </div>

                    {/* Registration Number - READ ONLY */}
                    <div>
                      <label className="label">Registration Number</label>
                      <input
                        type="text"
                        value={profile.registrationNumber || ""}
                        disabled
                        className="input-field"
                      />
                    </div>
                  </div>
                  <button
                    onClick={savePersonalInfo}
                    disabled={saving}
                    className="mt-6 btn-primary px-8 py-2"
                  >
                    {saving ? "Saving..." : "Save Personal Info"}
                  </button>
                </div>
              )}

              {/* ACADEMIC INFO TAB */}
              {activeTab === "academic" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Academic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Department</label>
                      <input
                        type="text"
                        className="input-field"
                        value={academicInfo.department}
                        onChange={(e) =>
                          setAcademicInfo({
                            ...academicInfo,
                            department: e.target.value,
                          })
                        }
                        placeholder="Computer Science & Engineering"
                      />
                    </div>
                    <div>
                      <label className="label">Branch</label>
                      <select
                        className="input-field"
                        value={academicInfo.branch}
                        onChange={(e) =>
                          setAcademicInfo({
                            ...academicInfo,
                            branch: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Branch</option>
                        <option value="CSE">CSE</option>
                        <option value="IT">IT</option>
                        <option value="ECE">ECE</option>
                        <option value="EEE">EEE</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Civil">Civil</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Semester</label>
                      <select
                        className="input-field"
                        value={academicInfo.semester}
                        onChange={(e) =>
                          setAcademicInfo({
                            ...academicInfo,
                            semester: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Semester</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">CGPA (out of 10)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        className="input-field"
                        value={academicInfo.cgpa}
                        onChange={(e) =>
                          setAcademicInfo({
                            ...academicInfo,
                            cgpa: e.target.value,
                          })
                        }
                        placeholder="8.5"
                      />
                    </div>
                    <div>
                      <label className="label">Percentage</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        className="input-field"
                        value={academicInfo.percentage}
                        onChange={(e) =>
                          setAcademicInfo({
                            ...academicInfo,
                            percentage: e.target.value,
                          })
                        }
                        placeholder="85"
                      />
                    </div>
                    <div>
                      <label className="label">Backlogs</label>
                      <input
                        type="number"
                        min="0"
                        className="input-field"
                        value={academicInfo.backlogs}
                        onChange={(e) =>
                          setAcademicInfo({
                            ...academicInfo,
                            backlogs: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="label">Graduation Year</label>
                      <input
                        type="number"
                        className="input-field"
                        value={academicInfo.graduationYear}
                        onChange={(e) =>
                          setAcademicInfo({
                            ...academicInfo,
                            graduationYear: e.target.value,
                          })
                        }
                        placeholder="2026"
                      />
                    </div>
                  </div>
                  <button
                    onClick={saveAcademicInfo}
                    disabled={saving}
                    className="mt-6 btn-primary px-8 py-2"
                  >
                    {saving ? "Saving..." : "Save Academic Info"}
                  </button>
                </div>
              )}

              {/* SKILLS TAB */}
              {activeTab === "skills" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Skills
                  </h3>
                  <div className="flex items-center space-x-3 mb-6">
                    <input
                      type="text"
                      className="input-field flex-1"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addSkill())
                      }
                      placeholder="Type a skill and press Enter..."
                    />
                    <button
                      onClick={addSkill}
                      className="btn-primary px-6 py-2"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full"
                      >
                        <span className="font-medium">{skill}</span>
                        <button
                          onClick={() => removeSkill(index)}
                          className="text-red-500 hover:text-red-700 font-bold text-lg leading-none"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  {skills.length === 0 && (
                    <p className="text-gray-400 mt-4">
                      No skills added yet. Type above to add!
                    </p>
                  )}
                </div>
              )}

              {/* PROJECTS TAB */}
              {activeTab === "projects" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Projects
                    </h3>
                    <button
                      onClick={() => setShowProjectModal(true)}
                      className="btn-primary px-4 py-2 text-sm"
                    >
                      + Add Project
                    </button>
                  </div>
                  {projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projects.map((project, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-gray-900">
                              {project.title}
                            </h4>
                            <button
                              onClick={() => removeProject(index)}
                              className="text-red-400 hover:text-red-600 text-sm"
                            >
                              🗑️
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {project.description}
                          </p>
                          {project.technologies?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {project.technologies.map((tech, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex space-x-3 mt-2">
                            {project.liveLink && (
                              <a
                                href={project.liveLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary-600 hover:underline"
                              >
                                Live Link
                              </a>
                            )}
                            {project.githubLink && (
                              <a
                                href={project.githubLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary-600 hover:underline"
                              >
                                GitHub
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No projects added yet.</p>
                  )}

                  {/* Project Modal */}
                  {showProjectModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
                        <h4 className="text-lg font-bold text-gray-900 mb-4">
                          Add New Project
                        </h4>
                        <div className="space-y-3">
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Project Title *"
                            value={newProject.title}
                            onChange={(e) =>
                              setNewProject({
                                ...newProject,
                                title: e.target.value,
                              })
                            }
                          />
                          <textarea
                            className="input-field"
                            rows="2"
                            placeholder="Description"
                            value={newProject.description}
                            onChange={(e) =>
                              setNewProject({
                                ...newProject,
                                description: e.target.value,
                              })
                            }
                          />
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Technologies (comma separated)"
                            value={newProject.technologies}
                            onChange={(e) =>
                              setNewProject({
                                ...newProject,
                                technologies: e.target.value,
                              })
                            }
                          />
                          <input
                            type="url"
                            className="input-field"
                            placeholder="Live Link (optional)"
                            value={newProject.liveLink}
                            onChange={(e) =>
                              setNewProject({
                                ...newProject,
                                liveLink: e.target.value,
                              })
                            }
                          />
                          <input
                            type="url"
                            className="input-field"
                            placeholder="GitHub Link (optional)"
                            value={newProject.githubLink}
                            onChange={(e) =>
                              setNewProject({
                                ...newProject,
                                githubLink: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="flex justify-end space-x-3 mt-5">
                          <button
                            onClick={() => setShowProjectModal(false)}
                            className="btn-secondary px-4 py-2"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={addProject}
                            className="btn-primary px-6 py-2"
                          >
                            Add Project
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* INTERNSHIPS TAB */}
              {activeTab === "internships" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Internships
                    </h3>
                    <button
                      onClick={() => setShowInternshipModal(true)}
                      className="btn-primary px-4 py-2 text-sm"
                    >
                      + Add Internship
                    </button>
                  </div>
                  {internships.length > 0 ? (
                    <div className="space-y-4">
                      {internships.map((intern, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {intern.role}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {intern.companyName}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {intern.duration}
                              </p>
                            </div>
                            <button
                              onClick={() => removeInternship(index)}
                              className="text-red-400 hover:text-red-600 text-sm"
                            >
                              🗑️
                            </button>
                          </div>
                          {intern.description && (
                            <p className="text-sm text-gray-600 mt-2">
                              {intern.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No internships added yet.</p>
                  )}

                  {/* Internship Modal */}
                  {showInternshipModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
                        <h4 className="text-lg font-bold text-gray-900 mb-4">
                          Add Internship
                        </h4>
                        <div className="space-y-3">
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Company Name *"
                            value={newInternship.companyName}
                            onChange={(e) =>
                              setNewInternship({
                                ...newInternship,
                                companyName: e.target.value,
                              })
                            }
                          />
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Role *"
                            value={newInternship.role}
                            onChange={(e) =>
                              setNewInternship({
                                ...newInternship,
                                role: e.target.value,
                              })
                            }
                          />
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Duration (e.g. 3 months)"
                            value={newInternship.duration}
                            onChange={(e) =>
                              setNewInternship({
                                ...newInternship,
                                duration: e.target.value,
                              })
                            }
                          />
                          <textarea
                            className="input-field"
                            rows="2"
                            placeholder="Description"
                            value={newInternship.description}
                            onChange={(e) =>
                              setNewInternship({
                                ...newInternship,
                                description: e.target.value,
                              })
                            }
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="label">Start Date</label>
                              <input
                                type="date"
                                className="input-field"
                                value={newInternship.startDate}
                                onChange={(e) =>
                                  setNewInternship({
                                    ...newInternship,
                                    startDate: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="label">End Date</label>
                              <input
                                type="date"
                                className="input-field"
                                value={newInternship.endDate}
                                onChange={(e) =>
                                  setNewInternship({
                                    ...newInternship,
                                    endDate: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-5">
                          <button
                            onClick={() => setShowInternshipModal(false)}
                            className="btn-secondary px-4 py-2"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={addInternship}
                            className="btn-primary px-6 py-2"
                          >
                            Add Internship
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CERTIFICATIONS TAB */}
              {activeTab === "certifications" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Certifications
                    </h3>
                    <button
                      onClick={() => setShowCertModal(true)}
                      className="btn-primary px-4 py-2 text-sm"
                    >
                      + Add Certification
                    </button>
                  </div>
                  {certifications.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {certifications.map((cert, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {cert.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {cert.issuedBy}
                              </p>
                              {cert.issueDate && (
                                <p className="text-xs text-gray-400">
                                  Issued:{" "}
                                  {new Date(
                                    cert.issueDate,
                                  ).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => removeCertification(index)}
                              className="text-red-400 hover:text-red-600 text-sm"
                            >
                              🗑️
                            </button>
                          </div>
                          {cert.credentialUrl && (
                            <a
                              href={cert.credentialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary-600 hover:underline mt-2 inline-block"
                            >
                              View Certificate →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">
                      No certifications added yet.
                    </p>
                  )}

                  {/* Certification Modal */}
                  {showCertModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
                        <h4 className="text-lg font-bold text-gray-900 mb-4">
                          Add Certification
                        </h4>
                        <div className="space-y-3">
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Certification Name *"
                            value={newCert.name}
                            onChange={(e) =>
                              setNewCert({ ...newCert, name: e.target.value })
                            }
                          />
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Issued By"
                            value={newCert.issuedBy}
                            onChange={(e) =>
                              setNewCert({
                                ...newCert,
                                issuedBy: e.target.value,
                              })
                            }
                          />
                          <div>
                            <label className="label">Issue Date</label>
                            <input
                              type="date"
                              className="input-field"
                              value={newCert.issueDate}
                              onChange={(e) =>
                                setNewCert({
                                  ...newCert,
                                  issueDate: e.target.value,
                                })
                              }
                            />
                          </div>
                          <input
                            type="url"
                            className="input-field"
                            placeholder="Credential URL (optional)"
                            value={newCert.credentialUrl}
                            onChange={(e) =>
                              setNewCert({
                                ...newCert,
                                credentialUrl: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="flex justify-end space-x-3 mt-5">
                          <button
                            onClick={() => setShowCertModal(false)}
                            className="btn-secondary px-4 py-2"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={addCertification}
                            className="btn-primary px-6 py-2"
                          >
                            Add Certification
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* LINKS TAB */}
              {activeTab === "links" && (
                <div>
                  {/* Social Links */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Social Links
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="label">LinkedIn</label>
                      <input
                        type="url"
                        className="input-field"
                        placeholder="https://linkedin.com/in/..."
                        value={socialLinks.linkedin}
                        onChange={(e) =>
                          setSocialLinks({
                            ...socialLinks,
                            linkedin: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="label">GitHub</label>
                      <input
                        type="url"
                        className="input-field"
                        placeholder="https://github.com/..."
                        value={socialLinks.github}
                        onChange={(e) =>
                          setSocialLinks({
                            ...socialLinks,
                            github: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="label">Portfolio</label>
                      <input
                        type="url"
                        className="input-field"
                        placeholder="https://yourportfolio.com"
                        value={socialLinks.portfolio}
                        onChange={(e) =>
                          setSocialLinks({
                            ...socialLinks,
                            portfolio: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <button
                    onClick={saveSocialLinks}
                    disabled={saving}
                    className="btn-primary px-8 py-2 mb-8"
                  >
                    {saving ? "Saving..." : "Save Social Links"}
                  </button>

                  {/* External Links */}
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        External Links
                      </h3>
                      <button
                        onClick={() => setShowLinkModal(true)}
                        className="btn-primary px-4 py-2 text-sm"
                      >
                        + Add Link
                      </button>
                    </div>
                    {externalLinks.length > 0 ? (
                      <div className="space-y-2">
                        {externalLinks.map((link, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3"
                          >
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {link.name}
                              </p>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary-600 hover:underline"
                              >
                                {link.url}
                              </a>
                            </div>
                            <button
                              onClick={() => removeExternalLink(index)}
                              className="text-red-400 hover:text-red-600"
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">
                        No external links added yet.
                      </p>
                    )}
                  </div>

                  {/* Link Modal */}
                  {showLinkModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
                        <h4 className="text-lg font-bold text-gray-900 mb-4">
                          Add External Link
                        </h4>
                        <div className="space-y-3">
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Link Name *"
                            value={newLink.name}
                            onChange={(e) =>
                              setNewLink({ ...newLink, name: e.target.value })
                            }
                          />
                          <input
                            type="url"
                            className="input-field"
                            placeholder="URL *"
                            value={newLink.url}
                            onChange={(e) =>
                              setNewLink({ ...newLink, url: e.target.value })
                            }
                          />
                        </div>
                        <div className="flex justify-end space-x-3 mt-5">
                          <button
                            onClick={() => setShowLinkModal(false)}
                            className="btn-secondary px-4 py-2"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={addExternalLink}
                            className="btn-primary px-6 py-2"
                          >
                            Add Link
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentProfile;
