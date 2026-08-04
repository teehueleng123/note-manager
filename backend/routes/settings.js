const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET: Fetch the current username
router.get('/username', async (req, res) => {
    try {
        // Always fetch the username for the user with id = 1
        const [rows] = await db.query('SELECT username FROM user_settings WHERE id = 1');
        if (rows.length === 0) {
            // If no user setting exists, you might want to insert a default one
            // or return a default name.
            return res.json({ username: 'Default User' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching username:', err);
        res.status(500).json({ error: 'Failed to fetch username' });
    }
});

// PUT: Update the username
router.put('/username', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username || typeof username !== 'string' || username.trim() === '') {
            return res.status(400).json({ error: 'Username cannot be empty.' });
        }
        await db.query('UPDATE user_settings SET username = ? WHERE id = 1', [username.trim()]);
        res.json({ message: 'Username updated successfully', username: username.trim() });
    } catch (err) {
        console.error('Error updating username:', err);
        res.status(500).json({ error: 'Failed to update username' });
    }
});

module.exports = router;