const express = require("express");
const multer = require("multer");
const getColors = require("get-image-colors");
const Image = require("../models/Image");
const fs = require("fs");
const path = require("path");
const Vibrant = require("node-vibrant");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      console.log("File accepted:", file.originalname);
      return cb(null, true);
    } else {
      console.error("Invalid file type:", file.originalname);
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, and GIF files are allowed."
        )
      );
    }
  },
});

// router.post("/upload", upload.single("image"), async (req, res) => {
//   try {
//     if (!req.file) {
//       console.error("No file uploaded or invalid file type");
//       return res
//         .status(400)
//         .json({ error: "No file uploaded or invalid file type." });
//     }

//     const filePath = path.resolve(req.file.path);
//     console.log("File uploaded to:", filePath);

//     // Verify file existence before processing
//     if (!fs.existsSync(filePath)) {
//       console.error("File does not exist:", filePath);
//       return res
//         .status(500)
//         .json({ error: "File does not exist after upload." });
//     }

//     // Extract colors from image
//     getColors(filePath)
//       .then((colors) => {
//         const colorArray = colors.map((color) => color.hex());
//         console.log("Colors extracted:", colorArray);

//         const newImage = new Image({
//           imageUrl: req.file.path,
//           colors: colorArray,
//         });

//         newImage
//           .save()
//           .then((savedImage) => {
//             // Clean up the uploaded file
//             fs.unlink(filePath, (err) => {
//               if (err) console.error("Error deleting file:", err);
//               console.log("Uploaded file deleted:", filePath);
//             });

//             console.log("Image saved to database:", savedImage);
//             res.status(200).json(savedImage);
//           })
//           .catch((saveError) => {
//             console.error("Error saving image to database:", saveError);
//             res.status(500).json({ error: saveError.message });
//           });
//       })
//       .catch((colorError) => {
//         fs.unlink(filePath, (err) => {
//           if (err) console.error("Error deleting file:", err);
//           console.log(
//             "Uploaded file deleted after color extraction error:",
//             filePath
//           );
//         });
//         console.error("Error extracting colors:", colorError);
//         res.status(500).json({
//           error:
//             "Failed to extract colors from image. Make sure the file is a valid image.",
//         });
//       });
//   } catch (error) {
//     console.error("Error in upload endpoint:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      console.error("No file uploaded or invalid file type");
      return res
        .status(400)
        .json({ error: "No file uploaded or invalid file type." });
    }

    const filePath = path.resolve(req.file.path);
    console.log("File uploaded to:", filePath);

    // Verify file existence before processing
    if (!fs.existsSync(filePath)) {
      console.error("File does not exist:", filePath);
      return res
        .status(500)
        .json({ error: "File does not exist after upload." });
    }

    // Extract colors from image using node-vibrant
    Vibrant.from(filePath).getPalette((err, palette) => {
      if (err) {
        console.error("Error extracting colors:", err);
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", err);
          console.log(
            "Uploaded file deleted after color extraction error:",
            filePath
          );
        });
        return res.status(500).json({
          error:
            "Failed to extract colors from image. Make sure the file is a valid image.",
        });
      }

      const colorArray = Object.values(palette).map((swatch) =>
        swatch.getHex()
      );
      console.log("Colors extracted:", colorArray);

      const newImage = new Image({
        imageUrl: req.file.path,
        colors: colorArray,
      });

      newImage
        .save()
        .then((savedImage) => {
          // Clean up the uploaded file
          fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
            console.log("Uploaded file deleted:", filePath);
          });

          console.log("Image saved to database:", savedImage);
          res.status(200).json(savedImage);
        })
        .catch((saveError) => {
          console.error("Error saving image to database:", saveError);
          res.status(500).json({ error: saveError.message });
        });
    });
  } catch (error) {
    console.error("Error in upload endpoint:", error);
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
