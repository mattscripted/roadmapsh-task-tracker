# roadmapsh-task-tracker
https://roadmap.sh/projects/task-tracker

Track and manage tasks via CLI:
- Add, update, and delete tasks
- Mark a task as todo, in progress, or done
- List all tasks with optional filter (todo, in progress, done)

Constraints:
- Store tasks in a JSON file
- Use command-line to add, update, and delete tasks
- Do not use external libraries or frameworks

For example:
```sh
# Add a task
task-cli add "Buy groceries"
# Outut: Task added with id = 1

# Update a task description
task-cli update 1 "Buy groceries and cook dinner"

# Update a task's status
task-cli mark-todo 1
task-cli mark-in-progress 1
task-cli mark-done 1

# Delete a task
task-cli delete 1

# List all tasks
task-cli list

# List tasks by status
task-cli list todo
task-cli list in-progress
task-cli list done
```

Task properties:
- `id`
- `description`
- `status`
- `createdAt`
- `updatedAt`

## Debugging
To use `task-cli` instead of `./task-cli.js`:
- Install [nvm](https://github.com/nvm-sh/nvm)
- `nvm install node`
- `npm link` from the the folder with `task-cli.js`

If there are permision errors with running `task-cli.js`, try running:
```sh
chmod +x task-cli.js
```