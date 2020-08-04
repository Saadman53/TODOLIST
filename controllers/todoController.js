//jshint esversion:6
const _ = require('lodash');

///requiring body-parser
const bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });

//database
const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://admin-saadman:54edbc19e3@cluster0.d1ihf.gcp.mongodb.net/todoDB",{useNewUrlParser:true, useUnifiedTopology: true});

///creating Schema
const todoSchema = new mongoose.Schema({
  item:String
});

//creating mongoose model
const TodoItem = mongoose.model("TodoItems",todoSchema);

///creating new list Schema
const listSchema= new mongoose.Schema({
  route:String,
  items:[todoSchema]
});
///creating model based on list listSchema
const List = mongoose.model("List",listSchema);

/// DATE AND TIME SETTINGS
let today = new Date();
let currentDay = today.getDay();
let options ={
  weekday:"long",
  // year:"numeric",
  month:"long",
  day:"numeric"
};
let day = today.toLocaleDateString("bn-BD",options);

///creating default items
var default_item1= new TodoItem({
  item:"Welcome to your TODO APP!"
});
var default_item2= new TodoItem({
  item:"Hit ADD(+) to add a new item"
});
var default_item3= new TodoItem({
  item:"Use checkbox to delete any item <--"
});
var defaultItems=[default_item1,default_item2,default_item3];

module.exports= function(app){

  ///seperate get request for home route
  app.get("/",function(req,res){
     console.log("getting");
     console.log(req.params.route);
     TodoItem.find({},function(err,todoItem){
         if(err){
           console.log("Error in DB");
         }
         else{
           if(todoItem.length===0){
             ///no items yet
             TodoItem.insertMany(defaultItems,function(err){
               if(err) console.log(err);
               else console.log("Successfully saved default items");
             });
             res.redirect("/");
           }
           else{
              res.render('list',{kindOfDay:day,listName:"Home",newListItems:todoItem});
           }
         }
     });
     //rendering a file called list which has to be
     //1. existant in views folder
     //2.File type must be ".ejs"
     //and we are passing a key-value pair in that list file
   });

   ///access multiple routes via parameters
   app.get("/:routeName",function(req,res){
     var ip=req.ip;
     console.log(ip);
     var routeName= _.capitalize(req.params.routeName); ///loadash used to capitalize 1st letter of route
     console.log("route clicked is: "+routeName); ///checking out routeName

     if(routeName==="Home"){ ///direct to home route
       console.log("Home is clicked");
       res.redirect("/");
     }
     else{
       List.findOne({route: routeName},function(err,foundList){
         if(!err){
           if(!foundList){
             ///create a new list
             const list= new List({
               route:routeName,
               items:defaultItems
             });
             list.save();
             res.redirect("/"+routeName);
           }
           else if(foundList && foundList.items.length===0){
             ///add default items to existant list
            foundList.items=defaultItems;
            foundList.save();
            res.redirect("/"+routeName);
           }
           else{
             ///list already exists
             console.log("Existant list");
             ///render list
            res.render('list',{kindOfDay:day,listName:foundList.route,newListItems:foundList.items});
           }
         }
       });
     }
   });

   ///delete operation
   app.post("/delete",urlencodedParser,function(req,res){
     var deleteListName = req.body.ListName;
     var deleteTaskID=req.body.checkbox;
     if(deleteListName==="Home"){
       TodoItem.findByIdAndDelete(deleteTaskID,function(err){
         if(!err){
           console.log("Successfully deleted task");
           res.redirect("/");
         }
         else{
           res.redirect("/");
         }
       });
     }
     else{
       ///deleting item from desired lists array of TodoItems
       List.findOneAndUpdate({route:deleteListName},{$pull:{items:{_id:deleteTaskID}}},function(err,foundList){
          if(!err){
            res.redirect("/"+deleteListName);
          }
       });
     }
   });

   app.post("/",urlencodedParser,function(req,res){
     var ListName=req.body.listaddButton;


       if(req.body.newItem!=''){
        const ItemName=req.body.newItem;
        const todoItem= new TodoItem({
          item:ItemName
        });
        if(ListName=="Home"){
          todoItem.save();
          res.redirect("/");
        }
        else{
          List.findOne({route:ListName},function(err,foundList){
            if(!err){
              foundList.items.push(todoItem);
              foundList.save();
              res.redirect("/"+ListName);
            }
          });
        }

       }
       else{
         console.log("Please enter a valid item");
         res.redirect("/"+ListName);
       }


   });
};
//e0d784
