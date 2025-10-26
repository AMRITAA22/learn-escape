const Note = require('../models/Note');

// Get all notes for the logged-in user
exports.getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ createdBy: req.user.id }).sort({ updatedAt: -1 });
        res.status(200).json(notes);
    } catch (error) {
        console.error('Error getting notes:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get single note
exports.getNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Check if user owns the note
        const isOwner = note.createdBy.toString() === req.user.id;
        
        if (!isOwner) {
            // Check if this note is shared in any study group the user is a member of
            const StudyGroup = require('../models/StudyGroup');
            const sharedInGroups = await StudyGroup.find({
                'members.userId': req.user.id,
                'sharedResources': {
                    $elemMatch: {
                        resourceType: 'note',
                        resourceId: req.params.id
                    }
                }
            });

            console.log('User ID:', req.user.id);
            console.log('Note ID:', req.params.id);
            console.log('Shared in groups:', sharedInGroups.length);

            if (sharedInGroups.length === 0) {
                return res.status(403).json({ message: 'Not authorized to view this note' });
            }
        }

        res.status(200).json(note);
    } catch (error) {
        console.error('Error getting note:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Create a new note
exports.createNote = async (req, res) => {
    try {
        const note = await Note.create({ createdBy: req.user.id });
        res.status(201).json(note);
    } catch (error) {
        console.error('Error creating note:', error);
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
        console.error('Error updating note:', error);
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
        console.error('Error deleting note:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};