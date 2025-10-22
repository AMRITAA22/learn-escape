import React from 'react';
import { Plus, MessageSquare } from 'lucide-react';

interface Conversation {
    _id: string;
    title: string;
}

interface ChatSidebarProps {
    conversations: Conversation[];
    activeId: string | null;
    onNewChat: () => void;
    onSelectConversation: (id: string) => void;
}

export const ChatSidebar = ({ conversations, activeId, onNewChat, onSelectConversation }: ChatSidebarProps) => {
    return (
        <div className="w-64 bg-gray-800 text-white flex flex-col p-2 h-full">
            <button
                onClick={onNewChat}
                className="w-full flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm mb-4 font-medium"
            >
                <Plus className="w-4 h-4" />
                <span>New Chat</span>
            </button>
            <div className="flex-1 overflow-y-auto space-y-1">
                {conversations.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No conversations yet</p>
                    </div>
                ) : (
                    conversations.map(conv => (
                        <div
                            key={conv._id}
                            onClick={() => onSelectConversation(conv._id)}
                            className={`px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm truncate ${
                                conv._id === activeId 
                                    ? 'bg-indigo-600 font-medium' 
                                    : 'hover:bg-gray-700'
                            }`}
                            title={conv.title || 'New Chat'}
                        >
                            <div className="font-medium truncate">
                                {conv.title || 'New Chat'}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};