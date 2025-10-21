import React, { useState, useEffect } from 'react';
import flashcardsService from '../../services/flashcardsService';

interface Card {
    _id: string;
    front: string;
    back: string;
}

interface EditCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCardUpdated: (updatedDeck: any) => void;
    deckId: string;
    card: Card;
}

const EditCardModal = ({ isOpen, onClose, onCardUpdated, deckId, card }: EditCardModalProps) => {
    const [front, setFront] = useState('');
    const [back, setBack] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (card) {
            setFront(card.front);
            setBack(card.back);
        }
    }, [card]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!front.trim() || !back.trim()) {
            setError('Both front and back fields are required.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const updatedDeck = await flashcardsService.updateCard(deckId, card._id, { front, back });
            onCardUpdated(updatedDeck);
            onClose();
        } catch (err) {
            setError('Failed to update card. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Card</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="front" className="block text-sm font-medium text-gray-700 mb-2">
                            Front
                        </label>
                        <textarea
                            id="front"
                            value={front}
                            onChange={(e) => setFront(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="e.g., What is the capital of France?"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="back" className="block text-sm font-medium text-gray-700 mb-2">
                            Back
                        </label>
                        <textarea
                            id="back"
                            value={back}
                            onChange={(e) => setBack(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="e.g., Paris"
                            required
                        />
                    </div>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export { EditCardModal };