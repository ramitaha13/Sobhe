import React, { useState, useEffect, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { firestore } from "../firebase";

const ShowImages = () => {
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid", "carousel", or "slideshow"
  const [isPlaying, setIsPlaying] = useState(false);
  const [slideshowSpeed, setSlideshowSpeed] = useState(2000); // 2 seconds per slide
  const carouselRef = useRef(null);
  const fullscreenImageRef = useRef(null);
  const slideshowTimerRef = useRef(null);
  const navigate = useNavigate();

  // Touch handling state
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Selected images for slideshow (initially all)
  const [slideshowImages, setSlideshowImages] = useState([]);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "Images"));
        const imageList = querySnapshot.docs.map((doc) => doc.data().image);
        setImages(imageList);
        setSlideshowImages(imageList); // Initially use all images
        setLoading(false);
      } catch (err) {
        console.error("Error fetching images:", err);
        setError("فشل تحميل الصور");
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isFullscreen) return;

      if (e.key === "Escape") {
        closeFullscreen();
      } else if (e.key === "ArrowRight") {
        // Navigate to previous image (RTL layout)
        navigateImages(-1);
      } else if (e.key === "ArrowLeft") {
        // Navigate to next image (RTL layout)
        navigateImages(1);
      } else if (e.key === " ") {
        // Space key to toggle slideshow play/pause
        if (viewMode === "slideshow") {
          toggleSlideshow();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, currentImageIndex, images.length, viewMode, isPlaying]);

  // Scroll to center the active image in carousel view
  useEffect(() => {
    if (
      (viewMode === "carousel" || viewMode === "slideshow") &&
      carouselRef.current &&
      currentImageIndex !== null
    ) {
      const carousel = carouselRef.current;
      const imageElement = carousel.children[currentImageIndex];

      if (imageElement) {
        const scrollPosition =
          imageElement.offsetLeft -
          carousel.clientWidth / 2 +
          imageElement.clientWidth / 2;

        carousel.scrollTo({
          left: scrollPosition,
          behavior: "smooth",
        });
      }
    }
  }, [viewMode, currentImageIndex]);

  // Slideshow auto-advancing
  useEffect(() => {
    if (viewMode === "slideshow" && isPlaying && slideshowImages.length > 0) {
      slideshowTimerRef.current = setTimeout(() => {
        // Move to next image
        let newIndex = currentImageIndex + 1;
        if (newIndex >= slideshowImages.length) {
          newIndex = 0; // Loop back to start
        }
        setCurrentImageIndex(newIndex);
      }, slideshowSpeed);

      return () => {
        if (slideshowTimerRef.current) {
          clearTimeout(slideshowTimerRef.current);
        }
      };
    }
  }, [
    currentImageIndex,
    isPlaying,
    viewMode,
    slideshowImages.length,
    slideshowSpeed,
  ]);

  const handleBack = () => {
    // Stop slideshow if running when navigating away
    if (isPlaying) {
      setIsPlaying(false);
      if (slideshowTimerRef.current) {
        clearTimeout(slideshowTimerRef.current);
      }
    }
    navigate("/");
  };

  const openFullscreen = (index) => {
    setCurrentImageIndex(index);
    setIsFullscreen(true);
    document.body.style.overflow = "hidden";
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    document.body.style.overflow = "auto";
  };

  const navigateImages = (direction) => {
    if (slideshowImages.length <= 1) return;

    let newIndex = currentImageIndex + direction;

    // Loop around if at the end or beginning
    if (newIndex >= slideshowImages.length) {
      newIndex = 0;
    } else if (newIndex < 0) {
      newIndex = slideshowImages.length - 1;
    }

    setCurrentImageIndex(newIndex);
  };

  const toggleViewMode = () => {
    // If switching to slideshow, prepare and start it
    if (viewMode !== "slideshow") {
      setViewMode("slideshow");
      setCurrentImageIndex(0); // Start from first image
      setIsPlaying(true); // Auto-start slideshow
    } else {
      // If already in slideshow, switch back to grid
      setViewMode("grid");
      setIsPlaying(false);
      if (slideshowTimerRef.current) {
        clearTimeout(slideshowTimerRef.current);
      }
    }
  };

  const toggleSlideshow = () => {
    setIsPlaying(!isPlaying);
  };

  const changeSlideSpeed = (newSpeed) => {
    setSlideshowSpeed(newSpeed);
  };

  // Handle scroll wheel in carousel view - without preventDefault
  const handleWheel = (e) => {
    if (
      (viewMode === "carousel" || viewMode === "slideshow") &&
      carouselRef.current
    ) {
      // Don't use preventDefault() here as wheel events are passive by default
      carouselRef.current.scrollLeft += e.deltaY;
    }
  };

  // Use touch-based scrolling for mobile instead
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    const handleMouseDown = (e) => {
      isDown = true;
      carousel.classList.add("active");
      startX = e.pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      carousel.classList.remove("active");
    };

    const handleMouseUp = () => {
      isDown = false;
      carousel.classList.remove("active");
    };

    const handleMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed multiplier
      carousel.scrollLeft = scrollLeft - walk;
    };

    carousel.addEventListener("mousedown", handleMouseDown);
    carousel.addEventListener("mouseleave", handleMouseLeave);
    carousel.addEventListener("mouseup", handleMouseUp);
    carousel.addEventListener("mousemove", handleMouseMove);

    return () => {
      carousel.removeEventListener("mousedown", handleMouseDown);
      carousel.removeEventListener("mouseleave", handleMouseLeave);
      carousel.removeEventListener("mouseup", handleMouseUp);
      carousel.removeEventListener("mousemove", handleMouseMove);
    };
  }, [carouselRef.current, viewMode]);

  // Handle carousel image selection
  const selectCarouselImage = (index) => {
    setCurrentImageIndex(index);
    // If in slideshow mode and user manually selects an image, pause the slideshow
    if (viewMode === "slideshow" && isPlaying) {
      setIsPlaying(false);
    }
  };

  // Touch event handlers for fullscreen swipe navigation
  const onTouchStart = (e) => {
    setTouchEnd(null); // Reset touchEnd
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // In RTL layout, right swipe means previous (navigateImages(-1))
    // and left swipe means next (navigateImages(1))
    if (isRightSwipe) {
      navigateImages(-1); // Previous image
    }
    if (isLeftSwipe) {
      navigateImages(1); // Next image
    }
  };

  // Calculate what images to show based on current mode
  const displayImages = viewMode === "slideshow" ? slideshowImages : images;

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center"
        dir="rtl"
      >
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-xl text-pink-600">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center"
        dir="rtl"
      >
        <div className="bg-white p-6 rounded-xl shadow-lg text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="text-xl text-red-600 mb-2">{error}</div>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors duration-300"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-pink-50 to-white"
      dir="rtl"
    >
      {/* Header Section with Navbar */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors duration-300 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-1 rtl:rotate-180"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            العودة
          </button>

          {images.length > 0 && (
            <div className="flex items-center space-x-2 space-x-reverse">
              <button
                onClick={toggleViewMode}
                className={`px-4 py-2 ${
                  viewMode === "slideshow"
                    ? "bg-pink-600 text-white"
                    : "bg-white text-pink-600 border border-pink-300"
                } rounded-lg hover:bg-pink-700 hover:text-white transition-colors duration-300 flex items-center`}
              >
                {viewMode === "slideshow" ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    عرض الشبكة
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                    عرض الشريط
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Section */}
        <div className="text-center mb-12 relative">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-20 bg-pink-100 rounded-full opacity-50 blur-xl"></div>
          <h1 className="text-5xl font-bold text-gray-900 relative">
            <span className="relative inline-block">
              معرض الصور
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-pink-400 rounded-full"></div>
            </span>
          </h1>
        </div>

        {/* Content Section */}
        {images.length > 0 ? (
          <div className="mb-12">
            {/* Slideshow View */}
            {viewMode === "slideshow" && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                {/* Featured Image - with fade transition effect */}
                <div
                  className="mb-8 bg-gray-50 p-4 rounded-lg relative overflow-hidden"
                  style={{ minHeight: "400px" }}
                >
                  <div className="transition-opacity duration-500 ease-in-out">
                    <img
                      key={currentImageIndex}
                      src={slideshowImages[currentImageIndex]}
                      alt={`صورة ${currentImageIndex + 1}`}
                      className="max-h-96 max-w-full mx-auto object-contain rounded-lg shadow-sm"
                    />
                  </div>

                  {/* Play/Pause Button Overlay */}
                  <div className="absolute top-4 right-4 flex space-x-2 space-x-reverse">
                    <button
                      onClick={toggleSlideshow}
                      className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
                    >
                      {isPlaying ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Slideshow controls */}
                <div className="flex justify-between items-center mb-6">
                  <div className="text-gray-700">
                    <span className="font-medium">{currentImageIndex + 1}</span>{" "}
                    / {slideshowImages.length}
                  </div>

                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="text-sm text-gray-600">السرعة:</div>
                    <button
                      onClick={() => changeSlideSpeed(1000)}
                      className={`px-2 py-1 rounded ${
                        slideshowSpeed === 1000
                          ? "bg-pink-100 text-pink-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      سريع
                    </button>
                    <button
                      onClick={() => changeSlideSpeed(2000)}
                      className={`px-2 py-1 rounded ${
                        slideshowSpeed === 2000
                          ? "bg-pink-100 text-pink-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      متوسط
                    </button>
                    <button
                      onClick={() => changeSlideSpeed(4000)}
                      className={`px-2 py-1 rounded ${
                        slideshowSpeed === 4000
                          ? "bg-pink-100 text-pink-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      بطيء
                    </button>
                  </div>
                </div>

                {/* Thumbnails */}
                <div
                  ref={carouselRef}
                  className="flex overflow-x-auto pb-4 space-x-4 space-x-reverse scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-pink-100 scrollbar-thumb-rounded-full"
                  onWheel={handleWheel}
                >
                  {slideshowImages.map((image, index) => (
                    <div
                      key={index}
                      className={`flex-shrink-0 cursor-pointer transition-all duration-300 ${
                        currentImageIndex === index
                          ? "ring-4 ring-pink-500 ring-opacity-70 rounded-lg transform scale-105"
                          : "opacity-70 hover:opacity-100"
                      }`}
                      onClick={() => selectCarouselImage(index)}
                    >
                      <img
                        src={image}
                        alt={`صورة مصغرة ${index + 1}`}
                        className="h-24 w-24 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>

                {/* Navigation Controls */}
                <div className="flex justify-center mt-6 space-x-4 space-x-reverse">
                  <button
                    onClick={() => navigateImages(-1)}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors duration-300 flex items-center"
                    disabled={slideshowImages.length <= 1}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    السابق
                  </button>

                  <button
                    onClick={toggleSlideshow}
                    className={`px-4 py-2 text-white rounded-lg transition-colors duration-300 flex items-center ${
                      isPlaying
                        ? "bg-gray-600 hover:bg-gray-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 ml-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        إيقاف
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 ml-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                        تشغيل
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => navigateImages(1)}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors duration-300 flex items-center"
                    disabled={slideshowImages.length <= 1}
                  >
                    التالي
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.707 4.293a1 1 0 010 1.414L5.414 10l4.293 4.293a1 1 0 11-1.414 1.414l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>

                {/* Fullscreen button */}
                <div className="text-center mt-6">
                  <button
                    onClick={() => openFullscreen(currentImageIndex)}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 inline-flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    عرض ملء الشاشة
                  </button>
                </div>
              </div>
            )}

            {/* Grid View - Always exactly 2 photos per line */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="group bg-white rounded-xl shadow-md overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1"
                    onClick={() => openFullscreen(index)}
                  >
                    <div className="relative">
                      <img
                        src={image}
                        alt={`Uploaded ${index}`}
                        className="w-full h-40 sm:h-56 md:h-64 object-cover transition-all duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                        <button className="bg-white/90 text-pink-600 rounded-full px-4 py-2 text-sm font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          عرض الصورة
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-gray-500 text-sm">
                        صورة {index + 1} من {images.length}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 text-pink-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-2xl font-medium text-gray-600 mb-4">
              لا توجد صور متاحة حالياً
            </p>
            <p className="text-gray-500 mb-6">
              يمكنك رفع الصور من خلال الصفحة الرئيسية
            </p>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors duration-300"
            >
              العودة للصفحة الرئيسية
            </button>
          </div>
        )}
      </main>

      {/* Fullscreen Modal with touch events - Minimal Controls */}
      {isFullscreen && currentImageIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Close button - No background color */}
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 text-white w-10 h-10 flex items-center justify-center transition-opacity duration-300 z-10 opacity-60 hover:opacity-100"
            aria-label="إغلاق"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Slideshow control in fullscreen mode */}
          {viewMode === "slideshow" && (
            <button
              onClick={toggleSlideshow}
              className="absolute top-4 left-4 text-white w-10 h-10 flex items-center justify-center transition-opacity duration-300 z-10 opacity-60 hover:opacity-100"
            >
              {isPlaying ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </button>
          )}

          {/* Navigation buttons - No background color */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => navigateImages(-1)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white w-12 h-12 flex items-center justify-center transition-opacity duration-300 opacity-60 hover:opacity-100"
                aria-label="السابق"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              <button
                onClick={() => navigateImages(1)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white w-12 h-12 flex items-center justify-center transition-opacity duration-300 opacity-60 hover:opacity-100"
                aria-label="التالي"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            </>
          )}

          {/* Image container with swipe functionality */}
          <div
            className="w-full h-full flex items-center justify-center p-4 md:p-8"
            ref={fullscreenImageRef}
          >
            <img
              src={
                viewMode === "slideshow"
                  ? slideshowImages[currentImageIndex]
                  : images[currentImageIndex]
              }
              alt={`Uploaded ${currentImageIndex}`}
              className="max-w-full max-h-full object-contain"
              // Prevent default touch behavior to avoid conflicts
              onTouchStart={(e) => e.stopPropagation()}
            />
          </div>

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white px-4 py-2 text-center text-sm opacity-60">
            <div>
              {currentImageIndex + 1} /{" "}
              {viewMode === "slideshow"
                ? slideshowImages.length
                : images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowImages;
