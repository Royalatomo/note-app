import { Note } from "./classes.js";
import { makeMoreOptionsIconFunction } from "./note/noteHF.js";
import { showLabelFilteredNotes } from "../label.js"

function fromIdFindNote(noteId) {
    const allStoredNotes = localStorage.getItem('notes');
    let note = JSON.parse(allStoredNotes);
    if (!note) { return false; }
    note = note.filter((note) => note.id == noteId)[0];
    return note;
}

// NewLine Bug Fix: Takes innerHtml(span, br) and converts it to text with newline (\n)
function convertNoteContentHtmlToText(html) {

    function refactorGivenHtml() {
        let refactoredHtml = html;
        // replace these keywords from NoteContent innnerHTML
        const replaceKeywords = { '<div><span>': '<span>', '</span></div>': '</span>', '<div>': '<span>', '</div>': '</span>', '<span><br></span>': '<br>' }

        Object.keys(replaceKeywords).forEach((tag) => {
            refactoredHtml = refactoredHtml.replaceAll(tag, replaceKeywords[tag])
        })

        // check if any text is without tag if so then convert it to tagged text
        const checkingElement = document.createElement('div');
        checkingElement.innerHTML = refactoredHtml;
        // remove tagged text and element
        checkingElement.querySelectorAll('span').forEach(span => span.remove())
        checkingElement.querySelectorAll('br').forEach(span => span.remove())
        // after removing tagged text if still something left (non-tagged text)
        if (checkingElement.innerHTML) {
            refactoredHtml = refactoredHtml.replaceAll(checkingElement.innerHTML, `<span>${checkingElement.innerHTML}</span>`)
        }

        return refactoredHtml;
    }

    const spanTagText = [];
    html = refactorGivenHtml();
    const htmlHolder = document.createElement('span');
    htmlHolder.innerHTML = html;
    htmlHolder.querySelectorAll('span').forEach((span) => {
        // if span tag contain more span tag inside
        const spanPresent = span.querySelectorAll('span');
        if (spanPresent) {
            // remove them (because they are duplicate tags)
            spanPresent.forEach((span) => {
                span.remove()
            })
        }
        spanTagText.push(span.innerText);
    })

    // if no text present in html
    if (spanTagText.length === 0) { return "" }

    let convertedToText = ""
    // after every <span> text there is a <br> tag (means new line)
    for (let i = 0; i < spanTagText.length; i++) {
        // save text
        convertedToText += spanTagText[i];
        if (i !== spanTagText.length - 1) {
            // save new line
            convertedToText += '\n';
        }
    }

    return convertedToText;
}


function returnNoteViewHTML(note) {

    function getCombinedLabelsHTML(labelsList) {
        let allLabelsHTML = "";
        labelsList.forEach((label) => {
            const element = document.createElement('span');
            element.setAttribute('class', 'avoid_Noteview label');
            element.innerHTML = `<p class="label-text"></p><span class="avoid_Noteview close-button"><i class="fas fa-times"></i></span>`;
            element.querySelector('p').innerText = label.innerText.trim();
            allLabelsHTML += element.outerHTML;
        });

        return allLabelsHTML;
    }

    const noteTitle = note.querySelector(".title").innerHTML;
    const noteContent = note.querySelector(".content").innerHTML;
    const noteLabels = Array.from(note.querySelectorAll(".note-labels .label"));


    const noteViewArea = document.createElement("section");
    noteViewArea.classList.add("note-view-area");

    const noteElement = document.createElement('div');
    noteElement.setAttribute('class', 'removeMe')
    noteElement.setAttribute('id', note.id);
    noteElement.setAttribute('class', "note");

    noteElement.innerHTML = `
    <div class="note-head">
        <h4 contenteditable="true" class="title"></h4>
        <span class="more-icon"><span class="avoid_MoreOptions more-icon-circles"><i class="avoid_MoreOptions fas fa-circle"></i><i class="avoid_MoreOptions fas fa-circle"></i><i class="avoid_MoreOptions fas fa-circle"></i></span></span>
    </div>
    <div class="note-body">
        <p contenteditable="true" class="content"></p>
        ${noteLabels ? `<div class="note-labels">${getCombinedLabelsHTML(noteLabels)}</div>` : ""}
    </div>`;

    noteElement.querySelector('.content').innerHTML = noteContent;
    noteElement.querySelector('.title').innerHTML = noteTitle;

    noteViewArea.innerHTML = noteElement.outerHTML;
    return noteViewArea;
}


// check if currently any note is viewing
let isNoteViewing = false;

// when note is clicked show it in seprate window
function makeNotesViewable() {

    function onEditSaveNote(noteID) {
        const viewingNoteContainer = document.querySelector('.note-view-area');
        if (!viewingNoteContainer) { return }

        // whenever note is editied/changed by user save it 
        viewingNoteContainer.addEventListener('input', (e) => {
            const viewingNoteInputField = e.target;
            const viewingNoteInputClass = viewingNoteInputField.classList;
            const noteFromStorage = fromIdFindNote(noteID)

            if (!viewingNoteInputClass.contains('title') && !viewingNoteInputClass.contains('content')) { return }

            // while saving convert "Title/Content" html tags to text format
            const noteTitle = convertNoteContentHtmlToText(viewingNoteContainer.querySelector('.title').innerHTML);
            const noteContent = convertNoteContentHtmlToText(viewingNoteContainer.querySelector('.content').innerHTML);
            const noteLabels = Array.from(viewingNoteContainer.querySelectorAll('.label'));

            const updateNote = new Note(noteTitle, noteContent, noteLabels.map((label) => { return label.innerText }));
            updateNote.id = noteID;
            updateNote.isTrash = noteFromStorage.isTrash;
            updateNote.isArchive = noteFromStorage.isArchive;
            updateNote.save();
        })
    }

    const allNotesElement = document.querySelectorAll(".notes-area .note");

    if (!allNotesElement) { return }

    allNotesElement.forEach((noteElement) => {
        noteElement.addEventListener("click", (e) => {
            const clickedElementParent = e.target.parentElement;
            if (!clickedElementParent) { return }
            const avoidNoteViewing = clickedElementParent.classList.contains("avoid_Noteview");
            if (avoidNoteViewing || isNoteViewing) { return }

            const clickedNote = e.currentTarget;
            document.body.appendChild(returnNoteViewHTML(clickedNote));
            // make note view label's remove button functionable
            makeRemoveLabel(clickedNote.id)
            // make note view more-option button functionable
            makeMoreOptionsIconFunction(clickedNote.id);

            const bodyStyle = document.querySelector("body").style;
            // freeze scrolling
            bodyStyle.width = "100vw";
            bodyStyle.height = "100vh";
            bodyStyle.overflow = "hidden";

            onEditSaveNote(clickedNote.id);
            isNoteViewing = true;

            // onclicking outside note-viewing-area (blackish part)
            document.querySelector(".note-view-area").addEventListener("click", (e) => {
                if (!e.target.classList.contains("note-view-area")) { return }

                e.currentTarget.remove();

                // unfreeze scrolling
                bodyStyle.width = "fit-content";
                bodyStyle.height = "fit-content";
                bodyStyle.overflow = "visible";
                isNoteViewing = false;

                // if note is removed from "label.html" page - render all labeled pages again
                let pageHtmlName = location.href.split('?')[0].split('/');
                pageHtmlName = pageHtmlName[pageHtmlName.length - 1];
                if (pageHtmlName === "label.html") {
                    showLabelFilteredNotes();
                    return;
                }

                // After removing note's label it is refressed and new note instance is made: make new note's buttons functionable
                makeRemoveLabel();
                makeMoreOptionsIconFunction();
            });
        });
    });
}


// Function for deleting labels from the note
function makeRemoveLabel(noteId = "") {

    // Prompt for confiming user deletion
    function promptConfirmationBox(tag) {

        const existingPromptBox = document.body.querySelector('.prompt');
        if (existingPromptBox) { existingPromptBox.remove(); }

        // main prompt div
        const promptBox = document.createElement('div');
        promptBox.classList.add('prompt');

        promptBox.innerHTML =
            `<div class="msg-box">
            <p class="msg">are you sure you want to remove <span class="label-name"></span> tag?</p>
            <div class="msg-button">
                <button class="red">Yes</button>
                <button class="green">No</button>
            </div>
        </div>`;
        promptBox.querySelector('.label-name').innerText = tag;

        // add promptBox in body
        document.body.appendChild(promptBox);

        // freeze scrolling
        const bodyStyle = document.body.style;
        bodyStyle.height = "100vh";
        bodyStyle.width = "100vw";
        bodyStyle.overflow = "hidden";
    }

    function removeLabelFromNote(currentLabel, note) {
        // remove label (frontEnd)
        currentLabel.remove();

        let newNote = "";
        // id given means the note is clicked for viewing
        if (noteId) {
            // while saving convert "Title/Content" html tags to text format
            const noteTitle = convertNoteContentHtmlToText(document.querySelector('.note-view-area .title').innerHTML);
            const noteContent = convertNoteContentHtmlToText(document.querySelector('.note-view-area .content').innerHTML);
            const noteLabels = Array.from(document.querySelectorAll('.note-view-area .note-labels .label'));
            newNote = new Note(noteTitle, noteContent, noteLabels.map((label) => { return label.textContent }));

        } else {
            // id means the note is not opened seprately
            const noteTitle = convertNoteContentHtmlToText(note.querySelector('.title').innerHTML);
            const noteContent = convertNoteContentHtmlToText(note.querySelector('.content').innerHTML);
            const noteLabels = Array.from(note.querySelectorAll('.note-labels .label'));
            currentLabel.remove();
            newNote = new Note(noteTitle, noteContent, noteLabels.map((label) => { return label.textContent }));
        }

        newNote.id = noteId ? noteId : note.id;
        const noteFromStorage = fromIdFindNote(noteId ? noteId : note.id);
        newNote.isTrash = noteFromStorage.isTrash;
        newNote.isArchive = noteFromStorage.isArchive;
        newNote.save();

        // when note is not in view mode and label is removed it is refressed and
        // a new instance is made so make that instance's button functionable 
        if (!noteId) {
            // if note is removed from "label.html" page - render all labeled pages again
            let pageHtmlName = location.href.split('?')[0].split('/');
            pageHtmlName = pageHtmlName[pageHtmlName.length - 1];
            if (pageHtmlName === "label.html") {
                showLabelFilteredNotes();
                return;
            }

            makeRemoveLabel()
        }
    }


    // Get all label's remove buttons
    const noteLabelRmButton = document.querySelectorAll(
        ".note-body .label .close-button"
    );

    noteLabelRmButton.forEach((label) => {
        label.addEventListener("click", (e) => {

            const currentLabelRmButton = e.target.parentElement.parentElement;

            // Note in which that label is (id = noteview)
            const clickedLabelNote = noteId ? document.getElementById(noteId) : currentLabelRmButton.parentElement.parentElement.parentElement;
            // Get User Confirmation
            promptConfirmationBox(currentLabelRmButton.textContent);

            // User clicked YES in confirmation
            document.querySelector('.prompt .red').addEventListener('click', () => {
                document.querySelector('.prompt').remove();
                removeLabelFromNote(currentLabelRmButton, clickedLabelNote);

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
        });
    });
}


function getSetNoteViewing(set = true) {
    if (set) { return isNoteViewing; }
    isNoteViewing = set;
}


// function for adding new note
function createNote() {
    // when user types/edits note content - note will be updated
    function onEditSaveNote(noteID) {
        // user must be editing on noteView-mode
        const viewingNoteContainer = document.querySelector('.note-view-area');
        if (!viewingNoteContainer) { return }

        // whenever note is editied/changed by user save it 
        viewingNoteContainer.addEventListener('input', (e) => {
            const viewingNoteInputField = e.target;
            const viewingNoteInputClass = viewingNoteInputField.classList;
            const noteFromStorage = fromIdFindNote(noteID);

            // save only when user is editing "Title" or "Content" of the note
            if (!viewingNoteInputClass.contains('title') && !viewingNoteInputClass.contains('content')) { return }

            // while saving convert "Title/Content" html tags to text format
            const noteTitle = convertNoteContentHtmlToText(viewingNoteContainer.querySelector('.title').innerHTML);
            const noteContent = convertNoteContentHtmlToText(viewingNoteContainer.querySelector('.content').innerHTML);
            const noteLabels = Array.from(viewingNoteContainer.querySelectorAll('.label'));

            // save the changes
            const note = new Note(noteTitle, noteContent, noteLabels.map((label) => { return label.innerText }));
            note.id = noteID;
            note.save();
        })
    }

    // create-note button - element
    const createNoteButton = document.createElement('div');
    createNoteButton.setAttribute('class', 'add-note-container')
    createNoteButton.innerHTML = '<i class="fas fa-plus-circle add-note"></i>';

    document.body.appendChild(createNoteButton);
    const createNoteButtonElement = document.querySelector('.add-note-container');
    createNoteButtonElement.addEventListener('click', () => {
        // Save note with default values
        const newNote = new Note('New Note Title', 'New Note Content', []);
        newNote.save();
        makeNotesViewable();
        makeMoreOptionsIconFunction();

        // show pop-up to edit newly created note values
        const newNoteElement = document.getElementById(newNote.id);
        const noteViewHtml = returnNoteViewHTML(newNoteElement);
        document.body.appendChild(noteViewHtml);
        isNoteViewing = true;

        // freeze scrolling
        const bodyStyle = document.querySelector("body").style;
        bodyStyle.width = "100vw";
        bodyStyle.height = "100vh";
        bodyStyle.overflow = "hidden";

        // functions for note-view pop-up
        onEditSaveNote(newNote.id);
        makeMoreOptionsIconFunction(newNote.id);

        // remove default text on click
        const noteView = document.querySelector('.note-view-area .note');
        noteView.addEventListener('click', (e) => {
            const text = e.target.textContent;
            if (text == newNote.title || text == newNote.content) {
                e.target.textContent = "";
            }
        })

        // remove note-view if user clicked outside the edit-note
        const noteviewContainer = document.querySelector(".note-view-area");
        noteviewContainer.addEventListener("click", (e) => {
            if (!e.target.classList.contains("note-view-area")) { return }
            e.currentTarget.remove();

            // unfreeze scrolling
            bodyStyle.width = "fit-content";
            bodyStyle.height = "fit-content";
            bodyStyle.overflow = "visible";
            isNoteViewing = false;

            // If note edited then note is refreshed - so do  again
            makeRemoveLabel();
            makeMoreOptionsIconFunction();
        });
    })
}


export { returnNoteViewHTML, makeNotesViewable, makeRemoveLabel, getSetNoteViewing, createNote, fromIdFindNote }