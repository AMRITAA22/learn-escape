import React, { useState, useEffect } from 'react';
import aiService from '../../services/aiService';
import studyGroupsService from '../../services/studyGroupsService'; // 1. IMPORT GROUP SERVICE
import { Brain, Loader2, Type, Users } from 'lucide-react';

// Interface for the modal props
interface AIGenerateQuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    onQuizCreated: (quiz: any) => void;
}

// 2. DEFINE A TYPE FOR OUR GROUPS
interface StudyGroup {
    _id: string;
    name: string;
}

export const AIGenerateQuizModal = ({
    isOpen,
    onClose,
    onQuizCreated
}: AIGenerateQuizModalProps) => {
    // Form inputs state
    const [topic, setTopic] = useState('');
    const [numberOfQuestions, setNumberOfQuestions] = useState(10);
    const [title, setTitle] = useState('');
    
    // 3. ADD NEW STATE FOR GROUPS
    const [userGroups, setUserGroups] = useState<StudyGroup[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string>(''); // Store the selected group ID
    const [isLoadingGroups, setIsLoadingGroups] = useState(false);

    // Loading and error state
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    // 4. FETCH USER'S GROUPS WHEN MODAL OPENS
    useEffect(() => {
        if (isOpen) {
            const fetchGroups = async () => {
                setIsLoadingGroups(true);
                try {
                    const groups = await studyGroupsService.getUserGroups(); // 
                    setUserGroups(groups);
                } catch (err) {
                    console.error("Failed to fetch study groups", err);
                } finally {
                    setIsLoadingGroups(false);
                }
            };
            fetchGroups();
        }
    }, [isOpen]); // Re-run when modal opens

    // Reset all fields when the modal is closed
    const resetModal = () => {
        setTopic('');
        setTitle('');
        setNumberOfQuestions(10);
        setSelectedGroup('');
        setUserGroups([]);
        setIsGenerating(false);
        setError('');
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    // Handle the "Generate Quiz" button click
    const handleGenerate = async () => {
        if (!topic.trim()) {
            setError('Please enter a topic for your quiz.');
            return;
        }
        setIsGenerating(true);
        setError('');
        try {
            // 5. PASS THE 'selectedGroup' ID TO THE API
            const result = await aiService.generateQuizByTopic({
                topic: topic,
                numberOfQuestions: numberOfQuestions,
                title: title || undefined,
                studyGroupId: selectedGroup || undefined // Pass group ID if selected
            });
            
            onQuizCreated(result.quiz);
            handleClose(); 

        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Failed to generate quiz';
            setError(errorMsg);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-y-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-teal-600 rounded-xl">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                            AI Quiz Generator
                        </h2>
                    </div>

                    {/* Form */}
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
                                placeholder="e.g., The Roman Empire, Python Functions, Cell Biology"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isGenerating}
                            />
                        </div>

                        {/* Quiz Title (Optional) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quiz Title (Optional)
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Leave empty for auto-generated title"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isGenerating}
                            />
                        </div>

                        {/* 6. ADD THE STUDY GROUP DROPDOWN */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Users className="w-4 h-4" />
                                Add to Study Group (Optional)
                            </label>
                            {isLoadingGroups ? (
                                <p className="text-sm text-gray-500">Loading groups...</p>
                            ) : (
                                <select
                                    value={selectedGroup}
                                    onChange={(e) => setSelectedGroup(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    disabled={isGenerating}
                                >
                                    <option value="">Just for me (Personal Quiz)</option>
                                    {userGroups.map((group) => (
                                        <option key={group._id} value={group._id}>
                                            {group.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Number of Questions */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Number of Questions
                            </label>
                            <input
                                type="number"
                                min="3"
                                max="20"
                                value={numberOfQuestions}
                                onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isGenerating}
                            />
                        </div>

                        {/* Error Message */}
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
                                disabled={isGenerating || !topic.trim()}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Brain className="w-5 h-5" />
                                        Generate Quiz
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};