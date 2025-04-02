const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const greetingsFilePath = path.join(__dirname, "./greetings.json");

// Utility: Read greetings
const readGreetings = () => {
  try {
    return JSON.parse(fs.readFileSync(greetingsFilePath, "utf-8"));
  } catch (error) {
    console.error("Error reading greetings file:", error);
    throw new Error("Failed to read greetings data");
  }
};

// Utility: Write greetings
const writeGreetings = (greetings) => {
  try {
    fs.writeFileSync(greetingsFilePath, JSON.stringify(greetings, null, 2));
  } catch (error) {
    console.error("Error writing greetings file:", error);
    throw new Error("Failed to write greetings data");
  }
};

// GET /api/greetings
router.get("/", (req, res) => {
  try {
    const greetings = readGreetings();

    res.json(greetings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch greetings" });
  }
});

// POST /api/greetings
router.post("/", (req, res) => {
  const {
    cardId,
    message,
    employeeId,
    senderName,
    isBold = false,
    isItalic = false,
    fontFamily,
    backgroundColor,
    textColor,
    x = 0,
    y = 0,
    rotation,
  } = req.body;

  if (!cardId || !message || !employeeId || !senderName) {
    return res.status(400).json({
      error: "cardId, message, employeeId, and senderName are required",
    });
  }

  try {
    const greetings = readGreetings();
    const card = greetings.find((g) => g.cardId === cardId);

    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    const newGreeting = {
      greetingId: uuidv4(),
      message,
      employeeId,
      senderName,
      isBold,
      isItalic,
      fontFamily,
      backgroundColor,
      textColor,
      rotation,
      x,
      y,
    };

    card.greetings.push(newGreeting);
    writeGreetings(greetings);

    res.status(201).json({
      message: "Greeting added successfully",
      data: newGreeting,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to add greeting" });
  }
});

// PUT /api/greetings/:greetingId
router.put("/:greetingId", (req, res) => {
  const { greetingId } = req.params;
  console.log(greetingId);
  const {
    message,
    employeeId,
    x,
    y,
    senderName,
    isBold,
    isItalic,
    fontFamily,
    rotation,
    backgroundColor,
    textColor,
  } = req.body;
  console.log("message", message);
  console.log("employeeId", employeeId);
  console.log("x", x);
  console.log("y", y);
  console.log("senderName", senderName);
  console.log("isBold", isBold);
  console.log("rotation", rotation);
  if (!message || !employeeId) {
    return res
      .status(400)
      .json({ error: "message and employeeId are required" });
  }

  try {
    const greetings = readGreetings();
    let isUpdated = false;

    greetings.forEach((card) => {
      card.greetings.forEach((greeting) => {
        if (
          greeting.greetingId === greetingId &&
          greeting.employeeId === employeeId
        ) {
          greeting.message = message;
          greeting.senderName = senderName;
          greeting.isBold = isBold;
          greeting.isItalic = isItalic;
          greeting.fontFamily = fontFamily;
          greeting.backgroundColor = backgroundColor;
          greeting.textColor = textColor;
          greeting.rotation = rotation;
          if (x !== undefined) greeting.x = x;
          if (y !== undefined) greeting.y = y;
          isUpdated = true;
        }
      });
    });

    if (!isUpdated) {
      return res
        .status(403)
        .json({ error: "You are not authorized to update this greeting" });
    }

    writeGreetings(greetings);
    res.json({ message: "Greeting updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update greeting" });
  }
});

// DELETE /api/greetings/:greetingId
router.delete("/:greetingId", (req, res) => {
  const { greetingId } = req.params;
  const { employeeId } = req.body;

  if (!employeeId) {
    return res.status(400).json({ error: "employeeId is required" });
  }

  try {
    const greetings = readGreetings();
    let isDeleted = false;

    greetings.forEach((card) => {
      const index = card.greetings.findIndex(
        (g) => g.greetingId === greetingId && g.employeeId === employeeId
      );

      if (index !== -1) {
        card.greetings.splice(index, 1);
        isDeleted = true;
      }
    });

    if (!isDeleted) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this greeting" });
    }

    writeGreetings(greetings);
    res.json({ message: "Greeting deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete greeting" });
  }
});

module.exports = router;
