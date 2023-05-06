const path = require('path');
const os = require('os');
const fs = require('fs');
const { promisify } = require('util');
const convert = require('heic-convert');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === "darwin";

let mainWindow;
let aboutWindow;

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
        title: "About Image Resizer",
        width: 300,
        height: 300,
    });
    aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
}


app.whenReady().then(()=> {
    createMainWindow();
    console.log('created')

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

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
        // label: 'File',
        // submenu: [
        //     {
        //         label: 'Quit',
        //         click: () => app.quit(),
        //         accelerator: 'CmdOrCtrl+W'
        //     }
        // ]
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

ipcMain.on('folder:dropped', (e, folderPath)=> {
    fs.readdir(folderPath, (err, files)=> {
        if(err){
            console.log(err);
            return
        }
        let counter = 0;
        console.log(files)
        files.forEach(file => {
            convertToJpeg(folderPath, file, counter)
            counter++
        })
    })
    mainWindow.webContents.send('image:done');
})

async function convertToJpeg (path, file, counter) {
    try {
        const inputBuffer = await promisify(fs.readFile)(`${path}\\${file}`);
        const outputBuffer = await convert({
        buffer: inputBuffer,
        format: 'JPEG',
        quality: 1      
        });
        await promisify(fs.writeFile)(`${path}/${file}-${counter}.jpg`, outputBuffer)
        counter++;
    } catch (error) {
        console.log(error)
    }
}
app.on('window-all-closed', ()=> {
    if(!isMac){
        app.quit()
    }
})

// async function resizeImage({imagePath, width, height, dest}) {
//     //newPath is resized image data
//     try{
//         console.log(+width, +height)
//         const newPath = await resizeImg(fs.readFileSync(imagePath), {
//             width: +width,
//             height: +height,
//           });

//         //extract filename from image path
//         const fileName = path.basename(imagePath);

//         //Does destination directory exist? If not make it!
//         if(!fs.existsSync(dest)){
//             fs.mkdirSync(dest)
//         //    fs.makedirSync(dest); 
//         }
//         //Take resized image data and and write it to the destination directory 
//         //path.join creates a path using the destination directory and the fileName
//         //fs.writeFileSync uses the joined path as the destination and the newPath resized image data
//         fs.writeFileSync(path.join(dest, fileName), newPath);

//         //Send success to renderer
//         mainWindow.webContents.send('image:done')

//         //Open folder when done
//         shell.openPath(dest);

//     }catch(error){
//         console.log(error)
//     }
// }