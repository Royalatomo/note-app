// Return's HTML for individual note viewing
function returnNoteViewHTML(note) {

    // Return's HTML for "labels section"
    function getLabels() {
        let fullLabelHTML = "";
        labels.forEach((label) => {
            fullLabelHTML += `<span class="label"><p>${label.textContent.trim()}</p><span class=" close-button"><i class="fas fa-times"></i></span></span>`;
        });
        return fullLabelHTML;
    }

    // Get Selected Note Title
    const title = note.querySelector(".title").textContent;
    // Get Selected Note Content
    const content = note.querySelector(".text").textContent;
    // Get Selected Note Labels
    const labels = Array.from(note.querySelectorAll(".note-labels .label"));


    // Main div - Note container
    const section = document.createElement("section");
    section.classList.add("note-view-area");
    section.classList.add("back-screen");

    // Note's div HTML
    const html = `
    <div class="note">
            <div class="note-head">
                <h4 contenteditable="true" class="title">${title.trim()}</h4>
                <span class="more-icon"><span class="avoid_MoreOptions more-icon-circles"><i class="avoid_MoreOptions fas fa-circle"></i><i class="avoid_MoreOptions fas fa-circle"></i><i class="avoid_MoreOptions fas fa-circle"></i></span></span>
            </div>
            <div class="note-body">
                <p contenteditable="true" class="text">${content.trim()}</p>
                ${// if labels present in note
        labels ? `<div class="note-labels">${getLabels()}</div>` : ""
        }
            </div>
        </div>
    `;

    // Add note into Note Container (Main Div)
    section.innerHTML = html;
    return section;
}


// any note is viewing currently
let noteViewON = false;


// On Note Click Open in Viewing mode
function makeNotesViewable() {
    // Get all notes
    let notes = document.querySelector(".notes-area");

    // When Ever Title/Content is edited
    function onEditSaveNote(noteID) {
        const noteView = document.querySelector('.note-view-area');
        if (noteView) {
            noteView.addEventListener('input', (e) => {
                if (e.target.classList.contains('.title') || e.target.classList.contains('.text')) {
                    const note = new Note(noteView.querySelector('.title').textContent, noteView.querySelector('.text').textContent, Array.from(noteView.querySelectorAll('.label')).map((label) => { return label.textContent }))
                    note.id = noteID;
                    note.save();
                }
            })
        }
    }

    if (notes) {
        notes = notes.querySelectorAll(".note");
        if (notes) {
            // Make every note clickable for viewing
            notes.forEach((note) => {
                note.addEventListener("click", (e) => {
                    // Get the exact clicked element
                    const labelClicked = e.target.parentElement ? (e.target.parentElement.classList).contains("avoid_Noteview") : true;

                    // If the clicked element is not label/ If currently some note is being viewed
                    if (!labelClicked && !noteViewON) {
                        // Show clicked note
                        document.body.appendChild(returnNoteViewHTML(e.currentTarget));
                        // make remove label button workable (for this note id)
                        makeRemoveLabel(e.currentTarget.id)

                        showMoreOptions(e.currentTarget.id);

                        // Freeze scrolling
                        document.querySelector("body").style.width = "100vw";
                        document.querySelector("body").style.height = "100vh";
                        document.querySelector("body").style.overflow = "hidden";
                        noteViewON = true;
                        onEditSaveNote(e.currentTarget.id);

                        // If clicked at note viewing Div
                        document.querySelector(".note-view-area").addEventListener("click", (e) => {
                            // If note clicked on the note (background clicked)
                            if (e.target.classList.contains("note-view-area")) {
                                // remove note viewer
                                e.target.remove();

                                // more_option_prompt = false;
                                showMoreOptions();

                                // Unfreeze scrolling
                                document.querySelector("body").style.width = "fit-content";
                                document.querySelector("body").style.height = "fit-content";
                                document.querySelector("body").style.overflow = "visible";

                                noteViewON = false;
                            }
                        });
                    }
                });
            });
        }
    }
}


// Function for deleting labels from the note
function makeRemoveLabel(id = "") {

    // Prompt for confiming user deletion
    function promptRemove(tag) {

        if (document.body.querySelector('.prompt')) {
            document.body.querySelector('.prompt').remove();
        }

        // main prompt div
        const prompt = document.createElement('div');
        prompt.classList.add('prompt');

        prompt.innerHTML = `
        <div class="msg-box">
            <p class="msg">are you sure you want to remove <span>${tag}</span> tag?</p>
            <div class="msg-button">
                <button class="red">Yes</button>
                <button class="green">No</button>
            </div>
        </div>`;

        // append to body
        document.body.appendChild(prompt);

        // freeze scrolling
        document.body.style.height = "100vh";
        document.body.style.width = "100vw";
        document.body.style.overflow = "hidden";
    }

    // Remove Label from frontEnd and localStorage for that note
    function removeLabelFromNote(currentLabel, note) {
        // remove note from note (frontEnd)
        currentLabel.remove();

        // create note(same id) without the label tag which have to be deleted
        const newNote = id ?
            (new Note(document.querySelector('.note-view-area .title').textContent, document.querySelector('.note-view-area .text').textContent, Array.from(document.querySelectorAll('.note-view-area .label')).map((label) => { return label.textContent })))
            :
            (new Note(note.querySelector('.title').textContent, note.querySelector('.text').textContent, Array.from(note.querySelectorAll('.label')).map((label) => { return label.textContent })));

        // if id already given (noteView - REMOVE) / else (Home - REMOVE)
        newNote.id = note.id;
        // save changes
        newNote.save();
    }


    // Get all remove label buttons
    const notesLabels = document.querySelectorAll(
        ".note-body .label .close-button"
    );

    // addEventListener to all Remove Buttons
    notesLabels.forEach((label) => {
        label.addEventListener("click", (e) => {

            // Label for which the button is clicked
            const currentLabel = e.target.parentElement.parentElement;
            // Note in which that label is
            const note = id ? document.getElementById(id) : currentLabel.parentElement.parentElement.parentElement;

            // Get User Confirmation
            promptRemove(currentLabel.textContent);

            // If User Wants to Remove (Confirmation Done)
            document.querySelector('.prompt .red').addEventListener('click', () => {
                // Remove Prompt
                document.querySelector('.prompt').remove();

                // Unfreeze scroll
                document.body.style.height = "fit-content";
                document.body.style.width = "fit-content";
                document.body.style.overflow = "visible";
                // Remove label from note
                removeLabelFromNote(currentLabel, note);

            })

            // If user doesn't want to Remove (Confirmation Done)
            document.querySelector('.prompt .green').addEventListener('click', () => {
                // Remove Prompt
                document.querySelector('.prompt').remove();

                // Unfreeze scroll
                document.body.style.height = "fit-content";
                document.body.style.width = "fit-content";
                document.body.style.overflow = "visible";
            })
        });
    });
}


// Function for displaying more-options
function promptMoreOptions(noteID, noteView = false) {
    const menu = [];
    const note = JSON.parse(localStorage.getItem('notes')).filter((n) => n.id == noteID)[0];
    let small = false;

    if (note.labels.length > 0) {
        menu.push('change label');
        menu.push('add label');
    } else {
        menu.push('add label');
        small = true;
    }

    if (!note.isArchive) {
        menu.push('archive')
        menu.push('delete note')
    }

    const mainDiv = document.createElement('div');
    mainDiv.classList.add('avoid_MoreOptions');
    mainDiv.classList.add('avoid_Noteview');
    mainDiv.classList.add('menu-container');

    let html = '<ul class="avoid_Noteview avoid_MoreOptions menu-box">';
    menu.forEach((menu) => {
        html += `<li ${small ? 'style="min-width: 110px"' : ''} class="avoid_MoreOptions menu">${menu}</li>`;
    })
    html += '</ul>'

    mainDiv.innerHTML = html;

    if (!noteView) {
        let moreIcon = document.getElementById(noteID);
        if (moreIcon) {
            moreIcon = moreIcon.querySelector('.more-icon');
            moreIcon.insertBefore(mainDiv, moreIcon.firstChild);
        }
    } else {
        let moreIcon = document.body.querySelector('.note-view-area .note');
        if (moreIcon) {
            moreIcon = moreIcon.querySelector('.more-icon');
            moreIcon.insertBefore(mainDiv, moreIcon.firstChild);
        }
    }

}


// Display all notes which are present in localStorage
makeNotesViewable();
