const themeToggle = document.querySelector("#theme-toggle");
const themeBtns = document.querySelectorAll("#theme-toggle button[data-theme]");


themeBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        const theme = e.target.getAttribute("data-theme");
        setTheme(theme);
    });
});


function turnDocumentSmoothnessOn() {
    const elements = document.querySelector("#root").querySelectorAll("*");
    elements.forEach((element) => element.classList.add("duration-1000"));
}

function turnDocumentSmoothnessOff() {
    const elements = document.querySelector("#root").querySelectorAll("*");
    elements.forEach((element) => element.classList.remove("duration-1000"));
}


function setTheme(theme) {
    const activeThemeBtn = themeToggle.querySelector(`[data-theme=${theme}]`);

    turnDocumentSmoothnessOn();
    const elements = document.querySelectorAll("*");
    elements.forEach((element) => {
        setTimeout(() => element.setAttribute("theme", theme), 100);
    });
    setTimeout(() => turnDocumentSmoothnessOff(), 170);

    themeBtns.forEach((btn) => {
        btn.removeAttribute("active");
        btn.classList.remove("bg-blue-500");
        btn.classList.add("bg-none");
        btn.classList.add("opacity-50");
    });

    activeThemeBtn.setAttribute("active", true);
    activeThemeBtn.classList.add("bg-blue-500");
    activeThemeBtn.classList.remove("bg-none");
    activeThemeBtn.classList.remove("opacity-50");

    localStorage.setItem("theme", theme);
}


function resetTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme("catppuccin-latte");
    }
}

resetTheme();

document.addEventListener('reset-theme', resetTheme);

