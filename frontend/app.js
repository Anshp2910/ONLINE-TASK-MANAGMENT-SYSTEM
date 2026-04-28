const API = "http://localhost:5000/api/tasks";
const token = localStorage.getItem("token");

let editingId = null;
let allTasks = []; // Global state for client-side filtering/sorting

// TOAST FUNCTION
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add("fade-out");
        toast.addEventListener("animationend", () => toast.remove());
    }, 3000);
}

// LOAD TASKS
async function loadTasks() {
    try {
        const res = await fetch(API, {
            headers: { Authorization: token }
        });
        allTasks = await res.json();
        applyFiltersAndRender();
    } catch (e) {
        showToast("Failed to load tasks", "error");
    }
}

// FILTER & SORT
function applyFiltersAndRender() {
    renderTasks(allTasks);
}

// ADD TASK
async function addTask() {
    const title = document.getElementById("title").value.trim();
    const desc = document.getElementById("desc").value.trim();
    const category = document.getElementById("category").value;

    if (!title) {
        showToast("Task title is required!", "error");
        return;
    }

    try {
        await fetch(API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            },
            body: JSON.stringify({ title, desc, category, status: "pending" })
        });
        
        // Reset inputs
        document.getElementById("title").value = "";
        document.getElementById("desc").value = "";
        document.getElementById("category").value = "General";

        showToast("Task added successfully!", "success");
        loadTasks();
    } catch (e) {
        showToast("Failed to add task", "error");
    }
}

// DELETE
async function deleteTask(id) {
    try {
        await fetch(`${API}/${id}`, {
            method: "DELETE",
            headers: { Authorization: token }
        });

        showToast("Task deleted", "success");
        loadTasks();
    } catch (e) {
        showToast("Failed to delete task", "error");
    }
}

// TOGGLE
async function toggleStatus(task) {
    try {
        await fetch(`${API}/${task._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            },
            body: JSON.stringify({
                ...task,
                status: task.status === "pending" ? "completed" : "pending"
            })
        });

        showToast("Task status updated", "success");
        loadTasks();
    } catch (e) {
        showToast("Failed to update status", "error");
    }
}

// EDIT START
function startEdit(id) {
    editingId = id;
    applyFiltersAndRender();
}

// SAVE EDIT
async function saveEdit(task) {
    const newTitle = document.getElementById(`edit-title-${task._id}`).value.trim();
    const newDesc = document.getElementById(`edit-desc-${task._id}`).value.trim();
    const newCat = document.getElementById(`edit-cat-${task._id}`).value;

    if (!newTitle) {
        showToast("Task title cannot be empty!", "error");
        return;
    }

    try {
        await fetch(`${API}/${task._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            },
            body: JSON.stringify({
                title: newTitle,
                desc: newDesc,
                category: newCat
            })
        });

        editingId = null;
        showToast("Task updated!", "success");
        loadTasks();
    } catch (e) {
        showToast("Failed to update task", "error");
    }
}

// RENDER
function renderTasks(tasks) {
    const list = document.getElementById("taskList");
    if (!list) return;

    // Stats based on allTasks (not filtered tasks)
    let total = allTasks.length;
    let completed = allTasks.filter(t => t.status === "completed").length;

    document.getElementById("total").innerText = total;
    document.getElementById("completed").innerText = completed;
    document.getElementById("pending").innerText = total - completed;

    let htmlStr = "";

    tasks.forEach(task => {
        const catValue = task.category || "General";
        
        if (editingId === task._id) {
            htmlStr += `
                <div class="task">
                    <div style="flex: 1; margin-right: 15px;">
                        <input id="edit-title-${task._id}" value="${task.title}" class="edit-input" placeholder="Title">
                        <input id="edit-desc-${task._id}" value="${task.desc}" class="edit-input" placeholder="Description">
                        <select id="edit-cat-${task._id}" class="edit-input">
                            <option value="General" ${catValue === 'General' ? 'selected' : ''}>General</option>
                            <option value="Work" ${catValue === 'Work' ? 'selected' : ''}>Work</option>
                            <option value="Personal" ${catValue === 'Personal' ? 'selected' : ''}>Personal</option>
                            <option value="Shopping" ${catValue === 'Shopping' ? 'selected' : ''}>Shopping</option>
                            <option value="Health" ${catValue === 'Health' ? 'selected' : ''}>Health</option>
                            <option value="Other" ${catValue === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>

                    <div class="btn-group">
                        <button class="btn save-btn" onclick='saveEdit(${JSON.stringify(task)})'>Save</button>
                        <button class="btn cancel-btn" onclick="editingId=null; applyFiltersAndRender()">Cancel</button>
                    </div>
                </div>
            `;
        } else {
            htmlStr += `
                <div class="task">
                    <div class="task-info">
                        <h3>${task.title}</h3>
                        <p>${task.desc}</p>
                        <span class="category-tag">${catValue}</span>
                    </div>

                    <span class="status ${task.status}">${task.status}</span>

                    <div class="btn-group">
                        <button class="btn edit-btn" onclick="startEdit('${task._id}')">Edit</button>
                        <button class="btn delete-btn" onclick="deleteTask('${task._id}')">Delete</button>
                        <button class="btn save-btn" onclick='toggleStatus(${JSON.stringify(task)})'>Toggle</button>
                    </div>
                </div>
            `;
        }

    });

    list.innerHTML = htmlStr;
}

// LOGOUT
function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

// INIT
if (!token) {
    window.location.href = "login.html";
} else {
    loadTasks();
}