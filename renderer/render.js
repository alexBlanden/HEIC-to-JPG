const holder = document.querySelector('#holder');

function isFileImage(file) {
    const acceptedImageTypes = ['image/heic'];
    return file && acceptedImageTypes.includes(file['type'])
}

function alertError (message) {
    Toastify.toast({
        text: message,
        duration: 5000,
        close: false,
        style: {
            background: 'red',
            color: 'white',
            textAlign: 'center'
        }
    })
}

function alertSuccess(message) {
    Toastify.toast({
        text: message,
        duration: 5000,
        close: false,
        style: {
            background: 'green',
            color: 'white',
            textAlign: 'center'
        }
    })
}

holder.addEventListener('drop', (e)=> {
    e.preventDefault();
    e.stopPropagation();
    const folderPath = e.dataTransfer.items[0].getAsFile().path;
      console.log(folderPath);
    ipcRenderer.send('folder:dropped', folderPath)
})
holder.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();  
  });

holder.addEventListener('dragenter', (e)=> { 
    console.log('entered');
});

holder.addEventListener("dragleave", (e) => {
    console.log('left');
  });