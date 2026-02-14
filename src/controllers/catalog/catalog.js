// Update these imports:
import { getAllCourses, getCourseBySlug } from '../../models/catalog/courses.js';
import { getSectionsByCourseSlug, getCoursesByDepartment } from '../../models/catalog/catalog.js';
import pool from "../../models/db.js";

// Route handler for the course catalog list page
export const catalogPage = async (req, res) => {
    console.log('[catalogPage] Router working');
    // Model functions are async, so we must await them
    const courses = await getAllCourses();
    console.log('[catalogPage] Retrieved courses')
    
    res.render('catalog/list', {
        title: 'Course Catalog',
        courses: courses
    });
};

// Route handler for individual course detail pages
export const courseDetailPage = async (req, res, next) => {
    const courseSlug = req.params.slug;

    // Pass the sortBy parameter directly to the model - PostgreSQL handles the sorting
    const sortBy = req.query.sort || 'time';
    
    console.log(`[courseDetailPage] Route working for courseSlug=${courseSlug}, sort=${sortBy}`);
    // Model functions are async, so we must await them
    const course = await getCourseBySlug(courseSlug);
    console.log('[courseDetailPage] Course lookup result: ', course);
    
    // Our model returns empty object {} when not found, not null
    // Check if the object is empty using Object.keys()
    if (Object.keys(course).length === 0) {

        console.log(`[courseDetailPage] Course ${courseSlug} not found`);

        const err = new Error(`Course ${courseSlug} not found`);
        err.status = 404;
        return next(err);
    }
    
    // Get sections (course offerings) separately from the catalog
    const sections = await getSectionsByCourseSlug(courseSlug, sortBy);
    console.log(`[courseDetailPage] Retrieved ${sections.length} sections`);

    res.render('catalog/detail', {
        title: `${course.courseCode} - ${course.name}`,
        course: course,
        sections: sections,
        currentSort: sortBy
    });
};

export const randomCoursePage = async (req, res, next) => {
    console.log("[randomCoursePage] Route hit");
    const courses = await getAllCourses();
    console.log('[randomCoursePage] Redirecting to random course');
    

    const courseSlug = Object.keys(courses);
    const randomCourse = courses[Math.floor(Math.random() * courses.length)];
    res.redirect(`/catalog/${randomCourse.slug}`);
};

export const departmentsPage = async (req, res, next) => {
  try {
    console.log("[departmentsPage router working]");

    // Call your model function instead of using pool directly
    const departments = await getCoursesByDepartment();
    console.log("[departmentsPage] Departments found:", departments.length);

    res.render("departments", { departments });
  } catch (err) {
    console.error("[departmentsPage] Error:", err.message);
    next(err);
  }
};



//export const catalogPage = (req, res, next) => {
//    const { sort, credits, professor } = req.query;
//
//    let courses = getAllCourses();
//    let courseList = Object.values(courses);
//
//    if (credits) {
//        courseList = courseList.filter(c => c.credits === Number(credits));
//    }
//
//    if (professor) {
//        courseList = courseList.filter(c => 
//            c.sections.some(s => s.professor.toLowerCase().includes(professor.toLowerCase()))
//        );
//
//    }
//
//    if (sort === 'credits') {
//        courseList.sort((a, b) => a.credits - b.credits);
//    } else if (sort === 'title') {
//        courseList.sort((a, b) => a.title.localeCompare(b.title));
//    }
//
//    res.render ('catalog', {
//        title: 'Course Catalog',
//        courses: courseList,
//        filters: { credits, professor },
//        currentSort: sort
//    });
//};
//
//export const courseDetailPage = (req, res, next) => {
//    const courseId = req.params.courseId.toUpperCase();
//
//    const isValid = /^[A-Z]+[0-9]+$/.test(courseId);
//
//    if (!isValid) {
//        const err = new Error(`Invalid course ID: ${courseId}`);
//        err.status = 400;
//        return next(err);
//    }
//
//    const course = getCourseById(courseId);
//
//    if (!course) {
//        const err = new Error(`Course ${courseId} not found`);
//        err.status = 404;
//        return next(err);
//    }
//
//    const sortBy = req.query.sort || 'time';
//    const sortedSections = getSortedSections(course.sections, sortBy);
//
//    res.render('course-detail', {
//        title: `${course.id} - ${course.title}`,
//        course: { ...course, sections: sortedSections },
//        currentSort: sortBy
//    });
//};
