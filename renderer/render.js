
//Get area for file drop
const holder = document.querySelector('#holder');
const holderContainer = document.querySelector('#holder-container');
//Get container for svg
const container = document.querySelector('#svg-container');
//Access linear gradient of folders logo
let gradient;
let animateInterval;

//Fetch external svg and inject into document
fetch('./images/folders.svg')
    .then(response => response.text())
    .then(svgText => {
        container.innerHTML = svgText;
        gradient = document.getElementById('gradient');
    })

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
    animateIcon();
})

holder.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();  
  });

holder.addEventListener('dragenter', (e)=> { 
    holderContainer.classList.add('border', 'border-5')
});

holder.addEventListener("dragleave", (e) => {
    if(!holder.contains(e.relatedTarget)){
      console.log('left');
      holderContainer.classList.remove('border', 'border-5')
    }
    
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
    
    animateInterval = setInterval(()=> {
      // checkAmount('x1');
      checkAmount('y1');
      checkAmount('x2');
      // checkAmount('y2');
    }, 100); 
}
function stopIcon () {
  clearInterval(animateInterval);
}
ipcRenderer.on('images:done', ()=> {
  stopIcon()
  console.log('stopped')
})