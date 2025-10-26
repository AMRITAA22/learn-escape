const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// console.log('Loading flashcards controller...');
const flashcardsController = require('../controllers/flashcardsController');
// console.log('Flashcards controller loaded:', Object.keys(flashcardsController));

const {
    getDecks,
    createDeck,
    getDeckById,
    addCardToDeck,
    updateCard,
    updateDeck,
    deleteDeck,
    deleteCard
} = flashcardsController;

// console.log('getDecks type:', typeof getDecks);
// console.log('createDeck type:', typeof createDeck);
// console.log('getDeckById type:', typeof getDeckById);
// console.log('addCardToDeck type:', typeof addCardToDeck);
// console.log('updateCard type:', typeof updateCard);
// console.log('updateDeck type:', typeof updateDeck);
// console.log('deleteDeck type:', typeof deleteDeck);
// console.log('deleteCard type:', typeof deleteCard);

router.use(protect);

// console.log('Setting up routes...');
router.route('/').get(getDecks).post(createDeck);
// console.log('Root routes set up');
router.route('/:id').get(getDeckById).put(updateDeck).delete(deleteDeck);
// console.log('/:id routes set up');
router.route('/:id/cards').post(addCardToDeck);
// console.log('/:id/cards routes set up');
router.route('/:deckId/cards/:cardId').put(updateCard).delete(deleteCard);
// console.log('/:deckId/cards/:cardId routes set up');

// console.log('All flashcard routes loaded successfully!');

module.exports = router;