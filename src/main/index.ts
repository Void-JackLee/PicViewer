import { app, shell, BrowserWindow, ipcMain, Menu, dialog } from 'electron'
import { join, dirname, basename } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { isPath, isFile, filterFile, listFiles } from './util/file'
import { loadThumbnail } from './util/img'
import * as constants from './constants'

const isMac = process.platform === 'darwin'
function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
Menu.setApplicationMenu(Menu.buildFromTemplate([
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: 'Jack看图',
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ] as any
  }] : []),
  {
    label: 'File',
    submenu: [
      {
        label: 'Open..',
        accelerator: 'CommandOrControl+O',
        click: () => {
          openDialog()
        }
      },
      {
        label: 'Open Last',
        accelerator: 'CommandOrControl+Shift+O',
        click: () => {
          console.log(123)
        }
      },
      {
        role: 'close'
      }
    ],
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Delete',
        accelerator: 'CommandOrControl+Backspace',
        click: () => {
          console.log(123)
        }
      },
      {
        label: 'View Last Pic',
        accelerator: 'Z',
        click: () => {
          console.log(123)
        }
      }
    ],
  },
  { role: 'viewMenu' },
  { role: 'windowMenu' }
]))

const openDialog = () => {
  dialog.showOpenDialog({
    properties: ['openFile','openDirectory'],
    filters: [{
      name: 'Image file',
      extensions: constants.supportFileType
    }]
  }).then(res => {
    if (res.canceled) return
    const path = res.filePaths[0]

    const pathData = {} as {
      location: string,
      files: string[]
      index: number,
    }

    if (isPath(path)) {
      pathData.location = path
      pathData.files = listFiles(path,new Set(constants.supportFileType))
      if (pathData.files.length == 0) return
      pathData.index = 0
    } else {
      if (!isFile(path)) {
        console.log('No such file')
        return
      }
      if (!filterFile(path, new Set(constants.supportFileType))) {
        console.log('Not supported file')
        return
      }
      pathData.location = dirname(path)
      pathData.files = listFiles(pathData.location,new Set(constants.supportFileType))
      pathData.index = 0
      const baseName = basename(path)
      for (let i in pathData.files) {
        if (baseName === pathData.files[i]) {
          pathData.index = parseInt(i)
          break
        }
      }
    }

    if (BrowserWindow.getAllWindows().length == 0) createWindow()
    const win = BrowserWindow.getAllWindows()[0]
    win.webContents.send('openFile', pathData)
    loadThumbnail(pathData.location,pathData.files,(path,file,thumbFile) => {
      win.webContents.send('cacheFile', {
        location: path,
        file: file,
        thumbFile: thumbFile
      })
    }).then(info => {console.log(info)}).catch(err => {console.log(err)})
  })
}


