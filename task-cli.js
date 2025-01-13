#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Constants
const FILE_ENCODING = 'utf8';
const TASKS_FILE_PATH = path.join(__dirname, 'tasks.json');
const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done'
}
const DEFAULT_TASK_STATUS = TASK_STATUS.TODO;

// state is essentially a database table of tasks with an auto-increment id
const INITIAL_STATE = {
  nextTaskId: 1,
  tasksById: {},
}
let state = { ...INITIAL_STATE };

function loadOrCreateFile(filePath, defaultContent = '') {
  // Create file, if it does not yet exist
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, defaultContent, FILE_ENCODING);
  }

  return fs.readFileSync(filePath, FILE_ENCODING);
}

function loadOrCreateAllTasks() {
  const tasksFileContent = loadOrCreateFile(TASKS_FILE_PATH, JSON.stringify(INITIAL_STATE));

  // Update in-memory state from file contents
  const { nextTaskId, tasksById } = JSON.parse(tasksFileContent);
  state.nextTaskId = nextTaskId;
  state.tasksById = tasksById;
}

function saveAllTasks() {
  // Save in-memory state to file, so it can be read later
  fs.writeFileSync(TASKS_FILE_PATH, JSON.stringify(state), FILE_ENCODING);
}

function resetAllTasks() {
  // Reset state in memory and in file
  state = { ...INITIAL_STATE };
  fs.unlinkSync(TASKS_FILE_PATH);
}

function addTask({ description }) {
  // Validate parameters
  if (!description) {
    throw new Error(`Unable to add task (missing description).`);
  }

  // Create new task
  const { nextTaskId: id } = state;
  const createdAt = new Date();
  state.tasksById[id] = {
    id,
    description,
    status: DEFAULT_TASK_STATUS,
    createdAt,
    updatedAt: createdAt,
  };
  
  // Update auto-increment, and save tasks to file
  state.nextTaskId++;
  saveAllTasks();

  console.log(`Successfully added task (id: ${id}).`);
}

function updateTask(id, changes) {
  // Check if tasks exists
  if (!Object.hasOwn(state.tasksById, id)) {
    throw new Error(`Unable to update task (id: ${id} not found).`);
  }

  // Update task with changes, including updatedAt to current timestamp, and save to file
  state.tasksById[id] = {
    ...state.tasksById[id],
    ...changes,
    updatedAt: new Date(),
  }
  saveAllTasks();

  console.log(`Successfully updated task (id: ${id}).`);
}

function deleteTask(id) {
  // Check if task exists
  if (!Object.hasOwn(state.tasksById, id)) {
    throw new Error(`Unable to delete task (id: ${id} not found).`);
  }

  // Delete task, and save to file
  delete state.tasksById[id];
  saveAllTasks();

  console.log(`Successfully deleted task (id: ${id}).`);
}

function listTasks(filter = { status: undefined }) {
  // Convert object of tasks to array of tasks
  const tasks = Object.values(state.tasksById);

  // Filter tasks by status, if provided
  const filteredTasks = filter.status
    ? tasks.filter(task => task.status === filter.status)
    : tasks;

  // Display filtered tasks
  console.log(filteredTasks);
}

function help() {
  // Show help menu with all commands
  console.log('Usage: task-cli <command> [options]')
  console.log('Commands:')
  console.group();
  console.log('add <description>\t\tAdd task');
  console.log('update <id> <description>\tUpdate task description');
  console.log('delete <id>\t\t\tDelete task');
  console.log('mark-todo <id>\t\tMark task with todo status');
  console.log('mark-in-progress <id>\t\tMark task with in-progress status');
  console.log('mark-done <id>\t\tMark task with done status');
  console.log('list\t\t\t\tList all tasks');
  console.group();
  console.log('list todo\t\t\tList all tasks with todo status');
  console.log('list in-progress\t\tList all tasks with in-progress status');
  console.log('list done\t\t\tList all tasks with done status');
  console.groupEnd();
  console.log('reset\t\t\t\tDelete all tasks, and reset auto-increment')
  console.groupEnd();
}

function executeCommand(command, args) {
  const commands = {
    add: () => addTask({ description: args[0] }),
    update: () => updateTask(args[0], { description: args[1] }),
    delete: () => deleteTask(args[0]),
    'mark-todo': () => updateTask(args[0], { status: TASK_STATUS.TODO }),
    'mark-in-progress': () => updateTask(args[0], { status: TASK_STATUS.IN_PROGRESS }),
    'mark-done': () => updateTask(args[0], { status: TASK_STATUS.DONE }),
    list: () => listTasks({ status: args[0] }),
    reset: () => resetAllTasks(),
    help: () => help(),
  };

  // Call command if found, otherwise throw an error
  if (Object.hasOwn(commands, command)) {
    commands[command]();
  } else {
    throw new Error(`Command not found: ${command}. Use "help" for a list of commands.`);
  }
}

function main() {
  try {
    // Load tasks from file into memory
    loadOrCreateAllTasks();
  
    // Execute command with command arguments
    const args = process.argv.slice(2);
    const command = args[0];
    const commandArgs = args.slice(1);
    executeCommand(command, commandArgs);
  } catch (error) {
    // Catch and show all possible errors
    console.log(error.message);
  }
}

main();
