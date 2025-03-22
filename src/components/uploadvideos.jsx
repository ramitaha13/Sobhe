import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "../firebase"; // Importing the firestore from your firebase config
import { ArrowRight, Upload } from "lucide-react";

const VideoUploader = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate(); // Hook for navigation

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("video/")) {
      setFile(selectedFile);

      // Create video preview URL
      const videoUrl = URL.createObjectURL(selectedFile);
      setPreview(videoUrl);

      // Reset states when a new file is selected
      setError("");
      setUploadSuccess(false);
    } else if (selectedFile) {
      setError("الرجاء اختيار ملف فيديو");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "rami123"); // Using your Cloudinary upload preset

      // Upload to Cloudinary (video upload endpoint)
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/drrpopjnm/video/upload", // Your Cloudinary cloud name
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        // Save to Firestore
        try {
          // Create a simplified document matching your structure
          const videoData = {
            videoUrl: data.secure_url,
            createdAt: serverTimestamp(),
          };

          // Add to the "all_videos" collection to match your structure
          await addDoc(collection(firestore, "all_videos"), videoData);

          setUploadSuccess(true);
          setFile(null);
          // Keep the preview for user confirmation that it worked
        } catch (firestoreError) {
          console.error("Error saving to Firestore:", firestoreError);
          setError(
            "تم رفع الفيديو إلى Cloudinary ولكن فشل الحفظ في قاعدة البيانات"
          );
        }
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      console.error("Error uploading to Cloudinary:", err);
      setError("فشل رفع الفيديو. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (preview) {
      URL.revokeObjectURL(preview); // Clean up the object URL
      setPreview(null);
    }
    setError("");
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-8"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/managerPage")}
          className="mb-6 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors duration-300 flex items-center"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة
        </button>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            رفع فيديو جديد
          </h2>

          <div className="space-y-6">
            {/* Success Message */}
            {uploadSuccess && (
              <div className="p-4 bg-green-50 text-green-700 rounded-lg text-center">
                تم رفع الفيديو بنجاح
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg text-center">
                {error}
              </div>
            )}

            {/* File Input */}
            <div className="flex flex-col items-center">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                id="videoInput"
                className="hidden"
              />
              <label
                htmlFor="videoInput"
                className="cursor-pointer px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-duration-300 flex items-center"
              >
                <Upload className="ml-2 h-5 w-5" />
                اختر الفيديو
              </label>
              {file && (
                <p className="mt-2 text-gray-600">
                  تم اختيار فيديو: {file.name}
                </p>
              )}
            </div>

            {/* Video Preview */}
            {preview && (
              <div className="mt-6 flex justify-center">
                <div className="relative w-full max-w-xl">
                  <video
                    src={preview}
                    className="w-full rounded-lg shadow-md"
                    controls
                  />
                  <button
                    onClick={clearFile}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <span className="block h-5 w-5 flex items-center justify-center font-bold text-xs">
                      ✕
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex justify-center">
              <button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className={`px-8 py-3 bg-pink-600 text-white rounded-lg transition-colors duration-300 flex items-center ${
                  !file || isUploading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-pink-700"
                }`}
              >
                {isUploading ? "جاري الرفع..." : "رفع الفيديو"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoUploader;
