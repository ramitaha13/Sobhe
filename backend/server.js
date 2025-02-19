const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());

// Define absolute path for the 'uploads' folder
const uploadDir = path.join(__dirname, "uploads");

// Ensure 'uploads' directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Create folder if it doesn't exist
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Use absolute path
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Upload Video Endpoint
app.post("/upload", upload.single("video"), (req, res) => {
  if (!req.file) {
    console.error("No file uploaded");
    return res.status(400).json({ error: "No file uploaded." });
  }

  // Generate file URL
  const fileUrl = `http://localhost:5001/uploads/${req.file.filename}`;
  console.log("File uploaded successfully:", fileUrl);
  res.json({ videoUrl: fileUrl });
});

// Get All Videos Endpoint
app.get("/videos", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error("Error reading uploads directory:", err);
      return res.status(500).json({ error: "Error reading uploads directory" });
    }

    // Filter for video files and map to include URLs
    const videos = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return [".mp4", ".avi", ".mov", ".wmv"].includes(ext);
      })
      .map((filename) => ({
        name: filename,
        url: `http://localhost:5001/uploads/${filename}`,
        path: path.join(uploadDir, filename),
      }));

    res.json(videos);
  });
});

// Delete Video Endpoint
app.delete("/videos/:filename", (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(uploadDir, filename);

  fs.unlink(filepath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
      return res.status(500).json({ error: "Error deleting file" });
    }
    res.json({ message: "File deleted successfully" });
  });
});

// Serve uploaded files
app.use("/uploads", express.static(uploadDir));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
