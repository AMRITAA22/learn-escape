import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import studyGroupsService from '../services/studyGroupsService';
import { useAuth } from '../context/AuthContext';
import { Users, Target, Share2, ArrowLeft, Plus, Trash2, LogOut, CheckCircle, BookOpen, MessageCircle, Send } from 'lucide-react';


interface Member {
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  role: 'admin' | 'member';
  joinedAt: string;
}

interface StudyGroup {
  _id: string;
  name: string;
  description: string;
  subject: string;
  groupCode?: string;
  members: Member[];
  createdBy: {
    _id: string;
    name: string;
  };
  goals: Array<{
    _id: string;
    title: string;
    description: string;
    targetDate: string;
    targetValue: number;
    currentValue: number;
    type: 'hours' | 'sessions' | 'tasks';
    completed: boolean;
  }>;
  sharedResources: Array<{
    _id: string;
    title: string;
    resourceType: 'note' | 'flashcard';
    resourceId: string;
    sharedBy: {
      _id: string;
      name: string;
    };
    sharedAt: string;
  }>;
  chat?: Array<{
    _id: string;
    userId: {
      _id: string;
      name: string;
    };
    message: string;
    createdAt: string;
  }>;
}

// Chat Tab Component
// Chat Tab Component with Improved UI
const ChatTab = ({ group, onMessageSent }: any) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [group.chat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await studyGroupsService.sendMessage(group._id, newMessage);
      setNewMessage('');
      onMessageSent();
    } catch (error) {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 48) {
      return 'Yesterday ' + date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-350px)] min-h-[500px]">
      {/* Chat Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Group Chat</h2>
          <p className="text-sm text-gray-500 mt-1">
            {group.members.length} members • {group.chat?.length || 0} messages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Online</span>
        </div>
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
        {(!group.chat || group.chat.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="bg-indigo-100 p-6 rounded-full mb-4">
              <MessageCircle size={48} className="text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Start the conversation!
            </h3>
            <p className="text-gray-500 max-w-sm">
              Share ideas, ask questions, and collaborate with your study group members.
            </p>
          </div>
        ) : (
          <>
            {group.chat.map((msg: any, index: number) => {
              const isOwnMessage = msg.userId._id === user?._id;
              const showAvatar = index === 0 || group.chat[index - 1].userId._id !== msg.userId._id;
              const initials = getInitials(msg.userId.name);

              return (
                <div
                  key={msg._id}
                  className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} ${
                    !showAvatar && 'ml-12'
                  }`}
                >
                  {/* Avatar */}
                  {showAvatar ? (
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                        isOwnMessage ? 'bg-indigo-600' : 'bg-gradient-to-br from-purple-500 to-pink-500'
                      }`}
                    >
                      {initials}
                    </div>
                  ) : (
                    <div className="w-10 flex-shrink-0" />
                  )}

                  {/* Message Content */}
                  <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    {showAvatar && (
                      <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-sm font-semibold text-gray-900">
                          {isOwnMessage ? 'You' : msg.userId.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatMessageTime(msg.createdAt)}
                        </span>
                      </div>
                    )}
                    
                    <div
                      className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                        isOwnMessage
                          ? 'bg-indigo-600 text-white rounded-tr-sm'
                          : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                    </div>

                    {!showAvatar && (
                      <span className="text-xs text-gray-400 mt-1 px-2">
                        {formatMessageTime(msg.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="relative">
        <div className="flex gap-3 p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 focus-within:border-indigo-500 transition-colors">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-none focus:outline-none text-gray-900 placeholder-gray-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center"
            title="Send message"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        
        {/* Character count */}
        {newMessage.length > 0 && (
          <div className="absolute -top-6 right-0 text-xs text-gray-400">
            {newMessage.length} / 500
          </div>
        )}
      </form>
    </div>
  );
};

// Resources Tab Component
const ResourcesTab = ({ group, onResourceShared }: any) => {
  const { user } = useAuth();
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareType, setShareType] = useState<'note' | 'flashcard'>('note');
  const [userNotes, setUserNotes] = useState<any[]>([]);
  const [userFlashcards, setUserFlashcards] = useState<any[]>([]);
  const [selectedResource, setSelectedResource] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadUserResources = useCallback(async () => {
    setIsLoading(true);
    try {
      if (shareType === 'note') {
        const notesService = (await import('../services/notesService')).default;
        const notes = await notesService.getNotes();
        setUserNotes(notes);
      } else {
        const flashcardsService = (await import('../services/flashcardsService')).default;
        const decks = await flashcardsService.getDecks();
        setUserFlashcards(decks);
      }
    } catch (error) {
      console.error('Failed to load resources:', error);
    } finally {
      setIsLoading(false);
    }
  }, [shareType]);

  useEffect(() => {
    if (showShareModal) {
      loadUserResources();
    }
  }, [showShareModal, loadUserResources]);

  const handleShareResource = async () => {
    if (!selectedResource) {
      alert('Please select a resource to share');
      return;
    }

    try {
      const resource = shareType === 'note' 
        ? userNotes.find(n => n._id === selectedResource)
        : userFlashcards.find(f => f._id === selectedResource);

      await studyGroupsService.shareResource(group._id, {
        resourceType: shareType,
        resourceId: selectedResource,
        title: resource?.title || resource?.name || 'Untitled',
      });

      setShowShareModal(false);
      setSelectedResource('');
      onResourceShared();
    } catch (error) {
      alert('Failed to share resource');
    }
  };
const handleDeleteResource = async (resourceId: string) => {
    try {
      await studyGroupsService.deleteSharedResource(group._id, resourceId);
      onResourceShared(); // Reload the group data
    } catch (error) {
      throw error;
    }
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Shared Resources</h2>
        <button 
          onClick={() => setShowShareModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Share2 size={16} />
          Share Resource
        </button>
      </div>

      {group.sharedResources.length === 0 ? (
        <div className="text-center py-12">
          <Share2 size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No resources shared yet. Share your notes or flashcards!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {group.sharedResources.map((resource: any) => (
            <ResourceCard 
              key={resource._id} 
              resource={resource}
              groupId={group._id}
              currentUserId={user?._id}
              isAdmin={user?._id === group.createdBy._id}
              onDelete={handleDeleteResource}
            />
          ))}
        </div>
      )}

      {/* Share Resource Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Share Resource</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setShareType('note')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    shareType === 'note'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Note
                </button>
                <button
                  onClick={() => setShareType('flashcard')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    shareType === 'flashcard'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Flashcard Deck
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select {shareType === 'note' ? 'Note' : 'Flashcard Deck'}
              </label>
              {isLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : (
                <select
                  value={selectedResource}
                  onChange={(e) => setSelectedResource(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a {shareType}</option>
                  {shareType === 'note' 
                    ? userNotes.map(note => (
                      <option key={note._id} value={note._id}>
                        {note.title || 'Untitled Note'}
                      </option>
                    ))
                    : userFlashcards.map(deck => (
                      <option key={deck._id} value={deck._id}>
                        {deck.title} ({deck.cards?.length || 0} cards)
                      </option>
                    ))
                  }
                </select>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleShareResource}
                className="flex-1 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Resource Card Component
// Resource Card Component
const ResourceCard = ({ resource, groupId, currentUserId, isAdmin, onDelete }: any) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'note':
        return <BookOpen size={20} className="text-blue-600" />;
      case 'flashcard':
        return <Target size={20} className="text-purple-600" />;
      default:
        return <Share2 size={20} className="text-gray-600" />;
    }
  };

  const getResourceLink = (resource: any) => {
    switch (resource.resourceType) {
      case 'note':
        return `/notes?id=${resource.resourceId}`;
      case 'flashcard':
        return `/flashcards/${resource.resourceId}`;
      default:
        return '#';
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this shared resource?')) {
      setIsDeleting(true);
      try {
        await onDelete(resource._id);
      } catch (error) {
        console.error('Failed to delete resource:', error);
        alert('Failed to delete resource');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Check if current user can delete (owner or admin)
  const canDelete = currentUserId === resource.sharedBy._id || isAdmin;

  return (
    <div className="bg-white border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow group">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-gray-50 rounded-lg">
          {getResourceIcon(resource.resourceType)}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{resource.title}</h3>
          <p className="text-xs text-gray-500 capitalize">{resource.resourceType}</p>
        </div>
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
            title="Delete resource"
          >
            <Trash2 size={16} className="text-red-500" />
          </button>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-600">
          <p>Shared by <span className="font-medium">{resource.sharedBy.name}</span></p>
          <p>{new Date(resource.sharedAt).toLocaleDateString()}</p>
        </div>
        <Link
          to={getResourceLink(resource)}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
        >
          View →
        </Link>
      </div>
    </div>
  );
};  

// Goals Tab Component
const GoalsTab = ({ group, onGoalUpdated }: any) => {
  const { user } = useAuth();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetDate: '',
    targetValue: 1,
    type: 'tasks' as 'hours' | 'sessions' | 'tasks'
  });

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await studyGroupsService.addGoal(group._id, {
        title: newGoal.title,
        description: newGoal.description,
        targetValue: newGoal.targetValue,
        type: newGoal.type,
        deadline: newGoal.targetDate ? new Date(newGoal.targetDate) : undefined
      });
      setShowAddGoal(false);
      setNewGoal({ title: '', description: '', targetDate: '', targetValue: 1, type: 'tasks' });
      onGoalUpdated();
    } catch (error) {
      alert('Failed to add goal');
    }
  };

  const handleUpdateProgress = async (goalId: string, increment: number) => {
    try {
      await studyGroupsService.updateGoalProgress(group._id, goalId, increment);
      onGoalUpdated();
    } catch (error) {
      alert('Failed to update progress');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await studyGroupsService.deleteGoal(group._id, goalId);
        onGoalUpdated();
      } catch (error) {
        console.error('Delete goal error:', error);
        alert('Failed to delete goal');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Group Goals</h2>
        <button
          onClick={() => setShowAddGoal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus size={16} />
          Add Goal
        </button>
      </div>

      {group.goals.length === 0 ? (
        <div className="text-center py-12">
          <Target size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No goals set yet. Add your first study goal!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {group.goals.map((goal: any) => {
            const progress = (goal.currentValue / goal.targetValue) * 100;
            const isCompleted = goal.currentValue >= goal.targetValue;
            
            return (
              <div
                key={goal._id}
                className={`bg-white border p-4 rounded-lg transition-all ${
                  isCompleted ? 'border-green-300 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{goal.title}</h3>
                      {isCompleted && <CheckCircle size={20} className="text-green-600" />}
                    </div>
                    <p className="text-sm text-gray-600 capitalize">{goal.type}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteGoal(goal._id)}
                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors"
                    title="Delete Goal"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold">{goal.currentValue} / {goal.targetValue}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isCompleted ? 'bg-green-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                {!isCompleted && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateProgress(goal._id, 1)}
                      className="flex-1 bg-indigo-100 text-indigo-700 py-2 px-4 rounded-lg hover:bg-indigo-200 font-semibold"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleUpdateProgress(goal._id, 5)}
                      className="flex-1 bg-indigo-100 text-indigo-700 py-2 px-4 rounded-lg hover:bg-indigo-200 font-semibold"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => handleUpdateProgress(goal._id, 10)}
                      className="flex-1 bg-indigo-100 text-indigo-700 py-2 px-4 rounded-lg hover:bg-indigo-200 font-semibold"
                    >
                      +10
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Study Goal</h2>
            <form onSubmit={handleAddGoal}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Type</label>
                <select
                  value={newGoal.type}
                  onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value as 'hours' | 'sessions' | 'tasks' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="tasks">Tasks</option>
                  <option value="hours">Hours</option>
                  <option value="sessions">Sessions</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Value</label>
                <input
                  type="number"
                  min="1"
                  value={newGoal.targetValue}
                  onChange={(e) => setNewGoal({ ...newGoal, targetValue: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddGoal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
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

// Main Component
const StudyGroupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'resources' | 'chat'>('overview');

  const loadGroup = useCallback(async () => {
    try {
      const data = await studyGroupsService.getGroupById(id!);
      setGroup(data);
    } catch (error) {
      console.error('Failed to load study group:', error);
      alert('Failed to load study group');
      navigate('/study-groups');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadGroup();
  }, [loadGroup]);

  const handleLeaveGroup = async () => {
    if (window.confirm('Are you sure you want to leave this study group?')) {
      try {
        await studyGroupsService.leaveGroup(id!);
        navigate('/study-groups');
      } catch (error) {
        alert('Failed to leave group');
      }
    }
  };

  const handleDeleteGroup = async () => {
    if (window.confirm('Are you sure you want to delete this study group? This action cannot be undone.')) {
      try {
        await studyGroupsService.deleteGroup(id!);
        navigate('/study-groups');
      } catch (error) {
        alert('Failed to delete group');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading study group...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return null;
  }

  const isCreator = user?._id === group.createdBy._id;
  const isMember = group.members.some(m => m.userId._id === user?._id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <Link
          to="/study-groups"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6 font-medium"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Groups
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.name}</h1>
              <p className="text-gray-600 mb-4">{group.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-gray-600">
                  <Users size={16} />
                  {group.members.length} members
                </span>
                <span className="flex items-center gap-1 text-gray-600">
                  <Target size={16} />
                  {group.goals?.length || 0} goals
                </span>
              </div>
            </div>

            {group.groupCode && (
              <div className="text-right">
                <span className="text-xs text-gray-500">Group Code</span>
                <p className="text-lg font-bold text-indigo-600">{group.groupCode}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'goals'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Goals
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'resources'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Resources
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Chat
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Members</h2>
              <div className="space-y-3">
                {group.members.map((member) => {
                  const memberName = member.userId?.name || 'Unknown User';
                  const memberEmail = member.userId?.email || '';
                  const initials = memberName
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                  
                  return (
                    <div key={member.userId?._id} className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                        {initials}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{memberName}</h3>
                        <p className="text-sm text-gray-600 capitalize">{member.role}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <GoalsTab group={group} onGoalUpdated={loadGroup} />
          )}

          {activeTab === 'resources' && (
            <ResourcesTab group={group} onResourceShared={loadGroup} />
          )}

          {activeTab === 'chat' && (
            <ChatTab group={group} onMessageSent={loadGroup} />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyGroupDetailPage;