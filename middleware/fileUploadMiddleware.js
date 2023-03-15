const multer = require("multer");
const { v1: uuid } = require("uuid");
const fs = require("fs");

const MIME_TYPES = {
    "image/png": "png",
    "image/jpg": "jpg",
    "image/jpeg": "jpeg",
};

const fileUpload = multer({
    limits: 50000,
    storage: multer.diskStorage({
        destination: (req, file, callback) => {
            if (file.fieldname == "placeImage") {
                if (!fs.existsSync("uploads/images/places")) {
                    fs.mkdirSync("./uploads/images/places", {
                        recursive: true,
                    });
                }
                callback(null, "uploads/images/places");
            } else if (file.fieldname == "userImage") {
                if (!fs.existsSync("uploads/images/users")) {
                    fs.mkdirSync("./uploads/images/users", { recursive: true });
                }
                callback(null, "uploads/images/users");
            }
        },
        filename: (req, file, callback) => {
            const extension = MIME_TYPES[file.mimetype];
            callback(null, uuid() + "." + extension);
        },
    }),
    fileFilter: (req, file, callback) => {
        const isValid = !!MIME_TYPES[file.mimetype];
        let error = isValid ? null : new Error("Invalid Mime Type");
        callback(error, isValid);
    }, // it will add the filter validation on the uploaded file.
});

module.exports = fileUpload;
