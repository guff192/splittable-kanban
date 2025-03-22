/**
    *
    * Handles dragover event on a column when a card is being dragged over it
    * @param {DragEvent} event - The dragover DragEvent object.
*/
function handleColumnDragOver(event) {
    event.preventDefault();

    const movingCard = document.querySelector("div[is-dragging=true]");
    console.log(movingCard);
    console.log(this);
    console.log(`clientY: ${event.clientY}`);
    console.log(event.target.offsetParent);

    const cardBelow = getCardBelow(event.target, event.clientY);
    if (!cardBelow) {
        this.appendChild(movingCard);
    } else {
        this.insertBefore(movingCard, cardBelow);
    }
}

/**
    * Returns the card in the column below the given y position
    * @param {HTMLElement} column - The column element.
    * @param {number} yPos - The y position of the card.
    * @returns {HTMLElement|null} - The card element or null if not found.
*/
function getCardBelow(column, yPos) {
    const cardsInCol = column.querySelectorAll("div.card");

    let closestCard = null;
    let minOffset = Number.NEGATIVE_INFINITY;

    cardsInCol.forEach((card) => {
        const { top } = card.getBoundingClientRect();
        const cardOffset = yPos - top;

        if (cardOffset < 0 && cardOffset > minOffset) {
            closestCard = card;
            minOffset = cardOffset;
        }
    });

    return closestCard;
}


const dropColumns = document.querySelector("main").querySelector("section").querySelectorAll("div.h-full");
const main = document.querySelector('main');
const draggable = document.querySelector('div[draggable=true]');
const card = draggable.parentNode;
const textResult = document.querySelector('#text-result');

dropColumns.forEach((column) => column.addEventListener("dragover", handleColumnDragOver));

/*
main.addEventListener("dragover", (e) => {
    const offsetX = e.clientX - draggable.offsetWidth/2 - main.offsetLeft - draggable.offsetLeft + main.scrollLeft - card.offsetLeft;
    const offsetY = e.clientY + draggable.offsetHeight/2 - main.offsetTop - draggable.offsetTop + main.scrollTop - card.offsetHeight/2;
    textResult.innerHTML = (`Draggable moved from start position by: <br>
        X: ${offsetX}px <br>
        Y: ${offsetY}px`);
    draggable.parentNode.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
});
*/

draggable.addEventListener("dragstart", (e) => {
    // Set the drag image to the transparent image (this should be Card Component logic)
    const transparentImage = new Image();
    e.dataTransfer.setDragImage(transparentImage, 0, 0);

    // Change border color of draggable card (this should be Card Component logic)
    e.target.parentNode.classList.remove("border-teal"); 
    e.target.parentNode.classList.add("border-yellow"); 

    // Mark the dragging card with attribute (this should be View logic)
    e.target.parentNode.setAttribute("is-dragging", "true");
});

draggable.addEventListener("dragend", (e) => {
    // Return initial border color of draggable card (this should be Card Component logic)
    e.target.parentNode.classList.remove("border-yellow"); 
    e.target.parentNode.classList.add("border-teal"); 

    // Unmark the dragging card with attribute (this should be View logic)
    e.target.parentNode.removeAttribute("is-dragging");
});

