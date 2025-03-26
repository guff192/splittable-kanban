import { loadTemplate, loadShadowDomStyles } from "./loaders.js";

class AddButton extends HTMLElement {
    async connectedCallback() {
        this.root = this.attachShadow({ mode: 'open' });
        this.buttonContainer = document.createElement('div');
        this.root.appendChild(this.buttonContainer);

        // Load template and styles in parallel
        const [template, stylesheet] = await Promise.all([
            this.loadTemplate(),
            this.loadStyles()
        ]);

        // Inject template and styles
        this.root.adoptedStyleSheets = [stylesheet];
        this.template = template;

        this.drawBtn();
        this.registerEventListeners();
    }

    async loadTemplate() {
        const template = await loadTemplate('templates/add-button.html', '#add-button-template')
        return template;
    }

    async loadStyles() {
        const sheet = await loadShadowDomStyles();
        return sheet;
    }

    registerEventListeners() {
        this.root.querySelector('button').addEventListener('click', () => {
            const event = new CustomEvent('add');
            this.parentNode.dispatchEvent(event);
        });
    }

    drawBtn() {
        if (this.template) {
            const clone = this.template.content.cloneNode(true);
            this.buttonContainer.innerHTML = '';
            this.buttonContainer.appendChild(clone);
        }
    }
}

if (!customElements.get('add-button')) {
    customElements.define('add-button', AddButton);
}

