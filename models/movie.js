const mongoose = require ('mongoose');

const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    staff: {
        type: Array,
        required: false,
    }
});

module.exports = mongoose.model ('Movie', movieSchema)