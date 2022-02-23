import { Note } from "../classes.js";
import { displayAllNotes, makeMoreOptionsIconFunction } from "./noteHF.js";
import { getSetNoteViewing, makeRemoveLabel, makeNotesViewable } from "../allHF.js";
import { showLabelFilteredNotes } from "../../label.js"
import { showArchivedNotes } from "../../archive.js"


// Prompt for confiming user deletion
function promptConfirmationBox(msg) {

    const existingPromptBox = document.body.querySelector('.prompt');
    if (existingPromptBox) { existingPromptBox.remove(); }

    // main prompt div
    const promptBox = document.createElement('div');
    promptBox.classList.add('prompt');

    promptBox.innerHTML =
        `<div class="msg-box">
        <p class="msg">${msg}</p>
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

function removeNoteView() {
    if (!getSetNoteViewing()) { return }
    document.querySelector('.note-view-area').remove();

    const bodyStyle = document.body.style;
    // unfreeze scrolling
    bodyStyle.width = "fit-content";
    bodyStyle.height = "fit-content";
    bodyStyle.overflow = "visible";
    getSetNoteViewing(false);

    // After removing note's label it is refressed and new note instance is made: make new note's buttons functionable
    makeRemoveLabel();
    makeMoreOptionsIconFunction();
}

function removeNote(noteId) {
    let allSavedNotes = JSON.parse(localStorage.getItem('notes'));
    if (!allSavedNotes) { return }

    // stores note which will be deleted/trashed
    let noteToEdit = "";
    for (let i = 0; i < allSavedNotes.length; i++) {
        if (allSavedNotes[i].id == noteId) {
            noteToEdit = allSavedNotes[i];
            break;
        }
    }

    const updateNote = new Note(noteToEdit.title, noteToEdit.content, noteToEdit.labels);
    updateNote.id = noteId;
    updateNote.isTrash = noteToEdit.isTrash;
    updateNote.isArchive = noteToEdit.isArchive;

    // if note already trashed, then delete it completly
    if (updateNote.isTrash) {

        // Get user confirmation for deleting permanently
        promptConfirmationBox("Do you want to delete this note forever?");

        // remove more-options menu (UI/UX)
        const moreOptionDialogBox = document.querySelector('.menu-container');
        moreOptionDialogBox.remove();

        // If user confirms deletion
        const confirmationPromptBox = document.querySelector('.prompt');
        const redButton = confirmationPromptBox.querySelector('.red');
        const greenButton = confirmationPromptBox.querySelector('.green');

        redButton.addEventListener('click', () => {
            // remove completly and save changes to note
            updateNote.trash();
            confirmationPromptBox.remove();
            // get updated notes
            allSavedNotes = JSON.parse(localStorage.getItem('notes'));
            // remove completly - means user is in trash page - so show only trashed notes
            displayAllNotes(allSavedNotes.filter((element) => element.isTrash == true));
            // show these menu in notes moreOption dialog box
            makeMoreOptionsIconFunction('', ["untrash", "delete note"])

            // Unfreeze scroll
            const bodyStyle = document.body.style;
            bodyStyle.height = "fit-content";
            bodyStyle.width = "fit-content";
            bodyStyle.overflow = "visible";
        })

        // If user does not confirms deletion
        greenButton.addEventListener('click', () => {
            confirmationPromptBox.remove();
            // Unfreeze scroll
            document.body.style.height = "fit-content";
            document.body.style.width = "fit-content";
            document.body.style.overflow = "visible";
        })
        return;
    }

    // sending note to trash - means user not in trash page
    updateNote.trash();
    removeNoteView();

    // if note is removed from "label.html" page - render all labeled pages again
    let pageHtmlName = location.href.split('?')[0].split('/');
    pageHtmlName = pageHtmlName[pageHtmlName.length - 1];
    if (pageHtmlName === "label.html") { 
        showLabelFilteredNotes();
        return;
    }else if(pageHtmlName == "archive.html") {
        showArchivedNotes();
        return;
    }
    
    displayAllNotes();
    makeNotesViewable();
    makeMoreOptionsIconFunction();
}


function untrashNote(noteId) {
    let allNotes = JSON.parse(localStorage.getItem('notes'));
    if (!allNotes) { return }

    // stores note which will be deleted/trashed
    let noteToEdit = "";
    for (let i = 0; i < allNotes.length; i++) {
        if (allNotes[i].id == noteId) {
            noteToEdit = allNotes[i];
            break;
        }
    }

    const updateNote = new Note(noteToEdit.title, noteToEdit.content, noteToEdit.labels);
    updateNote.id = noteId;
    updateNote.isArchive = noteToEdit.isArchive;
    // remove note from trash
    updateNote.untrash();
    // Get updated note list
    allNotes = JSON.parse(localStorage.getItem('notes'));
    // Removing from trash - means user is in trash page
    displayAllNotes(allNotes.filter((element) => element.isTrash == true));
    // show these menu in notes moreOption dialog box
    makeMoreOptionsIconFunction('', ["untrash", "delete note"])
}


export { removeNote, untrashNote }