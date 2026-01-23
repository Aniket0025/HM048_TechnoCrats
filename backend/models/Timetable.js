const mongoose = require('mongoose');

const timetableSlotSchema = new mongoose.Schema({
    day: {
        type: String,
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    lectureNumber: {
        type: Number,
        required: true,
        min: 1
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    division: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true
    },
    room: {
        type: String,
        required: true
    },
    isLab: {
        type: Boolean,
        default: false
    },
    isBreak: {
        type: Boolean,
        default: false
    },
    breakType: {
        type: String,
        enum: ['LUNCH', 'RECESS']
    }
});

const timetableSchema = new mongoose.Schema({
    academicYear: {
        type: String,
        required: true,
        enum: ['First Year', 'Second Year', 'Third Year', 'Final Year']
    },
    division: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true
    },
    semester: {
        type: String,
        required: true,
        enum: ['Odd', 'Even']
    },
    slots: [timetableSlotSchema],
    structure: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TimetableStructure',
        required: true
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
        default: 'DRAFT'
    },
    version: {
        type: Number,
        default: 1
    },
    conflicts: [{
        type: {
            type: String,
            enum: ['FACULTY_DOUBLE_BOOKING', 'ROOM_DOUBLE_BOOKING', 'SUBJECT_OVERLOAD', 'CONSTRAINT_VIOLATION']
        },
        description: String,
        severity: {
            type: String,
            enum: ['LOW', 'MEDIUM', 'HIGH'],
            default: 'MEDIUM'
        }
    }],
    statistics: {
        totalLectures: Number,
        theoryLectures: Number,
        labLectures: Number,
        facultyUtilization: Number,
        roomUtilization: Number,
        complianceScore: Number
    }
}, {
    timestamps: true
});

// Index for efficient queries
timetableSchema.index({ academicYear: 1, division: 1, semester: 1 });
timetableSchema.index({ status: 1 });

module.exports = mongoose.model('Timetable', timetableSchema);
