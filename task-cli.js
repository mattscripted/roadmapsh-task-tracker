#!/usr/bin/env node

function addTask(props) {
  console.log('TODO: add task', props);
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
  const args = process.argv.slice(2);
  const command = args[0];
  const commandArgs = args.slice(1);

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
}

main();
