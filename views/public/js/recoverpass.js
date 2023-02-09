const urlParams = document.baseURI.replace('https://tucoderg.github.io/PortfolioG/recover', '');
const form = document.getElementById('formulario');

if(urlParams){

    const container = document.getElementById('container');
    container.classList.add("right-panel-active");
    
    const passButton = document.getElementById('passButton');

    passButton.addEventListener('click', () =>{

        form.setAttribute('action', `/recovToken${urlParams}`)
        
    });

}

