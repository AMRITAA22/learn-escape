const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

let courses = [];
let headersLogged = false;
let headerKeys = {}; // Object to store the *actual* found header names

/**
 * Helper function to find a header key in a list, ignoring case and extra spaces.
 * @param {string[]} headers - The list of headers from the CSV
 * @param {string[]} namesToTry - A list of possible names, e.g., ['Course Name', 'Course_Name']
 * @returns {string | null} The matching header name, or null
 */
const findHeader = (headers, namesToTry) => {
    for (const name of namesToTry) {
        const found = headers.find(h => h.trim().toLowerCase() === name.toLowerCase());
        if (found) return found;
    }
    return null;
};

const loadCourses = () => {
    const csvPath = path.join(__dirname, 'nptel_courses.csv');
    console.log('[NPTEL Loader] Starting to load courses from:', csvPath);
    
    fs.createReadStream(csvPath)
        .pipe(csv({ 
            skipLines: 10,
            mapHeaders: ({ header }) => header.trim() // Trim spaces from headers
        }))
        .on('headers', (headers) => {
            if (!headersLogged) {
                console.log('[NPTEL Loader] Found CSV Headers:', headers);
                
                // Find the *actual* header names
                headerKeys.discipline = findHeader(headers, ['Discipline']);
                headerKeys.courseName = findHeader(headers, ['Course Name', 'Course_Name']);
                headerKeys.courseCode = findHeader(headers, ['Course Code', 'Course_Code', 'Course ID']);
                headerKeys.institute = findHeader(headers, ['Institute']);
                headerKeys.professor = findHeader(headers, ['Professor', 'SME Name']);
                
                // --- THIS IS THE FIX ---
                // Find the header for the course URL
                headerKeys.courseUrl = findHeader(headers, ['Click here to Join the course', 'Course URL', 'NPTEL URL']);
                // --- END OF FIX ---
                
                // Log what we found
                console.log('[NPTEL Loader] Mapped keys:', headerKeys);
                headersLogged = true;
            }
        })
        .on('data', (row) => {
            // Use the dynamically found keys to read the row
            const formattedRow = {
                discipline: row[headerKeys.discipline] || '',
                course_name: row[headerKeys.courseName] || '',
                course_code: row[headerKeys.courseCode] || '',
                institute: row[headerKeys.institute] || '',
                professor: row[headerKeys.professor] || '',
                
                // --- THIS IS THE FIX ---
                // Add the URL to the object
                course_url: row[headerKeys.courseUrl] || '', 
            };
            
            // Only add rows that have a course name AND a URL
            if (formattedRow.course_name && formattedRow.course_url) {
                courses.push(formattedRow);
            }
        })
        .on('end', () => {
            // This count will now be accurate
            console.log(`[NPTEL Loader] Successfully loaded ${courses.length} valid courses.`);
        })
        .on('error', (err) => {
            console.error('[NPTEL Loader] Error loading CSV:', err.message);
        });
};


loadCourses();

module.exports = {
  loadCourses,
  getCourses: () => courses,
};