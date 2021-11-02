const mongoose = require ('mongoose');

const staffSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff_roles'
    },
    summary: {
        type: String
    },
    birthdate: {
        type: Date
    },
    coverImageName: {
        type: String
    },
    character: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"character"
    },
    movie: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie'
    }]
});

module.exports = mongoose.model ('Staff', staffSchema)