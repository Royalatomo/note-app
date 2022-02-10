// Remove Labels From Navigation Menu
function unPopulateLabel() {
    // Get All Labels
    const labels = document.querySelectorAll(".label-list");
    if (labels) {
        // Remove All Labels
        labels.forEach((item) => {
            item.remove();
        });
    }
}


// Add Labels To Navigation Menu
function populateLabel() {
    // First remove all labels (if present)
    unPopulateLabel();

    // Get All Labels
    const labels = localStorage.getItem("labels")?JSON.parse(localStorage.getItem("labels")):'';

    // Append all labels to the main navigation
    if (labels) {
        labels.forEach((label) => {
            // create main "li" tag - Main Parent
            const labelElementList = document.createElement("li");
            labelElementList.className = "link label-list";

            // create link "a" tag
            const labelElementLink = document.createElement("a");
            labelElementLink.setAttribute("href", "#");

            // create tag for icon
            const labelElementLogo = document.createElement("i");
            labelElementLogo.className = "icon fas fa-tag";

            // create text with label
            const labelElementText = document.createTextNode(` ${label}`);

            // Append text and icon in "a" (link tag)
            labelElementLink.appendChild(labelElementLogo);
            labelElementLink.appendChild(labelElementText);

            // Append link "a" tag to main "li" tag
            labelElementList.appendChild(labelElementLink);

            // Append main link tag to navigation menu
            document
                .querySelector(".hamburger-menu-links")
                .insertBefore(
                    labelElementList,
                    document.querySelector(".edit-label")
                );
        });
    }
}


// Hamburger Menu
const hamburgerMenu = document.querySelector(".hamburger-menu");
// Hamburger Icon
const hamburgerIcon = document.querySelector(".hamburger-icon");
// Hamburger Close Button
const hamburgerCloseIcon = document.querySelector(".hamburger-menu-close");



// Hamburger Menu starting transition hide
window.onload = () => {
    hamburgerMenu.style.display = "block";
};

// Hamburger Menu Icon (Clicked) - hide notes-area (to fit menu nicely)
hamburgerIcon.addEventListener("click", () => {
    // Notes Holding Div
    const noteArea = document.querySelector(".notes-area");

    hamburgerMenu.classList.add("show-menu");
    // Wait for the transition (hamburger menu)
    setTimeout(() => {
        if (noteArea) {
            noteArea.style.display = "none";
        }
    }, 300);
});

// Hamburger Menu Close Icon (Clicked) - show notes-area
hamburgerCloseIcon.addEventListener("click", () => {
    // Notes Holding Div
    const noteArea = document.querySelector(".notes-area");

    hamburgerMenu.classList.remove("show-menu");
    if (noteArea) {
        noteArea.style.display = "block";
    }
});


populateLabel();
