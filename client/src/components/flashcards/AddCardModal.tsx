import React, { useState } from 'react';
import flashcardsService from '../../services/flashcardsService';

interface AddCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCardAdded: (updatedDeck: any) => void;
    deckId: string;
}

export const AddCardModal = ({ isOpen, onClose, onCardAdded, deckId }: AddCardModalProps) => {
    const [front, setFront] = useState('');
    const [back, setBack] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!front.trim() || !back.trim()) {
            setError('Both front and back fields are required.');
            return;
        }
        try {
            const updatedDeck = await flashcardsService.addCardToDeck(deckId, { front, back });
            onCardAdded(updatedDeck);
            setFront('');
            setBack('');
            onClose();
        } catch (err) {
            setError('Failed to add card. Please try again.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Add a New Card</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="front" className="block text-sm font-medium text-gray-700">Front</label>
                        <textarea
                            id="front"
                            value={front}
                            onChange={(e) => setFront(e.target.value)}
                            rows={3}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            placeholder="e.g., What is the capital of France?"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="back" className="block text-sm font-medium text-gray-700">Back</label>
                        <textarea
                            id="back"
                            value={back}
                            onChange={(e) => setBack(e.target.value)}
                            rows={3}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            placeholder="e.g., Paris"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                            Add Card
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};