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

    // Function to convert markdown to HTML
    const formatContent = (text: string) => {
        let formatted = text;

        // Headers
        formatted = formatted.replace(/### (.*?)(\n|$)/g, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>');
        formatted = formatted.replace(/## (.*?)(\n|$)/g, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>');
        formatted = formatted.replace(/# (.*?)(\n|$)/g, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>');

        // Bold
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
        formatted = formatted.replace(/__(.*?)__/g, '<strong class="font-semibold">$1</strong>');

        // Italic
        formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
        formatted = formatted.replace(/_(.*?)_/g, '<em class="italic">$1</em>');

        // Code blocks
        formatted = formatted.replace(/```(.*?)```/gs, '<pre class="bg-gray-100 p-3 rounded-lg my-2 overflow-x-auto"><code>$1</code></pre>');
        
        // Inline code
        formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

        // Bullet lists
formatted = formatted.replace(/^- (.*?)$/gm, '<li class="ml-4">• $1</li>');
formatted = formatted.replace(
  /(<li class="ml-4">.*<\/li>\n?)+/g,
  '<ul class="my-2 space-y-1">$&</ul>'
);

// Numbered lists
formatted = formatted.replace(/^\d+\. (.*?)$/gm, '<li class="ml-4">$1</li>');
formatted = formatted.replace(
  /(<li class="ml-4">(?!•).*<\/li>\n?)+/g,
  '<ol class="my-2 space-y-1 list-decimal list-inside">$&</ol>'
);

        // Line breaks
        formatted = formatted.replace(/\n\n/g, '<br/><br/>');
        formatted = formatted.replace(/\n/g, '<br/>');

        // Horizontal rules
        formatted = formatted.replace(/^---$/gm, '<hr class="my-4 border-gray-300"/>');

        return formatted;
    };

    return (
        <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
            )}
            <div 
                className={`max-w-xl rounded-2xl px-5 py-4 shadow-sm ${
                    isUser 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white border border-gray-200'
                }`}
            >
                {isUser ? (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                ) : (
                    <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
                    />
                )}
            </div>
            {isUser && (
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                    <User className="w-4 h-4" />
                </div>
            )}
        </div>
    );
};