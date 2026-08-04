# NoteFlow — Full Stack Note Management System

A full-stack web application for managing text-based notes, built as part of the **Intern Full Stack Web Developer Pre-Task**.

NoteFlow allows users to create, view, edit, and delete notes through a responsive and modern interface.

---

## 📌 Project Overview

NoteFlow is a simple file-management-style application focused on text-based notes.

The application demonstrates the core **CRUD operations**:

* **Create** a new note
* **Read** and display existing notes
* **Update** an existing note
* **Delete** a note with confirmation

The project uses Vue.js for the frontend and Node.js with Express for the backend. SQLite is used as the database.

The interface uses a modern glassmorphism-inspired design with gradients, cards, animations, responsive layouts, and light/dark themes.

---

## ✨ Features

### Note Management

* Create a note with:

  * Title
  * Content
* View all notes
* Edit existing notes
* Delete notes
* Confirmation dialog before deleting
* Automatically refresh the note list after changes

### User Interface

* Responsive desktop and mobile layout
* Modern glassmorphism-inspired design
* Light and dark themes
* Gradient background
* Calendar widget
* Motivational quote section
* Search functionality
* Note sorting
* Hover animations
* Modal dialogs for creating and editing notes
* Clean confirmation dialog for deleting notes

### Backend

* RESTful API
* CRUD endpoints for notes
* SQLite database
* Express middleware
* JSON request/response handling
* Centralized API service on the frontend
* Error handling for failed requests

---

## 🛠️ Technology Stack

### Frontend

* Vue.js 3
* JavaScript
* Vite
* HTML5
* CSS3
* Fetch API

### Backend

* Node.js
* Express.js
* JavaScript

### Database

* SQLite

### Deployment

* Frontend: Render
* Backend: Render

### Development Tools

* Visual Studio Code
* Git
* GitHub
* npm

---

## 📁 Project Structure

```text
note-manager/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── composables/
│   │   ├── services/
│   │   │   └── noteService.js
│   │   ├── styles/
│   │   │   ├── app.css
│   │   │   └── global.css
│   │   ├── App.vue
│   │   └── main.js
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── database/
│   ├── server.js
│   ├── package.json
│   └── ...
│
└── README.md
```

> The exact folder names may vary depending on the final project structure.

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/teehueleng123/note-manager.git
```

Move into the project:

```bash
cd note-manager
```

---

# 🖥️ Frontend Setup

Open a terminal and navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# ⚙️ Backend Setup

Open another terminal.

From the project root, navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start the backend server:

```bash
npm start
```

The backend will normally run at:

```text
http://localhost:5000
```

The API base URL is:

```text
http://localhost:5000/api
```

---

# 🔌 API Endpoints

The backend provides the following RESTful endpoints.

## Get All Notes

```http
GET /api/notes
```

Returns all notes.

---

## Create Note

```http
POST /api/notes
```

Example request:

```json
{
  "title": "My First Note",
  "content": "This is my first note."
}
```

---

## Update Note

```http
PUT /api/notes/:id
```

Example request:

```json
{
  "title": "Updated Note",
  "content": "Updated note content."
}
```

---

## Delete Note

```http
DELETE /api/notes/:id
```

Deletes the selected note.

---

# 🗄️ Database

The application uses **SQLite** as its database.

SQLite was selected because it is:

* Lightweight
* Easy to configure
* File-based
* Suitable for a small CRUD application
* Easy to run locally without requiring a separate database server

The database stores the application's notes and their associated information.

---

# 🔗 Frontend and Backend Communication

The frontend communicates with the backend through REST API requests using JavaScript's `fetch()` API.

The API requests are centralized in:

```text
frontend/src/services/noteService.js
```

For example:

```javascript
export const getNotes = async () => {
    return apiFetch(`${BASE_URL}/notes`);
};
```

This keeps API-related logic separate from the Vue components and makes the application easier to maintain.

---

# 🌐 Environment Configuration

The frontend supports configuring the backend URL through an environment variable.

Example:

```env
VITE_API_URL=http://localhost:5000/api
```

For production deployment, the frontend can use the deployed backend URL instead.

Example:

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

No personal API keys are required to run the core NoteFlow application.

---

# 📦 Production Build

To create a production build of the frontend:

```bash
cd frontend
npm run build
```

The production files will be generated in:

```text
frontend/dist/
```

To preview the production build locally:

```bash
npm run preview
```

---

# 🧪 Testing the Application

The following functionality was tested during development:

### Create

1. Open the application.
2. Click **Create Note**.
3. Enter a title and content.
4. Save the note.
5. Confirm that the new note appears in the note list.

### Read

1. Open the application.
2. Confirm that existing notes are loaded from the backend.
3. Refresh the page.
4. Confirm that the notes remain available.

### Update

1. Open the menu on an existing note.
2. Select **Edit**.
3. Modify the title or content.
4. Save the changes.
5. Confirm that the updated note is displayed.

### Delete

1. Open the menu on an existing note.
2. Select **Delete**.
3. Confirm the deletion.
4. Confirm that the note is removed from the interface.

### Responsive Design

The interface was also tested at different screen sizes to ensure that the layout remains usable on smaller screens.

---

# 🤖 Development Process

AI tools were used during development as a development aid for ideas, debugging, and code improvement.

## Example 1 — UI Design

### Prompt

> "Suggest a modern UI design for a Vue.js note management application using gradients, glassmorphism, cards and responsive layouts."

### AI Output

The AI suggested a dashboard-style layout with:

* Sidebar navigation
* Note cards
* Gradient background
* Glass-style panels
* Responsive layout

### My Modification

I adapted the suggested design to better match the application's purpose and created a more personalized NoteFlow interface.

I also adjusted:

* Spacing
* Card sizes
* Colors
* Typography
* Modal dialogs
* Responsive behavior
* Light/dark mode

### Why

The initial AI-generated design was too generic, so I modified it to make the interface more consistent and easier to use.

---

## Example 2 — API Service Structure

### Prompt

> "How can I organize API calls in a Vue.js application using async/await and fetch?"

### AI Output

The AI suggested separating API calls into a dedicated service file.

### My Modification

I implemented the API functions in:

```text
frontend/src/services/noteService.js
```

The service contains functions for:

* Getting notes
* Creating notes
* Updating notes
* Deleting notes

### Why

Separating API logic from Vue components makes the code easier to maintain and keeps the application structure organized.

---

## Example 3 — Modal Design

### Prompt

> "How can I create a modal dialog that fits a glassmorphism-inspired application without making the content behind the modal difficult to read?"

### AI Output

The AI suggested using an overlay and a separate dialog container.

### My Modification

I changed the dialog itself to use a solid background while keeping the application's overall glassmorphism design.

The background behind the dialog is dimmed, while the dialog remains visually clear.

### Why

A fully translucent dialog caused the underlying calendar, notes, and background elements to be visible through the form, which reduced readability.

The final design keeps the application's visual style while making important interactions clearer.

---

# 💡 Design Decisions

The project uses a visually rich design because the pre-task allows either a minimal or fancy interface.

The main design goals were:

* Clear visual hierarchy
* Easy note management
* Consistent spacing
* Responsive layout
* Modern visual appearance
* Clear interaction feedback

Although the application uses glassmorphism-inspired elements, important dialogs such as **Create Note**, **Edit Note**, and **Delete Confirmation** use solid backgrounds to maintain readability.

---

# 🔐 Security Considerations

The application does not require users to provide personal API keys to use the core note-management functionality.

Environment variables are used for configurable deployment values such as the backend API URL.

Sensitive credentials should not be committed to GitHub.

If environment variables are used locally, they should be stored in `.env` files and excluded from version control when necessary.

---

# 📚 What I Learned

Through this project, I practiced:

* Vue.js 3
* Vue Composition API
* JavaScript ES6+
* Async/await
* RESTful API design
* CRUD operations
* Express.js
* SQLite
* Frontend/backend communication
* Environment variables
* Responsive CSS
* Git and GitHub
* Deployment
* Debugging production issues
* Organizing frontend API services

---

# 🚧 Possible Future Improvements

If the project were expanded further, possible improvements could include:

* User authentication
* Multiple user accounts
* Note categories
* Tags
* Note pinning
* Pagination
* Rich text editing
* Improved search
* Automated testing
* Docker support
* Cloud database storage

---

# 👨‍💻 Author

**Tee Hue Leng**

Full Stack Web Developer Intern Pre-Task

---

# 📄 License

This project was created for educational and recruitment purposes as part of a Full Stack Web Developer internship pre-task.
