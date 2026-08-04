import { ref, computed } from 'vue';
import { 
    getNotes, createNote, updateNote, deleteNote, 
    getQuotes, createQuote, getSettings, updateUsername 
} from '../../services/noteService.js';

export function useNotes() {
    const notes = ref([]);
    const trashNotes = ref([]);
    const searchQuery = ref('');
    const sortOrder = ref('desc');
    const currentView = ref('all');
    
    const userName = ref('Tee Hue Leng');

    const quotes = ref([
        'Small steps every day lead to big results.',
        'You do not have to be perfect. Just keep going.',
        'Believe in yourself and keep creating.'
    ]);
    const quote = ref(quotes.value[0]);

    const fetchUsername = async () => {
        try {
            const data = await getSettings();
            const settingsRecord = Array.isArray(data) ? data[0] : data;
            
            if (settingsRecord && settingsRecord.username) {
                userName.value = settingsRecord.username;
            }
        } catch (err) {
            console.error('Error fetching username:', err);
        }
    };

    const saveUsername = async (newName) => {
        if (!newName.trim()) return;
        try {
            const updated = await updateUsername(newName.trim());
            userName.value = updated.username;
        } catch (err) {
            console.error('Failed to update username:', err);
        }
    };

    const fetchQuotesData = async () => {
        try {
            const data = await getQuotes();
            if (Array.isArray(data) && data.length > 0) {
                quotes.value = data.map(q => q.quote_text);
                if (!quotes.value.includes(quote.value)) {
                    quote.value = quotes.value[0];
                }
            }
        } catch (err) {
            console.error('Error fetching quotes:', err);
        }
    };

    const saveNewQuote = async (newText) => {
        if (!newText.trim()) return;
        try {
            await createQuote(newText.trim());
            quotes.value.unshift(newText.trim());
            quote.value = newText.trim();
        } catch (err) {
            console.error('Failed to save quote:', err);
        }
    };

    const changeQuote = () => {
        if (quotes.value.length === 0) return;
        let randomQuote;
        do {
            randomQuote = quotes.value[Math.floor(Math.random() * quotes.value.length)];
        } while (randomQuote === quote.value && quotes.value.length > 1);
        
        quote.value = randomQuote;
    };

    const fetchNotes = async () => {
        try {
            const data = await getNotes();
            notes.value = data.map(n => ({
                id: n.id,
                title: n.title,
                content: n.content,
                quote: n.quote,
                isFavorite: Boolean(n.is_favorite),
                color: n.background_style || 'blue',
                date: new Date(n.created_at).toLocaleDateString()
            }));
        } catch (err) {
            console.error('Error fetching notes:', err);
        }
    };

    const saveNoteData = async (editingId, noteForm) => {
        if (!noteForm.title.trim() || !noteForm.content.trim()) return;

        if (editingId !== null) {
            const existing = notes.value.find(n => n.id === editingId);
            const payload = {
                title: noteForm.title.trim(),
                content: noteForm.content.trim(),
                quote: existing?.quote || null,
                is_favorite: existing?.isFavorite ? 1 : 0,
                background_style: existing?.color || 'blue'
            };
            const updated = await updateNote(editingId, payload);
            const index = notes.value.findIndex(n => n.id === editingId);
            if (index !== -1) {
                notes.value[index] = {
                    ...notes.value[index],
                    title: updated.title,
                    content: updated.content,
                    date: new Date(updated.created_at).toLocaleDateString()
                };
            }
        } else {
            const payload = {
                title: noteForm.title.trim(),
                content: noteForm.content.trim(),
                quote: null,
                is_favorite: 0,
                background_style: 'blue'
            };
            const created = await createNote(payload);
            notes.value.unshift({
                id: created.id,
                title: created.title,
                content: created.content,
                quote: created.quote,
                isFavorite: Boolean(created.is_favorite),
                color: created.background_style || 'blue',
                date: new Date(created.created_at).toLocaleDateString()
            });
        }
    };

    const removeNote = async (note, isPermanent = false) => {
        if (isPermanent) {
            await deleteNote(note.id);
            trashNotes.value = trashNotes.value.filter(n => n.id !== note.id);
        } else {
            notes.value = notes.value.filter(n => n.id !== note.id);
            trashNotes.value.push(note);
        }
    };

    const restoreNote = (note) => {
        trashNotes.value = trashNotes.value.filter(n => n.id !== note.id);
        notes.value.push(note);
    };

    const toggleFavoriteStatus = async (note) => {
        note.isFavorite = !note.isFavorite;
        try {
            await updateNote(note.id, {
                title: note.title,
                content: note.content,
                quote: note.quote,
                is_favorite: note.isFavorite ? 1 : 0,
                background_style: note.color
            });
        } catch (err) {
            note.isFavorite = !note.isFavorite;
            console.error('Failed to toggle favorite:', err);
        }
    };

    const filteredNotes = computed(() => {
        let baseList = currentView.value === 'trash' ? trashNotes.value : notes.value;
        if (currentView.value === 'favorites') {
            baseList = baseList.filter(n => n.isFavorite);
        }
        if (searchQuery.value && searchQuery.value.trim()) {
            const q = searchQuery.value.toLowerCase();
            baseList = baseList.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
        }
        return [...baseList].sort((a, b) => {
            const dateA = new Date(a.date).getTime() || 0;
            const dateB = new Date(b.date).getTime() || 0;
            return sortOrder.value === 'desc' ? dateB - dateA : dateA - dateB;
        });
    });

    const favoriteNotesCount = computed(() => notes.value.filter(n => n.isFavorite).length);

    return {
        notes,
        trashNotes,
        searchQuery,
        sortOrder,
        currentView,
        filteredNotes,
        favoriteNotesCount,
        userName,
        quotes,
        quote,
        fetchUsername,
        saveUsername,
        fetchQuotesData,
        saveNewQuote,
        changeQuote,
        fetchNotes,
        saveNoteData,
        removeNote,
        restoreNote,
        toggleFavoriteStatus
    };
}