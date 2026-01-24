const express = require('express');
const router = express.Router();
const aiTimetableController = require('../controllers/aiTimetable.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticateToken);

// Step 1: Get academic years
router.get('/academic-years', aiTimetableController.getAcademicYears);

// Step 2: Create timetable structure
router.post('/structure', requireRole(['admin', 'teacher']), aiTimetableController.createTimetableStructure);

// Step 3: Get timetable structures
router.get('/structures', requireRole(['admin', 'teacher']), aiTimetableController.getTimetableStructures);

// Step 4: Get academic data preview
router.get('/academic-data-preview', requireRole(['admin', 'teacher']), aiTimetableController.getAcademicDataPreview);

// Step 5: Generate AI timetable
router.post('/generate', requireRole(['admin', 'teacher']), aiTimetableController.generateAITimetable);

// Step 6: Get generated timetables
router.get('/generated', requireRole(['admin', 'teacher', 'student']), aiTimetableController.getGeneratedTimetables);

// Step 7: Get specific timetable with details
router.get('/:id', requireRole(['admin', 'teacher', 'student']), aiTimetableController.getTimetableDetails);

// Step 8: Publish timetable
router.patch('/:id/publish', requireRole(['admin', 'teacher']), aiTimetableController.publishTimetable);

// Step 9: Update timetable
router.put('/:id', requireRole(['admin', 'teacher']), aiTimetableController.updateTimetable);

module.exports = router;
