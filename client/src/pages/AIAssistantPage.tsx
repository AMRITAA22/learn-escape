import React, { useState, useRef, useEffect } from 'react';
import aiService from '../services/aiService';
import { Send, Paperclip, Menu } from 'lucide-react';
import { ChatSidebar } from '../components/chat/ChatSidebar';
import { ChatMessage } from '../components/chat/ChatMessage';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface Conversation {
    _id: string;
    title: string;
}

export const AIAssistantPage = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! Ask me a question or start a new chat.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    useEffect(() => {
        aiService.getConversations().then(setConversations).catch(console.error);
    }, []);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsLoading(true);
            setError('');
            const uploadNotification: Message = { role: 'assistant', content: `Processing ${file.name}...`};
            setMessages(prev => [...prev, uploadNotification]);

            aiService.uploadNotes(file)
                .then(result => {
                    const successMsg: Message = { role: 'assistant', content: result.message };
                    setMessages(prev => [...prev.slice(0, -1), successMsg]);
                })
                .catch(err => {
                    setError('Failed to upload and process notes.');
                    setMessages(prev => prev.slice(0, -1));
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        
        const currentInput = input;
        setInput('');
        setIsLoading(true);
        setError('');

        try {
            const result = await aiService.chat(currentInput, activeConversationId);
            const assistantMessage: Message = { role: 'assistant', content: result.response };
            setMessages(prev => [...prev, assistantMessage]);

            if (!activeConversationId && result.conversationId) {
                setActiveConversationId(result.conversationId);
                aiService.getConversations().then(setConversations);
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'An error occurred. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleNewChat = () => {
        setActiveConversationId(null);
        setMessages([
            { role: 'assistant', content: 'New chat started. How can I help?' }
        ]);
    };

    const handleSelectConversation = async (id: string) => {
        setActiveConversationId(id);
        setMessages([]);
        setIsLoading(true);
        try {
            const conversation = await aiService.getConversationById(id);
            setMessages(conversation.messages);
        } catch (error) {
            setError('Could not load conversation.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {sidebarOpen && (
                <ChatSidebar 
                    conversations={conversations} 
                    activeId={activeConversationId}
                    onNewChat={handleNewChat}
                    onSelectConversation={handleSelectConversation}
                />
            )}

            <div className="flex-1 flex flex-col">
                <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-full">
                        <Menu className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-lg font-semibold">AI Assistant</h1>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((msg, index) => <ChatMessage key={index} message={msg} />)}
                    {isLoading && (messages.length === 0 || messages[messages.length-1]?.role === 'user') && (
                        <div className="flex justify-start">
                            <div className="p-3 rounded-lg bg-gray-200 text-gray-500">Thinking...</div>
                        </div>
                    )}
                    {error && <div className="text-red-500 text-center p-2">{error}</div>}
                    <div ref={messagesEndRef} />
                </div>

                <div className="border-t bg-white px-6 py-4">
                    <div className="relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type your message, or attach a file..."
                            className="w-full resize-none border border-gray-300 rounded-xl px-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            rows={1}
                            disabled={isLoading}
                        />
                        <div className="absolute left-3 top-3.5 flex gap-2">
                            <input ref={fileInputRef} type="file" accept=".txt,.md,image/png,image/jpeg" onChange={handleFileUpload} className="hidden" />
                            <button onClick={() => fileInputRef.current?.click()} className="text-gray-500 hover:text-indigo-600" title="Upload document or image"><Paperclip /></button>
                        </div>
                        <button onClick={handleSend} disabled={!input.trim() || isLoading} className="absolute right-3 top-2.5 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">
                            <Send />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};