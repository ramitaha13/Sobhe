import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, ArrowRight } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { firestore } from "../firebase"; // Firestore only (No Firebase Storage)

const UploadImage = () => {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Handle file selection and convert to Base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file); // Convert to Base64
    reader.onload = () => {
      setPreviewUrl(reader.result); // Set preview
      setImageFile(reader.result); // Save Base64 image
      setUploadSuccess(false);
    };
    reader.onerror = () => {
      console.error("Error reading the file");
    };
  };

  // Upload Base64 image to Firestore
  const handleUpload = async () => {
    if (!imageFile) return;
    setUploading(true);

    try {
      await addDoc(collection(firestore, "Images"), {
        image: imageFile, // Save Base64 directly in Firestore
        createdAt: new Date(),
      });

      setUploadSuccess(true);
      setPreviewUrl(""); // Clear preview after upload
      setImageFile(null);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/managerPage")}
          className="mb-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة
        </button>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            رفع صورة جديدة
          </h2>

          <div className="space-y-6">
            {/* Success Message */}
            {uploadSuccess && (
              <div className="p-4 bg-green-50 text-green-700 rounded-lg text-center">
                تم رفع الصورة بنجاح
              </div>
            )}

            {/* File Input */}
            <div className="flex flex-col items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                id="imageInput"
                className="hidden"
              />
              <label
                htmlFor="imageInput"
                className="cursor-pointer px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-duration-300 flex items-center"
              >
                <Upload className="ml-2 h-5 w-5" />
                اختر الصورة
              </label>
              {imageFile && (
                <p className="mt-2 text-gray-600">تم اختيار صورة</p>
              )}
            </div>

            {/* Image Preview */}
            {previewUrl && (
              <div className="mt-6 flex justify-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-80 h-80 object-cover rounded-lg shadow-md"
                />
              </div>
            )}

            {/* Upload Button */}
            <div className="flex justify-center">
              <button
                onClick={handleUpload}
                disabled={!imageFile || uploading}
                className={`px-8 py-3 bg-blue-600 text-white rounded-lg transition-colors duration-300 flex items-center
                  ${
                    !imageFile || uploading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-blue-700"
                  }`}
              >
                {uploading ? "جاري الرفع..." : "رفع الصورة"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadImage;
