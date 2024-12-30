const mongoose = require('mongoose')

const urlSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true,
            unique: true
        },
        password:{
            type:String,
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        urls: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'URL'  // Reference to the URL collection
        }]
    }
)

const User = mongoose.model("User",urlSchema)

module.exports = User


