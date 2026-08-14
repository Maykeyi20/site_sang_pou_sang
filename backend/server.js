require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt");
const app = express();
const PORT = 3000;


/* =========================
   CORS
========================= */

app.use(cors({
    origin: "http://127.0.0.1:5500",
    credentials: true
}));


/* =========================
   MIDDLEWARES
========================= */

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


/* =========================
   SESSION
========================= */

app.use(session({
   secret: process.env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",

        // 24 heures
        maxAge: 24 * 60 * 60 * 1000
    }
}));


/* =========================
   CONNEXION MYSQL
========================= */

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(erreur => {

    if (erreur) {

        console.error(
            "Erreur de connexion à MySQL :",
            erreur
        );

        process.exit(1);
    }

    console.log("Connecté à MySQL !");
});


/* =========================
   CRÉER LE PREMIER ADMIN
========================= */

app.post("/create-admin", async (req, res) => {

    const username =
        req.body.username?.trim();

    const password =
        req.body.password;


    if (!username || !password) {

        return res.status(400).json({
            message:
                "Nom d'utilisateur et mot de passe obligatoires."
        });
    }


    if (password.length < 8) {

        return res.status(400).json({
            message:
                "Le mot de passe doit contenir au moins 8 caractères."
        });
    }


    const verifierUsers = `
        SELECT COUNT(*) AS total
        FROM users
    `;


    db.query(
        verifierUsers,

        async (erreur, resultat) => {

            if (erreur) {

                console.error(erreur);

                return res.status(500).json({
                    message:
                        "Erreur serveur."
                });
            }


            if (resultat[0].total > 0) {

                return res.status(403).json({
                    message:
                        "Un administrateur existe déjà."
                });
            }


            try {

                const passwordHash =
                    await bcrypt.hash(
                        password,
                        12
                    );


                const sql = `
                    INSERT INTO users
                    (
                        username,
                        password,
                        role
                    )
                    VALUES (?, ?, ?)
                `;


                db.query(
                    sql,

                    [
                        username,
                        passwordHash,
                        "admin"
                    ],

                    erreur => {

                        if (erreur) {

                            console.error(erreur);

                            return res
                                .status(500)
                                .json({
                                    message:
                                        "Impossible de créer l'administrateur."
                                });
                        }


                        res.status(201).json({
                            message:
                                "Administrateur créé avec succès !"
                        });
                    }
                );

            } catch (erreur) {

                console.error(erreur);

                return res.status(500).json({
                    message:
                        "Erreur pendant la création du mot de passe."
                });
            }
        }
    );
});


/* =========================
   LOGIN
========================= */

app.post("/login", (req, res) => {

    const username =
        req.body.username?.trim();

    const password =
        req.body.password;


    if (!username || !password) {

        return res.status(400).json({
            message:
                "Nom d'utilisateur et mot de passe obligatoires."
        });
    }


    const sql = `
        SELECT *
        FROM users
        WHERE username = ?
        LIMIT 1
    `;


    db.query(
        sql,

        [username],

        async (erreur, resultats) => {

            if (erreur) {

                console.error(erreur);

                return res.status(500).json({
                    message:
                        "Erreur serveur."
                });
            }


            if (resultats.length === 0) {

                return res.status(401).json({
                    message:
                        "Nom d'utilisateur ou mot de passe incorrect."
                });
            }


            const user =
                resultats[0];


            try {

                const passwordCorrect =
                    await bcrypt.compare(
                        password,
                        user.password
                    );


                if (!passwordCorrect) {

                    return res.status(401).json({
                        message:
                            "Nom d'utilisateur ou mot de passe incorrect."
                    });
                }


                req.session.userId =
                    user.id;

                req.session.username =
                    user.username;

                req.session.role =
                    user.role;


                return res.json({
                    message:
                        "Connexion réussie.",
                    username:
                        user.username,
                    role:
                        user.role
                });

            } catch (erreur) {

                console.error(erreur);

                return res.status(500).json({
                    message:
                        "Erreur serveur."
                });
            }
        }
    );
});


/* =========================
   VÉRIFIER LA CONNEXION
========================= */

app.get("/me", (req, res) => {

    if (!req.session.userId) {

        return res.status(401).json({
            connected: false
        });
    }


    res.json({
        connected: true,
        id: req.session.userId,
        username: req.session.username,
        role: req.session.role
    });
});


/* =========================
   LOGOUT
========================= */

app.post("/logout", (req, res) => {

    req.session.destroy(erreur => {

        if (erreur) {

            return res.status(500).json({
                message:
                    "Impossible de vous déconnecter."
            });
        }


        res.clearCookie(
            "connect.sid"
        );


        res.json({
            message:
                "Déconnexion réussie."
        });
    });
});


/* =========================
   PROTECTION ADMIN
========================= */

function adminSeulement(
    req,
    res,
    next
) {

    if (!req.session.userId) {

        return res.status(401).json({
            message:
                "Vous devez vous connecter."
        });
    }


    if (req.session.role !== "admin") {

        return res.status(403).json({
            message:
                "Accès administrateur requis."
        });
    }


    next();
}


/* =========================
   DOSSIER UPLOADS
========================= */

const uploadsPath =
    path.join(
        __dirname,
        "uploads"
    );


if (!fs.existsSync(uploadsPath)) {

    fs.mkdirSync(
        uploadsPath,
        {
            recursive: true
        }
    );
}


/* =========================
   MULTER
========================= */

const storage =
    multer.diskStorage({

        destination: (
            req,
            file,
            cb
        ) => {

            cb(
                null,
                uploadsPath
            );
        },


        filename: (
            req,
            file,
            cb
        ) => {

            const nomOriginal =
                file.originalname
                    .replace(
                        /\s+/g,
                        "-"
                    );


            cb(
                null,
                `${Date.now()}-${nomOriginal}`
            );
        }
    });


const upload =
    multer({

        storage: storage,

        limits: {

            // 500 Mo maximum
            fileSize:
                500 * 1024 * 1024
        }
    });


/* =========================
   DOSSIER UPLOADS PUBLIC
========================= */

app.use(
    "/uploads",
    express.static(uploadsPath)
);


/* =========================
   PUBLIER UN CONTENU
========================= */

app.post(
    "/contenus",

    adminSeulement,

    upload.fields([
        {
            name: "image",
            maxCount: 1
        },
        {
            name: "video",
            maxCount: 1
        },
        {
            name: "audio",
            maxCount: 1
        }
    ]),

    (req, res) => {

        try {

            const titre =
                req.body.titre?.trim();

            const description =
                req.body.description?.trim();

            const categorie =
                req.body.categorie?.trim();

            const author =
                req.body.author?.trim();

            const lien =
                req.body.lien?.trim()
                || null;


            if (
                !titre ||
                !description ||
                !categorie ||
                !author
            ) {

                return res
                    .status(400)
                    .json({
                        message:
                            "Le titre, la description, la catégorie et l’auteur sont obligatoires."
                    });
            }


            const image =
                req.files?.image?.[0]
                    ? req.files.image[0].filename
                    : null;


            const video =
                req.files?.video?.[0]
                    ? req.files.video[0].filename
                    : null;


            const audio =
                req.files?.audio?.[0]
                    ? req.files.audio[0].filename
                    : null;


            /*
            Ancienne colonne type.
            On utilise article par défaut.
            */

            const type =
                "article";


            const sql = `
                INSERT INTO contenus
                (
                    titre,
                    description,
                    type,
                    categorie,
                    author,
                    image_url,
                    video_url,
                    audio_url,
                    lien_url
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;


            const valeurs = [
                titre,
                description,
                type,
                categorie,
                author,
                image,
                video,
                audio,
                lien
            ];


            db.query(
                sql,

                valeurs,

                (
                    erreur,
                    resultat
                ) => {

                    if (erreur) {

                        console.error(
                            "Erreur pendant la publication :",
                            erreur
                        );


                        return res
                            .status(500)
                            .json({
                                message:
                                    "Erreur pendant la publication du contenu."
                            });
                    }


                    res.status(201).json({
                        message:
                            "Contenu publié avec succès !",

                        id:
                            resultat.insertId
                    });
                }
            );

        } catch (erreur) {

            console.error(erreur);

            res.status(500).json({
                message:
                    "Erreur interne du serveur."
            });
        }
    }
);


/* =========================
   AJOUTER UN BLOC D'ARTICLE
========================= */

app.post(
    "/article-blocs",

    adminSeulement,

    upload.single("fichier"),

    (req, res) => {

        const articleId =
            Number(
                req.body.article_id
            );

        const typeBloc =
            req.body.type_bloc;

        const ordre =
            Number(
                req.body.ordre
            );

        let contenu =
            req.body.contenu?.trim()
            || null;


        if (
            !Number.isInteger(articleId) ||
            articleId <= 0
        ) {

            return res
                .status(400)
                .json({
                    message:
                        "Identifiant d'article invalide."
                });
        }


        const typesAutorises = [
            "texte",
            "image",
            "video",
            "audio",
            "lien"
        ];


        if (
            !typesAutorises.includes(
                typeBloc
            )
        ) {

            return res
                .status(400)
                .json({
                    message:
                        "Type de bloc invalide."
                });
        }


        if (
            !Number.isInteger(ordre) ||
            ordre <= 0
        ) {

            return res
                .status(400)
                .json({
                    message:
                        "Ordre du bloc invalide."
                });
        }


        /*
        Si c'est une image,
        vidéo ou audio :
        req.file existe.
        */

        if (req.file) {

            contenu =
                req.file.filename;
        }


        if (!contenu) {

            return res
                .status(400)
                .json({
                    message:
                        "Le bloc est vide."
                });
        }


        const sql = `
            INSERT INTO article_blocs
            (
                article_id,
                type_bloc,
                contenu,
                ordre
            )
            VALUES (?, ?, ?, ?)
        `;


        db.query(
            sql,

            [
                articleId,
                typeBloc,
                contenu,
                ordre
            ],

            (
                erreur,
                resultat
            ) => {

                if (erreur) {

                    console.error(
                        "Erreur pendant l'ajout du bloc :",
                        erreur
                    );


                    return res
                        .status(500)
                        .json({
                            message:
                                "Erreur pendant l'ajout du bloc."
                        });
                }


                res.status(201).json({
                    message:
                        "Bloc ajouté avec succès.",

                    id:
                        resultat.insertId
                });
            }
        );
    }
);


/* =========================
   RÉCUPÉRER LES BLOCS
   D'UN ARTICLE
========================= */

app.get(
    "/article/:id/blocs",

    (req, res) => {

        const articleId =
            Number(
                req.params.id
            );


        if (
            !Number.isInteger(articleId) ||
            articleId <= 0
        ) {

            return res
                .status(400)
                .json({
                    message:
                        "Identifiant d'article invalide."
                });
        }


        const sql = `
            SELECT *
            FROM article_blocs
            WHERE article_id = ?
            ORDER BY ordre ASC, id ASC
        `;


        db.query(
            sql,

            [articleId],

            (
                erreur,
                resultats
            ) => {

                if (erreur) {

                    console.error(
                        "Erreur pendant la récupération des blocs :",
                        erreur
                    );


                    return res
                        .status(500)
                        .json({
                            message:
                                "Erreur pendant la récupération des blocs."
                        });
                }


                res.json(
                    resultats
                );
            }
        );
    }
);


/* =========================
   RÉCUPÉRER TOUS
   LES CONTENUS
========================= */

app.get(
    "/contenus",

    (req, res) => {

        const categorie =
            req.query.categorie;


        let sql = `
            SELECT *
            FROM contenus
        `;


        const parametres = [];


        if (categorie) {

            sql += `
                WHERE categorie = ?
            `;


            parametres.push(
                categorie
            );
        }


        sql += `
            ORDER BY date_publication DESC, id DESC
        `;


        db.query(
            sql,

            parametres,

            (
                erreur,
                resultats
            ) => {

                if (erreur) {

                    console.error(
                        "Erreur pendant la récupération des contenus :",
                        erreur
                    );


                    return res
                        .status(500)
                        .json({
                            message:
                                "Erreur pendant la récupération des contenus."
                        });
                }


                res.json(
                    resultats
                );
            }
        );
    }
);


/* =========================
   RÉCUPÉRER UN ARTICLE
   PAR ID
========================= */

app.get(
    "/article/:id",

    (req, res) => {

        const id =
            Number(
                req.params.id
            );


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res
                .status(400)
                .json({
                    message:
                        "Identifiant d’article invalide."
                });
        }


        const sql = `
            SELECT *
            FROM contenus
            WHERE id = ?
            LIMIT 1
        `;


        db.query(
            sql,

            [id],

            (
                erreur,
                resultats
            ) => {

                if (erreur) {

                    console.error(
                        "Erreur pendant la récupération de l'article :",
                        erreur
                    );


                    return res
                        .status(500)
                        .json({
                            message:
                                "Erreur pendant la récupération de l’article."
                        });
                }


                if (
                    resultats.length === 0
                ) {

                    return res
                        .status(404)
                        .json({
                            message:
                                "Article introuvable."
                        });
                }


                res.json(
                    resultats[0]
                );
            }
        );
    }
);


/* =========================
   ROUTE TEST
========================= */

app.get(
    "/",

    (req, res) => {

        res.send(
            "Le serveur fonctionne correctement."
        );
    }
);


/* =========================
   GESTION DES ERREURS
========================= */

app.use(
    (
        erreur,
        req,
        res,
        next
    ) => {

        if (
            erreur instanceof
            multer.MulterError
        ) {

            console.error(
                "Erreur Multer :",
                erreur
            );


            if (
                erreur.code ===
                "LIMIT_FILE_SIZE"
            ) {

                return res
                    .status(400)
                    .json({
                        message:
                            "Le fichier est trop volumineux. Maximum : 500 Mo."
                    });
            }


            return res
                .status(400)
                .json({
                    message:
                        erreur.message
                });
        }


        if (erreur) {

            console.error(
                "Erreur serveur :",
                erreur
            );


            return res
                .status(500)
                .json({
                    message:
                        "Erreur interne du serveur."
                });
        }


        next();
    }
);


/* =========================
   DÉMARRER LE SERVEUR
========================= */

app.listen(
    PORT,

    () => {

        console.log(
            `Serveur lancé sur http://127.0.0.1:${PORT}`
        );
    }
);