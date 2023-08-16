const path = require('path')
const Toastify = require('toastify-js')

const { contextBridge, ipcRenderer, webFrame } = require('electron');

contextBridge.exposeInMainWorld('path', {
    join: (...args)=> path.join(...args)
})

contextBridge.exposeInMainWorld('Toastify', {
    toast: (options)=> Toastify(options).showToast(),
})

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, ...args)=> ipcRenderer.send(channel, ...args),
    on: (channel, func)=> ipcRenderer.on(channel, (event, ...args)=>func(...args))
})

webFrame.setContent