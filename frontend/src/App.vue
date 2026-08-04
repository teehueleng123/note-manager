<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useNotes } from '@/composables/useNotes'
import { useChat } from '@/composables/useChat'
import { 
    FileText, 
    Heart, 
    Lightbulb, 
    Sparkles, 
    Plus, 
    Bell, 
    Edit3, 
    Trash2, 
    MoreHorizontal, 
    X, 
    Menu, 
    ChevronDown, 
    Clock, 
    Search,
    Sun,
    Moon,
    Camera,
    Image as ImageIcon,
    Calendar as CalendarIcon,
    RotateCcw
} from 'lucide-vue-next'

const {
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
} = useNotes()

// Bring in chat logic and reactive variables directly from useChat composable
const { userMessage, chatContainer, chatHistory, username, sendMessage: sendChatMessage } = useChat()

const isEditingName = ref(false)
function startEditingName() {
    isEditingName.value = true
}
async function saveName() {
    if (!userName.value.trim()) userName.value = 'User'
    isEditingName.value = false
    await saveUsername(userName.value)
}

const quotes = ref([
    'Small steps every day lead to big results.',
    'You do not have to be perfect. Just keep going.',
    'Believe in yourself and keep creating.'
])
const quote = ref(quotes.value[0])
const showQuoteModal = ref(false)
const newQuoteText = ref('')
function changeQuote() {
    quote.value = quotes.value[Math.floor(Math.random() * quotes.value.length)]
}
function openAddQuoteModal() {
    newQuoteText.value = ''
    showQuoteModal.value = true
}
function closeAddQuoteModal() {
    showQuoteModal.value = false
    newQuoteText.value = ''
}
function saveUserQuote() {
    if (!newQuoteText.value.trim()) return
    quotes.value.push(newQuoteText.value.trim())
    quote.value = newQuoteText.value.trim()
    closeAddQuoteModal()
}

const profileImage = ref(null)
const customBackground = ref(null)
const backgroundBlur = ref(4)
const isDarkModeTheme = ref(false)

function toggleTheme() {
    isDarkModeTheme.value = !isDarkModeTheme.value
}
function handleImageUpload(event) {
    const file = event.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
            profileImage.value = e.target.result
        }
        reader.readAsDataURL(file)
    }
    event.target.value = ''
}
function handleBackgroundUpload(event) {
    const file = event.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
        customBackground.value = e.target.result
    }
    reader.readAsDataURL(file)
    event.target.value = ''
}
function switchToDefaultBackground() {
    customBackground.value = null
}

// --- Live Clock & Dynamic Greeting State ---
const currentTime = ref('')
const currentHour = ref(new Date().getHours())
const currentDateObj = ref(new Date())
let clockTimer = null

const updateClock = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  currentHour.value = now.getHours()
}
const timeGreeting = computed(() => {
  if (currentHour.value < 12) {
    return 'Good morning'
  } else if (currentHour.value < 18) {
    return 'Good afternoon'
  } else {
    return 'Good evening'
  }
})
const currentMonthYear = computed(() => {
  return currentDateObj.value.toLocaleDateString([], { month: 'short', year: 'numeric' })
})
const calendarDays = computed(() => {
  const year = currentDateObj.value.getFullYear()
  const month = currentDateObj.value.getMonth()
  
  const firstDayIndex = new Date(year, month, 1).getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()
  const prevTotalDays = new Date(year, month, 0).getDate()
  
  const days = []
  const today = new Date()
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({ day: prevTotalDays - i, isCurrentMonth: false, isToday: false })
  }
  for (let i = 1; i <= totalDays; i++) {
    const isToday = 
      i === today.getDate() && 
      month === today.getMonth() && 
      year === today.getFullYear()
    days.push({ day: i, isCurrentMonth: true, isToday })
  }
  const remainingCells = 35 - days.length
  if (remainingCells > 0) {
    for (let i = 1; i <= remainingCells; i++) {
      days.push({ day: i, isCurrentMonth: false, isToday: false })
    }
  }
  return days
})
const changeMonth = (direction) => {
  const newDate = new Date(currentDateObj.value)
  newDate.setMonth(newDate.getMonth() + direction)
  currentDateObj.value = newDate
}

onMounted(() => {
  updateClock()
  clockTimer = setInterval(updateClock, 1000)
  fetchNotes()          
  fetchUsername()     
})

onUnmounted(() => {
  clearInterval(clockTimer)
})

const showModal = ref(false)
const editingNoteId = ref(null)
const newNote = ref({ title: '', content: '' })

function openCreateModal() {
    editingNoteId.value = null
    newNote.value = { title: '', content: '' }
    showModal.value = true
}
function openEditModal(note) {
    editingNoteId.value = note.id
    newNote.value = { title: note.title, content: note.content }
    showModal.value = true
}
function closeModal() {
    showModal.value = false
    editingNoteId.value = null
    newNote.value = { title: '', content: '' }
}
async function saveNote() {
    await saveNoteData(editingNoteId.value, newNote.value)
    closeModal()
}

const showDeleteModal = ref(false)
const noteToDelete = ref(null)

function askDelete(note) { 
    noteToDelete.value = note
    showDeleteModal.value = true 
}
function cancelDelete() { 
    showDeleteModal.value = false
    noteToDelete.value = null 
}
async function confirmDelete() {
    if (!noteToDelete.value) return
    const isPermanent = currentView.value === 'trash'
    await removeNote(noteToDelete.value, isPermanent)
    cancelDelete()
}

function moveToTrash(note) {
    removeNote(note, false)
}
function restoreFromTrash(note) {
    restoreNote(note)
}
function toggleFavorite(note) {
    toggleFavoriteStatus(note)
}
function toggleSortOrder() {
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
}

const openMenuId = ref(null)
function toggleMenu(id) { openMenuId.value = openMenuId.value === id ? null : id }
const closeMenu = () => { openMenuId.value = null }
</script>

<template>
    <div 
        class="app" 
        :class="{ 'has-custom-bg': customBackground, 'theme-dark': isDarkModeTheme }"
        @click="closeMenu"
    >
        <div 
            v-if="customBackground" 
            class="custom-bg-layer" 
            :style="{ backgroundImage: `url(${customBackground})`, filter: `blur(${backgroundBlur}px)` }"
        ></div>
        <div v-else class="bg-layer-container">
            <div class="bg-layer day-bg"></div>
            <div class="bg-layer night-bg"></div>
        </div>
         
        <aside class="sidebar glass-panel">
            <div class="logo">
                <div class="logo-icon"><FileText :size="18" /></div>
                <span>NoteFlow</span>
            </div>
             
            <div class="sidebar-fixed-content">
                <div class="sidebar-clock-item glass-panel">
                    <Clock :size="16" class="widget-icon" />
                    <span class="sidebar-clock-time">{{ currentTime }}</span>
                </div>
                <div class="sidebar-section">
                    <button 
                        class="nav-item" 
                        :class="{ active: currentView === 'all' }" 
                        @click="currentView = 'all'" 
                        type="button"
                    >
                        <FileText :size="18" /><span>My Notes</span><span class="note-count">{{ notes.length }}</span>
                    </button>
                    <button 
                        class="nav-item" 
                        :class="{ active: currentView === 'favorites' }" 
                        @click="currentView = 'favorites'" 
                        type="button"
                    >
                        <Heart :size="18" /><span>Favorites</span><span class="note-count">{{ favoriteNotesCount }}</span>
                    </button>
                    <button 
                        class="nav-item" 
                        :class="{ active: currentView === 'trash' }" 
                        @click="currentView = 'trash'" 
                        type="button"
                    >
                        <Trash2 :size="18" /><span>Trash</span><span class="note-count">{{ trashNotes.length }}</span>
                    </button>
                </div>
                <div class="sidebar-footer-card chat-widget glass-panel">
                    <div class="chat-header">
                        <div class="chat-title">
                            <span class="chat-dot"></span>
                            <span>NoteFlow AI</span>
                        </div>
                        <span class="chat-status">Ready</span>
                    </div>
                     
                    <div class="chat-messages" ref="chatContainer">
                        <div v-for="(msg, index) in chatHistory" :key="index" :class="['chat-bubble', msg.sender]">
                            {{ msg.text }}
                        </div>
                    </div>
                    <div class="chat-input-wrapper">
                        <input 
                            type="text" 
                            name="chatMessage"
                            id="chatMessage"
                            v-model="userMessage" 
                            @keyup.enter="sendChatMessage" 
                            placeholder="Ask AI anything..." 
                        />
                        <button @click="sendChatMessage" class="chat-send-btn" type="button">
                            <Sparkles :size="14" />
                        </button>
                    </div>
                </div>
            </div>
            <div class="sidebar-profile">
                <label class="avatar-upload-wrapper" title="Change profile photo">
                    <input type="file" accept="image/*" @change="handleImageUpload" class="hidden-file-input">
                    <div class="avatar">
                        <img v-if="profileImage" :src="profileImage" alt="Profile" class="avatar-img">
                        <span v-else>{{ userName.charAt(0).toUpperCase() }}</span>
                        <div class="avatar-overlay"><Camera :size="14" /></div>
                    </div>
                </label>
                <div class="profile-info">
                    <input v-if="isEditingName" v-model="userName" @blur="saveName" @keyup.enter="saveName" class="profile-name-input" autofocus />
                    <span v-else class="profile-name" @click="startEditingName">
                        <span class="profile-text-truncate">{{ userName }}</span>
                        <Edit3 :size="12" class="edit-name-icon" />
                    </span>
                </div>
            </div>
        </aside>

        <main class="main-content">
            <header class="topbar">
                <button class="mobile-menu-button" type="button"><Menu :size="18" /></button>
                <div class="greeting">
                    <h1>{{ timeGreeting }}, {{ userName }}!</h1>
                    <p>Let's capture some brilliant thoughts today.</p>
                </div>
                <div class="topbar-actions">
                    <div class="search-bar">
                        <Search :size="16" />
                        <input type="text" name="search" id="search" v-model="searchQuery" placeholder="Search notes..." />
                        <span class="search-shortcut">/</span>
                    </div>
                    <div v-if="customBackground" class="bg-controls-panel">
                        <span>Blur:</span>
                        <input type="range" min="0" max="20" v-model="backgroundBlur" />
                        <button class="reset-bg-btn" type="button" @click="switchToDefaultBackground">Remove Photo</button>
                    </div>
                    <label v-if="!customBackground" class="bg-upload-wrapper icon-button" title="Upload custom background photo">
                        <input type="file" accept="image/*" @change="handleBackgroundUpload" class="hidden-file-input">
                        <ImageIcon :size="18" />
                    </label>
                    <button class="icon-button" type="button" @click="toggleTheme" :title="isDarkModeTheme ? 'Switch to Day Mode' : 'Switch to Night Mode'">
                        <Sun v-if="!isDarkModeTheme" :size="18" />
                        <Moon v-else :size="18" />
                    </button>
                </div>
            </header>

            <div class="hero-widgets-row">
                <div class="dashboard-calendar-card glass-panel">
                    <div class="dash-widget-header">
                        <div class="cal-title-group">
                            <CalendarIcon :size="14" class="widget-icon" />
                            <span>{{ currentMonthYear }}</span>
                        </div>
                        <div class="dash-cal-nav">
                            <button @click.stop="changeMonth(-1)" class="cal-nav-btn">&lt;</button>
                            <button @click.stop="changeMonth(1)" class="cal-nav-btn">&gt;</button>
                        </div>
                    </div>
                    <div class="calendar-grid compact-calendar">
                        <span v-for="day in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']" :key="day" class="cal-day-label">{{ day }}</span>
                        <span 
                            v-for="(dateObj, index) in calendarDays" 
                            :key="index" 
                            class="cal-date"
                            :class="{ 
                                'other-month': !dateObj.isCurrentMonth, 
                                'today': dateObj.isToday 
                            }"
                        >
                            {{ dateObj.day }}
                        </span>
                    </div>
                </div>
                <section class="quote-card glass-panel">
                    <div class="quote-decoration"><Sparkles :size="20" /></div>
                    <div class="quote-content">
                        <p class="quote-label">A LITTLE MOTIVATION</p>
                        <p class="quote">"{{ quote }}"</p>
                    </div>
                    <div class="quote-actions-group">
                        <button class="quote-button" type="button" @click.stop="openAddQuoteModal">
                            <Plus :size="14" /> Add quote
                        </button>
                        <button class="quote-button primary" type="button" @click.stop="changeQuote">Another thought <Sparkles :size="14" /></button>
                    </div>
                </section>
            </div>

            <section class="notes-section">
                <div class="section-heading">
                    <h2>
                        {{ currentView === 'all' ? 'My Notes' : currentView === 'favorites' ? 'Favorite Notes' : 'Trash' }} 
                        <span class="inline-count">{{ filteredNotes.length }} notes</span>
                    </h2>
                    <button class="sort-button" type="button" @click="toggleSortOrder">
                        {{ sortOrder === 'desc' ? 'Newest' : 'Oldest' }} <ChevronDown :size="14" />
                    </button>
                </div>
                <div class="notes-grid">
                    <article v-for="note in filteredNotes" :key="note.id" class="note-card glass-panel" :class="`note-${note.color}`">
                        <div class="note-card-top">
                            <div class="note-icon" :class="note.color"><FileText :size="18" /></div>
                            <div class="note-card-actions-group" style="display: flex; align-items: center; gap: 6px;">
                                <button 
                                    class="more-button" 
                                    type="button" 
                                    @click.stop="toggleFavorite(note)"
                                    :title="note.isFavorite ? 'Unfavorite' : 'Favorite'"
                                >
                                    <Heart :size="16" :fill="note.isFavorite ? 'currentColor' : 'none'" :style="{ color: note.isFavorite ? '#ef4444' : 'inherit' }" />
                                </button>
                                <div class="note-menu-wrapper">
                                    <button class="more-button" type="button" @click.stop="toggleMenu(note.id)"><MoreHorizontal :size="18" /></button>
                                    <div v-if="openMenuId === note.id" class="note-menu glass-panel" @click.stop>
                                        <template v-if="currentView !== 'trash'">
                                            <button type="button" @click="toggleFavorite(note); closeMenu()">
                                                <Heart :size="14" /> {{ note.isFavorite ? 'Unfavorite' : 'Favorite' }}
                                            </button>
                                            <button type="button" @click="openEditModal(note); closeMenu()"><Edit3 :size="14" /> Edit</button>
                                            <button class="delete-item" type="button" @click="moveToTrash(note); closeMenu()"><Trash2 :size="14" /> Delete</button>
                                        </template>
                                        <template v-else>
                                            <button type="button" @click="restoreFromTrash(note); closeMenu()">
                                                <RotateCcw :size="14" /> Restore
                                            </button>
                                            <button class="delete-item" type="button" @click="askDelete(note); closeMenu()">
                                                <Trash2 :size="14" /> Permanent Delete
                                            </button>
                                        </template>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="note-body">
                            <h3>{{ note.title }}</h3>
                            <p>{{ note.content }}</p>
                        </div>
                        <div class="note-footer">
                            <span class="note-date"><Clock :size="13" /> {{ note.date }}</span>
                        </div>
                    </article>
                </div>
                <button v-if="currentView === 'all'" class="create-note-button" type="button" @click.stop="openCreateModal">
                    <Plus :size="18" /> Create a new note
                </button>
            </section>
        </main>

        <!-- Modals -->
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
            <div class="note-modal glass-panel">
                <div class="modal-header">
                    <div>
                        <p class="modal-label">{{ editingNoteId ? 'EDIT YOUR NOTE' : 'CREATE SOMETHING' }}</p>
                        <h2>{{ editingNoteId ? 'Edit note' : 'Create a little note' }}</h2>
                    </div>
                    <button class="modal-close" type="button" @click="closeModal"><X :size="18" /></button>
                </div>
                <form @submit.prevent="saveNote">
                    <div class="form-group">
                        <label>Title</label>
                        <input v-model="newNote.title" type="text" maxlength="80" placeholder="Title..." />
                    </div>
                    <div class="form-group">
                        <label>Your thoughts</label>
                        <textarea v-model="newNote.content" maxlength="1000" rows="7" placeholder="Write here..."></textarea>
                    </div>
                    <div class="modal-actions">
                        <button class="cancel-button" type="button" @click="closeModal">Cancel</button>
                        <button class="save-button" type="submit">Save</button>
                    </div>
                </form>
            </div>
        </div>

        <div v-if="showQuoteModal" class="modal-overlay" @click.self="closeAddQuoteModal">
            <div class="note-modal glass-panel">
                <div class="modal-header">
                    <div>
                        <p class="modal-label">CUSTOM INSPIRATION</p>
                        <h2>Add your own quote</h2>
                    </div>
                    <button class="modal-close" type="button" @click="closeAddQuoteModal"><X :size="18" /></button>
                </div>
                <form @submit.prevent="saveUserQuote">
                    <div class="form-group">
                        <label>Your Quote</label>
                        <textarea v-model="newQuoteText" maxlength="250" rows="4" placeholder="Write something inspiring..." autofocus></textarea>
                    </div>
                    <div class="modal-actions">
                        <button class="cancel-button" type="button" @click="closeAddQuoteModal">Cancel</button>
                        <button class="save-button" type="submit">Add Quote</button>
                    </div>
                </form>
            </div>
        </div>

        <div v-if="showDeleteModal" class="modal-overlay" @click.self="cancelDelete">
            <div class="delete-modal glass-panel">
                <div class="delete-icon"><Trash2 :size="24" /></div>
                <h2>Permanent delete?</h2>
                <p>"{{ noteToDelete?.title }}"</p>
                <div class="delete-actions">
                    <button class="cancel-button" type="button" @click="cancelDelete">Keep it</button>
                    <button class="delete-confirm-button" type="button" @click="confirmDelete">Delete</button>
                </div>
            </div>
        </div>
    </div>
</template>