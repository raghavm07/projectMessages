const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const messagesFilePath = path.join(__dirname, "./messages.json");

// Utility to read messages
const readMessages = () =>
  JSON.parse(fs.readFileSync(messagesFilePath, "utf-8"));

// Utility to write messages
const writeMessages = (messages) =>
  fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2));

// GET /api/messages - Fetch all messages
router.get("/messages", (req, res) => {
  const messages = readMessages();
  res.json(messages);
});

// POST /api/messages/update - Update a message with reaction or reply
router.post("/messages/update", (req, res) => {
  const { id, reaction, reply } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Message ID is required" });
  }

  const messages = readMessages();
  const message = messages.find((msg) => msg.id === id);

  if (!message) {
    return res.status(404).json({ error: "Message not found" });
  }

  // Handle reaction update
  if (reaction) {
    message.reactions[reaction] = (message.reactions[reaction] || 0) + 1;
  }

  // Handle reply addition
  if (reply) {
    const newReply = {
      ...reply,
      replyId: uuidv4(), // Assign a unique replyId
    };
    message.replies.push(newReply);
  }

  writeMessages(messages);

  res.json({ message: "Message updated successfully", data: message });
});

// POST /api/messages/update-reply - Update a specific reply
router.post("/messages/update-reply", (req, res) => {
  const { id, replyId, employeeId, updatedReply } = req.body;

  if (!id || !replyId || !employeeId || !updatedReply) {
    return res.status(400).json({
      error: "Message ID, replyId, employeeId, and updatedReply are required",
    });
  }

  const messages = readMessages();
  const message = messages.find((msg) => msg.id === id);

  if (!message) {
    return res.status(404).json({ error: "Message not found" });
  }

  const replyIndex = message.replies.findIndex(
    (reply) => reply.replyId === replyId && reply.employeeId === employeeId
  );

  if (replyIndex === -1) {
    return res
      .status(403)
      .json({ error: "You are not authorized to update this reply" });
  }

  // Update the reply
  message.replies[replyIndex].message = updatedReply.message;

  writeMessages(messages);

  res.json({
    message: "Reply updated successfully",
    data: message.replies[replyIndex],
  });
});

module.exports = router;
