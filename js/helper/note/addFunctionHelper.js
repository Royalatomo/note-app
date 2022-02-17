import { makeRemoveLabel, getNoteViewing } from "../allHF.js";
import { Note } from "../classes.js";
import { addLabelInNote } from "./noteHF.js"


function returnAllLabelOptionsHtml(labelsList) {
    let labelHtmlCombined = '';
    labelsList.forEach((label) => {
        const individualLabelHtml = document.createElement('div');
        individualLabelHtml.setAttribute('class', 'avoid_Noteview avoid_MoreOptions label')
        individualLabelHtml.innerHTML += `<input class="avoid_Noteview avoid_MoreOptions" type="checkbox" name="" value=""/><label class="avoid_Noteview avoid_MoreOptions label-text"></label>`;
        individualLabelHtml.querySelector('label').innerText = label;
        labelHtmlCombined += individualLabelHtml.outerHTML;
    })
    return labelHtmlCombined;
}


function returnFullAddLabelHTML(labelsList) {
    let addLabelHtml = '<div class="avoid_Noteview avoid_MoreOptions search"><i class="fas fa-search avoid_MoreOptions"></i><div contenteditable="true" class="avoid_Noteview avoid_MoreOptions search-text">Type Label...</div></div><div class="avoid_Noteview avoid_MoreOptions search-result">';
    addLabelHtml += returnAllLabelOptionsHtml(labelsList);
    addLabelHtml += '</div>';
    return addLabelHtml
}


// check the label which are already there in note, so that user can see which labels the note already have
function checkAlreadyExistingNoteLabels(noteId) {
    const note = JSON.parse(localStorage.getItem('notes')).filter((note) => note.id == noteId)[0];
    const noteLabels = note.labels;

    // label which user see's inside addLabelInNote option
    const searchResultLabels = document.querySelectorAll('.menu-box .label')
    searchResultLabels.forEach((label) => {
        const labelText = label.querySelector('label').textContent;

        // check if this label is present in the note
        const findIndex = noteLabels.findIndex((element) => element == labelText);
        if (!(findIndex === -1)) {
            // if this label found in the note
            label.querySelector('input').checked = true;
        }

        // if user checked/unchecked the label
        const labelCheckBox = label.querySelector('input');
        labelCheckBox.addEventListener('change', (e) => {

            // get note which refreshed labels (if added/removed labels)
            const note = JSON.parse(localStorage.getItem('notes')).filter((note) => note.id == noteId)[0];

            // new note to update existing note (localStorage)
            const updateNote = new Note(note.title, note.content, note.labels);
            updateNote.id = noteId;

            const checkboxLabelText = e.currentTarget.parentElement.lastElementChild.textContent;
            if (e.currentTarget.checked) {
                // add check to label
                updateNote.labels.push(checkboxLabelText);
            } else {
                // remove check from label
                updateNote.labels = updateNote.labels.filter((label) => label !== checkboxLabelText);
            }

            updateNote.save();
            // make label remove button functionable (in notesArea section)
            makeRemoveLabel();
        })
    })
}


function searchNoteLabel(labelToSearch) {
    let searchFoundLabels = [];
    const allSavedLabels = localStorage.getItem('labels') ? JSON.parse(localStorage.getItem('labels')) : [];
    if (!allSavedLabels) { return []; }

    // if search is empty show all available labels to add/remove
    if (!labelToSearch) { return allSavedLabels; }

    for (let i = 0; i < allSavedLabels.length; i++) {
        let matchFound = true;
        // try to match every single words
        for (let x = 0; x < labelToSearch.length; x++) {
            if (labelToSearch[x] != allSavedLabels[i][x]) {
                matchFound = false;
                break;
            }
        }

        if (matchFound) {
            searchFoundLabels.push(allSavedLabels[i])
            matchFound = false;
        }
    }

    return searchFoundLabels;
}


function createNoteLabel(noteId, labelToAdd) {

    function createLabelButtonHTML() {

        const buttonHTML = document.createElement('span');
        buttonHTML.innerHTML = `<i class="fas fa-plus-circle avoid_Noteview avoid_MoreOptions create-label-icon" aria-hidden="true"></i><p class="avoid_Noteview avoid_MoreOptions create-label-text">Create - <span class="avoid_Noteview avoid_MoreOptions create-label-highlighted"></span></p>`;

        const createLabelHighlightedName = buttonHTML.querySelector('.create-label-highlighted');
        createLabelHighlightedName.innerText = labelToAdd;

        const createButtonExists = document.querySelector('.menu-container .create-label-container');
        if (createButtonExists) {
            createButtonExists.innerHTML = buttonHTML.innerHTML;
            return;
        }

        const createButtonDiv = document.createElement('div');
        createButtonDiv.className = "avoid_Noteview avoid_MoreOptions create-label-container";
        createButtonDiv.innerHTML = buttonHTML.innerHTML;

        const addLabelArea = document.querySelector('.menu-container');
        addLabelArea.appendChild(createButtonDiv);

        const createButtonDivContainer = document.querySelector('.create-label-container');
        createButtonDivContainer.addEventListener('click', () => {

            const labelToCreate = document.querySelector('.create-label-highlighted').innerText;
            const labelAlreadyExists = allSavedLabels.findIndex((element) => element == labelToCreate);
            if (labelAlreadyExists !== -1) { return }

            // if label not already exists
            const noteToUpdate = JSON.parse(localStorage.getItem('notes')).filter((note) => note.id == noteId)[0];
            const updatedNote = new Note(noteToUpdate.title, noteToUpdate.content, [...noteToUpdate.labels, labelToCreate]);
            updatedNote.id = noteToUpdate.id;

            // add newly added label to allLabels (localStorage)
            const newLabels = [...localStorage.getItem('labels') ? JSON.parse(localStorage.getItem('labels')) : [], labelToCreate]
            localStorage.setItem('labels', JSON.stringify(newLabels));
            updatedNote.save();

            // refresh addLabelInNote Dialog Box
            addLabelInNote(noteId);

            if (getNoteViewing()) {
                console.log("HELLO");
                makeRemoveLabel(noteId);
            } else {
                console.log("HELLO");
                makeRemoveLabel();
            }


            // remove createButton
            const createButtonContainer = document.body.querySelector('.create-label-container');
            if (createButtonContainer) { createButtonContainer.remove(); }

        })

    }

    // If label is empty
    const moreOptionDialogBox = document.body.querySelector('.menu-container');
    if (!labelToAdd) {
        const createLabelOption = document.body.querySelector('.create-label-container');
        if (!createLabelOption) { return }
        createLabelOption.remove();
        moreOptionDialogBox.style.paddingBottom = '1rem';
    }

    const allSavedLabels = localStorage.getItem('labels') ? JSON.parse(localStorage.getItem('labels')) : [];
    let labelAlreadyExists = false;
    for (let i = 0; i < allSavedLabels.length; i++) {
        if (labelToAdd == allSavedLabels[i]) {
            labelAlreadyExists = true;
            break;
        }
    }

    if (labelAlreadyExists) {
        // Don't show createLabel button
        moreOptionDialogBox.style.paddingBottom = '1rem';
        const createLabelOption = document.body.querySelector('.create-label-container');
        if (createLabelOption) { createLabelOption.remove(); }
        return
    }

    moreOptionDialogBox.style.paddingBottom = 0;
    createLabelButtonHTML();
}


export { returnAllLabelOptionsHtml, returnFullAddLabelHTML, checkAlreadyExistingNoteLabels, searchNoteLabel, createNoteLabel };