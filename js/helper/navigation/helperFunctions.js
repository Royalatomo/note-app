function removeLabelsFromNav() {
    const labelsInNav = document.querySelectorAll(".label-list");
    if (!labelsInNav) { return }

    labelsInNav.forEach((label) => {
        label.remove();
    });
}


function addLabelsToNav() {
    const getLocallySavedLabels = localStorage.getItem("labels") ? JSON.parse(localStorage.getItem("labels")) : '';
    if (!getLocallySavedLabels) { return }

    getLocallySavedLabels.forEach((label) => {

        const navLabelElement = document.createElement("li");
        navLabelElement.className = "link label-list";

        const navLabelElementLink = document.createElement("a");
        navLabelElementLink.setAttribute("href", "#");

        const navLabelElementIcon = document.createElement("i");
        navLabelElementIcon.className = "icon fas fa-tag";

        const navLabelElementText = document.createTextNode(` ${label}`);

        navLabelElementLink.appendChild(navLabelElementIcon);
        navLabelElementLink.appendChild(navLabelElementText);
        navLabelElement.appendChild(navLabelElementLink);

        const navLinksContainer = document.querySelector(".hamburger-menu-links");
        const editLabelLink = document.querySelector(".edit-label");
        navLinksContainer.insertBefore(navLabelElement, editLabelLink);
    });
}

export {removeLabelsFromNav, addLabelsToNav};