import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { assignmentId, type } = req.body;
        let uploadPath = uploadsDir;

        if (type === "assignment-file") {
            uploadPath = path.join(uploadsDir, "assignments", assignmentId);
        } else if (type === "submission") {
            uploadPath = path.join(uploadsDir, "submissions", assignmentId, req.user.sub);
        }

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = (req.body.allowedFileTypes || "pdf,doc,docx,zip,jpg,jpeg,png").split(",");
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    
    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`File type .${ext} is not allowed. Allowed types: ${allowedTypes.join(", ")}`), false);
    }
};

// Multer configuration
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(req => req.body.maxFileSizeMB || 10) * 1024 * 1024, // Default 10MB
    },
});

export const uploadAssignmentFile = upload.single("file");
export const uploadSubmissionFile = upload.single("file");
