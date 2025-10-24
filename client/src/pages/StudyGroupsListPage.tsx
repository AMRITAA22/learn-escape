import React, { useState, useEffect } from 'react';
import studyGroupsService from '../services/studyGroupsService';
import { Link } from 'react-router-dom';
import { Users, Plus, LogIn, Trash2, Calendar, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface StudyGroup {
    _id: string;
    name: string;
    description: string;
    groupCode: string;
    createdBy: any;
    members: any[];
    goals: any[];
    sharedResources: any[];
    createdAt: string;
}

export const StudyGroupsListPage = () => {
    const { user } = useAuth();
    const [groups, setGroups] = useState<StudyGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDescription, setNewGroupDescription] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        try {
            setIsLoading(true);
            const data = await studyGroupsService.getUserGroups();
            setGroups(data);
        } catch (error) {
            console.error('Failed to load groups:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroupName.trim()) {
            setError('Group name is required');
            return;
        }

        try {
            setError('');
            await studyGroupsService.createGroup({
                name: newGroupName,
                description: newGroupDescription,
                isPrivate: true,
            });
            setNewGroupName('');
            setNewGroupDescription('');
            setIsCreateModalOpen(false);
            loadGroups();
        } catch (error) {
            setError('Failed to create group');
        }
    };

    const handleJoinGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinCode.trim()) {
            setError('Group code is required');
            return;
        }

        try {
            setError('');
            await studyGroupsService.joinGroup(joinCode);
            setJoinCode('');
            setIsJoinModalOpen(false);
            loadGroups();
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to join group');
        }
    };

    const handleDeleteGroup = async (groupId: string) => {
        if (window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
            try {
                await studyGroupsService.deleteGroup(groupId);
                loadGroups();
            } catch (error) {
                alert('Failed to delete group');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your groups...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Study Groups</h1>
                <p className="text-gray-600">Collaborate with others and achieve your learning goals together</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-semibold shadow-lg"
                >
                    <Plus size={20} />
                    Create Group
                </button>
                <button
                    onClick={() => setIsJoinModalOpen(true)}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-semibold shadow-lg"
                >
                    <LogIn size={20} />
                    Join Group
                </button>
            </div>

            {/* Groups Grid */}
            {groups.length === 0 ? (
                <div className="bg-white p-12 rounded-lg shadow text-center">
                    <Users size={64} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Study Groups Yet</h3>
                    <p className="text-gray-500 mb-6">Create a new group or join an existing one to get started</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                        >
                            Create Group
                        </button>
                        <button
                            onClick={() => setIsJoinModalOpen(true)}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                        >
                            Join Group
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((group) => (
                        <GroupCard
                            key={group._id}
                            group={group}
                            currentUserId={user?._id}
                            onDelete={handleDeleteGroup}
                        />
                    ))}
                </div>
            )}

            {/* Create Group Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Study Group</h2>
                        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
                        <form onSubmit={handleCreateGroup}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                                <input
                                    type="text"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    placeholder="e.g., CS101 Study Group"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={newGroupDescription}
                                    onChange={(e) => setNewGroupDescription(e.target.value)}
                                    placeholder="What's this group about?"
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Join Group Modal */}
            {isJoinModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Join Study Group</h2>
                        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
                        <form onSubmit={handleJoinGroup}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Group Code</label>
                                <input
                                    type="text"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    placeholder="e.g., ABC123"
                                    maxLength={6}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-2xl font-bold tracking-widest uppercase"
                                />
                                <p className="text-xs text-gray-500 mt-2">Enter the 6-character code shared by the group admin</p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsJoinModalOpen(false)}
                                    className="flex-1 bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700"
                                >
                                    Join
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Group Card Component
const GroupCard = ({ group, currentUserId, onDelete }: any) => {
    const isCreator = group.createdBy._id === currentUserId;
    const memberCount = group.members.length;
    const goalCount = group.goals.length;
    const resourceCount = group.sharedResources.length;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-3 rounded-lg">
                        <Users size={24} className="text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
                        {isCreator && <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded">Admin</span>}
                    </div>
                </div>
                {isCreator && (
                    <button
                        onClick={() => onDelete(group._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Group"
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{group.description || 'No description'}</p>

            {/* Group Stats */}
            <div className="flex gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span>{memberCount} members</span>
                </div>
                <div className="flex items-center gap-1">
                    <Target size={16} />
                    <span>{goalCount} goals</span>
                </div>
            </div>

            {/* Group Code */}
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <p className="text-xs text-gray-500 mb-1">Group Code</p>
                <p className="text-lg font-bold text-indigo-600 tracking-widest">{group.groupCode}</p>
            </div>

            {/* View Group Button */}
            <Link
                to={`/study-groups/${group._id}`}
                className="block w-full bg-indigo-600 text-white text-center py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
                View Group
            </Link>
        </div>
    );
};