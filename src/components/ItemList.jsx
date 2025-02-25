import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// API base URL for both development and production
// In development, use localhost
// For production, replace with your actual backend URL before deploying
const API_BASE_URL = "https://sobhe.vercel.app";
// For production use: const API_BASE_URL = "https://your-backend-api-url.com";

function ItemList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState("");

  // New state variables for video upload
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Use navigate for routing
  const navigate = useNavigate();

  // Fetch items from API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        console.log("Fetching items from API...");
        const res = await axios.get(`${API_BASE_URL}/api/items`);
        console.log("Items fetched:", res.data);
        setItems(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data: ", err);
        setError("Failed to load items. Please try again later.");
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Handle video file selection
  const handleVideoChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      console.log("Video file selected:", file);
      setSelectedVideo(file);
      setUploadStatus("");
      setUploadProgress(0);
    }
  };

  // Handle video upload
  const handleVideoUpload = async (e) => {
    e.preventDefault();

    if (!selectedVideo) {
      setUploadStatus("Please select a video first");
      return;
    }

    const formData = new FormData();
    formData.append("video", selectedVideo);

    try {
      setIsUploading(true);
      setUploadStatus("Uploading...");
      console.log("Starting video upload...");

      const res = await axios.post(
        `${API_BASE_URL}/api/upload-video`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percentCompleted}%`);
            setUploadProgress(percentCompleted);
          },
        }
      );

      console.log("Upload complete:", res.data);
      setUploadStatus("Upload successful!");
      setSelectedVideo(null);
      setIsUploading(false);

      // Add the new video item to the list
      setItems([res.data, ...items]);

      // Reset the file input
      const fileInput = document.getElementById("video-file-input");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error("Error uploading video: ", err);
      setUploadStatus(
        `Upload failed: ${err.response?.data?.error || err.message}`
      );
      setIsUploading(false);
    }
  };

  // Handle item deletion
  const handleDelete = async (itemId, videoUrl) => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return;
    }

    setIsDeleting(true);
    setDeleteStatus("Deleting...");

    try {
      console.log(`Deleting item with ID: ${itemId}`);

      // Get the filename from the videoUrl if it exists
      let filename = null;
      if (videoUrl) {
        filename = videoUrl.split("/").pop();
        console.log(`Associated video file: ${filename}`);
      }

      // Delete the item from the database
      await axios.delete(`${API_BASE_URL}/api/items/${itemId}`);

      // If there's a video, also delete the file
      if (filename) {
        console.log(`Deleting video file: ${filename}`);
        await axios.delete(`${API_BASE_URL}/api/delete-video/${filename}`);
      }

      // Update the local state to remove the deleted item
      setItems(items.filter((item) => item._id !== itemId));

      setDeleteStatus("Item deleted successfully");
      setTimeout(() => setDeleteStatus(""), 3000);
    } catch (err) {
      console.error("Error deleting item: ", err);
      setDeleteStatus(
        `Delete failed: ${err.response?.data?.error || err.message}`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Navigate to manager page
  const handleBackClick = () => {
    navigate("/managerPage");
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Pink Theme Styles
  const styles = {
    container: {
      maxWidth: "800px",
      margin: "0 auto",
      padding: "20px",
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
    form: {
      marginBottom: "20px",
      display: "flex",
      gap: "10px",
    },
    input: {
      flex: 1,
      padding: "10px 15px",
      borderRadius: "25px",
      border: "2px solid #ffdeeb", // Light pink border
      backgroundColor: "#fff",
      transition: "border-color 0.3s",
      outline: "none",
      fontSize: "16px",
    },
    button: {
      padding: "10px 20px",
      backgroundColor: "#f06595", // Medium pink color
      color: "white",
      border: "none",
      borderRadius: "25px",
      cursor: "pointer",
      fontWeight: "bold",
      transition: "background-color 0.3s",
      boxShadow: "0 2px 5px rgba(240, 101, 149, 0.3)",
    },
    deleteButton: {
      padding: "6px 12px",
      backgroundColor: "#ff8da7", // Lighter pink for delete
      color: "white",
      border: "none",
      borderRadius: "20px",
      cursor: "pointer",
      fontSize: "12px",
      transition: "background-color 0.3s",
      boxShadow: "0 2px 4px rgba(255, 141, 167, 0.3)",
    },
    uploadSection: {
      marginBottom: "30px",
      padding: "20px",
      border: "2px solid #ffdeeb", // Light pink border
      borderRadius: "10px",
      backgroundColor: "#fff0f6", // Very light pink background
    },
    uploadTitle: {
      marginTop: 0,
      marginBottom: "15px",
      color: "#d6336c", // Deep pink color
      textAlign: "center",
    },
    fileInput: {
      marginBottom: "15px",
      display: "flex",
      justifyContent: "center",
    },
    progressContainer: {
      width: "100%",
      height: "20px",
      backgroundColor: "#ffdeeb", // Light pink
      borderRadius: "10px",
      marginTop: "15px",
      overflow: "hidden",
    },
    progressBar: (progress) => ({
      width: `${progress}%`,
      height: "100%",
      backgroundColor: "#f06595", // Medium pink
      textAlign: "center",
      lineHeight: "20px",
      color: "white",
      transition: "width 0.3s ease",
    }),
    statusText: (isError) => ({
      marginTop: "10px",
      color: isError ? "#e03131" : "#40c057",
      textAlign: "center",
      fontWeight: "bold",
    }),
    itemsList: {
      listStyle: "none",
      padding: 0,
      marginTop: "20px",
    },
    item: {
      padding: "15px",
      borderBottom: "1px solid #ffdeeb", // Light pink border
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      transition: "background-color 0.2s",
      borderRadius: "8px",
      marginBottom: "10px",
      backgroundColor: "white",
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)",
    },
    itemContent: {
      flex: 1,
    },
    itemActions: {
      display: "flex",
      gap: "10px",
    },
    itemName: {
      margin: 0,
      fontSize: "18px",
      display: "flex",
      alignItems: "center",
      color: "#343a40", // Dark text color
    },
    itemDate: {
      color: "#868e96", // Subtle gray color
      fontSize: "14px",
      margin: "5px 0 0",
    },
    videoTag: {
      display: "inline-block",
      backgroundColor: "#f06595", // Medium pink
      color: "white",
      padding: "3px 8px",
      borderRadius: "20px",
      fontSize: "12px",
      marginLeft: "10px",
    },
    errorMessage: {
      color: "#e03131", // Red color
      marginBottom: "15px",
      textAlign: "center",
      backgroundColor: "#fff5f5", // Very light red
      padding: "10px",
      borderRadius: "8px",
    },
    successMessage: {
      color: "#2f9e44", // Green color
      marginBottom: "15px",
      textAlign: "center",
      backgroundColor: "#f4fce3", // Very light green
      padding: "10px",
      borderRadius: "8px",
    },
    loading: {
      textAlign: "center",
      padding: "40px",
      color: "#d6336c", // Deep pink
      fontSize: "18px",
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
    noItems: {
      textAlign: "center",
      padding: "30px",
      color: "#868e96", // Gray color
      backgroundColor: "#fff8fa", // Very light pink
      borderRadius: "8px",
      border: "1px dashed #ffdeeb", // Light pink dashed border
    },
  };

  if (loading)
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.loadingSpinner}></div>
          Loading...
        </div>
      </div>
    );

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <h2 style={styles.heading}>Videos</h2>
        <button style={styles.backButton} onClick={handleBackClick}>
          Back
        </button>
      </div>

      {error && <div style={styles.errorMessage}>{error}</div>}
      {deleteStatus && (
        <div
          style={
            deleteStatus.includes("failed")
              ? styles.errorMessage
              : styles.successMessage
          }
        >
          {deleteStatus}
        </div>
      )}

      {/* Video upload section */}
      <div style={styles.uploadSection}>
        <h3 style={styles.uploadTitle}>Upload New Video</h3>
        <form onSubmit={handleVideoUpload}>
          <div style={styles.fileInput}>
            <input
              id="video-file-input"
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              disabled={isUploading}
              style={{
                padding: "8px",
                border: "2px solid #ffdeeb",
                borderRadius: "25px",
                width: "80%",
              }}
            />
          </div>

          <div style={{ textAlign: "center" }}>
            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: !selectedVideo || isUploading ? 0.7 : 1,
              }}
              disabled={!selectedVideo || isUploading}
            >
              {isUploading ? "Uploading..." : "Upload Video"}
            </button>
          </div>

          {uploadStatus && (
            <p style={styles.statusText(uploadStatus.includes("failed"))}>
              {uploadStatus}
            </p>
          )}

          {uploadProgress > 0 && (
            <div style={styles.progressContainer}>
              <div style={styles.progressBar(uploadProgress)}>
                {uploadProgress}%
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Items list */}
      {items.length > 0 ? (
        <ul style={styles.itemsList}>
          {items.map((item) => (
            <li key={item._id} style={styles.item}>
              <div style={styles.itemContent}>
                <h3 style={styles.itemName}>
                  {item.name}
                  {item.videoUrl && <span style={styles.videoTag}>Video</span>}
                </h3>
                <p style={styles.itemDate}>Added: {formatDate(item.date)}</p>
              </div>
              <div style={styles.itemActions}>
                <button
                  style={{
                    ...styles.deleteButton,
                    opacity: isDeleting ? 0.7 : 1,
                  }}
                  onClick={() => handleDelete(item._id, item.videoUrl)}
                  disabled={isDeleting}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div style={styles.noItems}>No videos uploaded yet.</div>
      )}
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

export default ItemList;
