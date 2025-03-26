// styles.js
export const tailwindSheetPromise = fetch('/css/tw-shadowdom-output.css')
  .then(res => res.text())
  .then(css => {
    const sheet = new CSSStyleSheet();
    sheet.replace(css);
    return sheet;
  });
