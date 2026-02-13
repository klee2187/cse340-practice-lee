import db from '../db.js';

/**
 * Core function that gets all sections (course offerings) for a specific course.
 * Works with either course ID or slug - this pattern reduces code duplication.
 * 
 * @param {string|number} identifier - Course ID or slug
 * @param {string} identifierType - 'id' or 'slug' (default: 'slug')
 * @param {string} sortBy - Sort option: 'time', 'room', or 'professor' (default: 'time')
 * @returns {Promise<Array>} Array of section objects with course, faculty, and department info
 */
export const getSectionsByCourse = async (identifier, identifierType = 'slug', sortBy = 'time') => {
    // Build WHERE clause dynamically based on whether we're searching by ID or slug
    // Using $1 prevents SQL injection - never concatenate user input into SQL!
    const whereClause = identifierType === 'id' ? 'c.id = $1' : 'c.slug = $1';
    
    /**
     * Let PostgreSQL do the sorting - it's faster than sorting in JavaScript.
     * SUBSTRING with regex extracts the hour from time strings like "Mon Wed Fri 8:00-8:50".
     * The ::INTEGER cast converts the extracted string to a number for proper sorting.
     */
    const orderByClause = sortBy === 'room' ? 'cat.room' : 
                          sortBy === 'professor' ? 'f.last_name, f.first_name' :
                          "SUBSTRING(cat.time FROM '(\\d{1,2}):(\\d{2})')::INTEGER";
    
    /**
     * Join catalog with courses, faculty, and departments to get complete information.
     * Note: We're using template literals for ORDER BY because PostgreSQL doesn't allow
     * parameterized ORDER BY clauses. The values are whitelisted above, so this is safe.
     */
    const query = `
        SELECT cat.id, cat.time, cat.room, 
               c.course_code, c.name as course_name, c.description, c.credit_hours,
               f.first_name, f.last_name, f.slug as faculty_slug, f.title as faculty_title,
               d.name as department_name, d.code as department_code
        FROM catalog cat
        JOIN courses c ON cat.course_slug = c.slug
        JOIN faculty f ON cat.faculty_slug = f.slug
        JOIN departments d ON c.department_id = d.id
        WHERE ${whereClause}
        ORDER BY ${orderByClause}
    `;
    
    const result = await db.query(query, [identifier]);
    
    /**
     * Transform database column names (snake_case) to JavaScript convention (camelCase).
     * This is a common pattern when working with databases in JavaScript.
     */
    return result.rows.map(section => ({
        id: section.id,
        time: section.time,
        room: section.room,
        courseCode: section.course_code,
        courseName: section.course_name,
        description: section.description,
        creditHours: section.credit_hours,
        professor: `${section.first_name} ${section.last_name}`,
        professorSlug: section.faculty_slug,
        professorTitle: section.faculty_title,
        department: section.department_name,
        departmentCode: section.department_code
    }));
};

/**
 * Core function that gets all courses taught by a specific faculty member.
 * Similar pattern to getSectionsByCourse - same logic, different perspective.
 * 
 * @param {string|number} identifier - Faculty ID or slug
 * @param {string} identifierType - 'id' or 'slug' (default: 'slug')
 * @param {string} sortBy - Sort option: 'time', 'room', or 'course' (default: 'time')
 * @returns {Promise<Array>} Array of section objects with course, faculty, and department info
 */
export const getCoursesByFaculty = async (identifier, identifierType = 'slug', sortBy = 'time') => {
    // Search by faculty ID or faculty slug
    const whereClause = identifierType === 'id' ? 'f.id = $1' : 'f.slug = $1';
    
    // Different sorting options - by time, room, or course code
    const orderByClause = sortBy === 'room' ? 'cat.room' : 
                          sortBy === 'course' ? 'c.course_code' :
                          "SUBSTRING(cat.time FROM '(\\d{1,2}):(\\d{2})')::INTEGER";
    
    // Same JOIN pattern - catalog connects courses to faculty
    const query = `
        SELECT cat.id, cat.time, cat.room, 
               c.course_code, c.name as course_name, c.description, c.credit_hours,
               f.first_name, f.last_name, f.slug as faculty_slug, f.title as faculty_title,
               d.name as department_name, d.code as department_code
        FROM catalog cat
        JOIN courses c ON cat.course_slug = c.slug
        JOIN faculty f ON cat.faculty_slug = f.slug
        JOIN departments d ON c.department_id = d.id
        WHERE ${whereClause}
        ORDER BY ${orderByClause}
    `;
    
    const result = await db.query(query, [identifier]);
    
    return result.rows.map(section => ({
        id: section.id,
        time: section.time,
        room: section.room,
        courseCode: section.course_code,
        courseName: section.course_name,
        description: section.description,
        creditHours: section.credit_hours,
        professor: `${section.first_name} ${section.last_name}`,
        professorSlug: section.faculty_slug,
        professorTitle: section.faculty_title,
        department: section.department_name,
        departmentCode: section.department_code
    }));
};

// Gets all courses grouped by department.
export const getCoursesByDepartment = async () => {
    const query = `
        SELECT d.name AS department_name,
               d.code AS department_code,
               c.course_code,
               c.name AS course_name,
               c.credit_hours,
               c.slug
        FROM courses c
        JOIN departments d ON c.department_id = d.id
        ORDER BY d.name, c.course_code
    `;

    const result = await db.query(query);

    // Group courses by department
    const departments = {};

    result.rows.forEach(row => {
        const deptName = row.department_name;

        if (!departments[deptName]) {
            departments[deptName] = {
                department: deptName,
                departmentCode: row.department_code,
                courses: []
            };
        }

        departments[deptName].courses.push({
            courseCode: row.course_code,
            name: row.course_name,
            creditHours: row.credit_hours,
            slug: row.slug
        });
    });

    return Object.values(departments);
};


/**
 * Wrapper functions maintain backward compatibility with existing code.
 * These let us keep the same API while using consolidated core functions internally.
 * Example: getSectionsByCourseId(5) calls getSectionsByCourse(5, 'id')
 */
export const getSectionsByCourseId = (courseId, sortBy = 'time') => 
    getSectionsByCourse(courseId, 'id', sortBy);

export const getSectionsByCourseSlug = (courseSlug, sortBy = 'time') => 
    getSectionsByCourse(courseSlug, 'slug', sortBy);

export const getCoursesByFacultyId = (facultyId, sortBy = 'time') => 
    getCoursesByFaculty(facultyId, 'id', sortBy);

export const getCoursesByFacultySlug = (facultySlug, sortBy = 'time') => 
    getCoursesByFaculty(facultySlug, 'slug', sortBy);


// Enhanced course data object
//const courses = {
//    'CS121': {
//        id: 'CS121',
//        title: 'Introduction to Programming',
//        department: 'Computer Science',
//        description: 'Learn programming fundamentals using JavaScript and basic web development concepts.',
//        credits: 3,
//        sections: [
//            { time: '9:00 AM', room: 'STC 392', professor: 'Brother Jack' },
//            { time: '2:00 PM', room: 'STC 394', professor: 'Sister Enkey' },
//            { time: '11:00 AM', room: 'STC 390', professor: 'Brother Keers' }
//        ]
//    },
//    'CS162': {
//        id: 'CS162',
//        title: 'Introduction to Computer Science',
//        department: 'Computer Science', 
//        description: 'Object-oriented programming concepts and software development practices.',
//        credits: 3,
//        sections: [
//            { time: '10:00 AM', room: 'STC 392', professor: 'Brother Jack' },
//            { time: '1:00 PM', room: 'STC 394', professor: 'Sister Enkey' }
//        ]
//    },
//    'MATH113': {
//        id: 'MATH113',
//        title: 'College Algebra',
//        department: 'Mathematics',
//        description: 'Fundamental algebra concepts including functions, polynomials, and equations.',
//        credits: 3,
//        sections: [
//            { time: '8:00 AM', room: 'STC 290', professor: 'Sister Peterson' },
//            { time: '11:00 AM', room: 'STC 292', professor: 'Brother Thompson' },
//            { time: '3:00 PM', room: 'STC 290', professor: 'Sister Anderson' }
//        ]
//    },
//    'MATH119': {
//        id: 'MATH119',
//        title: 'Calculus I',
//        department: 'Mathematics',
//        description: 'Introduction to differential and integral calculus with applications.',
//        credits: 4,
//        sections: [
//            { time: '9:00 AM', room: 'STC 290', professor: 'Brother Thompson' },
//            { time: '2:00 PM', room: 'STC 292', professor: 'Sister Anderson' }
//        ]
//    },
//    'ENG101': {
//        id: 'ENG101',
//        title: 'College Writing',
//        department: 'English',
//        description: 'Develop writing skills for academic and professional communication.',
//        credits: 3,
//        sections: [
//            { time: '10:00 AM', room: 'GEB 201', professor: 'Sister Anderson' },
//            { time: '12:00 PM', room: 'GEB 205', professor: 'Brother Davis' },
//            { time: '4:00 PM', room: 'GEB 203', professor: 'Sister Enkey' }
//        ]
//    },
//    'ENG102': {
//        id: 'ENG102', 
//        title: 'Composition and Literature',
//        department: 'English',
//        description: 'Advanced writing skills through the study of literature and critical analysis.',
//        credits: 3,
//        sections: [
//            { time: '11:00 AM', room: 'GEB 201', professor: 'Brother Davis' },
//            { time: '1:00 PM', room: 'GEB 205', professor: 'Sister Enkey' }
//        ]
//    },
//    'HIST105': {
//        id: 'HIST105',
//        title: 'World History',
//        department: 'History',
//        description: 'Survey of world civilizations from ancient times to the present.',
//        credits: 3,
//        sections: [
//            { time: '9:00 AM', room: 'GEB 301', professor: 'Brother Wilson' },
//            { time: '2:00 PM', room: 'GEB 305', professor: 'Sister Roberts' }
//        ]
//    }
//};
//
//// Export functions individually as you define them
//export const getAllCourses = () => {
//    return courses;
//};
//
//export const getCourseById = (courseId) => {
//    return courses[courseId] || null;
//};
//
//export const getSortedSections = (sections, sortBy) => {
//    const sortedSections = [...sections];
//    switch (sortBy) {
//        case 'professor':
//            return sortedSections.sort((a, b) => a.professor.localeCompare(b.professor));
//        case 'room':
//            return sortedSections.sort((a, b) => a.room.localeCompare(b.room));
//        case 'time':
//        default:
//            return sortedSections;
//    }
//};
//
