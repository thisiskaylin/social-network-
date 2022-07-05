const mongoose = require('mongoose'); //we are using mongoose to connect

const config = require('config');
//we can get any of the files from the default.json file
const db = config.get('mongoURI'); 

//to connect to mongo db
const connectDB = async() => {
    try {
        await mongoose.connect(db, {
            
        });
        //mongoose.db returns a promise
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1); //Exit process with failure
    }
}

module.exports = connectDB;
