const STORAGE_KEY = "daylist-tasks-v1";
const THEME_KEY = "daylist-theme-v1";
const form = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const emptyState = document.getElementById("emptyState");
const clearCompleted = document.getElementById("clearCompleted");
const themeToggle = document.getElementById("themeToggle");
const filters = document.querySelectorAll(".filter");

function loadTasks() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(value)) return [];
    return value.filter(item => item && typeof item.id === "string" && typeof item.text === "string" && typeof item.done === "boolean");
  } catch { return []; }
}
let tasks = loadTasks();
let activeFilter = "all";

function saveTasks() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
  catch { console.warn("Unable to save tasks in this browser."); }
}

function renderTasks() {
  taskList.replaceChildren();
  const visibleTasks = tasks.filter(task => activeFilter === "all" || (activeFilter === "completed" ? task.done : !task.done));

  visibleTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = `task${task.done ? " done" : ""}`;
    const main = document.createElement("div");
    main.className = "task-main";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", `Mark ${task.text} as ${task.done ? "active" : "completed"}`);
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveTasks();
      renderTasks();
    });
    const label = document.createElement("span");
    label.className = "task-text";
    label.textContent = task.text;
    main.append(checkbox, label);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "delete-btn";
    remove.textContent = "Delete ×";
    remove.setAttribute("aria-label", `Delete ${task.text}`);
    remove.addEventListener("click", () => {
      tasks = tasks.filter(item => item.id !== task.id);
      saveTasks();
      renderTasks();
    });
    item.append(main, remove);
    taskList.append(item);
  });

  const remaining = tasks.filter(task => !task.done).length;
  taskCount.textContent = `${remaining} ${remaining === 1 ? "task" : "tasks"} left`;
  emptyState.hidden = visibleTasks.length !== 0;
  emptyState.querySelector("p").textContent = tasks.length === 0
    ? "Nothing here yet. Add your first task!"
    : "No tasks match this filter.";
  clearCompleted.disabled = !tasks.some(task => task.done);
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  tasks.unshift({ id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`, text, done: false });
  saveTasks();
  renderTasks();
  form.reset();
  taskInput.focus();
});

filters.forEach(button => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  filters.forEach(filterButton => {
    const selected = filterButton === button;
    filterButton.classList.toggle("active", selected);
    filterButton.setAttribute("aria-pressed", String(selected));
  });
  renderTasks();
}));

clearCompleted.addEventListener("click", () => {
  tasks = tasks.filter(task => !task.done);
  saveTasks();
  renderTasks();
});

function renderTheme() {
  const dark = document.body.classList.contains("dark");
  themeToggle.textContent = dark ? "☀ Light mode" : "☾ Dark mode";
  themeToggle.setAttribute("aria-pressed", String(dark));
}
try { if (localStorage.getItem(THEME_KEY) === "dark") document.body.classList.add("dark"); }
catch { /* browser storage can be disabled */ }
renderTheme();
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  try { localStorage.setItem(THEME_KEY, document.body.classList.contains("dark") ? "dark" : "light"); }
  catch { /* theme still works for this session */ }
  renderTheme();
});
renderTasks();
