import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import notesService from '../services/notesService';
// import { Plus, Trash2, FileText, Search, Clock, ChevronRight, Lock } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import achievementsService from '../services/achievementsService';
// import { exportNoteToPDF } from '../utils/pdfExport';
// import { Download } from 'lucide-react';
import { Plus, Trash2, FileText, Search, Clock, ChevronRight, Lock, Download, BarChart3 } from 'lucide-react';
import { exportNoteToPDF, exportAllNotesToPDF, exportNotesStats } from '../utils/pdfExport';
// const [showExportMenu, setShowExportMenu] = useState(false);
interface INote {
    _id: string;
    title: string;
    content: string;
    updatedAt: string;
    createdAt: string;
    createdBy: string;
}

export const NotesPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [notes, setNotes] = useState<INote[]>([]);
    const [activeNote, setActiveNote] = useState<INote | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingNote, setIsLoadingNote] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isSharedNote, setIsSharedNote] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
    const hasLoadedFromUrl = useRef(false);

    useEffect(() => {
        loadNotes();
    }, []);

    // Handle URL parameter for shared notes
    useEffect(() => {
        const noteId = searchParams.get('id');
        if (noteId && !hasLoadedFromUrl.current) {
            hasLoadedFromUrl.current = true;
            loadSharedNote(noteId);
        }
    }, [searchParams]);

    const loadNotes = async () => {
        try {
            const data = await notesService.getNotes();
            setNotes(data);
            
            // Only auto-select first note if no URL parameter
            const noteId = searchParams.get('id');
            if (!noteId && data.length > 0 && !activeNote) {
                setActiveNote(data[0]);
                setIsSharedNote(false);
            }
        } catch (error) {
            console.error('Failed to load notes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadSharedNote = async (noteId: string) => {
        setIsLoadingNote(true);
        try {
            const fullNote = await notesService.getNote(noteId);
            console.log('Loaded shared note:', fullNote);
            setActiveNote(fullNote);
            setIsSharedNote(true);
            
            // Clear the URL parameter after loading
            setSearchParams({});
        } catch (error) {
            console.error('Failed to load shared note:', error);
            alert('Failed to load this note. You may not have permission to view it.');
            // Clear URL parameter on error
            setSearchParams({});
            setIsLoadingNote(false);
        } finally {
            setIsLoadingNote(false);
        }
    };

    const handleNoteClick = (note: INote) => {
        setActiveNote(note);
        setIsSharedNote(false);
        hasLoadedFromUrl.current = false;
    };

    const handleCreateNote = async () => {
        try {
            const newNote = await notesService.createNote();
            setNotes(prev => [newNote, ...prev]);
            setActiveNote(newNote);
            setIsSharedNote(false);
            
            achievementsService.checkAchievements()
                .catch(err => console.error("Failed to check achievements", err));
        } catch (error) {
            console.error("Failed to create note", error);
        }
    };

    const handleDeleteNote = async (noteId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this note?')) {
            try {
                await notesService.deleteNote(noteId);
                const updatedNotes = notes.filter(n => n._id !== noteId);
                setNotes(updatedNotes);
                if (activeNote?._id === noteId) {
                    if (updatedNotes.length > 0) {
                        setActiveNote(updatedNotes[0]);
                        setIsSharedNote(false);
                    } else {
                        setActiveNote(null);
                        setIsSharedNote(false);
                    }
                }
            } catch (error) {
                console.error("Failed to delete note", error);
            }
        }
    };

    const handleNoteUpdate = async (field: 'title' | 'content', value: string) => {
        if (!activeNote || isSharedNote) return;

        const updatedNote = { ...activeNote, [field]: value };
        setActiveNote(updatedNote);
        setNotes(prev => prev.map(n => n._id === activeNote._id ? { ...n, [field]: value } : n));

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        setIsSaving(true);
        debounceTimeout.current = setTimeout(async () => {
            try {
                const saved = await notesService.updateNote(activeNote._id, { [field]: value });
                console.log('Note saved:', saved);
                setActiveNote(saved);
                setNotes(prev => prev.map(n => n._id === saved._id ? saved : n));
            } catch (error) {
                console.error('Failed to save note:', error);
                alert('Failed to save note. Please try again.');
            } finally {
                setIsSaving(false);
            }
        }, 1000);
    };

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.content && note.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getPreviewText = (html: string) => {
        if (!html) return '';
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your notes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-white">
            {/* Sidebar */}
            <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
                {/* Sidebar Header */}
                {/* Sidebar Header */}
<div className="p-4 border-b border-gray-200 bg-white">
    <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-900">Notes</h1>
        <div className="flex items-center gap-2">
            {/* Export Dropdown Menu */}
            {notes.length > 0 && (
                <div className="relative">
                    <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                        title="Export Options"
                    >
                        <Download size={20} className="text-gray-700" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {showExportMenu && (
                        <>
                            {/* Backdrop to close menu */}
                            <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setShowExportMenu(false)}
                            />
                            
                            {/* Menu */}
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Export Options</p>
                                </div>
                                
                                <button
                                    onClick={() => {
                                        if (activeNote) exportNoteToPDF(activeNote);
                                        setShowExportMenu(false);
                                    }}
                                    disabled={!activeNote}
                                    className="w-full text-left px-4 py-3 hover:bg-indigo-50 flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                        <FileText size={16} className="text-indigo-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">Current Note</p>
                                        <p className="text-xs text-gray-500">Export active note as PDF</p>
                                    </div>
                                </button>
                                
                                <button
                                    onClick={() => {
                                        exportAllNotesToPDF(notes);
                                        setShowExportMenu(false);
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-green-50 flex items-center gap-3 transition-colors group"
                                >
                                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                        <Download size={16} className="text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">All Notes</p>
                                        <p className="text-xs text-gray-500">Export {notes.length} notes in one PDF</p>
                                    </div>
                                </button>
                                
                                <button
                                    onClick={() => {
                                        exportNotesStats(notes);
                                        setShowExportMenu(false);
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-purple-50 flex items-center gap-3 transition-colors group"
                                >
                                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                        <BarChart3 size={16} className="text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">Statistics</p>
                                        <p className="text-xs text-gray-500">Export notes analytics</p>
                                    </div>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
            
            <button
                onClick={handleCreateNote}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="New Note"
            >
                <Plus size={20} className="text-gray-700" />
            </button>
        </div>
    </div>
    
    {/* Search Bar */}
    <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
        />
    </div>
</div>

                {/* Notes List */}
                <div className="flex-1 overflow-y-auto">
                    {/* Shared Note Indicator */}
                    {isSharedNote && activeNote && (
                        <div className="p-2">
                            <p className="text-xs font-semibold text-gray-500 mb-2 px-3">SHARED WITH YOU</p>
                            <div className="p-3 rounded-lg mb-1 bg-blue-50 border border-blue-200">
                                <div className="flex items-start gap-2 mb-1">
                                    <Lock size={14} className="text-blue-600 mt-0.5" />
                                    <h3 className="font-medium text-sm truncate flex-1 text-blue-900">
                                        {activeNote.title || 'Untitled'}
                                    </h3>
                                </div>
                                <p className="text-xs text-blue-600">Read-only • Shared via study group</p>
                            </div>
                        </div>
                    )}

                    {/* My Notes */}
                    {filteredNotes.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <FileText size={48} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm">
                                {searchQuery ? 'No notes found' : 'No notes yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="p-2">
                            {(isSharedNote && activeNote) && (
                                <p className="text-xs font-semibold text-gray-500 mb-2 px-3 mt-4">MY NOTES</p>
                            )}
                            {filteredNotes.map(note => {
                                const isActive = !isSharedNote && activeNote?._id === note._id;
                                const preview = getPreviewText(note.content).slice(0, 80);
                                
                                return (
                                    <div
                                        key={note._id}
                                        onClick={() => handleNoteClick(note)}
                                        className={`group p-3 rounded-lg cursor-pointer mb-1 transition-all ${
                                            isActive
                                                ? 'bg-white shadow-sm border border-gray-200'
                                                : 'hover:bg-white hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-1">
                                            <h3 className={`font-medium text-sm truncate flex-1 ${
                                                isActive ? 'text-gray-900' : 'text-gray-700'
                                            }`}>
                                                {note.title || 'Untitled'}
                                            </h3>
                                            <button
                                                onClick={(e) => handleDeleteNote(note._id, e)}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
                                            >
                                                <Trash2 size={14} className="text-red-500" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate mb-1">
                                            {preview || 'No content'}
                                        </p>
                                        <div className="flex items-center text-xs text-gray-400">
                                            <Clock size={12} className="mr-1" />
                                            {new Date(note.updatedAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Editor */}
            <div className="flex-1 flex flex-col">
                {isLoadingNote ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                            <p className="mt-2 text-sm text-gray-600">Loading note...</p>
                        </div>
                    </div>
                ) : activeNote ? (
                    <>
                        {/* Editor Header */}
                        <div className="px-16 py-4 border-b border-gray-200 bg-white">
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    {isSharedNote && <Lock size={16} className="text-blue-600" />}
                                    <FileText size={16} />
                                    <ChevronRight size={14} />
                                    <span className="truncate max-w-md">{activeNote.title || 'Untitled'}</span>
                                    {isSharedNote && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                            Read-only
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    {!isSharedNote && isSaving && (
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                                            Saving...
                                        </span>
                                    )}
                                    {!isSharedNote && !isSaving && (
                                        <span className="text-xs text-green-600">Saved</span>
                                    )}
                                    <span className="text-xs">
                                        Last edited: {new Date(activeNote.updatedAt).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Editor Content */}
                        <div className="flex-1 overflow-y-auto px-16 py-8 bg-white">
                            <input
                                type="text"
                                value={activeNote.title}
                                onChange={(e) => handleNoteUpdate('title', e.target.value)}
                                disabled={isSharedNote}
                                className={`w-full text-5xl font-bold border-none focus:outline-none bg-transparent mb-4 text-gray-900 placeholder-gray-300 ${
                                    isSharedNote ? 'cursor-not-allowed opacity-70' : ''
                                }`}
                                placeholder="Untitled"
                            />
                            
                            <div className="prose prose-lg max-w-none">
                                <ReactQuill
                                    value={activeNote.content || ''}
                                    onChange={(content) => handleNoteUpdate('content', content)}
                                    readOnly={isSharedNote}
                                    theme="snow"
                                    className="border-none"
                                    placeholder={isSharedNote ? "" : "Start writing..."}
                                    modules={{
                                        toolbar: isSharedNote ? false : [
                                            [{ 'header': [1, 2, 3, false] }],
                                            ['bold', 'italic', 'underline', 'strike'],
                                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                            [{ 'color': [] }, { 'background': [] }],
                                            ['blockquote', 'code-block'],
                                            ['link', 'image'],
                                            ['clean']
                                        ]
                                    }}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center bg-white">
                        <div className="max-w-md">
                            <FileText size={64} className="text-gray-300 mx-auto mb-4" />
                            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                                {notes.length === 0 ? 'Create your first note' : 'Select a note to view'}
                            </h2>
                            <p className="text-gray-500 mb-6">
                                {notes.length === 0
                                    ? 'Click the + button to start writing'
                                    : 'Choose a note from the sidebar or create a new one'}
                            </p>
                            {notes.length === 0 && (
                                <button
                                    onClick={handleCreateNote}
                                    className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    <Plus size={20} />
                                    New Note
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
        
    );
};