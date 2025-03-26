/* 
    * This file is used to generate tailwind styles for web components to use in Shadow DOM.
    * It WILL NOT affect the global styles.
*/

export default {
    corePlugins: {
        preflight: true, // Disable global styles
    },
    content: [
        "./templates/*.html",
    ],
};

