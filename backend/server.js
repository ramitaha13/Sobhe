// const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const app = express();

// Allow only your frontend to access the API
const corsOptions = {
  origin: ["https://sobhe.vercel.app"], // Add your frontend URL here
  methods: "GET,POST,DELETE",
  allowedHeaders: "Content-Type",
};

app.use(cors(corsOptions));

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

  // Generate a dynamic file URL
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;
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
        url: `${req.protocol}://${req.get("host")}/uploads/${filename}`,
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
