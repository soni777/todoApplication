const express = require("express");
const app = express();
app.use(express.json());

module.exports = app;

const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

//db connection and intilize server
const intializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log(`server runs on http://localhost:3000/`);
    });
  } catch (e) {
    console.log(`DB ERROR: ${e.message}`);
    process.exit(1);
  }
};

intializeDBandServer();

// gET API 1 Returns a list of all todos whose status is 'TO DO'
app.get("/todos/", async (request, response) => {
  try {
    const { status, priority, search_q } = request.query;
    const getTodoQuery = `SELECT * FROM todo
    WHERE status LIKE '%${status}%' or
     priority LIKE '%${priority}%' or todo LIKE '%${search_q}%'`;
    const todos = await db.all(getTodoQuery);
    response.send(todos);
  } catch (e) {
    console.log(`Get API 1 ERROR: ${e.message}`);
  }
});

// GET Returns a specific todo based on the todo ID
app.get("/todos/:todoId", async (request, response) => {
  try {
    const { todoId } = request.params;
    // console.log(todoId);
    const getTodoQuery = `SELECT * FROM todo WHERE id=${todoId}`;
    const todo = await db.get(getTodoQuery);
    response.send(todo);
  } catch (e) {
    console.log(`Get API 2 ERROR: ${e.message}`);
  }
});

// POST Create a todo in the todo table
app.post("/todos/", async (request, response) => {
  try {
    const details = request.body;
    const { id, todo, priority, status } = details;
    const addTodoQuery = `INSERT INTO todo (id,todo,priority,status) VALUES (${id},'${todo}','${priority}','${status}');`;
    await db.run(addTodoQuery);
    response.send("Todo Successfully Added");
  } catch (e) {
    console.log(`POST API  ERROR: ${e.message}`);
  }
});

// Updates the details of a specific todo based on the todo ID
app.put("/todos/:todoId", async (request, response) => {
  try {
    const { todoId } = request.params;
    let updateColumn;
    const previousTodoQuery = `SELECT * FROM todo WHERE id =${todoId}`;
    const previousTodo = await db.get(previousTodoQuery);
    const {
      status = previousTodo.status,
      priority = previousTodo.priority,
      todo = previousTodo.todo,
    } = request.body;
    const updateTodoQuery = `UPDATE todo
    SET status ='${status}' , priority='${priority}',todo='${todo}' `;
    await db.run(updateTodoQuery);
    if (request.body.status !== undefined) {
      updateColumn = "Status";
    } else if (request.body.priority !== undefined) {
      updateColumn = "Priority";
    } else if (request.body.todo !== undefined) {
      updateColumn = "Todo";
    }

    response.send(`${updateColumn} Updated`);
  } catch (e) {
    console.log(`PUT API  ERROR: ${e.message}`);
  }
});

//Deletes a todo from the todo table based on the todo ID
app.delete("/todos/:todoId", async (request, response) => {
  try {
    const { todoId } = request.params;
    const addTodoQuery = `DELETE FROM todo WHERE id = ${todoId}`;
    await db.run(addTodoQuery);
    response.send("Todo Deleted");
  } catch (e) {
    console.log(`POST API  ERROR: ${e.message}`);
  }
});
