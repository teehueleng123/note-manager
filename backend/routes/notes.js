const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Adjust path to your db config

// GET all notes
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM notes ORDER BY created_at DESC');
        return res.json(rows);
    } catch (err) {
        console.error('Error fetching notes:', err);
        return res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

// POST a new note
router.post('/', async (req, res) => {
    try {
        const { title, content, quote, is_favorite, background_style } = req.body;
        
        // Require at least content to save a thought
        if (!content) {
            return res.status(400).json({ error: 'Note content is required' });
        }

        const noteTitle = title && title.trim() !== '' ? title : 'Untitled Note';

        const [result] = await db.query(
            'INSERT INTO notes (title, content, quote, is_favorite, background_style) VALUES (?, ?, ?, ?, ?)',
            [noteTitle, content, quote || null, is_favorite || 0, background_style || 'default']
        );
        const [newNote] = await db.query('SELECT * FROM notes WHERE id = ?', [result.insertId]);
        return res.status(201).json(newNote[0]);
    } catch (err) {
        console.error('Error creating note:', err);
        return res.status(500).json({ error: 'Failed to create note' });
    }
});

// PUT (update) a note
router.put('/:id', async (req, res) => {
    try {
        const { title, content, quote, is_favorite, background_style } = req.body;
        
        if (!content) {
            return res.status(400).json({ error: 'Note content is required' });
        }

        const noteTitle = title && title.trim() !== '' ? title : 'Untitled Note';

        await db.query(
            'UPDATE notes SET title = ?, content = ?, quote = ?, is_favorite = ?, background_style = ? WHERE id = ?',
            [noteTitle, content, quote || null, is_favorite || 0, background_style || 'default', req.params.id]
        );
        const [updatedNote] = await db.query('SELECT * FROM notes WHERE id = ?', [req.params.id]);
        return res.json(updatedNote[0]);
    } catch (err) {
        console.error(`Error updating note ${req.params.id}:`, err);
        return res.status(500).json({ error: 'Failed to update note' });
    }
});

// DELETE a note
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM notes WHERE id = ?', [req.params.id]);
        return res.json({ message: 'Note deleted successfully' });
    } catch (err) {
        console.error(`Error deleting note ${req.params.id}:`, err);
        return res.status(500).json({ error: 'Failed to delete note' });
    }
});

module.exports = router;