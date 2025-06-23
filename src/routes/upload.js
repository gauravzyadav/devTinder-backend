const express = require("express");
const upload = require("../middlewares/upload");
const cloudinary = require("../config/cloudinary");
const { userAuth } = require("../middlewares/auth");

const uploadRouter = express.Router();

// Upload photo endpoint
uploadRouter.post("/photo", userAuth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'devtinder/profile_photos', // Organize in folders
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    res.json({ 
      photoUrl: result.secure_url,
      publicId: result.public_id 
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

module.exports = uploadRouter;