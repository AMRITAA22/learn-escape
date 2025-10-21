import React, { useState } from 'react';
import aiService from '../../services/aiService';
import flashcardsService from '../../services/flashcardsService';
import { Sparkles, Loader2, Upload, Type } from 'lucide-react';

interface AIFlashcardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDeckCreated?: (deck: any) => void;
    onFlashcardsGenerated?: (flashcards: any[]) => void;
    mode: 'create' | 'preview'; // create saves directly, preview shows cards first
}

export const AIFlashcardModal = ({ 
    isOpen, 
    onClose, 
    onDeckCreated, 
    onFlashcardsGenerated,
    mode = 'create'
}: AIFlashcardModalProps) => {
    const [topic, setTopic] = useState('');
    const [numberOfCards, setNumberOfCards] = useState(10);
    const [useNotes, setUseNotes] = useState(false);
    const [deckTitle, setDeckTitle] = useState('');
    const [deckDescription, setDeckDescription] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [generatedCards, setGeneratedCards] = useState<any[]>([]);
    const [step, setStep] = useState<'input' | 'preview'>('input');

    const handleGenerate = async () => {
        if (!topic.trim() && !useNotes) {
            setError('Please enter a topic or select "Use uploaded notes"');
            return;
        }

        setIsGenerating(true);
        setError('');

        try {
            if (mode === 'create') {
                // Generate and save directly
                const result = await aiService.generateAndSaveDeck({
                    topic: useNotes ? undefined : topic,
                    numberOfCards,
                    useUploadedNotes: useNotes,
                    deckTitle: deckTitle || undefined,
                    deckDescription: deckDescription || undefined,
                });
                
                if (onDeckCreated) {
                    onDeckCreated(result.deck);
                }
                onClose();
            } else {
                // Generate and preview
                const result = await aiService.generateFlashcards({
                    topic: useNotes ? undefined : topic,
                    numberOfCards,
                    useUploadedNotes: useNotes,
                });
                
                setGeneratedCards(result.flashcards);
                setStep('preview');
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Failed to generate flashcards';
            setError(errorMsg);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveCards = async () => {
        if (generatedCards.length === 0) return;

        setIsGenerating(true);
        try {
            const title = deckTitle || `AI Generated: ${topic || 'From Notes'}`;
            const description = deckDescription || `${generatedCards.length} AI-generated flashcards`;
            
            const newDeck = await flashcardsService.createDeck({
                title,
                description,
                cards: generatedCards,
            });

            if (onDeckCreated) {
                onDeckCreated(newDeck);
            }
            onClose();
        } catch (err) {
            setError('Failed to save flashcards');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleEditCard = (index: number, field: 'front' | 'back', value: string) => {
        const updated = [...generatedCards];
        updated[index][field] = value;
        setGeneratedCards(updated);
    };

    const handleRemoveCard = (index: number) => {
        setGeneratedCards(generatedCards.filter((_, i) => i !== index));
    };

    const resetModal = () => {
        setTopic('');
        setNumberOfCards(10);
        setUseNotes(false);
        setDeckTitle('');
        setDeckDescription('');
        setGeneratedCards([]);
        setStep('input');
        setError('');
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {step === 'input' ? (
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                AI Flashcard Generator
                            </h2>
                        </div>

                        <div className="space-y-6">
                            {/* Topic Input */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Type className="w-4 h-4" />
                                    Topic or Subject
                                </label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g., World War 2, Python Programming, Human Anatomy"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    disabled={useNotes || isGenerating}
                                />
                            </div>

                            {/* Use Notes Toggle */}
                            <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                                <input
                                    type="checkbox"
                                    id="useNotes"
                                    checked={useNotes}
                                    onChange={(e) => setUseNotes(e.target.checked)}
                                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                                    disabled={isGenerating}
                                />
                                <label htmlFor="useNotes" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                                    <Upload className="w-4 h-4" />
                                    Use my uploaded notes instead
                                </label>
                            </div>

                            {/* Number of Cards */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Number of Cards
                                </label>
                                <input
                                    type="number"
                                    min="5"
                                    max="50"
                                    value={numberOfCards}
                                    onChange={(e) => setNumberOfCards(Number(e.target.value))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    disabled={isGenerating}
                                />
                            </div>

                            {/* Deck Details (Optional) */}
                            {mode === 'create' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Deck Title (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={deckTitle}
                                            onChange={(e) => setDeckTitle(e.target.value)}
                                            placeholder="Leave empty for auto-generated title"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            disabled={isGenerating}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description (Optional)
                                        </label>
                                        <textarea
                                            value={deckDescription}
                                            onChange={(e) => setDeckDescription(e.target.value)}
                                            rows={2}
                                            placeholder="Add a description for your deck"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            disabled={isGenerating}
                                        />
                                    </div>
                                </>
                            )}

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                                    disabled={isGenerating}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || (!topic.trim() && !useNotes)}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Generate Flashcards
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Preview Step
                    <div className="p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                Review & Edit Generated Cards
                            </h2>
                            <p className="text-gray-600">
                                {generatedCards.length} cards generated. Edit or remove cards before saving.
                            </p>
                        </div>

                        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                            {generatedCards.map((card, index) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-sm font-semibold text-indigo-600">
                                            Card {index + 1}
                                        </span>
                                        <button
                                            onClick={() => handleRemoveCard(index)}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Front
                                            </label>
                                            <textarea
                                                value={card.front}
                                                onChange={(e) => handleEditCard(index, 'front', e.target.value)}
                                                rows={2}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Back
                                            </label>
                                            <textarea
                                                value={card.back}
                                                onChange={(e) => handleEditCard(index, 'back', e.target.value)}
                                                rows={2}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Deck Details for Preview Mode */}
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Deck Title
                                </label>
                                <input
                                    type="text"
                                    value={deckTitle}
                                    onChange={(e) => setDeckTitle(e.target.value)}
                                    placeholder={`AI Generated: ${topic || 'From Notes'}`}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={deckDescription}
                                    onChange={(e) => setDeckDescription(e.target.value)}
                                    rows={2}
                                    placeholder="Add a description for your deck"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-6">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setStep('input')}
                                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                                disabled={isGenerating}
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSaveCards}
                                disabled={isGenerating || generatedCards.length === 0}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition font-medium disabled:opacity-50 flex items-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Deck'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};