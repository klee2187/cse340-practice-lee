import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { emailExists, saveUser, getAllUsers } from '../../models/forms/registration.js';

const router = Router();

/**
 * Validation rules for user registration
 */
const registrationValidation = [
    body('name')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters'),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address'),
    body('emailConfirm')
        .trim()
        .custom((value, { req }) => value === req.body.email)
        .withMessage('Email addresses must match'),
    body('password')
        .isLength({ min: 8 })
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*]/)
        .withMessage('Password must contain at least one special character'),
    body('passwordConfirm')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords must match')
];

/**
 * Display the registration form page.
 */
const showRegistrationForm = (req, res) => {
    res.render('forms/registration/form', {
        title: 'User Registration'
    })

};

/**
 * Handle user registration with validation and password hashing.
 */
const processRegistration = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Store each validation error as a separate flash message
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        return res.redirect('/register');
    }

    // Extract validated data from request body
    const { name, email, password } = req.body;

    try {
        // Check if email already exists in database
        const exists = await emailExists(email);

        if (exists === true) {
            req.flash('warning', 'This email is already tied to an account');
            // Redirect back to /register
            return res.redirect('/register')
        }

        // Hash the password before saving to database
        const hashedPassword = await bcrypt.hash(password, 10);


        // Save user to database with hashed password
        await saveUser(name, email, hashedPassword);

        // After successfully saving to the database
        req.flash('success', 'Registration successful! Thank you for creating an account with us!');
        req.session.save(() => {
            res.redirect('/login');
        })
        
    } catch (error) {
        console.error('Error saving registration form:', error);
        req.flash('error', 'Registrstion failed, please try again another time.');
        res.redirect('/register');
    }
};

/**
 * Display all registered users.
 */
const showAllUsers = async (req, res) => {
    // Initialize users as empty array
    let users = [];

    try {
        // Call getAllUsers() and assign to users variable
        users = await getAllUsers();
    } catch (error) {
        // Log the error to console
        console.log('Error retrieving users:', error);
        // users remains empty array on error
    }

    // Render the users list view (forms/registration/list)
    res.render('forms/registration/list', {
        // Pass title: 'Registered Users' and the users variable in the data object
        title: 'Registered Users',
        users
    })
    
};

/**
 * GET /register - Display the registration form
 */
router.get('/', showRegistrationForm);

/**
 * POST /register - Handle registration form submission with validation
 */
router.post('/', registrationValidation, processRegistration);

/**
 * GET /register/list - Display all registered users
 */
router.get('/list', showAllUsers);

export default router;