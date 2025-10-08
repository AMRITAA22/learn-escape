const express = require('express');
const router = express.Router();
// Import the new functions
const {
    getDecks,
    createDeck,
    getDeckById,
    addCardToDeck,
    deleteDeck,
    deleteCard
} = require('../controllers/flashcardsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getDecks)
    .post(createDeck);

router.route('/:id')
    .get(getDeckById)
    .delete(deleteDeck); // Route for deleting a deck

router.route('/:id/cards')
    .post(addCardToDeck);

// New route for deleting a specific card from a specific deck
router.route('/:deckId/cards/:cardId')
    .delete(deleteCard);

module.exports = router;