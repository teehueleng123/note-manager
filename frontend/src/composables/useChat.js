import {
    ref,
    nextTick,
    watch,
    onMounted
} from 'vue';


/* ========================================
   API URL
======================================== */

const BASE_URL =
    import.meta.env.VITE_API_URL ||
    'http://localhost:5000/api';


/* ========================================
   CHAT COMPOSABLE
======================================== */

export function useChat() {

    /* ========================================
       STATE
    ======================================== */

    const userMessage = ref('');

    const chatContainer = ref(null);

    const username = ref('User');

    const isLoading = ref(false);


    /* ========================================
       CHAT HISTORY
    ======================================== */

    const chatHistory = ref([
        {
            sender: 'ai',

            text:
                `Hi ${username.value}! I'm your NoteFlow assistant. I can help you organise your thoughts, improve your notes, find ideas, or brainstorm with you. What would you like to work on?`
        }
    ]);


    /* ========================================
       LOAD USERNAME
    ======================================== */

    const loadUsername = async () => {

        try {

            const response =
                await fetch(
                    `${BASE_URL}/settings/username`
                );


            if (!response.ok) {

                throw new Error(
                    `Failed to load username: ${response.status}`
                );

            }


            const data =
                await response.json();


            if (data.username) {

                username.value =
                    data.username;

            }

        } catch (error) {

            console.error(
                'Failed to load username:',
                error
            );

        }

    };


    /* ========================================
       ON MOUNT
    ======================================== */

    onMounted(async () => {

        await loadUsername();

    });


    /* ========================================
       UPDATE GREETING
    ======================================== */

    watch(
        username,
        (newName) => {

            if (
                chatHistory.value.length > 0 &&
                chatHistory.value[0].sender === 'ai'
            ) {

                chatHistory.value[0].text =
                    `Hi ${newName}! I'm your NoteFlow assistant. I can help you organise your thoughts, improve your notes, find ideas, or brainstorm with you. What would you like to work on?`;

            }

        }
    );


    /* ========================================
       SCROLL TO BOTTOM
    ======================================== */

    const scrollToBottom = async () => {

        await nextTick();


        if (chatContainer.value) {

            chatContainer.value.scrollTop =
                chatContainer.value.scrollHeight;

        }

    };


    /* ========================================
       SEND MESSAGE
    ======================================== */

    const sendMessage = async () => {

        const query =
            userMessage.value.trim();


        /* ----------------------------------------
           CHECK EMPTY MESSAGE
        ---------------------------------------- */

        if (!query) {

            return;

        }


        /* ----------------------------------------
           PREVENT MULTIPLE REQUESTS
        ---------------------------------------- */

        if (isLoading.value) {

            return;

        }


        /* ----------------------------------------
           ADD USER MESSAGE
        ---------------------------------------- */

        chatHistory.value.push({

            sender: 'user',

            text: query

        });


        /* ----------------------------------------
           CLEAR INPUT
        ---------------------------------------- */

        userMessage.value = '';


        await scrollToBottom();


        /* ----------------------------------------
           SHOW LOADING
        ---------------------------------------- */

        isLoading.value = true;


        try {

            /* ----------------------------------------
               SEND REQUEST TO BACKEND
            ---------------------------------------- */

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


            /* ----------------------------------------
               CHECK RESPONSE
            ---------------------------------------- */

            if (!response.ok) {

                const errorData =
                    await response
                        .json()
                        .catch(() => ({}));


                throw new Error(

                    errorData.message ||

                    errorData.error ||

                    `Server returned ${response.status}`

                );

            }


            /* ----------------------------------------
               READ RESPONSE
            ---------------------------------------- */

            const data =
                await response.json();


            const reply =
                data?.reply?.trim();


            /* ----------------------------------------
               ADD AI RESPONSE
            ---------------------------------------- */

            if (reply) {

                chatHistory.value.push({

                    sender: 'ai',

                    text: reply

                });

            } else {

                chatHistory.value.push({

                    sender: 'ai',

                    text:
                        `I'm here to help, ${username.value}. Try asking me about your notes, writing, ideas, or something you'd like to organise.`

                });

            }

        } catch (error) {

            console.error(
                'Chat request failed:',
                error
            );


            /* ----------------------------------------
               ERROR MESSAGE
            ---------------------------------------- */

            chatHistory.value.push({

                sender: 'ai',

                text:
                    `Sorry, ${username.value}. I couldn't connect to the NoteFlow assistant right now. Please try again in a moment.`

            });

        } finally {

            isLoading.value = false;

            await scrollToBottom();

        }

    };


    /* ========================================
       QUICK SUGGESTION
    ======================================== */

    const sendSuggestion = async (
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

    const clearChat = () => {

        chatHistory.value = [

            {

                sender: 'ai',

                text:
                    `Hi ${username.value}! I'm your NoteFlow assistant. What would you like to work on?`

            }

        ];

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

        clearChat

    };

}