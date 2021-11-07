const mongoose = require ('mongoose');

const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    coverImageName: {
        type: String,
        required: false,
        default:images/missing_movie.png
    }
}); 

module.exports = mongoose.model ('Character', characterSchema)