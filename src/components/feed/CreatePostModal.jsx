import { useState, useEffect } from "react";
import { feedAPI, jobAPI } from "../../services/api"; // was default import from feedAPI.js (now merged into api.js)
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const CreatePostModal = ({
  isOpen,
  onClose,
  onPostCreated,
  editPost = null,
}) => {
  const { user } = useAuth(); //Added this line to get the current user(Spring boot backend)
  const [textContent, setTextContent] = useState("");
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  //(Spring boot backend) Added these states to handle job post linking
  const [isJobPost, setIsJobPost] = useState(false);
  const [linkedJobId, setLinkedJobId] = useState("");
  const [myJobs, setMyJobs] = useState([]);

  useEffect(() => {
    if (editPost) {
      setTextContent(editPost.textContent);
      setImagePreviews(editPost.images?.map((img) => img.url) || []);
     
      //spring boot backend
      if (editPost.linkedJobId) {
        setIsJobPost(true);
        setLinkedJobId(String(editPost.linkedJobId));
      }

    }
  }, [editPost]);


  //spring boot backend: fetch the user's jobs when the modal opens
  useEffect(() => {
    if (isOpen && user?.role === "recruiter") {
      jobAPI.getMyJobs().then((res) => setMyJobs(res.data.data)).catch(() => {});
    }
  }, [isOpen, user]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate file count
    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    // Validate file sizes and types
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        return;
      }
    }

    // Add to images array
    setImages([...images, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate file count
    if (documents.length + files.length > 3) {
      toast.error("Maximum 3 documents allowed");
      return;
    }

    // Validate file sizes and types
    const allowedTypes = [
      "application/pdf",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`);
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid document type`);
        return;
      }
    }

    setDocuments([...documents, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const removeDocument = (index) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate text content
    if (!textContent.trim()) {
      toast.error("Please enter post content");
      return;
    }

    if (textContent.length > 5000) {
      toast.error("Post content cannot exceed 5000 characters");
      return;
    }

    setLoading(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("textContent", textContent.trim());

      //spring boot backend: add job post linking info if applicable
      if (isJobPost && linkedJobId) {
        formData.append("linkedJobId", linkedJobId);
        formData.append("isJobPost", "true");
      }

      // Add images
      images.forEach((image) => {
        formData.append("images", image);
      });

      // Add documents
      documents.forEach((doc) => {
        formData.append("documents", doc);
      });

      // Create or update post
      if (editPost) {
        await feedAPI.updatePost(editPost.id, formData); // was editPost._id
        toast.success("Post updated successfully");
      } else {
        await feedAPI.createPost(formData);
        toast.success("Post created successfully");
      }

      // Reset form
      setTextContent("");
      setImages([]);
      setDocuments([]);
      setImagePreviews([]);
      //spring boot backend: reset job post linking states
      setIsJobPost(false);
      setLinkedJobId("");

      // Callback
      if (onPostCreated) onPostCreated();
      onClose();
    } catch (error) {
      console.error("Post creation error:", error);
      toast.error(error.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf":
        return "📄";
      case "xlsx":
      case "xls":
        return "📊";
      case "docx":
      case "doc":
        return "📝";
      default:
        return "📎";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editPost ? "Edit Post" : "Create Post"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Text Content */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's on your mind? *
            </label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Share an announcement, job posting, or update..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="6"
              maxLength={5000}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {textContent.length} / 5000 characters
            </p>
          </div>


                    {/* Link to a Job Posting (recruiters only) */}
          {(user?.role === "recruiter" || user?.role === "admin") && myJobs.length > 0 && (
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <input
                  type="checkbox"
                  checked={isJobPost}
                  onChange={(e) => {
                    setIsJobPost(e.target.checked);
                    if (!e.target.checked) setLinkedJobId("");
                  }}
                />
                Link this post to one of your job postings
              </label>
              {isJobPost && (
                <select
                  value={linkedJobId}
                  onChange={(e) => setLinkedJobId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a job posting...</option>
                  {myJobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} — {job.location}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images ({imagePreviews.length}/5)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document List */}
          {documents.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documents ({documents.length}/3)
              </label>
              <div className="space-y-2">
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getFileIcon(doc.name)}</span>
                      <span className="text-sm text-gray-700">{doc.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Buttons */}
          <div className="flex gap-3 mb-6">
            {/* Add Images */}
            {images.length < 5 && (
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm font-medium">Add Images</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}

            {/* Add Documents */}
            {documents.length < 3 && (
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-sm font-medium">Add Documents</span>
                <input
                  type="file"
                  accept=".pdf,.xlsx,.xls,.docx,.doc"
                  multiple
                  onChange={handleDocumentChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {editPost ? "Updating..." : "Posting..."}
                </span>
              ) : editPost ? (
                "Update Post"
              ) : (
                "Post"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
