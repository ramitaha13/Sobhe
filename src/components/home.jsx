import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, ArrowRight } from "lucide-react";

function VideoUploadAPI() {
  const navigate = useNavigate();
  const [videoFile, setVideoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!videoFile) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("video", videoFile);

    try {
      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      setUploadSuccess(true);
      setVideoFile(null);
      setPreviewUrl("");
    } catch (error) {
      console.error("Error uploading video:", error);
    } finally {
      setUploading(false);
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

            {/* File Input */}
            <div className="flex flex-col items-center">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
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
              {videoFile && (
                <p className="mt-2 text-gray-600">
                  تم اختيار: {videoFile.name}
                </p>
              )}
            </div>

            {/* Video Preview */}
            {previewUrl && (
              <div className="mt-6">
                <video
                  src={previewUrl}
                  controls
                  className="w-full rounded-lg shadow-md"
                />
              </div>
            )}

            {/* Upload Button */}
            <div className="flex justify-center">
              <button
                onClick={handleUpload}
                disabled={!videoFile || uploading}
                className={`px-8 py-3 bg-pink-600 text-white rounded-lg transition-colors duration-300 flex items-center
                  ${
                    !videoFile || uploading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-pink-700"
                  }`}
              >
                {uploading ? "جاري الرفع..." : "رفع الفيديو"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoUploadAPI;
