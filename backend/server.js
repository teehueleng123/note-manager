require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();

const port = process.env.PORT || 3000;


/* ========================================
   MIDDLEWARE
======================================== */

app.use(cors());

app.use(express.json());


/* ========================================
   API HEALTH CHECK
======================================== */

app.get('/api', (req, res) => {

    res.json({
        message: 'NoteFlow API is running'
    });

});


/* ========================================
   ROUTES
======================================== */

const notesRoutes =
    require('./routes/notes');

const chatRoutes =
    require('./routes/chat');


app.use(
    '/api/notes',
    notesRoutes
);

app.use(
    '/api/chat',
    chatRoutes
);


/* ========================================
   QUOTES
======================================== */

app.get('/api/quotes', async (req, res) => {

    try {

        const [rows] =
            await db.query(
                'SELECT * FROM quotes ORDER BY created_at DESC'
            );

        return res.json(rows);

    } catch (err) {

        console.error(
            'Error fetching quotes:',
            err
        );

        return res.status(500).json({
            error: 'Failed to fetch quotes'
        });

    }

});


app.post('/api/quotes', async (req, res) => {

    try {

        const { quote_text } =
            req.body;


        if (!quote_text) {

            return res.status(400).json({
                error: 'Quote text is required'
            });

        }


        const [result] =
            await db.query(
                'INSERT INTO quotes (quote_text) VALUES (?)',
                [quote_text]
            );


        return res.status(201).json({

            id: result.insertId,

            quote_text

        });

    } catch (err) {

        console.error(
            'Error creating quote:',
            err
        );

        return res.status(500).json({
            error: 'Failed to create quote'
        });

    }

});


/* ========================================
   SETTINGS - GET USERNAME
======================================== */

app.get(
    '/api/settings/username',
    async (req, res) => {

        try {

            const [rows] =
                await db.query(
                    'SELECT username FROM settings WHERE id = 1'
                );


            if (rows.length > 0) {

                return res.json(
                    rows[0]
                );

            }


            return res.json({
                username: 'User'
            });

        } catch (err) {

            console.error(
                'Error fetching username:',
                err
            );

            return res.status(500).json({
                error:
                    'Failed to fetch username'
            });

        }

    }
);


/* ========================================
   SETTINGS - UPDATE USERNAME
======================================== */

app.put(
    '/api/settings/username',
    async (req, res) => {

        try {

            const { username } =
                req.body;


            if (!username) {

                return res.status(400).json({
                    error:
                        'Username is required'
                });

            }


            await db.query(
                'UPDATE settings SET username = ? WHERE id = 1',
                [username]
            );


            return res.json({

                username

            });

        } catch (err) {

            console.error(
                'Error updating username:',
                err
            );

            return res.status(500).json({
                error:
                    'Failed to update username'
            });

        }

    }
);


/* ========================================
   404 HANDLER
======================================== */

app.use((req, res) => {

    res.status(404).json({

        error: 'Route not found',

        path: req.originalUrl

    });

});


/* ========================================
   ERROR HANDLER
======================================== */

app.use(
    (err, req, res, next) => {

        console.error(
            'Server error:',
            err
        );


        res.status(500).json({

            error:
                'Internal server error'

        });

    }
);


/* ========================================
   START SERVER
======================================== */

app.listen(
    port,
    '0.0.0.0',
    () => {

        console.log(
            `Server running on port ${port}`
        );

    }
);