import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Add this import

const ShowVideos = () => {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Add this hook

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get("http://localhost:5001/videos");
        setVideos(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError("Failed to load videos");
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleBack = () => {
    navigate("/"); // Navigate back to WeddingPage
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-xl text-pink-600">جاري التحميل...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-8"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-6 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors duration-300 flex items-center"
        >
          <span>العودة</span>
        </button>

        {/* Enhanced Title Design */}
        <div className="text-center mb-12 relative">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-20 bg-pink-100 rounded-full opacity-50 blur-xl"></div>
          <h1 className="text-5xl font-bold text-gray-900 relative">
            <span className="relative inline-block">
              معرض الفيديو
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-pink-400 rounded-full"></div>
            </span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105"
            >
              <video
                controls
                className="w-full h-64 object-cover hover:object-contain transition-all duration-300"
                src={video.url}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          ))}
        </div>

        {videos.length === 0 && (
          <div className="text-center text-gray-500 mt-8 bg-white p-8 rounded-xl shadow-md">
            <p className="text-xl">لا توجد فيديوهات متاحة حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowVideos;
