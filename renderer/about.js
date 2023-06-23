const globeContainer = document.querySelector('#globe');

fetch('./images/Globe_icon.svg')
    .then(response => response.text())
    .then(svgText => {
      globeContainer.innerHTML = svgText;

      globeContainer.style.width = '10%'; // Set the desired width
      globeContainer.style.height = '10%'; // Set the desired height
    })