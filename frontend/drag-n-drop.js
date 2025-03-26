// const DROP_BOUNDS = 15; // px amount to start dropping

let isMoving = false;

// Cleanup after dragging
window.addEventListener('dragend', (event) => {
    event.target.classList.remove('opacity-50');
    isMoving = false;
});

/** 
    * Returns the index of the given column in the columns array.
    * @param {HTMLElement} column - The column to get the index of.
    * @returns {number} - The index of the column.
*/
function getColumnIndex(column) {
    return Array.from(dropColumns).indexOf(column);
}

/**
    * Removes card with fade-out animation.
    * @param {HTMLElement} card - The card that should be removed.
*/
function removeWithAnimation(card) {
    card.classList.add('opacity-0');
    setTimeout(() => {
        card.remove();
    }, 500);
}

/**
    * Moves card above another card in given column, or just adds to the bottom of this column.
    * @param {HTMLElement} movingCard - The card that is moving.
    * @param {HTMLElement} column - The column where the moving card is placed
    * @param {HTMLElement|null} [belowCard=null] - The card which should be below the one that is moving.
*/
function moveCardAbove(movingCard, column, belowCard=null) {
    isMoving = true;
    if (!belowCard) {
        column.appendChild(movingCard);
    } else {
        column.insertBefore(movingCard, belowCard);
    }
}

/**
    * Returns the card in the column below the given y position
    * @param {HTMLElement} column - The column element.
    * @param {number} yPos - The y position of the card.
    * @returns {HTMLElement|null} - The card element or null if not found.
*/
function getCardBelow(column, yPos) {
    const cardsInCol = column.querySelectorAll('task-card');

    let closestCard = null;
    let minOffset = Number.POSITIVE_INFINITY;

    cardsInCol.forEach((card) => {
        const { top, height } = card.getBoundingClientRect();
        const cardOffset = top - yPos + height / 2;

        if (cardOffset > 0 && cardOffset < minOffset) {
            closestCard = card;
            minOffset = cardOffset;
        }
    });

    return closestCard;
}

/**
    *
    * Handles dragover event on a column when a card is being dragged over it.
    * @param {DragEvent} event - The dragover DragEvent object.
*/
export default function handleColumnDragOver(event) {
    event.preventDefault();

    const movingCard = document.querySelector('task-card[is-dragging=true]');
    const cardBelow = getCardBelow(this, event.clientY);
    moveCardAbove(movingCard, this, cardBelow);
}

/**
    *
    * Handles dragover event on a card in column when a card is being dragged over it.
    * @param {DragEvent} event - The dragover DragEvent object.
*/
function handleCardDragOver(event) {
    event.preventDefault();

    const movingCard = document.querySelector('div[is-dragging=true]');
    const column = this.parentNode;
    const cardBelow = getCardBelow(column, event.clientY);
    moveCardAbove(movingCard, column, cardBelow);
}


const main = document.querySelector('main');
const dropColumns = main.querySelector('section').querySelectorAll('div.h-full');

/** @type {Array.<HTMLElement>} */
if (typeof(draggables) === 'undefined') {
    var draggables = new Array();
}

dropColumns.forEach((column) => column.addEventListener('dragover', handleColumnDragOver));

