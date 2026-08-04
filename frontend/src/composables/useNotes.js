import {
    ref,
    computed
} from 'vue';

import {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
    getUsername,
    updateUsername
} from '../services/noteService.js';


export function useNotes() {

    /* ========================================
       STATE
    ======================================== */

    const notes = ref([]);

    const trashNotes = ref([]);

    const searchQuery = ref('');

    const sortOrder = ref('desc');

    const currentView = ref('all');

    const userName = ref('User');


    /* ========================================
       FETCH USERNAME
    ======================================== */

    const fetchUsername = async () => {

        try {

            const data =
                await getUsername();

            if (data?.username) {

                userName.value =
                    data.username;

            }

        } catch (error) {

            console.error(
                'Error fetching username:',
                error
            );

        }

    };


    /* ========================================
       SAVE USERNAME
    ======================================== */

    const saveUsername = async (
        newName
    ) => {

        const cleanedName =
            newName.trim();

        if (!cleanedName) {
            return;
        }

        try {

            const updated =
                await updateUsername(
                    cleanedName
                );

            if (updated?.username) {

                userName.value =
                    updated.username;

            }

        } catch (error) {

            console.error(
                'Failed to update username:',
                error
            );

            throw error;

        }

    };


    /* ========================================
       FETCH NOTES
    ======================================== */

    const fetchNotes = async () => {

        try {

            const data =
                await getNotes();

            notes.value =
                data.map(note => ({

                    id: note.id,

                    title: note.title,

                    content: note.content,

                    quote: note.quote,

                    isFavorite:
                        Boolean(
                            note.is_favorite
                        ),

                    color:
                        note.background_style ||
                        'blue',

                    date:
                        note.created_at
                            ? new Date(
                                note.created_at
                            ).toLocaleDateString()
                            : ''

                }));

        } catch (error) {

            console.error(
                'Error fetching notes:',
                error
            );

        }

    };


    /* ========================================
       CREATE / UPDATE NOTE
    ======================================== */

    const saveNoteData = async (
        editingId,
        noteForm
    ) => {

        if (
            !noteForm.title.trim() ||
            !noteForm.content.trim()
        ) {

            return;

        }


        /* ====================================
           EDIT
        ==================================== */

        if (editingId !== null) {

            const existing =
                notes.value.find(
                    note =>
                        note.id === editingId
                );


            const payload = {

                title:
                    noteForm.title.trim(),

                content:
                    noteForm.content.trim(),

                quote:
                    existing?.quote || null,

                is_favorite:
                    existing?.isFavorite
                        ? 1
                        : 0,

                background_style:
                    existing?.color ||
                    'blue'

            };


            const updated =
                await updateNote(
                    editingId,
                    payload
                );


            const index =
                notes.value.findIndex(
                    note =>
                        note.id === editingId
                );


            if (index !== -1) {

                notes.value[index] = {

                    ...notes.value[index],

                    title:
                        updated.title,

                    content:
                        updated.content,

                    date:
                        updated.created_at
                            ? new Date(
                                updated.created_at
                            ).toLocaleDateString()
                            : notes.value[index].date

                };

            }

        }


        /* ====================================
           CREATE
        ==================================== */

        else {

            const payload = {

                title:
                    noteForm.title.trim(),

                content:
                    noteForm.content.trim(),

                quote: null,

                is_favorite: 0,

                background_style: 'blue'

            };


            const created =
                await createNote(
                    payload
                );


            notes.value.unshift({

                id:
                    created.id,

                title:
                    created.title,

                content:
                    created.content,

                quote:
                    created.quote,

                isFavorite:
                    Boolean(
                        created.is_favorite
                    ),

                color:
                    created.background_style ||
                    'blue',

                date:
                    created.created_at
                        ? new Date(
                            created.created_at
                        ).toLocaleDateString()
                        : 'Just now'

            });

        }

    };


    /* ========================================
       DELETE
    ======================================== */

    const removeNote = async (
        note,
        isPermanent = false
    ) => {

        if (isPermanent) {

            await deleteNote(
                note.id
            );

            trashNotes.value =
                trashNotes.value.filter(
                    item =>
                        item.id !== note.id
                );

        } else {

            notes.value =
                notes.value.filter(
                    item =>
                        item.id !== note.id
                );

            trashNotes.value.push(
                note
            );

        }

    };


    /* ========================================
       RESTORE
    ======================================== */

    const restoreNote = (
        note
    ) => {

        trashNotes.value =
            trashNotes.value.filter(
                item =>
                    item.id !== note.id
            );

        notes.value.push(note);

    };


    /* ========================================
       FAVORITE
    ======================================== */

    const toggleFavoriteStatus = async (
        note
    ) => {

        const previous =
            note.isFavorite;

        note.isFavorite =
            !note.isFavorite;

        try {

            await updateNote(
                note.id,
                {
                    title:
                        note.title,

                    content:
                        note.content,

                    quote:
                        note.quote,

                    is_favorite:
                        note.isFavorite
                            ? 1
                            : 0,

                    background_style:
                        note.color
                }
            );

        } catch (error) {

            note.isFavorite =
                previous;

            console.error(
                'Failed to toggle favorite:',
                error
            );

        }

    };


    /* ========================================
       FILTER + SEARCH + SORT
    ======================================== */

    const filteredNotes =
        computed(() => {

            let baseList =
                currentView.value === 'trash'
                    ? trashNotes.value
                    : notes.value;


            if (
                currentView.value ===
                'favorites'
            ) {

                baseList =
                    baseList.filter(
                        note =>
                            note.isFavorite
                    );

            }


            if (
                searchQuery.value.trim()
            ) {

                const query =
                    searchQuery.value
                        .toLowerCase()
                        .trim();


                baseList =
                    baseList.filter(
                        note =>
                            note.title
                                .toLowerCase()
                                .includes(query) ||

                            note.content
                                .toLowerCase()
                                .includes(query)
                    );

            }


            return [...baseList].sort(
                (a, b) => {

                    const dateA =
                        new Date(
                            a.date
                        ).getTime() || 0;

                    const dateB =
                        new Date(
                            b.date
                        ).getTime() || 0;


                    return sortOrder.value === 'desc'
                        ? dateB - dateA
                        : dateA - dateB;

                }
            );

        });


    /* ========================================
       FAVORITE COUNT
    ======================================== */

    const favoriteNotesCount =
        computed(() => {

            return notes.value.filter(
                note =>
                    note.isFavorite
            ).length;

        });


    /* ========================================
       RETURN
    ======================================== */

    return {

        notes,

        trashNotes,

        searchQuery,

        sortOrder,

        currentView,

        filteredNotes,

        favoriteNotesCount,

        userName,

        fetchUsername,

        saveUsername,

        fetchNotes,

        saveNoteData,

        removeNote,

        restoreNote,

        toggleFavoriteStatus

    };

}