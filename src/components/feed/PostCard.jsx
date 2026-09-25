import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { feedAPI } from "../../services/api"; // was default import from feedAPI.js (now merged into api.js)
import { toast } from "react-hot-toast";

const PostCard = ({ post, currentUser, onDelete, onPin, onUnpin }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewTracked, setViewTracked] = useState(false);
  const cardRef = useRef(null);


  //spring boot backend: handle navigation to linked job post based on user role
  const handleViewLinkedJob = () => {
    const role = currentUser?.role || user?.role;
    if (role === "student") navigate(`/student/jobs/${post.linkedJobId}`);
    else if (role === "recruiter") navigate(`/recruiter/jobs/${post.linkedJobId}`);
    else if (role === "admin") navigate(`/admin/jobs/${post.linkedJobId}`);
    else navigate(`/student/jobs/${post.linkedJobId}`); // fallback
  };

  // Track view when post is visible
  useEffect(() => {
    if (viewTracked) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Track view after 3 seconds of visibility
          const timer = setTimeout(() => {
            trackView();
          }, 3000);

          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.5 },
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
   }, [post.id, viewTracked]); // was post._id

  const trackView = async () => {
    try {
      await feedAPI.trackView(post.id); // was post._id
      setViewTracked(true);
    } catch (error) {
      // Silently fail
      console.log("View tracking failed");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
       await feedAPI.deletePost(post.id); // was post._id
        toast.success("Post deleted successfully");
       if (onDelete) onDelete(post.id); // was post._id
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete post");
      }
    }
  };

  const handlePin = async () => {
    try {
      await feedAPI.pinPost(post.id); // was post._id
      toast.success("Post pinned successfully");
      if (onPin) onPin(post.id); // was post._id
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to pin post");
    }
  };

  const handleUnpin = async () => {
    try {
      await feedAPI.unpinPost(post.id); // was post._id
      toast.success("Post unpinned successfully");
      if (onUnpin) onUnpin(post.id); // was post._id
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unpin post");
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const handleDocumentDownload = (doc) => {
    const downloadUrl = doc.url.replace("/upload/", "/upload/fl_attachment/");

    window.open(downloadUrl, "_blank");
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return postDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        postDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) { // was switch (role)
      case "admin":
        return "bg-purple-100 text-purple-700";
      case "recruiter":
        return "bg-orange-100 text-orange-700";
      case "alumni":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
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

  const isAuthor = currentUser?.userId === post.authorId;
  const canModerate = currentUser?.role === "admin";
  const canPin = isAuthor || canModerate;

  return (
    <>
      <div
        ref={cardRef}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Author Photo */}
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
             {post.authorPhotoUrl ? ( // was post.authorPhoto
                <img
                 src={post.authorPhotoUrl} // was post.authorPhoto
                  alt={post.authorName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-semibold text-gray-600">
                  {post.authorName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Author Info */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">
                  {post.authorName}
                </h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(post.authorRole)}`}>
                  {post.authorRole?.charAt(0).toUpperCase() + post.authorRole?.slice(1).toLowerCase()} {/* was raw slice(1) */}
                </span>
                {post.isPinned && (
                  <span className="text-red-500 font-semibold">📌 Pinned</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{formatDate(post.createdAt)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  {post.viewCount} views
                </span>
              </div>
            </div>
          </div>

          {/* Menu Button (for author or admin) */}
          {(isAuthor || canModerate) && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  {canPin && (
                    <button
                      onClick={() => {
                        post.isPinned ? handleUnpin() : handlePin();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {post.isPinned ? "📌 Unpin Post" : "📌 Pin Post"}
                    </button>
                  )}

                  {isAuthor && (
                    <button
                      onClick={() => {
                        navigate(`/feed/edit/${post.id}`); // was post._id
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      ✏️ Edit Post
                    </button>
                  )}

                  {(isAuthor || canModerate) && (
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      🗑️ Delete Post
                    </button>
                  )}

                  {isAuthor && (
                    <button
                      onClick={() => {
                        navigate(`/feed/analytics/${post.id}`); // was post._id
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      📊 View Analytics
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Job Badge (if linked to job) */}
        {/* {post.isJobPost && post.linkedJobId && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  💼 Job Posting: {post.linkedJobId.title}
                </p>
                <p className="text-xs text-blue-600">
                  {post.linkedJobId.location} • {post.linkedJobId.jobType}
                </p>
              </div>
              <button
                onClick={() =>
                  navigate(`/student/jobs/${post.linkedJobId._id}`)
                }
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                View Job
              </button>
            </div>
          </div>
        )} */}


                {post.isJobPost && post.linkedJobId && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  💼 Job Posting: {post.linkedJobTitle || "View Details"}
                </p>
                <p className="text-xs text-blue-600">
                  {post.linkedJobLocation}
                  {post.linkedJobLocation && post.linkedJobType && " • "}
                  {post.linkedJobType}
                </p>
              </div>
              <button
                onClick={handleViewLinkedJob}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                View Job
              </button>
            </div>
          </div>
        )}

        {/* Text Content */}
        <div className="mb-4">
          <p className="text-gray-800 whitespace-pre-wrap">
            {post.textContent}
          </p>
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div
            className={`mb-4 grid gap-2 ${
              post.images.length === 1
                ? "grid-cols-1"
                : post.images.length === 2
                  ? "grid-cols-2"
                  : post.images.length === 3
                    ? "grid-cols-3"
                    : "grid-cols-2"
            }`}
          >
            {post.images.map((image, index) => (
              <div
                key={index}
                className="relative cursor-pointer rounded-lg overflow-hidden bg-gray-100"
                onClick={() => handleImageClick(image)}
              >
                <img
                  src={image.url}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-64 object-cover hover:opacity-90 transition"
                />
              </div>
            ))}
          </div>
        )}

        {/* Documents */}
        {post.documents && post.documents.length > 0 && (
          <div className="space-y-2">
            {post.documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getFileIcon(doc.fileType)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {doc.fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {doc.fileType?.toUpperCase()} •{" "}
                      {formatFileSize(doc.fileSize)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://docs.google.com/gview?url=${doc.url}&embedded=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
                  >
                    View
                  </a>

                  <button
                    onClick={() => handleDocumentDownload(doc)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
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
            <img
              src={selectedImage.url}
              alt="Full size"
              className="max-w-full max-h-screen object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PostCard;
