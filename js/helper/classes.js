import { updateNoteData, populateNotes } from "./note/helperFunctions.js";

class Note {
    constructor(title = "", content = "", labels = []) {

        // Unique ID
        const randomValue = () => { return Math.floor(Math.random() * 1000).toString() };
        const time = () => { return new Date().getTime().toString() }
        this.id = randomValue() + time() + randomValue();

        this.title = title; // Note Title
        this.content = content; // Note Content
        this.labels = labels; // Note Labels
        this.isTrash = false; // Is Note Trashed
        this.isArchive = false; // Is Note Archived


        // save note in localstorage and update it in frontend
        this.save = () => {

            // Make sure ID is present
            if (!this.id) { return }

            // get notes from localStorage
            const allSavedNotes = localStorage.getItem("notes") ? JSON.parse(localStorage.getItem("notes")) : '';

            if (!allSavedNotes) {
                // if no notes found in localStorage create it
                localStorage.setItem("notes", JSON.stringify([{ id: this.id, title: this.title, content: this.content, labels: this.labels, isArchive: this.isArchive, isTrash: this.isTrash }]));

                // insert all notes in frontEnd
                populateNotes();
                return;
            }

            // check if the note is present with the same id in localStorage
            let isNoteIdPresent = false;

            const newNotes = allSavedNotes.map((note) => {
                if (note.id == this.id) {
                    // update note
                    note.title = this.title;
                    note.content = this.content;
                    note.labels = this.labels;
                    note.isArchive = this.isArchive;
                    note.isTrash = this.isTrash;
                    isNoteIdPresent = true;
                }
                return note;
            });

            if (!isNoteIdPresent) {

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
            localStorage.setItem("notes", JSON.stringify(newNotes));

            if (isNoteIdPresent) {
                // if note already present: update only that note in frontEnd
                updateNoteData(this.id);
            } else {
                // if note added: insert all notes again in frontEnd
                populateNotes();
            }
        };

        // add to trash/remove completely
        this.trash = () => {

            // if note already trashed 
            if (this.isTrash) {

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

            if (this.isArchive) {
                // if archived then remove from archive
                this.isArchive = false;
            } else {
                // if not archived then archive it
                this.isArchive = true;
            }
            // update localStorage
            this.save();
        };

        // Remove from trash
        this.untrash = () => {
            this.isTrash = false;
            this.save();
        };
    }
}

export { Note }