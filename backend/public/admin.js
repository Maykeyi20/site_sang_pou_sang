/* =====================================================
   VÉRIFIER SI L'ADMIN EST CONNECTÉ
===================================================== */

async function verifierConnexion() {

    try {

        const response = await fetch(
            "/me",
            {
                method: "GET",
                credentials: "include"
            }
        );

        if (!response.ok) {

            window.location.href =
                "/login.html";

            return;
        }

        const utilisateur =
            await response.json();

        if (
            !utilisateur.connected ||
            utilisateur.role !== "admin"
        ) {

            window.location.href =
                "/login.html";
        }

    } catch (erreur) {

        console.error(
            "Erreur de vérification :",
            erreur
        );

        window.location.href =
            "/login.html";
    }
}


/* =====================================================
   DÉCONNEXION
===================================================== */

async function deconnexion() {

    try {

        await fetch(
            "/logout",
            {
                method: "POST",
                credentials: "include"
            }
        );

    } catch (erreur) {

        console.error(
            "Erreur de déconnexion :",
            erreur
        );
    }

    window.location.href =
        "/login.html";
}


/* =====================================================
   AJOUTER TEXTE
===================================================== */

function ajouterTexte() {

    const container =
        document.getElementById(
            "blocs-container"
        );

    const bloc =
        document.createElement("div");

    bloc.className = "bloc";

    bloc.innerHTML = `

        <h3>Paragraphe</h3>

        <textarea
            class="bloc-texte"
            rows="8"
            placeholder="Écrire un paragraphe..."
        ></textarea>

        <br><br>

        <button
            type="button"
            onclick="this.parentElement.remove()"
        >
            Supprimer
        </button>

        <hr>
    `;

    container.appendChild(bloc);
}


/* =====================================================
   AJOUTER IMAGE
===================================================== */

function ajouterImage() {

    const container =
        document.getElementById(
            "blocs-container"
        );

    const bloc =
        document.createElement("div");

    bloc.className = "bloc";

    bloc.innerHTML = `

        <h3>Image</h3>

        <input
            type="file"
            class="bloc-image"
            accept="image/*"
        >

        <br><br>

        <button
            type="button"
            onclick="this.parentElement.remove()"
        >
            Supprimer
        </button>

        <hr>
    `;

    container.appendChild(bloc);
}


/* =====================================================
   AJOUTER VIDÉO
===================================================== */

function ajouterVideo() {

    const container =
        document.getElementById(
            "blocs-container"
        );

    const bloc =
        document.createElement("div");

    bloc.className = "bloc";

    bloc.innerHTML = `

        <h3>Vidéo</h3>

        <input
            type="file"
            class="bloc-video"
            accept="video/*"
        >

        <br><br>

        <button
            type="button"
            onclick="this.parentElement.remove()"
        >
            Supprimer
        </button>

        <hr>
    `;

    container.appendChild(bloc);
}


/* =====================================================
   AJOUTER AUDIO
===================================================== */

function ajouterAudio() {

    const container =
        document.getElementById(
            "blocs-container"
        );

    const bloc =
        document.createElement("div");

    bloc.className = "bloc";

    bloc.innerHTML = `

        <h3>Musique</h3>

        <input
            type="file"
            class="bloc-audio"
            accept="audio/*"
        >

        <br><br>

        <button
            type="button"
            onclick="this.parentElement.remove()"
        >
            Supprimer
        </button>

        <hr>
    `;

    container.appendChild(bloc);
}


/* =====================================================
   AJOUTER LIEN
===================================================== */

function ajouterLien() {

    const container =
        document.getElementById(
            "blocs-container"
        );

    const bloc =
        document.createElement("div");

    bloc.className = "bloc";

    bloc.innerHTML = `

        <h3>Lien</h3>

        <input
            type="text"
            class="bloc-lien"
            placeholder="https://..."
        >

        <br><br>

        <button
            type="button"
            onclick="this.parentElement.remove()"
        >
            Supprimer
        </button>

        <hr>
    `;

    container.appendChild(bloc);
}


/* =====================================================
   PUBLIER
===================================================== */

async function publier() {

    const titre =
        document
            .getElementById("titre")
            .value
            .trim();

    const author =
        document
            .getElementById("author")
            .value
            .trim();

    const categorie =
        document
            .getElementById("categorie")
            .value;

    const blocs =
        document.querySelectorAll(
            ".bloc"
        );

    const imageAccueil =
        document
            .getElementById(
                "imageAccueil"
            )
            .files[0];


    if (!titre || !author) {

        alert(
            "Titre et auteur obligatoires."
        );

        return;
    }


    if (blocs.length === 0) {

        alert(
            "Ajoute au moins un bloc."
        );

        return;
    }


    /* =================================================
       DESCRIPTION
    ================================================= */

    let description = "";

    for (const bloc of blocs) {

        const textarea =
            bloc.querySelector(
                ".bloc-texte"
            );

            
            
        if (
            textarea &&
            textarea.value.trim()
        ) {

            description =
                textarea.value.trim();

            break;
        }
    }


    if (!description) {

        description = "Article";
    }


    /* =================================================
       CRÉER L'ARTICLE
    ================================================= */

    const articleFormData =
        new FormData();

    articleFormData.append(
        "titre",
        titre
    );

    articleFormData.append(
        "description",
        description
    );

    articleFormData.append(
        "author",
        author
    );

    articleFormData.append(
        "categorie",
        categorie
    );


    if (imageAccueil) {

        articleFormData.append(
            "imageAccueil",
            imageAccueil
        );
    }

    if (window.articleEnModification) {


    
        try {

        /* =============================================
           MODIFIER LES BLOCS TEXTE ET LIEN EXISTANTS
        ============================================= */

        for (let index = 0; index < blocs.length; index++) {

            const bloc = blocs[index];

            const blocId =
                bloc.dataset.blocId;

            const textarea =
                bloc.querySelector(".bloc-texte");

            const lien =
                bloc.querySelector(".bloc-lien");


            /* =========================================
               MODIFIER UN PARAGRAPHE
            ========================================= */

            if (blocId && textarea) {

                const formDataBloc =
                    new FormData();

                formDataBloc.append(
                    "type_bloc",
                    "texte"
                );

                formDataBloc.append(
                    "contenu",
                    textarea.value.trim()
                );

                formDataBloc.append(
                    "ordre",
                    index + 1
                );

                const responseBloc =
                    await fetch(
                        "/article-blocs/" + blocId,
                        {
                            method: "PUT",
                            credentials: "include",
                            body: formDataBloc
                        }
                    );

                const resultatBloc =
                    await responseBloc.json();

                if (!responseBloc.ok) {

                    alert(
                        resultatBloc.message ||
                        "Erreur pendant la modification du paragraphe."
                    );

                    return;
                }
            }

            /* =========================================
   AJOUTER UN NOUVEAU LIEN
========================================= */

if (!blocId && lien) {

    const nouveauLien =
        lien.value.trim();

    if (!nouveauLien) {
        continue;
    }

    const formDataNouveauLien =
        new FormData();

    formDataNouveauLien.append(
        "article_id",
        window.articleEnModification
    );

    formDataNouveauLien.append(
        "type_bloc",
        "lien"
    );

    formDataNouveauLien.append(
        "contenu",
        nouveauLien
    );

    formDataNouveauLien.append(
        "ordre",
        index + 1
    );

    const responseNouveauLien =
        await fetch(
            "/article-blocs",
            {
                method: "POST",
                credentials: "include",
                body: formDataNouveauLien
            }
        );

    const resultatNouveauLien =
        await responseNouveauLien.json();

    if (!responseNouveauLien.ok) {

        alert(
            resultatNouveauLien.message ||
            "Erreur pendant l'ajout du nouveau lien."
        );

        return;
    }
}


            /* =========================================
               MODIFIER UN LIEN
            ========================================= */

            if (blocId && lien) {

                const formDataLien =
                    new FormData();

                formDataLien.append(
                    "type_bloc",
                    "lien"
                );

                formDataLien.append(
                    "contenu",
                    lien.value.trim()
                );

                formDataLien.append(
                    "ordre",
                    index + 1
                );

                const responseLien =
                    await fetch(
                        "/article-blocs/" + blocId,
                        {
                            method: "PUT",
                            credentials: "include",
                            body: formDataLien
                        }
                    );

                const resultatLien =
                    await responseLien.json();

                if (!responseLien.ok) {

                    alert(
                        resultatLien.message ||
                        "Erreur pendant la modification du lien."
                    );

                    return;
                }
            }
        }


        /* =============================================
           MODIFIER LES INFORMATIONS DE L'ARTICLE
        ============================================= */

        const response =
            await fetch(
                "/contenus/" + window.articleEnModification,
                {
                    method: "PUT",
                    credentials: "include",
                    body: articleFormData
                }
            );

        const resultat =
            await response.json();

        if (!response.ok) {

            alert(
                resultat.message ||
                "Erreur pendant la modification."
            );

            return;
        }


        alert(
            "Article modifié avec succès !"
        );

        window.articleEnModification = null;

        document
            .querySelector("form")
            .reset();

        document
            .getElementById("blocs-container")
            .innerHTML = "";

        const bouton =
            document.getElementById(
                "bouton-publier"
            );

        if (bouton) {

            bouton.textContent =
                "Publier";
        }

        chargerArticlesAdmin();

        return;

    } catch (erreur) {

        console.error(erreur);

        alert(
            "Impossible de sauvegarder les modifications."
        );

        return;
    }
}

    let articleResponse;
    try {

        articleResponse =
            await fetch(
                "/contenus",
                {
                    method: "POST",

                    credentials:
                        "include",

                    body:
                        articleFormData
                }
            );

    } catch (erreur) {

        console.error(erreur);

        alert(
            "Impossible de contacter le serveur."
        );

        return;
    }


    const articleResult =
        await articleResponse.json();


    if (!articleResponse.ok) {

        if (
            articleResponse.status === 401
        ) {

            alert(
                "Ta session a expiré. Reconnecte-toi."
            );

            window.location.href =
                "/login.html";

            return;
        }

        alert(
            articleResult.message ||
            "Erreur pendant la publication."
        );

        return;
    }


    const articleId =
        articleResult.id;


    /* =================================================
       ENREGISTRER LES BLOCS
    ================================================= */

    for (
        let index = 0;
        index < blocs.length;
        index++
    ) {

        const bloc =
            blocs[index];

        const formData =
            new FormData();


        formData.append(
            "article_id",
            articleId
        );

        formData.append(
            "ordre",
            index + 1
        );


        /* TEXTE */

        if (
            bloc.querySelector(
                ".bloc-texte"
            )
        ) {

            const contenu =
                bloc
                    .querySelector(
                        ".bloc-texte"
                    )
                    .value
                    .trim();

            if (!contenu) {

                continue;
            }

            formData.append(
                "type_bloc",
                "texte"
            );

            formData.append(
                "contenu",
                contenu
            );
        }


        /* IMAGE */

        else if (
            bloc.querySelector(
                ".bloc-image"
            )
        ) {

            const fichier =
                bloc
                    .querySelector(
                        ".bloc-image"
                    )
                    .files[0];

            if (!fichier) {

                continue;
            }

            formData.append(
                "type_bloc",
                "image"
            );

            formData.append(
                "fichier",
                fichier
            );
        }


        /* VIDÉO */

        else if (
            bloc.querySelector(
                ".bloc-video"
            )
        ) {

            const fichier =
                bloc
                    .querySelector(
                        ".bloc-video"
                    )
                    .files[0];

            if (!fichier) {

                continue;
            }

            formData.append(
                "type_bloc",
                "video"
            );

            formData.append(
                "fichier",
                fichier
            );
        }


        /* AUDIO */

        else if (
            bloc.querySelector(
                ".bloc-audio"
            )
        ) {

            const fichier =
                bloc
                    .querySelector(
                        ".bloc-audio"
                    )
                    .files[0];

            if (!fichier) {

                continue;
            }

            formData.append(
                "type_bloc",
                "audio"
            );

            formData.append(
                "fichier",
                fichier
            );
        }


        /* LIEN */

        else if (
            bloc.querySelector(
                ".bloc-lien"
            )
        ) {

            const lien =
                bloc
                    .querySelector(
                        ".bloc-lien"
                    )
                    .value
                    .trim();

            if (!lien) {

                continue;
            }

            formData.append(
                "type_bloc",
                "lien"
            );

            formData.append(
                "contenu",
                lien
            );
        }


        const blocResponse =
            await fetch(
                "/article-blocs",
                {
                    method: "POST",

                    credentials:
                        "include",

                    body:
                        formData
                }
            );


        const blocResult =
            await blocResponse.json();


        if (!blocResponse.ok) {

            if (
                blocResponse.status ===
                401
            ) {

                alert(
                    "Ta session a expiré."
                );

                window.location.href =
                    "/login.html";

                return;
            }

            alert(
                "Article créé, mais erreur sur un bloc : " +
                (
                    blocResult.message ||
                    "Erreur inconnue"
                )
            );

            return;
        }
    }


    alert(
        "Article publié avec succès !"
    );


    document
        .querySelector("form")
        .reset();


    document
        .getElementById(
            "blocs-container"
        )
        .innerHTML = "";
}


/* =====================================================
   LANCEMENT
===================================================== */
async function chargerArticlesAdmin() {

    const response =
        await fetch(
            "/contenus",
            {
                credentials: "include"
            }
        );

    const articles =
        await response.json();

    const container =
        document.getElementById(
            "liste-admin-articles"
        );

    container.innerHTML = "";

    articles.forEach(article => {

        const bloc =
            document.createElement("div");

        bloc.innerHTML = `
            <h3>${article.titre}</h3>

            <p>
                Catégorie :
                ${article.categorie}
            </p>

            <button
            type="button"
            onclick="modifierArticle(${article.id})"
        >
        Modifier
        </button>



            <button
                type="button"
                onclick="supprimerArticle(${article.id})"
            >
                Supprimer
            </button>

            <hr>
        `;

        container.appendChild(bloc);
    });
}

async function modifierArticle(id) {

    try {

        // 1. Récupérer l'article
        const response = await fetch(
            "/article/" + id,
            {
                credentials: "include"
            }
        );

        if (!response.ok) {
            alert("Impossible de récupérer l'article.");
            return;
        }

        const article = await response.json();


        // 2. Mettre les informations dans le formulaire
        document.getElementById("titre").value =
            article.titre || "";

        document.getElementById("author").value =
            article.author || "";

        document.getElementById("categorie").value =
            article.categorie || "";


        // 3. Récupérer les blocs de l'article
        const blocsResponse = await fetch(
            "/article/" + id + "/blocs",
            {
                credentials: "include"
            }
        );

        if (!blocsResponse.ok) {
            alert("Impossible de récupérer le contenu de l'article.");
            return;
        }

        const blocs = await blocsResponse.json();


        // 4. Vider les anciens blocs du formulaire
        const container =
            document.getElementById("blocs-container");

        container.innerHTML = "";


        // 5. Remettre les blocs de l'article dans le formulaire
        blocs.forEach(function(bloc) {

           if (bloc.type_bloc === "texte") {

            ajouterTexte();

            const blocsFormulaire =
            document.querySelectorAll(".bloc");

            const dernierBloc =
        blocsFormulaire[blocsFormulaire.length - 1];

         // Mémoriser l'ID du bloc dans MySQL
        dernierBloc.dataset.blocId = bloc.id;

        const textarea =
        dernierBloc.querySelector(".bloc-texte");

      textarea.value = bloc.contenu;
    }


           else if (bloc.type_bloc === "lien") {

        ajouterLien();

        const blocsFormulaire =
        document.querySelectorAll(".bloc");

        const dernierBloc =
        blocsFormulaire[blocsFormulaire.length - 1];

        // Mémoriser l'ID du lien dans MySQL
        dernierBloc.dataset.blocId = bloc.id;

        const lien =
        dernierBloc.querySelector(".bloc-lien");

        lien.value = bloc.contenu;
    }


            else if (bloc.type_bloc === "image") {

                const div =
                    document.createElement("div");

                div.className = "bloc";

                div.innerHTML = `
                    <h3>Image actuelle</h3>

                    <img
                        src="${bloc.contenu}"
                        style="max-width: 300px;"
                    >

                    <p>
                        Pour remplacer cette image,
                        ajoute une nouvelle image.
                    </p>

                    <button
                        type="button"
                        onclick="this.parentElement.remove()"
                    >
                        Supprimer
                    </button>

                    <hr>
                `;

                container.appendChild(div);
            }


            else if (bloc.type_bloc === "video") {

                const div =
                    document.createElement("div");

                div.className = "bloc";

                div.innerHTML = `
                    <h3>Vidéo actuelle</h3>

                    <video
                        src="${bloc.contenu}"
                        controls
                        style="max-width: 400px;"
                    ></video>

                    <hr>
                `;

                container.appendChild(div);
            }


            else if (bloc.type_bloc === "audio") {

                const div =
                    document.createElement("div");

                div.className = "bloc";

                div.innerHTML = `
                    <h3>Audio actuel</h3>

                    <audio
                        src="${bloc.contenu}"
                        controls
                    ></audio>

                    <hr>
                `;

                container.appendChild(div);
            }

        });


        // 6. Mémoriser quel article est en modification
        window.articleEnModification = id;

        const bouton =
        document.getElementById("bouton-publier");

        if (bouton) {
        bouton.textContent = "Sauvegarder les modifications";
        }


        // 7. Remonter vers le formulaire
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


        alert(
            "Article chargé. Tu peux maintenant le modifier."
        );

    }

    catch (erreur) {

        console.error(erreur);

        alert(
            "Erreur pendant le chargement de l'article."
        );
    }
}

async function supprimerArticle(id) {

    const confirmation =
        confirm(
            "Voulez-vous vraiment supprimer cet article ?"
        );

    if (!confirmation) {
        return;
    }

    const response =
        await fetch(
            "/contenus/" + id,
            {
                method: "DELETE",
                credentials: "include"
            }
        );

    const resultat =
        await response.json();

    alert(resultat.message);

    if (response.ok) {
        chargerArticlesAdmin();
    }
}

verifierConnexion();

chargerArticlesAdmin();

function rechercherArticle() {

    const recherche =
        document
            .getElementById("recherche-article")
            .value
            .toLowerCase()
            .trim();

    const articles =
        document.querySelectorAll(
            "#liste-admin-articles > div"
        );

    articles.forEach(article => {

        const titre =
            article
                .querySelector("h3")
                ?.textContent
                .toLowerCase() || "";

        if (titre.includes(recherche)) {

            article.style.display = "";

        } else {

            article.style.display = "none";
        }

    });
}