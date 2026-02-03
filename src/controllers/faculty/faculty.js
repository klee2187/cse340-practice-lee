import { getFacultyById, getSortedFaculty } from "../../models/faculty/faculty.js";

export const facultyListPage = (req, res) => {

    const sortBy = req.query.sort || 'department';

    console.log('Sort param:', req.query.sort);

    const facultyMembers = getSortedFaculty(sortBy);
    res.render('faculty/list', {
        title: 'Faculty List',
        faculty: facultyMembers,
        currentSort: sortBy
        
    });
};


export const facultyDetailPage = (req, res, next) => {

    const facultyId = req.params.facultyId;
    const facultyMember = getFacultyById(facultyId);

    if(!facultyMember) {
        const err = new Error (`Faculty member ${facultyId} not found`);
        err.status = 404;
        return next(err);
    }

    res.render('faculty/detail', {
        title: `${facultyMember.name} - Faculty Details`,
        faculty: facultyMember
    });
};