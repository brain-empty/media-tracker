const mongoose = require ('mongoose');

const roleSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    character: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"character"
    },
    movie: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie'
    }],
});

const staffSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    role: [roleSchema],
    summary: {
        type: String
    },
    birthdate: {
        type: Date
    },
    coverImageName: {
        type: String
    }
});

module.exports = mongoose.model ('Staff', staffSchema)