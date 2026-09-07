

/// fonction pour clicke sou element yo 
function cli(){

   // variable qui vas pacourir le tableau 
    let items = document.getElementsByClassName("item");

    // boucle qui va pacourir tous tablau a et afficher les page correspondre  
    for (let i = 0; i < items.length; i++) {
    items[i].addEventListener("click", function() {

        if (i === 0) {
            window.location.href = "apropos.html";
        }

        else if (i === 1) {
            window.location.href = "CONTAK.html";
        }

        else if (i === 2) {
            window.location.href = "sinema.html";
        }

        else if (i === 3) {
            window.location.href = "divesite.html";
        }

        else if (i === 4) {
            window.location.href = "mizik.html";
        }

        else if (i === 5) {
            window.location.href = "sport.html";
        }

        else if (i === 6) {
            window.location.href = "lidechip.html";
        }

    });

    
}

let pages = [
    "sinema.html",     // 0
    "divesite.html",  // 1
    "lidechip.html", // 2
    "mizik.html",      // 3
    "sport.html"       // 4
];

let item = document.getElementsByClassName("lebal");

for (let i = 0; i < item.length; i++) {
    item[i].addEventListener("click", function() {
        window.location.href = pages[i];
    });
}



}

cli();






/// se pou menu troi bar yo
const btn = document.getElementById("menu-btn");
const menu = document.getElementById("menu");

btn.addEventListener("click", function() {
    if (menu.style.left === "0px") {
        menu.style.left = "-200px"; // fèmen
    } else {
        menu.style.left = "0px"; // ouvri
    }
});



   
 
