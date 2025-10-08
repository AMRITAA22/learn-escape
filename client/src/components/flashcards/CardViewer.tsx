import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';

interface CardViewerProps {
    cards: { front: string; back: string }[];
}

export const CardViewer = ({ cards }: CardViewerProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleNext = () => {
        setIsFlipped(false); // Always show the front of the next card
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
        }, 150); // Small delay to allow flip animation to start
    };

    const handlePrev = () => {
        setIsFlipped(false); // Always show the front of the previous card
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex - 1 + cards.length) % cards.length);
        }, 150);
    };

    const currentCard = cards[currentIndex];

    return (
        <div className="flex flex-col items-center">
            {/* The Card */}
            <div className="w-full max-w-2xl h-80 [perspective:1000px]">
                <div
                    className="relative w-full h-full cursor-pointer [transform-style:preserve-3d] transition-transform duration-500"
                    style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                    onClick={handleFlip}
                >
                    {/* Front of the card */}
                    <div className="absolute w-full h-full p-8 rounded-xl bg-white shadow-lg flex items-center justify-center text-center [backface-visibility:hidden]">
                        <p className="text-2xl font-semibold">{currentCard.front}</p>
                    </div>
                    {/* Back of the card */}
                    <div className="absolute w-full h-full p-8 rounded-xl bg-indigo-100 shadow-lg flex items-center justify-center text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
                        <p className="text-2xl font-semibold text-indigo-800">{currentCard.back}</p>
                    </div>
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-center space-x-8 mt-8">
                <button onClick={handlePrev} className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition" aria-label="Previous Card">
                    <ArrowLeft />
                </button>
                <button 
                    onClick={handleFlip} 
                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition flex items-center"
                >
                    <RefreshCw size={20} className="mr-2"/> Flip
                </button>
                <button onClick={handleNext} className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition" aria-label="Next Card">
                    <ArrowRight />
                </button>
            </div>

             {/* Progress Indicator */}
             <p className="mt-4 text-gray-500">Card {currentIndex + 1} of {cards.length}</p>
        </div>
    );
};