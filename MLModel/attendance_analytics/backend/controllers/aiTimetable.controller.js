const AITimetableGenerator = require('../services/AITimetableGenerator');
const TimetableStructure = require('../models/TimetableStructure');
const Timetable = require('../models/Timetable');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Batch = require('../models/Batch');

class AITimetableController {
    constructor() {
        this.generator = new AITimetableGenerator();
    }

    // Step 1: Get academic years
    async getAcademicYears(req, res) {
        try {
            const academicYears = await Batch.distinct('academicYear');
            res.json({
                success: true,
                data: academicYears
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Step 2: Create timetable structure
    async createTimetableStructure(req, res) {
        try {
            const structureData = {
                ...req.body,
                createdBy: req.user.id
            };

            const structure = new TimetableStructure(structureData);
            await structure.save();

            res.status(201).json({
                success: true,
                message: 'Timetable structure created successfully',
                data: structure
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Step 3: Get timetable structures
    async getTimetableStructures(req, res) {
        try {
            const structures = await TimetableStructure.find({ 
                isActive: true,
                createdBy: req.user.id 
            }).sort({ createdAt: -1 });

            res.json({
                success: true,
                data: structures
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Step 4: Get academic data preview
    async getAcademicDataPreview(req, res) {
        try {
            const { academicYear, semester } = req.query;

            if (!academicYear || !semester) {
                return res.status(400).json({
                    success: false,
                    message: 'Academic year and semester are required'
                });
            }

            // Fetch faculty
            const faculty = await User.find({ 
                role: 'teacher',
                isActive: true 
            }).select('name email subjects').populate('subjects');

            // Fetch subjects
            const subjects = await Subject.find({
                academicYear,
                semester
            }).populate('divisions');

            // Fetch divisions
            const divisions = await Batch.find({
                academicYear
            });

            // Process data
            const processedData = {
                faculty: faculty.map(f => ({
                    id: f._id,
                    name: f.name,
                    email: f.email,
                    subjects: f.subjects.map(s => ({
                        id: s._id,
                        name: s.name,
                        code: s.code,
                        type: s.type
                    }))
                })),
                subjects: subjects.map(s => ({
                    id: s._id,
                    name: s.name,
                    code: s.code,
                    type: s.type,
                    lecturesPerWeek: s.lecturesPerWeek || 3,
                    difficulty: s.difficulty || 'Medium',
                    divisions: s.divisions.map(d => ({
                        id: d._id,
                        name: d.name
                    }))
                })),
                divisions: divisions.map(d => ({
                    id: d._id,
                    name: d.name,
                    academicYear: d.academicYear,
                    studentCount: d.students ? d.students.length : 0
                }))
            };

            res.json({
                success: true,
                data: processedData
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Step 5: Generate AI timetable
    async generateAITimetable(req, res) {
        try {
            const { academicYear, semester, structureId } = req.body;

            if (!academicYear || !semester || !structureId) {
                return res.status(400).json({
                    success: false,
                    message: 'Academic year, semester, and structure ID are required'
                });
            }

            // Check if structure exists
            const structure = await TimetableStructure.findById(structureId);
            if (!structure) {
                return res.status(404).json({
                    success: false,
                    message: 'Timetable structure not found'
                });
            }

            // Start generation process
            console.log('🎯 Starting AI Timetable Generation...');
            console.log(`📚 Academic Year: ${academicYear}`);
            console.log(`📖 Semester: ${semester}`);
            console.log(`🏗️ Structure ID: ${structureId}`);

            // Generate timetables
            const timetables = await this.generator.generateTimetable(
                academicYear, 
                semester, 
                structureId
            );

            // Save timetables to database
            const savedTimetables = [];
            for (const timetableData of timetables) {
                const timetable = new Timetable({
                    ...timetableData,
                    generatedBy: req.user.id
                });
                await timetable.save();
                savedTimetables.push(timetable);
            }

            res.status(201).json({
                success: true,
                message: 'AI timetable generated successfully',
                data: {
                    timetables: savedTimetables,
                    statistics: this.calculateOverallStatistics(savedTimetables)
                }
            });

        } catch (error) {
            console.error('❌ Error generating AI timetable:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Step 6: Get generated timetables
    async getGeneratedTimetables(req, res) {
        try {
            const { academicYear, semester, status } = req.query;

            const filter = {};
            if (academicYear) filter.academicYear = academicYear;
            if (semester) filter.semester = semester;
            if (status) filter.status = status;

            const timetables = await Timetable.find(filter)
                .populate('division', 'name academicYear')
                .populate('structure', 'workingDays lecturesPerDay')
                .populate('generatedBy', 'name')
                .sort({ createdAt: -1 });

            res.json({
                success: true,
                data: timetables
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Step 7: Get specific timetable with details
    async getTimetableDetails(req, res) {
        try {
            const { id } = req.params;

            const timetable = await Timetable.findById(id)
                .populate('division', 'name academicYear')
                .populate('slots.subject', 'name code type')
                .populate('slots.faculty', 'name email')
                .populate('structure');

            if (!timetable) {
                return res.status(404).json({
                    success: false,
                    message: 'Timetable not found'
                });
            }

            // Format timetable for display
            const formattedTimetable = this.formatTimetableForDisplay(timetable);

            res.json({
                success: true,
                data: {
                    timetable,
                    formattedTimetable
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Step 8: Publish timetable
    async publishTimetable(req, res) {
        try {
            const { id } = req.params;

            const timetable = await Timetable.findByIdAndUpdate(
                id,
                { 
                    status: 'PUBLISHED',
                    publishedAt: new Date()
                },
                { new: true }
            );

            if (!timetable) {
                return res.status(404).json({
                    success: false,
                    message: 'Timetable not found'
                });
            }

            res.json({
                success: true,
                message: 'Timetable published successfully',
                data: timetable
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Step 9: Update timetable
    async updateTimetable(req, res) {
        try {
            const { id } = req.params;
            const { slots } = req.body;

            const timetable = await Timetable.findByIdAndUpdate(
                id,
                { 
                    slots,
                    conflicts: this.detectConflicts(slots)
                },
                { new: true }
            );

            if (!timetable) {
                return res.status(404).json({
                    success: false,
                    message: 'Timetable not found'
                });
            }

            // Recalculate statistics
            timetable.statistics = this.calculateStatistics(timetable);
            await timetable.save();

            res.json({
                success: true,
                message: 'Timetable updated successfully',
                data: timetable
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Helper method to format timetable for display
    formatTimetableForDisplay(timetable) {
        const formatted = {};
        const structure = timetable.structure;

        // Initialize structure
        structure.workingDays.forEach(day => {
            formatted[day] = [];
            for (let i = 1; i <= structure.lecturesPerDay; i++) {
                formatted[day].push({
                    lectureNumber: i,
                    subject: null,
                    faculty: null,
                    room: null,
                    isBreak: false
                });
            }
        });

        // Fill with actual slots
        timetable.slots.forEach(slot => {
            if (formatted[slot.day] && formatted[slot.day][slot.lectureNumber - 1]) {
                formatted[slot.day][slot.lectureNumber - 1] = {
                    lectureNumber: slot.lectureNumber,
                    subject: slot.subject,
                    faculty: slot.faculty,
                    room: slot.room,
                    isBreak: slot.isBreak,
                    breakType: slot.breakType,
                    isLab: slot.isLab
                };
            }
        });

        return formatted;
    }

    // Helper method to calculate overall statistics
    calculateOverallStatistics(timetables) {
        const totalTimetables = timetables.length;
        const totalConflicts = timetables.reduce((sum, t) => sum + (t.conflicts?.length || 0), 0);
        const avgComplianceScore = timetables.reduce((sum, t) => sum + (t.statistics?.complianceScore || 0), 0) / totalTimetables;

        return {
            totalTimetables,
            totalConflicts,
            avgComplianceScore: avgComplianceScore.toFixed(2),
            status: totalConflicts === 0 ? 'OPTIMAL' : 'NEEDS_REVIEW'
        };
    }

    // Helper method to detect conflicts
    detectConflicts(slots) {
        const conflicts = [];
        const facultySchedule = new Map();
        const roomSchedule = new Map();

        slots.forEach(slot => {
            if (slot.isBreak) return;

            const key = `${slot.day}-${slot.lectureNumber}`;

            if (slot.faculty) {
                if (facultySchedule.has(key)) {
                    const existing = facultySchedule.get(key);
                    if (existing.faculty.toString() === slot.faculty.toString()) {
                        conflicts.push({
                            type: 'FACULTY_DOUBLE_BOOKING',
                            description: `Faculty double booked on ${slot.day} at lecture ${slot.lectureNumber}`,
                            severity: 'HIGH'
                        });
                    }
                }
                facultySchedule.set(key, slot);
            }

            if (slot.room) {
                if (roomSchedule.has(key)) {
                    const existing = roomSchedule.get(key);
                    if (existing.room === slot.room) {
                        conflicts.push({
                            type: 'ROOM_DOUBLE_BOOKING',
                            description: `Room ${slot.room} double booked on ${slot.day} at lecture ${slot.lectureNumber}`,
                            severity: 'MEDIUM'
                        });
                    }
                }
                roomSchedule.set(key, slot);
            }
        });

        return conflicts;
    }

    // Helper method to calculate statistics
    calculateStatistics(timetable) {
        const totalSlots = timetable.slots.filter(s => !s.isBreak).length;
        const theorySlots = timetable.slots.filter(s => !s.isBreak && !s.isLab).length;
        const labSlots = timetable.slots.filter(s => !s.isBreak && s.isLab).length;

        return {
            totalLectures: totalSlots,
            theoryLectures: theorySlots,
            labLectures: labSlots,
            facultyUtilization: 85, // Simplified
            roomUtilization: 75, // Simplified
            complianceScore: Math.max(0, 100 - (timetable.conflicts?.length || 0) * 10)
        };
    }
}

module.exports = new AITimetableController();
