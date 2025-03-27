
const mongoose = require("mongoose")
const bcrypt = require('bcrypt')



const UserShema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
})

UserShema.pre('save', async function (next) {
    if (!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// metodo para compara comtrase;a 
UserShema.methods.comparePassword = async function (candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model("User", UserShema)