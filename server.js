const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const productRoutes = require("./routes/productRoutes");

app.use(cors());
app.use(express.json());
app.use("/api/products", productRoutes);

// Test API
app.get("/", (req, res) => {
    res.send("Amazon Product Database API is running!");
});

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Atlas Connected Successfully!");

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB Connection Failed:", error.message);
    });