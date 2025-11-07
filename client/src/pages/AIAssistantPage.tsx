import React, { useState, useRef, useEffect } from 'react';
import aiService from '../services/aiService';
// 1. REMOVED 'useNavigate' from this line
import { Send, Paperclip, Menu, Sparkles, FileText, Brain } from 'lucide-react';
import { ChatSidebar } from '../components/chat/ChatSidebar';
import { ChatMessage } from '../components/chat/ChatMessage';
import { AIFlashcardModal } from '../components/flashcards/AIFlashcardModal';
// 2. REMOVED 'useNavigate' from this line
// TODO: Create and import this component
import { AIGenerateQuizModal } from '../components/quiz/AIGenerateQuizModal';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface Conversation {
    _id: string;
    title: string;
}

export const AIAssistantPage = () => {
    // 3. REMOVED 'navigate' variable
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I can help you study, answer questions about your notes, or generate flashcards. What would you like to do?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [hasUploadedNotes, setHasUploadedNotes] = useState(false);
    
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState(false);
    
    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
    
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
            const uploadNotification: Message = { 
                role: 'assistant', 
                content: `Processing ${file.name}... Once complete, you can ask questions or generate flashcards from these notes.`
            };
            setMessages(prev => [...prev, uploadNotification]);

            aiService.uploadNotes(file)
                .then(result => {
                    const successMsg: Message = { 
                        role: 'assistant', 
                        content: result.message + ' You can now ask questions or click "Generate Flashcards" to create study materials.'
                    };
                    setMessages(prev => [...prev.slice(0, -1), successMsg]);
                    setHasUploadedNotes(true);
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
                // Refresh conversations list to show the new title
                aiService.getConversations().then(setConversations);
            } else if (activeConversationId && result.title) {
                // Update the conversation title in the sidebar if it changed
                setConversations(prev => 
                    prev.map(conv => 
                        conv._id === activeConversationId 
                            ? { ...conv, title: result.title } 
                            : conv
                    )
                );
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
            { role: 'assistant', content: 'New chat started. How can I help you today?' }
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

    const handleFlashcardGenerated = (deck: any) => {
        const successMsg: Message = {
            role: 'assistant',
            content: `Great! I've created a flashcard deck "${deck.title}" with ${deck.cards.length} cards. You can find it in your Flashcards section.`
        };
        setMessages(prev => [...prev, successMsg]);
    };

    const handleQuizGenerated = (quiz: any) => {
        const successMsg: Message = {
            role: 'assistant',
            content: `All set! I've created the quiz "${quiz.title}". You will be able to find it in a "Quizzes" section soon.`
        };
        setMessages(prev => [...prev, successMsg]);
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
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setSidebarOpen(!sidebarOpen)} 
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <Menu className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-800">AI Study Assistant</h1>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {hasUploadedNotes && (
                            <button
                                onClick={() => setIsFlashcardModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition font-medium"
                            >
                                <Sparkles className="w-4 h-4" />
                                Generate Flashcards
                            </button>
                        )}
                        <button
                            onClick={() => setIsQuizModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition font-medium"
                        >
                            <Brain className="w-4 h-4" />
                            Generate Quiz
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Quick Actions Banner */}
                    {messages.length === 1 && (
                        <div className="max-w-3xl mx-auto">
                            <div className="grid md:grid-cols-3 gap-4 mb-8">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-6 bg-white rounded-xl border-2 border-dashed border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 transition group"
                                >
                                    <FileText className="w-8 h-8 text-indigo-600 mb-2 group-hover:scale-110 transition" />
                                    <h3 className="font-semibold text-gray-800 mb-1">Upload Notes</h3>
                                    <p className="text-sm text-gray-600">Upload study materials to analyze</p>
                                </button>
                                <button
                                    onClick={() => setIsFlashcardModalOpen(true)}
                                    className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-300 hover:border-purple-500 hover:shadow-lg transition group"
                                >
                                    <Sparkles className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition" />
                                    <h3 className="font-semibold text-gray-800 mb-1">Generate Flashcards</h3>
                                    <p className="text-sm text-gray-600">Create AI-powered study cards</p>
                                </button>
                                <button
                                    onClick={() => setIsQuizModalOpen(true)}
                                    className="p-6 bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl border-2 border-blue-300 hover:border-blue-500 hover:shadow-lg transition group"
                                >
                                    <Brain className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition" />
                                    <h3 className="font-semibold text-gray-800 mb-1">Generate Quiz</h3>
                                    <p className="text-sm text-gray-600">Test your knowledge on any topic</p>
                                </button>
                            </div>
                        </div>
                    )}

                    {messages.map((msg, index) => <ChatMessage key={index} message={msg} />)}
                    
                    {isLoading && (messages.length === 0 || messages[messages.length-1]?.role === 'user') && (
                        <div className="flex justify-start">
                            <div className="flex items-center gap-2 p-4 rounded-2xl bg-white border border-gray-200">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                                <span className="text-gray-500 text-sm">Thinking...</span>
                            </div>
                        </div>
                    )}
                    
                    {error && (
                        <div className="max-w-3xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t bg-white px-6 py-4 shadow-lg">
                    <div className="max-w-4xl mx-auto relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Ask a question about your notes, or request help studying..."
                            className="w-full resize-none border border-gray-300 rounded-xl px-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                            rows={1}
                            disabled={isLoading}
                        />
                        <div className="absolute left-4 top-4 flex gap-2">
                            <input 
                                ref={fileInputRef} 
                                type="file" 
                                accept=".txt,.md,.pdf,image/png,image/jpeg" 
                                onChange={handleFileUpload} 
                                className="hidden" 
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()} 
                                className="text-gray-500 hover:text-indigo-600 transition p-1" 
                                title="Upload document or image"
                                disabled={isLoading}
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>
                        </div>
                        <button 
                            onClick={handleSend} 
                            disabled={!input.trim() || isLoading} 
                            className="absolute right-3 top-3 p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition shadow-md"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Flashcard Modal */}
            <AIFlashcardModal
                isOpen={isFlashcardModalOpen}
                onClose={() => setIsFlashcardModalOpen(false)}
                onDeckCreated={handleFlashcardGenerated}
                mode="create"
            />

            {/* 4. ADDED COMMENTED-OUT MODAL TO FIX WARNINGS */}
            {
            <AIGenerateQuizModal
                 isOpen={isQuizModalOpen}
                 onClose={() => setIsQuizModalOpen(false)}
                 onQuizCreated={handleQuizGenerated}
             />
            }
        </div>
    );
};