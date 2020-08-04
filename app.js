//jshint esversion:6

 const express = require('express');
 const app = express();

 var todoController = require('./controllers/todoController');
 app.set("view engine","ejs");

 app.use(express.static("public")); //a relative folder to refer to static files in relative place

 todoController(app);

 app.listen(3000,function(){
   console.log("Listening to server 3000");
 });

 /*
 <% if(kindOfDay ==="Friday" || kindOfDay==="Saturday") {%>
   <h1 style="color:purple"><%= kindOfDay %> to-do List</h1>
 <% }else{ %>
   <h1 style="color:blue"><%= kindOfDay %> to-do List</h1>
 <% } %>
 */
///A683E3
///.item :#F1F1F1
