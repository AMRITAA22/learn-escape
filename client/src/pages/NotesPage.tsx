import React, { useState, useEffect, useRef } from 'react';
import notesService from '../services/notesService';
import { Plus, Trash2, FileText } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import achievementsService from '../services/achievementsService';
interface INote {
    _id: string;
    title: string;
    content: string;
    updatedAt: string;
}

export const NotesPage = () => {
    const [notes, setNotes] = useState<INote[]>([]);
    const [activeNote, setActiveNote] = useState<INote | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    // Fetch all notes on initial load
    useEffect(() => {
        notesService.getNotes()
            .then(data => {
                setNotes(data);
                if (data.length > 0) {
                    setActiveNote(data[0]);
                }
            })
            .finally(() => setIsLoading(false));
    }, []);

    const handleCreateNote = async () => {
    try {
        const newNote = await notesService.createNote();
        setNotes(prev => [newNote, ...prev]);
        setActiveNote(newNote);
        
        // ✨ ADD THIS: Check achievements
        achievementsService.checkAchievements()
            .catch(err => console.error("Failed to check achievements", err));
    } catch (error) {
        console.error("Failed to create note", error);
    }
};

    const handleDeleteNote = async (noteId: string) => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            try {
                await notesService.deleteNote(noteId);
                const updatedNotes = notes.filter(n => n._id !== noteId);
                setNotes(updatedNotes);
                setActiveNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
            } catch (error) {
                console.error("Failed to delete note", error);
            }
        }
    };

    const handleNoteUpdate = (field: 'title' | 'content', value: string) => {
        if (!activeNote) return;

        // Update the UI instantly
        const updatedNote = { ...activeNote, [field]: value };
        setActiveNote(updatedNote);
        setNotes(prev => prev.map(n => n._id === activeNote._id ? updatedNote : n));

        // Debounce the API call to save automatically
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            notesService.updateNote(activeNote._id, { [field]: value });
        }, 1500); // Auto-save after 1.5 seconds of inactivity
    };

    if (isLoading) return <div>Loading notes...</div>;

    return (
        <div className="flex h-[calc(100vh-100px)]">
            {/* Notes List Sidebar */}
            <div className="w-1/4 bg-gray-50 border-r p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">All Notes</h2>
                    <button onClick={handleCreateNote} className="p-2 hover:bg-gray-200 rounded-full"><Plus size={20} /></button>
                </div>
                <div className="overflow-y-auto">
                    {notes.map(note => (
                        <div
                            key={note._id}
                            onClick={() => setActiveNote(note)}
                            className={`p-3 rounded-lg cursor-pointer group ${activeNote?._id === note._id ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}
                        >
                            <div className="flex justify-between items-start">
                                <p className="font-semibold truncate pr-2">{note.title}</p>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteNote(note._id); }} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400">{new Date(note.updatedAt).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Note Editor */}
            <div className="w-3/4 p-8 flex flex-col">
                {activeNote ? (
                    <>
                        <input
                            type="text"
                            value={activeNote.title}
                            onChange={(e) => handleNoteUpdate('title', e.target.value)}
                            className="text-4xl font-bold border-none focus:outline-none bg-transparent mb-4"
                            placeholder="Untitled Note"
                        />
                        <ReactQuill
                            value={activeNote.content}
                            onChange={(content) => handleNoteUpdate('content', content)}
                            theme="snow"
                            className="flex-grow"
                            modules={{ toolbar: [
                                [{ 'header': [1, 2, 3, false] }],
                                ['bold', 'italic', 'underline', 'strike'],
                                [{'list': 'ordered'}, {'list': 'bullet'}],
                                ['link', 'image'],
                                ['clean']
                            ]}}
                        />
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                        <FileText size={48} />
                        <p className="mt-4">Select a note to view, or create a new one.</p>
                    </div>
                )}
            </div>
        </div>
    );
};