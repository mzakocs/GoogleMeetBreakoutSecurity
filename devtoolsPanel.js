/* FUNCTION DECLARATIONS */
// Sends a command to background.js that changes the current google meet code
const sendCodeCommand = function () {
    let code = this;
    // Opens a connection with background.js
    let port = chrome.extension.connect({
        name: "background_connection",
    });
    // Creates a text JSON for transmission to the background
    let jsonText = JSON.stringify({
        type: "changeMeetingCode",
        code: code
    });
    // Sends the JSON command through the port
    port.postMessage(jsonText);
};

// Sends a command to background.js that removes modal popup
const sendModalCommand = function () {
    // Opens a connection with background.js
    let port = chrome.extension.connect({
        name: "background_connection"
    });
    // Creates a text JSON for transmission to the background
    let jsonText = JSON.stringify({
        type: "modalRemoval"
    });
    // Sends the JSON command through the port
    port.postMessage(jsonText);
};

// Adds a button to the roomDiv 
const addRoomButton = function (title, code, div) {
    let codeButton = document.createElement("button")
    codeButton.innerText = title;
    codeButton.addEventListener("click", sendCodeCommand.bind(code));
    div.appendChild(codeButton)
}

/* RUNNING CODE */
// Grabs the findBreakoutRoomsButton in the DOM
let refreshButton = document.getElementById("refreshBreakoutRooms");
// Add an event listener for when the button is clicked
refreshButton.addEventListener("click", () => {
    console.log("Checking for Breakout Room Requests...")
    chrome.devtools.network.getHAR((harLog) => {
        // Filters the harLog to only have xhr entries
        let meetSyncLog = harLog.entries.filter((entry) => entry.request.url.includes("SyncMeetingSpaceCollections"));
        meetSyncLog.forEach((meetSyncEntry) => {
            meetSyncEntry.getContent((content, encoding) => {
                // Decodes the base64 content
                let decodedContent = atob(content);
                // Certain SyncMeeting requests will have the string !spaces in it
                // This indicates that the request contains the breakout room codes
                if (decodedContent.includes("!spaces")) {
                    console.log("Found One!");
                    // Parses the meeting codes out of the content body
                    // Uses an extremely rudimentary string-length filter; it would be a lot better if I
                    // knew Googles base64 encoding method, but this is the best method I came up with
                    let splitCodes = decodedContent.split("\n").filter((entry) => entry.length == 14);
                    splitCodes.forEach(function (code, i) {
                        splitCodes[i] = code.substr(1, code.length - 2);
                    });
                    console.log(splitCodes)
                    // Clears the room storage HTML div
                    let roomDiv = document.getElementById("roomDiv");
                    roomDiv.innerHTML = "";
                    // Adds a button for each meeting code
                    splitCodes.forEach((code, i) => {
                        addRoomButton(("Breakout Room " + (i + 1).toString()), code, roomDiv);
                    });
                }
            });
        });
    })
});
// Add an event listener to the modal removal button
let modalRemovalButton = document.getElementById("modalRemoval");
modalRemovalButton.addEventListener("click", sendModalCommand);