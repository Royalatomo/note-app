const notesLabels = document.querySelectorAll(
    ".note-body .label .close-button"
);

notesLabels.forEach((label) => {
    label.addEventListener("click", (e) => {
        e.currentTarget.parentElement.remove();
    });
});

function checkLabelClicked(list) {
    const classNames = ["note-labels", "label", "close-button"];
    let status = false;

    for (let i = 0; i < classNames.length; i++) {
        if (list.contains(classNames[i])) {
            status = true;
            break;
        }
    }
    return status;
}

function returnNoteViewHTML(note) {
    const title = note.querySelector(".title").textContent;
    const content = note.querySelector(".text").textContent;
    const labels = Array.from(note.querySelectorAll(".label"));

    const section = document.createElement("section");
    section.classList.add("note-view-area");

    const html = `
    <div class="note">
            <div class="note-head">
                <h4 class="title">${title.trim()}</h4>
                <span class="more-icon"><i class="fas fa-ellipsis-v"></i></span>
            </div>
            <div class="note-body">
                <p class="text">${content.trim()}</p>
                <div class="note-labels">
                    ${labels.map((label) => {
                        return `
                            <span class="label">
                                <p>${label.textContent.trim()}</p>
                                <span class="close-button"><i class="fas fa-times"></i></span>
                            </span>
                            `;
                    })}
                </div>
            </div>
        </div>
    `;

    section.innerHTML = html;
    return section;
}

const notes = document.querySelector(".notes-area").querySelectorAll(".note");

notes.forEach((note) => {
    note.addEventListener("click", (e) => {
        const labelClicked = checkLabelClicked(
            e.target.parentElement.classList
        );
        if (!labelClicked) {
            document.body.appendChild(returnNoteViewHTML(e.currentTarget));
        }
    });
});
