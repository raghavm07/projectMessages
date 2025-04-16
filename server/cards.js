const { log } = require("console");
const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const cardsFilePath = path.join(__dirname, "./greetings.json");

// Utility to read cards
const readCards = () => JSON.parse(fs.readFileSync(cardsFilePath, "utf-8"));

// Utility to write cards
const writeCards = (cards) =>
  fs.writeFileSync(cardsFilePath, JSON.stringify(cards, null, 2));

// GET /api/cards - Fetch all cards
router.get("/", (req, res) => {
  console.log("fetch all");
  try {
    const cards = readCards();
    res.json(cards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    res.status(500).json({ error: "Failed to fetch cards" });
  }
});

// GET /api/cards/search - Search for cards
router.get("/search", (req, res) => {
  const { query = "" } = req.query;
  console.log("query", query);

  try {
    const cards = readCards();
    console.log("cards", cards);

    const filteredCards = cards
      .map((card) => {
        const queryParts = query.toLowerCase().trim().split(/\s+/);

        // Check matches for cardTitle and ReciverEmployeeId
        const titleMatches = queryParts.filter((part) =>
          card.cardTitle?.toLowerCase().includes(part)
        );
        const receiverMatches = queryParts.filter((part) =>
          card.ReciverEmployeeId?.toString().toLowerCase().includes(part)
        );

        // If either matches, include the card
        if (titleMatches.length > 0 || receiverMatches.length > 0) {
          return {
            ...card,
            titleMatches,
            receiverMatches,
          };
        }

        return null;
      })
      .filter((result) => result !== null); // Remove unmatched cards

    res.json({
      message: "Search results fetched successfully",
      data: filteredCards,
    });
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).json({ error: "Failed to perform search" });
  }
});

// GET /api/cards/filter - filter for cards
// router.get("/filter", (req, res) => {
//   const { eventType, searchTerm } = req.query; // Only filter by eventType and searchTerm

//   if (!eventType) {
//     return res
//       .status(400)
//       .json({ error: "eventType query parameter is required" });
//   }

//   try {
//     const cards = readCards();

//     // If "All" or empty, return all cards found on basis of searchTerm
//     if (!eventType || eventType.toLowerCase().trim() === "all") {
//       return res.json({
//         message: "All cards fetched successfully",
//         data: cards,
//       });
//     }

//     // Filter cards where eventType matches on cards found on basis of searchTerm
//     const filteredCards = cards.filter(
//       (card) => card.eventType?.toLowerCase() === eventType.toLowerCase().trim()
//     );

//     res.json({
//       message: "Filter results fetched successfully",
//       data: filteredCards,
//     });
//   } catch (error) {
//     console.error("Error during filter:", error);
//     res.status(500).json({ error: "Failed to perform filter" });
//   }
// });

// GET /api/cards/filter - filter for cards
router.get("/filter", (req, res) => {
  const { eventType, searchQuery } = req.query; // Filter by eventType and searchQuery

  if (!eventType) {
    return res
      .status(400)
      .json({ error: "eventType query parameter is required" });
  }

  try {
    const cards = readCards();

    // Filter cards by searchQuery (if provided)
    let filteredCards = cards;

    console.log("filteredCards", filteredCards);
    console.log("searchQuery", searchQuery);

    if (searchQuery && searchQuery.trim()) {
      const lowerCasesearchQuery = searchQuery.toLowerCase().trim();
      filteredCards = filteredCards.filter(
        (card) =>
          card.cardTitle?.toLowerCase().includes(lowerCasesearchQuery) ||
          card.ReciverEmployeeId?.toLowerCase().includes(lowerCasesearchQuery)
      );
    }

    console.log("filteredCards1", filteredCards);

    // Filter by eventType (if not "All")
    if (eventType.toLowerCase().trim() !== "all") {
      filteredCards = filteredCards.filter(
        (card) =>
          card.eventType?.toLowerCase() === eventType.toLowerCase().trim()
      );
    }

    res.json({
      message: "Filter results fetched successfully",
      data: filteredCards,
    });
  } catch (error) {
    console.error("Error during filter:", error);
    res.status(500).json({ error: "Failed to perform filter" });
  }
});

// GET /api/cards/:cardId - Fetch card by ID
router.get("/:cardId", (req, res) => {
  console.log("fetch id");
  const { cardId } = req.params;

  try {
    const cards = readCards();
    const card = cards.find((c) => c.cardId === cardId);

    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    res.json(card);
  } catch (error) {
    console.error("Error fetching card:", error);
    res.status(500).json({ error: "Failed to fetch card" });
  }
});

// POST /api/cards - Create a new card
router.post("/", (req, res) => {
  const {
    cardBackgroundUrl,
    cardTitle,
    ReciverEmployeeId,
    height = 600,
    width = 800,
    greetings,
    eventType,
    greetBackgroundColour = "tranparent",
    greetTextColour = "black",
  } = req.body;

  if (!cardTitle || !height || !width || !ReciverEmployeeId || !eventType) {
    return res.status(400).json({
      error:
        "eventType, cardTitle, height, width, and ReciverEmployeeId are required",
    });
  }

  try {
    const cards = readCards();

    const newCard = {
      cardId: uuidv4(),
      cardBackgroundUrl,
      cardTitle,
      ReciverEmployeeId,
      height,
      width,
      eventType,
      greetBackgroundColour,
      greetTextColour,
      greetings: greetings || [],
    };

    cards.push(newCard);
    writeCards(cards);

    res.status(201).json({
      message: "Card created successfully",
      data: newCard,
    });
  } catch (error) {
    console.error("Error creating card:", error);
    res.status(500).json({ error: "Failed to create card" });
  }
});

// PUT /api/cards/:cardId - Update card details
router.put("/:cardId", (req, res) => {
  const { cardId } = req.params;
  const {
    cardTitle,
    cardBackgroundUrl,
    ReciverEmployeeId,
    height,
    width,
    greetBackgroundColour,
    greetTextColour,
    greetings,
    eventType,
  } = req.body;

  try {
    const cards = readCards();
    const card = cards.find((c) => c.cardId === cardId);

    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    // Update card details dynamically
    card.cardTitle = cardTitle || card.cardTitle;
    card.eventType = eventType || card.eventType;
    card.cardBackgroundUrl = cardBackgroundUrl || card.cardBackgroundUrl;
    card.ReciverEmployeeId = ReciverEmployeeId || card.ReciverEmployeeId;
    card.height = height !== undefined ? height : card.height;
    card.width = width !== undefined ? width : card.width;
    card.greetBackgroundColour =
      greetBackgroundColour || card.greetBackgroundColour;
    card.greetTextColour = greetTextColour || card.greetTextColour;
    card.greetings = greetings || card.greetings;

    writeCards(cards);

    res.json({
      message: "Card updated successfully",
      data: card,
    });
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(500).json({ error: "Failed to update card" });
  }
});

// DELETE /api/cards/:cardId - Delete a card
router.delete("/:cardId", (req, res) => {
  const { cardId } = req.params;

  try {
    const cards = readCards();
    const cardIndex = cards.findIndex((c) => c.cardId === cardId);

    if (cardIndex === -1) {
      return res.status(404).json({ error: "Card not found" });
    }

    const deletedCard = cards.splice(cardIndex, 1);
    writeCards(cards);

    res.json({
      message: "Card deleted successfully",
      data: deletedCard[0],
    });
  } catch (error) {
    console.error("Error deleting card:", error);
    res.status(500).json({ error: "Failed to delete card" });
  }
});

// PATCH /api/cards/:cardId/greetings - Add a greeting to a card
router.patch("/:cardId/greetings", (req, res) => {
  const { cardId } = req.params;
  const { message, employeeId, senderName, x, y } = req.body;

  if (
    !message ||
    !employeeId ||
    !senderName ||
    x === undefined ||
    y === undefined
  ) {
    return res.status(400).json({
      error: "message, employeeId, senderName, x, and y are required",
    });
  }

  try {
    const cards = readCards();
    const card = cards.find((c) => c.cardId === cardId);

    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    const newGreeting = {
      greetingId: uuidv4(),
      message,
      employeeId,
      senderName,
      x,
      y,
    };

    card.greetings.push(newGreeting);
    writeCards(cards);

    res.json({
      message: "Greeting added successfully",
      data: newGreeting,
    });
  } catch (error) {
    console.error("Error adding greeting:", error);
    res.status(500).json({ error: "Failed to add greeting" });
  }
});

module.exports = router;
