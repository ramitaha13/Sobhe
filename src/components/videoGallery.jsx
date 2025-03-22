import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebase";
import { useNavigate } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";

const VideoGallery = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
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
      className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-8"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="mb-6 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors duration-300 flex items-center"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة
        </button>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            معرض الفيديوهات
          </h2>

          {videos.length === 0 ? (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-600">
                لا توجد فيديوهات. قم برفع بعض الفيديوهات لعرضها هنا.
              </p>
              <button
                onClick={() => navigate("/upload-video")}
                className="mt-4 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors duration-300"
              >
                رفع فيديو جديد
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative">
                    <video
                      src={video.videoUrl}
                      className="w-full h-48 object-cover"
                      onClick={() => handleVideoSelect(video)}
                    >
                      Your browser does not support the video tag.
                    </video>
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity duration-300"
                      onClick={() => handleVideoSelect(video)}
                    >
                      <div className="bg-pink-600 text-white p-2 rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-sm text-gray-500">
                      فيديو {index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video Modal - Fixed smaller size */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeEnlargedView}
        >
          <div
            className="bg-white rounded-lg w-full max-w-md"
            style={{ maxHeight: "80vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">عرض الفيديو</h3>
              <button
                onClick={closeEnlargedView}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <div
                className="w-full"
                style={{ maxHeight: "400px", height: "auto" }}
              >
                <video
                  src={selectedVideo.videoUrl}
                  className="w-full h-auto rounded-md"
                  style={{ maxHeight: "400px" }}
                  controls
                  controlsList="nodownload"
                  preload="metadata"
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
