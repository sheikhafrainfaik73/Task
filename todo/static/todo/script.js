// Step A: Grab the HTML elements we need
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const totalPointsSpan = document.getElementById("totalPoints");

// Priority buttons
const priorityBtns = document.querySelectorAll('.priority-btn');
let selectedPriority = 'medium'; // Default priority

// Step B: API endpoints
const API = {
    list: "/api/tasks/",
    add: "/api/tasks/add/",
    toggle: (id) => `/api/tasks/toggle/${id}/`,
    delete: (id) => `/api/tasks/delete/${id}/`,
    updatePriority: (id) => `/api/tasks/update-priority/${id}/`,
};

// Priority configuration
const PRIORITY_CONFIG = {
    high: { 
        label: 'High', 
        points: 3, 
        emoji: '🔴',
        color: '#ff4444'
    },
    medium: { 
        label: 'Medium', 
        points: 2, 
        emoji: '🟡',
        color: '#ffaa00'
    },
    low: { 
        label: 'Low', 
        points: 1, 
        emoji: '🟢',
        color: '#44bb44'
    }
};

// Step C: Priority button handlers
priorityBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove active class from all buttons
        priorityBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        this.classList.add('active');
        // Store selected priority
        selectedPriority = this.dataset.priority;
    });
});

// Set default active button (Medium)
document.getElementById('priorityMedium').classList.add('active');

// Step D: Render tasks from Django
async function renderTasks() {
    const res = await fetch(API.list);
    const tasks = await res.json();
    
    taskList.innerHTML = "";
    let totalPoints = 0;
    
    tasks.forEach((task) => {
        const li = document.createElement("li");
        if (task.completed) {
            li.classList.add("done");
        }
        
        // Task info container
        const taskInfo = document.createElement("div");
        taskInfo.className = "task-info";
        
        // Priority indicator (colored dot)
        const priorityDot = document.createElement("span");
        priorityDot.className = `priority-indicator ${task.priority}`;
        
        // Task text
        const taskText = document.createElement("span");
        taskText.textContent = task.title;
        
        // Priority label
        const priorityLabel = document.createElement("span");
        priorityLabel.className = `priority-label ${task.priority}`;
        priorityLabel.textContent = PRIORITY_CONFIG[task.priority].emoji + ' ' + PRIORITY_CONFIG[task.priority].label;
        
        // Points badge
        const pointsBadge = document.createElement("span");
        pointsBadge.className = "points-badge";
        pointsBadge.textContent = `(${task.priority_points || PRIORITY_CONFIG[task.priority].points} pts)`;
        
        // Assemble task info
        taskInfo.appendChild(priorityDot);
        taskInfo.appendChild(taskText);
        taskInfo.appendChild(priorityLabel);
        taskInfo.appendChild(pointsBadge);
        
        // Click to toggle completion
        taskText.addEventListener("click", () => toggleTask(task.id));
        
        // Delete button
        const delBtn = document.createElement("button");
        delBtn.textContent = "X";
        delBtn.className = "delete-btn";
        delBtn.addEventListener("click", () => deleteTask(task.id));
        
        // Priority change dropdown (optional)
        const prioritySelect = document.createElement("select");
        prioritySelect.className = "priority-select";
        ['high', 'medium', 'low'].forEach(p => {
            const option = document.createElement("option");
            option.value = p;
            option.textContent = PRIORITY_CONFIG[p].emoji + ' ' + PRIORITY_CONFIG[p].label;
            if (p === task.priority) {
                option.selected = true;
            }
            prioritySelect.appendChild(option);
        });
        prioritySelect.addEventListener("change", function() {
            updatePriority(task.id, this.value);
        });
        
        li.appendChild(taskInfo);
        li.appendChild(prioritySelect);
        li.appendChild(delBtn);
        taskList.appendChild(li);
        
        // Add points to total
        totalPoints += task.priority_points || PRIORITY_CONFIG[task.priority].points;
    });
    
    // Update total points display
    totalPointsSpan.textContent = totalPoints;
}

// Step E: Add new task with priority
async function addTask() {
    const text = taskInput.value.trim();
    if (text === "") return;
    
    await fetch(API.add, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": CSRFTOKEN,
        },
        body: JSON.stringify({ 
            title: text,
            priority: selectedPriority  // Send selected priority
        }),
    });
    taskInput.value = "";
    renderTasks();
}

// Step F: Toggle task completion
async function toggleTask(id) {
    await fetch(API.toggle(id), {
        method: "POST",
        headers: {
            "X-CSRFToken": CSRFTOKEN,
        },
    });
    renderTasks();
}

// Step G: Delete task
async function deleteTask(id) {
    await fetch(API.delete(id), {
        method: "POST",
        headers: {
            "X-CSRFToken": CSRFTOKEN,
        },
    });
    renderTasks();
}

// Step H: Update task priority
async function updatePriority(id, newPriority) {
    await fetch(API.updatePriority(id), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": CSRFTOKEN,
        },
        body: JSON.stringify({ priority: newPriority }),
    });
    renderTasks();
}

// Step I: Connect buttons and events
addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTask();
});

// Step J: Initial render
renderTasks();