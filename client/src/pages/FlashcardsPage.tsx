import React, { useState, useEffect } from 'react';
import flashcardsService from '../services/flashcardsService';
import { Link } from 'react-router-dom';
import { Layers, Trash2, Sparkles, Plus } from 'lucide-react';
import { CreateDeckModal } from '../components/flashcards/CreateDeckModal';
import { AIFlashcardModal } from '../components/flashcards/AIFlashcardModal';
import { useAuth } from '../context/AuthContext';

export const FlashcardsPage = () => {
    const { user } = useAuth();
    const [decks, setDecks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading your decks...</div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center p-8">{error}</div>;
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Flashcard Decks</h1>
                <p className="text-gray-600">Create and study flashcards manually or with AI assistance</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
                <button 
                    onClick={() => setIsAIModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition transform hover:scale-105"
                >
                    <Sparkles className="w-5 h-5" />
                    Generate with AI
                </button>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition"
                >
                    <Plus className="w-5 h-5" />
                    Create Manually
                </button>
            </div>
            
            {/* Decks Grid */}
            {decks.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Decks Yet</h3>
                        <p className="text-gray-500 mb-6">
                            Start by creating a deck manually or let AI generate one for you
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button 
                                onClick={() => setIsAIModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition"
                            >
                                <Sparkles className="w-5 h-5" />
                                Generate with AI
                            </button>
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition"
                            >
                                <Plus className="w-5 h-5" />
                                Create Manually
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {decks.map(deck => (
                        <div 
                            key={deck._id} 
                            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 overflow-hidden border border-gray-100"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-xl font-bold text-gray-800 line-clamp-2 flex-1">
                                        {deck.title}
                                    </h3>
                                    {user && user._id === deck.createdBy && (
                                        <button
                                            onClick={() => handleDeleteDeck(deck._id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                                            title="Delete Deck"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                                
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
                                    {deck.description || 'No description provided'}
                                </p>
                                
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                                    <Layers size={16} />
                                    <span className="font-medium">{deck.cards.length} cards</span>
                                </div>
                                
                                <Link 
                                    to={`/flashcards/${deck._id}`}
                                    className="block w-full text-center px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
                                >
                                    Study Deck
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            <CreateDeckModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onDeckCreated={handleDeckCreated}
            />

            <AIFlashcardModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                onDeckCreated={handleDeckCreated}
                mode="preview"
            />
        </div>
    );
};