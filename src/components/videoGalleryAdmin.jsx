import React, { useState, useEffect, useRef } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { firestore } from "../firebase";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Trash2, X, Play } from "lucide-react";

const VideoGallery = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const videoRefs = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const videoCollection = collection(firestore, "all_videos");
      const videoSnapshot = await getDocs(videoCollection);

      const videoList = videoSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        thumbnailGenerated: false,
      }));

      setVideos(videoList);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching videos:", err);
      setError("فشل في تحميل الفيديوهات. يرجى المحاولة مرة أخرى لاحقًا.");
      setLoading(false);
    }
  };

  // Generate thumbnails once videos are loaded
  useEffect(() => {
    if (videos.length > 0) {
      // Allow time for video elements to be created in the DOM
      const timeoutId = setTimeout(() => {
        videos.forEach((video) => {
          const videoElement = videoRefs.current[video.id];
          if (videoElement && !video.thumbnailGenerated) {
            // Listen for when video metadata is loaded to capture thumbnail
            videoElement.addEventListener("loadeddata", () => {
              // Set the time to a point in the video (e.g., 1 second)
              videoElement.currentTime = 1.0;
            });

            // When time updates, the video frame will be at the specified timestamp
            videoElement.addEventListener(
              "timeupdate",
              function onTimeUpdate() {
                // Only proceed if we've actually seeked to a new timestamp
                if (videoElement.currentTime > 0) {
                  // Remove the event listener to avoid multiple captures
                  videoElement.removeEventListener("timeupdate", onTimeUpdate);

                  // Update the state to indicate thumbnail has been generated
                  setVideos((prevVideos) =>
                    prevVideos.map((v) =>
                      v.id === video.id ? { ...v, thumbnailGenerated: true } : v
                    )
                  );
                }
              }
            );
          }
        });
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [videos]);

  // Handle video selection for modal view
  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
  };

  // Close modal view
  const closeEnlargedView = () => {
    setSelectedVideo(null);
  };

  // Delete video from Firestore
  const handleDeleteVideo = async (videoId, e) => {
    e.stopPropagation(); // Prevent opening the video

    if (window.confirm("هل أنت متأكد من حذف هذا الفيديو؟")) {
      try {
        await deleteDoc(doc(firestore, "all_videos", videoId));
        // Remove from state
        setVideos(videos.filter((video) => video.id !== videoId));
        // If the deleted video is currently selected, close the modal
        if (selectedVideo && selectedVideo.id === videoId) {
          setSelectedVideo(null);
        }
      } catch (err) {
        console.error("Error deleting video:", err);
        alert("فشل في حذف الفيديو");
      }
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-8 flex justify-center items-center"
        dir="rtl"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-8 flex justify-center items-center"
        dir="rtl"
      >
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-4 sm:p-8"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/managerPage")}
          className="mb-6 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors duration-300 flex items-center"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة
        </button>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
            معرض الفيديوهات
          </h2>

          {videos.length === 0 ? (
            <div className="text-center p-4 sm:p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-600">
                لا توجد فيديوهات. قم برفع بعض الفيديوهات لعرضها هنا.
              </p>
              <button
                onClick={() => navigate("/upload-video")}
                className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors duration-300"
              >
                رفع فيديو جديد
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  className="rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative aspect-video bg-gray-900">
                    {/* Hidden video element for thumbnail generation */}
                    <video
                      ref={(el) => {
                        videoRefs.current[video.id] = el;
                      }}
                      src={video.videoUrl}
                      className="w-full h-full object-cover"
                      preload="metadata"
                      muted
                      playsInline
                      onClick={() => handleVideoSelect(video)}
                    >
                      Your browser does not support the video tag.
                    </video>

                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="bg-pink-600 bg-opacity-80 text-white p-3 rounded-full hover:bg-opacity-100 transition-all duration-300"
                        onClick={() => handleVideoSelect(video)}
                      >
                        <Play className="h-6 w-6" />
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDeleteVideo(video.id, e)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 z-10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="p-4 bg-gray-800 text-white">
                    <div className="text-sm">فيديو {index + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video Modal - Improved for mobile */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={closeEnlargedView}
        >
          <div
            className="bg-gray-900 rounded-lg w-full max-w-lg"
            style={{ maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">عرض الفيديو</h3>
              <button
                onClick={closeEnlargedView}
                className="text-gray-300 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <div className="w-full bg-black rounded-md overflow-hidden">
                <video
                  src={selectedVideo.videoUrl}
                  className="w-full h-auto"
                  style={{ maxHeight: "70vh" }}
                  controls
                  autoPlay
                  controlsList="nodownload"
                  preload="auto"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteVideo(selectedVideo.id, e);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
                >
                  <Trash2 size={16} className="ml-2" />
                  حذف الفيديو
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGallery;
