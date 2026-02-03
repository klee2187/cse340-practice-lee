import { getAllCourses, getCourseById, getSortedSections } from '../../models/catalog/catalog.js';

export const catalogPage = (req, res) => {
    const courses = getAllCourses();
    res.render('catalog', { title: 'Course Catalog', courses: courses });
};

export const courseDetailPage = (req, res, next) => {
    const courseId = req.params.courseId.toUpperCase();

    const isValid = /^[A-Z]+[0-9]+$/.test(courseId);

    if (!isValid) {
        const err = new Error(`Invalid course ID: ${courseId}`);
        err.status = 400;
        return next(err);
    }

    const course = getCourseById(courseId);

    if (!course) {
        const err = new Error(`Course ${courseId} not found`);
        err.status = 404;
        return next(err);
    }

    const sortBy = req.query.sort || 'time';
    const sortedSections = getSortedSections(course.sections, sortBy);

    res.render('course-detail', {
        title: `${course.id} - ${course.title}`,
        course: { ...course, sections: sortedSections },
        currentSort: sortBy
    });
};

export const randomCoursePage = (req, res, next) => {
    const courses = getAllCourses();
    const courseIds = Object.keys(courses);
    const randomId = courseIds[Math.floor(Math.random() * courseIds.length)];
    res.redirect(`/catalog/${randomId}`);
}