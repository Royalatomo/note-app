import { displayAllNotes, makeMoreOptionsIconFunction } from "./helper/note/noteHF.js";
import { makeNotesViewable, makeRemoveLabel } from "./helper/allHF.js";

function showLabelFilteredNotes() {
    // check if the page clicked is "label.html"
    let pageHtmlName = location.href.split('?')[0].split('/');
    pageHtmlName = pageHtmlName[pageHtmlName.length - 1];
    if (pageHtmlName !== "label.html") { return }

    const allSavedLabels = JSON.parse(localStorage.getItem('labels'));
    if (!allSavedLabels) { return }

    // Get the label name
    const labelIndex = location.href.split('?')[1];
    const labelName = allSavedLabels[labelIndex];


    const allSavedNotes = JSON.parse(localStorage.getItem('notes'));
    if (!allSavedNotes) { return }

    // notes which contains the same label
    const filteredNotes = allSavedNotes.filter((note) => {
        // if note is in trash don't show
        if (note.isTrash) { return false }

        let labelMatch = false;
        for (let i = 0; i < note.labels.length; i++) {
            if (note.labels[i] === labelName) {
                labelMatch = true;
                break;
            }
        }

        // if same label present - return this note
        if (labelMatch) { return true; }
        return false;
    })

    if (!filteredNotes) { return }
    displayAllNotes(filteredNotes);
    makeNotesViewable();
    makeMoreOptionsIconFunction();
    makeRemoveLabel();
}


showLabelFilteredNotes();

export { showLabelFilteredNotes }