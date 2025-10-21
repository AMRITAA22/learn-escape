import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import flashcardsService from '../services/flashcardsService';
import { CardViewer } from '../components/flashcards/CardViewer';
import { AddCardModal } from '../components/flashcards/AddCardModal';
import { EditCardModal } from '../components/flashcards/EditCardModal';
import { EditDeckModal } from '../components/flashcards/EditDeckModal';
import { ArrowLeft, Plus, Edit, Trash2, Play, BookOpen } from 'lucide-react';

interface Card {
    _id: string;
    front: string;
    back: string;
}

interface Deck {
    _id: string;
    title: string;
    description: string;
    cards: Card[];
    createdBy: string;
}

export const FlashcardDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [deck, setDeck] = useState<Deck | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'study'>('list');
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeckEditModalOpen, setIsDeckEditModalOpen] = useState(false);
    const [cardToEdit, setCardToEdit] = useState<Card | null>(null);

    useEffect(() => {
        loadDeck();
    }, [id]);

    const loadDeck = async () => {
        if (!id) return;
        try {
            const deckData = await flashcardsService.getDeckById(id);
            setDeck(deckData);
        } catch (err) {
            setError('Failed to load deck');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCardAdded = (updatedDeck: Deck) => {
        setDeck(updatedDeck);
    };

    const handleCardUpdated = (updatedDeck: Deck) => {
        setDeck(updatedDeck);
        setCardToEdit(null);
    };

    const handleDeckUpdated = (updatedDeck: Deck) => {
        setDeck(updatedDeck);
    };

    const handleDeleteCard = async (cardId: string) => {
        if (!id || !window.confirm('Are you sure you want to delete this card?')) return;
        
        try {
            const updatedDeck = await flashcardsService.deleteCard(id, cardId);
            setDeck(updatedDeck);
        } catch (err) {
            alert('Failed to delete card');
        }
    };

    const handleEditCard = (card: Card) => {
        setCardToEdit(card);
        setIsEditModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading deck...</div>
            </div>
        );
    }

    if (error || !deck) {
        return (
            <div className="text-center">
                <p className="text-red-500 mb-4">{error || 'Deck not found'}</p>
                <button
                    onClick={() => navigate('/flashcards')}
                    className="text-indigo-600 hover:text-indigo-800"
                >
                    ← Back to Decks
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/flashcards')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Decks
                </button>
                
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">{deck.title}</h1>
                            {deck.description && (
                                <p className="text-gray-600 mb-4">{deck.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <BookOpen className="w-4 h-4" />
                                    {deck.cards.length} cards
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsDeckEditModalOpen(true)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            title="Edit Deck"
                        >
                            <Edit className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={() => setViewMode(viewMode === 'study' ? 'list' : 'study')}
                            disabled={deck.cards.length === 0}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Play className="w-5 h-5" />
                            {viewMode === 'study' ? 'Back to List' : 'Study Mode'}
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Add Card
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {viewMode === 'study' ? (
                <div className="bg-white rounded-xl shadow-md p-8">
                    {deck.cards.length > 0 ? (
                        <CardViewer cards={deck.cards} />
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">No cards in this deck yet</p>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                                Add your first card
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">All Cards</h2>
                    
                    {deck.cards.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">No cards in this deck yet</p>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                            >
                                Add Your First Card
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {deck.cards.map((card, index) => (
                                <div
                                    key={card._id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-sm font-semibold text-indigo-600">
                                            Card {index + 1}
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditCard(card)}
                                                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition"
                                                title="Edit Card"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCard(card._id)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                                                title="Delete Card"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs font-medium text-gray-500 mb-1">FRONT</div>
                                            <div className="text-gray-800 bg-gray-50 p-3 rounded-lg min-h-[60px]">
                                                {card.front}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-medium text-gray-500 mb-1">BACK</div>
                                            <div className="text-gray-800 bg-indigo-50 p-3 rounded-lg min-h-[60px]">
                                                {card.back}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            <AddCardModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onCardAdded={handleCardAdded}
                deckId={deck._id}
            />

            {cardToEdit && (
                <EditCardModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setCardToEdit(null);
                    }}
                    onCardUpdated={handleCardUpdated}
                    deckId={deck._id}
                    card={cardToEdit}
                />
            )}

            <EditDeckModal
                isOpen={isDeckEditModalOpen}
                onClose={() => setIsDeckEditModalOpen(false)}
                onDeckUpdated={handleDeckUpdated}
                deck={deck}
            />
        </div>
    );
};