import { makeNotesViewable, makeRemoveLabel } from "../home/helperFunctions.js";

// NewLine Bug Fix: Takes text for title/content and converts them to html tags (span, br) 
function convertTextToHtml(text) {

    // if no text saved
    if (!text) { return '' }

    const textWithNewLine = text.split('\n');

    const htmlHolder = document.createElement('div');
    htmlHolder.setAttribute('class', 'removeMe')

    // save every text with span tag, and add newline
    for (let index = 0; index < textWithNewLine.length; index++) {

        const textElementSpan = document.createElement('span');
        textElementSpan.innerText = textWithNewLine[index];
        htmlHolder.appendChild(textElementSpan);

        const lastIndex = textWithNewLine.length - 1;
        if (index !== lastIndex) {
            htmlHolder.appendChild(document.createElement('br'));
        }
    }

    return htmlHolder.innerHTML;
}


// display all notes in frontend
function populateNotes() {

    function returnSingleNoteHTML(note) {

        function getCombinedLabelsHTML() {
            let allLabelsHTML = "";
            note.labels.forEach((label) => {
                const element = document.createElement('span');
                element.setAttribute('class', 'avoid_Noteview label');
                element.innerHTML = `<p></p><span class="avoid_Noteview close-button"><i class="fas fa-times"></i></span>`;
                element.querySelector('p').innerText = label;
                allLabelsHTML += element.outerHTML;
            });

            return allLabelsHTML;
        }

        const noteTitle = note.title;
        const noteContent = note.content;

        const noteElement = document.createElement('div');
        noteElement.setAttribute('class', 'removeMe')
        noteElement.setAttribute('id', note.id);
        noteElement.setAttribute('class', "note");

        noteElement.innerHTML = `
                <div class="note-head">
                    <h4 class="title"></h4>
                    <span class="avoid_Noteview more-icon"><span class="avoid_Noteview more-icon-circles"><i class="avoid_MoreOptions fas fa-circle"></i><i class="avoid_MoreOptions fas fa-circle"></i><i class="avoid_MoreOptions fas fa-circle"></i></span></span>
                </div>
                <div class="note-body">
                    <p class="content"></p>
                    ${note.labels ? `<div class="note-labels">${getCombinedLabelsHTML()}</div>` : ""}
                </div>`;

        // Convert Text to Html Tags
        noteElement.querySelector('.content').innerHTML = convertTextToHtml(noteContent);
        noteElement.querySelector('.title').innerHTML = convertTextToHtml(noteTitle);

        return noteElement;
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
        allCombinedNotesHTML += returnSingleNoteHTML(note).outerHTML;
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
            const element = document.createElement('span');
            element.setAttribute('class', 'avoid_Noteview label');
            element.innerHTML = `<p></p><span class="avoid_Noteview close-button"><i class="fas fa-times"></i></span>`;
            element.querySelector('p').innerText = label;
            allCombinedLabelsHTML += element.outerHTML;
        });

        noteLabelContainer.innerHTML = allCombinedLabelsHTML;
        return noteLabelContainer;
    }

    // Update Title and Content, convert Text to Html Tags
    existingNote.querySelector(".title").innerHTML = convertTextToHtml(updatingNote.title);
    existingNote.querySelector(".content").innerHTML = convertTextToHtml(updatingNote.content);

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


// check if more option menu is showing
let moreOptionPromted = false;

function showMoreOptions(noteId = '') {
    const moreOptionCircleMenu = document.querySelectorAll('.more-icon-circles');

    moreOptionCircleMenu.forEach((circle) => {
        circle.addEventListener('click', (e) => {
            const note = noteId ? noteId : e.currentTarget.parentElement.parentElement.parentElement.id;
            if (moreOptionPromted) {
                const menuContainer = document.querySelector('.menu-container');
                if (menuContainer) {
                    menuContainer.remove();
                }
                moreOptionPromted = false;
                return;
            }

            // Show more-option menu
            promptMoreOptions(note, noteId ? true : false);

            const menuBoxOption = document.body.querySelectorAll('.menu');
            menuBoxOption.forEach((option) => {
                option.addEventListener('click', (e) => {
                    // if user clicked "add label" option
                    if (e.target.textContent == "add label") {
                        addLabel(note);
                    }
                })
            })

            moreOptionPromted = true;

            document.body.addEventListener('click', (e) => {
                if (!document.querySelector('.menu-container')) { return }

                let clickedOnMenuBox = false;
                if (e.target.classList.contains("avoid_MoreOptions")) {
                    clickedOnMenuBox = true;
                }

                // if user clicked outside menubox remove the more-option prompt
                if (!clickedOnMenuBox) {
                    document.querySelector('.menu-container').remove();
                    moreOptionPromted = false;
                }
            })
        })
    })
}

import { returnLabelHTML, returnFullAddLabelHTML, showAlreadyAddedLabel, searchLabel, createLabel } from "./addFunctionHelper.js";

function addLabel(noteId) {

    let labels = localStorage.getItem('labels') ? JSON.parse(localStorage.getItem('labels')) : [];
    const menuBox = document.body.querySelector('.menu-box');

    if (menuBox) {
        menuBox.style.minWidth = "130px";
        menuBox.innerHTML = returnFullAddLabelHTML(labels);
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
            createLabel(noteId, e.currentTarget.textContent.trim());
        } else {
            const labelHTML = returnLabelHTML(labels);
            document.querySelector('.search-result').innerHTML = labelHTML;
            showAlreadyAddedLabel(noteId);
        }
    });
}



export { updateNoteData, populateNotes, showMoreOptions, addLabel };