const FlashcardDeck = require('../models/FlashcardDeck');

// @desc    Get all flashcard decks for a user
// @route   GET /api/flashcards
exports.getDecks = async (req, res) => {
    try {
        // THE FIX: This now finds only the decks where 'createdBy'
        // matches the ID of the user making the request.
        const decks = await FlashcardDeck.find({ createdBy: req.user.id });
        res.status(200).json(decks);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new flashcard deck
// @route   POST /api/flashcards
exports.createDeck = async (req, res) => {
    const { title, description } = req.body;
    try {
        const newDeck = await FlashcardDeck.create({
            title,
            description,
            createdBy: req.user.id, // Correctly saves the user's ID
            cards: [],
        });
        res.status(201).json(newDeck);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get a single deck by ID
// @route   GET /api/flashcards/:id
exports.getDeckById = async (req, res) => {
    try {
        const deck = await FlashcardDeck.findById(req.params.id);
        if (!deck) {
            return res.status(404).json({ message: 'Deck not found' });
        }
        // Security check: Ensure the user owns this deck
        if (deck.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        res.status(200).json(deck);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a card to a deck
// @route   POST /api/flashcards/:id/cards
exports.addCardToDeck = async (req, res) => {
    const { front, back } = req.body;
    try {
        const deck = await FlashcardDeck.findById(req.params.id);
        if (!deck || deck.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        deck.cards.push({ front, back });
        await deck.save();
        res.status(201).json(deck);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- NEW FUNCTION ---
// @desc    Delete a flashcard deck
// @route   DELETE /api/flashcards/:id
exports.deleteDeck = async (req, res) => {
    try {
        const deck = await FlashcardDeck.findById(req.params.id);

        if (!deck) {
            return res.status(404).json({ message: 'Deck not found' });
        }

        // Security Check: Make sure the user owns this deck
        if (deck.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await deck.deleteOne();

        res.status(200).json({ message: 'Deck removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a card from a deck
// @route   DELETE /api/flashcards/:deckId/cards/:cardId
exports.deleteCard = async (req, res) => {
    try {
        const deck = await FlashcardDeck.findById(req.params.deckId);

        if (!deck) {
            return res.status(404).json({ message: 'Deck not found' });
        }
        // Security Check: Make sure the user owns this deck
        if (deck.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Pull (remove) the card from the cards array
        deck.cards.pull({ _id: req.params.cardId });
        await deck.save();

        res.status(200).json(deck);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};