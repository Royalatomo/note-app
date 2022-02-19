import { displayAllNotes, makeMoreOptionsIconFunction } from "./helper/note/noteHF.js";
import { makeNotesViewable, makeRemoveLabel } from "./helper/allHF.js";

function showLabeledNotes() {
    let pageHtmlName = location.href.split('?')[0].split('/');
    pageHtmlName = pageHtmlName[pageHtmlName.length - 1];
    if (pageHtmlName !== "label.html") { return }
    const labelIndex = location.href.split('?')[1];
    const allLabels = JSON.parse(localStorage.getItem('labels'));

    if (allLabels) {
        const labelName = allLabels[labelIndex];
        const allSavedNotes = JSON.parse(localStorage.getItem('notes'));
        if (allSavedNotes) {
            const filteredNotes = allSavedNotes.filter((note) => {
                if (note.isTrash) { return false }

                let labelMatch = false;
                for (let i = 0; i < note.labels.length; i++) {
                    if (note.labels[i] === labelName) {
                        labelMatch = true;
                        break;
                    }
                }

                if (labelMatch) {
                    return true;
                }
                return false;
            })

            if (filteredNotes) {
                displayAllNotes(filteredNotes);
                makeNotesViewable();
                makeMoreOptionsIconFunction();
                makeRemoveLabel();
            }
        }

    }
}


showLabeledNotes();

export { showLabeledNotes }