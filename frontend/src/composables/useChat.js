import {
    ref,
    nextTick,
    watch,
    onMounted
} from 'vue';

import {
    getUsername
} from '../services/noteService.js';


export function useChat() {

    /* ========================================
       API
    ======================================== */

    const BASE_URL =
        import.meta.env.VITE_API_URL ||
        'http://localhost:5000/api';


    /* ========================================
       STATE
    ======================================== */

    const userMessage =
        ref('');

    const chatContainer =
        ref(null);

    const username =
        ref('User');

    const isLoading =
        ref(false);


    /* ========================================
       GREETING
    ======================================== */

    const createGreeting = (
        name
    ) => {

        return `Hi ${name}! I'm your NoteFlow assistant. I can help you organise your thoughts, improve your notes, find ideas, or brainstorm with you. What would you like to work on?`;

    };


    /* ========================================
       CHAT HISTORY
    ======================================== */

    const chatHistory =
        ref([

            {
                sender: 'ai',

                text:
                    createGreeting(
                        username.value
                    )
            }

        ]);


    /* ========================================
       LOAD USERNAME
    ======================================== */

    const loadUsername =
        async () => {

            try {

                const data =
                    await getUsername();


                if (
                    data &&
                    data.username
                ) {

                    username.value =
                        data.username;

                }

            } catch (error) {

                console.error(
                    'Failed to load username for chatbot:',
                    error
                );

            }

        };


    /* ========================================
       MOUNT
    ======================================== */

    onMounted(
        async () => {

            await loadUsername();

        }
    );


    /* ========================================
       WATCH USERNAME
    ======================================== */

    watch(
        username,
        (newName) => {

            if (
                chatHistory.value.length > 0 &&
                chatHistory.value[0].sender === 'ai'
            ) {

                chatHistory.value[0].text =
                    createGreeting(
                        newName
                    );

            }

        }
    );


    /* ========================================
       SCROLL
    ======================================== */

    const scrollToBottom =
        async () => {

            await nextTick();


            if (
                chatContainer.value
            ) {

                chatContainer.value.scrollTop =
                    chatContainer.value.scrollHeight;

            }

        };


    /* ========================================
       SEND MESSAGE
    ======================================== */

    const sendMessage =
        async () => {

            const query =
                userMessage.value.trim();


            if (!query) {
                return;
            }


            if (isLoading.value) {
                return;
            }


            /* USER MESSAGE */

            chatHistory.value.push({

                sender: 'user',

                text: query

            });


            userMessage.value = '';


            await scrollToBottom();


            isLoading.value = true;


            try {

                /* ==============================
                   CHAT REQUEST
                ============================== */

                const response =
                    await fetch(
                        `${BASE_URL}/chat`,
                        {
                            method: 'POST',

                            headers: {
                                'Content-Type':
                                    'application/json'
                            },

                            body:
                                JSON.stringify({
                                    message: query,
                                    username:
                                        username.value
                                })
                        }
                    );


                if (!response.ok) {

                    const errorData =
                        await response
                            .json()
                            .catch(
                                () => ({})
                            );


                    throw new Error(
                        errorData.message ||
                        errorData.error ||
                        `Server returned ${response.status}`
                    );

                }


                const data =
                    await response.json();


                const reply =
                    data?.reply?.trim();


                if (reply) {

                    chatHistory.value.push({

                        sender: 'ai',

                        text: reply

                    });

                } else {

                    chatHistory.value.push({

                        sender: 'ai',

                        text:
                            `I'm here to help, ${username.value}. Try asking me about your notes, ideas, writing, or something you'd like to organise.`

                    });

                }

            } catch (error) {

                console.error(
                    'Chat request failed:',
                    error
                );


                chatHistory.value.push({

                    sender: 'ai',

                    text:
                        `Sorry, ${username.value}. I couldn't connect to the NoteFlow assistant right now. Please check that the backend is running and try again.`

                });

            } finally {

                isLoading.value =
                    false;

                await scrollToBottom();

            }

        };


    /* ========================================
       QUICK SUGGESTION
    ======================================== */

    const sendSuggestion =
        async (
            suggestion
        ) => {

            if (
                !suggestion ||
                isLoading.value
            ) {

                return;

            }


            userMessage.value =
                suggestion;


            await sendMessage();

        };


    /* ========================================
       CLEAR CHAT
    ======================================== */

    const clearChat =
        () => {

            chatHistory.value = [

                {
                    sender: 'ai',

                    text:
                        createGreeting(
                            username.value
                        )

                }

            ];

        };


    /* ========================================
       REFRESH USERNAME
    ======================================== */

    const refreshChatUsername =
        async () => {

            await loadUsername();

        };


    /* ========================================
       RETURN
    ======================================== */

    return {

        userMessage,

        chatContainer,

        chatHistory,

        username,

        isLoading,

        sendMessage,

        sendSuggestion,

        clearChat,

        refreshChatUsername

    };

}