// Note Object
class Note {
    constructor(title = "", content = "", labels = []) {

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


// Populate Notes into notes area
function populateNotes() {

    // Return single note HTML
    function returnNoteHTML(note) {

        // Return HTML for Note Labels
        function getLabelsHTML() {
            let html = "";
            note.labels.forEach((label) => {
                html += `<span class="avoid_Noteview label"><p>${label}</p><span class="avoid_Noteview  close-button"><i class="fas fa-times"></i></span></span>`;
            });
            return html;
        }

        // Main Returning HTML
        let html = `
            <div id="${note.id}" class="note">
                <div class="note-head">
                    <h4 class="title">${note.title}</h4>
                    <span class="avoid_Noteview more-icon"><span class="avoid_Noteview more-icon-circles"><i class="avoid_MoreOptions fas fa-circle"></i><i class="avoid_MoreOptions fas fa-circle"></i><i class="avoid_MoreOptions fas fa-circle"></i></span></span>
                </div>
                <div class="note-body">
                    <p class="text">${note.content}</p>
                    ${note.labels ? `<div class="note-labels">${getLabelsHTML()}</div>` : ""}
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
    const notes = localStorage.getItem("notes") ? JSON.parse(localStorage.getItem("notes")) : '';
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

    // make remove label button functionable
    makeRemoveLabel();
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
                noteLabelContainer.classList.add("avoid_Noteview");
                noteLabelContainer.classList.add("note-labels");

                let html = "";
                note.labels.forEach((label) => {
                    html += `<span class="avoid_Noteview label"><p>${label}</p><span class="avoid_Noteview close-button"><i class="fas fa-times"></i></span></span>`;
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
            if (existingNote.querySelector(".note-labels")) {
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

    // make remove label button functionable
    makeRemoveLabel();
}


let more_option_prompt = false;

function showMoreOptions(id = '') {
    document.querySelectorAll('.more-icon-circles').forEach((circle) => {

        circle.addEventListener('click', (e) => {
            const note = id ? id : e.currentTarget.parentElement.parentElement.parentElement.id;
            if (!more_option_prompt) {
                promptMoreOptions(note, id ? true : false);

                document.body.querySelectorAll('.menu').forEach((menu) => {
                    menu.addEventListener('click', (e) => {
                        if (e.target.textContent == "add label") {
                            addLabel(note);
                        }
                    })
                })

                more_option_prompt = true;

                document.body.addEventListener('click', (e) => {
                    if (document.querySelector('.menu-container')) {
                        let status = false;

                        if (e.target.classList.contains("avoid_MoreOptions")) {
                            status = true;
                        }

                        if (!status) {
                            document.querySelector('.menu-container').remove();
                            more_option_prompt = false;
                        }
                    }
                })
            } else {
                const menuContainer = document.querySelector('.menu-container');
                if (menuContainer) {
                    menuContainer.remove();
                }
                more_option_prompt = false;
            }
        })
    })
}

// localStorage.setItem('labels', JSON.stringify(['label 1', 'label 2', 'lable 3', 'label 4', 'label 5', 'label 6', 'abel 1']))

function addLabel(noteId) {

    let labels = localStorage.getItem('labels') ? JSON.parse(localStorage.getItem('labels')) : [];
    const menuBox = document.body.querySelector('.menu-box');

    function returnLabelHTML(labels) {
        let html = '';
        labels.forEach((label) => {
            html += `<div class="avoid_Noteview avoid_MoreOptions label"><input class="avoid_Noteview avoid_MoreOptions" type="checkbox" name="" value=""/><label class="avoid_Noteview avoid_MoreOptions">${label}</label></div>`;
        })
        return html;
    }

    function returnFullAddLabelHTML() {
        let html = '<div class="avoid_Noteview avoid_MoreOptions search"><i class="fas fa-search avoid_MoreOptions"></i><div contenteditable="true" class="avoid_Noteview avoid_MoreOptions search-text">Type Label...</div></div><div class="avoid_Noteview avoid_MoreOptions search-result">';
        html += returnLabelHTML(labels);
        html += '</div>';
        return html
    }


    if (menuBox) {
        menuBox.style.minWidth = "130px";
        menuBox.innerHTML = returnFullAddLabelHTML();
        showAlreadyAddedLabel(noteId);
    }


    document.querySelector('.menu-container .search .search-text').addEventListener('click', (e) => {
        const searchBar = e.currentTarget;
        if (searchBar.textContent == "Type Label...") {
            searchBar.textContent = "";
        }
    })

    document.querySelector('.menu-container').addEventListener('click', (e) => {
        const targetClassList = e.target.classList;

        if (!targetClassList.contains('search') && !targetClassList.contains('search-text')) {
            searchBar = document.querySelector('.menu-container .search .search-text');
            if (!searchBar.textContent) {
                searchBar.textContent = "Type Label...";
            }
        }
    })

    function searchLabel(label) {


        let matchedLabel = [];
        const allLabels = localStorage.getItem('labels') ? JSON.parse(localStorage.getItem('labels')) : [];

        if (!allLabels) {
            return [];
        }

        for (let i = 0; i < allLabels.length; i++) {
            let matchFound = true;

            for (let x = 0; x < label.length; x++) {
                if (label[x] != allLabels[i][x]) {
                    matchFound = false;
                    break;
                }
            }

            if (matchFound) {
                matchedLabel.push(allLabels[i])
                matchFound = false;
            }
        }

        return matchedLabel;
    }

    function showAlreadyAddedLabel() {
        const note = JSON.parse(localStorage.getItem('notes')).filter((note) => note.id == noteId)[0];
        const noteLabels = note.labels;

        const searchResultLabels = document.querySelectorAll('.menu-box .label')
        searchResultLabels.forEach((label) => {
            const labelText = label.querySelector('label').textContent;
            const findIndex = noteLabels.findIndex((element) => element == labelText);
            if (!(findIndex === -1)) {
                label.querySelector('input').checked = true;
            }

            label.querySelector('input').addEventListener('change', (e) => {

                let note = JSON.parse(localStorage.getItem('notes')).filter((note) => note.id == noteId)[0];
                let newNote = new Note(note.title, note.content, note.labels);

                newNote.id = noteId;

                const checkboxLabel = e.currentTarget.parentElement.lastElementChild.textContent;

                if (e.currentTarget.checked) {
                    newNote.labels.push(checkboxLabel);

                } else {
                    newNote.labels = newNote.labels.filter((label) => label !== checkboxLabel);
                }

                newNote.save();

                if(document.querySelector('.note-view-area')){
                    document.querySelector('.note-view-area .note-labels').innerHTML = document.getElementById(noteId).querySelector('.note-labels').innerHTML;
                    makeRemoveLabel();
                }
            })
        })
    }

    function createLabel(label) {

        function crateLabelHTML() {

            const html = `<i class="fas fa-plus-circle avoid_Noteview avoid_MoreOptions create-label-icon" aria-hidden="true"></i><p class="avoid_Noteview avoid_MoreOptions create-label-text">Create - <span class="avoid_Noteview avoid_MoreOptions create-label-highlighted">${label}</span></p>`;

            if (document.querySelector('.menu-container .create-label-container')) {
                document.querySelector('.menu-container .create-label-container').innerHTML = html;
            } else {
                const createLabel = document.createElement('div');
                createLabel.className = "avoid_Noteview avoid_MoreOptions create-label-container";
                createLabel.innerHTML = html;
                document.querySelector('.menu-container').appendChild(createLabel);
                document.querySelector('.create-label-container').addEventListener('click', () => {
                    const label = document.querySelector('.create-label-highlighted').textContent;
                    const labelIndex = labels.findIndex((element) => element == label);
                    if(labelIndex == -1){
                        const note = JSON.parse(localStorage.getItem('notes')).filter((note) => note.id == noteId)[0];
                        const newNote = new Note(note.title, note.content, [...note.labels, label]);
                        newNote.id = note.id;
                        const newLabels = [...localStorage.getItem('labels')?JSON.parse(localStorage.getItem('labels')):[], label]
                        localStorage.setItem('labels', JSON.stringify(newLabels));
                        newNote.save();
                        addLabel(noteId);
                    }
                })
            }
        }

        if (!label) {
            if (document.body.querySelector('.create-label-container')) {
                document.body.querySelector('.create-label-container').remove();
                document.body.querySelector('.menu-container').style.paddingBottom = '1rem';
            }
            return;
        }

        let labelFound = false;

        for (let i = 0; i < labels.length; i++) {
            if (label == labels[i]) {
                labelFound = true;
                break;
            }
        }


        if (!labelFound) {

            document.body.querySelector('.menu-container').style.paddingBottom = 0;
            crateLabelHTML();

        } else {
            document.body.querySelector('.menu-container').style.paddingBottom = '1rem';
            if (document.body.querySelector('.create-label-container')) {
                document.body.querySelector('.create-label-container').remove();
            }
        }

        // makeAddFunctionable();
    }

    document.querySelector('.search-text').addEventListener('input', (e) => {
        if (e.currentTarget.textContent !== "") {

            let noteId = e.currentTarget;
            for (let i = 0; i < 6; i++) {
                noteId = noteId.parentElement;
            }
            noteId = noteId.id;
            console.log(e.currentTarget.textContent.trim());
            const newLabel = searchLabel(e.currentTarget.textContent.trim());
            const labelHTML = returnLabelHTML(newLabel);
            document.querySelector('.search-result').innerHTML = labelHTML;
            showAlreadyAddedLabel(noteId);
            createLabel(e.currentTarget.textContent.trim());
        } else {
            const labelHTML = returnLabelHTML(labels);
            document.querySelector('.search-result').innerHTML = labelHTML;
            createLabel(e.currentTarget.textContent);
        }
    });


}




// Populate Notes into notes area
populateNotes();

showMoreOptions();

// Add Label, Change Label, Trash, Complete Remove, Archive, UnArchive 