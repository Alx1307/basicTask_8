window.onload = async function() {
    await checkIncompleteTasks();
    setInterval(async () => {
        const response = await fetch('/subscribers-count');
        const result = await response.json();
        console.log(result.count);
        if (result.count > 0){
            await checkIncompleteTasks();
        }
    }, 10000);
  };

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

    fetch('/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Новая задача', body: 'Добавлена новая задача!' })
    }).then(response => {
        if (!response.ok) console.error('Ошибка отправки уведомления');
    });

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

function checkIncompleteTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const incompleteTasks = tasks.filter(task => !task.completed);
  
    if (incompleteTasks.length > 0) {
        fetch('/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Остались незавршенные задачи', 
                body: `Всего незавершенных задач: ${incompleteTasks.length}` })
        }).then(response => {
            if (!response.ok) console.error('Ошибка отправки уведомления');
        });
    }
  }


const VAPID_PUBLIC_KEY = 'BANyYVYp6Ne3cULh5y8QE9NWuPXtTpwPUc3DJllSANezWTM-jkKu8Ma29JbMveNJyv_bA_B3u_wSuQi2j1cyUtg'
const VAPID_PRIVATE_KEY='VH6lg8zKldw7AxC6zB1vcUmOXP6DAzItk4LtmeVWCj4'
const VAPID_EMAIL='your@email.com'
const PORT='3000'

// Регистрация Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async() => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('ServiceWorker зарегистрирован:', registration.scope);
            
            // Получаем текущую подписку пользователя
            const currentSubscription = await registration.pushManager.getSubscription();
            console.log('Уже подписаны:', currentSubscription);
            
            // Отображаем статус подписки в UI
            displaySubscriptionStatus(currentSubscription);
        } catch (err) {
            console.error('Ошибка регистрации ServiceWorker:', err);
        }
    });
  }

function updateOnlineStatus() {
    const offlineMessage = document.getElementById("offline-message");
    if (navigator.onLine) {
        offlineMessage.classList.add("hidden");
    } else {
        offlineMessage.classList.remove("hidden");
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function displaySubscriptionStatus(subscription) {
    const button = document.getElementById('subscribeButton');
    if (subscription) {
        button.textContent = 'Отписаться';
        button.disabled = false;
    } else {
        button.textContent = 'Подписаться';
        button.disabled = false;
  }
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
  
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

async function handleSubscriptionChange(button) {
    const swRegistration = await navigator.serviceWorker.ready;
    const existingSubscription = await swRegistration.pushManager.getSubscription();

    if (existingSubscription) {
    await existingSubscription.unsubscribe();
    button.textContent = 'Подписаться';
    console.log('Пользователь успешно отписан.');
    fetch('/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: existingSubscription.endpoint })
    }).then(response => {
        if (!response.ok) {
        console.error('Ошибка удаления подписки на сервере:', response.statusText);
        }
    });
    } else {
    button.textContent = 'Ждите...';
    const convertedPublicKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    const newSubscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedPublicKey
    });

    // Отправляем подписчика на сервер
    fetch('/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubscription),
    }).then(response => {
        if (response.ok) {
            button.textContent = 'Отписаться';
            console.log('Пользователь успешно подписан.');
        } else {
            console.error('Ошибка отправки подписки на сервер.');
        }
    });
    }
}

document.getElementById('subscribeButton').addEventListener('click', async () => {
    await handleSubscriptionChange(document.getElementById('subscribeButton'));
});