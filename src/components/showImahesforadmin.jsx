import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { firestore } from "../firebase";
import { Trash2 } from "lucide-react";

const ShowImagesAdmin = () => {
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchImages();
  }, []);

  // Fetch all images from Firestore
  const fetchImages = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, "Images"));
      const imageList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        url: doc.data().image, // Base64 image or URL
      }));
      setImages(imageList);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching images:", err);
      setError("فشل تحميل الصور");
      setLoading(false);
    }
  };

  // Delete Image from Firestore
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "هل أنت متأكد أنك تريد حذف هذه الصورة؟"
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(firestore, "Images", id));
      setImages(images.filter((image) => image.id !== id)); // Remove from UI
    } catch (error) {
      console.error("Error deleting image:", error);
      setError("فشل حذف الصورة");
    }
  };

  const handleBack = () => {
    navigate("/managerPage");
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
              معرض الصور (الإدارة)
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-pink-400 rounded-full"></div>
            </span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {images.map((image) => (
            <div
              key={image.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 relative"
            >
              <img
                src={image.url}
                alt="Uploaded"
                className="w-full h-64 object-cover hover:object-contain transition-all duration-300"
              />

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(image.id)}
                className="absolute top-2 left-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        {images.length === 0 && (
          <div className="text-center text-gray-500 mt-8 bg-white p-8 rounded-xl shadow-md">
            <p className="text-xl">لا توجد صور متاحة حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowImagesAdmin;
