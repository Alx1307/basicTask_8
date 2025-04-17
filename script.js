document.addEventListener('DOMContentLoaded', () => {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    const container = document.getElementById("task-container");
    const completedContainer = document.getElementById("completed-task-container");
    tasks.forEach(task => {
        createTaskElement(task, task.completed ? completedContainer : container);
    });

    updateCompletedTasksCount();
    completedContainer.classList.toggle("hidden", !tasks.some(task => task.completed));

    const toggleButton = document.getElementById("completed-tasks-toggle");
    const toggleIcon = toggleButton.querySelector(".toggle-icon");

    if (!completedContainer.classList.contains("hidden")) {
        toggleIcon.classList.add("up");
    } else {
        toggleIcon.classList.remove("up");
    }

    toggleButton.addEventListener("click", () => {
        completedContainer.classList.toggle("hidden");
        toggleIcon.classList.toggle("up");
    });
});

const addTaskBtn = document.getElementById("add-task-button");
const saveTaskBtn = document.getElementById("save-task-button");
const addTaskWindow = document.getElementById("add-task-window");
const viewTaskWindow = document.getElementById("view-task-window");
const editTaskWindow = document.getElementById("edit-task-window");
const editTaskBtn = document.getElementById("edit-task-button");

const showAddModalWindow = () => {
    addTaskWindow.classList.remove("hidden");
};

const hideAddModalWindow = () => {
    addTaskWindow.classList.add("hidden");
};

addTaskWindow.addEventListener("click", (e) => {
    if (e.target === addTaskWindow) {
        hideAddModalWindow();
    }
});

addTaskBtn.addEventListener("click", showAddModalWindow);

document.getElementById("save-task-button").addEventListener("click", function() {
    const content = document.getElementById("content").value;

    if (!content) {
        alert("Задача не может быть пустой!");
        return;
    }

    const task = {
        id: Date.now(),
        content: content || "",
        completed: false
    };

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    tasks.push(task);

    localStorage.setItem("tasks", JSON.stringify(tasks)); //localStorage хранит только строки

    alert("Задача сохранена!");

    showNewTask(task);

    document.getElementById("content").value = "";

    hideAddModalWindow();

    refreshTasksDisplay();
});

function showNewTask(task) {
    const container = document.getElementById("task-container");
    createTaskElement(task, container);
}

function createTaskElement(task, container) {
    const taskItem = document.createElement("div");
    taskItem.classList.add("task");
    if (task.completed) {
        taskItem.classList.add("completed");
    }
    taskItem.innerHTML = `
        <div class="icon-container-left">
            <img src="assets/done-icon.png" alt="Готово" class="icon" data-id="${task.id}">
        </div>
        <p>${task.content}</p>
        <div class="icon-container">
            <img src="assets/delete-icon.png" alt="Корзина" class="icon" data-id="${task.id}">
            <img src="assets/edit-icon.png" alt="Редактировать" class="icon" data-id="${task.id}">
        </div>
    `;
    container.prepend(taskItem);

    taskItem.addEventListener("click", () => {
        openViewTaskModal(task.content);
    });

    const doneIcon = taskItem.querySelector('.icon[alt="Готово"]');
    doneIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleTaskCompletion(task.id);
    });

    const editIcon = taskItem.querySelector('.icon[alt="Редактировать"]');
    editIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        openEditTaskModal(task);
    });

    const deleteIcon = taskItem.querySelector('.icon[alt="Корзина"]');
    deleteIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteTask(task.id);
    });
}

const openViewTaskModal = (content) => {
    const viewTaskContent = document.getElementById("view-task-content");

    viewTaskContent.textContent = content;
    viewTaskWindow.classList.remove("hidden");
};

const hideViewModalWindow = () => {
    viewTaskWindow.classList.add("hidden");
}

viewTaskWindow.addEventListener("click", (e) => {
    if (e.target === viewTaskWindow) {
        hideViewModalWindow();
    }
});

function deleteTask(id) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks = tasks.filter(task => task.id !== id);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    refreshTasksDisplay();
}

function toggleTaskCompletion(id) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.completed = !task.completed;
        localStorage.setItem("tasks", JSON.stringify(tasks));
        refreshTasksDisplay();
    }
}

function openEditTaskModal(task) {
    const contentTextarea = document.getElementById("edit-content");

    contentTextarea.value = task.content;

    editTaskWindow.dataset.taskId = task.id;

    showEditModalWindow();
}

const showEditModalWindow = () => {
    editTaskWindow.classList.remove("hidden");
};

const hideEditModalWindow = () => {
    editTaskWindow.classList.add("hidden");
};

document.getElementById("edit-task-button").addEventListener("click", function() {
    const content = document.getElementById("edit-content").value;

    const taskId = editTaskWindow.dataset.taskId;

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const taskIndex = tasks.findIndex(task => task.id == taskId);

    if (taskIndex !== -1) {
        tasks[taskIndex].content = content || "";
    }

    localStorage.setItem("tasks", JSON.stringify(tasks));

    alert("Задача обновлена!");

    document.getElementById("edit-content").value = "";

    hideEditModalWindow();
    refreshTasksDisplay();
});

function refreshTasksDisplay() {
    const container = document.getElementById("task-container");
    const completedContainer = document.getElementById("completed-task-container");
    container.innerHTML = '';
    completedContainer.innerHTML = '';
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach(task => createTaskElement(task, task.completed ? completedContainer : container));
    completedContainer.classList.toggle("hidden", !tasks.some(task => task.completed));
    container.classList.toggle("hidden", !tasks.some(task => !task.completed));

    updateCompletedTasksCount();

    const toggleIcon = document.querySelector(".toggle-icon");
    if (completedContainer.classList.contains("hidden")) {
        toggleIcon.classList.remove("up");
    } else {
        toggleIcon.classList.add("up");
    }
}

function updateCompletedTasksCount() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const completedTasksCount = tasks.filter(task => task.completed).length;
    const completedTasksCountElement = document.getElementById("completed-tasks-count");
    completedTasksCountElement.textContent = `Выполнено: ${completedTasksCount}`;

    const toggleButton = document.getElementById("completed-tasks-toggle");
    toggleButton.classList.toggle("hidden", completedTasksCount === 0);
}

const toggleCheckbox = document.getElementById('notificationToggle');

toggleCheckbox.addEventListener('change', function() {
    if (this.checked) {
        console.log("Уведомления подключены");
    } else {
        console.log("Уведомления отключены");
    }
});