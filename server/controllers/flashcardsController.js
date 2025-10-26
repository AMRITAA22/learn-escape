const FlashcardDeck = require('../models/FlashcardDeck');

// Get all decks
const getDecks = async (req, res) => {
    try {
        const decks = await FlashcardDeck.find({ createdBy: req.user.id }).sort({ updatedAt: -1 });
        res.status(200).json(decks);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Create deck
const createDeck = async (req, res) => {
    const { title, description, cards } = req.body;
    try {
        const newDeck = await FlashcardDeck.create({
            title,
            description,
            createdBy: req.user.id,
            cards: cards || [],
        });
        res.status(201).json(newDeck);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get deck by ID
// Get deck by ID
const getDeckById = async (req, res) => {
    try {
        const deck = await FlashcardDeck.findById(req.params.id);

        if (!deck) {
            return res.status(404).json({ message: 'Deck not found' });
        }

        // Check if user owns the deck
        const isOwner = deck.createdBy.toString() === req.user.id;
        
        if (!isOwner) {
            // Check if this deck is shared in any study group the user is a member of
            const StudyGroup = require('../models/StudyGroup');
            const sharedInGroups = await StudyGroup.find({
                'members.userId': req.user.id,
                'sharedResources': {
                    $elemMatch: {
                        resourceType: 'flashcard',
                        resourceId: req.params.id
                    }
                }
            });

            console.log('User ID:', req.user.id);
            console.log('Deck ID:', req.params.id);
            console.log('Shared in groups:', sharedInGroups.length);

            if (sharedInGroups.length === 0) {
                return res.status(403).json({ message: 'Not authorized to view this deck' });
            }
        }

        res.status(200).json(deck);
    } catch (error) {
        console.error('Error getting deck:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Add card
const addCardToDeck = async (req, res) => {
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

// Update card
const updateCard = async (req, res) => {
    const { front, back } = req.body;
    try {
        const deck = await FlashcardDeck.findById(req.params.deckId);
        if (!deck || deck.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const card = deck.cards.id(req.params.cardId);
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }
        if (front) card.front = front;
        if (back) card.back = back;
        await deck.save();
        res.status(200).json(deck);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update deck
const updateDeck = async (req, res) => {
    const { title, description } = req.body;
    try {
        const deck = await FlashcardDeck.findById(req.params.id);
        if (!deck || deck.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        if (title) deck.title = title;
        if (description !== undefined) deck.description = description;
        await deck.save();
        res.status(200).json(deck);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Delete deck
const deleteDeck = async (req, res) => {
    try {
        const deck = await FlashcardDeck.findById(req.params.id);
        if (!deck || deck.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        await deck.deleteOne();
        res.status(200).json({ message: 'Deck removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Delete card
const deleteCard = async (req, res) => {
    try {
        const deck = await FlashcardDeck.findById(req.params.deckId);
        if (!deck || deck.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        deck.cards.pull({ _id: req.params.cardId });
        await deck.save();
        res.status(200).json(deck);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getDecks,
    createDeck,
    getDeckById,
    addCardToDeck,
    updateCard,
    updateDeck,
    deleteDeck,
    deleteCard
};