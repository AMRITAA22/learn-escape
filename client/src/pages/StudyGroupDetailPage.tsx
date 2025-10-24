import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import studyGroupsService from '../services/studyGroupsService';
import { useAuth } from '../context/AuthContext';
import { Users, Target, Share2, MessageCircle, ArrowLeft, Plus, Trash2, LogOut, CheckCircle } from 'lucide-react';

export const StudyGroupDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [group, setGroup] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'resources' | 'chat'>('overview');
    const [newMessage, setNewMessage] = useState('');
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [newGoalTarget, setNewGoalTarget] = useState(0);
    const [newGoalType, setNewGoalType] = useState<'hours' | 'sessions' | 'tasks'>('hours');
    const [showGoalModal, setShowGoalModal] = useState(false);

    useEffect(() => {
        if (id) {
            loadGroup();
        }
    }, [id]);

    const loadGroup = async () => {
        try {
            setIsLoading(true);
            const data = await studyGroupsService.getGroupById(id!);
            setGroup(data);
        } catch (error) {
            console.error('Failed to load group:', error);
            alert('Failed to load group');
            navigate('/study-groups');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLeaveGroup = async () => {
        if (window.confirm('Are you sure you want to leave this group?')) {
            try {
                await studyGroupsService.leaveGroup(id!);
                navigate('/study-groups');
            } catch (error: any) {
                alert(error.response?.data?.message || 'Failed to leave group');
            }
        }
    };

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGoalTitle.trim() || newGoalTarget <= 0) {
            alert('Please fill in all fields');
            return;
        }

        try {
            await studyGroupsService.addGoal(id!, {
                title: newGoalTitle,
                targetValue: newGoalTarget,
                type: newGoalType,
            });
            setNewGoalTitle('');
            setNewGoalTarget(0);
            setShowGoalModal(false);
            loadGroup();
        } catch (error) {
            alert('Failed to add goal');
        }
    };

    const handleUpdateGoalProgress = async (goalId: string, progress: number) => {
        try {
            await studyGroupsService.updateGoalProgress(id!, goalId, progress);
            loadGroup();
        } catch (error) {
            alert('Failed to update progress');
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await studyGroupsService.sendMessage(id!, newMessage);
            setNewMessage('');
            loadGroup();
        } catch (error) {
            alert('Failed to send message');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading group...</p>
                </div>
            </div>
        );
    }

    if (!group) return null;

    const isAdmin = group.members.find((m: any) => m.userId._id === user?._id)?.role === 'admin';

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Header */}
            <div className="mb-8">
                <Link to="/study-groups" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 mb-4">
                    <ArrowLeft size={20} />
                    Back to Groups
                </Link>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.name}</h1>
                            <p className="text-gray-600 mb-4">{group.description}</p>
                            <div className="flex gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Users size={16} />
                                    <span>{group.members.length} members</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Target size={16} />
                                    <span>{group.goals.length} goals</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                <p className="text-xs text-gray-500">Group Code</p>
                                <p className="text-xl font-bold text-indigo-600 tracking-widest">{group.groupCode}</p>
                            </div>
                            {!isAdmin && (
                                <button
                                    onClick={handleLeaveGroup}
                                    className="text-red-600 hover:text-red-800 text-sm font-semibold flex items-center gap-1"
                                >
                                    <LogOut size={16} />
                                    Leave Group
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md mb-8">
                <div className="border-b border-gray-200">
                    <div className="flex">
                        {['overview', 'goals', 'resources', 'chat'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`flex-1 px-6 py-4 text-sm font-medium capitalize ${
                                    activeTab === tab
                                        ? 'border-b-2 border-indigo-600 text-indigo-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Members</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {group.members.map((member: any) => (
                                    <div key={member.userId._id} className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {member.userId.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{member.userId.name}</p>
                                            <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Goals Tab */}
                    {activeTab === 'goals' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Group Goals</h2>
                                <button
                                    onClick={() => setShowGoalModal(true)}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    Add Goal
                                </button>
                            </div>

                            {group.goals.length === 0 ? (
                                <div className="text-center py-12">
                                    <Target size={48} className="text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No goals yet. Create one to get started!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {group.goals.map((goal: any) => (
                                        <GoalCard
                                            key={goal._id}
                                            goal={goal}
                                            onUpdateProgress={handleUpdateGoalProgress}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Resources Tab */}
                    {activeTab === 'resources' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Shared Resources</h2>
                                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                                    <Share2 size={16} />
                                    Share Resource
                                </button>
                            </div>

                            {group.sharedResources.length === 0 ? (
                                <div className="text-center py-12">
                                    <Share2 size={48} className="text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No resources shared yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {group.sharedResources.map((resource: any) => (
                                        <div key={resource._id} className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                                            <p className="text-sm text-gray-600">
                                                Shared by {resource.sharedBy.name} • {new Date(resource.sharedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Chat Tab */}
                    {activeTab === 'chat' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Group Chat</h2>
                            <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto mb-4">
                                {group.chat.length === 0 ? (
                                    <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
                                ) : (
                                    <div className="space-y-3">
                                        {group.chat.map((msg: any) => (
                                            <div key={msg._id} className="bg-white p-3 rounded-lg">
                                                <p className="font-semibold text-sm text-gray-900">{msg.userId.name}</p>
                                                <p className="text-gray-700">{msg.message}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(msg.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    type="submit"
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Goal Modal */}
            {showGoalModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Group Goal</h2>
                        <form onSubmit={handleAddGoal}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Title</label>
                                <input
                                    type="text"
                                    value={newGoalTitle}
                                    onChange={(e) => setNewGoalTitle(e.target.value)}
                                    placeholder="e.g., Study 100 hours together"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Type</label>
                                <select
                                    value={newGoalType}
                                    onChange={(e) => setNewGoalType(e.target.value as any)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="hours">Study Hours</option>
                                    <option value="sessions">Pomodoro Sessions</option>
                                    <option value="tasks">Tasks Completed</option>
                                </select>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Target Value</label>
                                <input
                                    type="number"
                                    value={newGoalTarget || ''}
                                    onChange={(e) => setNewGoalTarget(parseInt(e.target.value) || 0)}
                                    placeholder="e.g., 100"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowGoalModal(false)}
                                    className="flex-1 bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700"
                                >
                                    Add Goal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Goal Card Component
const GoalCard = ({ goal, onUpdateProgress }: any) => {
    const progressPercent = (goal.currentValue / goal.targetValue) * 100;

    return (
        <div className={`p-6 rounded-lg ${goal.completed ? 'bg-green-50 border-2 border-green-200' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-bold text-gray-900">{goal.title}</h3>
                    <p className="text-sm text-gray-600 capitalize">{goal.type}</p>
                </div>
                {goal.completed && <CheckCircle className="text-green-600" size={24} />}
            </div>

            <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-bold text-gray-900">
                        {goal.currentValue} / {goal.targetValue}
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className={`h-3 rounded-full transition-all ${goal.completed ? 'bg-green-500' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    ></div>
                </div>
            </div>

            {!goal.completed && (
                <div className="flex gap-2">
                    <button
                        onClick={() => onUpdateProgress(goal._id, 1)}
                        className="flex-1 bg-indigo-50 text-indigo-600 py-2 rounded-lg hover:bg-indigo-100 text-sm font-semibold"
                    >
                        +1
                    </button>
                    <button
                        onClick={() => onUpdateProgress(goal._id, 5)}
                        className="flex-1 bg-indigo-50 text-indigo-600 py-2 rounded-lg hover:bg-indigo-100 text-sm font-semibold"
                    >
                        +5
                    </button>
                    <button
                        onClick={() => onUpdateProgress(goal._id, 10)}
                        className="flex-1 bg-indigo-50 text-indigo-600 py-2 rounded-lg hover:bg-indigo-100 text-sm font-semibold"
                    >
                        +10
                    </button>
                </div>
            )}
        </div>
    );
};