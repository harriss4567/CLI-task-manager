#!/usr/bin/env node
import path from "path";

// Storage location for tasks. Never deleted on startup.
export const TASKS_FILE = path.join(__dirname, "tasks.json");

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

type CommandHandler = (args: string[]) => void;

function handleAdd(args: string[]): void {
  console.log("add is not implemented yet");
}

function handleList(args: string[]): void {
  console.log("list is not implemented yet");
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
