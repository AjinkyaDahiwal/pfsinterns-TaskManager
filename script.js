// DOM elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTask');
const taskList = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');

// Task array
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Event listeners
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});
taskList.addEventListener('click', handleTaskAction);
filterBtns.forEach(btn => btn.addEventListener('click', filterTasks));

// Functions
function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText) {
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };
        tasks.unshift(task);  // Add new task to the beginning of the array
        saveTasks();
        renderTasks();
        taskInput.value = '';
        showNotification('Task added successfully!');
    }
}

function renderTasks(filteredTasks = tasks) {
    taskList.innerHTML = '';
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <span class="task-text">${task.text}</span>
            <input type="text" class="edit-input" value="${task.text}">
            <div class="task-actions">
                <button class="complete-btn" data-id="${task.id}" title="Mark as ${task.completed ? 'incomplete' : 'complete'}">
                    <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                </button>
                <button class="edit-btn" data-id="${task.id}" title="Edit task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" data-id="${task.id}" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

function handleTaskAction(e) {
    const target = e.target.closest('button');
    if (!target) return;

    const taskId = parseInt(target.dataset.id);
    const taskIndex = tasks.findIndex(task => task.id === taskId);

    if (target.classList.contains('complete-btn')) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        showNotification(`Task marked as ${tasks[taskIndex].completed ? 'completed' : 'incomplete'}`);
    } else if (target.classList.contains('delete-btn')) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks.splice(taskIndex, 1);
            showNotification('Task deleted successfully');
        } else {
            return;
        }
    } else if (target.classList.contains('edit-btn')) {
        const li = target.closest('.task-item');
        li.classList.toggle('edit-mode');
        const input = li.querySelector('.edit-input');
        const taskText = li.querySelector('.task-text');
        
        if (li.classList.contains('edit-mode')) {
            input.focus();
        } else {
            if (input.value.trim() !== '') {
                tasks[taskIndex].text = input.value;
                taskText.textContent = input.value;
                showNotification('Task updated successfully');
            } else {
                showNotification('Task cannot be empty', 'error');
            }
        }
    }

    saveTasks();
    renderTasks();
}

function filterTasks(e) {
    filterBtns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    const filter = e.target.dataset.filter;
    let filteredTasks;

    switch (filter) {
        case 'pending':
            filteredTasks = tasks.filter(task => !task.completed);
            break;
        case 'completed':
            filteredTasks = tasks.filter(task => task.completed);
            break;
        default:
            filteredTasks = tasks;
    }

    renderTasks(filteredTasks);
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }, 10);
}

// Initial render
renderTasks();
