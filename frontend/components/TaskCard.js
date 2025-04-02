import { getNextTaskId } from "../tasks.js";
import { loadTemplate, loadShadowDomStyles } from "./loaders.js";


export class TaskCard extends HTMLElement {
    async connectedCallback() {
        if (this.shadowRoot) return;
        this.root = this.attachShadow({ mode: 'open' });
        this.cardElement = document.createElement('div');
        this.template = document.createElement('div');
        this.root.appendChild(this.cardElement);
        this.root.appendChild(this.template);

        // Load template and styles in parallel
        const [template, stylesheet] = await Promise.all([
            this.loadTemplate(),
            this.loadStyles()
        ]);

        // Inject template and styles
        this.root.adoptedStyleSheets = [stylesheet];
        this.template = template;

        this.drawCard();
        this.registerEventListeners();
    }

    async loadTemplate() {
        const template = loadTemplate('templates/task-card.html', '#task-card-template');
        return template;
    }

    async loadStyles() {
        const sheet = await loadShadowDomStyles();
        return sheet;
    }

    registerEventListeners() {
        this.registerDragEventListeners();
        this.registerSplitEventListeners();
        this.registerClickEventListeners();
        this.registerCustomEventListeners();
    }

    registerCustomEventListeners() {
        const removeEventTarget = this.root.querySelector('remove-button').parentNode;
        removeEventTarget.addEventListener('remove', () => {
            const firstConfirm = confirm('Are you sure you want to delete this task?');
            if (!firstConfirm) {
                return;
            } else {
                if (!confirm('The task will be PERMANENTLY DELETED. Are you sure you want to delete this task?')) { return; }
            }

            /** @type Array */
            const savedTasks = JSON.parse(localStorage.getItem('tasks'));
            if (!savedTasks) return;

            savedTasks.forEach((task, index) => {
                if (task['id'] === this.getAttribute('task-id')) {
                    savedTasks.splice(index, 1);
                }
            });
            localStorage.setItem('tasks', JSON.stringify(savedTasks));
            this.parentNode.removeChild(this);
        });
    }

    createSpansForSlots() {
        const slots = this.template.content.querySelectorAll('slot');
        slots.forEach((slot) => {
            const slotName = slot.getAttribute('name');
            const span = document.createElement('span');
            span.setAttribute('slot', slotName);
            span.innerText = slot.getAttribute('name')[0].toUpperCase() + slot.getAttribute('name').slice(1);
            this.appendChild(span);
        });
    }

    registerClickEventListeners() {
        // Add event listeners for click to edit
        let slotSpans = this.querySelectorAll("span[slot]");
        if (slotSpans.length === 0) {
            this.createSpansForSlots();
            slotSpans = this.querySelectorAll("span[slot]");
        }
        slotSpans.forEach((span) => {
            span.addEventListener("click", (e) => {
                if (e.detail < 2) return;

                const slotName = e.target.getAttribute("slot");
                const answer = prompt(`Enter new ${slotName}:`, e.target.innerText);
                if (answer) {
                    e.target.innerText = answer;
                }

                let savedTasks = JSON.parse(localStorage.getItem('tasks'));
                if (!savedTasks) {
                    savedTasks = [];
                }
                savedTasks.forEach((task, index) => {
                    if (task['id'] === this.getAttribute('task-id')) {
                        savedTasks.splice(index, 1);
                    }
                });
                savedTasks.push(this.toObject());
                localStorage.setItem('tasks', JSON.stringify(savedTasks));
            });
        });
    }

    registerDragEventListeners() {
        // Add event listeners for draggables
        if (typeof (draggables) === 'undefined') {
            /** @type {Array.<HTMLElement>} */
            var draggables = new Array();
        }
        const draggable = this.root.querySelector("div[draggable=true]");
        draggables.push(draggable);
        const card = draggable.parentNode;

        draggable.addEventListener("dragstart", (e) => {
            // Set the drag image to the transparent image (this should be Card Component logic)
            const transparentImage = new Image();
            e.dataTransfer.setDragImage(transparentImage, 0, 0);

            // Change border and bg colors of draggable card (this should be Card Component logic)
            card.classList.remove("border-teal");
            card.classList.add("border-yellow");
            card.classList.remove("bg-surface2");
            card.classList.add("bg-surface0");
            card.classList.add('opacity-50');

            this.setAttribute("is-dragging", "true");
        });

        draggable.addEventListener("dragend", (e) => {
            // Return initial border and bg colors of draggable card (this should be Card Component logic)
            card.classList.remove("border-yellow");
            card.classList.add("border-teal");
            card.classList.remove("bg-surface0");
            card.classList.add("bg-surface2");
            card.classList.remove('opacity-50');

            this.removeAttribute("is-dragging");
            const newColumn = this.parentNode.parentNode;
            const newColumnName = newColumn.getAttribute('name');
            this.setAttribute('column', newColumnName);
            let savedTasks = JSON.parse(localStorage.getItem('tasks'));
            savedTasks.forEach((task, index) => {
                if (task['id'] === this.getAttribute('task-id')) {
                    savedTasks.splice(index, 1);
                }
            });
            savedTasks.push(this.toObject());
            localStorage.setItem('tasks', JSON.stringify(savedTasks));
        });
    }

    registerSplitEventListeners() {
        // Add event listeners for split button
        const splitButton = this.root.querySelector("button");
        splitButton.addEventListener("click", (e) => {
            const currentCount = Number(this.querySelector("span[slot=count]").textContent);
            const answer = Number(prompt("How many parts to split from this task?", currentCount));
            if (answer === 0 || isNaN(answer)) {
                alert("Please enter a valid number next time");
                return;
            }

            // Create new card
            const column = this.parentNode;
            const columnName = column.getAttribute('name');
            const newCard = this.cloneNode(true);
            const newCardId = getNextTaskId();
            newCard.querySelector("span[slot=count]").innerText = currentCount - answer;
            newCard.setAttribute('task-id', newCardId);
            column.insertBefore(newCard, this);

            // Save changes to localStorage
            let savedTasks = JSON.parse(localStorage.getItem('tasks'));
            if (!savedTasks) {
                localStorage.setItem('tasks', JSON.stringify(new Array()));
                savedTasks = [];
            }

            // Save new task
            savedTasks.push(newCard.toObject());

            // Update count on old card
            this.querySelector("span[slot=count]").innerText = answer;
            savedTasks.filter((task) => task['id'] === this.getAttribute('task-id'))[0]['count'] = answer;

            localStorage.setItem('tasks', JSON.stringify(savedTasks));
        });
    }

    drawCard() {
        if (this.template) {
            const clone = this.template.content.cloneNode(true);
            this.cardElement.innerHTML = '';
            this.cardElement.appendChild(clone);
        }
    }

    saveToLocalStorage() {
        const cardObj = this.toObject();

        let savedTasks = JSON.parse(localStorage.getItem('tasks'));
        if (!savedTasks) {
            savedTasks = [];
        }
        savedTasks.push(cardObj);
        localStorage.setItem('tasks', JSON.stringify(savedTasks));
    }

    toObject() {
        // Set slots & create card object
        const slotNames = ['count', 'name', 'from', 'responsible'];
        const jsonCard = new Object();
        slotNames.forEach((slotName) => {
            const slot = this.querySelector(`span[slot=${slotName}]`);
            if (!slot) {
                jsonCard[slotName] = slotName[0].toUpperCase() + slotName.slice(1);
                return;
            }
            jsonCard[slotName] = slot.innerText;
        });
        jsonCard['id'] = this.getAttribute('task-id');
        jsonCard['column'] = this.getAttribute('column')

        return jsonCard;
    }

}

if (!customElements.get('task-card')) {
    customElements.define('task-card', TaskCard);
}
