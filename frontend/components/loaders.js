/** @type {Map<string, HTMLElement>} */
const templateCache = new Map();

/**
    * Save template to cache.
    * @param {string} path - URL path to template
    * @param {HTMLElement} template - Template element
*/
function saveTemplate(path, template) {
    templateCache.set(path, template);
}

/**
    * Get template from cache.
    * @param {string} path - URL path to template
    * @returns {HTMLElement} - Template element
*/
function getTemplate(path) {
    return templateCache.get(path);
}

const loadingTemplates = new Array();
export async function loadTemplate(/** @type {string} */ path, /** @type {string} */ selector) {
    // Check if already loading this template
    if (loadingTemplates.includes(path)) {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                const template = getTemplate(path);
                if (template) {
                    clearInterval(interval);
                    resolve(template);
                }
            }, 50);
        });
    }

    // Check cache
    const cachedTemplate = getTemplate(path);
    if (cachedTemplate) {
        return cachedTemplate;
    }

    loadingTemplates.push(path);
    const response = await fetch(path);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const template = doc.querySelector(selector);

    saveTemplate(path, template);
    loadingTemplates.splice(loadingTemplates.indexOf(path), 1);
    return template;
}

const styleSheetCache = new Map();

function saveStyleSheet(path, sheet) {
    styleSheetCache.set(path, sheet);
}

function getStyleSheet(path) {
    return styleSheetCache.get(path);
}

const loadingStyles = new Array();
export async function loadShadowDomStyles() {
    const path = '/css/tw-shadowdom-output.css';

    // Check if already loading this style
    if (loadingStyles.includes(path)) {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                const sheet = getStyleSheet(path);
                if (sheet) {
                    clearInterval(interval);
                    resolve(sheet);
                }
            }, 50);
        });
    }
    const cachedStyleSheet = getStyleSheet(path);
    if (cachedStyleSheet) {
        return cachedStyleSheet;
    }

    loadingStyles.push(path);
    const response = await fetch(path);
    const css = await response.text();
    const sheet = new CSSStyleSheet();
    sheet.replace(css);

    saveStyleSheet(path, sheet);
    return sheet;
}

