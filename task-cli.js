#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const state = {
  nextTaskId: 0,
  // allTasks: [],
  tasksById: {},
};

function loadOrCreateFile(filePath, defaultContent = '') {
  // Create file if it does not yet exist
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, defaultContent, 'utf8');
  }

  return fs.readFileSync(filePath, 'utf8');
}

function loadOrCreateTasks() {
  const filePath = path.join(__dirname, 'tasks.json');
  const fileContent = loadOrCreateFile(filePath, JSON.stringify(state));

  const { nextTaskId, tasksById } = JSON.parse(fileContent);
  state.nextTaskId = nextTaskId;
  state.tasksById = tasksById;
}

function saveTasks() {
  // TODO: Reuse constant
  const filePath = path.join(__dirname, 'tasks.json');
  fs.writeFileSync(filePath, JSON.stringify(state), 'utf8');
}

function addTask({ description } = {}) {
  const { nextTaskId: id } = state;
  const createdAt = new Date();
  state.tasksById[id] = {
    id,
    description,
    status: 'todo',
    createdAt,
    updatedAt: createdAt,
  };
  
  state.nextTaskId++;
  saveTasks();

  console.log(`Added task with id = ${id}`);
}

function updateTask(id, { description, status } = {}) {
  // TODO: What if the task does not exist?
  state.tasksById[id] = {
    ...state.tasksById[id],
    description,
    status,
    updatedAt: new Date(),
  }
  saveTasks();

  console.log(`Updated task with id = ${id}`);
}

function deleteTask(id) {
  // TODO: What if the task does not exist?
  delete state.tasksById[id];
  saveTasks();

  console.log(`Deleted task with id = ${id}`);
}

function listTasks(filter = { status: undefined }) {
  console.log('TODO: filter', filter);
}

function main() {
  // Load tasks into memory
  loadOrCreateTasks();

  // Get arguments
  const args = process.argv.slice(2);
  const command = args[0];
  const commandArgs = args.slice(1);

  // Call command
  if (command === 'add') {
    addTask({ description: commandArgs[0] })
  } else if (command === 'update') {
    // Update description
    const id = commandArgs[0];
    updateTask(id, { description: commandArgs[1] });
  } else if (command === 'mark-todo') {
    // Update status
    const id = commandArgs[0];
    updateTask(id, { status: 'todo' });
  } else if (command === 'mark-in-progress') {
    // Update status
    const id = commandArgs[0];
    updateTask(id, { status: 'in-progress' });
  } else if (command === 'mark-done') {
    // Update status
    const id = commandArgs[0];
    updateTask(id, { status: 'done' });
  } else if (command === 'delete') {
    // Update status
    const id = commandArgs[0];
    deleteTask(id);
  } else if (command === 'list') {
    listTasks({ status: commandArgs[0] });
  }

  // TODO: Handle invalid commands
}

main();
