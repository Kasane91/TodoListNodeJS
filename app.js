const express = require("express");
const bodyParser = require("body-parser");
let ejs = require("ejs");
let https = require("https");
const getDate = require("./date");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

mongoose.connect(
  "mongodb+srv://admin-sondre:test123@cluster0.rsua0.mongodb.net/todolist?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
  }
);

const itemsSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true],
  },
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const List = mongoose.model("List", listSchema);

const Item = mongoose.model("Item", itemsSchema);

const item_1 = new Item({
  description: "Welcome to your todolist!",
});

const item_2 = new Item({
  description: "Hit the + button to add a new item",
});

const item_3 = new Item({
  description: "<-- Hit this to delete an item ",
});

//

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  const formattedDay = date.getDay();

  Item.find((err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany([item_1, item_2, item_3], (err, doc) => {
        if (err) {
          console.log(err);
        } else console.log(doc);
      });
      res.redirect("/");
    } else {
      console.log(foundItems);
      res.render("list", { listTitle: formattedDay, newListItem: foundItems });
    }
  });
});

app.post("/", (req, res) => {
  console.log(req.body);
  const todo = req.body.newTodo;
  const listName = req.body.list;

  if (listName === date.getDay()) {
    if (todo.length > 0) {
      item = new Item({ description: todo });
      item.save();
      console.log(todo);
      res.redirect("/");
    }
  } else {
    const item = new Item({ description: req.body.newTodo });
    List.updateOne(
      { name: listName },
      { $push: { items: item } },
      (err, doc) => {
        if (err) {
          console.log(err);
        } else {
          console.log(doc);
          res.redirect(`/${listName}`);
        }
      }
    );
  }
});

app.post("/delete", (req, res) => {
  const checkedBoxId = req.body.checkbox;
  const listTitle = req.body.listTitle;
  if (listTitle === date.getDay()) {
    Item.findByIdAndRemove(checkedBoxId, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("A-Okay");
        setTimeout(() => {
          res.redirect("/");
        }, 1000);
      }
    });
  } else {
    console.log(`Delete an item with ID ${checkedBoxId}`);
    List.updateOne(
      { name: listTitle },
      { $pull: { items: { _id: checkedBoxId } } },
      (err, doc) => {
        if (err) {
          console.log(err);
        } else {
          setTimeout(() => {
            res.redirect(`/${listTitle}`);
          }, 1000);
        }
      }
    );
  }
});

app.get("/:listName", (req, res) => {
  const customListName = _.capitalize(req.params.listName);

  List.findOne({ name: customListName }, (err, results) => {
    if (err) {
      console.log(err);
    }
    if (!results) {
      const list = new List({
        name: customListName,
        items: [item_1, item_2, item_3],
      });
      list.save();
      res.redirect(`/${customListName}`);
    } else {
      console.log(results.items);
      res.render("list", {
        listTitle: results.name,
        newListItem: results.items,
      });
    }
  });
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server opened on port 3000");
});
