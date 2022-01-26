const notesLabels = document.querySelectorAll('.note-body .label .close-button')

notesLabels.forEach((label) => {
    label.addEventListener('click', (e) => {
        e.currentTarget.parentElement.remove();
    })
})