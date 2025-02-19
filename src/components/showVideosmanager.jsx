import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react"; // Import the trash icon

const ShowVideos = () => {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    videoId: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideos();
  }, []);

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

  const handleDelete = async (filename) => {
    try {
      await axios.delete(`http://localhost:5001/videos/${filename}`);
      setDeleteModal({ show: false, videoId: null });
      fetchVideos(); // Refresh the video list
    } catch (err) {
      console.error("Error deleting video:", err);
      setError("Failed to delete video");
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  // Delete Confirmation Modal
  const DeleteModal = ({ filename }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-xl font-bold mb-4">تأكيد الحذف</h3>
        <p className="mb-6">هل أنت متأكد من حذف هذا الفيديو؟</p>
        <div className="flex justify-end space-x-4 space-x-reverse">
          <button
            onClick={() => setDeleteModal({ show: false, videoId: null })}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            إلغاء
          </button>
          <button
            onClick={() => handleDelete(filename)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );

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
        <button
          onClick={handleBack}
          className="mb-6 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors duration-300 flex items-center"
        >
          <span>العودة</span>
        </button>

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
              className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 relative group"
            >
              <video
                controls
                className="w-full h-64 object-cover hover:object-contain transition-all duration-300"
                src={video.url}
              >
                Your browser does not support the video tag.
              </video>
              {/* Delete Button */}
              <button
                onClick={() =>
                  setDeleteModal({ show: true, videoId: video.name })
                }
                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-700"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        {videos.length === 0 && (
          <div className="text-center text-gray-500 mt-8 bg-white p-8 rounded-xl shadow-md">
            <p className="text-xl">لا توجد فيديوهات متاحة حالياً</p>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.show && <DeleteModal filename={deleteModal.videoId} />}
      </div>
    </div>
  );
};

export default ShowVideos;
