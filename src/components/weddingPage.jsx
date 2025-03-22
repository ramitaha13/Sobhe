import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  Camera,
  Calendar,
  LogIn,
  Share2,
  Sparkles,
  Phone,
  User,
  Instagram,
  MessageCircle,
  Film,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { FaWhatsapp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const WeddingPage = () => {
  const navigate = useNavigate();
  const [profileImages, setProfileImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const appointmentSectionRef = useRef(null);

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

  useEffect(() => {
    if (profileImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === profileImages.length - 1 ? 0 : prevIndex + 1
        );
      }, 3000);
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

  const handleFeedback = () => {
    navigate("/feedbackFrames");
  };

  const handleVideoGallery = () => {
    navigate("/videoGallery");
  };

  const scrollToAppointment = () => {
    appointmentSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "صبحي طه",
          text: "احجز فرحك معنا",
          url: window.location.href,
        });
      } catch (error) {
        // Share was canceled or not supported
      }
    } else {
      alert("انسخ الرابط: " + window.location.href);
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
      <div className="relative h-[70vh] w-full flex items-center">
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

        {/* Hero Content */}
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex justify-center items-center mb-4">
              <Sparkles className="h-8 w-8 text-rose-100 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white drop-shadow mb-4">
              <span className="block">اجعل يومك الخاص</span>
              <span className="block">لا يُنسى</span>
            </h1>
            <p className="text-lg text-rose-50 max-w-2xl mx-auto leading-relaxed drop-shadow">
              نقدم خدمات متكاملة لتنظيم حفلات الزفاف بأعلى مستويات الجودة
              والاحترافية
            </p>
            <p className="mt-2 text-lg text-rose-50 max-w-2xl mx-auto drop-shadow">
              اضغط على السهم للتحديد موعدك
            </p>
            <div className="mt-8 flex justify-center">
              <button
                onClick={scrollToAppointment}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 p-4 rounded-full transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
                aria-label="Scroll to appointment section"
              >
                <ChevronDown className="h-8 w-8 text-white animate-bounce" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Services Navigation Cards - NEW SECTION */}
      <div className="py-16 -mt-12 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Photos */}
            <div
              onClick={handlePhotoClick}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer flex flex-col items-center text-center border border-rose-100"
            >
              <div className="p-4 rounded-full bg-gradient-to-r from-rose-100 to-pink-100 mb-4">
                <Camera className="h-8 w-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                الصور المميزة
              </h3>
              <p className="text-gray-600 mb-4">
                شاهد أجمل اللحظات التي وثقناها
              </p>
              <span className="text-rose-500 flex items-center text-sm mt-auto">
                مشاهدة الصور
                <ChevronRight className="h-4 w-4 mr-1" />
              </span>
            </div>

            {/* Card 2: Videos */}
            <div
              onClick={handleVideoGallery}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer flex flex-col items-center text-center border border-rose-100"
            >
              <div className="p-4 rounded-full bg-gradient-to-r from-rose-100 to-pink-100 mb-4">
                <Film className="h-8 w-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                لحظات مميزة
              </h3>
              <p className="text-gray-600 mb-4">
                شاهد أجمل الفيديوهات التي صنعناها
              </p>
              <span className="text-rose-500 flex items-center text-sm mt-auto">
                مشاهدة الفيديوهات
                <ChevronRight className="h-4 w-4 mr-1" />
              </span>
            </div>

            {/* Card 3: Feedback */}
            <div
              onClick={handleFeedback}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer flex flex-col items-center text-center border border-rose-100"
            >
              <div className="p-4 rounded-full bg-gradient-to-r from-rose-100 to-pink-100 mb-4">
                <MessageCircle className="h-8 w-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">آراء عنا</h3>
              <p className="text-gray-600 mb-4">تعرف على تجارب السابقين معنا</p>
              <span className="text-rose-500 flex items-center text-sm mt-auto">
                قراءة التقييمات
                <ChevronRight className="h-4 w-4 mr-1" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Book Appointment - Highlighted Call to Action */}
      <div
        ref={appointmentSectionRef}
        className="py-16 bg-gradient-to-r from-rose-100 to-pink-100 scroll-mt-20"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            جاهز لتحديد موعد؟
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            دعنا نساعدك في تخطيط يوم زفافك المثالي. سجل بياناتك وسنتواصل معك في
            أقرب وقت.
          </p>
          <button
            onClick={handleBookAppointment}
            className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-full text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            حدد موعد مناسبتك الآن
            <Calendar className="ml-3 h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
              تواصل معنا
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              نحن هنا للإجابة على جميع استفساراتك ومساعدتك في تنظيم يوم زفافك
              المثالي
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            <a
              href="tel:0546784883"
              className="flex items-center px-6 py-4 rounded-full bg-white border border-rose-200 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <Phone className="h-6 w-6 text-rose-500 ml-3" />
              <span className="text-lg text-gray-700">0546784883</span>
            </a>

            <div className="flex items-center px-6 py-4 rounded-full bg-white border border-rose-200 shadow-md">
              <User className="h-6 w-6 text-rose-500 ml-3" />
              <span className="text-lg text-gray-700">صبحي الجنجي</span>
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <div className="grid grid-cols-3 gap-8">
              <a
                href="https://www.instagram.com/event_jnje/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center transform hover:scale-110 transition-transform duration-200"
              >
                <div className="bg-gradient-to-r from-rose-100 to-pink-100 p-4 rounded-full mb-2">
                  <Instagram className="h-8 w-8 text-rose-500" />
                </div>
                <span className="text-gray-700">Instagram</span>
              </a>

              <a
                href="https://wa.me/message/G6C6IOTHEO3WK1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center transform hover:scale-110 transition-transform duration-200"
              >
                <div className="bg-gradient-to-r from-rose-100 to-pink-100 p-4 rounded-full mb-2">
                  <FaWhatsapp className="h-8 w-8 text-rose-500" />
                </div>
                <span className="text-gray-700">WhatsApp</span>
              </a>

              <a
                href="https://www.tiktok.com/@gnge200?_t=ZS-8u4v4Hpq28j&_r=1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center transform hover:scale-110 transition-transform duration-200"
              >
                <div className="bg-gradient-to-r from-rose-100 to-pink-100 p-4 rounded-full mb-2">
                  <SiTiktok className="h-8 w-8 text-rose-500" />
                </div>
                <span className="text-gray-700">TikTok</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 bg-gradient-to-r from-rose-50 to-pink-50 border-t border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <div className="flex items-center">
            <Heart className="h-4 w-4 text-rose-500 mr-2" />
            <p className="text-sm text-gray-600">
              زينة فرحك © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeddingPage;
