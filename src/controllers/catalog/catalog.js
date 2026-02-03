import { getAllCourses, getCourseById, getSortedSections, getCoursesByDepartment } from '../../models/catalog/catalog.js';

export const catalogPage = (req, res, next) => {
    const { sort, credits, professor } = req.query;

    let courses = getAllCourses();
    let courseList = Object.values(courses);

    if (credits) {
        courseList = courseList.filter(c => c.credits === Number(credits));
    }

    if (professor) {
        courseList = courseList.filter(c => 
            c.sections.some(s => s.professor.toLowerCase().includes(professor.toLowerCase()))
        );

    }

    if (sort === 'credits') {
        courseList.sort((a, b) => a.credits - b.credits);
    } else if (sort === 'title') {
        courseList.sort((a, b) => a.title.localeCompare(b.title));
    }

    res.render ('catalog', {
        title: 'Course Catalog',
        courses: courseList,
        filters: { credits, professor },
        currentSort: sort
    });
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
};

export const departmentsPage = (req, res) => {
    const departments = getCoursesByDepartment();

    res.render('departments', {
        title: 'Departments',
        departments
    });
};