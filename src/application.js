const { app, BrowserWindow } = require('electron');

let win = null;

function createWindow()
{
  if (win !== null)
  {
    return;
  }

  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.webContents.openDevTools();
  win.loadFile('index.html');
}

app.on('ready', createWindow);
app.on('activate', createWindow);