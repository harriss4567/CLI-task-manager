#!/usr/bin/env node
import { addTask, listTasks } from "./task";

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

function handleComplete(args: string[]): void {
  console.log("complete is not implemented yet");
}

function handleDelete(args: string[]): void {
  console.log("delete is not implemented yet");
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
