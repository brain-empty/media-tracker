const mongoose = require ('mongoose');

const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    director: {
        type: String,
        required: false,
    }
}); 

module.exports = mongoose.model ('Movie', movieSchema)