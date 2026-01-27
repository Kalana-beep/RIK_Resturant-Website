const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// REMOVED THE DUPLICATE INDEX LINE - email already has unique: true above
// employeeSchema.index({ email: 1 }, { unique: true });

const EmployeeModel = mongoose.model('Employee', employeeSchema);

module.exports = EmployeeModel;