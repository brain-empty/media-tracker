const mongoose = require ('mongoose');

const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    staff: {
        type: Array,
    },
    director: {
        type: mongoose.Schema.Types.ObjectId
    } 
});

module.exports = mongoose.model ('Movie', movieSchema)