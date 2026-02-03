import { Router } from 'express';
import { addDemoHeaders, countDemoReq } from '../middleware/demo/header.js';
import { catalogPage, courseDetailPage, randomCoursePage, departmentsPage } from './catalog/catalog.js';
import { homePage, aboutPage, demoPage, testErrorPage } from './index.js';
import { facultyListPage, facultyDetailPage } from './faculty/faculty.js';


// Create a new router instance
const router = Router();

// Home and basic pages
router.get('/', homePage);
router.get('/about', aboutPage);

// Course catalog routes
router.get('/catalog', catalogPage);
router.get('/catalog/random', randomCoursePage);
router.get('/catalog/:courseId', courseDetailPage);

// departments route
router.get('/departments', departmentsPage);

// Demo page with special middleware
router.get('/demo', countDemoReq, addDemoHeaders, demoPage);


// Route to trigger a test error
router.get('/test-error', testErrorPage);

// Faculty List route
router.get('/faculty', facultyListPage);
router.get('/faculty/:facultyId', facultyDetailPage);

router.get('/error-sync', (req, res) => { throw new Error('Synchronous error: something exploded!'); });

export default router;