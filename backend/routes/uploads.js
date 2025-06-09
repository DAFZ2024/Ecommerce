const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// Configuración de Multer
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../public/images"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/upload-imagen", upload.single("imagen"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ninguna imagen" });
  }

  const rutaImagen = `/images/${req.file.filename}`;
  res.json({ rutaImagen });
});

module.exports = router;
