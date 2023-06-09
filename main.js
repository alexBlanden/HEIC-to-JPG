const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
const { promisify } = require('util');
const convert = require('heic-convert');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === "darwin";

let mainWindow;
let aboutWindow;

let counter = 0;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: "Image Resizer",
        width: isDev? 1000 : 500,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    //Open dev tools if in dev env
    if(isDev){
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
}

function creatAboutWindow () {
    aboutWindow = new BrowserWindow({
        title: "About Image Converter",
        width: 600,
        height: 300,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, '/renderer/aboutpreload.js')
        }
    });
    if(isDev){
        aboutWindow.webContents.openDevTools();
    }

    aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
}


app.whenReady().then(()=> {
    createMainWindow();

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    mainWindow.on('closed', ()=> (mainWindow = null));

    app.on('activate', ()=> {
        if (BrowserWindow.getAllWindows().length === 0){
            createMainWindow()
        }
    });
});

const menu = [
    ...(isMac ? [{
        label: app.name,
        submenu: [
            {
                label: 'About',
                click: () => creatAboutWindow()
            }
        ]
    }] : []),
    {
        role: 'fileMenu'
    },
    ...(!isMac ? [
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About',
                    click: () => creatAboutWindow()
                }
            ]
        }
    ] : [])
]


function fileIsHeic(file) {
    const extension = path.parse(file).ext.toLowerCase()
    const mimeType = mime.lookup(file);
    return extension === '.heic' && mimeType === 'image/heic';
}

ipcMain.on('folder:dropped', async (e, folderPath) => {
    try{
        fs.readdir(folderPath, (err, files) => {
            if (err) {
                console.log(`Error! ${err}`);
                return;
            }
            let numberOfHeic = files.filter(file => fileIsHeic(file));
            let percentPerFile = 100/numberOfHeic.length;
            counter = 0; // Initialize the counter variable
            //convertToJpeg is aynchronous, counter must only increment once file conversion has finished:
            (async ()=> {
                for(const file of numberOfHeic) {
                    if(fileIsHeic(file)){
                        await convertToJpeg(folderPath, file);
                        counter++;
                        mainWindow.webContents.send('progress', percentPerFile);
                    }
                }
                if (counter === numberOfHeic.length) {
                    mainWindow.webContents.send('images:done');
                    shell.openPath(folderPath);
                }
            })();
        });

    } catch(e){
        console.log(e)
    }
})

ipcMain.on('linkClicked', (e, index)=> {
    const websites = ['https://github.com/alexBlanden?tab=repositories', 'https://alexblanden.co.uk/', 'https://www.linkedin.com/in/alex-blanden-681828222/', 'https://www.buymeacoffee.com/mewCP'];
    try {
        shell.openExternal(websites[index]);
    } catch(e){
        console.log(e)
    }
})

async function convertToJpeg (filePath, file) {
    try {
        const filename = path.parse(file).name
        const outputPath = `${filePath}/${filename}.jpg`;
        let fileCounter = 1;
        let newOutputPath = outputPath;

        //Counter is appended to existing file name until newOutputPath = false (name doesn't exist)
        while(await promisify(fs.exists)(newOutputPath)){
            newOutputPath = `${filePath}/${filename}(${fileCounter}).jpg`;
            fileCounter++;
        }

        const inputBuffer = await promisify(fs.readFile)(`${filePath}\\${file}`);
        const outputBuffer = await convert({
        buffer: inputBuffer,
        format: 'JPEG',
        quality: 1      
        });
        await promisify(fs.writeFile)(outputPath, outputBuffer);
    } catch (error) {
        console.log(error)
    }
}
app.on('window-all-closed', ()=> {
    if(!isMac){
        app.quit()
    }
});