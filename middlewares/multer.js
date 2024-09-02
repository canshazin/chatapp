const multer = require("multer");
const multerMemoryStorage = multer.memoryStorage();

// Configure Multer
const upload = multer({ storage: multerMemoryStorage });

module.exports = upload;
