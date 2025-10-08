import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import flashcardsService from '../services/flashcardsService';
import { AddCardModal } from '../components/flashcards/AddCardModal';
import { Trash2 } from 'lucide-react';
import { CardViewer } from '../components/flashcards/CardViewer';
export const DeckPage = () => {
    const { id } = useParams<{ id: string }>();
    const [deck, setDeck] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStudying, setIsStudying] = useState(false);

    useEffect(() => {
        if (!id) return;
        const loadDeck = async () => {
            try {
                const deckData = await flashcardsService.getDeckById(id);
                setDeck(deckData);
            } catch (err) {
                setError('Failed to load this deck. You may not have permission to view it.');
            } finally {
                setIsLoading(false);
            }
        };
        loadDeck();
    }, [id]);

    const handleCardAdded = (updatedDeck: any) => {
        setDeck(updatedDeck);
    };

    const handleDeleteCard = async (cardId: string) => {
        if (!id) return;
        if (window.confirm('Are you sure you want to delete this card?')) {
            try {
                const updatedDeck = await flashcardsService.deleteCard(id, cardId);
                setDeck(updatedDeck); // Refresh the deck with the updated card list
            } catch (error) {
                alert('Failed to delete card.');
            }
        }
    };

    if (isLoading) {
        return <div className="p-4">Loading deck...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    if (!deck) {
        return <div className="p-4">Deck not found.</div>;
    }

     return (
        <div>
            <Link to="/flashcards" className="text-indigo-600 hover:underline mb-4 inline-block">&larr; Back to all decks</Link>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">{deck.title}</h1>
                    <p className="text-gray-500 mt-1">{deck.description}</p>
                </div>
                <div>
                    <button 
                        onClick={() => setIsStudying(prev => !prev)}
                        className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 mr-4"
                        disabled={deck.cards.length === 0}
                    >
                        {isStudying ? 'View as List' : 'Start Study Session'}
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700"
                    >
                        + Add New Card
                    </button>
                </div>
            </div>

            <div className="mt-8">
                {deck.cards.length === 0 ? (
                    <div className="text-center p-10 bg-gray-50 rounded-lg">
                        <h2 className="text-xl font-semibold text-gray-700">This deck is empty!</h2>
                        <p className="mt-2 text-gray-500">Add a new card to start your study session.</p>
                    </div>
                ) : isStudying ? (
                    <CardViewer cards={deck.cards} />
                ) : (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">Cards in this Deck</h2>
                        {deck.cards.map((card: any) => (
                            <div key={card._id} className="bg-white p-4 rounded-lg shadow grid grid-cols-[1fr_1fr_auto] gap-4 items-center">
                                <div>
                                    <p className="text-sm font-semibold text-gray-500">Front</p>
                                    <p className="mt-1">{card.front}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-500">Back</p>
                                    <p className="mt-1">{card.back}</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteCard(card._id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors"
                                    title="Delete Card"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <AddCardModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCardAdded={handleCardAdded}
                deckId={deck._id}
            />
        </div>
    );
};