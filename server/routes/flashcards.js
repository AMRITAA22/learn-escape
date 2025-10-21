const express = require('express');
const router = express.Router();
const {
    getDecks,
    createDeck,
    getDeckById,
    addCardToDeck,
    updateCard,
    updateDeck,
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
    .put(updateDeck)
    .delete(deleteDeck);

router.route('/:id/cards')
    .post(addCardToDeck);

router.route('/:deckId/cards/:cardId')
    .put(updateCard)
    .delete(deleteCard);

module.exports = router;