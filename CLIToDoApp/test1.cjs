const fs = require("fs").promises;
const path = require("path");
const file = path.join(__dirname, "task.json");
const ensureFiles = async () => {
  try {
    await fs.access(file);
  } catch (err) {
    await fs.writeFile(file, "[]");
  }
};
const args = process.argv.slice(2);
const command = args[0];
const loadTasks = async () => {
  let data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};
const storeTasks = async (tasks) => {
  await fs.writeFile(file, JSON.stringify(tasks));
};
const now = () => new Date().toISOString();
const getId = (tasks) => {
  return tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
};
async function markStatus(s) {
  const id = args[1];
  if (!id) return console.log(`${id} not found`);
  let tasks = await loadTasks();
  let task = tasks.find((t) => t.id == id);
  if (!task) return console.log(`taask-id ${id} not found`);
  task.status = s;
  task.updatedAt = now();
  await storeTasks(tasks);
  return console.log(`Task marked successfully`);
}
const commands = {
  add: async () => {
    const description = args[1];
    if (!description) return console.log(`usage: add <task-description>`);
    let tasks = await loadTasks();
    const newTask = {
      id: getId(tasks),
      description,
      createdAt: now(),
      updatedAt: now(),
    };
    tasks.push(newTask);
    await storeTasks(tasks);
    return console.log(`Task id ${newTask.id} added successfully`);
  },
  update: async () => {
    const id = args[1];
    const description = args[2];
    if (!id || !description)
      return console.log(`usage: update <id> <task-description>`);
    let tasks = await loadTasks();
    let task = tasks.find((t) => t.id == id);
    if (!task) return console.log(`task-id ${id} not found`);
    task.description = description;
    task.updatedAt = now();
    await storeTasks(tasks);
    return console.log("Task updated successfully");
  },
  delete: async () => {
    const id = args[1];
    if (!id) return console.log("usage: delete <id>");
    let tasks = await loadTasks();
    if (!tasks.find((t) => t.id == id)) return console.log("invalid id");
    tasks = tasks.filter((t) => t.id != id);
    tasks = tasks.map((t, index) => ({
      ...t,
      id: index + 1,
    }));
    await storeTasks(tasks);
    return console.log("Task deleted successfully");
  },
  list: async () => {
    const status = args[1];
    const tasks = await loadTasks();
    if (!status) {
      tasks.forEach((t) => {
        console.log(`${t.id} ${t.description} ${t.createdAt} ${t.updatedAt}`);
      });
    } else {
      tasks.forEach((t) => {
        if (t.status == status) {
          console.log(`${t.id} ${t.description} ${t.createdAt} ${t.updatedAt}`);
        }
      });
    }
  },
  "mark-in-progress": async () => {
    await markStatus("in-progress");
  },
  "mark-done": async () => {
    await markStatus("done");
  },
};
(async () => {
  await ensureFiles();
  if (commands[command]) {
    await commands[command]();
  } else {
    console.log("Invalid command");
  }
})();
