/* ========================================
   API CONFIGURATION
======================================== */

const BASE_URL =
    import.meta.env.VITE_API_URL ||
    'http://localhost:5000/api';


/* ========================================
   API FETCH HELPER
======================================== */

const apiFetch = async (
    url,
    options = {}
) => {

    const response =
        await fetch(
            url,
            options
        );


    /* ----------------------------------------
       CHECK RESPONSE
    ---------------------------------------- */

    if (!response.ok) {

        const errorInfo =
            await response
                .json()
                .catch(() => ({
                    message:
                        'An unknown error occurred'
                }));


        throw new Error(
            errorInfo.message ||
            errorInfo.error ||
            `Request failed: ${response.status}`
        );

    }


    /* ----------------------------------------
       CHECK CONTENT TYPE
    ---------------------------------------- */

    const contentType =
        response.headers.get(
            'content-type'
        );


    if (
        contentType &&
        contentType.includes(
            'application/json'
        )
    ) {

        return response.json();

    }


    return {};

};


/* ========================================
   NOTES
======================================== */

/**
 * Get all notes
 */
export const getNotes = async () => {

    return apiFetch(
        `${BASE_URL}/notes`
    );

};


/**
 * Create a new note
 */
export const createNote = async (
    noteData
) => {

    return apiFetch(
        `${BASE_URL}/notes`,
        {

            method: 'POST',

            headers: {
                'Content-Type':
                    'application/json'
            },

            body:
                JSON.stringify(
                    noteData
                )

        }
    );

};


/**
 * Update an existing note
 */
export const updateNote = async (
    id,
    noteData
) => {

    return apiFetch(
        `${BASE_URL}/notes/${id}`,
        {

            method: 'PUT',

            headers: {
                'Content-Type':
                    'application/json'
            },

            body:
                JSON.stringify(
                    noteData
                )

        }
    );

};


/**
 * Delete a note
 */
export const deleteNote = async (
    id
) => {

    return apiFetch(
        `${BASE_URL}/notes/${id}`,
        {

            method: 'DELETE'

        }
    );

};


/* ========================================
   QUOTES
======================================== */

/**
 * Get all quotes
 */
export const getQuotes = async () => {

    return apiFetch(
        `${BASE_URL}/quotes`
    );

};


/* ========================================
   USERNAME
======================================== */

/**
 * Get current username
 */
export const getUsername = async () => {

    return apiFetch(
        `${BASE_URL}/settings/username`
    );

};


/**
 * Update username
 */
export const updateUsername = async (
    username
) => {

    return apiFetch(
        `${BASE_URL}/settings/username`,
        {

            method: 'PUT',

            headers: {
                'Content-Type':
                    'application/json'
            },

            body:
                JSON.stringify({
                    username
                })

        }
    );

};