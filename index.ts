#!/usr/bin/env node
import { addTask, completeTask, deleteTask, listTasks } from "./task";

export { TASKS_FILE, Task } from "./task";

type CommandHandler = (args: string[]) => void;

function handleAdd(args: string[]): void {
  const title = args.join(" ");
  if (!title.trim()) {
    throw new Error('Missing task title. Usage: task add <title>');
  }
  const task = addTask(title);
  console.log(`Added task #${task.id}: ${task.title}`);
}

function formatTable(headers: string[], rows: string[][]): string {
  const widths = headers.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i].length)));
  const formatRow = (cells: string[]) =>
    cells.map((cell, i) => cell.padEnd(widths[i])).join("  ").trimEnd();
  return [
    formatRow(headers),
    formatRow(widths.map((w) => "-".repeat(w))),
    ...rows.map(formatRow),
  ].join("\n");
}

function handleList(args: string[]): void {
  const tasks = listTasks();
  if (tasks.length === 0) {
    console.log("No tasks yet. Use add to create one.");
    return;
  }
  const rows = tasks.map((t) => [String(t.id), t.title, t.done ? "done" : "pending"]);
  console.log(formatTable(["ID", "Title", "Status"], rows));
}

function parseId(args: string[], command: string): number {
  const raw = args[0];
  if (raw === undefined) {
    throw new Error(`Missing task ID. Usage: task ${command} <id>`);
  }
  const id = Number(raw);
  if (!/^\d+$/.test(raw) || id <= 0) {
    throw new Error(`Invalid task ID "${raw}". IDs are positive whole numbers.`);
  }
  return id;
}

function handleComplete(args: string[]): void {
  const { task, alreadyDone } = completeTask(parseId(args, "complete"));
  if (alreadyDone) {
    console.log(`Task #${task.id} is already complete.`);
    return;
  }
  console.log(`Completed task #${task.id}: ${task.title}`);
}

function handleDelete(args: string[]): void {
  const task = deleteTask(parseId(args, "delete"));
  console.log(`Deleted task #${task.id}: ${task.title}`);
}

const commands: Record<string, CommandHandler> = {
  add: handleAdd,
  list: handleList,
  complete: handleComplete,
  delete: handleDelete,
};

function printUsage(): void {
  console.log(`Usage: task <command> [arguments]

Commands:
  add <title>      Add a new task
  list             List all tasks
  complete <id>    Mark a task as complete
  delete <id>      Delete a task`);
}

function main(): void {
  const [command, ...args] = process.argv.slice(2);

  if (!command || command === "help" || command === "--help" || command === "-h") {
    printUsage();
    return;
  }

  const handler = Object.hasOwn(commands, command) ? commands[command] : undefined;
  if (!handler) {
    console.error(`Unknown command: "${command}"\n`);
    printUsage();
    process.exitCode = 1;
    return;
  }

  try {
    handler(args);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error: ${message}`);
    process.exitCode = 1;
  }
}

main();
