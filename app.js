const express = require("express");
const bodyParser = require("body-parser");
let ejs = require("ejs");
let https = require("https");
const getDate = require("./date");
const date = require(__dirname + "/date.js");

const app = express();

const newTodo = [];
const workTodo = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  const formattedDay = date.getDate();

  res.render("list", { listTitle: formattedDay, newListItem: newTodo });
});

app.post("/", (req, res) => {
  console.log(req.body);
  const todo = req.body.newTodo;
  const list = req.body.list;
  if (list === "Work") {
    if (todo.length > 0) {
      workTodo.push(todo);
      console.log(todo);
      res.redirect("work");
    }
  } else {
    if (todo.length > 0) {
      newTodo.push(todo);
      console.log(todo);
      res.redirect("/");
    }
  }
});

app.get("/work", (req, res) => {
  res.render("list", { listTitle: "Work", newListItem: workTodo });
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server opened on port 3000");
});
