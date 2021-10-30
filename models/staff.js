const mongoose = require ('mongoose');

const staffSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
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