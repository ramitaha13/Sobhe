import React, { useState, useEffect } from "react";
import {
  Heart,
  Camera,
  Music,
  Utensils,
  MapPin,
  Phone,
  Calendar,
  Mail,
  LogIn,
  Instagram,
  User,
  Share2,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SiTiktok } from "react-icons/si";
import { FaWhatsapp } from "react-icons/fa";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const WeddingPage = () => {
  const navigate = useNavigate();
  const [profileImages, setProfileImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch profile images from Firestore
  useEffect(() => {
    const fetchProfileImages = async () => {
      const db = getFirestore();
      const profileImagesRef = collection(db, "profileimages");
      try {
        const querySnapshot = await getDocs(profileImagesRef);
        const images = querySnapshot.docs.map((doc) => doc.data().image);
        setProfileImages(images);
      } catch (error) {
        console.error("Error fetching profile images:", error);
      }
    };
    fetchProfileImages();
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (profileImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === profileImages.length - 1 ? 0 : prevIndex + 1
        );
      }, 3000); // Change slide every 3 seconds

      return () => clearInterval(interval);
    }
  }, [profileImages]);

  const handleLogin = () => {
    navigate("/login");
  };

  const handlePhotoClick = () => {
    navigate("/showImages");
  };

  const handleBookAppointment = () => {
    navigate("/bookAppointmentButton");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "صبحي طه",
          text: "احجز فرحك معنا",
          url: window.location.href,
        });
      } catch (error) {}
    } else {
      alert("نسخ الرابط: " + window.location.href);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-50"
      dir="rtl"
    >
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm fixed w-full z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-rose-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                زينة فرحك
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleShare}
                className="inline-flex items-center p-2 text-rose-500 hover:text-rose-600 focus:outline-none transition-colors duration-200"
                aria-label="Share"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogin}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-full text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <LogIn className="h-4 w-4 ml-2" />
                تسجيل الدخول
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center">
        {/* Background Slider */}
        <div className="absolute inset-0 overflow-hidden">
          {profileImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <img src={image} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          {/* Overlay gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/30" />
          <div className="absolute inset-0 bg-rose-900/20" />
        </div>

        {/* Content */}
        <div className="relative pt-32 pb-20 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center items-center mb-6">
                <Sparkles className="h-8 w-8 text-rose-100 animate-pulse" />
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 drop-shadow-lg">
                <span className="block">اجعل يومك الخاص</span>
                <span className="block">لا يُنسى</span>
              </h1>
              <p className="mt-6 text-xl text-rose-50 max-w-3xl mx-auto leading-relaxed drop-shadow">
                نقدم خدمات متكاملة لتنظيم حفلات الزفاف بأعلى مستويات الجودة
                والاحترافية
              </p>
              <p className="mt-4 text-xl text-rose-50 max-w-3xl mx-auto drop-shadow">
                سجل تاريخ المناسبه ونحن سوف نعود للحديث معك
              </p>
              <div className="mt-10">
                <button
                  onClick={handleBookAppointment}
                  className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-full text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
                >
                  حدد موعد مناسبتك وسنتواصل معك قريبًا
                  <Calendar className="mr-3 h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photos Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
              الصور المميزة
            </h2>
          </div>
          <div className="relative">
            <div
              onClick={handlePhotoClick}
              className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-12 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-rose-100"
            >
              <div className="flex flex-col items-center justify-center">
                <div className="bg-white p-6 rounded-full shadow-lg mb-8">
                  <Camera className="h-12 w-12 text-rose-500" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  لمحة من صور شغلنا
                </h3>
                <p className="text-gray-600 text-xl text-center max-w-2xl">
                  انقر هنا لمشاهدة الصور
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-20 bg-gradient-to-t from-rose-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent mb-12">
            تواصل معنا
          </h2>
          <div className="flex flex-col items-center space-y-6">
            <a
              href="tel:0546784883"
              className="flex items-center space-x-3 bg-white px-6 py-4 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Phone className="h-6 w-6 text-rose-500" />
              <span className="text-xl text-gray-700">0546784883</span>
            </a>
            <div className="flex items-center space-x-3 bg-white px-6 py-4 rounded-full shadow-md">
              <User className="h-6 w-6 text-rose-500" />
              <span className="text-xl text-gray-700">صبحي الجنجي</span>
            </div>
            <div className="flex items-center space-x-8 mt-8">
              <a
                href="https://www.instagram.com/event_jnje/"
                target="_blank"
                rel="noopener noreferrer"
                className="transform hover:scale-110 transition-transform duration-200"
              >
                <Instagram className="h-10 w-10 text-rose-500" />
              </a>
              <a
                href="https://wa.me/message/G6C6IOTHEO3WK1"
                target="_blank"
                rel="noopener noreferrer"
                className="transform hover:scale-110 transition-transform duration-200"
              >
                <FaWhatsapp className="h-10 w-10 text-rose-500" />
              </a>
              <a
                href="https://www.tiktok.com/@gnge200?_t=ZS-8u4v4Hpq28j&_r=1"
                target="_blank"
                rel="noopener noreferrer"
                className="transform hover:scale-110 transition-transform duration-200"
              >
                <SiTiktok className="h-10 w-10 text-rose-500" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeddingPage;
