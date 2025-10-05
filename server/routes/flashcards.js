import express from 'express';
import Deck from '../models/Deck.js';
import Flashcard from '../models/Flashcard.js';
import { verifyToken } from '../middleware/auth.js';  // your JWT middleware

const router = express.Router();

// Get all decks and cards for user
router.get('/', verifyToken, async (req, res) => {
  const decks = await Deck.find({ userId: req.user.id });
  const cards = await Flashcard.find({ userId: req.user.id });
  res.json({ decks, cards });
});

// Create new deck
router.post('/deck', verifyToken, async (req, res) => {
  const deck = new Deck({ userId: req.user.id, name: req.body.name });
  await deck.save();
  res.json(deck);
});

// Add new card
router.post('/card', verifyToken, async (req, res) => {
  const { deckId, question, answer } = req.body;
  const card = new Flashcard({
    userId: req.user.id,
    deckId,
    question,
    answer,
  });
  await card.save();
  res.json(card);
});

// Review card (SM2 update)
router.post('/review/:id', verifyToken, async (req, res) => {
  const { grade } = req.body;
  const card = await Flashcard.findById(req.params.id);
  if (!card) return res.status(404).json({ error: 'Card not found' });

  let { efactor, repetition, interval } = card;

  if (grade < 3) {
    repetition = 0;
    interval = 1;
  } else {
    if (repetition === 0) interval = 1;
    else if (repetition === 1) interval = 6;
    else interval = Math.round(interval * efactor);

    efactor = efactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    if (efactor < 1.3) efactor = 1.3;
    repetition += 1;
  }

  const nextReview = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);

  Object.assign(card, { efactor, repetition, interval, nextReview });
  await card.save();

  res.json(card);
});

export default router;
