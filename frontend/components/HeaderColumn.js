import { TaskCard } from "./TaskCard.js";
import { loadTemplate, loadShadowDomStyles } from "./loaders.js";
import { getNextTaskId } from "../tasks.js";

class HeaderColumn extends HTMLElement {
    static get observedAttributes() {
        return ['name'];
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (name === 'name') {
            this.drawColumn();
        }
    }

    async connectedCallback() {
        if (this.shadowRoot) return;

        this.root = this.attachShadow({ mode: 'open' });
        this.columnElement = document.createElement('div');
        this.template = document.createElement('div');
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
        const template = loadTemplate('templates/header-column.html', '#header-column-template');
        return template;
    }

    async loadStyles() {
        const sheet = await loadShadowDomStyles();
        return sheet;
    }

    registerEventListeners() {
        this.registerClickEventListeners();
        this.registerCustomEventListeners();
    }

    registerClickEventListeners() {
        const nameSpan = this.querySelector('span[slot="name"]');
        nameSpan.addEventListener("click", (e) => {
            if (e.detail < 2) return;

            const oldName = nameSpan.innerText;
            const slotName = e.target.getAttribute("slot");
            const answer = prompt(`Enter new ${slotName}:`, e.target.innerText);
            if (answer) {
                e.target.innerText = answer;
            }

            /** @type Array<String>|null */
            let savedColumns = JSON.parse(localStorage.getItem('columns'));
            if (!savedColumns) {
                savedColumns = [answer];
                localStorage.setItem('columns', JSON.stringify(savedColumns));
                return;
            }

            savedColumns[savedColumns.indexOf(oldName)] = answer;
            localStorage.setItem('columns', JSON.stringify(savedColumns));

            let savedTasks = JSON.parse(localStorage.getItem('tasks'));
            if (!savedTasks) {
                savedTasks = [];
            }
            document.querySelectorAll(`task-card[column="${oldName}"]`).forEach((taskCard) => {
                savedTasks.forEach((task, index) => {
                    if (task['id'] === taskCard.getAttribute('task-id')) {
                        savedTasks.splice(index, 1);
                    }
                })
                taskCard.setAttribute('column', answer);
                savedTasks.push(taskCard.toObject());
            });
            localStorage.setItem('tasks', JSON.stringify(savedTasks));
        });
    }

    registerCustomEventListeners() {
        const removeButtonContainer = this.root.querySelector('remove-button').parentNode;
        const addButtonContainer = this.root.querySelector('add-button').parentNode;

        removeButtonContainer.addEventListener('remove', (e) => {
            const firstConfirm = confirm('Are you sure you want to delete this column?');
            if (!firstConfirm) {
                return;
            } else {
                if (!confirm('The column will be PERMANENTLY DELETED. Are you sure you want to delete this column?')) { return; }
            }

            /** @type Array */
            const savedColumns = JSON.parse(localStorage.getItem('columns'));
            if (!savedColumns) return;

            savedColumns.forEach((columnName, index) => {
                if (columnName === this.getAttribute('name')) {
                    savedColumns.splice(index, 1);
                }
            });
            localStorage.setItem('columns', JSON.stringify(savedColumns));
            this.parentNode.removeChild(this);
        });

        addButtonContainer.addEventListener('add', (e) => {
            const columnName = this.getAttribute('name');
            const taskColumn = document.querySelector(`task-column[name="${columnName}`);

            /** @type TaskCard */
            const newTaskCard = document.createElement('task-card');
            newTaskCard.setAttribute('column', columnName);
            newTaskCard.setAttribute('task-id', getNextTaskId());
            taskColumn.cardsContainer.insertBefore(newTaskCard, taskColumn.cardsContainer.firstChild);

            newTaskCard.saveToLocalStorage();
        });
    }

    drawColumn() {
        if (!this.template || !this.template.content) return;

        const clone = this.template.content.cloneNode(true);
        this.columnElement.innerHTML = '';
        this.columnElement.appendChild(clone);
    }
}

if (!customElements.get('header-column')) {
    customElements.define('header-column', HeaderColumn);
}

