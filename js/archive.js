import { displayAllNotes, makeMoreOptionsIconFunction } from "./helper/note/noteHF.js";
import { makeRemoveLabel, makeNotesViewable, createNote } from "./helper/allHF.js";

function showArchivedNotes() {
    const allSavedNotes = JSON.parse(localStorage.getItem("notes"));
    if (allSavedNotes) {
        const achivedNotes = allSavedNotes.filter((element) => element.isTrash == false && element.isArchive == true);
        if (achivedNotes) {
            displayAllNotes(achivedNotes);
            makeMoreOptionsIconFunction('', ["add label", "unarchive", "trash note"])
            makeRemoveLabel();
            makeNotesViewable();
        }
    }
}

showArchivedNotes();
// createNote();


export { showArchivedNotes }