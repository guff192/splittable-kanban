import handleColumnDragOver from './drag-n-drop.js';

const tableHeader = document.querySelector('main > header');
let headerColumns = document.querySelectorAll('main > header > div');
const columnsContainer = document.querySelector('main > section');
let columns = document.querySelectorAll('main > section > div');

function randomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function handleHeaderAdd(event) {
    // Create new header column
    const newHeaderColumn = document.createElement('div');
    const newColumnName = 'Column ' + randomString(3);
    newHeaderColumn.classList.add('w-72', 'text-nowrap', 'text-center', 'flex-none', 'box-border', 'p-2', 'flex', 'flex-col', 'justify-center', 'border-r', 'border-r-overlay0', 'text-3xl');
    tableHeader.appendChild(newHeaderColumn);
    headerColumns = document.querySelectorAll('main > header > div');
    newHeaderColumn.innerHTML = `
        <h2 class='h-full grow'>${newColumnName}</h2>
        <add-button><span slot='name'>Task</span></add-button>
    `;

    // Add event listeners
    newHeaderColumn.addEventListener('add', handleHeaderColumnAdd);
    newHeaderColumn.addEventListener('click', handleHeaderColumnClick);

    const newColumn = document.createElement('div');
    newColumn.classList.add('h-full', 'text-nowrap', 'flex-none', 'w-72', 'box-border', 'p-2');
    columnsContainer.appendChild(newColumn);
    columns = document.querySelectorAll('main > section > div');
    newColumn.addEventListener('dragover', handleColumnDragOver);

    // Save to local storage
    let savedColumns = JSON.parse(localStorage.getItem('columns'));
    if (!savedColumns) {
        localStorage.setItem('columns', JSON.stringify(new Array()));
        savedColumns = [];
    }
    savedColumns.push(newColumnName);
    localStorage.setItem('columns', JSON.stringify(savedColumns));
}

function handleHeaderColumnClick(event) {
    if (event.detail < 2) return;

    const previousName = event.target.innerText;

    // Get the user input
    let answer = prompt('Enter column name:', event.target.innerText);
    if (!answer) {
        alert('Please enter a valid name next time');
        return;
    }
    answer = answer.trim();

    // Check if column name already exists
    let columnExists = false;
    headerColumns = document.querySelectorAll('main > header > div');
    headerColumns.forEach((column) => {
        if (answer === column.querySelector('h2').innerText) {
            alert(`Column with name ${answer} already exists`);
            columnExists = true;
            return;
        }
    });

    // Change column name
    if (columnExists) return;
    event.target.innerText = answer;

    // Save to local storage
    let savedColumns = JSON.parse(localStorage.getItem('columns'));
    if (!savedColumns) {
        localStorage.setItem('columns', JSON.stringify(new Array()));
        savedColumns = [];
    }
    savedColumns[savedColumns.indexOf(previousName)] = answer;
    localStorage.setItem('columns', JSON.stringify(savedColumns));

    // Update column name on cards in this column
    const savedTasks = JSON.parse(localStorage.getItem('tasks'));
    savedTasks.forEach((task) => {
        if (task['column'] === previousName) {
            task['column'] = answer;
        }
    });
    localStorage.setItem('tasks', JSON.stringify(savedTasks));
}

// Adds new task
function handleHeaderColumnAdd(event) {
    const taskCard = document.createElement('task-card');
    const columnIndex = Array.from(headerColumns).indexOf(event.target);
    columns[columnIndex].insertBefore(taskCard, columns[columnIndex].firstChild);

    // Set slots & create card object
    const slotNames = ['count', 'name', 'from', 'responsible'];
    const jsonCard = new Object();
    slotNames.forEach((slotName) => {
        const slot = document.createElement('span');
        taskCard.appendChild(slot);
        slot.setAttribute('slot', slotName);
        slot.innerText = slotName;
        jsonCard[slotName] = slot.innerText;
    });

    // Get saved tasks
    let savedTasks = JSON.parse(localStorage.getItem('tasks'));
    if (!savedTasks) {
        localStorage.setItem('tasks', JSON.stringify(new Array()));
        savedTasks = [];
    }

    const nextTaskId = getNextTaskId();
    taskCard.setAttribute('task-id', nextTaskId);
    jsonCard['id'] = nextTaskId;

    // Get column name
    const columnName = event.target.querySelector('h2').innerText;
    jsonCard['column'] = columnName;

    // Save to local storage
    savedTasks.push(jsonCard);
    localStorage.setItem('tasks', JSON.stringify(savedTasks));
};

/**
    * Gets id for new created task.
    * @returns {number} - free taskId, that's not taken yet.
*/
export function getNextTaskId() {
    // Get next task id
    let maxTaskId = 0;
    document.querySelectorAll('task-card').forEach((card) => {
        const taskId = Number(card.getAttribute('task-id'));
        if (Number(taskId) > maxTaskId) {
            maxTaskId = taskId;
        }
    });
    return maxTaskId + 1;
}

function restoreSavedColumns() {
    const savedColumns = JSON.parse(localStorage.getItem('columns'));
    if (!savedColumns) {
        return;
    }

    savedColumns.forEach((columnName) => {
        // Create new header column
        const newHeaderColumn = document.createElement('div');
        newHeaderColumn.classList.add('w-72', 'text-nowrap', 'text-center', 'flex-none', 'box-border', 'p-2', 'flex', 'flex-col', 'justify-center', 'border-r', 'border-r-overlay0', 'text-3xl');
        tableHeader.appendChild(newHeaderColumn);
        headerColumns = document.querySelectorAll('main > header > div');
        newHeaderColumn.innerHTML = `
            <h2 class='h-full grow'>${columnName}</h2>
            <add-button><span slot='name'>Task</span></add-button>
        `;

        // Add event listeners
        newHeaderColumn.addEventListener('add', handleHeaderColumnAdd);
        newHeaderColumn.addEventListener('click', handleHeaderColumnClick);

        // Create new task column
        const newColumn = document.createElement('div');
        newColumn.classList.add('h-full', 'text-nowrap', 'flex-none', 'w-72', 'box-border', 'p-2');
        columnsContainer.appendChild(newColumn);
        columns = document.querySelectorAll('main > section > div');
        newColumn.addEventListener('dragover', handleColumnDragOver);
    });

    document.dispatchEvent(new Event('reset-theme'));
}

function restoreSavedTasks() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks'));
    if (!savedTasks) {
        return;
    }

    savedTasks.forEach((task) => {
        const taskCard = document.createElement('task-card');
        const headerColumnsArr = Array.from(headerColumns);
        const headerColumn = headerColumnsArr.find((column) => column.querySelector('h2').innerText === task['column']);
        const columnIndex = headerColumnsArr.indexOf(headerColumn);
        columns[columnIndex].insertBefore(taskCard, columns[columnIndex].firstChild);

        // Set slots & create card object
        const slotNames = ['count', 'name', 'from', 'responsible'];
        slotNames.forEach((slotName) => {
            const slot = document.createElement('span');
            taskCard.appendChild(slot);
            slot.setAttribute('slot', slotName);
            slot.innerText = task[slotName];
        });
        taskCard.setAttribute('task-id', task['id']);
    });

    document.dispatchEvent(new Event('reset-theme'));
}

function clearBoard() {
    headerColumns.forEach((headerColumn) => {
        headerColumn.remove();
    })
    columns.forEach((column) => {
        column.remove();
    })

    headerColumns = [];
    columns = [];
}

function saveProgress() {
    const saveLink = document.createElement('a');
    const { columns, tasks } = localStorage;
    const state = new Object();
    state['columns'] = JSON.parse(columns);
    state['tasks'] = JSON.parse(tasks);
    const file = new Blob([JSON.stringify(state)], { type: 'application/json' });
    saveLink.href = URL.createObjectURL(file);
    saveLink.download = 'work_progress.json';
    saveLink.click();
}

/**
    * On a first call shows progress file input. On a second — loads it into local storage.
    * @param {MouseEvent} e 
*/
function loadProgress (e) {
    let fileLoader = document.querySelector('#progress-loader');
    if (!fileLoader) {
        fileLoader = document.createElement('input');
        fileLoader.setAttribute('type', 'file');
        fileLoader.setAttribute('id', 'progress-loader');
        e.target.parentElement.appendChild(fileLoader);
        return;
    }

    const file = fileLoader.files[0];
    if (!file) {
        alert('Please select a file');
        return;
    }
    file.text().then((text) => {
        const loadedData = JSON.parse(text);
        for (const [key, value] of Object.entries(loadedData)) {
            localStorage.setItem(key, JSON.stringify(value));
        }
        clearBoard();
        restoreSavedColumns();
        restoreSavedTasks();
        fileLoader.remove();
    });

}


// Add event listener to each column for adding new tasks
headerColumns.forEach((headerColumn) => {
    headerColumn.addEventListener('add', handleHeaderColumnAdd);

    // Add event listeners for click to edit
    headerColumn.querySelector('h2').addEventListener('click', handleHeaderColumnClick);
});

// Add event listener to table header for adding new columns
tableHeader.addEventListener('add', handleHeaderAdd);

const saveBtn = document.querySelector('#save');
saveBtn.addEventListener('click', saveProgress);
const loadBtn = document.querySelector('#load');
loadBtn.addEventListener('click', loadProgress);

document.addEventListener('DOMContentLoaded', () => {
    restoreSavedColumns();
    restoreSavedTasks();
});

