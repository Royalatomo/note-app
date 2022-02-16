import { makeRemoveLabel } from "../home/helperFunctions.js";
import { Note } from "../classes.js";
import {addLabel} from "./helperFunctions.js"

let labels = localStorage.getItem('labels') ? JSON.parse(localStorage.getItem('labels')) : [];

function returnLabelHTML(labels) {
    let html = '';
    labels.forEach((label) => {
        const container = document.createElement('div');
        container.setAttribute('class', 'avoid_Noteview avoid_MoreOptions label')
        container.innerHTML += `<input class="avoid_Noteview avoid_MoreOptions" type="checkbox" name="" value=""/><label class="avoid_Noteview avoid_MoreOptions"></label>`;
        container.querySelector('label').innerText = label;
        html += container.outerHTML;
    })
    return html;
}

function returnFullAddLabelHTML(labels) {
    let html = '<div class="avoid_Noteview avoid_MoreOptions search"><i class="fas fa-search avoid_MoreOptions"></i><div contenteditable="true" class="avoid_Noteview avoid_MoreOptions search-text">Type Label...</div></div><div class="avoid_Noteview avoid_MoreOptions search-result">';
    html += returnLabelHTML(labels);
    html += '</div>';
    return html
}

function showAlreadyAddedLabel(noteId) {
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

function searchLabel(label) {
    let matchedLabel = [];
    const allLabels = localStorage.getItem('labels') ? JSON.parse(localStorage.getItem('labels')) : [];
    if (!allLabels) {
        return [];
    }
    if(!label){
        return allLabels;
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

function createLabel(noteId, label) {

    function crateLabelHTML() {

        const htmlHolder = document.createElement('span');
        htmlHolder.innerHTML = `<i class="fas fa-plus-circle avoid_Noteview avoid_MoreOptions create-label-icon" aria-hidden="true"></i><p class="avoid_Noteview avoid_MoreOptions create-label-text">Create - <span class="avoid_Noteview avoid_MoreOptions create-label-highlighted"></span></p>`;
        htmlHolder.querySelector('.create-label-highlighted').innerText = label;

        if (document.querySelector('.menu-container .create-label-container')) {
            document.querySelector('.menu-container .create-label-container').innerHTML = htmlHolder.innerHTML;
        } else {
            const createLabel = document.createElement('div');
            createLabel.className = "avoid_Noteview avoid_MoreOptions create-label-container";
            createLabel.innerHTML = htmlHolder.innerHTML;
            document.querySelector('.menu-container').appendChild(createLabel);
            document.querySelector('.create-label-container').addEventListener('click', () => {
                const label = document.querySelector('.create-label-highlighted').innerText;
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

export {returnLabelHTML, returnFullAddLabelHTML, showAlreadyAddedLabel, searchLabel, createLabel};