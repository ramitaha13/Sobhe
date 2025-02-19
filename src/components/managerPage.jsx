import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Image, Video, Users, Settings } from "lucide-react";

const ManagerPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const menuItems = [
    {
      title: "إدارة الصور",
      icon: <Image className="h-8 w-8 text-pink-600" />,
      onClick: () => navigate("/imagesforadmin"),
      description: "إضافة وتعديل معرض الصور",
    },
    {
      title: "عرض الصور",
      icon: <Image className="h-8 w-8 text-pink-600" />,
      onClick: () => navigate("/showImahesforadmin"),
      description: "تعديل معرض الصور",
    },
    {
      title: "إدارة الفيديو",
      icon: <Video className="h-8 w-8 text-pink-600" />,
      onClick: () => navigate("/home"),
      description: "إضافة  مقاطع الفيديو",
    },
    {
      title: "عرض الفيديو",
      icon: <Image className="h-8 w-8 text-pink-600" />,
      onClick: () => navigate("/showVideosmanager"),
      description: "تعديل معرض الفيديو",
    },
    {
      title: "إدارة المستخدمين",
      icon: <Users className="h-8 w-8 text-pink-600" />,
      onClick: () => navigate("/users"),
      description: "إدارة حسابات المستخدمين",
    },
    {
      title: "الإعدادات",
      icon: <Settings className="h-8 w-8 text-pink-600" />,
      onClick: () => navigate("/settings"),
      description: "إعدادات النظام",
    },
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-pink-50 to-white"
      dir="rtl"
    >
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-pink-600">لوحة التحكم</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">مرحباً، {user.username}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                <LogOut className="h-4 w-4 ml-2" />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={item.onClick}
              className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="flex flex-col items-center text-center">
                {item.icon}
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-gray-500">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManagerPage;
