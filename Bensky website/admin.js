function ajouterTexte() {

    const container =
        document.getElementById("blocs-container");

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
            onclick="this.parentElement.remove()">
            Supprimer
        </button>

        <hr>

    `;

    container.appendChild(bloc);

}



function ajouterImage() {

    const container =
        document.getElementById("blocs-container");

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
            onclick="this.parentElement.remove()">
            Supprimer
        </button>

        <hr>

    `;

    container.appendChild(bloc);

}



function ajouterVideo() {

    const container =
        document.getElementById("blocs-container");

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
            onclick="this.parentElement.remove()">
            Supprimer
        </button>

        <hr>

    `;

    container.appendChild(bloc);

}



function ajouterAudio() {

    const container =
        document.getElementById("blocs-container");

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
            onclick="this.parentElement.remove()">
            Supprimer
        </button>

        <hr>

    `;

    container.appendChild(bloc);

}



function ajouterLien() {

    const container =
        document.getElementById("blocs-container");

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
            onclick="this.parentElement.remove()">
            Supprimer
        </button>

        <hr>

    `;

    container.appendChild(bloc);

}

async function publier() {

    const titre = document.getElementById("titre").value.trim();
    const author = document.getElementById("author").value.trim();
    const categorie = document.getElementById("categorie").value;

    const blocs = document.querySelectorAll(".bloc");
    
    const imageAccueil =
    document.getElementById("imageAccueil").files[0];

    if (!titre || !author) {
        alert("Titre et auteur obligatoires.");
        return;
    }

    if (blocs.length === 0) {
        alert("Ajoute au moins un bloc.");
        return;
    }

    // On utilise le premier paragraphe comme description courte
    let description = "";

    for (const bloc of blocs) {
        const textarea = bloc.querySelector(".bloc-texte");

        if (textarea && textarea.value.trim()) {
            description = textarea.value.trim();
            break;
        }
    }

    if (!description) {
        description = "Article";
    }

    // 1. Créer l'article principal
    const articleFormData = new FormData();

    articleFormData.append("titre", titre);
    articleFormData.append("description", description);
    articleFormData.append("author", author);
    articleFormData.append("categorie", categorie);
    
    if (imageAccueil) {
    articleFormData.append("imageAccueil", imageAccueil);
    }


    const articleResponse = await fetch(
        "http://127.0.0.1:3000/contenus",
        {
            method: "POST",
            credentials: "include",
            body: articleFormData
        }
    );

    const articleResult = await articleResponse.json();

    if (!articleResponse.ok) {
        alert(articleResult.message);
        return;
    }

    const articleId = articleResult.id;

    // 2. Enregistrer les blocs dans l'ordre
    for (let index = 0; index < blocs.length; index++) {

        const bloc = blocs[index];

        const formData = new FormData();

        formData.append("article_id", articleId);
        formData.append("ordre", index + 1);

        if (bloc.querySelector(".bloc-texte")) {

            formData.append("type_bloc", "texte");

            formData.append(
                "contenu",
                bloc.querySelector(".bloc-texte").value.trim()
            );

        } else if (bloc.querySelector(".bloc-image")) {

            formData.append("type_bloc", "image");

            const fichier =
                bloc.querySelector(".bloc-image").files[0];

            if (fichier) {
                formData.append("fichier", fichier);
            }

        } else if (bloc.querySelector(".bloc-video")) {

            formData.append("type_bloc", "video");

            const fichier =
                bloc.querySelector(".bloc-video").files[0];

            if (fichier) {
                formData.append("fichier", fichier);
            }

        } else if (bloc.querySelector(".bloc-audio")) {

            formData.append("type_bloc", "audio");

            const fichier =
                bloc.querySelector(".bloc-audio").files[0];

            if (fichier) {
                formData.append("fichier", fichier);
            }

        } else if (bloc.querySelector(".bloc-lien")) {

            formData.append("type_bloc", "lien");

            formData.append(
                "contenu",
                bloc.querySelector(".bloc-lien").value.trim()
            );
        }

        const blocResponse = await fetch(
            "http://127.0.0.1:3000/article-blocs",
            {
                method: "POST",
                credentials: "include",
                body: formData
            }
        );

        const blocResult = await blocResponse.json();

        if (!blocResponse.ok) {
            alert(
                "Article créé, mais erreur sur un bloc : " +
                blocResult.message
            );
            return;
        }
    }

    alert("Article publié avec succès !");

    document.querySelector("form").reset();

    document.getElementById("blocs-container").innerHTML = "";
}