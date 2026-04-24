const API = "http://localhost:5000/api/tasks";
const token = localStorage.getItem("token");

let editingId = null;

// LOAD TASKS
async function loadTasks() {
    const res = await fetch(API, {
        headers: { Authorization: token }
    });

    const tasks = await res.json();
    renderTasks(tasks);
}

// ADD TASK
async function addTask() {
    const title = document.getElementById("title").value;
    const desc = document.getElementById("desc").value;

    await fetch(API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: token
        },
        body: JSON.stringify({ title, desc, status: "pending" })
    });

    loadTasks();
}

// DELETE
async function deleteTask(id) {
    await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: token }
    });

    loadTasks();
}

// TOGGLE
async function toggleStatus(task) {
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

    loadTasks();
}

// EDIT START
function startEdit(id) {
    editingId = id;
    loadTasks();
}

// SAVE EDIT
async function saveEdit(task) {
    const newTitle = document.getElementById(`edit-title-${task._id}`).value;
    const newDesc = document.getElementById(`edit-desc-${task._id}`).value;

    await fetch(`${API}/${task._id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: token
        },
        body: JSON.stringify({
            ...task,
            title: newTitle,
            desc: newDesc
        })
    });

    editingId = null;
    loadTasks();
}

// RENDER
function renderTasks(tasks) {
    const list = document.getElementById("taskList");
    list.innerHTML = "";

    let total = tasks.length;
    let completed = tasks.filter(t => t.status === "completed").length;

    document.getElementById("total").innerText = total;
    document.getElementById("completed").innerText = completed;
    document.getElementById("pending").innerText = total - completed;

    tasks.forEach(task => {

        if (editingId === task._id) {
            list.innerHTML += `
                <div class="task">
                    <input id="edit-title-${task._id}" value="${task.title}" class="edit-input">
                    <input id="edit-desc-${task._id}" value="${task.desc}" class="edit-input">

                    <div class="btn-group">
                        <button class="btn save-btn" onclick='saveEdit(${JSON.stringify(task)})'>Save</button>
                        <button class="btn cancel-btn" onclick="editingId=null; loadTasks()">Cancel</button>
                    </div>
                </div>
            `;
        } else {
            list.innerHTML += `
                <div class="task">
                    <h3>${task.title}</h3>
                    <p>${task.desc}</p>

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