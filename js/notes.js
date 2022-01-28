// Note Object
function Note(title = "", content = "", labels = []) {
    
    // Unique ID
    this.id = String(Math.floor(Math.random() * 1000)) + String(new Date().getTime()) + String(Math.floor(Math.random() * 500));
    this.title = title; // Note Title
    this.content = content; // Note Content
    this.labels = labels; // Note Labels
    this.isTrash = false; // Is Note Trashed
    this.isArchive = false; // Is Note Archived

    // localStorage save and Display note
    this.save = () => {

        // get notes from localStorage
        const notes = JSON.parse(localStorage.getItem("notes"));
        if (notes) {
            // if note already present with same ID
            let isNotePresent = false;

            // Update note with changes
            let newNotes = notes.map((note) => {
                if (note.id == this.id) {
                    note.title = this.title;
                    note.content = this.content;
                    note.labels = this.labels;
                    note.isArchive = this.isArchive;
                    note.isTrash = this.isTrash;
                    isNotePresent = true;
                }
                return note;
            });

            // if note not present already
            if (!isNotePresent) {

                // Create New note
                newNotes.unshift({
                    id: this.id,
                    title: this.title,
                    content: this.content,
                    labels: this.labels,
                    isArchive: this.isArchive,
                    isTrash: this.isTrash,
                });
            }

            // Save Added/Updated Notes list to localStorage
            newNotes = JSON.stringify(newNotes);
            localStorage.setItem("notes", newNotes);

            if (isNotePresent) {
                // if note already present: update only that note in frontEnd
                updateNoteData(this.id);
            } else {
                // if note added: insert all notes again in frontEnd
                populateNotes();
            }
        } else {

            // if no notes found in localStorage create it
            localStorage.setItem(
                "notes",
                JSON.stringify([
                    {
                        id: this.id,
                        title: this.title,
                        content: this.content,
                        labels: this.labels,
                        isArchive: this.isArchive,
                        isTrash: this.isTrash,
                    },
                ])
            );

            // insert all notes in frontEnd
            populateNotes();
        }
    };

    // add to trash/remove completely
    this.trash = () => {

        // if note already trashed 
        if (isTrash) {

            // Remove note completely
            const notes = JSON.parse(localStorage.getItem("notes"));
            if (notes) {
                const newNotes = JSON.stringify(
                    notes.filter((note) => note.id !== this.id)
                );
                localStorage.setItem("notes", newNotes);
                return;
            }
        }

        // if note not trashed then do
        this.isTrash = true;
        // update localStorage
        this.save();
    };

    // Toggel Note Archive
    this.toggelArchive = () => {

        if (this.isArchive){
            // if archived then remove from archive
            this.isArchive = false;
        }else{
            // if not archived then archive it
            this.isArchive = true;
        }
        // update localStorage
        this.save();
    };

    // Remove from trash
    this.untrash = () => {
        this.isTrash = true;
        // update localStorage
        this.save();
    };
}


// Populate Notes into notes area
function populateNotes() {

    // Return single note HTML
    function returnNoteHTML(note) {

        // Return HTML for Note Labels
        function getLabelsHTML() {
            let html = "";
            note.labels.forEach((label) => {
                html += `<span class="label"><p>${label}</p><span class="close-button"><i class="fas fa-times"></i></span></span>`;
            });
            return html;
        }

        // Main Returning HTML
        let html = `
            <div id="${note.id}" class="note">
                <div class="note-head">
                    <h4 class="title">${note.title}</h4>
                    <span class="more-icon"><i class="fas fa-ellipsis-v"></i></span>
                </div>
                <div class="note-body">
                    <p class="text">${note.content}</p>
                    ${note.labels? `<div class="note-labels">${getLabelsHTML()}</div>`: ""}
                </div>
            </div>`;
        return html;
    }


    // Remove Notes if present in "noteArea"
    const noteArea = document.querySelectorAll(".note-area");
    if (noteArea) {
        noteArea.innerHTML = "";
    }

    // Get all notes from localStorage
    const notes = JSON.parse(localStorage.getItem("notes"));
    if (notes) {

        // Contains - All Notes HTML (Combined)
        let allNotesHTML = "";

        // Get All notes HTML
        notes.forEach((note) => {
            allNotesHTML += returnNoteHTML(note);
        });

        // If notesArea not present (First Note)
        if (!document.querySelector(".notes-area")) {

            // Create "noteArea" element
            const noteAreaSection = document.createElement("section");
            noteAreaSection.classList.add("notes-area");
            // Add Notes HTML into "noteArea" element
            noteAreaSection.innerHTML = allNotesHTML;
            // Add "noteArea" element into body
            document.body.appendChild(noteAreaSection);
        }
        // If notesArea already present
        else {
            // add all notes to "notesArea" element
            document.querySelector(".notes-area").innerHTML = allNotesHTML;
        }
    }

    // add Note Viewablity into newly added notes within "notesArea"
    makeNotesViewable();
}


// Update individual note on frontEnd
function updateNoteData(id) {

    // Get updated note list
    const notes = JSON.parse(localStorage.getItem("notes"));
    // Get note which will be updated
    const note = notes.filter((note) => note.id == id)[0];

    if (note) {

        // Returns Note's Labels HTML section
        function getLabelsHTML() {
            if (note.labels) {

                // Note's labels holding div
                const noteLabelContainer = document.createElement("div");
                noteLabelContainer.classList.add("note-labels");

                let html = "";
                note.labels.forEach((label) => {
                    html += `<span class="label"><p>${label}</p><span class="close-button"><i class="fas fa-times"></i></span></span>`;
                });

                noteLabelContainer.innerHTML = html;
                return noteLabelContainer;
            }

            // if no labels are there
            return "";
        }

        // Get old note from DOM
        const existingNote = document.getElementById(note.id);
        if (existingNote) {
            // Update Title
            existingNote.querySelector(".title").textContent = note.title;
            // Update Content
            existingNote.querySelector(".text").textContent = note.content;
            // Remove Previous Labels if any
            if (existingNote.querySelector(".note-labels")){
                existingNote.querySelector(".note-labels").remove()
            }
            // Add Note's Labels if any
            existingNote
                .querySelector(".note-body")
                .appendChild(getLabelsHTML());
        }
    }
    
    // add Note Viewablity into newly added notes within "notesArea"
    makeNotesViewable();
}


// Populate Notes into notes area
populateNotes();
