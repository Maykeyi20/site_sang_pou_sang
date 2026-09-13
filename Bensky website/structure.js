/// fonction pour cliquer sur les éléments
function cli(){

    let items = document.getElementsByClassName("item");

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
        "sinema.html",
        "divesite.html",
        "lidechip.html",
        "mizik.html",
        "sport.html"
    ];

    let item = document.getElementsByClassName("lebal");

    for (let i = 0; i < item.length; i++) {

        item[i].addEventListener("click", function() {
            window.location.href = pages[i];
        });

    }
}

cli();


/// menu trois barres
const btn = document.getElementById("menu-btn");
const menu = document.getElementById("menu");

btn.addEventListener("click", function() {

    if (menu.style.left === "0px") {
        menu.style.left = "-200px";
    } else {
        menu.style.left = "0px";
    }

});


/// récupérer les articles depuis MySQL via le backend
fetch("/contenus")

    .then(function(response) {
        return response.json();
    })

   .then(function(contenus) {

    console.log("Articles reçus :", contenus);

    const sectionArticles = document.getElementById("articles");

    contenus.forEach(function(article) {

        const blocArticle = document.createElement("article");

        const titre = document.createElement("h2");
        titre.textContent = article.titre;

        const description = document.createElement("p");
        description.textContent = article.description;

        const auteur = document.createElement("p");
        auteur.textContent = "Auteur : " + article.author;

        blocArticle.appendChild(titre);
        blocArticle.appendChild(description);
        blocArticle.appendChild(auteur);

        sectionArticles.appendChild(blocArticle);

    });

})

    .catch(function(error) {

        console.error("Erreur :", error);

    });