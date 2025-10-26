const express = require('express');
const router = express.Router();
const { getNotes, getNote, createNote, updateNote, deleteNote } = require('../controllers/notesController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getNotes)
    .post(createNote);

router.route('/:id')
    .get(getNote)      // ADD THIS LINE - to get single note
    .put(updateNote)
    .delete(deleteNote);

module.exports = router;