import { loadTemplate, loadShadowDomStyles } from "./loaders.js";

export class DispatchToParentButton extends HTMLElement {
    /**
        * Creates an instance of DispatchToParentButton.
        * @param {string} templateName - Name of the template file
        * @param {string} selector - Selector for the template
        * @param {string} eventName - Name of the event to dispatch
    */
    constructor(templateName, selector, eventName) {
        super();
        this._eventName = eventName;
        this._templateName = templateName;
        this._selector = selector;
    }

    async connectedCallback() {
        if (this.root) {
            this.drawBtn();
            return;
        }

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
        const template = await loadTemplate('templates/' + this._templateName, this._selector);
        return template;
    }

    async loadStyles() {
        const sheet = await loadShadowDomStyles();
        return sheet;
    }

    registerEventListeners() {
        this.root.querySelector('button').addEventListener('click', () => {
            const event = new CustomEvent(this._eventName);
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

