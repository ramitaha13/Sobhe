import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function VideoDisplay() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Use navigate for routing
  const navigate = useNavigate();

  // Fetch all items that have videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/items");
        // Filter only items that have videoUrl
        const videoItems = response.data.filter((item) => item.videoUrl);
        setVideos(videoItems);
        setLoading(false);

        // Auto-select the first video if available
        if (videoItems.length > 0 && !selectedVideo) {
          setSelectedVideo(videoItems[0]);
        }
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError("Failed to load videos. Please try again later.");
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Function to handle video selection
  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
  };

  // Navigate to manager page
  const handleBackClick = () => {
    navigate("/weddingPage");
  };

  // Function to format date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Pink Theme Styles
  const styles = {
    container: {
      padding: "20px",
      maxWidth: "1200px",
      margin: "0 auto",
      backgroundColor: "#fff0f6", // Light pink background
      borderRadius: "10px",
      boxShadow: "0 4px 15px rgba(255, 105, 180, 0.2)",
    },
    headerContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    heading: {
      color: "#d6336c", // Deep pink color for headings
      textAlign: "center",
      margin: 0,
    },
    backButton: {
      padding: "8px 16px",
      backgroundColor: "#f06595", // Medium pink color
      color: "white",
      border: "none",
      borderRadius: "25px",
      cursor: "pointer",
      fontWeight: "bold",
      boxShadow: "0 2px 5px rgba(240, 101, 149, 0.3)",
      fontSize: "14px",
    },
    gallery: {
      display: "flex",
      gap: "20px",
      marginTop: "20px",
    },
    list: {
      flex: 1,
      maxWidth: "300px",
      overflowY: "auto",
      maxHeight: "600px",
      border: "1px solid #fcc2d7", // Light pink border
      borderRadius: "10px",
      backgroundColor: "white",
      boxShadow: "0 2px 8px rgba(252, 194, 215, 0.3)",
    },
    item: (isSelected) => ({
      display: "flex",
      padding: "12px",
      borderBottom: "1px solid #fcc2d7", // Light pink border
      cursor: "pointer",
      backgroundColor: isSelected ? "#ffdeeb" : "white", // Light pink when selected
      transition: "background-color 0.3s",
    }),
    thumbnail: {
      width: "80px",
      height: "60px",
      marginRight: "10px",
      backgroundColor: "#343a40",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "6px",
      overflow: "hidden",
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    },
    thumbnailPlaceholder: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f06595", // Medium pink
    },
    videoIcon: {
      color: "white",
      fontSize: "24px",
    },
    info: {
      flex: 1,
    },
    infoTitle: {
      margin: 0,
      fontSize: "14px",
      fontWeight: "bold",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      color: "#343a40",
    },
    infoDate: {
      margin: "5px 0 0",
      fontSize: "12px",
      color: "#868e96",
    },
    player: {
      flex: 2,
      minWidth: 0,
      padding: "20px",
      backgroundColor: "white",
      border: "1px solid #fcc2d7", // Light pink border
      borderRadius: "10px",
      boxShadow: "0 2px 8px rgba(252, 194, 215, 0.3)",
    },
    playerTitle: {
      marginTop: 0,
      marginBottom: "15px",
      color: "#d6336c", // Deep pink color
      fontSize: "20px",
      textAlign: "center",
    },
    details: {
      marginTop: "20px",
      padding: "15px",
      backgroundColor: "#fff8fa", // Very light pink
      borderRadius: "8px",
      border: "1px solid #ffdeeb",
    },
    detailsText: {
      margin: "5px 0",
      fontSize: "14px",
      color: "#495057",
    },
    prompt: {
      display: "flex",
      height: "300px",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fff8fa", // Very light pink
      borderRadius: "8px",
      border: "1px dashed #ffdeeb",
    },
    promptText: {
      color: "#868e96",
      fontSize: "16px",
    },
    loading: {
      textAlign: "center",
      padding: "40px",
      color: "#d6336c", // Deep pink
      fontSize: "18px",
      backgroundColor: "#fff0f6", // Light pink background
      borderRadius: "10px",
      boxShadow: "0 4px 15px rgba(255, 105, 180, 0.2)",
    },
    loadingSpinner: {
      width: "50px",
      height: "50px",
      margin: "0 auto 20px",
      border: "5px solid #ffdeeb", // Light pink
      borderTopColor: "#d6336c", // Deep pink
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
    error: {
      textAlign: "center",
      padding: "30px",
      fontSize: "16px",
      color: "#e03131", // Red color
      backgroundColor: "#fff5f5", // Very light red
      borderRadius: "8px",
      margin: "20px auto",
      maxWidth: "800px",
    },
    noVideos: {
      textAlign: "center",
      padding: "40px",
      fontSize: "16px",
      color: "#868e96",
      backgroundColor: "#fff0f6", // Light pink background
      borderRadius: "10px",
      border: "1px dashed #ffdeeb",
      margin: "20px auto",
      maxWidth: "800px",
    },
    video: {
      width: "100%",
      borderRadius: "8px",
      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    },
    responsive: {
      gallery: {
        flexDirection: "column",
      },
      list: {
        maxWidth: "100%",
        maxHeight: "300px",
      },
    },
  };

  // Check if we need to apply responsive styles
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);

  // Set up responsive design listener
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading)
    return (
      <div style={styles.loading}>
        <div style={styles.loadingSpinner}></div>
        Loading videos...
      </div>
    );

  if (error) return <div style={styles.error}>{error}</div>;

  if (videos.length === 0)
    return <div style={styles.noVideos}>No videos have been uploaded yet.</div>;

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <h2 style={styles.heading}>Videos</h2>
        <button style={styles.backButton} onClick={handleBackClick}>
          Back
        </button>
      </div>

      <div
        style={{
          ...styles.gallery,
          ...(isSmallScreen ? styles.responsive.gallery : {}),
        }}
      >
        <div
          style={{
            ...styles.list,
            ...(isSmallScreen ? styles.responsive.list : {}),
          }}
        >
          {videos.map((video) => (
            <div
              key={video._id}
              style={styles.item(
                selectedVideo && selectedVideo._id === video._id
              )}
              onClick={() => handleVideoSelect(video)}
            >
              <div style={styles.thumbnail}>
                <div style={styles.thumbnailPlaceholder}>
                  <span style={styles.videoIcon}>▶</span>
                </div>
              </div>
              <div style={styles.info}>
                <h3 style={styles.infoTitle}>{video.name}</h3>
                <p style={styles.infoDate}>
                  Uploaded: {formatDate(video.date)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.player}>
          {selectedVideo ? (
            <>
              <h3 style={styles.playerTitle}>{selectedVideo.name}</h3>
              <video
                controls
                style={styles.video}
                src={`http://localhost:8080${selectedVideo.videoUrl}`}
              >
                Your browser does not support the video tag.
              </video>
              <div style={styles.details}>
                <p style={styles.detailsText}>
                  Uploaded on: {formatDate(selectedVideo.date)}
                </p>
                {selectedVideo.videoTitle && (
                  <p style={styles.detailsText}>
                    Original filename: {selectedVideo.videoTitle}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div style={styles.prompt}>
              <p style={styles.promptText}>
                Select a video from the list to play
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Add CSS for the loading spinner animation
const spinnerStyle = document.createElement("style");
spinnerStyle.innerHTML = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(spinnerStyle);

export default VideoDisplay;
