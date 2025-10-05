import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Deck {
  _id: string;
  name: string;
}

interface Card {
  _id: string;
  question: string;
  answer: string;
  deckId: string;
  interval: number;
  repetition: number;
  efactor: number;
  nextReview: string;
}

export const FlashcardsPage = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<string>('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await axios.get('/api/flashcards', { withCredentials: true });
    setDecks(res.data.decks);
    setCards(res.data.cards);
    if (res.data.decks.length > 0) setSelectedDeck(res.data.decks[0]._id);
  };

  const addDeck = async () => {
    const name = prompt('Deck name?');
    if (!name) return;
    const res = await axios.post('/api/flashcards/deck', { name }, { withCredentials: true });
    setDecks([...decks, res.data]);
  };

  const addCard = async () => {
    if (!question || !answer) return;
    const res = await axios.post(
      '/api/flashcards/card',
      { deckId: selectedDeck, question, answer },
      { withCredentials: true }
    );
    setCards([...cards, res.data]);
    setQuestion('');
    setAnswer('');
  };

  const reviewCard = async (cardId: string, grade: number) => {
    const res = await axios.post(`/api/flashcards/review/${cardId}`, { grade }, { withCredentials: true });
    setCards(cards.map(c => (c._id === cardId ? res.data : c)));
  };

  const dueCards = cards.filter(c => new Date(c.nextReview).getTime() <= Date.now());

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-4">Flashcards</h1>

      <div className="flex items-center space-x-3 mb-4">
        <select
          value={selectedDeck}
          onChange={e => setSelectedDeck(e.target.value)}
          className="border rounded p-2"
        >
          {decks.map(deck => <option key={deck._id} value={deck._id}>{deck.name}</option>)}
        </select>
        <button onClick={addDeck} className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300">+ New Deck</button>
      </div>

      <div className="mb-4">
        <input
          className="border rounded p-2 w-full mb-2"
          placeholder="Question"
          value={question}
          onChange={e => setQuestion(e.target.value)}
        />
        <input
          className="border rounded p-2 w-full mb-2"
          placeholder="Answer"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
        />
        <button
          onClick={addCard}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Add Flashcard
        </button>
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-2">Due for Review ({dueCards.length})</h2>
      {dueCards.length === 0 ? (
        <p>No cards to review right now 🎉</p>
      ) : (
        dueCards.map(card => (
          <div key={card._id} className="border p-3 rounded mb-3">
            <p className="font-semibold">{card.question}</p>
            <p className="italic text-gray-500 mt-1">{card.answer}</p>
            <div className="mt-2 space-x-2">
              {[5, 4, 3, 2, 1].map(score => (
                <button
                  key={score}
                  onClick={() => reviewCard(card._id, score)}
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
