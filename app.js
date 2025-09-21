const http = require('http');
const url = require('url');

const availableTimes = {
    Monday: ["1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"],
    Tuesday: ["1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"],
    Wednesday: ["1:00", "1:30", "2:00", "2:30", "3:00", "4:00", "4:30"],
    Thursday: ["1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"],
    Friday: ["1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"],
};
const appointments = [
    {name: "James", day: "Wednesday", time: "3:30" },
    {name: "Lillie", day: "Friday", time: "1:00" }];

let serverObj =  http.createServer(function(req,res){
	console.log(req.url);
	let urlObj = url.parse(req.url,true);
	switch (urlObj.pathname) {
		case "/schedule":
			schedule(urlObj.query,res);
			break;
		case "/cancel":
			cancel(urlObj.query,res);
			break;
		case "/check":
			check(urlObj.query,res);
			break;
		default:
			error(res,404,"pathname unknown");

	}
});

function schedule(qObj,res) {
	if (!qObj.name || !qObj.day || !qObj.time) {
        	return error(res, 400, "Missing query parameters");
	}

	if (availableTimes[qObj.day] && availableTimes[qObj.day].some(time => time == qObj.time))
	{
		availableTimes[qObj.day] = availableTimes[qObj.day].filter(t => t !== qObj.time);

		appointments.push({ name: qObj.name, day: qObj.day, time: qObj.time });

		res.writeHead(200,{'content-type':'text/plain'});
		res.write("Appointment scheduled");
		res.end();
	}
	else 
		error(res,400,"Can't schedule");

 
}

function cancel(qObj, res) {
	if (!qObj.name || !qObj.day || !qObj.time) {
        return error(res, 400, "Missing query parameters");
    }
	let index = appointments.findIndex(appt =>
        appt.name === qObj.name && appt.day === qObj.day && appt.time === qObj.time
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

    if (availableTimes[qObj.day] && availableTimes[qObj.day].some(time => time == qObj.time)) {
        res.writeHead(200, { 'content-type': 'text/plain' });
        res.write("Time is available");
        res.end();
    } else {
        res.writeHead(200, { 'content-type': 'text/plain' });
        res.write("Time is NOT available");
        res.end();
    }
}

function error(response,status,message) {

	response.writeHead(status,{'content-type':'text/plain'});
	response.write(message);
	response.end();
}

serverObj.listen(80,function(){console.log("listening on port 80")});
