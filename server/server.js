
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const bookRoutes = require("./routes/bookRoutes");



const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes").router);
app.use("/api/books", bookRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("MongoDB error:", err));

app.get("/", (req, res) => {
    res.send("BooksMart API is running!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
