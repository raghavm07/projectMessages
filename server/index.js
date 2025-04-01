const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Import routes
const messagesRoutes = require("./messages");
const greetingsRoutes = require("./greetings");
const cardsRoutes = require("./cards");

const app = express();
const PORT = 5500;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api", messagesRoutes);
app.use("/api/greetings", greetingsRoutes);
app.use("/api/cards", cardsRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
