function Note(title = "", content = "", labels = []) {
    this.id =
        String(Math.floor(Math.random() * 1000)) +
        String(new Date().getTime()) +
        String(Math.floor(Math.random() * 500));

    this.title = title;
    this.content = content;
    this.labels = labels;
    this.isTrash = false;
    this.isArchive = false;

    this.save = () => {
        const notes = JSON.parse(localStorage.getItem("notes"));
        if (notes) {
            let isNotePresent = false;
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

            if (!isNotePresent) {
                newNotes.push({
                    id: this.id,
                    title: this.title,
                    content: this.content,
                    labels: this.labels,
                    isArchive: this.isArchive,
                    isTrash: this.isTrash,
                });
            }

            newNotes = JSON.stringify(newNotes);
            localStorage.setItem("notes", newNotes);
        } else {
            localStorage.setItem(
                "notes",
                JSON.stringify([
                    {
                        id: this.id,
                        title: this.title,
                        content: this.content,
                        isArchive: this.isArchive,
                        isTrash: this.isTrash,
                    },
                ])
            );
        }
    };

    this.trash = () => {
        if (isTrash) {
            const notes = JSON.parse(localStorage.getItem("notes"));
            if (notes) {
                const newNotes = JSON.stringify(
                    notes.filter((note) => note.id !== this.id)
                );
                localStorage.setItem("notes", newNotes);
                return;
            }
        }

        this.isTrash = true;
        this.save();
    };
    this.archive = () => {
        this.isArchive = true;
        this.save();
    };

    this.unarchive = () => {
        this.isArchive = false;
        this.save();
    };
    this.untrash = () => {
        this.isTrash = true;
        this.save();
    };
}

// Populate Notes into notes area
function populateNotes() {
    function returnNoteHTML(note) {
        function getLabelsHTML(){
            let html = '';
            note.labels.forEach((label) => {
                html += `<span class="label"><p>${label}</p><span class="close-button"><i class="fas fa-times"></i></span></span>`
            })
            return html;
        }

        let html = `
            <div id="${note.id}" class="note">
                <div class="note-head">
                    <h4 class="title">${note.title}</h4>
                    <span class="more-icon"><i class="fas fa-ellipsis-v"></i></span>
                </div>
                <div class="note-body">
                    <p class="text">${note.content}</p>
                    ${note.labels?`<div class="note-labels">${getLabelsHTML()}</div>`:''}
                </div>
            </div>`;
        return html;
    }

    const notes = JSON.parse(localStorage.getItem('notes'));
    if (notes){
        let allNotesHTML = ''
        notes.forEach((note) => {
            allNotesHTML += returnNoteHTML(note);
        })

        const noteAreaSection = document.createElement('section');
        noteAreaSection.classList.add('notes-area');
        noteAreaSection.innerHTML = allNotesHTML;
        
        document.body.appendChild(noteAreaSection)
    }
}

// throught id on save grab note from localstorage and change just that note (.textContent)

// make more-option button functionable
