import { getCoursesByDepartment } from "../../models/catalog/catalog";

export const departmentsPage = (req, res) => {
    const departments = getCoursesByDepartment();

    res.render('departments', {
        title: 'Departments',
        departments
    });
}