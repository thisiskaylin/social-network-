const express = require('express');//start an express server 

const app = express(); //take our app variable and set to express

//get request to response to res.sent, sent data to brower
app.get('/', (req, res) => res.send('API Running'));

//when we deploy to heroku, this is where wer get the port number
//locally we are gona run on port 5000, when port is not set this is the default port
const PORT = process.env.PORT || 5000; 

app.listen(PORT, ()=> console.log(`Server started on port ${PORT}`));