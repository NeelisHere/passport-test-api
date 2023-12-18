const mongoose = require('mongoose')
const schema = {
    googleId:{
        type: String,
    },
    username:{
        type: String,
    },
    email:{
        type: String,
    },
    picture:{
        type: String,
    },
}
const userSchema = new mongoose.Schema(schema)
const UserModel = mongoose.model('User', userSchema)
module.exports = UserModel