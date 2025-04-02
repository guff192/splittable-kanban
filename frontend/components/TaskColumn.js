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
    }

    async loadTemplate() {
        const template = loadTemplate('templates/task-column.html', '#task-column-template');
        return template;
    }

    async loadStyles() {
        const sheet = await loadShadowDomStyles();
        return sheet;
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


