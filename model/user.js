
const mongoose = require('mongoose'); 

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    status: {
        type: String,
        required: true,
        default:'I am new'
    },
    posts:[ {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Post'
    }]
});

//Export the model
module.exports = mongoose.model('User', userSchema);