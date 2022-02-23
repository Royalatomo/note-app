import { Note } from "../classes.js";
import { displayAllNotes, makeMoreOptionsIconFunction } from "./noteHF.js";
import { getSetNoteViewing, makeRemoveLabel, makeNotesViewable } from "../allHF.js";
import { showArchivedNotes } from "../../archive.js";

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


function toggelArchiveNote(noteId) {
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

    updateNote.isArchive = noteToEdit.isArchive;
    updateNote.toggelArchive();
    removeNoteView();

    let pageHtmlName = location.href.split('?')[0].split('/');
    pageHtmlName = pageHtmlName[pageHtmlName.length - 1];
    if (pageHtmlName === "archive.html") {
        showArchivedNotes();
        return;
    }

    displayAllNotes();
    makeNotesViewable();
    makeMoreOptionsIconFunction();
    makeRemoveLabel();
}

export { toggelArchiveNote }