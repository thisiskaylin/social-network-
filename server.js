const express = require('express');//start an express server 
const connectDB = require('./config/db'); //initiate

const app = express(); //take our app variable and set to express
connectDB(); //connect Database

//Init Middleware ->res.body in uses.js
app.use(express.json({ extended: false}));

//get request to response to res.sent, sent data to brower
app.get('/', (req, res) => res.send('API Running'));

//Define Routes
//the first / is used to ditinguish the / pretianie to the get(/)
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

//when we deploy to heroku, this is where wer get the port number
//locally we are gona run on port 5000, when port is not set this is the default port
const PORT = process.env.PORT || 5000; 

app.listen(PORT, ()=> console.log(`Server started on port ${PORT}`));