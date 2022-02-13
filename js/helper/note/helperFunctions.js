import { Note } from "../classes.js";
import { makeNotesViewable, makeRemoveLabel } from "../home/helperFunctions.js";

// display all notes in frontend
function populateNotes() {

    function returnSingleNoteHTML(note) {

        function getCombinedLabelsHTML() {
            let allLabelsHTML = "";
            note.labels.forEach((label) => {
                allLabelsHTML += `<span class="avoid_Noteview label"><p>${label}</p><span class="avoid_Noteview  close-button"><i class="fas fa-times"></i></span></span>`;
            });
            return allLabelsHTML;
        }

        let noteHTML = `
            <div id="${note.id}" class="note">
                <div class="note-head">
                    <h4 class="title">${note.title}</h4>
                    <span class="avoid_Noteview more-icon"><span class="avoid_Noteview more-icon-circles"><i class="avoid_MoreOptions fas fa-circle"></i><i class="avoid_MoreOptions fas fa-circle"></i><i class="avoid_MoreOptions fas fa-circle"></i></span></span>
                </div>
                <div class="note-body">
                    <p class="content">${note.content}</p>
                    ${note.labels ? `<div class="note-labels">${getCombinedLabelsHTML()}</div>` : ""}
                </div>
            </div>`;

        return noteHTML;
    }


    const notesContainingDiv = document.querySelectorAll(".note-area");

    // is notes already present in it remove all
    if (notesContainingDiv) {
        notesContainingDiv.innerHTML = "";
    }

    const allSavedNotes = localStorage.getItem("notes") ? JSON.parse(localStorage.getItem("notes")) : '';
    if (!allSavedNotes) { return }

    let allCombinedNotesHTML = "";
    allSavedNotes.forEach((note) => {
        allCombinedNotesHTML += returnSingleNoteHTML(note);
    });

    // if notes containing div is not present - create it
    if (!document.querySelector(".notes-area")) {
        const noteAreaSection = document.createElement("section");
        noteAreaSection.classList.add("notes-area");
        noteAreaSection.innerHTML = allCombinedNotesHTML;
        document.body.appendChild(noteAreaSection);
    }
    else {
        document.querySelector(".notes-area").innerHTML = allCombinedNotesHTML;
    }

    // make note's button functionable
    makeNotesViewable();
    makeRemoveLabel();
}


// Update individual note on frontEnd
function updateNoteData(noteId) {

    const allSavedNotes = JSON.parse(localStorage.getItem("notes"));
    const updatingNote = allSavedNotes.filter((note) => note.id == noteId)[0];

    if (!updatingNote) { return }

    // Get old note from DOM
    const existingNote = document.getElementById(updatingNote.id);
    if (!existingNote) { return }

    // Returns Note's Labels HTML section
    function getNoteLabelsHTML() {
        if (!updatingNote.labels) { return };

        // Note's labels holding div
        const noteLabelContainer = document.createElement("div");
        noteLabelContainer.classList.add("avoid_Noteview");
        noteLabelContainer.classList.add("note-labels");

        let allCombinedLabelsHTML = "";
        updatingNote.labels.forEach((label) => {
            allCombinedLabelsHTML += `<span class="avoid_Noteview label"><p>${label}</p><span class="avoid_Noteview close-button"><i class="fas fa-times"></i></span></span>`;
        });

        noteLabelContainer.innerHTML = allCombinedLabelsHTML;
        return noteLabelContainer;
    }

    // Update Title
    existingNote.querySelector(".title").textContent = updatingNote.title;
    // Update Content
    existingNote.querySelector(".content").textContent = updatingNote.content;

    // Update Labels if any
    if (existingNote.querySelector(".note-labels")) {
        existingNote.querySelector(".note-labels").remove()

        const freshLabels = getNoteLabelsHTML();
        if (freshLabels) {
            existingNote.querySelector(".note-body").appendChild(freshLabels);
        }
    }
}


// Function for displaying more-options
function promptMoreOptions(noteId, noteView = false) {
    const moreOptionsMenu = [];
    const clickedNoteForMenu = JSON.parse(localStorage.getItem('notes')).filter((n) => n.id == noteId)[0];
    const noteLabels = clickedNoteForMenu.labels;
    let isLabelPresent = false;

    if (noteLabels.length > 0) {
        // if label present give "change label" option also
        moreOptionsMenu.push('change label');
        moreOptionsMenu.push('add label');
    } else {
        moreOptionsMenu.push('add label');
        isLabelPresent = true;
    }

    if (!clickedNoteForMenu.isArchive) {
        moreOptionsMenu.push('archive')
        moreOptionsMenu.push('delete note')
    }

    // menu holding div - element
    const mainDiv = document.createElement('div');
    mainDiv.classList.add('avoid_MoreOptions');
    mainDiv.classList.add('avoid_Noteview');
    mainDiv.classList.add('menu-container');

    // menu holding div - html
    let mainDivHTML = '<ul class="avoid_Noteview avoid_MoreOptions menu-box">';
    moreOptionsMenu.forEach((menu) => {
        mainDivHTML += `<li ${isLabelPresent ? 'style="min-width: 110px"' : ''} class="avoid_MoreOptions menu">${menu}</li>`;
    })
    mainDivHTML += '</ul>'
    mainDiv.innerHTML = mainDivHTML;


    // if more-options menu is not clicked in noteview
    if (!noteView) {
        const note = document.getElementById(noteId)
        if (note) {
            const moreIcon = note.querySelector('.more-icon');
            moreIcon.insertBefore(mainDiv, moreIcon.firstChild);
        }
    } else {
        const noteView = document.body.querySelector('.note-view-area .note');
        if (noteView) {
            const moreIcon = noteView.querySelector('.more-icon');
            moreIcon.insertBefore(mainDiv, moreIcon.firstChild);
        }
    }
}


let more_option_prompt = false;

function showMoreOptions(noteId = '') {
    document.querySelectorAll('.more-icon-circles').forEach((circle) => {

        circle.addEventListener('click', (e) => {
            const note = noteId ? noteId : e.currentTarget.parentElement.parentElement.parentElement.id;
            if (!more_option_prompt) {
                promptMoreOptions(note, noteId ? true : false);

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
            const searchBar = document.querySelector('.menu-container .search .search-text');
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
                makeRemoveLabel();

                if (document.querySelector('.note-view-area')) {
                    document.querySelector('.note-view-area .note-labels').innerHTML = document.getElementById(noteId).querySelector('.note-labels').innerHTML;
                    makeRemoveLabel(noteId);
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
                    if (labelIndex == -1) {
                        const note = JSON.parse(localStorage.getItem('notes')).filter((note) => note.id == noteId)[0];
                        const newNote = new Note(note.title, note.content, [...note.labels, label]);
                        newNote.id = note.id;
                        const newLabels = [...localStorage.getItem('labels') ? JSON.parse(localStorage.getItem('labels')) : [], label]
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



export { updateNoteData, populateNotes, showMoreOptions, addLabel };