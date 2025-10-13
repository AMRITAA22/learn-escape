import React from 'react';
import { Sparkles, User } from 'lucide-react';

interface MessageProps {
    message: {
        role: 'user' | 'assistant';
        content: string;
    };
}

export const ChatMessage = ({ message }: MessageProps) => {
    const isUser = message.role === 'user';

    return (
        <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
            )}
            <div className={`max-w-xl rounded-2xl px-5 py-4 shadow-sm whitespace-pre-wrap ${isUser ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200'}`}>
                {message.content}
            </div>
            {isUser && (
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                    <User className="w-4 h-4" />
                </div>
            )}
        </div>
    );
};