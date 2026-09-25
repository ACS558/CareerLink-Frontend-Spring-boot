import { useState, useEffect } from "react";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import PostCard from "../../components/feed/PostCard";
import CreatePostModal from "../../components/feed/CreatePostModal";
import { feedAPI } from "../../services/api"; // was default import from feedAPI.js (now merged into api.js)
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

const PAGE_SIZE = 10;

const FeedPage = () => {
  const { user } = useAuth();
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      // Backend doesn't support server-side filtering or a "limit" param;
      // fetch a large page once and filter/paginate client-side below.
      const response = await feedAPI.getFeed({ page: 0, size: 200 });
      if (response.data.success) {
        setAllPosts(response.data.data.content); // Spring's Page<T> wraps the array in .content
      }
    } catch (error) {
      console.error("Fetch feed error:", error);
      toast.error("Failed to load feed");
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = (() => {
    if (filter === "announcements") return allPosts.filter((p) => p.authorRole === "ADMIN");
    if (filter === "jobs") return allPosts.filter((p) => p.isJobPost);
    if (filter === "alumni") return allPosts.filter((p) => p.authorRole === "ALUMNI");
    return allPosts;
  })();

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  const handlePostCreated = () => {
    setVisibleCount(PAGE_SIZE);
    fetchFeed();
  };

  const handlePostDeleted = (postId) => {
    setAllPosts(allPosts.filter((post) => post.id !== postId)); // was post._id
    toast.success("Post deleted");
  };

  const handlePostPinned = () => {
    fetchFeed();
  };

  const handlePostUnpinned = () => {
    fetchFeed();
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setVisibleCount(PAGE_SIZE);
  };

  const loadMore = () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + PAGE_SIZE);
      setLoadingMore(false);
    }, 200); // brief delay just to show the loading state; all data is already local
  };

  const canCreatePost = ["admin", "recruiter", "alumni"].includes(user?.role);
  const isStudent = user?.role === "student";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6 lg:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Feed</h1>
            <p className="text-gray-600 mt-1">
              {isStudent
                ? "Stay updated with announcements, job postings, and career advice"
                : "Share updates with students"}
            </p>
          </div>

          {canCreatePost && (
            <div className="mb-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Post
              </button>
            </div>
          )}

          {isStudent && (
            <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={() => handleFilterChange("all")}
                  className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                    filter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Posts
                </button>
                <button
                  onClick={() => handleFilterChange("announcements")}
                  className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                    filter === "announcements" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  📢 Announcements
                </button>
                <button
                  onClick={() => handleFilterChange("jobs")}
                  className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                    filter === "jobs" ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  💼 Job Posts
                </button>
                <button
                  onClick={() => handleFilterChange("alumni")}
                  className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                    filter === "alumni" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  🎓 Alumni Advice
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading feed...</p>
              </div>
            </div>
          ) : visiblePosts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600">
                {canCreatePost ? "Be the first to share an update!" : "Check back later for updates"}
              </p>
              {canCreatePost && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Create Your First Post
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {visiblePosts.map((post) => (
                  <PostCard
                    key={post.id} // was post._id
                    post={post}
                    currentUser={user}
                    onDelete={handlePostDeleted}
                    onPin={handlePostPinned}
                    onUnpin={handlePostUnpinned}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}

              {!hasMore && visiblePosts.length > 0 && (
                <div className="mt-6 text-center text-gray-500">
                  <p>You've reached the end of the feed</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <CreatePostModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onPostCreated={handlePostCreated} />
    </div>
  );
};

export default FeedPage;




// import { useState, useEffect, useContext } from "react";
// import Navbar from "../../components/common/Navbar";
// import Sidebar from "../../components/common/Sidebar";
// import PostCard from "../../components/feed/PostCard";
// import CreatePostModal from "../../components/feed/CreatePostModal";
// import feedAPI from "../../services/feedAPI";
// import { useAuth } from "../../context/AuthContext";
// import { toast } from "react-hot-toast";

// const FeedPage = () => {
//   const { user } = useAuth();
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [filter, setFilter] = useState("all");
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);

//   useEffect(() => {
//     fetchFeed();
//   }, [filter, page]);

//   const fetchFeed = async () => {
//     try {
//       if (page === 1) {
//         setLoading(true);
//       } else {
//         setLoadingMore(true);
//       }

//       const response = await feedAPI.getFeed({
//         page,
//         limit: 10,
//         filter,
//       });

//       if (response.data.success) {
//         if (page === 1) {
//           setPosts(response.data.posts);
//         } else {
//           setPosts((prev) => [...prev, ...response.data.posts]);
//         }
//         setHasMore(response.data.pagination.hasMore);
//       }
//     } catch (error) {
//       console.error("Fetch feed error:", error);
//       toast.error("Failed to load feed");
//     } finally {
//       setLoading(false);
//       setLoadingMore(false);
//     }
//   };

//   const handlePostCreated = () => {
//     setPage(1);
//     fetchFeed();
//   };

//   const handlePostDeleted = (postId) => {
//     setPosts(posts.filter((post) => post._id !== postId));
//     toast.success("Post deleted");
//   };

//   const handlePostPinned = (postId) => {
//     // Refresh feed to show updated pin status
//     setPage(1);
//     fetchFeed();
//   };

//   const handlePostUnpinned = (postId) => {
//     // Refresh feed to show updated pin status
//     setPage(1);
//     fetchFeed();
//   };

//   const handleFilterChange = (newFilter) => {
//     setFilter(newFilter);
//     setPage(1);
//   };

//   const loadMore = () => {
//     if (hasMore && !loadingMore) {
//       setPage((prev) => prev + 1);
//     }
//   };

//   const canCreatePost = ["admin", "recruiter", "alumni"].includes(user?.role);
//   const isStudent = user?.role === "student";

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />
//       <div className="flex">
//         <Sidebar />
//         <div className="flex-1 p-6 lg:p-8">
//           {/* Header */}
//           <div className="mb-6">
//             <h1 className="text-3xl font-bold text-gray-900">Feed</h1>
//             <p className="text-gray-600 mt-1">
//               {isStudent
//                 ? "Stay updated with announcements, job postings, and career advice"
//                 : "Share updates with students"}
//             </p>
//           </div>

//           {/* Create Post Button (Admin, Recruiter, Alumni only) */}
//           {canCreatePost && (
//             <div className="mb-6">
//               <button
//                 onClick={() => setShowCreateModal(true)}
//                 className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
//               >
//                 <svg
//                   className="w-5 h-5"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M12 4v16m8-8H4"
//                   />
//                 </svg>
//                 Create Post
//               </button>
//             </div>
//           )}

//           {/* Filter Bar (Students only) */}
//           {isStudent && (
//             <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
//               <div className="flex items-center gap-2 overflow-x-auto">
//                 <button
//                   onClick={() => handleFilterChange("all")}
//                   className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
//                     filter === "all"
//                       ? "bg-blue-600 text-white"
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   }`}
//                 >
//                   All Posts
//                 </button>
//                 <button
//                   onClick={() => handleFilterChange("announcements")}
//                   className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
//                     filter === "announcements"
//                       ? "bg-purple-600 text-white"
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   }`}
//                 >
//                   📢 Announcements
//                 </button>
//                 <button
//                   onClick={() => handleFilterChange("jobs")}
//                   className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
//                     filter === "jobs"
//                       ? "bg-orange-600 text-white"
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   }`}
//                 >
//                   💼 Job Posts
//                 </button>
//                 <button
//                   onClick={() => handleFilterChange("alumni")}
//                   className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
//                     filter === "alumni"
//                       ? "bg-blue-600 text-white"
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   }`}
//                 >
//                   🎓 Alumni Advice
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Feed */}
//           {loading ? (
//             <div className="flex items-center justify-center py-12">
//               <div className="text-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//                 <p className="mt-4 text-gray-600">Loading feed...</p>
//               </div>
//             </div>
//           ) : posts.length === 0 ? (
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
//               <div className="text-6xl mb-4">📝</div>
//               <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                 No posts yet
//               </h3>
//               <p className="text-gray-600">
//                 {canCreatePost
//                   ? "Be the first to share an update!"
//                   : "Check back later for updates"}
//               </p>
//               {canCreatePost && (
//                 <button
//                   onClick={() => setShowCreateModal(true)}
//                   className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//                 >
//                   Create Your First Post
//                 </button>
//               )}
//             </div>
//           ) : (
//             <>
//               {/* Posts List */}
//               <div className="space-y-4">
//                 {posts.map((post) => (
//                   <PostCard
//                     key={post._id}
//                     post={post}
//                     currentUser={user}
//                     onDelete={handlePostDeleted}
//                     onPin={handlePostPinned}
//                     onUnpin={handlePostUnpinned}
//                   />
//                 ))}
//               </div>

//               {/* Load More Button */}
//               {hasMore && (
//                 <div className="mt-6 flex justify-center">
//                   <button
//                     onClick={loadMore}
//                     disabled={loadingMore}
//                     className="px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {loadingMore ? (
//                       <span className="flex items-center gap-2">
//                         <svg
//                           className="animate-spin h-5 w-5"
//                           viewBox="0 0 24 24"
//                         >
//                           <circle
//                             className="opacity-25"
//                             cx="12"
//                             cy="12"
//                             r="10"
//                             stroke="currentColor"
//                             strokeWidth="4"
//                             fill="none"
//                           />
//                           <path
//                             className="opacity-75"
//                             fill="currentColor"
//                             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                           />
//                         </svg>
//                         Loading...
//                       </span>
//                     ) : (
//                       "Load More"
//                     )}
//                   </button>
//                 </div>
//               )}

//               {!hasMore && posts.length > 0 && (
//                 <div className="mt-6 text-center text-gray-500">
//                   <p>You've reached the end of the feed</p>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       {/* Create Post Modal */}
//       <CreatePostModal
//         isOpen={showCreateModal}
//         onClose={() => setShowCreateModal(false)}
//         onPostCreated={handlePostCreated}
//       />
//     </div>
//   );
// };

// export default FeedPage;
