import { makeNotesViewable, makeRemoveLabel } from "../allHF.js";
import { Note } from "../classes.js";
import { returnAllLabelOptionsHtml, returnFullAddLabelHTML, checkAlreadyExistingNoteLabels, searchNoteLabel, createNoteLabel } from "./addLabelFunction.js";

// NewLine Bug Fix: Takes text for title/content and converts them to html tags (span, br) 
function convertTextToNoteHtml(text) {

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
function displayAllNotes(notesList = "") {

    function returnSingleNoteHTML(note) {

        function getCombinedLabelsHTML() {
            let allLabelsHTML = "";
            note.labels.forEach((label) => {
                const element = document.createElement('span');
                element.setAttribute('class', 'avoid_Noteview label');
                element.innerHTML = `<p class="label-text"></p><span class="avoid_Noteview close-button"><i class="fas fa-times"></i></span>`;
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
        noteElement.querySelector('.content').innerHTML = convertTextToNoteHtml(noteContent);
        noteElement.querySelector('.title').innerHTML = convertTextToNoteHtml(noteTitle);

        return noteElement;
    }


    const notesContainingDiv = document.querySelectorAll(".note-area");

    // is notes already present in it remove all
    if (notesContainingDiv) {
        notesContainingDiv.innerHTML = "";
    }

    // if notes given to show then, else show all notes from localStorage
    function getNotesList() {
        if (!notesList) {
            const allNotes = JSON.parse(localStorage.getItem("notes"));
            if (!allNotes) { return '' }
            // show only that notes which are not trashed or archived
            return allNotes.filter((element) => element.isTrash == false && element.isArchive == false);
        }
        return notesList;
    }
    const allSavedNotes = getNotesList();

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

    if (!notesList) {
        // make note's button functionable
        makeNotesViewable();
        makeRemoveLabel();
    }
}


// Update individual note on frontEnd
function updateNote(noteId) {

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
            element.innerHTML = `<p class="label-text"></p><span class="avoid_Noteview close-button"><i class="fas fa-times"></i></span>`;
            element.querySelector('p').innerText = label;
            allCombinedLabelsHTML += element.outerHTML;
        });

        noteLabelContainer.innerHTML = allCombinedLabelsHTML;
        return noteLabelContainer;
    }

    // Update Title and Content, convert Text to Html Tags
    existingNote.querySelector(".title").innerHTML = convertTextToNoteHtml(updatingNote.title);
    existingNote.querySelector(".content").innerHTML = convertTextToNoteHtml(updatingNote.content);

    // Update Labels if any
    if (existingNote.querySelector(".note-labels")) {
        existingNote.querySelector(".note-labels").remove()

        const freshLabels = getNoteLabelsHTML();
        if (freshLabels) {
            existingNote.querySelector(".note-body").appendChild(freshLabels);
        }
    }

    const noteViewArea = document.querySelector('.note-view-area');
    if (!noteViewArea) { return }

    const noteViewAreaLabels = noteViewArea.querySelector('.note-labels');
    const actualNoteLabels = document.getElementById(noteId).querySelector('.note-labels');
    noteViewAreaLabels.innerHTML = actualNoteLabels.innerHTML;
    // make label remove button functionable (in noteView Mode)
    makeRemoveLabel(noteId);
}


// Function for displaying more-options
function showMoreOptionsDialogBox(noteId, noteView = false, customOption = []) {
    const moreOptionsMenu = [];
    const clickedNoteForMenu = JSON.parse(localStorage.getItem('notes')).filter((n) => n.id == noteId)[0];
    const noteLabels = clickedNoteForMenu.labels;
    let addMoreSpace = false;
    console.log('asdfasdfasdf');

    if (customOption.length > 0) {
        customOption.forEach((option) => {
            moreOptionsMenu.push(option);
        })
    } else {
        if (noteLabels.length > 0) {
            // if label present give "change label" option also
            moreOptionsMenu.push('change label');
            moreOptionsMenu.push('add label');
        } else {
            moreOptionsMenu.push('add label');
            addMoreSpace = true;
        }

        if (!clickedNoteForMenu.isArchive) {
            moreOptionsMenu.push('archive')
            moreOptionsMenu.push('delete note')
        }
    }

    // menu holding div - element
    const mainDiv = document.createElement('div');
    mainDiv.classList.add('avoid_MoreOptions');
    mainDiv.classList.add('avoid_Noteview');
    mainDiv.classList.add('menu-container');

    // menu holding div - html
    let mainDivHTML = '<ul class="avoid_Noteview avoid_MoreOptions menu-box">';
    moreOptionsMenu.forEach((menu) => {
        mainDivHTML += `<li class="avoid_MoreOptions menu ${addMoreSpace ? 'addSpace' : ''}">${menu}</li>`;
    });
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


// more option dialog box currently showing
let moreOptionDialogBoxPresent = false;

// Display More Options Dialog Box
function makeMoreOptionsIconFunction(noteId = '', customOption = []) {

    function displayMoreOptionDialogBox(event) {
        function getNoteId() {
            let note = event.currentTarget;
            for (let i = 0; i < 3; i++) { note = note.parentElement };
            return note.id;
        }

        const note = noteId ? noteId : getNoteId();
        // if already moreOption dialog present remove it and exit
        if (moreOptionDialogBoxPresent) {
            const menuContainer = document.querySelector('.menu-container');
            if (menuContainer) { menuContainer.remove(); }
            moreOptionDialogBoxPresent = false;
            return;
        }

        // Show more-option dialog box
        showMoreOptionsDialogBox(note, noteId ? true : false, customOption ? customOption : []);

        // Menu inside more-option dialog box
        const menuBoxOption = document.body.querySelectorAll('.menu');
        menuBoxOption.forEach((option) => {
            option.addEventListener('click', (e) => {
                // if user clicked "add label" option
                if (e.target.textContent == "add label") {
                    addLabelInNote(note);
                } else if (e.target.textContent == "delete note") {
                    deleteNote(note);
                } else if (e.target.textContent == "untrash") {
                    untrashNote(note);
                }
            })
        })

        moreOptionDialogBoxPresent = true;

        // if user clicked outside menubox remove the more-option prompt
        document.body.addEventListener('click', (e) => {
            if (!document.querySelector('.menu-container')) { return }

            let clickedOnMenu = false;
            if (e.target.classList.contains("avoid_MoreOptions")) {
                clickedOnMenu = true;
            }

            if (!clickedOnMenu) {
                document.querySelector('.menu-container').remove();
                moreOptionDialogBoxPresent = false;
            }
        })
    }

    // Make More Option Icon (Circles) Functionable
    const moreOptionCircleIcons = document.querySelectorAll('.more-icon-circles');
    moreOptionCircleIcons.forEach((circle) => {
        circle.addEventListener('click', (e) => {
            displayMoreOptionDialogBox(e)
        })
    })
}


function addLabelInNote(noteId) {

    let savedLabels = localStorage.getItem('labels') ? JSON.parse(localStorage.getItem('labels')) : [];
    const menuBox = document.body.querySelector('.menu-box');

    if (!menuBox) { return }

    menuBox.style.minWidth = "130px";
    menuBox.innerHTML = returnFullAddLabelHTML(savedLabels);
    checkAlreadyExistingNoteLabels(noteId);

    // Search Bar Text if clicked remove default value
    const searchText = document.querySelector('.menu-container .search .search-text');
    searchText.addEventListener('click', (e) => {
        const searchBar = e.currentTarget;
        if (searchBar.textContent == "Type Label...") {
            searchBar.textContent = "";
        }
    })

    // Search Bar Text on empty fill with default value
    const moreOptionDialogBox = document.querySelector('.menu-container');
    moreOptionDialogBox.addEventListener('click', (e) => {
        const clickedElementClasses = e.target.classList;
        if (clickedElementClasses.contains('search') || clickedElementClasses.contains('search-text')) { return }
        // user clicked outside searchbar - if searchText empty fill with default
        const searchBar = document.querySelector('.menu-container .search .search-text');
        if (!searchBar.textContent) { searchBar.textContent = "Type Label..."; }
    })

    // when user changes Search Bar Text
    const searchBar = document.querySelector('.search-text');
    searchBar.addEventListener('input', (e) => {

        // Get Noteid where add label is called
        let noteId = e.currentTarget;
        for (let i = 0; i < 6; i++) {
            noteId = noteId.parentElement;
        }
        noteId = noteId.id;

        // if search text is empty
        if (e.currentTarget.textContent === "") {
            const labelHTML = returnAllLabelOptionsHtml(savedLabels);
            document.querySelector('.search-result').innerHTML = labelHTML;
            checkAlreadyExistingNoteLabels(noteId);
            return;
        }

        // if search text not empty
        const searchFilteredLabels = searchNoteLabel(e.currentTarget.textContent.trim());
        const labelHTML = returnAllLabelOptionsHtml(searchFilteredLabels);
        document.querySelector('.search-result').innerHTML = labelHTML;
        checkAlreadyExistingNoteLabels(noteId);
        createNoteLabel(noteId, e.currentTarget.textContent.trim());
    });
}

function deleteNote(noteId) {
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

    let allNotes = JSON.parse(localStorage.getItem('notes'));
    if (!allNotes) { return }

    let noteToEdit = "";
    for (let i = 0; i < allNotes.length; i++) {
        if (allNotes[i].id == noteId) {
            noteToEdit = allNotes[i];
            break;
        }
    }

    const updateNote = new Note(noteToEdit.title, noteToEdit.content, noteToEdit.labels);
    updateNote.id = noteId;
    updateNote.isTrash = noteToEdit.isTrash;

    let deleteForever = false;
    if (updateNote.isTrash) { deleteForever = true }

    if (!deleteForever) {
        updateNote.trash();
        displayAllNotes();
        makeMoreOptionsIconFunction();
    } else {

        promptConfirmationBox("Do you want to delete this note forever?");
        document.querySelector('.menu-container').remove();
        // User clicked YES in confirmation
        document.querySelector('.prompt .red').addEventListener('click', () => {
            document.querySelector('.prompt').remove();
            updateNote.trash();
            allNotes = JSON.parse(localStorage.getItem('notes'));
            displayAllNotes(allNotes.filter((element) => element.isTrash == true));
            makeMoreOptionsIconFunction('', ["untrash", "delete note"])

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

    }
}

function untrashNote(noteId) {
    let allNotes = JSON.parse(localStorage.getItem('notes'));
    if (!allNotes) { return }

    let noteToEdit = "";
    for (let i = 0; i < allNotes.length; i++) {
        if (allNotes[i].id == noteId) {
            noteToEdit = allNotes[i];
            break;
        }
    }

    const updateNote = new Note(noteToEdit.title, noteToEdit.content, noteToEdit.labels);
    updateNote.id = noteId;
    updateNote.untrash();
    updateNote.save();

    allNotes = JSON.parse(localStorage.getItem('notes'));
    displayAllNotes(allNotes.filter((element) => element.isTrash == true));
    makeMoreOptionsIconFunction('', ["untrash", "delete note"])
}

export { updateNote, displayAllNotes, makeMoreOptionsIconFunction, addLabelInNote };