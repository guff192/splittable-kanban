import { DispatchToParentButton } from "./DispatchToParentButton.js";

class AddButton extends DispatchToParentButton {
    constructor() {
        super('add-button.html', '#add-button-template', 'add');
    }
}

if (!customElements.get('add-button')) {
    customElements.define('add-button', AddButton);
}

