const mongoose = require ('mongoose');

const staff_workSchema = new mongoose.Schema({
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },
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
}); 

module.exports = mongoose.model ('Staff_work', staff_workSchema)
