// Creates a new panel in the DevTools Page
chrome.devtools.panels.create("My Panel",
    "images/icon.png",
    "devtoolsPanel.html",
    (panel) => {
      /* Code Runs on Panel Creation */
      // Grabs the findBreakoutRoomsButton in the DOM
      let findBreakoutRoomsButton = document.getElementById("findBreakoutRooms");
      // Add an event listener for when the button is clicked
      findBreakoutRoomsButton.addEventListener("click", () => {
        chrome.devtools.network.getHAR((harLog) => {
            console.log(harLog)
        })
      });
    }
);