import { displayAllNotes, makeMoreOptionsIconFunction } from "./helper/note/noteHF.js";

const allSavedNotes = JSON.parse(localStorage.getItem("notes"));
if (allSavedNotes) {
    const trashedNotes = allSavedNotes.filter((element) => element.isTrash == true);
    if (trashedNotes) {
        displayAllNotes(trashedNotes);
        makeMoreOptionsIconFunction('', ["untrash", "delete note"])
    }
}