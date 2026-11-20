
const express = require("express");
const { requireAdmin } = require("./authRoutes");
const router = express.Router();

const {
    getBooks,
    addBook,
    updateBook,
    deleteBook
} = require("../controllers/bookController");

router.get("/", getBooks);
router.post("/", requireAdmin, addBook);
router.put("/:id", requireAdmin, updateBook);
router.delete("/:id", requireAdmin, deleteBook);

module.exports = router;
