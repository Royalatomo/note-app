import { Note } from "./classes.js";
import { makeMoreOptionsIconFunction } from "./note/noteHF.js";

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
            element.innerHTML = `<p></p><span class="avoid_Noteview close-button"><i class="fas fa-times"></i></span>`;
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
    noteViewArea.classList.add("back-screen");

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

            if (!viewingNoteInputClass.contains('title') && !viewingNoteInputClass.contains('content')) { return }

            // while saving convert "Title/Content" html tags to text format
            const noteTitle = convertNoteContentHtmlToText(viewingNoteContainer.querySelector('.title').innerHTML);
            const noteContent = convertNoteContentHtmlToText(viewingNoteContainer.querySelector('.content').innerHTML);
            const noteLabels = Array.from(viewingNoteContainer.querySelectorAll('.label'));

            const note = new Note(noteTitle, noteContent, noteLabels.map((label) => { return label.innerText }));
            note.id = noteID;
            note.save();
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
            <p class="msg">are you sure you want to remove <span>${tag}</span> tag?</p>
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
        newNote.save();

        // when note is not in view mode and label is removed it is refressed and
        // a new instance is made so make that instance's button functionable 
        if (!noteId) { makeRemoveLabel() }
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


export { returnNoteViewHTML, makeNotesViewable, makeRemoveLabel }