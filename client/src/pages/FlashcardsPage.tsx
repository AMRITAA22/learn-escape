import React, { useState, useEffect } from 'react';

interface Card {
  id: number;
  question: string;
  answer: string;
  deck: string;
  interval: number;
  repetition: number;
  efactor: number;
  nextReview: number;
}

export const FlashcardsPage = () => {
  const [decks, setDecks] = useState<string[]>(['Default']);
  const [selectedDeck, setSelectedDeck] = useState('Default');
  const [cards, setCards] = useState<Card[]>(() => {
    const saved = localStorage.getItem('flashcards');
    return saved ? JSON.parse(saved) : [];
  });
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    localStorage.setItem('flashcards', JSON.stringify(cards));
  }, [cards]);

  // Add card
  const addCard = () => {
    if (!question.trim() || !answer.trim()) return;
    const newCard: Card = {
      id: Date.now(),
      question,
      answer,
      deck: selectedDeck,
      interval: 1,
      repetition: 0,
      efactor: 2.5,
      nextReview: Date.now()
    };
    setCards([...cards, newCard]);
    setQuestion('');
    setAnswer('');
  };

  // SM2 algorithm
  const reviewCard = (cardId: number, grade: number) => {
    setCards(cards.map(c => {
      if (c.id !== cardId) return c;
      let { efactor, repetition, interval } = c;

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

      const nextReview = Date.now() + interval * 24 * 60 * 60 * 1000;
      return { ...c, efactor, repetition, interval, nextReview };
    }));
  };

  const dueCards = cards.filter(c => c.nextReview <= Date.now());

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-4">Flashcards</h1>

      {/* Deck selection */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Deck</label>
        <select
          value={selectedDeck}
          onChange={(e) => setSelectedDeck(e.target.value)}
          className="border rounded p-2"
        >
          {decks.map(deck => <option key={deck}>{deck}</option>)}
        </select>
      </div>

      {/* Add flashcard */}
      <div className="mb-4">
        <input
          className="border rounded p-2 w-full mb-2"
          placeholder="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <input
          className="border rounded p-2 w-full mb-2"
          placeholder="Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <button
          onClick={addCard}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Add Flashcard
        </button>
      </div>

      {/* Review section */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Due for Review ({dueCards.length})</h2>
      {dueCards.length === 0 ? (
        <p>No cards to review right now 🎉</p>
      ) : (
        dueCards.map(card => (
          <div key={card.id} className="border p-3 rounded mb-3">
            <p className="font-semibold">{card.question}</p>
            <p className="italic text-gray-500 mt-1">{card.answer}</p>
            <div className="mt-2 space-x-2">
              {[5, 4, 3, 2, 1].map(score => (
                <button
                  key={score}
                  onClick={() => reviewCard(card.id, score)}
                  className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                >
                  {score}
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
