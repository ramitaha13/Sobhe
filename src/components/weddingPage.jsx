import React from "react";
import {
  Heart,
  Camera,
  Video,
  Music,
  Utensils,
  MapPin,
  Phone,
  Calendar,
  Mail,
  LogIn,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const WeddingPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleVideoClick = () => {
    navigate("/showVideos");
  };

  const handlePhotoClick = () => {
    navigate("/showImages"); // Navigate to ShowImages page
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-pink-50 to-white"
      dir="rtl"
    >
      {/* Header with Login Button */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-pink-600">أعراس الفرح</h1>
            </div>
            <button
              onClick={handleLogin}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              <LogIn className="h-4 w-4 ml-2" />
              تسجيل الدخول
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">اجعل يومك الخاص</span>
              <span className="block text-pink-600">لا يُنسى</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              نقدم خدمات متكاملة لتنظيم حفلات الزفاف بأعلى مستويات الجودة
              والاحترافية
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <a
                  href="#"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 md:py-4 md:text-lg md:px-10"
                >
                  احجز موعدك الآن
                  <Calendar className="mr-2 h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              خدماتنا المميزة
            </h2>
          </div>

          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2">
            {/* Photo Service Button */}
            <div
              onClick={handlePhotoClick}
              className="bg-pink-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center">
                <Camera className="h-12 w-12 text-pink-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  التصوير
                </h3>
                <p className="text-gray-600 text-center text-lg">
                  تصوير احترافي لتوثيق كل لحظة جميلة
                </p>
              </div>
            </div>

            {/* Video Service Button */}
            <div
              onClick={handleVideoClick}
              className="bg-pink-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center">
                <Video className="h-12 w-12 text-pink-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  الفيديو
                </h3>
                <p className="text-gray-600 text-center text-lg">
                  توثيق لحظاتك الجميلة بأحدث تقنيات التصوير
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500">
              جميع الحقوق محفوظة © 2025 أعراس الفرح
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WeddingPage;
