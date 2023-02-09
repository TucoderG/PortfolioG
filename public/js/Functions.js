window.onscroll = function(){
    if(document.documentElement.scrollTop > 100){ //despues de bajar 100px voy a mostrar el boton
        
        document.querySelector('.go-top-container')
        .classList.add('show');
    }else{
        document.querySelector('.go-top-container')
        .classList.remove('show'); 
    }
}

document.querySelector('.go-top-container')
.addEventListener('click', ()=>{
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});


const navToggle = document.querySelector(".toggle")
const menu = document.querySelector(".nav")

navToggle.addEventListener("click", ()=>{
    menu.classList.toggle('nav-visible')
})



const typedTextSpan = document.querySelector('.typed-text');
const cursorSpan = document.querySelector('.cursor');

const textArray = ['amazing', 'entertaining', 'powerful', 'incredible!'];
const typingDelay = 150;
const erasingDelay = 100;
const newTextDelay = 1000;
let textArrayIndex = 0;
let charIndex = 0;

function type(){
    if(charIndex < textArray[textArrayIndex].length){
        if(!cursorSpan.classList.contains('typing')) cursorSpan.classList.add('typing');
        typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
        charIndex++;
        setTimeout(type, typingDelay);

    }else{
        cursorSpan.classList.remove('typing');
        setTimeout(erase, newTextDelay);
    }
}


function erase(){
    if(charIndex > 0){
        if(!cursorSpan.classList.contains('typing')) cursorSpan.classList.add('typing');
        typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex-1);
        charIndex--;
        setTimeout(erase, erasingDelay);
    }else{
        cursorSpan.classList.remove('typing');
        textArrayIndex++;
        if(textArrayIndex >= textArray.length) textArrayIndex = 0;
        setTimeout(type, typingDelay + 1000);
    }
}


document.addEventListener('DOMContentLoaded', function(){

    if(textArray.length) setTimeout(type, newTextDelay + 250);
});