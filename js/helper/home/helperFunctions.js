import { Note } from "../classes.js";
import { showMoreOptions } from "../note/helperFunctions.js";


function returnNoteViewHTML(note) {

    function getCombinedLabelsHTML(labelsList) {
        let html = "";
        labelsList.forEach((label) => {
            html += `<span class="label"><p>${label.textContent.trim()}</p><span class=" close-button"><i class="fas fa-times"></i></span></span>`;
        });
        return html;
    }

    const noteTitle = note.querySelector(".title").textContent;
    const noteContent = note.querySelector(".content").textContent;
    const noteLabels = Array.from(note.querySelectorAll(".note-labels .label"));


    const noteViewArea = document.createElement("section");
    noteViewArea.classList.add("note-view-area");
    noteViewArea.classList.add("back-screen");

    const viewNoteHTML = `
    <div class="note">
            <div class="note-head">
                <h4 contenteditable="true" class="title">${noteTitle.trim()}</h4>
                <span class="more-icon"><span class="avoid_MoreOptions more-icon-circles"><i class="avoid_MoreOptions fas fa-circle"></i><i class="avoid_MoreOptions fas fa-circle"></i><i class="avoid_MoreOptions fas fa-circle"></i></span></span>
            </div>
            <div class="note-body">
                <p contenteditable="true" class="content">${noteContent.trim()}</p>
                ${noteLabels ? `<div class="note-labels">${getCombinedLabelsHTML(noteLabels)}</div>` : ""}
            </div>
        </div>
    `;

    noteViewArea.innerHTML = viewNoteHTML;
    return noteViewArea;
}


// check if currently any note is viewing
let isNoteViewing = false;

// when note is clicked show it in seprate window
function makeNotesViewable() {

    function onEditSaveNote(noteID) {
        const viewingNoteContainer = document.querySelector('.note-view-area');
        if (!viewingNoteContainer) { return }

        // whenever note is editied/changed by user save it 
        viewingNoteContainer.addEventListener('input', (e) => {
            const viewingNoteInputField = e.target;
            const viewingNoteInputClass = viewingNoteInputField.classList;

            if (!viewingNoteInputClass.contains('title') && !viewingNoteInputClass.contains('content')) { return }

            const noteTitle = viewingNoteContainer.querySelector('.title').textContent;
            const noteContent = viewingNoteContainer.querySelector('.content').textContent;
            const noteLabels = Array.from(viewingNoteContainer.querySelectorAll('.label'));

            const note = new Note(noteTitle, noteContent, noteLabels.map((label) => { return label.textContent }));
            note.id = noteID;
            note.save();
        })
    }

    const allNotesElement = document.querySelectorAll(".notes-area .note");

    if (!allNotesElement) { return }

    allNotesElement.forEach((noteElement) => {
        noteElement.addEventListener("click", (e) => {
            const clickedElementParent = e.target.parentElement;
            if (!clickedElementParent) { return }
            const avoidNoteViewing = clickedElementParent.classList.contains("avoid_Noteview");
            if (avoidNoteViewing || isNoteViewing) { return }

            const clickedNote = e.currentTarget;
            document.body.appendChild(returnNoteViewHTML(clickedNote));
            // make note view label's remove button functionable
            makeRemoveLabel(clickedNote.id)
            // make note view more-option button functionable
            showMoreOptions(clickedNote.id);

            const bodyStyle = document.querySelector("body").style;
            // freeze scrolling
            bodyStyle.width = "100vw";
            bodyStyle.height = "100vh";
            bodyStyle.overflow = "hidden";

            onEditSaveNote(clickedNote.id);
            isNoteViewing = true;


            // onclicking outside note-viewing-area (blackish part)
            document.querySelector(".note-view-area").addEventListener("click", (e) => {
                if (!e.target.classList.contains("note-view-area")) { return }

                e.currentTarget.remove();

                // unfreeze scrolling
                bodyStyle.width = "fit-content";
                bodyStyle.height = "fit-content";
                bodyStyle.overflow = "visible";
                isNoteViewing = false;

                // After removing note's label it is refressed and new note instance is made: make new note's buttons functionable
                makeRemoveLabel();
                showMoreOptions();
            });
        });
    });
}


// Function for deleting labels from the note
function makeRemoveLabel(noteId = "") {

    // Prompt for confiming user deletion
    function promptConfirmationBox(tag) {

        const existingPromptBox = document.body.querySelector('.prompt');
        if (existingPromptBox) { existingPromptBox.remove(); }

        // main prompt div
        const promptBox = document.createElement('div');
        promptBox.classList.add('prompt');

        promptBox.innerHTML =
            `<div class="msg-box">
            <p class="msg">are you sure you want to remove <span>${tag}</span> tag?</p>
            <div class="msg-button">
                <button class="red">Yes</button>
                <button class="green">No</button>
            </div>
        </div>`;

        // add promptBox in body
        document.body.appendChild(promptBox);

        // freeze scrolling
        const bodyStyle = document.body.style;
        bodyStyle.height = "100vh";
        bodyStyle.width = "100vw";
        bodyStyle.overflow = "hidden";
    }

    function removeLabelFromNote(currentLabel, note) {
        // remove label (frontEnd)
        currentLabel.remove();

        let newNote = "";
        if (noteId) {
            // id given means the note is clicked for viewing
            const noteTitle = document.querySelector('.note-view-area .title').textContent;
            const noteContent = document.querySelector('.note-view-area .content').textContent;
            const noteLabels = Array.from(document.querySelectorAll('.note-view-area .note-labels .label'));
            newNote = new Note(noteTitle, noteContent, noteLabels.map((label) => { return label.textContent }));

        } else {
            // id means the note is not opened seprately
            const noteTitle = note.querySelector('.title').textContent;
            const noteContent = note.querySelector('.content').textContent;
            const noteLabels = Array.from(note.querySelectorAll('.note-labels .label'));
            currentLabel.remove();
            newNote = new Note(noteTitle, noteContent, noteLabels.map((label) => { return label.textContent }));
        }

        newNote.id = noteId ? noteId : note.id;
        newNote.save();

        // when note is not in view mode and label is removed it is refressed and
        // a new instance is made so make that instance's button functionable 
        if (!noteId) { makeRemoveLabel() }
    }


    // Get all label's remove buttons
    const noteLabelRmButton = document.querySelectorAll(
        ".note-body .label .close-button"
    );

    noteLabelRmButton.forEach((label) => {
        label.addEventListener("click", (e) => {

            const currentLabelRmButton = e.target.parentElement.parentElement;

            // Note in which that label is (id = noteview)
            const clickedLabelNote = noteId ? document.getElementById(noteId) : currentLabelRmButton.parentElement.parentElement.parentElement;
            // Get User Confirmation
            promptConfirmationBox(currentLabelRmButton.textContent);

            // User clicked YES in confirmation
            document.querySelector('.prompt .red').addEventListener('click', () => {
                document.querySelector('.prompt').remove();
                removeLabelFromNote(currentLabelRmButton, clickedLabelNote);

                // Unfreeze scroll
                const bodyStyle = document.body.style;
                bodyStyle.height = "fit-content";
                bodyStyle.width = "fit-content";
                bodyStyle.overflow = "visible";
            })

            // User clicked NO in confirmation
            document.querySelector('.prompt .green').addEventListener('click', () => {
                document.querySelector('.prompt').remove();

                // Unfreeze scroll
                document.body.style.height = "fit-content";
                document.body.style.width = "fit-content";
                document.body.style.overflow = "visible";
            })
        });
    });
}


export { returnNoteViewHTML, makeNotesViewable, makeRemoveLabel }