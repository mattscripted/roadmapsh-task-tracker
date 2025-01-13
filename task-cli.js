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
const state = {
  nextTaskId: 1,
  tasksById: {},
};

function loadOrCreateFile(filePath, defaultContent = '') {
  // Create file, if it does not yet exist
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, defaultContent, FILE_ENCODING);
  }

  return fs.readFileSync(filePath, FILE_ENCODING);
}

function loadOrCreateTasks() {
  const tasksFileContent = loadOrCreateFile(TASKS_FILE_PATH, JSON.stringify(state));

  // Update in-memory state from file contents
  const { nextTaskId, tasksById } = JSON.parse(tasksFileContent);
  state.nextTaskId = nextTaskId;
  state.tasksById = tasksById;
}

function saveTasks() {
  // Save in-memory state to file, so it can be read later
  fs.writeFileSync(TASKS_FILE_PATH, JSON.stringify(state), FILE_ENCODING);
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
  saveTasks();

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
  saveTasks();

  console.log(`Successfully updated task (id: ${id}).`);
}

function deleteTask(id) {
  // Check if task exists
  if (!Object.hasOwn(state.tasksById, id)) {
    throw new Error(`Unable to delete task (id: ${id} not found).`);
  }

  // Delete task, and save to file
  delete state.tasksById[id];
  saveTasks();

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
  console.groupEnd();
}

function main() {
  try {
    // Load tasks from file into memory
    loadOrCreateTasks();
  
    // Get arguments
    const args = process.argv.slice(2);
    const command = args[0];
    const commandArgs = args.slice(1);

    // Call command
    if (command === 'add') {
      // Add new task
      addTask({ description: commandArgs[0] })
    } else if (command === 'update') {
      // Update description for tasks
      const id = commandArgs[0];
      updateTask(id, { description: commandArgs[1] });
    } else if (command === 'mark-todo') {
      // Update status for task
      const id = commandArgs[0];
      updateTask(id, { status: TASK_STATUS.TODO });
    } else if (command === 'mark-in-progress') {
      // Update status for task
      const id = commandArgs[0];
      updateTask(id, { status: TASK_STATUS.IN_PROGRESS });
    } else if (command === 'mark-done') {
      // Update status for task
      const id = commandArgs[0];
      updateTask(id, { status: TASK_STATUS.DONE });
    } else if (command === 'delete') {
      // Delete task
      const id = commandArgs[0];
      deleteTask(id);
    } else if (command === 'list') {
      // List all tasks with optional filter
      listTasks({ status: commandArgs[0] });
    } else if (command === 'help') {
      // Show help menu
      help();
    } else {
      // Invalid command
      throw new Error(`Command not found: ${command}. Use "help" for a list of commands.`);
    }
  } catch (error) {
    // Catch and show all possible errors
    console.log(error.message);
  }
}

main();
