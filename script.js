// LocalStorage Integration
const Storage = {
  getTasks: () => JSON.parse(localStorage.getItem("tasks")) || [],
  saveTasks: (tasks) => localStorage.setItem("tasks", JSON.stringify(tasks)),
};

// Utility functions
const Utils = {
  createElement: (tag, className = "", innerHTML = "") => {
    const el = document.createElement(tag);
    el.className = className;
    el.innerHTML = innerHTML;
    return el;
  },
  updateStats: (tasks) => {
    document.getElementById("total-tasks").textContent = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    document.getElementById("completed-tasks").textContent = completed;
    document.querySelector(".progress-fill").style.width = tasks.length
      ? `${(completed / tasks.length) * 100}%`
      : "0%";
  },
};

// Task Manager
const TaskManager = {
  tasks: Storage.getTasks(),
  currentFilter: "all",

  addTask(text) {
    if (text.trim()) {
      this.tasks.push({
        id: Date.now(),
        text,
        completed: false,
        priority: "medium",
        createdAt: new Date(),
      });
      this.update();
    }
  },

  deleteTask(id) {
    this.tasks = this.tasks.filter((task) => task.id !== id);
    this.update();
  },

  toggleComplete(id) {
    this.tasks = this.tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    this.update();
  },

  update() {
    Storage.saveTasks(this.tasks);
    this.render();
  },

  render() {
    const tasksContainer = document.querySelector(".tasks-container");
    tasksContainer.innerHTML = "";

    const filteredTasks = this.tasks.filter((task) =>
      this.currentFilter === "completed"
        ? task.completed
        : this.currentFilter === "active"
        ? !task.completed
        : true
    );

    filteredTasks.forEach((task) => {
      const taskEl = Utils.createElement(
        "div",
        `task-item ${task.completed ? "completed" : ""}`
      );
      taskEl.setAttribute("data-id", task.id);
      taskEl.draggable = true;

      taskEl.innerHTML = `
        <div class="priority-indicator"></div>
        <div class="task-text" contenteditable="true">${task.text}</div>
        <div class="task-actions">
          <button class="delete-btn">🗑</button>
          <input type="checkbox" ${task.completed ? "checked" : ""}>
        </div>
      `;

      taskEl
        .querySelector(".delete-btn")
        .addEventListener("click", () => this.deleteTask(task.id));
      taskEl
        .querySelector("input[type='checkbox']")
        .addEventListener("change", () => this.toggleComplete(task.id));
      taskEl.querySelector(".task-text").addEventListener("blur", (e) => {
        task.text = e.target.innerText.trim();
        this.update();
      });

      tasksContainer.appendChild(taskEl);
    });

    Utils.updateStats(this.tasks);
  },
};

// Event Listeners
document.querySelector(".add-btn").addEventListener("click", () => {
  TaskManager.addTask(document.querySelector(".task-input").value);
  document.querySelector(".task-input").value = "";
});

document.querySelector(".task-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    TaskManager.addTask(e.target.value);
    e.target.value = "";
  }
});

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    TaskManager.currentFilter = btn.dataset.filter;
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    TaskManager.render();
  });
});

// Initialize Task Manager
TaskManager.render();


// Your existing JavaScript code (if any)

// OpenAI Chatbot Integration
const API_KEY = "YOUR_OPENAI_API_KEY"; // Replace with your API key

async function sendMessage() {
    let userInput = document.getElementById("user-input").value;
    if (!userInput) return;

    displayMessage("You: " + userInput, "user");

    let response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: userInput }]
        })
    });

    let data = await response.json();
    let botReply = data.choices[0].message.content;
    
    displayMessage("Bot: " + botReply, "bot");

    document.getElementById("user-input").value = "";
}

function displayMessage(text, sender) {
    let chatbox = document.getElementById("chatbox");
    let msg = document.createElement("div");
    msg.textContent = text;
    msg.style.margin = "5px";
    msg.style.padding = "5px";
    msg.style.borderRadius = "5px";
    msg.style.background = sender === "user" ? "#ddd" : "#f4f4f4";
    chatbox.appendChild(msg);
    chatbox.scrollTop = chatbox.scrollHeight;
}

// Optionally, you can call `sendMessage()` when Enter is pressed
document.getElementById("user-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});
