import { getCardBelow, moveCardAbove } from "../drag-n-drop.js";
import { loadTemplate, loadShadowDomStyles } from "./loaders.js";

class TaskColumn extends HTMLElement {
    async connectedCallback() {
        if (this.shadowRoot) return;

        this.root = this.attachShadow({ mode: 'open' });
        this.columnElement = document.createElement('div');
        this.template = document.createElement('div');
        this.cardsContainer = document.createElement('div');
        this.cardsContainer.setAttribute('slot', 'cards');
        this.appendChild(this.cardsContainer);
        this.root.appendChild(this.columnElement);
        this.root.appendChild(this.template);

        const [template, stylesheet] = await Promise.all([
            this.loadTemplate(),
            this.loadStyles()
        ]);

        this.template = template;
        this.root.adoptedStyleSheets = [stylesheet];
        this.drawColumn();
        this.registerEventListeners();
    }

    async loadTemplate() {
        const template = loadTemplate('templates/task-column.html', '#task-column-template');
        return template;
    }

    async loadStyles() {
        const sheet = await loadShadowDomStyles();
        return sheet;
    }

    registerEventListeners() {
        this.registerDragEventListeners();
        this.registerTouchEventListeners();
    }

    registerDragEventListeners() {
        this.addEventListener('dragover', (event) => {
            event.preventDefault();

            const movingCard = document.querySelector('task-card[is-dragging=true]');
            if (!movingCard) {
                return;
            }
            console.log(`X: ${event.clientX}, Y: ${event.clientY}`);
            const cardBelow = getCardBelow(this, event.clientY);
            moveCardAbove(movingCard, this.cardsContainer, cardBelow);
        });
    }

    registerTouchEventListeners() {
        this.addEventListener('touchmove', (e) => {
            const movingCard = document.querySelector('task-card[is-dragging=true]');
            if (!movingCard) {
                return;
            }
            e.preventDefault();

            const xPos = e.touches[0].clientX, yPos = e.touches[0].clientY;;
            const { right, left } = this.getBoundingClientRect();

            let column;
            if (xPos > left && xPos < right) {
                column = this;
            } else {
                const taskColumns = document.querySelectorAll('task-column');
                for (let i = 0; i < taskColumns.length; i++) {
                    const { right: colRight, left: colLeft } = taskColumns[i].getBoundingClientRect();
                    if (xPos > colLeft && xPos < colRight) {
                        column = taskColumns[i];
                        break;
                    }
                }
            }

            const cardBelow = getCardBelow(column, yPos);
            moveCardAbove(movingCard, column.cardsContainer, cardBelow);

        });
    }

    drawColumn() {
        if (!this.template) return;

        const clone = this.template.content.cloneNode(true);
        this.columnElement.innerHTML = '';
        this.columnElement.appendChild(clone);
    }

}

if (!customElements.get('task-column')) {
    customElements.define('task-column', TaskColumn);
}


