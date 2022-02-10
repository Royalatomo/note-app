import { removeLabelsFromNav, addLabelsToNav } from "./helper/navigation/helperFunctions.js";


const navMenuContainer = document.querySelector(".hamburger-menu");
const navOpenIcon = document.querySelector(".hamburger-icon");
const navCloseIcon = document.querySelector(".hamburger-menu-close");
const notesConatiner = document.querySelector(".notes-area");

// while navMenuContainer sliding to left (transition) hide it when sliding complete unhide it 
window.onload = () => {
    navMenuContainer.style.display = "block";
};

navOpenIcon.addEventListener("click", () => {
    navMenuContainer.classList.add("show-menu");

    // after navMenuContainer sliding transition done then hide the notesContaining div
    setTimeout(() => {
        if (notesConatiner) {
            notesConatiner.style.display = "none";
        }
    }, 300);
});

navCloseIcon.addEventListener("click", () => {
    navMenuContainer.classList.remove("show-menu");

    // unhide the notesContaining div
    if (notesConatiner) {
        notesConatiner.style.display = "block";
    }
});

removeLabelsFromNav();
addLabelsToNav();