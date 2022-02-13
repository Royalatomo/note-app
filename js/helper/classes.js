class Note {
    constructor(title = "", content = "", labels = []) {

        // Unique ID
        const randomValue = () => {return Math.floor(Math.random() * 1000).toString()};
        const time = () => {return new Date().getTime().toString()}
        this.id = randomValue() + time() + randomValue();
        
        this.title = title; // Note Title
        this.content = content; // Note Content
        this.labels = labels; // Note Labels
        this.isTrash = false; // Is Note Trashed
        this.isArchive = false; // Is Note Archived


        // localStorage save and Display note
        this.save = () => {
            if (!this.id){return}

            // get notes from localStorage
            const notes = localStorage.getItem("notes") ? JSON.parse(localStorage.getItem("notes")) : '';
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
            this.isTrash = true;
            // update localStorage
            this.save();
        };
    }
}

export {Note}