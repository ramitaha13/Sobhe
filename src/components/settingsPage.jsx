import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Eye, EyeOff } from "lucide-react";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

const SettingsPage = () => {
  const navigate = useNavigate();
  const db = getFirestore();

  // Direct reference to the document "users/HZKTZ7ZRqVxFB1PlKXjC"
  const docRef = doc(db, "users", "HZKTZ7ZRqVxFB1PlKXjC");

  // State for password updates
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch existing user data (e.g., current password)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCurrentPassword(data.password || "");
        } else {
          console.error("No user found with that ID");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUser();
  }, [docRef]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleChangePassword = async () => {
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await updateDoc(docRef, { password: newPassword });
      setSuccessMessage("تم تغيير كلمة المرور بنجاح");
      setNewPassword("");
    } catch (error) {
      setErrorMessage("حدث خطأ أثناء تغيير كلمة المرور");
      console.error("Error updating password:", error);
    } finally {
      setIsSubmitting(false);
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
            <h1 className="text-2xl font-bold text-pink-600">الإعدادات</h1>
            {/* Placeholder for spacing */}
            <div className="w-24" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            خيارات الإعدادات
          </h2>
          {/* Change Password Section */}
          <div>
            <div className="flex items-center mb-2">
              <Lock className="h-6 w-6 text-pink-600 mr-3" />
              <span className="text-gray-900">تغيير كلمة المرور</span>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              كلمة المرور الحالية:{" "}
              <span className="font-semibold">{currentPassword}</span>
            </p>
            <div className="relative mt-2 w-full sm:w-1/2">
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الجديدة"
                className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={isSubmitting}
              className={`mt-4 px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 ${
                isSubmitting
                  ? "bg-pink-400 cursor-not-allowed"
                  : "bg-pink-600 hover:bg-pink-700"
              }`}
            >
              تغيير
            </button>
            {successMessage && (
              <p className="text-green-600 mt-2">{successMessage}</p>
            )}
            {errorMessage && (
              <p className="text-red-600 mt-2">{errorMessage}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
