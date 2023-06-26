const socials = document.querySelectorAll('.socials');

console.log(socials)

socials.forEach(link => {
    link.addEventListener('click', function(e) {
        const index = parseInt(this.dataset.index)
        ipcRenderer.send('linkClicked', index)
    })
})