const BASE_URL =
    import.meta.env.VITE_API_URL ||
    'http://localhost:5000/api';


const apiFetch = async (
    url,
    options = {}
) => {

    const response =
        await fetch(
            url,
            options
        );


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
            `Request failed: ${response.status}`
        );

    }


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

export const getNotes = async () => {

    return apiFetch(
        `${BASE_URL}/notes`
    );

};


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

export const getQuotes = async () => {

    return apiFetch(
        `${BASE_URL}/quotes`
    );

};


/* ========================================
   USERNAME
======================================== */

export const getUsername = async () => {

    return apiFetch(
        `${BASE_URL}/settings/username`
    );

};


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