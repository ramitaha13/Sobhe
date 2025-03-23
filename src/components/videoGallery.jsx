import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  X,
  Share2,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Heart,
} from "lucide-react";
// Import the logo
import LogoImage from "../assets/logo.png";

const VideoGallery = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [thumbnailsReady, setThumbnailsReady] = useState({});
  const videoRefs = useRef({});
  const fullscreenVideoRefs = useRef({});
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const observerRef = useRef(null);
  // Use this to track selected video ID when entering fullscreen
  const selectedVideoId = useRef(null);
  // Flag to know when we've entered fullscreen and refs are ready
  const fullscreenInitialized = useRef(false);
  // Track play state for UI
  const [playStates, setPlayStates] = useState({});
  // Track when play indicator should be shown
  const [showPlayIndicator, setShowPlayIndicator] = useState(false);
  // Track likes for each video
  const [likes, setLikes] = useState({});
  // Track if like animation is showing
  const [showLikeAnimation, setShowLikeAnimation] = useState({});
  // Track last tap time for double-tap detection
  const lastTapTimeRef = useRef({});

  // Check for desktop/mobile viewport
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const videoCollection = collection(firestore, "all_videos");
      const videoSnapshot = await getDocs(videoCollection);

      const videoList = videoSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isPlaying: false,
        thumbnailReady: false,
      }));

      // Initialize likes state
      const initialLikes = {};
      videoList.forEach((video) => {
        initialLikes[video.id] = video.likes || 0;
      });
      setLikes(initialLikes);

      setVideos(videoList);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching videos:", err);
      setError("فشل في تحميل الفيديوهات. يرجى المحاولة مرة أخرى لاحقًا.");
      setLoading(false);
    }
  };

  // Generate thumbnails from videos
  useEffect(() => {
    if (videos.length > 0 && !loading) {
      videos.forEach((video) => {
        // Skip if thumbnail is already generated
        if (thumbnailsReady[video.id]) return;

        const videoEl = videoRefs.current[video.id];
        if (!videoEl) return;

        // When metadata loads, seek to middle of video for better thumbnail
        const handleMetadataLoaded = () => {
          if (videoEl.duration) {
            // Seek to 30% of the video for a representative frame
            videoEl.currentTime = videoEl.duration * 0.3;
          }
        };

        // Mark thumbnail as ready once we've seeked to the right position
        const handleSeeked = () => {
          setThumbnailsReady((prev) => ({
            ...prev,
            [video.id]: true,
          }));

          // Clean up listeners
          videoEl.removeEventListener("loadedmetadata", handleMetadataLoaded);
          videoEl.removeEventListener("seeked", handleSeeked);
        };

        if (videoEl.readyState >= 1) {
          // Video metadata already loaded
          handleMetadataLoaded();

          // Listen for when seeking is complete
          videoEl.addEventListener("seeked", handleSeeked, { once: true });
        } else {
          // Wait for metadata to load first
          videoEl.addEventListener("loadedmetadata", handleMetadataLoaded, {
            once: true,
          });
          videoEl.addEventListener("seeked", handleSeeked, { once: true });
        }
      });
    }
  }, [videos, videoRefs.current, loading]);

  // Effect to update video mute state when isMuted changes
  useEffect(() => {
    if (showFullscreen && videos.length > 0) {
      const activeVideo = videos[activeVideoIndex];
      if (activeVideo) {
        const videoEl = fullscreenVideoRefs.current[activeVideo.id];
        if (videoEl) {
          videoEl.muted = isMuted;
        }
      }
    }
  }, [isMuted, activeVideoIndex, showFullscreen, videos]);

  // CRITICAL FIX: Handler for when showFullscreen changes
  // This is the first part of the fix - capturing entry to fullscreen mode
  useEffect(() => {
    if (showFullscreen && videos.length > 0) {
      // Store video ID of the selected video
      if (videos[activeVideoIndex]) {
        selectedVideoId.current = videos[activeVideoIndex].id;
      }

      // Pause all videos first
      Object.values(fullscreenVideoRefs.current).forEach((videoEl) => {
        if (videoEl) {
          videoEl.pause();
          videoEl.muted = isMuted;
        }
      });

      // Mark that we need to initialize the fullscreen view
      fullscreenInitialized.current = false;
    } else {
      // Reset when exiting fullscreen
      fullscreenInitialized.current = false;
      selectedVideoId.current = null;
    }
  }, [showFullscreen, videos]);

  // CRITICAL FIX: Play the correct video after fullscreen view is rendered
  // This separates the initialization from playing to ensure refs are ready
  useEffect(() => {
    // Only run if we're in fullscreen mode
    if (showFullscreen && videos.length > 0 && !fullscreenInitialized.current) {
      // Get all video elements
      const videoElements = document.querySelectorAll(".video-container");
      if (videoElements.length > 0) {
        // Once DOM is ready with video containers, play the right video
        if (videos[activeVideoIndex]) {
          const videoId = videos[activeVideoIndex].id;
          const videoEl = fullscreenVideoRefs.current[videoId];

          if (videoEl) {
            // Pause all others first
            Object.entries(fullscreenVideoRefs.current).forEach(([id, el]) => {
              if (el && id !== videoId) {
                el.pause();
              }
            });

            // Play the selected video
            videoEl.currentTime = 0;
            videoEl.muted = isMuted;
            videoEl
              .play()
              .then(() => {
                // Update play state
                setPlayStates((prev) => ({
                  ...prev,
                  [videoId]: true,
                }));
              })
              .catch((err) => console.log("Autoplay prevented:", err));

            // Scroll to the selected video
            if (scrollRef.current && videoElements[activeVideoIndex]) {
              videoElements[activeVideoIndex].scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }

            // Mark as initialized
            fullscreenInitialized.current = true;
          }
        }
      }
    }
  }, [showFullscreen, videos, activeVideoIndex, fullscreenVideoRefs.current]);

  // Set up Intersection Observer to detect which video is in view
  useEffect(() => {
    if (videos.length > 0 && showFullscreen) {
      const options = {
        root: null,
        rootMargin: "0px",
        threshold: 0.8, // 80% of the item must be visible
      };

      // Disconnect previous observer if exists
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // Create new observer
      observerRef.current = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const videoId = entry.target.dataset.id;
            const index = videos.findIndex((v) => v.id === videoId);

            if (index !== -1 && index !== activeVideoIndex) {
              setActiveVideoIndex(index);

              // Pause all videos and play the current one
              videos.forEach((video, idx) => {
                const videoEl = fullscreenVideoRefs.current[video.id];
                if (videoEl) {
                  if (idx === index) {
                    videoEl.currentTime = 0;
                    videoEl.muted = isMuted;
                    videoEl
                      .play()
                      .then(() => {
                        // Update play state for this video
                        setPlayStates((prev) => ({
                          ...prev,
                          [video.id]: true,
                        }));
                      })
                      .catch((err) => console.log("Autoplay prevented:", err));
                  } else {
                    videoEl.pause();
                    // Update play state for paused videos
                    setPlayStates((prev) => ({
                      ...prev,
                      [video.id]: false,
                    }));
                  }
                }
              });
            }
          }
        });
      }, options);

      // Observe all video containers
      const containers = document.querySelectorAll(".video-container");
      containers.forEach((container) => {
        observerRef.current.observe(container);
      });

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }
  }, [videos, showFullscreen, isMuted, activeVideoIndex]);

  // Handle video thumbnail click to open fullscreen
  const handleVideoClick = (index) => {
    setActiveVideoIndex(index);
    setShowFullscreen(true);
    document.body.style.overflow = "hidden";
  };

  // Close fullscreen mode
  const closeFullscreen = () => {
    setShowFullscreen(false);
    document.body.style.overflow = "auto";

    // Pause all videos
    Object.values(fullscreenVideoRefs.current).forEach((videoEl) => {
      if (videoEl) {
        videoEl.pause();
      }
    });
  };

  // Toggle mute state - with corrected implementation
  const handleToggleMute = (e) => {
    e.stopPropagation(); // Prevent event bubbling

    // Toggle mute state
    setIsMuted(!isMuted);
  };

  // Toggle play/pause for current video
  const togglePlayPause = (e, videoId) => {
    e.stopPropagation(); // Prevent event bubbling

    const videoEl = fullscreenVideoRefs.current[videoId];
    if (videoEl) {
      if (videoEl.paused) {
        videoEl
          .play()
          .then(() => {
            // Update play state
            setPlayStates((prev) => ({
              ...prev,
              [videoId]: true,
            }));

            // Show play indicator briefly
            setShowPlayIndicator(false);
          })
          .catch((err) => console.log("Play prevented:", err));
      } else {
        videoEl.pause();
        // Update play state
        setPlayStates((prev) => ({
          ...prev,
          [videoId]: false,
        }));

        // Show pause indicator briefly
        setShowPlayIndicator(true);

        // Hide indicator after a brief moment
        setTimeout(() => {
          setShowPlayIndicator(false);
        }, 800);
      }
    }
  };

  // Handle double tap to like
  const handleVideoDoubleTap = async (e, videoId) => {
    e.stopPropagation(); // Prevent toggling play/pause

    const now = new Date().getTime();
    const lastTap = lastTapTimeRef.current[videoId] || 0;
    const doubleTapDelay = 300; // ms between taps to count as double-tap

    // Update the last tap time
    lastTapTimeRef.current[videoId] = now;

    // If double tap detected
    if (now - lastTap < doubleTapDelay) {
      // Clear the last tap timer to prevent triple tap
      lastTapTimeRef.current[videoId] = 0;

      // Calculate tap position for animation
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update likes in state and show animation
      setLikes((prev) => ({
        ...prev,
        [videoId]: (prev[videoId] || 0) + 1,
      }));

      // Show like animation
      setShowLikeAnimation((prev) => ({
        ...prev,
        [videoId]: { show: true, x, y },
      }));

      // Hide animation after animation completes
      setTimeout(() => {
        setShowLikeAnimation((prev) => ({
          ...prev,
          [videoId]: { ...prev[videoId], show: false },
        }));
      }, 1000);

      try {
        // Update likes in Firestore
        const videoRef = doc(firestore, "all_videos", videoId);
        await updateDoc(videoRef, {
          likes: increment(1),
        });
        console.log("Like added successfully");
      } catch (err) {
        console.error("Error adding like:", err);
      }
    }
  };

  // Handle direct like button click (separate from double-tap)
  const handleLikeClick = async (e, videoId) => {
    e.stopPropagation(); // Prevent event bubbling

    // Update likes in state
    setLikes((prev) => ({
      ...prev,
      [videoId]: (prev[videoId] || 0) + 1,
    }));

    try {
      // Update likes in Firestore
      const videoRef = doc(firestore, "all_videos", videoId);
      await updateDoc(videoRef, {
        likes: increment(1),
      });
      console.log("Like added successfully");
    } catch (err) {
      console.error("Error adding like:", err);
    }
  };

  // Navigate between videos
  const handleNavigation = (direction) => {
    if (direction === "next" && activeVideoIndex < videos.length - 1) {
      setActiveVideoIndex(activeVideoIndex + 1);
    } else if (direction === "prev" && activeVideoIndex > 0) {
      setActiveVideoIndex(activeVideoIndex - 1);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showFullscreen) {
        if (e.key === "ArrowDown" || e.key === "j") {
          handleNavigation("next");
        } else if (e.key === "ArrowUp" || e.key === "k") {
          handleNavigation("prev");
        } else if (e.key === "Escape") {
          closeFullscreen();
        } else if (e.key === "m") {
          setIsMuted(!isMuted);
        } else if (e.key === " ") {
          e.preventDefault();
          if (videos[activeVideoIndex]) {
            const e = { stopPropagation: () => {} };
            togglePlayPause(e, videos[activeVideoIndex].id);
          }
        } else if (e.key === "l") {
          // Added 'l' key for liking (optional)
          if (videos[activeVideoIndex]) {
            const e = { stopPropagation: () => {} };
            handleLikeClick(e, videos[activeVideoIndex].id);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showFullscreen, activeVideoIndex, videos, isMuted]);

  if (loading) {
    return (
      <div
        className="min-h-screen bg-black flex justify-center items-center"
        dir="rtl"
      >
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          <p className="mt-4 text-white font-medium">
            جاري تحميل الفيديوهات...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen bg-black p-6 flex justify-center items-center"
        dir="rtl"
      >
        <div className="bg-gray-900 border-l-4 border-red-500 text-white p-4 rounded shadow-md max-w-sm w-full">
          <div className="flex items-center">
            <div className="text-lg">⚠️</div>
            <div className="mr-3">
              <p className="font-medium">{error}</p>
              <button
                onClick={() => fetchVideos()}
                className="mt-2 text-sm font-medium text-pink-400 hover:text-pink-300"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-sm z-10 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-gray-700 font-medium"
        >
          <ArrowRight className="ml-1 h-5 w-5" />
          <span>العودة</span>
        </button>
        <h1 className="text-xl font-bold text-gray-800">معرض الفيديوهات</h1>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </header>

      {/* Grid Feed (Like TikTok "For You" page) */}
      <div className="p-2 lg:p-6">
        {/* Responsive grid: 2 columns on mobile, 3 on tablet, 4 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-4">
          {videos.map((video, index) => (
            <div
              key={video.id}
              className="aspect-[9/16] relative rounded-md overflow-hidden bg-gray-800 cursor-pointer shadow-md transition-transform hover:scale-105 hover:shadow-lg"
              onClick={() => handleVideoClick(index)}
            >
              {/* Thumbnail video element */}
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <video
                  ref={(el) => {
                    videoRefs.current[video.id] = el;
                  }}
                  src={video.videoUrl}
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline
                  muted
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Loading indicator (shows until thumbnail is ready) */}
              {!thumbnailsReady[video.id] && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                </div>
              )}

              {/* Overlay with info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent/0 flex flex-col justify-end p-3">
                <div className="flex justify-between items-center">
                  <p className="text-white text-sm font-bold truncate">
                    فيديو {index + 1}
                  </p>
                  {/* Show likes count in grid view too */}
                  <div className="flex items-center">
                    <Heart className="w-4 h-4 text-pink-500 fill-pink-500 ml-1" />
                    <span className="text-white text-xs">
                      {likes[video.id] || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen TikTok-style feed with desktop enhancements */}
      {showFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex">
          {/* Close button */}
          <button
            onClick={closeFullscreen}
            className="absolute top-3 left-3 z-50 bg-black/50 p-2 rounded-full text-white hover:bg-black/70"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Desktop: Show navigation arrows on sides if on desktop */}
          {isDesktop && (
            <>
              {activeVideoIndex > 0 && (
                <button
                  onClick={() => handleNavigation("prev")}
                  className="absolute left-5 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 p-3 rounded-full text-white z-40"
                >
                  <ChevronUp className="h-8 w-8" />
                </button>
              )}
              {activeVideoIndex < videos.length - 1 && (
                <button
                  onClick={() => handleNavigation("next")}
                  className="absolute left-5 top-2/3 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 p-3 rounded-full text-white z-40"
                >
                  <ChevronDown className="h-8 w-8" />
                </button>
              )}
            </>
          )}

          {/* Desktop: Keyboard shortcuts help */}
          {isDesktop && (
            <div className="absolute top-3 right-3 z-50 bg-black/50 p-2 rounded text-white text-xs">
              <p>
                ↑/↓: التنقل | م: كتم | مسافة: تشغيل/إيقاف | ل: إعجاب | Esc:
                إغلاق
              </p>
            </div>
          )}

          {/* Vertical scrollable feed */}
          <div
            ref={scrollRef}
            className={`h-full ${
              isDesktop ? "w-4/5 mx-auto" : "w-full"
            } overflow-y-scroll snap-y snap-mandatory`}
            style={{ scrollSnapType: "y mandatory" }}
          >
            {videos.map((video, index) => (
              <div
                key={video.id}
                className="video-container h-full w-full snap-start snap-always relative flex items-center justify-center"
                data-id={video.id}
              >
                {/* Video player container with double-tap detection */}
                <div
                  className={`relative ${
                    isDesktop ? "w-3/4 h-full mx-auto" : "w-full h-full"
                  }`}
                  onClick={(e) => togglePlayPause(e, video.id)}
                  onDoubleClick={(e) => handleVideoDoubleTap(e, video.id)}
                >
                  <video
                    ref={(el) => {
                      fullscreenVideoRefs.current[video.id] = el;
                    }}
                    src={video.videoUrl}
                    className={`w-full h-full ${
                      isDesktop ? "object-contain" : "object-cover"
                    }`}
                    playsInline
                    loop
                    muted={isMuted}
                    controls={false}
                  >
                    Your browser does not support the video tag.
                  </video>

                  {/* Play/Pause indicator overlay */}
                  {showPlayIndicator && activeVideoIndex === index && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none z-10 transition-opacity duration-300">
                      <div className="bg-black/50 rounded-full p-4">
                        {playStates[video.id] ? (
                          <Play className="w-10 h-10 text-white" />
                        ) : (
                          <Pause className="w-10 h-10 text-white" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Double-tap like animation */}
                  {showLikeAnimation[video.id]?.show && (
                    <div
                      className="pointer-events-none absolute z-20"
                      style={{
                        left: `${showLikeAnimation[video.id]?.x}px`,
                        top: `${showLikeAnimation[video.id]?.y}px`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <Heart
                        className="text-pink-500 fill-pink-500 animate-like"
                        style={{
                          width: "80px",
                          height: "80px",
                          animation: "like 1s ease-in-out",
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* UI overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Video info at bottom */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 p-4 pointer-events-auto ${
                      isDesktop ? "w-3/4 mx-auto" : "w-full"
                    }`}
                  >
                    <div className="flex flex-col">
                      <p className="text-white font-bold">فيديو {index + 1}</p>
                      {/* Show likes count with heart icon */}
                      <div className="flex items-center mt-1">
                        <Heart className="w-4 h-4 text-pink-500 fill-pink-500 ml-1" />
                        <span className="text-white text-xs">
                          {likes[video.id] || 0} إعجاب
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sound control - with pointer-events-auto to make it clickable */}
                  <div
                    className={`absolute top-4 ${
                      isDesktop ? "right-1/4 -mr-10" : "right-4"
                    } pointer-events-auto z-20`}
                  >
                    <button
                      className="bg-black/30 p-2 rounded-full hover:bg-black/50"
                      onClick={handleToggleMute}
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? (
                        <VolumeX className="w-6 h-6 text-white" />
                      ) : (
                        <Volume2 className="w-6 h-6 text-white" />
                      )}
                    </button>
                  </div>

                  {/* Action buttons without circular frames */}
                  <div
                    className={`absolute bottom-20 ${
                      isDesktop ? "right-1/4 -mr-10" : "right-3"
                    } flex flex-col items-center gap-6 pointer-events-auto z-20`}
                  >
                    {/* Logo (keeping the circular style for just the logo) */}
                    <div className="action-item">
                      <div className="logo-circle">
                        <img
                          src={LogoImage}
                          alt="Logo"
                          className="w-10 h-10 object-contain"
                        />
                      </div>
                    </div>

                    {/* Like button - no frame, just the icon */}
                    <div className="action-item">
                      <button
                        className="icon-button"
                        onClick={(e) => handleLikeClick(e, video.id)}
                      >
                        <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
                      </button>
                      <span className="text-white text-xs mt-1">
                        {likes[video.id] || 0}
                      </span>
                    </div>

                    {/* Share button - no frame, just the icon */}
                    <div className="action-item">
                      <button
                        className="icon-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Implement share functionality
                          if (navigator.share) {
                            navigator
                              .share({
                                title: `فيديو ${index + 1}`,
                                text: "شاهد هذا الفيديو الرائع!",
                                url: window.location.href,
                              })
                              .catch((err) =>
                                console.log("Share failed:", err)
                              );
                          } else {
                            // Fallback for browsers that don't support Web Share API
                            alert("تم نسخ رابط الفيديو!");
                          }
                        }}
                      >
                        <Share2 className="w-8 h-8 text-white" />
                      </button>
                      <span className="text-white text-xs mt-1">مشاركة</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add CSS for the styles */}
      <style>{`
        /* Animation for the like hearts */
        @keyframes like {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          15% {
            opacity: 1;
            transform: scale(1.3);
          }
          30% {
            transform: scale(0.95);
          }
          45%, 80% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: scale(0);
          }
        }
        
        /* Animation class for the heart icon */
        .animate-like {
          animation: like 1s ease-in-out forwards;
        }
        
        /* Action items styling */
        .action-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 4px;
        }
        
        /* Only the logo gets a circular background */
        .logo-circle {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 44px;
          height: 44px;
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 9999px;
          padding: 2px;
        }
        
        /* Icon buttons have no background */
        .icon-button {
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          padding: 4px;
          transition: transform 0.2s;
        }
        
        .icon-button:hover {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
};

export default VideoGallery;
