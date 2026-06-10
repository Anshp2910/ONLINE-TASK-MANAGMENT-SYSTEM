const isLocalFrontend =
    window.location.protocol === "file:" ||
    ["localhost", "127.0.0.1"].includes(window.location.hostname) &&
        !["5000", "8888"].includes(window.location.port);
const API_BASE = isLocalFrontend ? "http://localhost:5000" : "";
const API = `${API_BASE}/api/tasks`;
const token = localStorage.getItem("token");

let editingId = null;
let allTasks = []; // Global state for client-side filtering/sorting

async function apiRequest(url, options = {}) {
    const res = await fetch(url, {
        ...options,
        headers: {
            Authorization: token,
            ...options.headers
        }
    });

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
        ? await res.json()
        : null;

    if (!res.ok) {
        if (res.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "login.html";
        }

        throw new Error(data?.msg || data?.error || `Request failed (${res.status})`);
    }

    return data;
}

function escapeHtml(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

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
        const tasks = await apiRequest(API);

        if (!Array.isArray(tasks)) {
            throw new Error("Invalid task response");
        }

        allTasks = tasks;
        applyFiltersAndRender();
    } catch (e) {
        showToast(e.message || "Failed to load tasks", "error");
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
        const task = await apiRequest(API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title, desc, category, status: "pending" })
        });

        if (!task?._id) {
            throw new Error("Task was not created");
        }

        allTasks.unshift(task);
        applyFiltersAndRender();

        // Reset inputs
        document.getElementById("title").value = "";
        document.getElementById("desc").value = "";
        document.getElementById("category").value = "General";

        showToast("Task added successfully!", "success");
    } catch (e) {
        showToast(e.message || "Failed to add task", "error");
    }
}

// DELETE
async function deleteTask(id) {
    try {
        await apiRequest(`${API}/${id}`, { method: "DELETE" });

        allTasks = allTasks.filter(task => task._id !== id);
        applyFiltersAndRender();
        showToast("Task deleted", "success");
    } catch (e) {
        showToast(e.message || "Failed to delete task", "error");
    }
}

// TOGGLE
async function toggleStatus(id) {
    const task = allTasks.find(item => item._id === id);
    if (!task) return;

    try {
        const updated = await apiRequest(`${API}/${task._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                status: task.status === "pending" ? "completed" : "pending"
            })
        });

        allTasks = allTasks.map(item => item._id === id ? updated : item);
        applyFiltersAndRender();
        showToast("Task status updated", "success");
    } catch (e) {
        showToast(e.message || "Failed to update status", "error");
    }
}

// EDIT START
function startEdit(id) {
    editingId = id;
    applyFiltersAndRender();
}

// SAVE EDIT
async function saveEdit(id) {
    const newTitle = document.getElementById(`edit-title-${id}`).value.trim();
    const newDesc = document.getElementById(`edit-desc-${id}`).value.trim();
    const newCat = document.getElementById(`edit-cat-${id}`).value;

    if (!newTitle) {
        showToast("Task title cannot be empty!", "error");
        return;
    }

    try {
        const updated = await apiRequest(`${API}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: newTitle,
                desc: newDesc,
                category: newCat
            })
        });

        editingId = null;
        allTasks = allTasks.map(task => task._id === id ? updated : task);
        applyFiltersAndRender();
        showToast("Task updated!", "success");
    } catch (e) {
        showToast(e.message || "Failed to update task", "error");
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
        const safeTitle = escapeHtml(task.title);
        const safeDesc = escapeHtml(task.desc);
        const safeCategory = escapeHtml(catValue);
        const safeStatus = task.status === "completed" ? "completed" : "pending";
        
        if (editingId === task._id) {
            htmlStr += `
                <div class="task">
                    <div style="flex: 1; margin-right: 15px;">
                        <input id="edit-title-${task._id}" value="${safeTitle}" class="edit-input" placeholder="Title">
                        <input id="edit-desc-${task._id}" value="${safeDesc}" class="edit-input" placeholder="Description">
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
                        <button class="btn save-btn" onclick="saveEdit('${task._id}')">Save</button>
                        <button class="btn cancel-btn" onclick="editingId=null; applyFiltersAndRender()">Cancel</button>
                    </div>
                </div>
            `;
        } else {
            htmlStr += `
                <div class="task">
                    <div class="task-info">
                        <h3>${safeTitle}</h3>
                        <p>${safeDesc}</p>
                        <span class="category-tag">${safeCategory}</span>
                    </div>

                    <span class="status ${safeStatus}">${safeStatus}</span>

                    <div class="btn-group">
                        <button class="btn edit-btn" onclick="startEdit('${task._id}')">Edit</button>
                        <button class="btn delete-btn" onclick="deleteTask('${task._id}')">Delete</button>
                        <button class="btn save-btn" onclick="toggleStatus('${task._id}')">Toggle</button>
                    </div>
                </div>
            `;
        }

    });

    if (!htmlStr) {
        htmlStr = "<p class=\"empty-state\">No tasks yet. Add your first task above.</p>";
    }

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
