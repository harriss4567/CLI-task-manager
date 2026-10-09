import fs from "fs";
import path from "path";

// Storage location for tasks. Never deleted on startup.
export const TASKS_FILE = path.join(__dirname, "tasks.json");

export interface Task {
  id: number;
  title: string;
  done: boolean;
  createdAt: string;
}

function loadTasks(): Task[] {
  if (!fs.existsSync(TASKS_FILE)) {
    fs.writeFileSync(TASKS_FILE, "[]\n", "utf8");
  }

  const raw = fs.readFileSync(TASKS_FILE, "utf8");
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`${TASKS_FILE} contains invalid JSON. Fix or remove it and try again.`);
  }

  if (!Array.isArray(data)) {
    throw new Error(`${TASKS_FILE} must contain a JSON array of tasks.`);
  }
  return data as Task[];
}

function saveTasks(tasks: Task[]): void {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2) + "\n", "utf8");
}

function findTaskIndex(tasks: Task[], id: number): number {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error(`No task with ID ${id}. Run "list" to see task IDs.`);
  }
  return index;
}

export function listTasks(): Task[] {
  return loadTasks();
}

export function addTask(title: string): Task {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("Task title cannot be empty.");
  }

  const tasks = loadTasks();
  const nextId = tasks.reduce((max, t) => (t.id > max ? t.id : max), 0) + 1;
  const task: Task = {
    id: nextId,
    title: trimmed,
    done: false,
    createdAt: new Date().toISOString(),
  };

  tasks.push(task);
  saveTasks(tasks);
  return task;
}

export function completeTask(id: number): { task: Task; alreadyDone: boolean } {
  const tasks = loadTasks();
  const task = tasks[findTaskIndex(tasks, id)];
  if (task.done) {
    return { task, alreadyDone: true };
  }

  task.done = true;
  saveTasks(tasks);
  return { task, alreadyDone: false };
}

export function deleteTask(id: number): Task {
  const tasks = loadTasks();
  const [task] = tasks.splice(findTaskIndex(tasks, id), 1);
  saveTasks(tasks);
  return task;
}
