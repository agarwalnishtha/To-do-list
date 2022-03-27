//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-nishtha:Test123@cluster0.ipxor.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
  name : String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name : "Welcome to your todolist!"
});

const item2 = new Item({
  name : "Hit the + button to add a new item."
});

const item3 = new Item({
  name : "<--Hit this to delete an item."
});

const listSchema = new mongoose.Schema({
  name : String,
  items : [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  const day = date.getDate();

  Item.find(function(err, items){

    if (items.length === 0) {
      Item.insertMany([item1,item2,item3], function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("added successfully");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: day, newListItems: items});
    }
  });

});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:customListName", function(req,res){
  //console.log(req.params.customListName);
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name : customListName}, function(err,foundList){
    if(!err){
      if(!foundList){
        //console.log("doesnt exist");
        //create a new list
        const list = new List({
          name : customListName,
          items : [item1,item2,item3]
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else{
        //console.log("exists");
        //show an existing list
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name : itemName
  });

  if (listName === date.getDate()) {
      item.save();
      res.redirect("/");

  }
  else {
    List.findOne({name : listName}, function(err, foundList){
          foundList.items.push(item);
          foundList.save();
          res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === date.getDate()){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("deleted successfully.");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name : listName}, {$pull: {items : {_id : checkedItemId}}}, function(err,foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started successfully
  ");
});

//https://infinite-spire-90551.herokuapp.com/ 
