import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Trash2, X } from "lucide-react";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

const ProfileImages = () => {
  const navigate = useNavigate();
  const db = getFirestore();
  const profileImagesRef = collection(db, "profileimages");

  // State for image handling
  const [selectedImages, setSelectedImages] = useState([null, null, null]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [existingImages, setExistingImages] = useState([]);

  // Fetch existing profile images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const querySnapshot = await getDocs(profileImagesRef);
        const images = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          image: doc.data().image,
        }));
        setExistingImages(images);
      } catch (error) {
        console.error("Error fetching images:", error);
        setErrorMessage("حدث خطأ أثناء تحميل الصور الحالية");
      }
    };
    fetchImages();
  }, [profileImagesRef]);

  const handleBack = () => {
    navigate(-1);
  };

  // Handle file selection and convert to Base64
  const handleFileChange = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const newSelectedImages = [...selectedImages];
      newSelectedImages[index] = reader.result;
      setSelectedImages(newSelectedImages);

      setPreviewUrls((prev) => {
        const newPreviews = [...prev];
        newPreviews[index] = reader.result;
        return newPreviews;
      });

      setSuccessMessage("");
      setErrorMessage("");
    };
    reader.onerror = () => {
      setErrorMessage("حدث خطأ أثناء قراءة الملف");
    };
  };

  // Remove selected image before upload
  const handleRemoveSelected = (index) => {
    const newSelectedImages = [...selectedImages];
    newSelectedImages[index] = null;
    setSelectedImages(newSelectedImages);

    const newPreviewUrls = [...previewUrls];
    newPreviewUrls[index] = null;
    setPreviewUrls(newPreviewUrls);
  };

  // Upload Base64 images to Firestore
  const handleUpload = async () => {
    const imagesToUpload = selectedImages.filter((img) => img !== null);
    if (imagesToUpload.length === 0) return;

    if (existingImages.length + imagesToUpload.length > 3) {
      setErrorMessage("لا يمكن رفع أكثر من 3 صور");
      return;
    }

    setUploading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      for (const imageData of imagesToUpload) {
        await addDoc(profileImagesRef, {
          image: imageData,
          timestamp: new Date(),
        });
      }

      // Refresh the list of images
      const querySnapshot = await getDocs(profileImagesRef);
      const images = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        image: doc.data().image,
      }));
      setExistingImages(images);

      setSelectedImages([null, null, null]);
      setPreviewUrls([]);
      setSuccessMessage("تم رفع الصور بنجاح");
    } catch (error) {
      setErrorMessage("حدث خطأ أثناء رفع الصور");
      console.error("Error uploading images:", error);
    } finally {
      setUploading(false);
    }
  };

  // Delete profile image
  const handleDelete = async (imageId) => {
    try {
      await deleteDoc(doc(db, "profileimages", imageId));
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      setSuccessMessage("تم حذف الصورة بنجاح");
    } catch (error) {
      setErrorMessage("حدث خطأ أثناء حذف الصورة");
      console.error("Error deleting image:", error);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-pink-50 to-white"
      dir="rtl"
    >
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-pink-600 bg-pink-100 hover:bg-pink-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              <ArrowLeft className="h-4 w-4 ml-2" />
              <span>رجوع</span>
            </button>
            <h1 className="text-2xl font-bold text-pink-600">
              صور الملف الشخصي
            </h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="space-y-6">
            {/* Current Profile Images */}
            {existingImages.length > 0 && (
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  الصور الحالية
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {existingImages.map((img, index) => (
                    <div key={img.id} className="relative inline-block">
                      <img
                        src={img.image}
                        alt={`Profile ${index + 1}`}
                        className="w-48 h-48 object-cover rounded-lg shadow-md mx-auto"
                      />
                      <button
                        onClick={() => handleDelete(img.id)}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Images */}
            {existingImages.length < 3 && (
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  تحميل صور جديدة
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 3 - existingImages.length }).map(
                    (_, index) => (
                      <div key={index} className="text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(index, e)}
                          id={`profileImage${index}`}
                          className="hidden"
                        />
                        <label
                          htmlFor={`profileImage${index}`}
                          className="cursor-pointer flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed border-pink-300 rounded-lg hover:border-pink-500 transition-colors duration-300 mx-auto"
                        >
                          {previewUrls[index] ? (
                            <div className="relative w-full h-full">
                              <img
                                src={previewUrls[index]}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleRemoveSelected(index);
                                }}
                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          ) : (
                            <div className="text-center">
                              <Upload className="h-12 w-12 text-pink-400 mx-auto" />
                              <p className="mt-2 text-sm text-gray-600">
                                اختر صورة
                              </p>
                            </div>
                          )}
                        </label>
                      </div>
                    )
                  )}
                </div>

                {selectedImages.some((img) => img !== null) && (
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className={`mt-6 px-6 py-3 text-white rounded-lg transition-colors duration-300 ${
                      uploading
                        ? "bg-pink-400 cursor-not-allowed"
                        : "bg-pink-600 hover:bg-pink-700"
                    }`}
                  >
                    {uploading ? "جاري الرفع..." : "رفع الصور"}
                  </button>
                )}
              </div>
            )}

            {/* Messages */}
            {successMessage && (
              <p className="text-center text-green-600 mt-4">
                {successMessage}
              </p>
            )}
            {errorMessage && (
              <p className="text-center text-red-600 mt-4">{errorMessage}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileImages;
