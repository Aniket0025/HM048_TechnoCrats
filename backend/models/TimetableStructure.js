const mongoose = require('mongoose');

const timetableStructureSchema = new mongoose.Schema({
    academicYear: {
        type: String,
        required: true,
        enum: ['First Year', 'Second Year', 'Third Year', 'Final Year']
    },
    workingDays: {
        type: [String],
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    lecturesPerDay: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    lectureDuration: {
        type: Number,
        required: true,
        min: 30,
        max: 180
    },
    startTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    lunchBreak: {
        afterLecture: {
            type: Number,
            required: true
        },
        duration: {
            type: Number,
            required: true,
            min: 15,
            max: 120
        }
    },
    recessBreaks: [{
        afterLecture: Number,
        duration: Number
    }],
    constraints: [{
        type: {
            type: String,
            enum: ['NO_LECTURES_AFTER_LUNCH', 'LAB_ONLY_MORNING', 'LAB_ONLY_AFTERNOON', 'NO_BACK_TO_BACK_THEORY', 'SAME_SUBJECT_GAP']
        },
        value: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TimetableStructure', timetableStructureSchema);
