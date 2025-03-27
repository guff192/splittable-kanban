import { DispatchToParentButton } from "./DispatchToParentButton.js";

class RemoveButton extends DispatchToParentButton {
    constructor() {
        super('remove-button.html', '#remove-button-template', 'remove');
    }
}

if (!customElements.get('remove-button')) {
    customElements.define('remove-button', RemoveButton);
}
