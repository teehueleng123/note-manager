import {
    ref,
    nextTick,
    watch,
    onMounted
} from 'vue';


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

    onMounted(async () => {

        try {

            const response =
                await fetch(
                    'http://localhost:5000/api/settings/username'
                );


            if (!response.ok) {

                throw new Error(
                    'Failed to load username'
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
       SCROLL CHAT
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


        /* Don't send empty message */

        if (!query) {
            return;
        }


        /* Don't send while AI is responding */

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


        /* Clear input */

        userMessage.value = '';


        await scrollToBottom();


        /* ----------------------------------------
           START LOADING
        ---------------------------------------- */

        isLoading.value = true;


        try {

            /* ----------------------------------------
               SEND TO BACKEND
            ---------------------------------------- */

            const response =
                await fetch(
                    'http://localhost:5000/api/chat',
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body: JSON.stringify({
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
                        `I'm here to help, ${username.value}. Try asking me about your notes, ideas, writing, or something you'd like to organise.`
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
                    `Sorry, ${username.value}. I couldn't connect to the NoteFlow assistant. Please make sure the backend server is running and try again.`
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