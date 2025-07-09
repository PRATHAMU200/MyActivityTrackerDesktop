const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800, // Initial width of the window
    height: 700, // Initial height of the window
    minWidth: 800, // Minimum width allowed
    minHeight: 600, // Minimum height allowed
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
    // --- New options for custom look ---
    autoHideMenuBar: true, // Hides the default menu bar (File, Edit, etc.)
    icon: path.join(__dirname, "icon.ico"), // Set the window icon
    // If you want to remove the entire window frame (including close/minimize/maximize buttons)
    // and handle them yourself in HTML/CSS, you can add:
    // frame: false,
    // But be aware this requires more work to implement custom controls.
    // autoHideMenuBar is usually sufficient for removing the top bar.
  });

  // Load your index.html file directly from the src folder
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Open the DevTools. You can comment this out once your app is ready for release.
  // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
