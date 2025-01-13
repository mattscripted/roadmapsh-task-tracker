#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const state = {
  nextTaskId: 1,
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

function addTask({ description }) {
  if (!description) {
    throw new Error(`Unable to add task (missing description).`);
  }

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

  console.log(`Successfully added task (id: ${id}).`);
}

function updateTask(id, changes) {
  if (!Object.hasOwn(state.tasksById, id)) {
    throw new Error(`Unable to update task (id: ${id} not found).`);
  }

  state.tasksById[id] = {
    ...state.tasksById[id],
    ...changes,
    updatedAt: new Date(),
  }
  saveTasks();

  console.log(`Successfully updated task (id: ${id}).`);
}

function deleteTask(id) {
  if (!Object.hasOwn(state.tasksById, id)) {
    throw new Error(`Unable to delete task (id: ${id} not found).`);
  }

  delete state.tasksById[id];
  saveTasks();

  console.log(`Successfully deleted task (id: ${id}).`);
}

function listTasks(filter = { status: undefined }) {
  const tasks = Object.values(state.tasksById);
  const filteredTasks = filter.status
    ? tasks.filter(task => task.status === filter.status)
    : tasks;

  console.log(filteredTasks);
}

function main() {
  try {
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
    } else {
      throw new Error(`Command not found: ${command}`);
    }
  } catch (error) {
    console.log(error.message);
  }
}

main();
