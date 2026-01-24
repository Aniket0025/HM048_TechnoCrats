const User = require('../models/User');
const Subject = require('../models/Subject');
const Batch = require('../models/Batch');
const TimetableStructure = require('../models/TimetableStructure');
const Timetable = require('../models/Timetable');

class AITimetableGenerator {
    constructor() {
        this.constraints = [];
        this.facultyAvailability = new Map();
        this.roomAvailability = new Map();
        this.subjectRequirements = new Map();
    }

    /**
     * Main method to generate optimized timetable
     */
    async generateTimetable(academicYear, semester, structureId) {
        try {
            console.log('🚀 Starting AI Timetable Generation...');
            
            // Step 1: Fetch all required data
            const data = await this.fetchAcademicData(academicYear, semester);
            const structure = await TimetableStructure.findById(structureId);
            
            if (!structure) {
                throw new Error('Timetable structure not found');
            }

            // Step 2: Initialize constraints and availability
            this.initializeConstraints(structure);
            this.initializeAvailability(data.divisions, structure);

            // Step 3: Generate timetables for each division
            const timetables = [];
            for (const division of data.divisions) {
                console.log(`📚 Generating timetable for ${division.name}...`);
                const timetable = await this.generateDivisionTimetable(
                    division, 
                    data.subjects, 
                    data.faculty, 
                    structure
                );
                timetables.push(timetable);
            }

            // Step 4: Optimize and resolve conflicts
            const optimizedTimetables = await this.optimizeTimetables(timetables);

            // Step 5: Calculate statistics
            for (const timetable of optimizedTimetables) {
                timetable.statistics = this.calculateStatistics(timetable, structure);
            }

            console.log('✅ Timetable generation completed successfully!');
            return optimizedTimetables;

        } catch (error) {
            console.error('❌ Error generating timetable:', error);
            throw error;
        }
    }

    /**
     * Fetch all academic data from database
     */
    async fetchAcademicData(academicYear, semester) {
        console.log('📊 Fetching academic data...');
        
        const faculty = await User.find({ 
            role: 'teacher',
            isActive: true 
        }).populate('subjects');

        const subjects = await Subject.find({
            academicYear,
            semester
        });

        const divisions = await Batch.find({
            academicYear
        });

        return {
            faculty,
            subjects,
            divisions
        };
    }

    /**
     * Initialize constraints from structure
     */
    initializeConstraints(structure) {
        this.constraints = structure.constraints || [];
        this.workingDays = structure.workingDays;
        this.lecturesPerDay = structure.lecturesPerDay;
        this.lunchBreak = structure.lunchBreak;
    }

    /**
     * Initialize availability maps
     */
    initializeAvailability(divisions, structure) {
        // Initialize faculty availability
        divisions.forEach(division => {
            this.facultyAvailability.set(division._id.toString(), new Map());
            this.roomAvailability.set(division._id.toString(), new Map());
        });

        // Create time slots
        this.timeSlots = [];
        for (let lecture = 1; lecture <= structure.lecturesPerDay; lecture++) {
            this.timeSlots.push(lecture);
        }
    }

    /**
     * Generate timetable for a single division
     */
    async generateDivisionTimetable(division, subjects, faculty, structure) {
        const timetable = {
            academicYear: division.academicYear,
            division: division._id,
            semester: 'Odd', // This should be dynamic
            slots: [],
            structure: structure._id,
            conflicts: []
        };

        // Get subjects for this division
        const divisionSubjects = subjects.filter(subject => 
            subject.divisions.includes(division._id)
        );

        // Create subject requirements map
        this.createSubjectRequirements(divisionSubjects, division._id);

        // Generate slots for each day
        for (const day of structure.workingDays) {
            const daySlots = await this.generateDaySlots(
                day, 
                division, 
                divisionSubjects, 
                faculty, 
                structure
            );
            timetable.slots.push(...daySlots);
        }

        // Check for conflicts
        timetable.conflicts = this.detectConflicts(timetable.slots);

        return timetable;
    }

    /**
     * Create subject requirements map
     */
    createSubjectRequirements(subjects, divisionId) {
        this.subjectRequirements.set(divisionId.toString(), new Map());
        
        subjects.forEach(subject => {
            const lecturesPerWeek = subject.lecturesPerWeek || 3;
            this.subjectRequirements.get(divisionId.toString()).set(subject._id.toString(), {
                subject,
                remainingLectures: lecturesPerWeek,
                totalLectures: lecturesPerWeek
            });
        });
    }

    /**
     * Generate slots for a single day
     */
    async generateDaySlots(day, division, subjects, faculty, structure) {
        const daySlots = [];
        const divisionId = division._id.toString();

        for (let lecture = 1; lecture <= structure.lecturesPerDay; lecture++) {
            // Check if this is a break slot
            if (this.isBreakSlot(lecture, structure)) {
                daySlots.push(this.createBreakSlot(day, lecture, structure));
                continue;
            }

            // Find best available slot
            const slot = await this.findBestSlot(
                day, 
                lecture, 
                division, 
                subjects, 
                faculty, 
                structure
            );

            if (slot) {
                daySlots.push(slot);
            } else {
                // Create empty slot
                daySlots.push(this.createEmptySlot(day, lecture, division));
            }
        }

        return daySlots;
    }

    /**
     * Check if slot is a break
     */
    isBreakSlot(lecture, structure) {
        return lecture === structure.lunchBreak.afterLecture;
    }

    /**
     * Create break slot
     */
    createBreakSlot(day, lecture, structure) {
        return {
            day,
            lectureNumber: lecture,
            isBreak: true,
            breakType: lecture === structure.lunchBreak.afterLecture ? 'LUNCH' : 'RECESS'
        };
    }

    /**
     * Create empty slot
     */
    createEmptySlot(day, lecture, division) {
        return {
            day,
            lectureNumber: lecture,
            division: division._id,
            room: 'FREE',
            isBreak: false
        };
    }

    /**
     * Find best available slot using AI algorithm
     */
    async findBestSlot(day, lecture, division, subjects, faculty, structure) {
        const divisionId = division._id.toString();
        const requirements = this.subjectRequirements.get(divisionId);
        
        if (!requirements || requirements.size === 0) {
            return null;
        }

        // Get available subjects
        const availableSubjects = Array.from(requirements.entries())
            .filter(([_, req]) => req.remainingLectures > 0)
            .map(([_, req]) => req.subject);

        if (availableSubjects.length === 0) {
            return null;
        }

        // Score each possible subject for this slot
        const scoredSubjects = await this.scoreSubjectsForSlot(
            availableSubjects, 
            day, 
            lecture, 
            division, 
            faculty, 
            structure
        );

        // Select best subject
        const bestSubject = scoredSubjects[0];
        if (!bestSubject) {
            return null;
        }

        // Find available faculty
        const availableFaculty = await this.findAvailableFaculty(
            bestSubject.subject, 
            day, 
            lecture, 
            faculty
        );

        if (!availableFaculty) {
            return null;
        }

        // Find available room
        const room = await this.findAvailableRoom(
            bestSubject.subject, 
            day, 
            lecture, 
            division
        );

        // Update requirements
        const subjectReq = requirements.get(bestSubject.subject._id.toString());
        subjectReq.remainingLectures--;

        return {
            day,
            lectureNumber: lecture,
            subject: bestSubject.subject._id,
            faculty: availableFaculty._id,
            division: division._id,
            room: room || `Room-${Math.floor(Math.random() * 100)}`,
            isLab: bestSubject.subject.type === 'Lab'
        };
    }

    /**
     * Score subjects for a specific slot using AI
     */
    async scoreSubjectsForSlot(subjects, day, lecture, division, faculty, structure) {
        const scores = [];

        for (const subject of subjects) {
            let score = 0;

            // Factor 1: Subject priority (based on difficulty and importance)
            score += this.calculateSubjectPriority(subject, lecture);

            // Factor 2: Faculty availability and preference
            score += this.calculateFacultyScore(subject, day, lecture, faculty);

            // Factor 3: Room availability
            score += this.calculateRoomScore(subject, day, lecture);

            // Factor 4: Time slot preferences
            score += this.calculateTimeSlotScore(subject, lecture, structure);

            // Factor 5: Balance across week
            score += this.calculateBalanceScore(subject, day);

            scores.push({
                subject,
                score
            });
        }

        return scores.sort((a, b) => b.score - a.score);
    }

    /**
     * Calculate subject priority score
     */
    calculateSubjectPriority(subject, lecture) {
        let score = 50; // Base score

        // Prefer difficult subjects in morning slots
        if (subject.difficulty === 'High' && lecture <= 3) {
            score += 20;
        }

        // Prefer lab sessions in specific slots
        if (subject.type === 'Lab' && lecture >= 4) {
            score += 15;
        }

        // Prefer theory subjects in morning
        if (subject.type === 'Theory' && lecture <= 4) {
            score += 10;
        }

        return score;
    }

    /**
     * Calculate faculty availability score
     */
    calculateFacultyScore(subject, day, lecture, faculty) {
        const subjectFaculty = faculty.filter(f => 
            f.subjects.some(s => s.toString() === subject._id.toString())
        );

        if (subjectFaculty.length === 0) {
            return -1000; // No faculty available
        }

        let score = 0;
        for (const fac of subjectFaculty) {
            // Check if faculty is available
            if (this.isFacultyAvailable(fac, day, lecture)) {
                score += 30;
            }
        }

        return score / subjectFaculty.length;
    }

    /**
     * Calculate room availability score
     */
    calculateRoomScore(subject, day, lecture) {
        // Simplified room scoring
        if (subject.type === 'Lab') {
            return 20; // Prefer lab rooms for lab subjects
        }
        return 10;
    }

    /**
     * Calculate time slot preference score
     */
    calculateTimeSlotScore(subject, lecture, structure) {
        let score = 0;

        // Avoid same subject back-to-back
        score += lecture > 1 ? -5 : 0;

        // Prefer certain subjects at certain times
        if (subject.type === 'Theory' && lecture === 1) {
            score += 10; // First slot for theory
        }

        return score;
    }

    /**
     * Calculate balance score across week
     */
    calculateBalanceScore(subject, day) {
        // Simplified balance calculation
        const dayIndex = this.workingDays.indexOf(day);
        return Math.random() * 10; // Add some randomness for variety
    }

    /**
     * Check if faculty is available
     */
    isFacultyAvailable(faculty, day, lecture) {
        // Simplified availability check
        // In real implementation, check faculty's schedule and preferences
        return true;
    }

    /**
     * Find available faculty for subject
     */
    async findAvailableFaculty(subject, day, lecture, faculty) {
        const availableFaculty = faculty.filter(f => 
            f.subjects.some(s => s.toString() === subject._id.toString()) &&
            this.isFacultyAvailable(f, day, lecture)
        );

        return availableFaculty.length > 0 ? availableFaculty[0] : null;
    }

    /**
     * Find available room
     */
    async findAvailableRoom(subject, day, lecture, division) {
        // Simplified room allocation
        if (subject.type === 'Lab') {
            return `Lab-${Math.floor(Math.random() * 10) + 1}`;
        }
        return `Room-${Math.floor(Math.random() * 50) + 1}`;
    }

    /**
     * Detect conflicts in timetable
     */
    detectConflicts(slots) {
        const conflicts = [];
        const facultySchedule = new Map();
        const roomSchedule = new Map();

        for (const slot of slots) {
            if (slot.isBreak) continue;

            const key = `${slot.day}-${slot.lectureNumber}`;

            // Check faculty conflicts
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

            // Check room conflicts
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
        }

        return conflicts;
    }

    /**
     * Optimize timetables to resolve conflicts
     */
    async optimizeTimetables(timetables) {
        console.log('🔄 Optimizing timetables...');

        for (const timetable of timetables) {
            // Resolve conflicts
            while (timetable.conflicts.length > 0) {
                const conflict = timetable.conflicts.shift();
                await this.resolveConflict(timetable, conflict);
            }
        }

        return timetables;
    }

    /**
     * Resolve individual conflict
     */
    async resolveConflict(timetable, conflict) {
        // Simplified conflict resolution
        // In real implementation, use more sophisticated algorithms
        console.log(`🔧 Resolving conflict: ${conflict.description}`);
    }

    /**
     * Calculate timetable statistics
     */
    calculateStatistics(timetable, structure) {
        const totalSlots = timetable.slots.filter(s => !s.isBreak).length;
        const theorySlots = timetable.slots.filter(s => !s.isBreak && !s.isLab).length;
        const labSlots = timetable.slots.filter(s => !s.isBreak && s.isLab).length;

        return {
            totalLectures: totalSlots,
            theoryLectures: theorySlots,
            labLectures: labSlots,
            facultyUtilization: this.calculateFacultyUtilization(timetable),
            roomUtilization: this.calculateRoomUtilization(timetable),
            complianceScore: this.calculateComplianceScore(timetable, structure)
        };
    }

    /**
     * Calculate faculty utilization
     */
    calculateFacultyUtilization(timetable) {
        const facultySlots = new Map();
        const totalPossibleSlots = this.workingDays.length * this.lecturesPerDay;

        timetable.slots.forEach(slot => {
            if (slot.faculty && !slot.isBreak) {
                const count = facultySlots.get(slot.faculty.toString()) || 0;
                facultySlots.set(slot.faculty.toString(), count + 1);
            }
        });

        const avgSlots = Array.from(facultySlots.values()).reduce((a, b) => a + b, 0) / facultySlots.size;
        return (avgSlots / totalPossibleSlots) * 100;
    }

    /**
     * Calculate room utilization
     */
    calculateRoomUtilization(timetable) {
        const roomSlots = new Map();
        const totalPossibleSlots = this.workingDays.length * this.lecturesPerDay;

        timetable.slots.forEach(slot => {
            if (slot.room && !slot.isBreak) {
                const count = roomSlots.get(slot.room) || 0;
                roomSlots.set(slot.room, count + 1);
            }
        });

        const avgSlots = Array.from(roomSlots.values()).reduce((a, b) => a + b, 0) / roomSlots.size;
        return (avgSlots / totalPossibleSlots) * 100;
    }

    /**
     * Calculate compliance score
     */
    calculateComplianceScore(timetable, structure) {
        let score = 100;

        // Deduct points for conflicts
        score -= timetable.conflicts.length * 10;

        // Deduct points for empty slots
        const emptySlots = timetable.slots.filter(s => !s.isBreak && !s.subject).length;
        score -= emptySlots * 5;

        return Math.max(0, score);
    }
}

module.exports = AITimetableGenerator;
