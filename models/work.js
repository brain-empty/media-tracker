const mongoose = require ('mongoose');

const workSchema = new mongoose.Schema ({
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff_roles'
    },
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie'
    },
    character: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"character"
    }
})

module.exports = mongoose.model ('Work', workSchema)