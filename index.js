const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("./routes");
const dotenv = require("dotenv");
const adminRouter = require("./routes/admin");

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
// Routes
app.use("/api", routes);
app.use("/api/admin", adminRouter);

// Connect to MongoDB
mongoose
  .connect(process.env.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
