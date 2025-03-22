import React, { useState, useEffect, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebase";
import { useNavigate } from "react-router-dom";
import { ArrowRight, X, Play } from "lucide-react";

const VideoGallery = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [thumbnails, setThumbnails] = useState({});
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
      }));

      setVideos(videoList);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching videos:", err);
      setError("فشل في تحميل الفيديوهات. يرجى المحاولة مرة أخرى لاحقًا.");
      setLoading(false);
    }
  };

  // Generate thumbnails for videos
  useEffect(() => {
    const generateThumbnails = async () => {
      const newThumbnails = { ...thumbnails };

      for (const video of videos) {
        if (!videoRefs.current[video.id]) continue;

        const videoElement = videoRefs.current[video.id];

        // Only proceed if this video's thumbnail hasn't been generated yet
        if (!newThumbnails[video.id]) {
          // Make sure metadata is loaded
          if (videoElement.readyState === 0) {
            // If metadata not loaded, add event listener for when it is
            videoElement.addEventListener(
              "loadedmetadata",
              () => {
                // Set current time to 1 second (or half duration if video is short)
                const seekTime =
                  videoElement.duration > 2 ? 1.0 : videoElement.duration / 2;
                videoElement.currentTime = seekTime;
              },
              { once: true }
            );
          } else {
            // Metadata already loaded, set time directly
            const seekTime =
              videoElement.duration > 2 ? 1.0 : videoElement.duration / 2;
            videoElement.currentTime = seekTime;
          }

          // When time updates after seeking
          videoElement.addEventListener(
            "timeupdate",
            function onTimeUpdate() {
              if (videoElement.currentTime > 0) {
                // Remove the event listener to avoid multiple captures
                videoElement.removeEventListener("timeupdate", onTimeUpdate);

                // Mark this thumbnail as generated
                newThumbnails[video.id] = true;
                setThumbnails(newThumbnails);
              }
            },
            { once: true }
          );
        }
      }
    };

    if (videos.length > 0 && !loading) {
      const timeoutId = setTimeout(generateThumbnails, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [videos, loading, thumbnails]);

  // Handle video selection for modal view
  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
  };

  // Close modal view
  const closeEnlargedView = () => {
    setSelectedVideo(null);
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
          onClick={() => navigate("/")}
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
              <p className="text-gray-600">لا توجد فيديوهات متاحة حالياً.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  className="rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 bg-gray-800"
                >
                  <div className="relative aspect-video">
                    {/* Thumbnail video element */}
                    <video
                      ref={(el) => {
                        videoRefs.current[video.id] = el;
                      }}
                      src={video.videoUrl}
                      className="absolute inset-0 w-full h-full object-cover"
                      crossOrigin="anonymous"
                      preload="metadata"
                      playsInline
                      muted
                      onClick={() => handleVideoSelect(video)}
                    >
                      Your browser does not support the video tag.
                    </video>

                    {/* Gradient overlay to ensure play button visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>

                    {/* Play button overlay */}
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      onClick={() => handleVideoSelect(video)}
                    >
                      <div className="bg-pink-600 bg-opacity-80 text-white p-3 rounded-full hover:bg-opacity-100 transition-all duration-300 z-10">
                        <Play className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3 text-white">
                    <div className="text-sm font-medium">فيديو {index + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={closeEnlargedView}
        >
          <div
            className="bg-gray-900 rounded-lg w-full max-w-md"
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGallery;
