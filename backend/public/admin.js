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
                onclick="supprimerArticle(${article.id})"
            >
                Supprimer
            </button>

            <hr>
        `;

        container.appendChild(bloc);
    });
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