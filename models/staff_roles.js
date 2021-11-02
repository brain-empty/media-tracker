const mongoose = require ('mongoose');

const staff_rolesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }
}); 

module.exports = mongoose.model ('Staff_roles', staff_rolesSchema)
