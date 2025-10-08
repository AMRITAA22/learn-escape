import React, { useState, useEffect } from 'react';
import flashcardsService from '../services/flashcardsService';
import { Link } from 'react-router-dom';
import { Layers, Trash2 } from 'lucide-react';
import { CreateDeckModal } from '../components/flashcards/CreateDeckModal';
import { useAuth } from '../context/AuthContext';

export const FlashcardsPage = () => {
    const { user } = useAuth(); // Get the current logged-in user
    const [decks, setDecks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const loadDecks = async () => {
            try {
                const userDecks = await flashcardsService.getDecks();
                setDecks(userDecks);
            } catch (err) {
                setError('Failed to load flashcard decks.');
            } finally {
                setIsLoading(false);
            }
        };
        // Re-fetch decks when the user changes (e.g., on login/logout)
        if (user) {
            loadDecks();
        }
    }, [user]);

    const handleDeckCreated = (newDeck: any) => {
        setDecks(prevDecks => [newDeck, ...prevDecks]);
    };

    const handleDeleteDeck = async (deckId: string) => {
        if (window.confirm('Are you sure you want to delete this deck?')) {
            try {
                await flashcardsService.deleteDeck(deckId);
                setDecks(prevDecks => prevDecks.filter(deck => deck._id !== deckId));
            } catch (error) {
                console.error("Failed to delete deck:", error);
                alert("Failed to delete deck. Please try again.");
            }
        }
    };

    if (isLoading) { return <div>Loading...</div>; }
    if (error) { return <div className="text-red-500">{error}</div>; }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Your Flashcard Decks</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700"
                >
                    + Create New Deck
                </button>
            </div>
            
            {decks.length === 0 ? (
                <p>You haven't created any flashcard decks yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {decks.map(deck => (
                        <div key={deck._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow flex flex-col">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{deck.title}</h3>
                            <p className="text-gray-500 text-sm flex-grow">{deck.description}</p>
                            <div className="text-sm text-gray-400 mt-4 flex items-center">
                                <Layers size={16} className="mr-2" />
                                <span>{deck.cards.length} cards</span>
                            </div>
                            <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                <Link to={`/flashcards/${deck._id}`} className="font-semibold text-indigo-600 hover:text-indigo-800">
                                    View Deck
                                </Link>
                                {/* Conditionally render delete button */}
                                {user && user._id === deck.createdBy && (
                                    <button
                                        onClick={() => handleDeleteDeck(deck._id)}
                                        className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                                        title="Delete Deck"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <CreateDeckModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onDeckCreated={handleDeckCreated}
            />
        </div>
    );
};