const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// -------------------- Data --------------------
const availableTimes = {
    Monday: ["1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"],
    Tuesday: ["1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"],
    Wednesday: ["1:00", "1:30", "2:00", "2:30", "3:00", "4:00", "4:30"],
    Thursday: ["1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"],
    Friday: ["1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"],
};

const appointments = [
    { name: "James", day: "Wednesday", time: "3:30" },
    { name: "Lillie", day: "Friday", time: "1:00" }
];

// -------------------- Helper Functions --------------------

// Generic file sender
function sendFile(filePath, res) {
    fs.readFile(filePath, function (err, data) {
        if (err) {
            error(res, 404, "File not found");
            return;
        }

        const ext = path.extname(filePath);
        const contentType = getContentType(ext);

        res.writeHead(200, { 'content-type': contentType });
        res.write(data);
        res.end();
    });
}

// Determines MIME type based on extension
function getContentType(ext) {
    const types = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.ico': 'image/x-icon',
        '.txt': 'text/plain'
    };
    return types[ext.toLowerCase()] || 'application/octet-stream';
}

// Standardized error response
function error(res, status, message) {
    res.writeHead(status, { 'content-type': 'text/plain' });
    res.write(message);
    res.end();
}

// -------------------- Route Handlers --------------------

function schedule(qObj, res) {
    if (!qObj.name || !qObj.day || !qObj.time) {
        return error(res, 400, "Missing query parameters");
    }

    if (availableTimes[qObj.day] && availableTimes[qObj.day].includes(qObj.time)) {
        // Remove from available times
        availableTimes[qObj.day] = availableTimes[qObj.day].filter(t => t !== qObj.time);

        // Add to appointments
        appointments.push({ name: qObj.name, day: qObj.day, time: qObj.time });

        res.writeHead(200, { 'content-type': 'text/plain' });
        res.write("Appointment scheduled");
        res.end();
    } else {
        error(res, 400, "Can't schedule");
    }
}

function cancel(qObj, res) {
    if (!qObj.name || !qObj.day || !qObj.time) {
        return error(res, 400, "Missing query parameters");
    }

    let index = appointments.findIndex(a =>
        a.name === qObj.name && a.day === qObj.day && a.time === qObj.time
    );

    if (index !== -1) {
        appointments.splice(index, 1);
        if (availableTimes[qObj.day]) {
            availableTimes[qObj.day].push(qObj.time);
        } else {
            availableTimes[qObj.day] = [qObj.time];
        }
        res.writeHead(200, { 'content-type': 'text/plain' });
        res.write("Appointment has been canceled");
        res.end();
    } else {
        error(res, 404, "Appointment not found");
    }
}

function check(qObj, res) {
    if (!qObj.day || !qObj.time) {
        return error(res, 400, "Missing query parameters");
    }

    if (availableTimes[qObj.day] && availableTimes[qObj.day].includes(qObj.time)) {
        res.writeHead(200, { 'content-type': 'text/plain' });
        res.write("Time is available");
        res.end();
    } else {
        res.writeHead(200, { 'content-type': 'text/plain' });
        res.write("Time is NOT available");
        res.end();
    }
}

// -------------------- Server --------------------

const serverObj = http.createServer(function (req, res) {
    console.log("Request URL:", req.url);
    const urlObj = url.parse(req.url, true);

    switch (urlObj.pathname) {
        case "/schedule":
            schedule(urlObj.query, res);
            break;
        case "/cancel":
            cancel(urlObj.query, res);
            break;
        case "/check":
            check(urlObj.query, res);
            break;
        default:
            // Build file path for static files
            let filePath = path.join(__dirname, "public_html", urlObj.pathname);

            // Default to index.html if just "/"
            if (urlObj.pathname === "/") {
                filePath = path.join(__dirname, "public_html", "index.html");
            }

            sendFile(filePath, res);
    }
});

serverObj.listen(80, function () {
    console.log("Server is listening on port 80");
});

