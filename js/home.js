// Check if Note's label is clicked
function checkLabelClicked(list) {
    let status = false;

    // filter these classes
    const classNames = ["note-labels", "label", "close-button"];
    for (let i = 0; i < classNames.length; i++) {
        if (list.contains(classNames[i])) {
            status = true;
            break;
        }
    }
    return status;
}

// Return's HTML for individual note viewing
function returnNoteViewHTML(note) {
    // Return's HTML for "labels section"
    function getLabels() {
        let fullLabelHTML = "";
        labels.forEach((label) => {
            fullLabelHTML += `<span class="label"><p>${label.textContent.trim()}</p><span class="close-button"><i class="fas fa-times"></i></span></span>`;
        });
        return fullLabelHTML;
    }

    // Get Selected Note Title
    const title = note.querySelector(".title").textContent;
    // Get Selected Note Content
    const content = note.querySelector(".text").textContent; // Get Selected Note Content
    // Get Selected Note Labels
    const labels = Array.from(note.querySelectorAll(".label"));

    // Main div - Note container
    const section = document.createElement("section");
    section.classList.add("note-view-area");

    // Note's div HTML
    const html = `
    <div class="note">
            <div class="note-head">
                <h4 class="title">${title.trim()}</h4>
                <span class="more-icon"><i class="fas fa-ellipsis-v"></i></span>
            </div>
            <div class="note-body">
                <p class="text">${content.trim()}</p>
                ${
                    // if labels present in note
                    labels
                        ? `<div class="note-labels">${getLabels()}</div>`
                        : ""
                }
            </div>
        </div>
    `;

    // Add note into Note Container (Main Div)
    section.innerHTML = html;
    return section;
}

// Get all notes
let notes = document.querySelector(".notes-area");

if (notes) {
    notes = notes.querySelectorAll(".note");
    if (notes) {
        // Make every note clickable for viewing
        notes.forEach((note) => {
            note.addEventListener("click", (e) => {
                // Get the exact clicked element
                const labelClicked = checkLabelClicked(
                    e.target.parentElement.classList
                );

                // If the clicked element is not label
                if (!labelClicked) {
                    // Show clicked note
                    document.body.appendChild(
                        returnNoteViewHTML(e.currentTarget)
                    );

                    // Freeze scrolling
                    document.querySelector("body").style.width = "100vw";
                    document.querySelector("body").style.height = "100vh";
                    document.querySelector("body").style.overflow = "hidden";

                    // If clicked at note viewing Div
                    document
                        .querySelector(".note-view-area")
                        .addEventListener("click", (e) => {
                            // If note clicked on the note (background clicked)
                            if (e.target.classList.contains("note-view-area")) {
                                // remove note viewer
                                e.target.remove();

                                // Unfreeze scrolling
                                document.querySelector("body").style.width =
                                    "fit-content";
                                document.querySelector("body").style.height =
                                    "fit-content";
                                document.querySelector("body").style.overflow =
                                    "visible";
                            }
                        });
                }
            });
        });
    }
}

// const notesLabels = document.querySelectorAll(
//     ".note-body .label .close-button"
// );

// notesLabels.forEach((label) => {
//     label.addEventListener("click", (e) => {
//         e.currentTarget.parentElement.remove();
//     });
// });
