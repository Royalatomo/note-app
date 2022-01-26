window.onload = () => {
    hamburgerMenu.style.display = "block";
};

function unPopulateLabel() {
    const labels = document.querySelectorAll(".label-list");
    if (labels.length > 0) {
        labels.forEach((item) => {
            item.remove();
        });
    }
}

function populateLabel() {
    unPopulateLabel();

    const labels = JSON.parse(localStorage.getItem("labels"));

    if (labels.length > 0) {
        labels.forEach((label) => {
            const labelElementList = document.createElement("li");
            labelElementList.className = "link label-list";

            const labelElementLink = document.createElement("a");
            labelElementLink.setAttribute("href", "#");

            const labelElementLogo = document.createElement("i");
            labelElementLogo.className = "icon fas fa-tag";

            const labelElementText = document.createTextNode(` ${label}`);

            labelElementLink.appendChild(labelElementLogo);
            labelElementLink.appendChild(labelElementText);

            labelElementList.appendChild(labelElementLink);

            document
                .querySelector(".hamburger-menu-links")
                .insertBefore(
                    labelElementList,
                    document.querySelector(".edit-label")
                );
        });
    }
}

const hamburgerIcon = document.querySelector(".hamburger-icon");
const hamburgerMenu = document.querySelector(".hamburger-menu");
const hamburgerCloseIcon = document.querySelector(".hamburger-menu-close");
const noteArea = document.querySelector(".notes-area");

hamburgerIcon.addEventListener("click", () => {
    hamburgerMenu.classList.add("show-menu");
    noteArea.style.display = "none";
});

hamburgerCloseIcon.addEventListener("click", () => {
    hamburgerMenu.classList.remove("show-menu");
    noteArea.style.display = "block";
});

localStorage.setItem(
    "labels",
    JSON.stringify(["label 1", "label 2", "label 3"])
);

populateLabel();


// const notes = [
//     {
//         id: '100',
//         title: "This is title",
//         content: "Hello I am Lorem, ipsum dolor sit amet consectetur adipisicing elit. Amet unde eligendi repellat, dolorum eaque minus maiores eveniet deserunt illum in dolorem necessitatibus similique iusto vero enim, voluptas inventore!",
//         label: "Label 1"
//     },
//     {
//         id: '101',
//         title: "This is title",
//         content: "Hello I am Lorem, ipsum dolor sit amet consectetur adipisicing elit. Amet unde eligendi repellat, dolorum eaque minus maiores eveniet deserunt illum in dolorem necessitatibus similique iusto vero enim, voluptas inventore!",
//         label: "Label 1"
//     },
//     {
//         id: '102',
//         title: "This is title",
//         content: "Hello I am Lorem, ipsum dolor sit amet consectetur adipisicing elit. Amet unde eligendi repellat, dolorum eaque minus maiores eveniet deserunt illum in dolorem necessitatibus similique iusto vero enim, voluptas inventore!",
//         label: "Label 1"
//     }
// ]