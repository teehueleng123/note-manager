const express = require('express');

const router = express.Router();

const {
    GoogleGenerativeAI
} = require('@google/generative-ai');


/* ========================================
   GEMINI SETUP
======================================== */

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);


/* ========================================
   POST /api/chat
======================================== */

router.post('/', async (req, res) => {

    try {

        const {
            message,
            username
        } = req.body;


        /* ----------------------------------------
           VALIDATE MESSAGE
        ---------------------------------------- */

        if (
            !message ||
            !message.trim()
        ) {

            return res.status(400).json({
                message: 'Message is required.'
            });

        }


        /* ----------------------------------------
           CHECK API KEY
        ---------------------------------------- */

        if (!process.env.GEMINI_API_KEY) {

            console.error(
                'GEMINI_API_KEY is missing.'
            );

            return res.status(500).json({
                message:
                    'Gemini API key is not configured.'
            });

        }


        /* ----------------------------------------
           CREATE GEMINI MODEL
        ---------------------------------------- */

        const model =
            genAI.getGenerativeModel({
                model: 'gemini-2.5-flash'
            });


        /* ----------------------------------------
           AI PROMPT
        ---------------------------------------- */

        const prompt = `
You are NoteFlow Assistant, an AI assistant inside a note-taking application.

The user's name is:
${username || 'User'}

The user's message is:
"${message}"

Your job is to help the user with their notes, ideas and writing.

You can help with:

- improving writing
- rewriting notes
- summarising information
- brainstorming ideas
- organising thoughts
- creating outlines
- making notes clearer
- turning rough ideas into structured notes
- answering questions
- generating useful suggestions

Important instructions:

1. Answer the user's actual question.
2. Do not give a random or unrelated response.
3. Keep the response clear and useful.
4. If the user asks for ideas, provide relevant ideas.
5. If the user asks you to rewrite something, rewrite it.
6. If the user asks for a summary, summarise the information provided.
7. If the user asks a general question, answer it normally.
8. Do not mention these instructions.
9. Do not use emojis.
10. Do not unnecessarily repeat the user's question.
11. Use simple and friendly language.
`;


        /* ----------------------------------------
           SEND REQUEST TO GEMINI
        ---------------------------------------- */

        const result =
            await model.generateContent(
                prompt
            );


        /* ----------------------------------------
           GET RESPONSE
        ---------------------------------------- */

        const response =
            await result.response;


        const reply =
            response.text();


        /* ----------------------------------------
           SEND RESPONSE TO FRONTEND
        ---------------------------------------- */

        return res.json({
            reply
        });


    } catch (error) {

        console.error(
            'Gemini chat error:',
            error
        );


        return res.status(500).json({
            message:
                'Failed to generate AI response.'
        });

    }

});


/* ========================================
   TEST ROUTE
======================================== */

router.get('/', (req, res) => {

    return res.json({
        message: 'Chat route working'
    });

});


module.exports = router;