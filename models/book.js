const mongoose = require ('mongoose');

const coverImageBasePath = 'uploads/covers/books'

const bookSchema = new mongoose.Schema({
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

module.exports = mongoose.model ('Book', bookSchema)
module.exports.coverImageBasePath = coverImageBasePath