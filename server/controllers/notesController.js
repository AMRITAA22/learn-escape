const Note = require('../models/Note');

// Get all notes for the logged-in user
exports.getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ createdBy: req.user.id }).sort({ updatedAt: -1 });
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Create a new note
exports.createNote = async (req, res) => {
    try {
        const note = await Note.create({ createdBy: req.user.id });
        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update a note (for title or content)
exports.updateNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        const note = await Note.findById(req.params.id);

        if (!note || note.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Note not found or user not authorized' });
        }

        if (title !== undefined) note.title = title;
        if (content !== undefined) note.content = content;

        const updatedNote = await note.save();
        res.status(200).json(updatedNote);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Delete a note
exports.deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note || note.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Note not found or user not authorized' });
        }
        await note.deleteOne();
        res.status(200).json({ message: 'Note removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};