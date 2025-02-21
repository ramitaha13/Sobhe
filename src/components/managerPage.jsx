import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Image,
  Video,
  Settings,
  MessageSquare,
  UserCircle,
  Bell,
  X,
} from "lucide-react";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  doc,
  updateDoc,
} from "firebase/firestore";
import notificationSound from "/src/assets/5.mp3";

const ManagerPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef(null);
  const audioRef = useRef(null);
  const [previousCount, setPreviousCount] = useState(0);

  // Initialize Firestore
  const db = getFirestore();

  useEffect(() => {
    audioRef.current = new Audio(notificationSound);
  }, []);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.error("Error playing notification sound:", error);
      });
    }
  };

  useEffect(() => {
    // Set up real-time listener for notifications
    const notificationsRef = collection(db, "notifications");
    const notificationsQuery = query(
      notificationsRef,
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));

      const currentUnreadCount = notificationsList.filter(
        (n) => !n.read
      ).length;

      if (currentUnreadCount > previousCount) {
        playNotificationSound();
      }

      setNotifications(notificationsList);
      setUnreadCount(currentUnreadCount);
      setPreviousCount(currentUnreadCount);
    });

    // Add click outside listener
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup subscriptions
    return () => {
      unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [previousCount]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, {
        read: true,
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
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
      title: "إدارة الحجوزات",
      icon: <Video className="h-8 w-8 text-pink-600" />,
      onClick: () => navigate("/reservation"),
      description: "إدارة حجوزات العملاء",
    },
    {
      title: "تواصل مع الزبون",
      icon: <MessageSquare className="h-8 w-8 text-pink-600" />,
      onClick: () => navigate("/contactCustomer"),
      description: "ارسل رسالة للزبون",
    },
    {
      title: "الإعدادات",
      icon: <Settings className="h-8 w-8 text-pink-600" />,
      onClick: () => navigate("/settings"),
      description: "إعدادات النظام",
    },
    {
      title: "صور الملف الشخصي",
      icon: <UserCircle className="h-8 w-8 text-pink-600" />,
      onClick: () => navigate("/profileImages"),
      description: "إدارة صور الملف الشخصي",
    },
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-pink-50 to-white"
      dir="rtl"
    >
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-pink-600">لوحة التحكم</h1>
            </div>
            <div className="flex items-center">
              {/* Notification Bell */}
              <div className="relative ml-2 sm:ml-4" ref={notificationRef}>
                <button
                  className={`p-2 text-gray-600 hover:text-pink-600 focus:outline-none ${
                    unreadCount > 0 ? "animate-bounce" : ""
                  }`}
                  onClick={toggleNotifications}
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-pink-600 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Mobile-friendly Notifications Dropdown */}
                {isNotificationsOpen && (
                  <div className="fixed inset-x-0 top-16 mx-auto sm:absolute sm:inset-auto sm:left-0 sm:mt-2 w-full sm:w-96 bg-white shadow-lg z-50 sm:rounded-md max-h-[80vh] sm:max-h-96 overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          الإشعارات
                        </h3>
                        <button
                          onClick={() => setIsNotificationsOpen(false)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="space-y-4 overflow-y-auto max-h-[calc(80vh-8rem)] sm:max-h-72">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-3 rounded-lg ${
                                notification.read ? "bg-gray-50" : "bg-pink-50"
                              } cursor-pointer`}
                              onClick={() =>
                                !notification.read &&
                                markAsRead(notification.id)
                              }
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="text-sm text-gray-900">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatDate(notification.createdAt)}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-pink-600 rounded-full"></span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-gray-500">
                            لا توجد إشعارات
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <span className="text-gray-700 mx-2 sm:mx-4 text-sm sm:text-base">
                مرحباً، {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                <LogOut className="h-4 w-4 ml-1 sm:ml-2" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
                <span className="sm:hidden">خروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </main>
    </div>
  );
};

export default ManagerPage;
