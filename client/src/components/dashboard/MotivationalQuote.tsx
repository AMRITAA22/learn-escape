import React, { useState, useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';

const quotes = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "You don’t have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
    { text: "Focus on progress, not perfection.", author: "Unknown" }
];

export const MotivationalQuote = () => {
    const [currentQuote, setCurrentQuote] = useState(quotes[0]);

    const generateNewQuote = () => {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        setCurrentQuote(quotes[randomIndex]);
    };

    // Set an initial random quote when the component first loads
    useEffect(() => {
        generateNewQuote();
    }, []);

    return (
        <div className="bg-purple-400 p-6 rounded-lg shadow-md mt-12 text-center text-white" >
            <p className="text-lg italic">"{currentQuote.text}"</p>
            {/* <p className="text-right text-sm font-semibold text-gray-500 mt-2">- {currentQuote.author}</p> */}
            <button 
                onClick={generateNewQuote} 
                className="mt-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                title="Get a new quote"
            >
                <RefreshCcw size={18} className="text-gray-600" />
            </button>
        </div>
    );
};