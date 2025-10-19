alert("Testing File Server");

// index.js

// Wait until the page loads
window.onload = function () {
    // Get references to elements
    const nameInput = document.getElementById("name");
    const dayInput = document.getElementById("day");
    const timeInput = document.getElementById("Time");
    const resultDiv = document.getElementById("results");

    const scheduleBtn = document.querySelector('button[type="schedule"]');
    const cancelBtn = document.querySelector('button[type="cancel"]');
    const checkBtn = document.querySelector('button[type="check"]');

    // ------------------ Helper Function ------------------
    function sendRequest(url) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = function () {
            if (xhr.status === 200) {
                resultDiv.textContent = xhr.responseText;
            } else {
                resultDiv.textContent = "Error: " + xhr.status;
            }
        };
        xhr.send();
    }

    // ------------------ Button Handlers ------------------
    scheduleBtn.addEventListener("click", function () {
        const name = nameInput.value.trim();
        const day = dayInput.value.trim();
        const time = timeInput.value.trim();

        if (!name || !day || !time) {
            resultDiv.textContent = "Please fill in all fields.";
            return;
        }

        const url = `/schedule?name=${encodeURIComponent(name)}&day=${encodeURIComponent(day)}&time=${encodeURIComponent(time)}`;
        sendRequest(url);
    });

    cancelBtn.addEventListener("click", function () {
        const name = nameInput.value.trim();
        const day = dayInput.value.trim();
        const time = timeInput.value.trim();

        if (!name || !day || !time) {
            resultDiv.textContent = "Please fill in all fields.";
            return;
        }

        const url = `/cancel?name=${encodeURIComponent(name)}&day=${encodeURIComponent(day)}&time=${encodeURIComponent(time)}`;
        sendRequest(url);
    });

    checkBtn.addEventListener("click", function () {
        const day = dayInput.value.trim();
        const time = timeInput.value.trim();

        if (!day || !time) {
            resultDiv.textContent = "Please enter both day and time.";
            return;
        }

        const url = `/check?day=${encodeURIComponent(day)}&time=${encodeURIComponent(time)}`;
        sendRequest(url);
    });
};
