
const holder = document.querySelector('#holder');
const container = document.querySelector('#svg-container');
let gradient;

fetch('./images/folders.svg')
    .then(response => response.text())
    .then(svgText => {
        container.innerHTML = svgText;
        gradient = document.getElementById('gradient');
        console.log(gradient)
    })

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

function animateIcon () {
    let up = true;
    let down = false;
    
    const checkAmount = (attribute) => {
      let amount = parseFloat(gradient.getAttribute(attribute));
       if(amount == 100){
        up = false;
        down = true
      }
      if(amount == 0){
        up = true;
        down = false;
      }
      if(up){
        amount += 10;
      } else if (down) {
        amount -= 10;
      }
      gradient.setAttribute(attribute, `${amount}%`);
    }
    
    setInterval(()=> {
      // checkAmount('x1');
      checkAmount('y1');
      checkAmount('x2');
      // checkAmount('y2');
    }, 100); 
}

window.onload=()=> animateIcon()