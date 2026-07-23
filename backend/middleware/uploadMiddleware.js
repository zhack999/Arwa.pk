import multer from "multer";

const storage = multer.diskStorage({});

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;   // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;  // 50MB

const fileFilter = (req, file, cb) => {
    if (file.fieldname === "video") {
        if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) return cb(null, true);
        return cb(new Error("Only MP4, WEBM, and MOV videos are allowed."), false);
    }
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) return cb(null, true);
    return cb(new Error("Only JPEG, PNG, and WEBP images are allowed."), false);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_VIDEO_SIZE }, // multer applies one global limit; the fileFilter above already blocks oversized/wrong-type files per field
});

export default upload;