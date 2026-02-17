import bcrypt from 'bcrypt';
import db from '../db.js';

/**
 * Find a user by email address for login verification.
 * 
 * @param {string} email - Email address to search for
 * @returns {Promise<Object|null>} User object with password hash or null if not found
 */
const findUserByEmail = async (email) => {

    const query = `
        SELECT id, name, LOWER(email) AS email, password, created_at
        FROM users
        WHERE LOWER(email) = LOWER($1)
        ORDER BY created_at DESC
        LIMIT 1
    `;
    const result = await db.query(query, [email]);
    return result.rows[0];;

};

/**
 * Verify a plain text password against a stored bcrypt hash.
 * 
 * @param {string} plainPassword - The password to verify
 * @param {string} hashedPassword - The stored password hash
 * @returns {Promise<boolean>} True if password matches, false otherwise
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
    const result = await bcrypt.compare(plainPassword, hashedPassword);
    return result;
};

export { findUserByEmail, verifyPassword };