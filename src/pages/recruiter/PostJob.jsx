import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jobAPI } from "../../services/api";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import toast from "react-hot-toast";

const PostJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    jobType: "Full-time",
    location: "",
    workMode: "On-site",
    salaryMin: "",
    salaryMax: "",
    salaryType: "LPA",
    branches: [],
    minCGPA: "",
    maxBacklogs: 0,
    graduationYears: [],
    skillsRequired: "",
    numberOfOpenings: 1,
    applicationDeadline: "",
  });

  const [branchInput, setBranchInput] = useState("");
  const [yearInput, setYearInput] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addBranch = () => {
    if (branchInput && !formData.branches.includes(branchInput)) {
      setFormData({
        ...formData,
        branches: [...formData.branches, branchInput],
      });
      setBranchInput("");
    }
  };

  const removeBranch = (branch) => {
    setFormData({
      ...formData,
      branches: formData.branches.filter((b) => b !== branch),
    });
  };

  const addYear = () => {
    const year = parseInt(yearInput);
    if (year && !formData.graduationYears.includes(year)) {
      setFormData({
        ...formData,
        graduationYears: [...formData.graduationYears, year],
      });
      setYearInput("");
    }
  };

  const removeYear = (year) => {
    setFormData({
      ...formData,
      graduationYears: formData.graduationYears.filter((y) => y !== year),
    });
  };

  /* const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const jobData = {
        title: formData.title,
        description: formData.description,
        jobType: formData.jobType,
        location: formData.location,
        workMode: formData.workMode,
        salaryRange: {
          min: Number(formData.salaryMin),
          max: Number(formData.salaryMax),
        },
        salaryType: formData.salaryType,
        eligibilityCriteria: {
          branches: formData.branches,
          minCGPA: formData.minCGPA ? Number(formData.minCGPA) : undefined,
          maxBacklogs: Number(formData.maxBacklogs),
          graduationYears: formData.graduationYears,
        },
        skillsRequired: formData.skillsRequired
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        numberOfOpenings: Number(formData.numberOfOpenings),
        applicationDeadline: formData.applicationDeadline || undefined,
      };

      await jobAPI.createJob(jobData);
      toast.success("Job posted successfully! Awaiting admin approval.");
      navigate("/recruiter/jobs");
    } catch (error) {
      console.error("Post job error:", error);
    } finally {
      setLoading(false);
    }
  }; */

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const jobTypeMap = {
      "Full-time": "FULL_TIME",
      "Part-time": "PART_TIME",
      "Internship": "INTERNSHIP",
      "Contract": "CONTRACT",
    };
    const workModeMap = { "On-site": "ON_SITE", "Remote": "REMOTE", "Hybrid": "HYBRID" };
    const salaryTypeMap = { "LPA": "LPA", "Monthly": "MONTHLY", "Hourly": "HOURLY" };

    try {
      const jobData = {
        title: formData.title,
        description: formData.description,
        jobType: jobTypeMap[formData.jobType] || "FULL_TIME",
        location: formData.location,
        workMode: workModeMap[formData.workMode] || "ON_SITE",
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : null,
        salaryType: salaryTypeMap[formData.salaryType] || "LPA",
        eligibleBranches: formData.branches,
        minCgpa: formData.minCGPA ? Number(formData.minCGPA) : null,
        maxBacklogs: Number(formData.maxBacklogs),
        graduationYears: formData.graduationYears,
        skillsRequired: formData.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean),
        numberOfOpenings: Number(formData.numberOfOpenings),
        applicationDeadline: formData.applicationDeadline
          ? `${formData.applicationDeadline}T23:59:59`
          : null,
      };

      await jobAPI.createJob(jobData);
      toast.success("Job posted successfully! Awaiting admin approval.");
      navigate("/recruiter/jobs");
    } catch (error) {
      console.error("Post job error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Post a New Job 💼
            </h1>
            <p className="text-gray-600">
              Fill in the details to post a job opening
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-md p-6"
          >
            {/* Basic Info */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label">Job Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Software Engineer"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Job Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="input-field"
                    rows="4"
                    placeholder="Describe the role, responsibilities, and requirements..."
                    required
                  />
                </div>
                <div>
                  <label className="label">Job Type *</label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="label">Work Mode *</label>
                  <select
                    name="workMode"
                    value={formData.workMode}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="label">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Bangalore, India"
                    required
                  />
                </div>
                <div>
                  <label className="label">Number of Openings</label>
                  <input
                    type="number"
                    name="numberOfOpenings"
                    value={formData.numberOfOpenings}
                    onChange={handleChange}
                    className="input-field"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Salary */}
            <div className="mb-6 pt-6 border-t">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Salary Range
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Min Salary</label>
                  <input
                    type="number"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="label">Max Salary</label>
                  <input
                    type="number"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="label">Salary Type</label>
                  <select
                    name="salaryType"
                    value={formData.salaryType}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="LPA">LPA</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Hourly">Hourly</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Eligibility */}
            <div className="mb-6 pt-6 border-t">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Eligibility Criteria
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Eligible Branches</label>
                  <div className="flex space-x-2">
                    <select
                      value={branchInput}
                      onChange={(e) => setBranchInput(e.target.value)}
                      className="input-field flex-1"
                    >
                      <option value="">Select Branch</option>
                      <option value="CSE">CSE</option>
                      <option value="IT">IT</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Civil">Civil</option>
                    </select>
                    <button
                      type="button"
                      onClick={addBranch}
                      className="btn-primary px-4"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.branches.map((branch, i) => (
                      <span
                        key={i}
                        className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                      >
                        <span>{branch}</span>
                        <button
                          type="button"
                          onClick={() => removeBranch(branch)}
                          className="text-red-500 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Graduation Years</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={yearInput}
                      onChange={(e) => setYearInput(e.target.value)}
                      className="input-field flex-1"
                      placeholder="2025"
                      min="2020"
                      max="2030"
                    />
                    <button
                      type="button"
                      onClick={addYear}
                      className="btn-primary px-4"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.graduationYears.map((year, i) => (
                      <span
                        key={i}
                        className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                      >
                        <span>{year}</span>
                        <button
                          type="button"
                          onClick={() => removeYear(year)}
                          className="text-red-500 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Minimum CGPA</label>
                  <input
                    type="number"
                    name="minCGPA"
                    value={formData.minCGPA}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="7.0"
                    step="0.1"
                    min="0"
                    max="10"
                  />
                </div>
                <div>
                  <label className="label">Maximum Backlogs</label>
                  <input
                    type="number"
                    name="maxBacklogs"
                    value={formData.maxBacklogs}
                    onChange={handleChange}
                    className="input-field"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Additional */}
            <div className="mb-6 pt-6 border-t">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Additional Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    Skills Required (comma separated)
                  </label>
                  <input
                    type="text"
                    name="skillsRequired"
                    value={formData.skillsRequired}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="React, Node.js, MongoDB"
                  />
                </div>
                <div>
                  <label className="label">Application Deadline</label>
                  <input
                    type="date"
                    name="applicationDeadline"
                    value={formData.applicationDeadline}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate("/recruiter/jobs")}
                className="btn-secondary px-6 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-8 py-2"
              >
                {loading ? "Posting..." : "Post Job"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default PostJob;
