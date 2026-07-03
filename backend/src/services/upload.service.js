import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import prisma from "../config/prisma.js";

// Use memory storage so we can stream to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

/**
 * Upload an image buffer to Cloudinary and save the URL to the database.
 * @param {Buffer} buffer - The image buffer from multer
 * @param {string} listingId - The listing to attach the photo to
 */
export const uploadListingPhoto = async (buffer, listingId) => {
  // Verify listing exists
  const listing = await prisma.roomListing.findUnique({ where: { id: listingId } });
  if (!listing) throw new Error("Listing not found");

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "rent-flatmate-finder/listings",
        resource_type: "image",
        transformation: [{ width: 1200, height: 800, crop: "limit", quality: "auto" }],
      },
      async (error, result) => {
        if (error) return reject(error);
        try {
          const photo = await prisma.listingPhoto.create({
            data: { imageUrl: result.secure_url, listingId },
          });
          resolve(photo);
        } catch (dbErr) {
          reject(dbErr);
        }
      }
    );
    uploadStream.end(buffer);
  });
};
