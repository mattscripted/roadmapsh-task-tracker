#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const state = {
  nextTaskId: 0,
  allTasks: [],
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

  const { nextTaskId, allTasks } = JSON.parse(fileContent);
  state.nextTaskId = nextTaskId;
  state.allTasks = allTasks;
}

function saveTasks() {
  // TODO: Reuse constant
  const filePath = path.join(__dirname, 'tasks.json');
  fs.writeFileSync(filePath, JSON.stringify(state), 'utf8');
}

function addTask({ description }) {
  const createdAt = new Date();
  state.allTasks.push({
    id: state.nextTaskId,
    description,
    status: 'todo',
    createdAt,
    updatedAt: createdAt,
  });
  state.nextTaskId++;

  saveTasks();
}

function updateTask(id, changes = { description: undefined, status: undefined }) {
  console.log('TODO: update task', id, changes);
}

function deleteTask(id) {
  console.log('TODO: delete task', id);
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
