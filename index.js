require('dotenv').config();

const fs = require('fs');
const path = require('path');

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    AttachmentBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    RoleSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    UserSelectMenuBuilder,
    ChannelType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    Events,
    SlashCommandBuilder,
    REST,
    Routes,
    PermissionFlagsBits,
    MessageFlags,
    WebhookClient
} = require('discord.js');


// ======================================================
// CLIENT
// ======================================================

const client = new Client({

    intents: [

        GatewayIntentBits.Guilds,

        GatewayIntentBits.GuildMembers,

        GatewayIntentBits.GuildMessages,

        GatewayIntentBits.MessageContent

    ]

});


// ======================================================
// DISCORD
// ======================================================

const CLIENT_ID =
    '1544812044862365716';


// ======================================================
// CONFIG.JSON
// ======================================================

const DATA_DIR =

    process.env.RAILWAY_ENVIRONMENT

        ? '/app/data'

        : __dirname;


if (
    !fs.existsSync(
        DATA_DIR
    )
) {

    fs.mkdirSync(

        DATA_DIR,

        {

            recursive:
                true

        }

    );

}


const CONFIG_PATH =

    path.join(

        DATA_DIR,

        'config.json'

    );


// ======================================================
// CONFIG PAR DÉFAUT D'UN SERVEUR
// ======================================================

function configBaseServeur() {

    return {

        // ==================================================
        // TICKETS
        // ==================================================

        tickets: {

            staffRoleId:
                '',

            logsChannelId:
                '',

            staffMembers:
                {},

            types:
                {},


            panel: {

                title:
                    '🎫 SUPPORT // LE REFUGE',

                description:
                    '**Besoin d’aide ?**\n\nClique sur le bouton pour ouvrir une demande.',

                buttonLabel:
                    'Ouvrir un ticket',

                color:
                    '#F47B20',

                footer:
                    'LE REFUGE FR • Support'

            },


            ticketEmbed: {

                title:
                    '{emoji} TICKET // {type}',

                description:
                    'Bonjour {member},\n\n' +
                    'Ton ticket a bien été ouvert.\n\n' +
                    '**Type :** {emoji} {type}\n\n' +
                    'Un membre du Staff va te répondre dès que possible.',

                color:
                    '#F47B20',

                footer:
                    'LE REFUGE FR • Support',

                showAvatar:
                    true

            }

        },


        // ==================================================
        // ANNONCES
        // ==================================================

        annonces: {

            channelId:
                '',

            color:
                '#F47B20',

            footer:
                'LE REFUGE FR • Annonce'

        },


        // ==================================================
        // STREAMS TWITCH
        // ==================================================

        streams: {

            channelId:
                '',

            checkInterval:
                60,

            streamers:
                {},


            embed: {

                title:
                    '🔴 {streamer} EST EN LIVE !',

                description:
                    '**{title}**\n\n' +
                    '🎮 **Jeu :** {game}\n' +
                    '👥 **Spectateurs :** {viewers}',

                color:
                    '#9146FF',

                footer:
                    'LE REFUGE FR • Twitch',

                buttonLabel:
                    'Regarder le live',

                mentionEveryone:
                    false

            }

        },


        // ==================================================
        // BIENVENUE / DÉPART
        // ==================================================

        welcome: {

            welcomeEnabled:
                true,

            goodbyeEnabled:
                true,

            welcomeChannelId:
                '',

            goodbyeChannelId:
                '',

            welcomeTitle:
                'Ho ! Un nouveau membre !',

            welcomeMessage:
                '🎉 Bienvenue {member} 🎉',

            welcomeColor:
                '#F47B20',

            welcomeShowAvatar:
                true,

            welcomeImageUrl:
                '',

            goodbyeTitle:
                'Un membre vient de partir... 😢',

            goodbyeMessage:
                'À bientôt **{username}** 👋',

            goodbyeColor:
                '#ED4245',

            goodbyeShowAvatar:
                true,

            goodbyeImageUrl:
                ''

        },


        // ==================================================
        // APPARENCE DU BOT
        // ==================================================

        appearance: {

            nickname:
                '',

            avatarUrl:
                '',

            bannerUrl:
                ''

        }

    };

}


// ======================================================
// CONFIG GLOBALE
// ======================================================

function configBase() {

    return {

        guilds:
            {}

    };

}


// ======================================================
// FUSION CONFIG
// ======================================================

function fusionnerDefauts(
    cible,
    defauts
) {

    for (
        const [key, value]
        of Object.entries(
            defauts
        )
    ) {

        if (
            cible[key] ===
            undefined
        ) {

            cible[key] =
                value;

        }

        else if (

            value &&

            typeof value ===
                'object' &&

            !Array.isArray(
                value
            ) &&

            cible[key] &&

            typeof cible[key] ===
                'object' &&

            !Array.isArray(
                cible[key]
            )

        ) {

            fusionnerDefauts(
                cible[key],
                value
            );

        }

    }


    return cible;

}


// ======================================================
// CHARGER CONFIG GLOBALE
// ======================================================

function chargerConfigGlobale() {

    try {

        if (
            !fs.existsSync(
                CONFIG_PATH
            )
        ) {

            const base =
                configBase();


            fs.writeFileSync(

                CONFIG_PATH,

                JSON.stringify(
                    base,
                    null,
                    4
                ),

                'utf8'

            );


            return base;

        }


        const config =
            JSON.parse(

                fs.readFileSync(
                    CONFIG_PATH,
                    'utf8'
                )

            );


        if (
            !config.guilds
        ) {

            config.guilds =
                {};

        }


        return config;

    }

    catch (error) {

        console.error(
            '❌ Erreur lecture config.json :',
            error
        );


        return configBase();

    }

}


// ======================================================
// SAUVEGARDER CONFIG GLOBALE
// ======================================================

function sauvegarderConfigGlobale(
    config
) {

    try {

        fs.writeFileSync(

            CONFIG_PATH,

            JSON.stringify(
                config,
                null,
                4
            ),

            'utf8'

        );


        console.log(
            '💾 Configuration sauvegardée.'
        );

    }

    catch (error) {

        console.error(
            '❌ Erreur sauvegarde config.json :',
            error
        );

    }

}


// ======================================================
// CHARGER CONFIG D'UN SERVEUR
// ======================================================

function chargerConfigServeur(
    guildId
) {

    const globalConfig =
        chargerConfigGlobale();


    if (
        !globalConfig.guilds[
            guildId
        ]
    ) {

        globalConfig.guilds[
            guildId
        ] =
            configBaseServeur();


        sauvegarderConfigGlobale(
            globalConfig
        );

    }


    fusionnerDefauts(

        globalConfig.guilds[
            guildId
        ],

        configBaseServeur()

    );


    return globalConfig.guilds[
        guildId
    ];

}


// ======================================================
// SAUVEGARDER CONFIG D'UN SERVEUR
// ======================================================

function sauvegarderConfigServeur(
    guildId,
    configServeur
) {

    const globalConfig =
        chargerConfigGlobale();


    if (
        !globalConfig.guilds
    ) {

        globalConfig.guilds =
            {};

    }


    globalConfig.guilds[
        guildId
    ] =
        configServeur;


    sauvegarderConfigGlobale(
        globalConfig
    );

}


// ======================================================
// COULEUR
// ======================================================

function couleurValide(
    couleur,
    fallback = '#F47B20'
) {

    if (
        typeof couleur ===
            'string' &&

        /^#[0-9A-Fa-f]{6}$/.test(
            couleur
        )
    ) {

        return couleur;

    }


    return fallback;

}


// ======================================================
// SLUG
// ======================================================

function creerSlug(
    texte = ''
) {

    return texte

        .toLowerCase()

        .normalize(
            'NFD'
        )

        .replace(
            /[\u0300-\u036f]/g,
            ''
        )

        .replace(
            /[^a-z0-9]+/g,
            '-'
        )

        .replace(
            /^-+|-+$/g,
            ''
        )

        .slice(
            0,
            30
        );

}

// ======================================================
// EMOJI
// ======================================================

function emojiValide(
    emoji
) {

    const valeur =
        String(
            emoji ||
            ''
        ).trim();


    if (
        !valeur
    ) {

        return '🎫';

    }


    return valeur;

}


// ======================================================
// EMOJI STAFF
// ======================================================

function emojiStaffValide(
    emoji
) {

    const valeur =
        String(
            emoji ||
            ''
        ).trim();


    if (
        !valeur
    ) {

        return '🟠';

    }


    return valeur;

}


// ======================================================
// VARIABLES TICKET
// ======================================================

function remplacerVariablesTicket(
    texte,
    membre,
    type
) {

    return String(
        texte ||
        ''
    )

        .replaceAll(
            '{member}',
            `<@${membre.id}>`
        )

        .replaceAll(
            '{mention}',
            `<@${membre.id}>`
        )

        .replaceAll(
            '{user}',
            membre.user?.username ||
            membre.username ||
            'Utilisateur'
        )

        .replaceAll(
            '{username}',
            membre.user?.username ||
            membre.username ||
            'Utilisateur'
        )

        .replaceAll(
            '{type}',
            type?.name ||
            'Support'
        )

        .replaceAll(
            '{emoji}',
            emojiValide(
                type?.emoji
            )
        );

}


// ======================================================
// VARIABLES BIENVENUE
// ======================================================

function remplacerVariablesBienvenue(
    texte,
    member
) {

    return String(
        texte ||
        ''
    )

        .replaceAll(
            '{member}',
            `<@${member.id}>`
        )

        .replaceAll(
            '{mention}',
            `<@${member.id}>`
        )

        .replaceAll(
            '{user}',
            member.user.username
        )

        .replaceAll(
            '{username}',
            member.user.username
        )

        .replaceAll(
            '{server}',
            member.guild.name
        )

        .replaceAll(
            '{guild}',
            member.guild.name
        )

        .replaceAll(
            '{count}',
            String(
                member.guild.memberCount
            )
        );

}


// ======================================================
// VARIABLES DÉPART
// ======================================================

function remplacerVariablesDepart(
    texte,
    member
) {

    return String(
        texte ||
        ''
    )

        .replaceAll(
            '{member}',
            member.user.username
        )

        .replaceAll(
            '{mention}',
            `<@${member.id}>`
        )

        .replaceAll(
            '{user}',
            member.user.username
        )

        .replaceAll(
            '{username}',
            member.user.username
        )

        .replaceAll(
            '{server}',
            member.guild.name
        )

        .replaceAll(
            '{guild}',
            member.guild.name
        )

        .replaceAll(
            '{count}',
            String(
                member.guild.memberCount
            )
        );

}


// ======================================================
// VARIABLES STREAM
// ======================================================

function remplacerVariablesStream(
    texte,
    streamer,
    stream
) {

    return String(
        texte ||
        ''
    )

        .replaceAll(
            '{streamer}',
            streamer.displayName ||
            streamer.login
        )

        .replaceAll(
            '{login}',
            streamer.login
        )

        .replaceAll(
            '{title}',
            stream.title ||
            'Sans titre'
        )

        .replaceAll(
            '{game}',
            stream.game_name ||
            'Non renseigné'
        )

        .replaceAll(
            '{viewers}',
            String(
                stream.viewer_count ??
                0
            )
        );

}


// ======================================================
// NOM PUBLIC DU BOT POUR UN SERVEUR
// ======================================================

function obtenirNomPublicServeur(
    guild
) {

    const config =
        chargerConfigServeur(
            guild.id
        );


    return (

        config.appearance.nickname ||

        guild.members.me?.displayName ||

        client.user?.username ||

        'BOTTEST'

    );

}


// ======================================================
// AVATAR PUBLIC DU BOT POUR UN SERVEUR
// ======================================================
//
// IMPORTANT :
// Ce logo est utilisé pour les messages PUBLICS envoyés
// par webhook.
//
// Il ne modifie PAS l'avatar réel du compte bot Discord.
// ======================================================

function obtenirAvatarPublicServeur(
    guild
) {

    const config =
        chargerConfigServeur(
            guild.id
        );


    return (

        config.appearance.avatarUrl ||

        client.user?.displayAvatarURL({

            extension:
                'png',

            size:
                512

        })

    );

}


// ======================================================
// APPLIQUER LE SURNOM DU BOT AU SERVEUR
// ======================================================

async function appliquerSurnomServeur(
    guild
) {

    try {

        const config =
            chargerConfigServeur(
                guild.id
            );


        const membreBot =
            guild.members.me ||

            await guild.members.fetchMe();


        if (
            !membreBot
        ) {

            return;

        }


        const surnom =
            String(
                config.appearance.nickname ||
                ''
            )
                .trim()
                .slice(
                    0,
                    32
                );


        if (
            surnom
        ) {

            if (
                membreBot.nickname !==
                surnom
            ) {

                await membreBot.setNickname(
                    surnom,
                    'Apparence BOTTEST par serveur'
                );

            }

        }

        else if (
            membreBot.nickname
        ) {

            await membreBot.setNickname(
                null,
                'Suppression du surnom BOTTEST'
            );

        }

    }

    catch (error) {

        console.error(
            `❌ Impossible de modifier le surnom sur ${guild.name} :`,
            error.message
        );

    }

}


// ======================================================
// APPLIQUER LA BANNIÈRE À UN EMBED PUBLIC
// ======================================================
//
// ATTENTION :
// Cette fonction ne doit PAS être utilisée automatiquement
// sur le panneau Ticket.
//
// Elle est réservée aux messages publics pour lesquels
// nous voulons réellement afficher la bannière.
// ======================================================

function appliquerBanniereEmbed(
    embed,
    guild
) {

    const config =
        chargerConfigServeur(
            guild.id
        );


    const bannerUrl =
        String(
            config.appearance.bannerUrl ||
            ''
        ).trim();


    if (
        bannerUrl &&
        /^https?:\/\//i.test(
            bannerUrl
        )
    ) {

        embed.setImage(
            bannerUrl
        );

    }


    return embed;

}


// ======================================================
// TROUVER / CRÉER LE WEBHOOK DU SALON
// ======================================================
//
// CORRECTION IMPORTANTE :
// Un webhook Discord appartient à UN salon.
//
// On ne stocke donc plus un webhook unique pour tout
// le serveur.
//
// Chaque salon public récupère/crée son propre webhook.
// ======================================================

async function obtenirWebhookSalon(
    salon
) {

    if (
        !salon ||
        !salon.isTextBased?.()
    ) {

        return null;

    }


    try {

        const webhooks =
            await salon.fetchWebhooks();


        let webhook =
            webhooks.find(
                wh =>
                    wh.owner?.id ===
                        client.user.id &&
                    wh.name ===
                        'BOTTEST-WEBHOOK'
            );


        if (
            !webhook
        ) {

            webhook =
                await salon.createWebhook({

                    name:
                        'BOTTEST-WEBHOOK',

                    reason:
                        'Apparence BOTTEST personnalisée par serveur'

                });

        }


        return webhook;

    }

    catch (error) {

        console.error(
            `❌ Webhook impossible dans #${salon.name || salon.id} :`,
            error.message
        );


        return null;

    }

}


// ======================================================
// ENVOYER UN MESSAGE PUBLIC PERSONNALISÉ
// ======================================================
//
// Le webhook permet d'avoir :
//
// - un nom public différent par serveur ;
// - un logo public différent par serveur.
//
// IMPORTANT :
// Cette fonction ne doit PAS être utilisée pour les
// boutons interactifs importants des tickets.
// ======================================================

async function envoyerMessagePersonnalise(
    salon,
    options = {}
) {

    if (
        !salon ||
        !salon.isTextBased?.()
    ) {

        throw new Error(
            'Salon invalide pour envoyerMessagePersonnalise.'
        );

    }


    const guild =
        salon.guild;


    // --------------------------------------------------
    // Si le salon n'appartient pas à une guild
    // on envoie directement avec le bot.
    // --------------------------------------------------

    if (
        !guild
    ) {

        return salon.send(
            options
        );

    }


    const webhook =
        await obtenirWebhookSalon(
            salon
        );


    // --------------------------------------------------
    // FALLBACK
    // --------------------------------------------------

    if (
        !webhook
    ) {

        console.warn(
            `⚠️ Webhook indisponible dans #${salon.name}. Envoi direct avec le bot.`
        );


        return salon.send(
            options
        );

    }


    const nom =
        obtenirNomPublicServeur(
            guild
        );


    const avatar =
        obtenirAvatarPublicServeur(
            guild
        );


    const payload = {

        ...options,

        username:
            nom

    };


    if (
        avatar
    ) {

        payload.avatarURL =
            avatar;

    }


    // Un webhook ne doit pas recevoir certaines
    // propriétés réservées aux messages directs.
    delete payload.ephemeral;
    delete payload.flags;


    return webhook.send(
        payload
    );

}


// ======================================================
// EMBED CONFIG APPARENCE
// ======================================================

function creerEmbedConfigApparence(
    guildId
) {

    const config =
        chargerConfigServeur(
            guildId
        );


    const guild =
        client.guilds.cache.get(
            guildId
        );


    const nom =
        guild
            ? obtenirNomPublicServeur(
                guild
            )
            : (
                config.appearance.nickname ||
                'BOTTEST'
            );


    const avatar =
        config.appearance.avatarUrl

            ? '✅ Configuré'

            : '❌ Avatar global';


    const banniere =
        config.appearance.bannerUrl

            ? '✅ Configurée'

            : '❌ Aucune';


    const embed =
        new EmbedBuilder()

            .setColor(
                '#F47B20'
            )

            .setTitle(
                '🤖 APPARENCE DU BOT'
            )

            .setDescription(
                'Configure l’identité utilisée par le bot sur **ce serveur uniquement**.\n\n' +
                '📝 **Nom** = surnom réel du bot sur ce serveur.\n' +
                '🖼️ **Logo des messages** = avatar utilisé pour les messages publics personnalisés.\n' +
                '🌄 **Bannière** = image utilisée dans certains embeds publics.'
            )

            .addFields(

                {

                    name:
                        '📝 Nom',

                    value:
                        nom,

                    inline:
                        false

                },

                {

                    name:
                        '🖼️ Logo des messages',

                    value:
                        avatar,

                    inline:
                        true

                },

                {

                    name:
                        '🌄 Bannière',

                    value:
                        banniere,

                    inline:
                        true

                }

            )

            .setFooter({

                text:
                    guild
                        ? `Serveur : ${guild.name}`
                        : `Serveur ID : ${guildId}`

            })

            .setTimestamp();


    // --------------------------------------------------
    // Ici uniquement, l'aperçu du panneau Apparence
    // peut afficher le logo configuré en miniature.
    // --------------------------------------------------

    if (
        guild
    ) {

        const avatarUrl =
            obtenirAvatarPublicServeur(
                guild
            );


        if (
            avatarUrl
        ) {

            embed.setThumbnail(
                avatarUrl
            );

        }

    }


    return embed;

}


// ======================================================
// EMBED CONFIG TICKETS
// ======================================================

function creerEmbedConfigTickets(
    guildId
) {

    const config =
        chargerConfigServeur(
            guildId
        );


    const types =
        Object.values(
            config.tickets.types ||
            {}
        );


    const staff =
        Object.entries(
            config.tickets.staffMembers ||
            {}
        );


    const listeTypes =
        types.length

            ? types
                .map(
                    type =>
                        `${emojiValide(type.emoji)} ${type.name}`
                )
                .join(
                    '\n'
                )

            : 'Aucun type configuré';


    const listeStaff =
        staff.length

            ? staff
                .map(
                    ([id, infos]) =>
                        `${emojiStaffValide(infos.emoji)} <@${id}>`
                )
                .join(
                    '\n'
                )

            : 'Aucun membre configuré';


    return new EmbedBuilder()

        .setColor(
            '#F47B20'
        )

        .setTitle(
            '🎫 CONFIGURATION DES TICKETS'
        )

        .setDescription(
            'Configuration du système de support de ce serveur.'
        )

        .addFields(

            {

                name:
                    '👮 Rôle Staff',

                value:
                    config.tickets.staffRoleId
                        ? `<@&${config.tickets.staffRoleId}>`
                        : 'Non configuré',

                inline:
                    true

            },

            {

                name:
                    '📜 Salon Logs',

                value:
                    config.tickets.logsChannelId
                        ? `<#${config.tickets.logsChannelId}>`
                        : 'Non configuré',

                inline:
                    true

            },

            {

                name:
                    '📂 Types de tickets',

                value:
                    listeTypes.slice(
                        0,
                        1024
                    ),

                inline:
                    false

            },

            {

                name:
                    '👥 Staff configuré',

                value:
                    listeStaff.slice(
                        0,
                        1024
                    ),

                inline:
                    false

            }

        )

        .setTimestamp();

}


// ======================================================
// EMBED CONFIG BIENVENUE
// ======================================================

function creerEmbedConfigBienvenue(
    guildId
) {

    const config =
        chargerConfigServeur(
            guildId
        );


    return new EmbedBuilder()

        .setColor(
            '#F47B20'
        )

        .setTitle(
            '👋 BIENVENUE / DÉPART'
        )

        .addFields(

            {

                name:
                    '🎉 Arrivées',

                value:
                    config.welcome.welcomeEnabled
                        ? '🟢 Activées'
                        : '🔴 Désactivées',

                inline:
                    true

            },

            {

                name:
                    '📍 Salon arrivée',

                value:
                    config.welcome.welcomeChannelId
                        ? `<#${config.welcome.welcomeChannelId}>`
                        : 'Non configuré',

                inline:
                    true

            },

            {

                name:
                    '👋 Départs',

                value:
                    config.welcome.goodbyeEnabled
                        ? '🟢 Activés'
                        : '🔴 Désactivés',

                inline:
                    true

            },

            {

                name:
                    '📍 Salon départ',

                value:
                    config.welcome.goodbyeChannelId
                        ? `<#${config.welcome.goodbyeChannelId}>`
                        : 'Non configuré',

                inline:
                    true

            },

            {

                name:
                    '🖼️ Image arrivée',

                value:
                    config.welcome.welcomeImageUrl
                        ? '✅ Configurée'
                        : '❌ Aucune',

                inline:
                    true

            },

            {

                name:
                    '🖼️ Image départ',

                value:
                    config.welcome.goodbyeImageUrl
                        ? '✅ Configurée'
                        : '❌ Aucune',

                inline:
                    true

            }

        )

        .setTimestamp();

}


// ======================================================
// EMBED CONFIG ANNONCES
// ======================================================

function creerEmbedConfigAnnonces(
    guildId
) {

    const config =
        chargerConfigServeur(
            guildId
        );


    return new EmbedBuilder()

        .setColor(
            couleurValide(
                config.annonces.color,
                '#F47B20'
            )
        )

        .setTitle(
            '📢 CONFIGURATION DES ANNONCES'
        )

        .addFields(

            {

                name:
                    '📍 Salon',

                value:
                    config.annonces.channelId
                        ? `<#${config.annonces.channelId}>`
                        : 'Non configuré',

                inline:
                    false

            },

            {

                name:
                    '🎨 Couleur',

                value:
                    config.annonces.color ||
                    '#F47B20',

                inline:
                    true

            },

            {

                name:
                    '📝 Footer',

                value:
                    config.annonces.footer ||
                    'Aucun',

                inline:
                    true

            }

        )

        .setTimestamp();

}


// ======================================================
// EMBED CONFIG STREAMS
// ======================================================

function creerEmbedConfigStreams(
    guildId
) {

    const config =
        chargerConfigServeur(
            guildId
        );


    const streamers =
        Object.values(
            config.streams.streamers ||
            {}
        );


    const liste =
        streamers.length

            ? streamers
                .map(
                    streamer =>
                        `• **${streamer.displayName || streamer.login}**`
                )
                .join(
                    '\n'
                )

            : 'Aucun streamer surveillé';


    return new EmbedBuilder()

        .setColor(
            '#9146FF'
        )

        .setTitle(
            '🟣 CONFIGURATION TWITCH'
        )

        .addFields(

            {

                name:
                    '📍 Salon',

                value:
                    config.streams.channelId
                        ? `<#${config.streams.channelId}>`
                        : 'Non configuré',

                inline:
                    true

            },

            {

                name:
                    '📣 @everyone',

                value:
                    config.streams.embed.mentionEveryone
                        ? '🟢 Activé'
                        : '🔴 Désactivé',

                inline:
                    true

            },

            {

                name:
                    '🎥 Streamers',

                value:
                    liste.slice(
                        0,
                        1024
                    ),

                inline:
                    false

            }

        )

        .setTimestamp();

}


// ======================================================
// DONNÉES TEMPORAIRES
// ======================================================

const annoncesEnAttente =
    new Map();


const attenteImageBienvenue =
    new Map();


const attenteImageApparence =
    new Map();


// ======================================================
// TWITCH
// ======================================================

let twitchToken =
    null;


let twitchTokenExpire =
    0;


// ======================================================
// OBTENIR TOKEN TWITCH
// ======================================================

async function getTwitchAppToken() {

    if (
        twitchToken &&
        Date.now() <
            twitchTokenExpire
    ) {

        return twitchToken;

    }


    const clientId =
        process.env.TWITCH_CLIENT_ID;


    const clientSecret =
        process.env.TWITCH_CLIENT_SECRET;


    if (
        !clientId ||
        !clientSecret
    ) {

        throw new Error(
            'TWITCH_CLIENT_ID ou TWITCH_CLIENT_SECRET absent.'
        );

    }


    const response =
        await fetch(

            'https://id.twitch.tv/oauth2/token',

            {

                method:
                    'POST',

                headers: {

                    'Content-Type':
                        'application/x-www-form-urlencoded'

                },

                body:
                    new URLSearchParams({

                        client_id:
                            clientId,

                        client_secret:
                            clientSecret,

                        grant_type:
                            'client_credentials'

                    })

            }

        );


    if (
        !response.ok
    ) {

        const texte =
            await response.text();


        throw new Error(
            `Token Twitch refusé : ${response.status} ${texte}`
        );

    }


    const data =
        await response.json();


    twitchToken =
        data.access_token;


    twitchTokenExpire =
        Date.now() +
        Math.max(
            60,
            (
                data.expires_in ||
                3600
            ) - 60
        ) * 1000;


    return twitchToken;

}


// ======================================================
// REQUÊTE TWITCH
// ======================================================

async function twitchFetch(
    endpoint
) {

    const token =
        await getTwitchAppToken();


    const response =
        await fetch(

            `https://api.twitch.tv/helix${endpoint}`,

            {

                headers: {

                    'Client-ID':
                        process.env.TWITCH_CLIENT_ID,

                    'Authorization':
                        `Bearer ${token}`

                }

            }

        );


    if (
        response.status ===
        401
    ) {

        twitchToken =
            null;


        twitchTokenExpire =
            0;

    }


    if (
        !response.ok
    ) {

        const texte =
            await response.text();


        throw new Error(
            `Twitch API ${response.status} : ${texte}`
        );

    }


    return response.json();

}


// ======================================================
// TROUVER UTILISATEUR TWITCH
// ======================================================

async function trouverUtilisateurTwitch(
    saisie
) {

    let login =
        String(
            saisie ||
            ''
        )
            .trim()
            .toLowerCase();


    login =
        login
            .replace(
                /^https?:\/\/(www\.)?twitch\.tv\//i,
                ''
            )
            .split(
                '/'
            )[0]
            .split(
                '?'
            )[0]
            .trim();


    if (
        !login
    ) {

        return null;

    }


    const data =
        await twitchFetch(
            `/users?login=${encodeURIComponent(login)}`
        );


    return data.data?.[0] ||
        null;

}

// ======================================================
// PUBLIER UNE ANNONCE TWITCH
// ======================================================

async function publierAnnonceStream(
    guild,
    streamer,
    stream
) {

    const config =
        chargerConfigServeur(
            guild.id
        );


    if (
        !config.streams.channelId
    ) {

        return null;

    }


    const salon =

        guild.channels.cache.get(
            config.streams.channelId
        )

        ||

        await guild.channels.fetch(
            config.streams.channelId
        )
            .catch(
                () => null
            );


    if (
        !salon ||
        !salon.isTextBased()
    ) {

        return null;

    }


    const embed =
        new EmbedBuilder()

            .setColor(
                couleurValide(
                    config.streams.embed.color,
                    '#9146FF'
                )
            )

            .setTitle(

                remplacerVariablesStream(
                    config.streams.embed.title,
                    streamer,
                    stream
                )

            )

            .setDescription(

                remplacerVariablesStream(
                    config.streams.embed.description,
                    streamer,
                    stream
                )

            )

            .setURL(
                `https://www.twitch.tv/${streamer.login}`
            )

            .setTimestamp();


    if (
        config.streams.embed.footer
    ) {

        embed.setFooter({

            text:
                config.streams.embed.footer

        });

    }


    // --------------------------------------------------
    // Twitch possède déjà sa propre miniature de stream.
    // On la privilégie par rapport à la bannière du bot.
    // --------------------------------------------------

    if (
        stream.thumbnail_url
    ) {

        embed.setImage(

            stream.thumbnail_url

                .replace(
                    '{width}',
                    '1280'
                )

                .replace(
                    '{height}',
                    '720'
                )

        );

    }


    const bouton =
        new ButtonBuilder()

            .setLabel(
                config.streams.embed.buttonLabel ||
                'Regarder le live'
            )

            .setStyle(
                ButtonStyle.Link
            )

            .setURL(
                `https://www.twitch.tv/${streamer.login}`
            );


    const row =
        new ActionRowBuilder()

            .addComponents(
                bouton
            );


    const payload = {

        embeds: [
            embed
        ],

        components: [
            row
        ],

        allowedMentions: {

            parse:
                config.streams.embed.mentionEveryone
                    ? ['everyone']
                    : []

        }

    };


    if (
        config.streams.embed.mentionEveryone
    ) {

        payload.content =
            '@everyone';

    }


    return envoyerMessagePersonnalise(
        salon,
        payload
    );

}


// ======================================================
// SUPPRIMER UNE ANNONCE TWITCH
// ======================================================

async function supprimerAnnonceStream(
    guild,
    streamer
) {

    if (
        !streamer.messageId ||
        !streamer.channelId
    ) {

        return;

    }


    try {

        const salon =

            guild.channels.cache.get(
                streamer.channelId
            )

            ||

            await guild.channels.fetch(
                streamer.channelId
            )
                .catch(
                    () => null
                );


        if (
            !salon ||
            !salon.isTextBased()
        ) {

            return;

        }


        // --------------------------------------------------
        // Un message Twitch peut avoir été envoyé par webhook.
        // On tente d'abord via le salon.
        // --------------------------------------------------

        const message =
            await salon.messages.fetch(
                streamer.messageId
            )
                .catch(
                    () => null
                );


        if (
            message
        ) {

            await message.delete()
                .catch(
                    () => {}
                );

        }

    }

    catch (error) {

        console.error(
            `❌ Suppression annonce Twitch ${streamer.login} :`,
            error.message
        );

    }

}


// ======================================================
// VÉRIFIER LES STREAMS D'UN SERVEUR
// ======================================================

async function verifierStreamsServeur(
    guild
) {

    const config =
        chargerConfigServeur(
            guild.id
        );


    const streamers =
        Object.values(
            config.streams.streamers ||
            {}
        );


    if (
        !streamers.length
    ) {

        return;

    }


    if (
        !config.streams.channelId
    ) {

        return;

    }


    let modifie =
        false;


    for (
        const streamer
        of streamers
    ) {

        try {

            const data =
                await twitchFetch(

                    `/streams?user_login=${encodeURIComponent(
                        streamer.login
                    )}`

                );


            const stream =
                data.data?.[0] ||
                null;


            // ----------------------------------------------
            // Le streamer vient de passer ONLINE
            // ----------------------------------------------

            if (
                stream &&
                !streamer.isLive
            ) {

                const message =
                    await publierAnnonceStream(
                        guild,
                        streamer,
                        stream
                    );


                streamer.isLive =
                    true;


                streamer.lastStreamId =
                    stream.id ||
                    '';


                if (
                    message
                ) {

                    streamer.messageId =
                        message.id;


                    streamer.channelId =
                        message.channelId ||
                        config.streams.channelId;

                }


                modifie =
                    true;

            }


            // ----------------------------------------------
            // Le streamer est toujours ONLINE mais le bot
            // vient d'être redémarré.
            // ----------------------------------------------

            else if (
                stream &&
                streamer.isLive
            ) {

                if (
                    streamer.lastStreamId !==
                    stream.id
                ) {

                    await supprimerAnnonceStream(
                        guild,
                        streamer
                    );


                    const message =
                        await publierAnnonceStream(
                            guild,
                            streamer,
                            stream
                        );


                    streamer.lastStreamId =
                        stream.id ||
                        '';


                    if (
                        message
                    ) {

                        streamer.messageId =
                            message.id;


                        streamer.channelId =
                            message.channelId ||
                            config.streams.channelId;

                    }


                    modifie =
                        true;

                }

            }


            // ----------------------------------------------
            // Le streamer vient de passer OFFLINE
            // ----------------------------------------------

            else if (
                !stream &&
                streamer.isLive
            ) {

                await supprimerAnnonceStream(
                    guild,
                    streamer
                );


                streamer.isLive =
                    false;


                streamer.messageId =
                    '';


                streamer.channelId =
                    '';


                streamer.lastStreamId =
                    '';


                modifie =
                    true;

            }

        }

        catch (error) {

            console.error(
                `❌ Twitch ${streamer.login} sur ${guild.name} :`,
                error.message
            );

        }

    }


    if (
        modifie
    ) {

        sauvegarderConfigServeur(
            guild.id,
            config
        );

    }

}


// ======================================================
// VÉRIFIER TOUS LES STREAMS
// ======================================================

async function verifierStreams() {

    for (
        const guild
        of client.guilds.cache.values()
    ) {

        await verifierStreamsServeur(
            guild
        );

    }

}


// ======================================================
// COMMANDES SLASH
// ======================================================

const commands = [

    new SlashCommandBuilder()

        .setName(
            'ticket-panel'
        )

        .setDescription(
            'Créer le panneau public des tickets'
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        )

        .toJSON(),


    new SlashCommandBuilder()

        .setName(
            'bot-panel'
        )

        .setDescription(
            'Ouvrir le panneau d’administration du bot'
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        )

        .toJSON()

];


// ======================================================
// REST DISCORD
// ======================================================

const rest =
    new REST({

        version:
            '10'

    })

        .setToken(
            process.env.DISCORD_TOKEN
        );


// ======================================================
// INSTALLER LES COMMANDES
// ======================================================

async function enregistrerCommandes() {

    console.log(
        '⚙️ Installation des commandes globales...'
    );


    await rest.put(

        Routes.applicationCommands(
            CLIENT_ID
        ),

        {

            body:
                commands

        }

    );


    console.log(
        '✅ Commandes globales installées.'
    );

}


// ======================================================
// READY
// ======================================================

client.once(

    Events.ClientReady,

    async () => {

        console.log(
            '================================='
        );

        console.log(
            `✅ BOT CONNECTÉ : ${client.user.tag}`
        );

        console.log(
            `🌍 Serveurs : ${client.guilds.cache.size}`
        );

        console.log(
            '🟠 BOTTEST // VERSION CORRIGÉE'
        );

        console.log(
            '================================='
        );


        // ----------------------------------------------
        // Charger tous les serveurs
        // ----------------------------------------------

        for (
            const guild
            of client.guilds.cache.values()
        ) {

            try {

                chargerConfigServeur(
                    guild.id
                );


                await appliquerSurnomServeur(
                    guild
                );


                console.log(
                    `⚙️ Configuration chargée : ${guild.name}`
                );

            }

            catch (error) {

                console.error(
                    `❌ Config ${guild.name} :`,
                    error.message
                );

            }

        }


        // ----------------------------------------------
        // TWITCH
        // ----------------------------------------------

        try {

            await verifierStreams();

        }

        catch (error) {

            console.error(
                '❌ Vérification Twitch initiale :',
                error.message
            );

        }


        setInterval(

            async () => {

                try {

                    await verifierStreams();

                }

                catch (error) {

                    console.error(
                        '❌ Vérification Twitch automatique :',
                        error.message
                    );

                }

            },

            60000

        );


        console.log(
            '🔴 Twitch : vérification toutes les 60 secondes.'
        );

    }

);


// ======================================================
// BOT AJOUTÉ À UN SERVEUR
// ======================================================

client.on(

    Events.GuildCreate,

    async guild => {

        try {

            chargerConfigServeur(
                guild.id
            );


            await appliquerSurnomServeur(
                guild
            );


            console.log(
                `➕ Bot ajouté sur : ${guild.name}`
            );

        }

        catch (error) {

            console.error(
                `❌ GuildCreate ${guild.name} :`,
                error.message
            );

        }

    }

);


// ======================================================
// BOT RETIRÉ D'UN SERVEUR
// ======================================================

client.on(

    Events.GuildDelete,

    guild => {

        console.log(
            `➖ Bot retiré de : ${guild.name}`
        );

    }

);


// ======================================================
// ARRIVÉE D'UN MEMBRE
// ======================================================

client.on(

    Events.GuildMemberAdd,

    async member => {

        const config =
            chargerConfigServeur(
                member.guild.id
            );


        if (
            !config.welcome.welcomeEnabled ||
            !config.welcome.welcomeChannelId
        ) {

            return;

        }


        const salon =

            member.guild.channels.cache.get(
                config.welcome.welcomeChannelId
            )

            ||

            await member.guild.channels.fetch(
                config.welcome.welcomeChannelId
            )
                .catch(
                    () => null
                );


        if (
            !salon ||
            !salon.isTextBased()
        ) {

            return;

        }


        try {

            const embed =
                new EmbedBuilder()

                    .setColor(
                        couleurValide(
                            config.welcome.welcomeColor,
                            '#F47B20'
                        )
                    )

                    .setTitle(

                        remplacerVariablesBienvenue(
                            config.welcome.welcomeTitle,
                            member
                        )

                    )

                    .setDescription(

                        remplacerVariablesBienvenue(
                            config.welcome.welcomeMessage,
                            member
                        )

                    )

                    .setTimestamp();


            if (
                config.welcome.welcomeShowAvatar
            ) {

                embed.setThumbnail(

                    member.user.displayAvatarURL({

                        extension:
                            'png',

                        size:
                            256

                    })

                );

            }


            // ----------------------------------------------
            // Si le module Bienvenue possède SA PROPRE image,
            // elle est prioritaire.
            //
            // On ne met PAS automatiquement la bannière
            // générale Apparence ici.
            // ----------------------------------------------

            if (
                config.welcome.welcomeImageUrl
            ) {

                embed.setImage(
                    config.welcome.welcomeImageUrl
                );

            }


            await envoyerMessagePersonnalise(

                salon,

                {

                    embeds: [
                        embed
                    ]

                }

            );

        }

        catch (error) {

            console.error(
                `❌ Bienvenue ${member.guild.name} :`,
                error.message
            );

        }

    }

);


// ======================================================
// DÉPART D'UN MEMBRE
// ======================================================

client.on(

    Events.GuildMemberRemove,

    async member => {

        const config =
            chargerConfigServeur(
                member.guild.id
            );


        if (
            !config.welcome.goodbyeEnabled ||
            !config.welcome.goodbyeChannelId
        ) {

            return;

        }


        const salon =

            member.guild.channels.cache.get(
                config.welcome.goodbyeChannelId
            )

            ||

            await member.guild.channels.fetch(
                config.welcome.goodbyeChannelId
            )
                .catch(
                    () => null
                );


        if (
            !salon ||
            !salon.isTextBased()
        ) {

            return;

        }


        try {

            const embed =
                new EmbedBuilder()

                    .setColor(
                        couleurValide(
                            config.welcome.goodbyeColor,
                            '#ED4245'
                        )
                    )

                    .setTitle(

                        remplacerVariablesDepart(
                            config.welcome.goodbyeTitle,
                            member
                        )

                    )

                    .setDescription(

                        remplacerVariablesDepart(
                            config.welcome.goodbyeMessage,
                            member
                        )

                    )

                    .setTimestamp();


            if (
                config.welcome.goodbyeShowAvatar
            ) {

                embed.setThumbnail(

                    member.user.displayAvatarURL({

                        extension:
                            'png',

                        size:
                            256

                    })

                );

            }


            if (
                config.welcome.goodbyeImageUrl
            ) {

                embed.setImage(
                    config.welcome.goodbyeImageUrl
                );

            }


            await envoyerMessagePersonnalise(

                salon,

                {

                    embeds: [
                        embed
                    ]

                }

            );

        }

        catch (error) {

            console.error(
                `❌ Départ ${member.guild.name} :`,
                error.message
            );

        }

    }

);


// ======================================================
// RÉCUPÉRATION DES IMAGES ENVOYÉES
// ======================================================

client.on(

    Events.MessageCreate,

    async message => {

        if (
            message.author.bot ||
            !message.guild
        ) {

            return;

        }


        const cle =
            `${message.guild.id}:${message.author.id}`;


        // ==================================================
        // IMAGE BIENVENUE / DÉPART
        // ==================================================

        const attenteBienvenue =
            attenteImageBienvenue.get(
                cle
            );


        if (
            attenteBienvenue &&
            attenteBienvenue.channelId ===
                message.channel.id
        ) {

            if (
                Date.now() >
                attenteBienvenue.expiresAt
            ) {

                attenteImageBienvenue.delete(
                    cle
                );


                await message.reply(
                    '❌ Temps écoulé. Recommence depuis `/bot-panel`.'
                );


                return;

            }


            const attachment =
                message.attachments.first();


            if (
                !attachment
            ) {

                await message.reply(
                    '❌ Tu dois envoyer une image.'
                );


                return;

            }


            const contentType =
                attachment.contentType ||
                '';


            const extensionImage =
                /\.(png|jpe?g|gif|webp)$/i.test(
                    attachment.name ||
                    attachment.url
                );


            if (
                !contentType.startsWith(
                    'image/'
                ) &&
                !extensionImage
            ) {

                await message.reply(
                    '❌ Le fichier envoyé n’est pas une image.'
                );


                return;

            }


            const config =
                chargerConfigServeur(
                    message.guild.id
                );


            if (
                attenteBienvenue.type ===
                'welcome'
            ) {

                config.welcome.welcomeImageUrl =
                    attachment.url;

            }

            else {

                config.welcome.goodbyeImageUrl =
                    attachment.url;

            }


            sauvegarderConfigServeur(
                message.guild.id,
                config
            );


            attenteImageBienvenue.delete(
                cle
            );


            await message.reply(

                attenteBienvenue.type ===
                'welcome'

                    ? '✅ Image d’arrivée enregistrée.'

                    : '✅ Image de départ enregistrée.'

            );


            return;

        }


        // ==================================================
        // IMAGE APPARENCE
        // ==================================================

        const attenteApparence =
            attenteImageApparence.get(
                cle
            );


        if (
            !attenteApparence
        ) {

            return;

        }


        if (
            attenteApparence.channelId !==
            message.channel.id
        ) {

            return;

        }


        if (
            Date.now() >
            attenteApparence.expiresAt
        ) {

            attenteImageApparence.delete(
                cle
            );


            await message.reply(
                '❌ Temps écoulé. Recommence depuis `/bot-panel`.'
            );


            return;

        }


        const attachment =
            message.attachments.first();


        if (
            !attachment
        ) {

            await message.reply(
                '❌ Tu dois envoyer une image.'
            );


            return;

        }


        const contentType =
            attachment.contentType ||
            '';


        const extensionImage =
            /\.(png|jpe?g|gif|webp)$/i.test(
                attachment.name ||
                attachment.url
            );


        if (
            !contentType.startsWith(
                'image/'
            ) &&
            !extensionImage
        ) {

            await message.reply(
                '❌ Le fichier envoyé n’est pas une image.'
            );


            return;

        }


        const config =
            chargerConfigServeur(
                message.guild.id
            );


        if (
            attenteApparence.type ===
            'avatar'
        ) {

            config.appearance.avatarUrl =
                attachment.url;

        }

        else if (
            attenteApparence.type ===
            'banner'
        ) {

            config.appearance.bannerUrl =
                attachment.url;

        }


        sauvegarderConfigServeur(
            message.guild.id,
            config
        );


        attenteImageApparence.delete(
            cle
        );


        await message.reply(

            attenteApparence.type ===
            'avatar'

                ? '✅ Logo des messages publics enregistré.'

                : '✅ Bannière publique enregistrée.'

        );

    }

);

// ======================================================
// INTERACTIONS
// ======================================================

client.on(

    Events.InteractionCreate,

    async interaction => {

        try {

            // ==================================================
            // SÉCURITÉ : SERVEUR UNIQUEMENT
            // ==================================================

            if (
                !interaction.guild
            ) {

                if (
                    interaction.isRepliable()
                ) {

                    await interaction.reply({

                        content:
                            '❌ Cette commande doit être utilisée dans un serveur Discord.',

                        flags:
                            MessageFlags.Ephemeral

                    });

                }


                return;

            }


            // ==================================================
            // /BOT-PANEL
            // ==================================================

            if (
                interaction.isChatInputCommand() &&
                interaction.commandName ===
                    'bot-panel'
            ) {

                const embed =
                    new EmbedBuilder()

                        .setColor(
                            '#F47B20'
                        )

                        .setTitle(
                            '⚙️ BOTTEST // PANNEAU ADMIN'
                        )

                        .setDescription(
                            `Configuration de **${interaction.guild.name}**.\n\n` +
                            'Chaque serveur possède ses propres paramètres.'
                        )

                        .setFooter({

                            text:
                                `Serveur ID : ${interaction.guild.id}`

                        });


                const ligne =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    'admin_tickets'
                                )

                                .setLabel(
                                    'Tickets'
                                )

                                .setEmoji(
                                    '🎫'
                                )

                                .setStyle(
                                    ButtonStyle.Primary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'admin_bienvenue'
                                )

                                .setLabel(
                                    'Bienvenue'
                                )

                                .setEmoji(
                                    '👋'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'admin_annonces'
                                )

                                .setLabel(
                                    'Annonces'
                                )

                                .setEmoji(
                                    '📢'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'admin_streams'
                                )

                                .setLabel(
                                    'Streams'
                                )

                                .setEmoji(
                                    '🔴'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'admin_appearance'
                                )

                                .setLabel(
                                    'Apparence'
                                )

                                .setEmoji(
                                    '🤖'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                )

                        );


                await interaction.reply({

                    embeds: [
                        embed
                    ],

                    components: [
                        ligne
                    ],

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // PANEL APPARENCE
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'admin_appearance'
            ) {

                const ligne1 =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    'appearance_nickname'
                                )

                                .setLabel(
                                    'Nom du bot'
                                )

                                .setEmoji(
                                    '✏️'
                                )

                                .setStyle(
                                    ButtonStyle.Primary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'appearance_avatar'
                                )

                                .setLabel(
                                    'Logo messages'
                                )

                                .setEmoji(
                                    '🖼️'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'appearance_banner'
                                )

                                .setLabel(
                                    'Bannière'
                                )

                                .setEmoji(
                                    '🌄'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                )

                        );


                const ligne2 =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    'appearance_preview'
                                )

                                .setLabel(
                                    'Aperçu'
                                )

                                .setEmoji(
                                    '👁️'
                                )

                                .setStyle(
                                    ButtonStyle.Success
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'appearance_reset_avatar'
                                )

                                .setLabel(
                                    'Retirer logo'
                                )

                                .setEmoji(
                                    '🗑️'
                                )

                                .setStyle(
                                    ButtonStyle.Danger
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'appearance_reset_banner'
                                )

                                .setLabel(
                                    'Retirer bannière'
                                )

                                .setEmoji(
                                    '🗑️'
                                )

                                .setStyle(
                                    ButtonStyle.Danger
                                )

                        );


                await interaction.update({

                    embeds: [

                        creerEmbedConfigApparence(
                            interaction.guild.id
                        )

                    ],

                    components: [
                        ligne1,
                        ligne2
                    ]

                });


                return;

            }


            // ==================================================
            // CHANGER NOM DU BOT
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'appearance_nickname'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const modal =
                    new ModalBuilder()

                        .setCustomId(
                            'modal_appearance_nickname'
                        )

                        .setTitle(
                            'Nom du bot sur ce serveur'
                        );


                const champ =
                    new TextInputBuilder()

                        .setCustomId(
                            'appearance_nickname_value'
                        )

                        .setLabel(
                            'Nom du bot'
                        )

                        .setPlaceholder(
                            'Ex : Le Refuge FR'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            false
                        )

                        .setMaxLength(
                            32
                        );


                if (
                    config.appearance.nickname
                ) {

                    champ.setValue(
                        config.appearance.nickname
                    );

                }


                modal.addComponents(

                    new ActionRowBuilder()
                        .addComponents(
                            champ
                        )

                );


                await interaction.showModal(
                    modal
                );


                return;

            }


            // ==================================================
            // SAUVEGARDER NOM
            // ==================================================

            if (
                interaction.isModalSubmit() &&
                interaction.customId ===
                    'modal_appearance_nickname'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                config.appearance.nickname =
                    interaction.fields
                        .getTextInputValue(
                            'appearance_nickname_value'
                        )
                        .trim()
                        .slice(
                            0,
                            32
                        );


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await appliquerSurnomServeur(
                    interaction.guild
                );


                await interaction.reply({

                    content:
                        config.appearance.nickname

                            ? `✅ Nom du bot sur **${interaction.guild.name}** : **${config.appearance.nickname}**`

                            : `✅ Nom personnalisé supprimé sur **${interaction.guild.name}**.`,

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // CHANGER LOGO DES MESSAGES PUBLICS
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'appearance_avatar'
            ) {

                const cle =
                    `${interaction.guild.id}:${interaction.user.id}`;


                attenteImageApparence.set(

                    cle,

                    {

                        type:
                            'avatar',

                        channelId:
                            interaction.channel.id,

                        expiresAt:
                            Date.now() +
                            120000

                    }

                );


                await interaction.reply({

                    content:
                        '🖼️ Envoie maintenant **le logo à utiliser pour les messages publics** dans ce salon.\nTu as **2 minutes**.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // CHANGER BANNIÈRE PUBLIQUE
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'appearance_banner'
            ) {

                const cle =
                    `${interaction.guild.id}:${interaction.user.id}`;


                attenteImageApparence.set(

                    cle,

                    {

                        type:
                            'banner',

                        channelId:
                            interaction.channel.id,

                        expiresAt:
                            Date.now() +
                            120000

                    }

                );


                await interaction.reply({

                    content:
                        '🌄 Envoie maintenant **la bannière publique** dans ce salon.\nTu as **2 minutes**.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // RETIRER LOGO
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'appearance_reset_avatar'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                config.appearance.avatarUrl =
                    '';


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.reply({

                    content:
                        '✅ Logo personnalisé retiré pour ce serveur.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // RETIRER BANNIÈRE
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'appearance_reset_banner'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                config.appearance.bannerUrl =
                    '';


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.reply({

                    content:
                        '✅ Bannière retirée pour ce serveur.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // APERÇU APPARENCE
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'appearance_preview'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const embed =
                    new EmbedBuilder()

                        .setColor(
                            '#F47B20'
                        )

                        .setTitle(
                            '🤖 Aperçu de l’apparence'
                        )

                        .setDescription(
                            `Identité publique configurée pour **${interaction.guild.name}**.`
                        )

                        .addFields(

                            {

                                name:
                                    'Nom',

                                value:
                                    obtenirNomPublicServeur(
                                        interaction.guild
                                    ),

                                inline:
                                    true

                            },

                            {

                                name:
                                    'Logo messages',

                                value:
                                    config.appearance.avatarUrl
                                        ? '✅ Personnalisé'
                                        : '❌ Avatar global',

                                inline:
                                    true

                            },

                            {

                                name:
                                    'Bannière',

                                value:
                                    config.appearance.bannerUrl
                                        ? '✅ Configurée'
                                        : '❌ Aucune',

                                inline:
                                    true

                            }

                        )

                        .setTimestamp();


                const avatar =
                    obtenirAvatarPublicServeur(
                        interaction.guild
                    );


                if (
                    avatar
                ) {

                    embed.setThumbnail(
                        avatar
                    );

                }


                // La bannière est volontairement visible ICI
                // car il s'agit de l'aperçu du module Apparence.
                appliquerBanniereEmbed(
                    embed,
                    interaction.guild
                );


                await interaction.reply({

                    embeds: [
                        embed
                    ],

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }

            // ==================================================
            // PANEL TICKETS
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'admin_tickets'
            ) {

                const ligne1 =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    'ticket_staff_role'
                                )

                                .setLabel(
                                    'Rôle Staff'
                                )

                                .setEmoji(
                                    '🛡️'
                                )

                                .setStyle(
                                    ButtonStyle.Primary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'ticket_logs'
                                )

                                .setLabel(
                                    'Salon Logs'
                                )

                                .setEmoji(
                                    '📜'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'ticket_add_staff'
                                )

                                .setLabel(
                                    'Ajouter Staff'
                                )

                                .setEmoji(
                                    '➕'
                                )

                                .setStyle(
                                    ButtonStyle.Success
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'ticket_remove_staff'
                                )

                                .setLabel(
                                    'Retirer Staff'
                                )

                                .setEmoji(
                                    '➖'
                                )

                                .setStyle(
                                    ButtonStyle.Danger
                                )

                        );


                const ligne2 =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    'ticket_add_type'
                                )

                                .setLabel(
                                    'Ajouter type'
                                )

                                .setEmoji(
                                    '📂'
                                )

                                .setStyle(
                                    ButtonStyle.Success
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'ticket_remove_type'
                                )

                                .setLabel(
                                    'Retirer type'
                                )

                                .setEmoji(
                                    '🗑️'
                                )

                                .setStyle(
                                    ButtonStyle.Danger
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'ticket_style_panel'
                                )

                                .setLabel(
                                    'Style panneau'
                                )

                                .setEmoji(
                                    '🎨'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'ticket_style_embed'
                                )

                                .setLabel(
                                    'Style ticket'
                                )

                                .setEmoji(
                                    '📝'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                )

                        );


                await interaction.update({

                    embeds: [

                        creerEmbedConfigTickets(
                            interaction.guild.id
                        )

                    ],

                    components: [
                        ligne1,
                        ligne2
                    ]

                });


                return;

            }


            // ==================================================
            // CHOISIR RÔLE STAFF
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'ticket_staff_role'
            ) {

                const menu =
                    new RoleSelectMenuBuilder()

                        .setCustomId(
                            'ticket_staff_role_select'
                        )

                        .setPlaceholder(
                            'Choisir le rôle Staff'
                        )

                        .setMinValues(
                            1
                        )

                        .setMaxValues(
                            1
                        );


                await interaction.reply({

                    content:
                        '🛡️ Choisis le rôle Staff autorisé à gérer les tickets.',

                    components: [

                        new ActionRowBuilder()
                            .addComponents(
                                menu
                            )

                    ],

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // SAUVEGARDER RÔLE STAFF
            // ==================================================

            if (
                interaction.isRoleSelectMenu() &&
                interaction.customId ===
                    'ticket_staff_role_select'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                config.tickets.staffRoleId =
                    interaction.values[0];


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.update({

                    content:
                        `✅ Rôle Staff défini : <@&${config.tickets.staffRoleId}>`,

                    components:
                        []

                });


                return;

            }


            // ==================================================
            // CHOISIR SALON LOGS
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'ticket_logs'
            ) {

                const menu =
                    new ChannelSelectMenuBuilder()

                        .setCustomId(
                            'ticket_logs_select'
                        )

                        .setPlaceholder(
                            'Choisir le salon Logs'
                        )

                        .setChannelTypes(
                            ChannelType.GuildText
                        )

                        .setMinValues(
                            1
                        )

                        .setMaxValues(
                            1
                        );


                await interaction.reply({

                    content:
                        '📜 Choisis le salon dans lequel seront envoyés les logs des tickets.',

                    components: [

                        new ActionRowBuilder()
                            .addComponents(
                                menu
                            )

                    ],

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // SAUVEGARDER SALON LOGS
            // ==================================================

            if (
                interaction.isChannelSelectMenu() &&
                interaction.customId ===
                    'ticket_logs_select'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                config.tickets.logsChannelId =
                    interaction.values[0];


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.update({

                    content:
                        `✅ Salon Logs défini : <#${config.tickets.logsChannelId}>`,

                    components:
                        []

                });


                return;

            }


            // ==================================================
            // AJOUTER UN MEMBRE STAFF
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'ticket_add_staff'
            ) {

                const menu =
                    new UserSelectMenuBuilder()

                        .setCustomId(
                            'ticket_add_staff_select'
                        )

                        .setPlaceholder(
                            'Choisir un membre du Staff'
                        )

                        .setMinValues(
                            1
                        )

                        .setMaxValues(
                            1
                        );


                await interaction.reply({

                    content:
                        '👤 Choisis le membre du Staff à ajouter.',

                    components: [

                        new ActionRowBuilder()
                            .addComponents(
                                menu
                            )

                    ],

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // MEMBRE STAFF SÉLECTIONNÉ
            // ==================================================

            if (
                interaction.isUserSelectMenu() &&
                interaction.customId ===
                    'ticket_add_staff_select'
            ) {

                const userId =
                    interaction.values[0];


                const modal =
                    new ModalBuilder()

                        .setCustomId(
                            `modal_ticket_staff_emoji:${userId}`
                        )

                        .setTitle(
                            'Emoji du Staff'
                        );


                const champ =
                    new TextInputBuilder()

                        .setCustomId(
                            'staff_emoji'
                        )

                        .setLabel(
                            'Emoji personnel'
                        )

                        .setPlaceholder(
                            'Ex : 🔥'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            10
                        );


                modal.addComponents(

                    new ActionRowBuilder()
                        .addComponents(
                            champ
                        )

                );


                await interaction.showModal(
                    modal
                );


                return;

            }


            // ==================================================
            // SAUVEGARDER STAFF + EMOJI
            // ==================================================

            if (
                interaction.isModalSubmit() &&
                interaction.customId.startsWith(
                    'modal_ticket_staff_emoji:'
                )
            ) {

                const userId =
                    interaction.customId.split(
                        ':'
                    )[1];


                const emoji =
                    emojiStaffValide(

                        interaction.fields
                            .getTextInputValue(
                                'staff_emoji'
                            )

                    );


                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                config.tickets.staffMembers[
                    userId
                ] = {

                    emoji:
                        emoji

                };


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.reply({

                    content:
                        `✅ <@${userId}> ajouté au Staff Tickets avec l’emoji ${emoji}`,

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // RETIRER UN MEMBRE STAFF
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'ticket_remove_staff'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const staff =
                    Object.entries(
                        config.tickets.staffMembers ||
                        {}
                    );


                if (
                    !staff.length
                ) {

                    await interaction.reply({

                        content:
                            '❌ Aucun membre Staff configuré.',

                        flags:
                            MessageFlags.Ephemeral

                    });


                    return;

                }


                const options =
                    staff
                        .slice(
                            0,
                            25
                        )
                        .map(

                            ([id, infos]) => ({

                                label:
                                    `${emojiStaffValide(
                                        infos.emoji
                                    )} ${interaction.guild.members.cache.get(id)?.displayName || id}`
                                        .slice(
                                            0,
                                            100
                                        ),

                                value:
                                    id,

                                description:
                                    `Retirer ce membre du Staff`
                                        .slice(
                                            0,
                                            100
                                        )

                            })

                        );


                const menu =
                    new StringSelectMenuBuilder()

                        .setCustomId(
                            'ticket_remove_staff_select'
                        )

                        .setPlaceholder(
                            'Choisir le Staff à retirer'
                        )

                        .addOptions(
                            options
                        );


                await interaction.reply({

                    content:
                        '➖ Choisis le membre à retirer.',

                    components: [

                        new ActionRowBuilder()
                            .addComponents(
                                menu
                            )

                    ],

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // CONFIRMER RETRAIT STAFF
            // ==================================================

            if (
                interaction.isStringSelectMenu() &&
                interaction.customId ===
                    'ticket_remove_staff_select'
            ) {

                const userId =
                    interaction.values[0];


                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                delete config.tickets.staffMembers[
                    userId
                ];


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.update({

                    content:
                        `✅ <@${userId}> retiré du Staff Tickets.`,

                    components:
                        []

                });


                return;

            }


            // ==================================================
            // AJOUTER TYPE DE TICKET
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'ticket_add_type'
            ) {

                const modal =
                    new ModalBuilder()

                        .setCustomId(
                            'modal_ticket_add_type'
                        )

                        .setTitle(
                            'Ajouter un type de ticket'
                        );


                const nom =
                    new TextInputBuilder()

                        .setCustomId(
                            'ticket_type_name'
                        )

                        .setLabel(
                            'Nom'
                        )

                        .setPlaceholder(
                            'Ex : Recrutement'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            50
                        );


                const emoji =
                    new TextInputBuilder()

                        .setCustomId(
                            'ticket_type_emoji'
                        )

                        .setLabel(
                            'Emoji'
                        )

                        .setPlaceholder(
                            'Ex : 🛡️'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            50
                        );


                const category =
                    new TextInputBuilder()

                        .setCustomId(
                            'ticket_type_category'
                        )

                        .setLabel(
                            'ID de la catégorie Discord'
                        )

                        .setPlaceholder(
                            'Ex : 123456789012345678'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            30
                        );


                modal.addComponents(

                    new ActionRowBuilder()
                        .addComponents(
                            nom
                        ),

                    new ActionRowBuilder()
                        .addComponents(
                            emoji
                        ),

                    new ActionRowBuilder()
                        .addComponents(
                            category
                        )

                );


                await interaction.showModal(
                    modal
                );


                return;

            }


            // ==================================================
            // SAUVEGARDER TYPE DE TICKET
            // ==================================================

            if (
                interaction.isModalSubmit() &&
                interaction.customId ===
                    'modal_ticket_add_type'
            ) {

                const nom =
                    interaction.fields
                        .getTextInputValue(
                            'ticket_type_name'
                        )
                        .trim();


                const emoji =
                    emojiValide(

                        interaction.fields
                            .getTextInputValue(
                                'ticket_type_emoji'
                            )

                    );


                const categoryId =
                    interaction.fields
                        .getTextInputValue(
                            'ticket_type_category'
                        )
                        .trim();


                const categorie =
                    interaction.guild.channels.cache.get(
                        categoryId
                    );


                if (
                    !categorie ||
                    categorie.type !==
                        ChannelType.GuildCategory
                ) {

                    await interaction.reply({

                        content:
                            '❌ L’ID renseigné ne correspond pas à une catégorie Discord valide.',

                        flags:
                            MessageFlags.Ephemeral

                    });


                    return;

                }


                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                let slug =
                    creerSlug(
                        nom
                    );


                if (
                    !slug
                ) {

                    slug =
                        `ticket-${Date.now()}`;

                }


                let idType =
                    slug;


                let compteur =
                    2;


                while (
                    config.tickets.types[
                        idType
                    ]
                ) {

                    idType =
                        `${slug}-${compteur}`;


                    compteur++;

                }


                config.tickets.types[
                    idType
                ] = {

                    id:
                        idType,

                    name:
                        nom,

                    emoji:
                        emoji,

                    categoryId:
                        categoryId

                };


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.reply({

                    content:
                        `✅ Type ajouté : ${emoji} **${nom}**\n📂 Catégorie : <#${categoryId}>`,

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // RETIRER TYPE DE TICKET
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'ticket_remove_type'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const types =
                    Object.entries(
                        config.tickets.types ||
                        {}
                    );


                if (
                    !types.length
                ) {

                    await interaction.reply({

                        content:
                            '❌ Aucun type de ticket configuré.',

                        flags:
                            MessageFlags.Ephemeral

                    });


                    return;

                }


                const options =
                    types
                        .slice(
                            0,
                            25
                        )
                        .map(

                            ([id, type]) => ({

                                label:
                                    `${emojiValide(
                                        type.emoji
                                    )} ${type.name}`
                                        .slice(
                                            0,
                                            100
                                        ),

                                value:
                                    id,

                                description:
                                    `Supprimer ce type de ticket`
                                        .slice(
                                            0,
                                            100
                                        )

                            })

                        );


                const menu =
                    new StringSelectMenuBuilder()

                        .setCustomId(
                            'ticket_remove_type_select'
                        )

                        .setPlaceholder(
                            'Choisir le type à retirer'
                        )

                        .addOptions(
                            options
                        );


                await interaction.reply({

                    content:
                        '🗑️ Choisis le type de ticket à supprimer.',

                    components: [

                        new ActionRowBuilder()
                            .addComponents(
                                menu
                            )

                    ],

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // CONFIRMER RETRAIT TYPE
            // ==================================================

            if (
                interaction.isStringSelectMenu() &&
                interaction.customId ===
                    'ticket_remove_type_select'
            ) {

                const typeId =
                    interaction.values[0];


                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const type =
                    config.tickets.types[
                        typeId
                    ];


                if (
                    !type
                ) {

                    await interaction.update({

                        content:
                            '❌ Ce type n’existe plus.',

                        components:
                            []

                    });


                    return;

                }


                const nom =
                    type.name;


                delete config.tickets.types[
                    typeId
                ];


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.update({

                    content:
                        `✅ Type **${nom}** supprimé.`,

                    components:
                        []

                });


                return;

            }

            // ==================================================
            // STYLE DU PANNEAU TICKET
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'ticket_style_panel'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const modal =
                    new ModalBuilder()

                        .setCustomId(
                            'modal_ticket_style_panel'
                        )

                        .setTitle(
                            'Style du panneau Ticket'
                        );


                const titre =
                    new TextInputBuilder()

                        .setCustomId(
                            'ticket_panel_title'
                        )

                        .setLabel(
                            'Titre'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            256
                        )

                        .setValue(
                            config.tickets.panel.title ||
                            '🎫 SUPPORT'
                        );


                const description =
                    new TextInputBuilder()

                        .setCustomId(
                            'ticket_panel_description'
                        )

                        .setLabel(
                            'Description'
                        )

                        .setStyle(
                            TextInputStyle.Paragraph
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            2000
                        )

                        .setValue(
                            config.tickets.panel.description ||
                            'Clique sur le bouton pour ouvrir un ticket.'
                        );


                const bouton =
                    new TextInputBuilder()

                        .setCustomId(
                            'ticket_panel_button'
                        )

                        .setLabel(
                            'Texte du bouton'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            80
                        )

                        .setValue(
                            config.tickets.panel.buttonLabel ||
                            'Ouvrir un ticket'
                        );


                const couleur =
                    new TextInputBuilder()

                        .setCustomId(
                            'ticket_panel_color'
                        )

                        .setLabel(
                            'Couleur HEX'
                        )

                        .setPlaceholder(
                            '#F47B20'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            7
                        )

                        .setValue(
                            config.tickets.panel.color ||
                            '#F47B20'
                        );


                const footer =
                    new TextInputBuilder()

                        .setCustomId(
                            'ticket_panel_footer'
                        )

                        .setLabel(
                            'Footer'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            false
                        )

                        .setMaxLength(
                            2048
                        );


                if (
                    config.tickets.panel.footer
                ) {

                    footer.setValue(
                        config.tickets.panel.footer
                    );

                }


                modal.addComponents(

                    new ActionRowBuilder()
                        .addComponents(
                            titre
                        ),

                    new ActionRowBuilder()
                        .addComponents(
                            description
                        ),

                    new ActionRowBuilder()
                        .addComponents(
                            bouton
                        ),

                    new ActionRowBuilder()
                        .addComponents(
                            couleur
                        ),

                    new ActionRowBuilder()
                        .addComponents(
                            footer
                        )

                );


                await interaction.showModal(
                    modal
                );


                return;

            }


            // ==================================================
            // SAUVEGARDER STYLE PANNEAU
            // ==================================================

            if (
                interaction.isModalSubmit() &&
                interaction.customId ===
                    'modal_ticket_style_panel'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                config.tickets.panel.title =
                    interaction.fields
                        .getTextInputValue(
                            'ticket_panel_title'
                        )
                        .trim();


                config.tickets.panel.description =
                    interaction.fields
                        .getTextInputValue(
                            'ticket_panel_description'
                        )
                        .trim();


                config.tickets.panel.buttonLabel =
                    interaction.fields
                        .getTextInputValue(
                            'ticket_panel_button'
                        )
                        .trim();


                config.tickets.panel.color =
                    couleurValide(

                        interaction.fields
                            .getTextInputValue(
                                'ticket_panel_color'
                            )
                            .trim(),

                        '#F47B20'

                    );


                config.tickets.panel.footer =
                    interaction.fields
                        .getTextInputValue(
                            'ticket_panel_footer'
                        )
                        .trim();


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.reply({

                    content:
                        '✅ Style du panneau Ticket enregistré.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // STYLE EMBED INTERNE DU TICKET
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'ticket_style_embed'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const modal =
                    new ModalBuilder()

                        .setCustomId(
                            'modal_ticket_style_embed'
                        )

                        .setTitle(
                            'Style du ticket'
                        );


                const titre =
                    new TextInputBuilder()

                        .setCustomId(
                            'ticket_embed_title'
                        )

                        .setLabel(
                            'Titre'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            256
                        )

                        .setValue(
                            config.tickets.ticketEmbed.title ||
                            '{emoji} TICKET // {type}'
                        );


                const description =
                    new TextInputBuilder()

                        .setCustomId(
                            'ticket_embed_description'
                        )

                        .setLabel(
                            'Description'
                        )

                        .setStyle(
                            TextInputStyle.Paragraph
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            3000
                        )

                        .setValue(
                            config.tickets.ticketEmbed.description ||
                            'Bonjour {member}'
                        );


                const couleur =
                    new TextInputBuilder()

                        .setCustomId(
                            'ticket_embed_color'
                        )

                        .setLabel(
                            'Couleur HEX'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            7
                        )

                        .setValue(
                            config.tickets.ticketEmbed.color ||
                            '#F47B20'
                        );


                const footer =
                    new TextInputBuilder()

                        .setCustomId(
                            'ticket_embed_footer'
                        )

                        .setLabel(
                            'Footer'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            false
                        )

                        .setMaxLength(
                            2048
                        );


                if (
                    config.tickets.ticketEmbed.footer
                ) {

                    footer.setValue(
                        config.tickets.ticketEmbed.footer
                    );

                }


                const avatar =
                    new TextInputBuilder()

                        .setCustomId(
                            'ticket_embed_avatar'
                        )

                        .setLabel(
                            'Afficher avatar ? oui / non'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            5
                        )

                        .setValue(
                            config.tickets.ticketEmbed.showAvatar
                                ? 'oui'
                                : 'non'
                        );


                modal.addComponents(

                    new ActionRowBuilder()
                        .addComponents(
                            titre
                        ),

                    new ActionRowBuilder()
                        .addComponents(
                            description
                        ),

                    new ActionRowBuilder()
                        .addComponents(
                            couleur
                        ),

                    new ActionRowBuilder()
                        .addComponents(
                            footer
                        ),

                    new ActionRowBuilder()
                        .addComponents(
                            avatar
                        )

                );


                await interaction.showModal(
                    modal
                );


                return;

            }


            // ==================================================
            // SAUVEGARDER STYLE EMBED INTERNE
            // ==================================================

            if (
                interaction.isModalSubmit() &&
                interaction.customId ===
                    'modal_ticket_style_embed'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                config.tickets.ticketEmbed.title =
                    interaction.fields
                        .getTextInputValue(
                            'ticket_embed_title'
                        )
                        .trim();


                config.tickets.ticketEmbed.description =
                    interaction.fields
                        .getTextInputValue(
                            'ticket_embed_description'
                        )
                        .trim();


                config.tickets.ticketEmbed.color =
                    couleurValide(

                        interaction.fields
                            .getTextInputValue(
                                'ticket_embed_color'
                            )
                            .trim(),

                        '#F47B20'

                    );


                config.tickets.ticketEmbed.footer =
                    interaction.fields
                        .getTextInputValue(
                            'ticket_embed_footer'
                        )
                        .trim();


                const avatar =
                    interaction.fields
                        .getTextInputValue(
                            'ticket_embed_avatar'
                        )
                        .trim()
                        .toLowerCase();


                config.tickets.ticketEmbed.showAvatar =
                    [
                        'oui',
                        'yes',
                        'true',
                        '1'
                    ].includes(
                        avatar
                    );


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.reply({

                    content:
                        '✅ Style de l’embed interne enregistré.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // /TICKET-PANEL
            // ==================================================

            if (
                interaction.isChatInputCommand() &&
                interaction.commandName ===
                    'ticket-panel'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const types =
                    Object.values(
                        config.tickets.types ||
                        {}
                    );


                if (
                    !types.length
                ) {

                    await interaction.reply({

                        content:
                            '❌ Aucun type de ticket n’est configuré.\nConfigure d’abord les types depuis `/bot-panel`.',

                        flags:
                            MessageFlags.Ephemeral

                    });


                    return;

                }


                const embed =
                    new EmbedBuilder()

                        .setColor(
                            couleurValide(
                                config.tickets.panel.color,
                                '#F47B20'
                            )
                        )

                        .setTitle(
                            config.tickets.panel.title ||
                            '🎫 SUPPORT'
                        )

                        .setDescription(
                            config.tickets.panel.description ||
                            'Clique sur le bouton pour ouvrir un ticket.'
                        );


                if (
                    config.tickets.panel.footer
                ) {

                    embed.setFooter({

                        text:
                            config.tickets.panel.footer

                    });

                }


                // ==================================================
                // IMPORTANT
                // ==================================================
                //
                // PAS DE :
                //
                // appliquerBanniereEmbed(...)
                //
                // Le panneau Ticket ne récupère donc JAMAIS
                // automatiquement la bannière du module Apparence.
                // ==================================================


                const bouton =
                    new ButtonBuilder()

                        .setCustomId(
                            'ticket_open'
                        )

                        .setLabel(
                            config.tickets.panel.buttonLabel ||
                            'Ouvrir un ticket'
                        )

                        .setEmoji(
                            '🎫'
                        )

                        .setStyle(
                            ButtonStyle.Primary
                        );


                // IMPORTANT :
                // Le panneau Ticket est envoyé directement par
                // le bot pour garantir les interactions.
                await interaction.channel.send({

                    embeds: [
                        embed
                    ],

                    components: [

                        new ActionRowBuilder()
                            .addComponents(
                                bouton
                            )

                    ]

                });


                await interaction.reply({

                    content:
                        '✅ Panneau Ticket créé dans ce salon.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // OUVRIR UN TICKET
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'ticket_open'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const types =
                    Object.values(
                        config.tickets.types ||
                        {}
                    );


                if (
                    !types.length
                ) {

                    await interaction.reply({

                        content:
                            '❌ Aucun type de ticket n’est disponible.',

                        flags:
                            MessageFlags.Ephemeral

                    });


                    return;

                }


                const options =
                    types
                        .slice(
                            0,
                            25
                        )
                        .map(

                            type => ({

                                label:
                                    String(
                                        type.name ||
                                        'Ticket'
                                    )
                                        .slice(
                                            0,
                                            100
                                        ),

                                value:
                                    type.id,

                                description:
                                    `Ouvrir un ticket ${type.name}`
                                        .slice(
                                            0,
                                            100
                                        )

                            })

                        );


                const menu =
                    new StringSelectMenuBuilder()

                        .setCustomId(
                            'ticket_type_select'
                        )

                        .setPlaceholder(
                            'Choisis le type de ticket'
                        )

                        .addOptions(
                            options
                        );


                await interaction.reply({

                    content:
                        '🎫 Quel type de ticket veux-tu ouvrir ?',

                    components: [

                        new ActionRowBuilder()
                            .addComponents(
                                menu
                            )

                    ],

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // TYPE DE TICKET SÉLECTIONNÉ
            // ==================================================

            if (
                interaction.isStringSelectMenu() &&
                interaction.customId ===
                    'ticket_type_select'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const typeId =
                    interaction.values[0];


                const type =
                    config.tickets.types[
                        typeId
                    ];


                if (
                    !type
                ) {

                    await interaction.update({

                        content:
                            '❌ Ce type de ticket n’existe plus.',

                        components:
                            []

                    });


                    return;

                }


                // ==================================================
                // ÉVITER LES DOUBLONS
                // ==================================================

                const ticketExistant =
                    interaction.guild.channels.cache.find(

                        channel =>
                            channel.type ===
                                ChannelType.GuildText &&

                            channel.topic?.includes(
                                `ticket-owner:${interaction.user.id}`
                            )

                    );


                if (
                    ticketExistant
                ) {

                    await interaction.update({

                        content:
                            `❌ Tu possèdes déjà un ticket ouvert : ${ticketExistant}`,

                        components:
                            []

                    });


                    return;

                }


                const categorie =

                    interaction.guild.channels.cache.get(
                        type.categoryId
                    )

                    ||

                    await interaction.guild.channels.fetch(
                        type.categoryId
                    )
                        .catch(
                            () => null
                        );


                if (
                    !categorie ||
                    categorie.type !==
                        ChannelType.GuildCategory
                ) {

                    await interaction.update({

                        content:
                            '❌ La catégorie configurée pour ce type de ticket est introuvable.',

                        components:
                            []

                    });


                    return;

                }


                // ==================================================
                // NOM DU SALON
                // ==================================================

                const pseudo =
                    creerSlug(
                        interaction.user.username
                    ) ||
                    'membre';


                const nomSalon =
                    `ticket-${pseudo}`
                        .slice(
                            0,
                            100
                        );


                // ==================================================
                // PERMISSIONS
                // ==================================================

                const permissions = [

                    {

                        id:
                            interaction.guild.roles.everyone.id,

                        deny: [
                            PermissionFlagsBits.ViewChannel
                        ]

                    },

                    {

                        id:
                            interaction.user.id,

                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.AttachFiles,
                            PermissionFlagsBits.EmbedLinks
                        ]

                    },

                    {

                        id:
                            client.user.id,

                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.ManageChannels,
                            PermissionFlagsBits.ManageMessages
                        ]

                    }

                ];


                if (
                    config.tickets.staffRoleId
                ) {

                    permissions.push({

                        id:
                            config.tickets.staffRoleId,

                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.AttachFiles,
                            PermissionFlagsBits.EmbedLinks
                        ]

                    });

                }


                // ==================================================
                // CRÉER LE SALON
                // ==================================================

                const ticketChannel =
                    await interaction.guild.channels.create({

                        name:
                            nomSalon,

                        type:
                            ChannelType.GuildText,

                        parent:
                            categorie.id,

                        topic:
                            `ticket-owner:${interaction.user.id} | ticket-type:${typeId}`,

                        permissionOverwrites:
                            permissions,

                        reason:
                            `Ticket ouvert par ${interaction.user.tag}`

                    });


                // ==================================================
                // EMBED INTERNE
                // ==================================================

                const membre =
                    await interaction.guild.members.fetch(
                        interaction.user.id
                    );


                const embed =
                    new EmbedBuilder()

                        .setColor(
                            couleurValide(
                                config.tickets.ticketEmbed.color,
                                '#F47B20'
                            )
                        )

                        .setTitle(

                            remplacerVariablesTicket(
                                config.tickets.ticketEmbed.title,
                                membre,
                                type
                            )

                        )

                        .setDescription(

                            remplacerVariablesTicket(
                                config.tickets.ticketEmbed.description,
                                membre,
                                type
                            )

                        )

                        .setTimestamp();


                if (
                    config.tickets.ticketEmbed.footer
                ) {

                    embed.setFooter({

                        text:
                            config.tickets.ticketEmbed.footer

                    });

                }


                if (
                    config.tickets.ticketEmbed.showAvatar
                ) {

                    embed.setThumbnail(

                        interaction.user.displayAvatarURL({

                            extension:
                                'png',

                            size:
                                256

                        })

                    );

                }


                // ==================================================
                // BOUTONS CLAIM / FERMER
                // ==================================================

                const boutonClaim =
                    new ButtonBuilder()

                        .setCustomId(
                            'ticket_claim'
                        )

                        .setLabel(
                            'Prendre en charge'
                        )

                        .setEmoji(
                            '🙋'
                        )

                        .setStyle(
                            ButtonStyle.Success
                        );


                const boutonClose =
                    new ButtonBuilder()

                        .setCustomId(
                            'ticket_close'
                        )

                        .setLabel(
                            'Fermer le ticket'
                        )

                        .setEmoji(
                            '🔒'
                        )

                        .setStyle(
                            ButtonStyle.Danger
                        );


                // IMPORTANT :
                // Ce message reste envoyé directement par le bot.
                // On n'utilise PAS le webhook d'apparence.
                await ticketChannel.send({

                    content:
                        `${interaction.user}`,

                    embeds: [
                        embed
                    ],

                    components: [

                        new ActionRowBuilder()
                            .addComponents(
                                boutonClaim,
                                boutonClose
                            )

                    ],

                    allowedMentions: {

                        users: [
                            interaction.user.id
                        ]

                    }

                });


                await interaction.update({

                    content:
                        `✅ Ton ticket a été créé : ${ticketChannel}`,

                    components:
                        []

                });


                console.log(
                    `🎫 Ticket créé : ${ticketChannel.name} | ${interaction.user.tag} | ${type.name}`
                );


                return;

            }

            // ==================================================
            // CLAIM D'UN TICKET
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'ticket_claim'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                // ==================================================
                // VÉRIFIER SI LE MEMBRE EST AUTORISÉ
                // ==================================================

                const membre =
                    interaction.member;


                const estAdmin =
                    membre.permissions.has(
                        PermissionFlagsBits.Administrator
                    );


                const estStaffConfigure =
                    Boolean(
                        config.tickets.staffMembers[
                            interaction.user.id
                        ]
                    );


                const aRoleStaff =
                    config.tickets.staffRoleId
                        ? membre.roles.cache.has(
                            config.tickets.staffRoleId
                        )
                        : false;


                if (
                    !estAdmin &&
                    !estStaffConfigure &&
                    !aRoleStaff
                ) {

                    await interaction.reply({

                        content:
                            '❌ Tu n’es pas autorisé à prendre en charge ce ticket.',

                        flags:
                            MessageFlags.Ephemeral

                    });


                    return;

                }


                // ==================================================
                // VÉRIFIER SI LE TICKET EST DÉJÀ CLAIM
                // ==================================================

                const topic =
                    interaction.channel.topic ||
                    '';


                const claimMatch =
                    topic.match(
                        /ticket-claim:(\d+)/
                    );


                if (
                    claimMatch
                ) {

                    const userIdClaim =
                        claimMatch[1];


                    if (
                        userIdClaim ===
                        interaction.user.id
                    ) {

                        await interaction.reply({

                            content:
                                'ℹ️ Tu as déjà pris en charge ce ticket.',

                            flags:
                                MessageFlags.Ephemeral

                        });

                    }

                    else {

                        await interaction.reply({

                            content:
                                `❌ Ce ticket est déjà pris en charge par <@${userIdClaim}>.`,

                            flags:
                                MessageFlags.Ephemeral

                        });

                    }


                    return;

                }


                // ==================================================
                // AJOUTER LE CLAIM DANS LE TOPIC
                // ==================================================

                const nouveauTopic =
                    topic
                        ? `${topic} | ticket-claim:${interaction.user.id}`
                        : `ticket-claim:${interaction.user.id}`;


                await interaction.channel.setTopic(

                    nouveauTopic.slice(
                        0,
                        1024
                    ),

                    `Ticket pris en charge par ${interaction.user.tag}`

                );


                // ==================================================
                // EMOJI PERSONNEL DU STAFF
                // ==================================================

                const emojiStaff =
                    emojiStaffValide(

                        config.tickets.staffMembers[
                            interaction.user.id
                        ]?.emoji

                    );


                // ==================================================
                // RENOMMER LE SALON AVEC L'EMOJI STAFF
                // ==================================================
                //
                // Exemple :
                //
                // ticket-dexter
                //
                // devient :
                //
                // 🔥・dexter
                //
                // ==================================================

                const nomActuel =
                    interaction.channel.name;


                let nomPropre =
                    nomActuel

                        .replace(
                            /^ticket-/,
                            ''
                        )

                        .replace(
                            /^claim-/,
                            ''
                        )

                        .replace(
                            /^[^a-zA-Z0-9]+/,
                            ''
                        );


                if (
                    !nomPropre
                ) {

                    nomPropre =
                        `ticket-${interaction.user.username}`;

                }


                const nouveauNom =
                    `${emojiStaff}・${nomPropre}`
                        .slice(
                            0,
                            100
                        );


                let renommageReussi =
                    true;


                try {

                    await interaction.channel.setName(

                        nouveauNom,

                        `Ticket pris en charge par ${interaction.user.tag}`

                    );


                    console.log(
                        `✅ Ticket renommé : ${nouveauNom}`
                    );

                }

                catch (error) {

                    renommageReussi =
                        false;


                    console.error(
                        '❌ Impossible de mettre l’emoji du Staff devant le ticket :',
                        error
                    );

                }


                // ==================================================
                // MESSAGE DANS LE TICKET
                // ==================================================

                const embedClaim =
                    new EmbedBuilder()

                        .setColor(
                            '#57F287'
                        )

                        .setTitle(
                            `${emojiStaff} Ticket pris en charge`
                        )

                        .setDescription(
                            `${interaction.user} prend désormais en charge ce ticket.`
                        )

                        .setTimestamp();


                await interaction.channel.send({

                    embeds: [
                        embedClaim
                    ]

                });


                // ==================================================
                // RÉPONSE AU CLIC
                // ==================================================

                await interaction.reply({

                    content:
                        renommageReussi

                            ? `✅ Ticket pris en charge avec succès ${emojiStaff}`

                            : `✅ Ticket pris en charge.\n⚠️ Discord a refusé le renommage du salon. Vérifie que le bot possède la permission **Gérer les salons**.`,

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // FERMER UN TICKET
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'ticket_close'
            ) {

                const topic =
                    interaction.channel.topic ||
                    '';


                // ==================================================
                // VÉRIFIER QUE C'EST BIEN UN TICKET
                // ==================================================

                const ownerMatch =
                    topic.match(
                        /ticket-owner:(\d+)/
                    );


                if (
                    !ownerMatch
                ) {

                    await interaction.reply({

                        content:
                            '❌ Impossible de retrouver le propriétaire de ce ticket.',

                        flags:
                            MessageFlags.Ephemeral

                    });


                    return;

                }


                const ownerId =
                    ownerMatch[1];


                const claimMatch =
                    topic.match(
                        /ticket-claim:(\d+)/
                    );


                const claimerId =
                    claimMatch
                        ? claimMatch[1]
                        : null;


                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                // ==================================================
                // AUTORISATION DE FERMETURE
                // ==================================================

                const membre =
                    interaction.member;


                const estAdmin =
                    membre.permissions.has(
                        PermissionFlagsBits.Administrator
                    );


                const estStaffConfigure =
                    Boolean(
                        config.tickets.staffMembers[
                            interaction.user.id
                        ]
                    );


                const aRoleStaff =
                    config.tickets.staffRoleId
                        ? membre.roles.cache.has(
                            config.tickets.staffRoleId
                        )
                        : false;


                const estProprietaire =
                    interaction.user.id ===
                    ownerId;


                if (
                    !estAdmin &&
                    !estStaffConfigure &&
                    !aRoleStaff &&
                    !estProprietaire
                ) {

                    await interaction.reply({

                        content:
                            '❌ Tu n’es pas autorisé à fermer ce ticket.',

                        flags:
                            MessageFlags.Ephemeral

                    });


                    return;

                }


                // ==================================================
                // CONFIRMATION
                // ==================================================

                const confirmer =
                    new ButtonBuilder()

                        .setCustomId(
                            'ticket_close_confirm'
                        )

                        .setLabel(
                            'Confirmer la fermeture'
                        )

                        .setEmoji(
                            '✅'
                        )

                        .setStyle(
                            ButtonStyle.Danger
                        );


                const annuler =
                    new ButtonBuilder()

                        .setCustomId(
                            'ticket_close_cancel'
                        )

                        .setLabel(
                            'Annuler'
                        )

                        .setEmoji(
                            '❌'
                        )

                        .setStyle(
                            ButtonStyle.Secondary
                        );


                await interaction.reply({

                    content:
                        '⚠️ Es-tu sûr de vouloir fermer ce ticket ?',

                    components: [

                        new ActionRowBuilder()
                            .addComponents(
                                confirmer,
                                annuler
                            )

                    ],

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // ANNULER FERMETURE
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'ticket_close_cancel'
            ) {

                await interaction.update({

                    content:
                        '✅ Fermeture annulée.',

                    components:
                        []

                });


                return;

            }


            // ==================================================
            // CONFIRMER FERMETURE
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'ticket_close_confirm'
            ) {

                const channel =
                    interaction.channel;


                const topic =
                    channel.topic ||
                    '';


                const ownerMatch =
                    topic.match(
                        /ticket-owner:(\d+)/
                    );


                if (
                    !ownerMatch
                ) {

                    await interaction.update({

                        content:
                            '❌ Impossible de retrouver le propriétaire du ticket.',

                        components:
                            []

                    });


                    return;

                }


                const ownerId =
                    ownerMatch[1];


                const typeMatch =
                    topic.match(
                        /ticket-type:([^|\s]+)/
                    );


                const typeId =
                    typeMatch
                        ? typeMatch[1]
                        : 'inconnu';


                const claimMatch =
                    topic.match(
                        /ticket-claim:(\d+)/
                    );


                const claimerId =
                    claimMatch
                        ? claimMatch[1]
                        : null;


                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                // ==================================================
                // RE-VÉRIFIER LES PERMISSIONS
                // ==================================================

                const membre =
                    interaction.member;


                const estAdmin =
                    membre.permissions.has(
                        PermissionFlagsBits.Administrator
                    );


                const estStaffConfigure =
                    Boolean(
                        config.tickets.staffMembers[
                            interaction.user.id
                        ]
                    );


                const aRoleStaff =
                    config.tickets.staffRoleId
                        ? membre.roles.cache.has(
                            config.tickets.staffRoleId
                        )
                        : false;


                const estProprietaire =
                    interaction.user.id ===
                    ownerId;


                if (
                    !estAdmin &&
                    !estStaffConfigure &&
                    !aRoleStaff &&
                    !estProprietaire
                ) {

                    await interaction.update({

                        content:
                            '❌ Tu n’es pas autorisé à fermer ce ticket.',

                        components:
                            []

                    });


                    return;

                }


                // ==================================================
                // DIRE À DISCORD QU'ON TRAITE LA DEMANDE
                // ==================================================

                await interaction.update({

                    content:
                        '🔒 Fermeture du ticket en cours...',

                    components:
                        []

                });


                // ==================================================
                // RÉCUPÉRER TOUS LES MESSAGES
                // ==================================================

                let tousLesMessages =
                    [];


                let dernierId =
                    null;


                try {

                    while (
                        true
                    ) {

                        const options = {

                            limit:
                                100

                        };


                        if (
                            dernierId
                        ) {

                            options.before =
                                dernierId;

                        }


                        const messages =
                            await channel.messages.fetch(
                                options
                            );


                        if (
                            !messages.size
                        ) {

                            break;

                        }


                        tousLesMessages.push(
                            ...messages.values()
                        );


                        dernierId =
                            messages.last().id;


                        if (
                            messages.size <
                            100
                        ) {

                            break;

                        }

                    }

                }

                catch (error) {

                    console.error(
                        '❌ Erreur récupération messages transcript :',
                        error
                    );

                }


                // ==================================================
                // ORDRE CHRONOLOGIQUE
                // ==================================================

                tousLesMessages.sort(

                    (a, b) =>
                        a.createdTimestamp -
                        b.createdTimestamp

                );


                // ==================================================
                // CRÉER LE TRANSCRIPT
                // ==================================================

                const lignes =
                    [];


                lignes.push(
                    '============================================================'
                );

                lignes.push(
                    `TRANSCRIPT TICKET : ${channel.name}`
                );

                lignes.push(
                    `SERVEUR : ${interaction.guild.name}`
                );

                lignes.push(
                    `SERVEUR ID : ${interaction.guild.id}`
                );

                lignes.push(
                    `SALON ID : ${channel.id}`
                );

                lignes.push(
                    `PROPRIÉTAIRE : ${ownerId}`
                );

                lignes.push(
                    `TYPE : ${typeId}`
                );

                lignes.push(
                    `STAFF CLAIM : ${claimerId || 'Aucun'}`
                );

                lignes.push(
                    `FERMÉ PAR : ${interaction.user.tag} (${interaction.user.id})`
                );

                lignes.push(
                    `DATE FERMETURE : ${new Date().toLocaleString('fr-FR')}`
                );

                lignes.push(
                    '============================================================'
                );

                lignes.push(
                    ''
                );


                for (
                    const message
                    of tousLesMessages
                ) {

                    const date =
                        new Date(
                            message.createdTimestamp
                        )
                            .toLocaleString(
                                'fr-FR'
                            );


                    const auteur =
                        `${message.author?.tag || 'Utilisateur inconnu'} (${message.author?.id || '???'})`;


                    lignes.push(
                        `[${date}] ${auteur}`
                    );


                    if (
                        message.content
                    ) {

                        lignes.push(
                            message.content
                        );

                    }


                    // ----------------------------------------------
                    // PIÈCES JOINTES
                    // ----------------------------------------------

                    if (
                        message.attachments.size
                    ) {

                        for (
                            const attachment
                            of message.attachments.values()
                        ) {

                            lignes.push(
                                `[PIÈCE JOINTE] ${attachment.name || 'fichier'}`
                            );

                            lignes.push(
                                attachment.url
                            );

                        }

                    }


                    // ----------------------------------------------
                    // EMBEDS
                    // ----------------------------------------------

                    if (
                        message.embeds.length
                    ) {

                        for (
                            const embed
                            of message.embeds
                        ) {

                            lignes.push(
                                '[EMBED]'
                            );


                            if (
                                embed.title
                            ) {

                                lignes.push(
                                    `Titre : ${embed.title}`
                                );

                            }


                            if (
                                embed.description
                            ) {

                                lignes.push(
                                    `Description : ${embed.description}`
                                );

                            }


                            if (
                                embed.fields?.length
                            ) {

                                for (
                                    const field
                                    of embed.fields
                                ) {

                                    lignes.push(
                                        `${field.name} : ${field.value}`
                                    );

                                }

                            }


                            if (
                                embed.url
                            ) {

                                lignes.push(
                                    `URL : ${embed.url}`
                                );

                            }


                            if (
                                embed.image?.url
                            ) {

                                lignes.push(
                                    `Image : ${embed.image.url}`
                                );

                            }

                        }

                    }


                    // ----------------------------------------------
                    // STICKERS
                    // ----------------------------------------------

                    if (
                        message.stickers?.size
                    ) {

                        for (
                            const sticker
                            of message.stickers.values()
                        ) {

                            lignes.push(
                                `[STICKER] ${sticker.name}`
                            );

                        }

                    }


                    lignes.push(
                        ''
                    );

                }


                const transcript =
                    lignes.join(
                        '\n'
                    );


                // ==================================================
                // CRÉER LE FICHIER TXT
                // ==================================================

                const nomFichier =
                    `transcript-${channel.name}-${Date.now()}.txt`
                        .replace(
                            /[^a-zA-Z0-9._-]/g,
                            '-'
                        );


                const fichier =
                    new AttachmentBuilder(

                        Buffer.from(
                            transcript,
                            'utf8'
                        ),

                        {

                            name:
                                nomFichier

                        }

                    );


                // ==================================================
                // INFOS TYPE
                // ==================================================

                const type =
                    config.tickets.types[
                        typeId
                    ];


                const nomType =
                    type?.name ||
                    typeId ||
                    'Inconnu';


                // ==================================================
                // LOG EMBED
                // ==================================================

                const logEmbed =
                    new EmbedBuilder()

                        .setColor(
                            '#ED4245'
                        )

                        .setTitle(
                            '🔒 Ticket fermé'
                        )

                        .addFields(

                            {

                                name:
                                    '🎫 Ticket',

                                value:
                                    `\`${channel.name}\``,

                                inline:
                                    true

                            },

                            {

                                name:
                                    '📂 Type',

                                value:
                                    nomType,

                                inline:
                                    true

                            },

                            {

                                name:
                                    '👤 Ouvert par',

                                value:
                                    `<@${ownerId}>`,

                                inline:
                                    true

                            },

                            {

                                name:
                                    '🙋 Pris en charge par',

                                value:
                                    claimerId
                                        ? `<@${claimerId}>`
                                        : 'Personne',

                                inline:
                                    true

                            },

                            {

                                name:
                                    '🔒 Fermé par',

                                value:
                                    `${interaction.user}`,

                                inline:
                                    true

                            },

                            {

                                name:
                                    '💬 Messages',

                                value:
                                    String(
                                        tousLesMessages.length
                                    ),

                                inline:
                                    true

                            }

                        )

                        .setTimestamp();


                // ==================================================
                // ENVOYER DANS LES LOGS
                // ==================================================

                if (
                    config.tickets.logsChannelId
                ) {

                    const logsChannel =

                        interaction.guild.channels.cache.get(
                            config.tickets.logsChannelId
                        )

                        ||

                        await interaction.guild.channels.fetch(
                            config.tickets.logsChannelId
                        )
                            .catch(
                                () => null
                            );


                    if (
                        logsChannel &&
                        logsChannel.isTextBased()
                    ) {

                        try {

                            await logsChannel.send({

                                embeds: [
                                    logEmbed
                                ],

                                files: [
                                    fichier
                                ]

                            });

                        }

                        catch (error) {

                            console.error(
                                '❌ Impossible d’envoyer le transcript dans les logs :',
                                error
                            );

                        }

                    }

                }


                // ==================================================
                // ENVOYER LE TRANSCRIPT EN DM AU PROPRIÉTAIRE
                // ==================================================

                try {

                    const owner =
                        await client.users.fetch(
                            ownerId
                        );


                    if (
                        owner
                    ) {

                        const dmEmbed =
                            new EmbedBuilder()

                                .setColor(
                                    '#F47B20'
                                )

                                .setTitle(
                                    '🎫 Ton ticket a été fermé'
                                )

                                .setDescription(
                                    `Ton ticket **${nomType}** sur **${interaction.guild.name}** vient d’être fermé.`
                                )

                                .addFields(

                                    {

                                        name:
                                            'Fermé par',

                                        value:
                                            interaction.user.tag,

                                        inline:
                                            true

                                    },

                                    {

                                        name:
                                            'Messages',

                                        value:
                                            String(
                                                tousLesMessages.length
                                            ),

                                        inline:
                                            true

                                    }

                                )

                                .setTimestamp();


                        const fichierDM =
                            new AttachmentBuilder(

                                Buffer.from(
                                    transcript,
                                    'utf8'
                                ),

                                {

                                    name:
                                        nomFichier

                                }

                            );


                        await owner.send({

                            embeds: [
                                dmEmbed
                            ],

                            files: [
                                fichierDM
                            ]

                        });

                    }

                }

                catch (error) {

                    console.log(
                        `⚠️ DM impossible pour ${ownerId} : ${error.message}`
                    );

                }


                // ==================================================
                // MESSAGE AVANT SUPPRESSION
                // ==================================================

                await channel.send({

                    embeds: [

                        new EmbedBuilder()

                            .setColor(
                                '#ED4245'
                            )

                            .setTitle(
                                '🔒 Fermeture du ticket'
                            )

                            .setDescription(
                                `Ticket fermé par ${interaction.user}.\n\nSuppression du salon dans **5 secondes**.`
                            )

                            .setTimestamp()

                    ]

                })
                    .catch(
                        () => {}
                    );


                console.log(
                    `🔒 Ticket fermé : ${channel.name} | par ${interaction.user.tag}`
                );


                // ==================================================
                // SUPPRIMER LE SALON APRÈS 5 SECONDES
                // ==================================================

                setTimeout(

                    async () => {

                        try {

                            await channel.delete(
                                `Ticket fermé par ${interaction.user.tag}`
                            );

                        }

                        catch (error) {

                            console.error(
                                `❌ Suppression du ticket ${channel.name} :`,
                                error.message
                            );

                        }

                    },

                    5000

                );


                return;

            }

            // ==================================================
            // PANEL BIENVENUE / DÉPART
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'admin_bienvenue'
            ) {

                const ligne1 =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    'welcome_toggle'
                                )

                                .setLabel(
                                    'Activer / Désactiver arrivée'
                                )

                                .setEmoji(
                                    '🎉'
                                )

                                .setStyle(
                                    ButtonStyle.Primary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'goodbye_toggle'
                                )

                                .setLabel(
                                    'Activer / Désactiver départ'
                                )

                                .setEmoji(
                                    '👋'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                )

                        );


                const ligne2 =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    'welcome_channel'
                                )

                                .setLabel(
                                    'Salon arrivée'
                                )

                                .setEmoji(
                                    '📍'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'goodbye_channel'
                                )

                                .setLabel(
                                    'Salon départ'
                                )

                                .setEmoji(
                                    '📍'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                )

                        );


                const ligne3 =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    'welcome_style'
                                )

                                .setLabel(
                                    'Texte arrivée'
                                )

                                .setEmoji(
                                    '✏️'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'goodbye_style'
                                )

                                .setLabel(
                                    'Texte départ'
                                )

                                .setEmoji(
                                    '✏️'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                )

                        );


                const ligne4 =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    'welcome_image'
                                )

                                .setLabel(
                                    'Image arrivée'
                                )

                                .setEmoji(
                                    '🖼️'
                                )

                                .setStyle(
                                    ButtonStyle.Success
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'goodbye_image'
                                )

                                .setLabel(
                                    'Image départ'
                                )

                                .setEmoji(
                                    '🖼️'
                                )

                                .setStyle(
                                    ButtonStyle.Success
                                )

                        );


                const ligne5 =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    'welcome_image_delete'
                                )

                                .setLabel(
                                    'Retirer image arrivée'
                                )

                                .setEmoji(
                                    '🗑️'
                                )

                                .setStyle(
                                    ButtonStyle.Danger
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'goodbye_image_delete'
                                )

                                .setLabel(
                                    'Retirer image départ'
                                )

                                .setEmoji(
                                    '🗑️'
                                )

                                .setStyle(
                                    ButtonStyle.Danger
                                )

                        );


                await interaction.update({

                    embeds: [

                        creerEmbedConfigBienvenue(
                            interaction.guild.id
                        )

                    ],

                    components: [
                        ligne1,
                        ligne2,
                        ligne3,
                        ligne4,
                        ligne5
                    ]

                });


                return;

            }


            // ==================================================
            // ACTIVER / DÉSACTIVER ARRIVÉE
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'welcome_toggle'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                config.welcome.welcomeEnabled =
                    !config.welcome.welcomeEnabled;


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.reply({

                    content:
                        config.welcome.welcomeEnabled
                            ? '✅ Messages d’arrivée activés.'
                            : '🔴 Messages d’arrivée désactivés.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // ACTIVER / DÉSACTIVER DÉPART
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'goodbye_toggle'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                config.welcome.goodbyeEnabled =
                    !config.welcome.goodbyeEnabled;


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.reply({

                    content:
                        config.welcome.goodbyeEnabled
                            ? '✅ Messages de départ activés.'
                            : '🔴 Messages de départ désactivés.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // CHOISIR SALON ARRIVÉE
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'welcome_channel'
            ) {

                const menu =
                    new ChannelSelectMenuBuilder()

                        .setCustomId(
                            'welcome_channel_select'
                        )

                        .setPlaceholder(
                            'Choisir le salon d’arrivée'
                        )

                        .setChannelTypes(
                            ChannelType.GuildText
                        )

                        .setMinValues(
                            1
                        )

                        .setMaxValues(
                            1
                        );


                await interaction.reply({

                    content:
                        '📍 Choisis le salon des messages d’arrivée.',

                    components: [

                        new ActionRowBuilder()
                            .addComponents(
                                menu
                            )

                    ],

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // SAUVEGARDER SALON ARRIVÉE
            // ==================================================

            if (
                interaction.isChannelSelectMenu() &&
                interaction.customId ===
                    'welcome_channel_select'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                config.welcome.welcomeChannelId =
                    interaction.values[0];


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.update({

                    content:
                        `✅ Salon d’arrivée défini : <#${config.welcome.welcomeChannelId}>`,

                    components:
                        []

                });


                return;

            }


            // ==================================================
            // CHOISIR SALON DÉPART
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'goodbye_channel'
            ) {

                const menu =
                    new ChannelSelectMenuBuilder()

                        .setCustomId(
                            'goodbye_channel_select'
                        )

                        .setPlaceholder(
                            'Choisir le salon de départ'
                        )

                        .setChannelTypes(
                            ChannelType.GuildText
                        )

                        .setMinValues(
                            1
                        )

                        .setMaxValues(
                            1
                        );


                await interaction.reply({

                    content:
                        '📍 Choisis le salon des messages de départ.',

                    components: [

                        new ActionRowBuilder()
                            .addComponents(
                                menu
                            )

                    ],

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // SAUVEGARDER SALON DÉPART
            // ==================================================

            if (
                interaction.isChannelSelectMenu() &&
                interaction.customId ===
                    'goodbye_channel_select'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                config.welcome.goodbyeChannelId =
                    interaction.values[0];


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.update({

                    content:
                        `✅ Salon de départ défini : <#${config.welcome.goodbyeChannelId}>`,

                    components:
                        []

                });


                return;

            }


            // ==================================================
            // STYLE MESSAGE ARRIVÉE
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'welcome_style'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const modal =
                    new ModalBuilder()

                        .setCustomId(
                            'modal_welcome_style'
                        )

                        .setTitle(
                            'Message d’arrivée'
                        );


                const titre =
                    new TextInputBuilder()

                        .setCustomId(
                            'welcome_title'
                        )

                        .setLabel(
                            'Titre'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            256
                        )

                        .setValue(
                            config.welcome.welcomeTitle ||
                            'Ho ! Un nouveau membre !'
                        );


                const message =
                    new TextInputBuilder()

                        .setCustomId(
                            'welcome_message'
                        )

                        .setLabel(
                            'Message'
                        )

                        .setStyle(
                            TextInputStyle.Paragraph
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            3000
                        )

                        .setValue(
                            config.welcome.welcomeMessage ||
                            '🎉 Bienvenue {member} 🎉'
                        );


                const couleur =
                    new TextInputBuilder()

                        .setCustomId(
                            'welcome_color'
                        )

                        .setLabel(
                            'Couleur HEX'
                        )

                        .setPlaceholder(
                            '#F47B20'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            7
                        )

                        .setValue(
                            config.welcome.welcomeColor ||
                            '#F47B20'
                        );


                const avatar =
                    new TextInputBuilder()

                        .setCustomId(
                            'welcome_avatar'
                        )

                        .setLabel(
                            'Afficher avatar ? oui / non'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            5
                        )

                        .setValue(
                            config.welcome.welcomeShowAvatar
                                ? 'oui'
                                : 'non'
                        );


                modal.addComponents(

                    new ActionRowBuilder()
                        .addComponents(
                            titre
                        ),

                    new ActionRowBuilder()
                        .addComponents(
                            message
                        ),

                    new ActionRowBuilder()
                        .addComponents(
                            couleur
                        ),

                    new ActionRowBuilder()
                        .addComponents(
                            avatar
                        )

                );


                await interaction.showModal(
                    modal
                );


                return;

            }


            // ==================================================
            // SAUVEGARDER STYLE ARRIVÉE
            // ==================================================

            if (
                interaction.isModalSubmit() &&
                interaction.customId ===
                    'modal_welcome_style'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                config.welcome.welcomeTitle =
                    interaction.fields
                        .getTextInputValue(
                            'welcome_title'
                        )
                        .trim();


                config.welcome.welcomeMessage =
                    interaction.fields
                        .getTextInputValue(
                            'welcome_message'
                        )
                        .trim();


                config.welcome.welcomeColor =
                    couleurValide(

                        interaction.fields
                            .getTextInputValue(
                                'welcome_color'
                            )
                            .trim(),

                        '#F47B20'

                    );


                const avatar =
                    interaction.fields
                        .getTextInputValue(
                            'welcome_avatar'
                        )
                        .trim()
                        .toLowerCase();


                config.welcome.welcomeShowAvatar =
                    [
                        'oui',
                        'yes',
                        'true',
                        '1'
                    ].includes(
                        avatar
                    );


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.reply({

                    content:
                        '✅ Message d’arrivée enregistré.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // STYLE MESSAGE DÉPART
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'goodbye_style'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const modal =
                    new ModalBuilder()

                        .setCustomId(
                            'modal_goodbye_style'
                        )

                        .setTitle(
                            'Message de départ'
                        );


                const titre =
                    new TextInputBuilder()

                        .setCustomId(
                            'goodbye_title'
                        )

                        .setLabel(
                            'Titre'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            256
                        )

                        .setValue(
                            config.welcome.goodbyeTitle ||
                            'Un membre vient de partir... 😢'
                        );


                const message =
                    new TextInputBuilder()

                        .setCustomId(
                            'goodbye_message'
                        )

                        .setLabel(
                            'Message'
                        )

                        .setStyle(
                            TextInputStyle.Paragraph
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            3000
                        )

                        .setValue(
                            config.welcome.goodbyeMessage ||
                            'À bientôt **{username}** 👋'
                        );


                const couleur =
                    new TextInputBuilder()

                        .setCustomId(
                            'goodbye_color'
                        )

                        .setLabel(
                            'Couleur HEX'
                        )

                        .setPlaceholder(
                            '#ED4245'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            7
                        )

                        .setValue(
                            config.welcome.goodbyeColor ||
                            '#ED4245'
                        );


                const avatar =
                    new TextInputBuilder()

                        .setCustomId(
                            'goodbye_avatar'
                        )

                        .setLabel(
                            'Afficher avatar ? oui / non'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            5
                        )

                        .setValue(
                            config.welcome.goodbyeShowAvatar
                                ? 'oui'
                                : 'non'
                        );


                modal.addComponents(

                    new ActionRowBuilder()
                        .addComponents(
                            titre
                        ),

                    new ActionRowBuilder()
                        .addComponents(
                            message
                        ),

                    new ActionRowBuilder()
                        .addComponents(
                            couleur
                        ),

                    new ActionRowBuilder()
                        .addComponents(
                            avatar
                        )

                );


                await interaction.showModal(
                    modal
                );


                return;

            }


            // ==================================================
            // SAUVEGARDER STYLE DÉPART
            // ==================================================

            if (
                interaction.isModalSubmit() &&
                interaction.customId ===
                    'modal_goodbye_style'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                config.welcome.goodbyeTitle =
                    interaction.fields
                        .getTextInputValue(
                            'goodbye_title'
                        )
                        .trim();


                config.welcome.goodbyeMessage =
                    interaction.fields
                        .getTextInputValue(
                            'goodbye_message'
                        )
                        .trim();


                config.welcome.goodbyeColor =
                    couleurValide(

                        interaction.fields
                            .getTextInputValue(
                                'goodbye_color'
                            )
                            .trim(),

                        '#ED4245'

                    );


                const avatar =
                    interaction.fields
                        .getTextInputValue(
                            'goodbye_avatar'
                        )
                        .trim()
                        .toLowerCase();


                config.welcome.goodbyeShowAvatar =
                    [
                        'oui',
                        'yes',
                        'true',
                        '1'
                    ].includes(
                        avatar
                    );


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.reply({

                    content:
                        '✅ Message de départ enregistré.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // AJOUTER IMAGE ARRIVÉE
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'welcome_image'
            ) {

                const cle =
                    `${interaction.guild.id}:${interaction.user.id}`;


                attenteImageBienvenue.set(

                    cle,

                    {

                        type:
                            'welcome',

                        channelId:
                            interaction.channel.id,

                        expiresAt:
                            Date.now() +
                            120000

                    }

                );


                await interaction.reply({

                    content:
                        '🖼️ Envoie maintenant **l’image d’arrivée** dans ce salon.\nTu as **2 minutes**.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // AJOUTER IMAGE DÉPART
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'goodbye_image'
            ) {

                const cle =
                    `${interaction.guild.id}:${interaction.user.id}`;


                attenteImageBienvenue.set(

                    cle,

                    {

                        type:
                            'goodbye',

                        channelId:
                            interaction.channel.id,

                        expiresAt:
                            Date.now() +
                            120000

                    }

                );


                await interaction.reply({

                    content:
                        '🖼️ Envoie maintenant **l’image de départ** dans ce salon.\nTu as **2 minutes**.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // SUPPRIMER IMAGE ARRIVÉE
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'welcome_image_delete'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                config.welcome.welcomeImageUrl =
                    '';


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.reply({

                    content:
                        '✅ Image d’arrivée supprimée.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // SUPPRIMER IMAGE DÉPART
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'goodbye_image_delete'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                config.welcome.goodbyeImageUrl =
                    '';


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.reply({

                    content:
                        '✅ Image de départ supprimée.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }

            // ==================================================
            // PANEL ANNONCES
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'admin_annonces'
            ) {

                const ligne1 =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    'annonce_channel'
                                )

                                .setLabel(
                                    'Salon'
                                )

                                .setEmoji(
                                    '📍'
                                )

                                .setStyle(
                                    ButtonStyle.Primary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'annonce_style'
                                )

                                .setLabel(
                                    'Style'
                                )

                                .setEmoji(
                                    '🎨'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'annonce_create'
                                )

                                .setLabel(
                                    'Créer une annonce'
                                )

                                .setEmoji(
                                    '📢'
                                )

                                .setStyle(
                                    ButtonStyle.Success
                                )

                        );


                await interaction.update({

                    embeds: [

                        creerEmbedConfigAnnonces(
                            interaction.guild.id
                        )

                    ],

                    components: [
                        ligne1
                    ]

                });


                return;

            }


            // ==================================================
            // CHOISIR SALON ANNONCES
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'annonce_channel'
            ) {

                const menu =
                    new ChannelSelectMenuBuilder()

                        .setCustomId(
                            'annonce_channel_select'
                        )

                        .setPlaceholder(
                            'Choisir le salon des annonces'
                        )

                        .setChannelTypes(
                            ChannelType.GuildText
                        )

                        .setMinValues(
                            1
                        )

                        .setMaxValues(
                            1
                        );


                await interaction.reply({

                    content:
                        '📍 Choisis le salon dans lequel seront publiées les annonces.',

                    components: [

                        new ActionRowBuilder()
                            .addComponents(
                                menu
                            )

                    ],

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // SAUVEGARDER SALON ANNONCES
            // ==================================================

            if (
                interaction.isChannelSelectMenu() &&
                interaction.customId ===
                    'annonce_channel_select'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                config.annonces.channelId =
                    interaction.values[0];


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.update({

                    content:
                        `✅ Salon des annonces défini : <#${config.annonces.channelId}>`,

                    components:
                        []

                });


                return;

            }


            // ==================================================
            // STYLE ANNONCES
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'annonce_style'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const modal =
                    new ModalBuilder()

                        .setCustomId(
                            'modal_annonce_style'
                        )

                        .setTitle(
                            'Style des annonces'
                        );


                const couleur =
                    new TextInputBuilder()

                        .setCustomId(
                            'annonce_color'
                        )

                        .setLabel(
                            'Couleur HEX'
                        )

                        .setPlaceholder(
                            '#F47B20'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            7
                        )

                        .setValue(
                            config.annonces.color ||
                            '#F47B20'
                        );


                const footer =
                    new TextInputBuilder()

                        .setCustomId(
                            'annonce_footer'
                        )

                        .setLabel(
                            'Footer'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            false
                        )

                        .setMaxLength(
                            2048
                        );


                if (
                    config.annonces.footer
                ) {

                    footer.setValue(
                        config.annonces.footer
                    );

                }


                modal.addComponents(

                    new ActionRowBuilder()
                        .addComponents(
                            couleur
                        ),

                    new ActionRowBuilder()
                        .addComponents(
                            footer
                        )

                );


                await interaction.showModal(
                    modal
                );


                return;

            }


            // ==================================================
            // SAUVEGARDER STYLE ANNONCES
            // ==================================================

            if (
                interaction.isModalSubmit() &&
                interaction.customId ===
                    'modal_annonce_style'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                config.annonces.color =
                    couleurValide(

                        interaction.fields
                            .getTextInputValue(
                                'annonce_color'
                            )
                            .trim(),

                        '#F47B20'

                    );


                config.annonces.footer =
                    interaction.fields
                        .getTextInputValue(
                            'annonce_footer'
                        )
                        .trim();


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.reply({

                    content:
                        '✅ Style des annonces enregistré.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // CRÉER UNE ANNONCE
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'annonce_create'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                if (
                    !config.annonces.channelId
                ) {

                    await interaction.reply({

                        content:
                            '❌ Configure d’abord le salon des annonces.',

                        flags:
                            MessageFlags.Ephemeral

                    });


                    return;

                }


                const modal =
                    new ModalBuilder()

                        .setCustomId(
                            'modal_annonce_create'
                        )

                        .setTitle(
                            'Créer une annonce'
                        );


                const titre =
                    new TextInputBuilder()

                        .setCustomId(
                            'annonce_title'
                        )

                        .setLabel(
                            'Titre'
                        )

                        .setPlaceholder(
                            'Ex : Nouvelle annonce'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            256
                        );


                const description =
                    new TextInputBuilder()

                        .setCustomId(
                            'annonce_description'
                        )

                        .setLabel(
                            'Message'
                        )

                        .setPlaceholder(
                            'Contenu de ton annonce...'
                        )

                        .setStyle(
                            TextInputStyle.Paragraph
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            4000
                        );


                const image =
                    new TextInputBuilder()

                        .setCustomId(
                            'annonce_image'
                        )

                        .setLabel(
                            'Lien image - optionnel'
                        )

                        .setPlaceholder(
                            'https://...'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            false
                        )

                        .setMaxLength(
                            1000
                        );


                modal.addComponents(

                    new ActionRowBuilder()
                        .addComponents(
                            titre
                        ),

                    new ActionRowBuilder()
                        .addComponents(
                            description
                        ),

                    new ActionRowBuilder()
                        .addComponents(
                            image
                        )

                );


                await interaction.showModal(
                    modal
                );


                return;

            }


            // ==================================================
            // ENREGISTRER ANNONCE EN ATTENTE
            // ==================================================

            if (
                interaction.isModalSubmit() &&
                interaction.customId ===
                    'modal_annonce_create'
            ) {

                const titre =
                    interaction.fields
                        .getTextInputValue(
                            'annonce_title'
                        )
                        .trim();


                const description =
                    interaction.fields
                        .getTextInputValue(
                            'annonce_description'
                        )
                        .trim();


                const image =
                    interaction.fields
                        .getTextInputValue(
                            'annonce_image'
                        )
                        .trim();


                const cle =
                    `${interaction.guild.id}:${interaction.user.id}`;


                annoncesEnAttente.set(

                    cle,

                    {

                        title:
                            titre,

                        description:
                            description,

                        image:
                            image,

                        mentionEveryone:
                            false

                    }

                );


                const ligne =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    'annonce_preview'
                                )

                                .setLabel(
                                    'Aperçu'
                                )

                                .setEmoji(
                                    '👁️'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'annonce_toggle_everyone'
                                )

                                .setLabel(
                                    '@everyone : NON'
                                )

                                .setEmoji(
                                    '📣'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'annonce_publish'
                                )

                                .setLabel(
                                    'Publier'
                                )

                                .setEmoji(
                                    '✅'
                                )

                                .setStyle(
                                    ButtonStyle.Success
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'annonce_cancel'
                                )

                                .setLabel(
                                    'Annuler'
                                )

                                .setEmoji(
                                    '❌'
                                )

                                .setStyle(
                                    ButtonStyle.Danger
                                )

                        );


                await interaction.reply({

                    content:
                        '📢 Annonce prête. Tu peux la prévisualiser avant publication.',

                    components: [
                        ligne
                    ],

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // TOGGLE @EVERYONE
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'annonce_toggle_everyone'
            ) {

                const cle =
                    `${interaction.guild.id}:${interaction.user.id}`;


                const annonce =
                    annoncesEnAttente.get(
                        cle
                    );


                if (
                    !annonce
                ) {

                    await interaction.update({

                        content:
                            '❌ Cette annonce n’existe plus. Recommence la création.',

                        components:
                            []

                    });


                    return;

                }


                annonce.mentionEveryone =
                    !annonce.mentionEveryone;


                annoncesEnAttente.set(
                    cle,
                    annonce
                );


                const ligne =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    'annonce_preview'
                                )

                                .setLabel(
                                    'Aperçu'
                                )

                                .setEmoji(
                                    '👁️'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'annonce_toggle_everyone'
                                )

                                .setLabel(
                                    annonce.mentionEveryone
                                        ? '@everyone : OUI'
                                        : '@everyone : NON'
                                )

                                .setEmoji(
                                    '📣'
                                )

                                .setStyle(
                                    annonce.mentionEveryone
                                        ? ButtonStyle.Primary
                                        : ButtonStyle.Secondary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'annonce_publish'
                                )

                                .setLabel(
                                    'Publier'
                                )

                                .setEmoji(
                                    '✅'
                                )

                                .setStyle(
                                    ButtonStyle.Success
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'annonce_cancel'
                                )

                                .setLabel(
                                    'Annuler'
                                )

                                .setEmoji(
                                    '❌'
                                )

                                .setStyle(
                                    ButtonStyle.Danger
                                )

                        );


                await interaction.update({

                    content:
                        annonce.mentionEveryone
                            ? '📣 Mention **@everyone activée**.'
                            : '🔕 Mention **@everyone désactivée**.',

                    components: [
                        ligne
                    ]

                });


                return;

            }


            // ==================================================
            // APERÇU ANNONCE
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'annonce_preview'
            ) {

                const cle =
                    `${interaction.guild.id}:${interaction.user.id}`;


                const annonce =
                    annoncesEnAttente.get(
                        cle
                    );


                if (
                    !annonce
                ) {

                    await interaction.reply({

                        content:
                            '❌ Cette annonce n’existe plus.',

                        flags:
                            MessageFlags.Ephemeral

                    });


                    return;

                }


                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const embed =
                    new EmbedBuilder()

                        .setColor(
                            couleurValide(
                                config.annonces.color,
                                '#F47B20'
                            )
                        )

                        .setTitle(
                            annonce.title
                        )

                        .setDescription(
                            annonce.description
                        )

                        .setTimestamp();


                if (
                    config.annonces.footer
                ) {

                    embed.setFooter({

                        text:
                            config.annonces.footer

                    });

                }


                if (
                    annonce.image &&
                    /^https?:\/\//i.test(
                        annonce.image
                    )
                ) {

                    embed.setImage(
                        annonce.image
                    );

                }

                else {

                    // S'il n'y a pas d'image propre à l'annonce,
                    // on peut utiliser la bannière publique.
                    appliquerBanniereEmbed(
                        embed,
                        interaction.guild
                    );

                }


                await interaction.reply({

                    content:
                        annonce.mentionEveryone
                            ? '📣 **@everyone sera mentionné lors de la publication.**'
                            : '🔕 Aucune mention générale.',

                    embeds: [
                        embed
                    ],

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // PUBLIER ANNONCE
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'annonce_publish'
            ) {

                const cle =
                    `${interaction.guild.id}:${interaction.user.id}`;


                const annonce =
                    annoncesEnAttente.get(
                        cle
                    );


                if (
                    !annonce
                ) {

                    await interaction.update({

                        content:
                            '❌ Cette annonce n’existe plus.',

                        components:
                            []

                    });


                    return;

                }


                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const salon =

                    interaction.guild.channels.cache.get(
                        config.annonces.channelId
                    )

                    ||

                    await interaction.guild.channels.fetch(
                        config.annonces.channelId
                    )
                        .catch(
                            () => null
                        );


                if (
                    !salon ||
                    !salon.isTextBased()
                ) {

                    await interaction.update({

                        content:
                            '❌ Le salon des annonces est introuvable.',

                        components:
                            []

                    });


                    return;

                }


                const embed =
                    new EmbedBuilder()

                        .setColor(
                            couleurValide(
                                config.annonces.color,
                                '#F47B20'
                            )
                        )

                        .setTitle(
                            annonce.title
                        )

                        .setDescription(
                            annonce.description
                        )

                        .setTimestamp();


                if (
                    config.annonces.footer
                ) {

                    embed.setFooter({

                        text:
                            config.annonces.footer

                    });

                }


                if (
                    annonce.image &&
                    /^https?:\/\//i.test(
                        annonce.image
                    )
                ) {

                    embed.setImage(
                        annonce.image
                    );

                }

                else {

                    appliquerBanniereEmbed(
                        embed,
                        interaction.guild
                    );

                }


                const payload = {

                    embeds: [
                        embed
                    ],

                    allowedMentions: {

                        parse:
                            annonce.mentionEveryone
                                ? ['everyone']
                                : []

                    }

                };


                if (
                    annonce.mentionEveryone
                ) {

                    payload.content =
                        '@everyone';

                }


                try {

                    await envoyerMessagePersonnalise(
                        salon,
                        payload
                    );

                }

                catch (error) {

                    console.error(
                        '❌ Publication annonce :',
                        error
                    );


                    await interaction.update({

                        content:
                            '❌ Impossible de publier l’annonce. Vérifie les permissions du bot et du webhook.',

                        components:
                            []

                    });


                    return;

                }


                annoncesEnAttente.delete(
                    cle
                );


                await interaction.update({

                    content:
                        `✅ Annonce publiée dans ${salon}.`,

                    components:
                        []

                });


                return;

            }


            // ==================================================
            // ANNULER ANNONCE
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'annonce_cancel'
            ) {

                const cle =
                    `${interaction.guild.id}:${interaction.user.id}`;


                annoncesEnAttente.delete(
                    cle
                );


                await interaction.update({

                    content:
                        '❌ Création de l’annonce annulée.',

                    components:
                        []

                });


                return;

            }

            // ==================================================
            // PANEL TWITCH
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'admin_streams'
            ) {

                const ligne1 =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    'stream_channel'
                                )

                                .setLabel(
                                    'Salon'
                                )

                                .setEmoji(
                                    '📍'
                                )

                                .setStyle(
                                    ButtonStyle.Primary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'stream_add'
                                )

                                .setLabel(
                                    'Ajouter streamer'
                                )

                                .setEmoji(
                                    '➕'
                                )

                                .setStyle(
                                    ButtonStyle.Success
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'stream_remove'
                                )

                                .setLabel(
                                    'Retirer streamer'
                                )

                                .setEmoji(
                                    '➖'
                                )

                                .setStyle(
                                    ButtonStyle.Danger
                                )

                        );


                const ligne2 =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    'stream_style'
                                )

                                .setLabel(
                                    'Style embed'
                                )

                                .setEmoji(
                                    '🎨'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'stream_toggle_everyone'
                                )

                                .setLabel(
                                    'Activer / Désactiver @everyone'
                                )

                                .setEmoji(
                                    '📣'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'stream_check_now'
                                )

                                .setLabel(
                                    'Vérifier maintenant'
                                )

                                .setEmoji(
                                    '🔄'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                )

                        );


                await interaction.update({

                    embeds: [

                        creerEmbedConfigStreams(
                            interaction.guild.id
                        )

                    ],

                    components: [
                        ligne1,
                        ligne2
                    ]

                });


                return;

            }


            // ==================================================
            // CHOISIR SALON TWITCH
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'stream_channel'
            ) {

                const menu =
                    new ChannelSelectMenuBuilder()

                        .setCustomId(
                            'stream_channel_select'
                        )

                        .setPlaceholder(
                            'Choisir le salon Twitch'
                        )

                        .setChannelTypes(
                            ChannelType.GuildText
                        )

                        .setMinValues(
                            1
                        )

                        .setMaxValues(
                            1
                        );


                await interaction.reply({

                    content:
                        '📍 Choisis le salon où seront publiées les alertes Twitch.',

                    components: [

                        new ActionRowBuilder()
                            .addComponents(
                                menu
                            )

                    ],

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // SAUVEGARDER SALON TWITCH
            // ==================================================

            if (
                interaction.isChannelSelectMenu() &&
                interaction.customId ===
                    'stream_channel_select'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                config.streams.channelId =
                    interaction.values[0];


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.update({

                    content:
                        `✅ Salon Twitch défini : <#${config.streams.channelId}>`,

                    components:
                        []

                });


                return;

            }


            // ==================================================
            // AJOUTER STREAMER
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'stream_add'
            ) {

                const modal =
                    new ModalBuilder()

                        .setCustomId(
                            'modal_stream_add'
                        )

                        .setTitle(
                            'Ajouter un streamer Twitch'
                        );


                const champ =
                    new TextInputBuilder()

                        .setCustomId(
                            'stream_login'
                        )

                        .setLabel(
                            'Pseudo Twitch ou lien'
                        )

                        .setPlaceholder(
                            'Ex : dexter ou https://twitch.tv/dexter'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            200
                        );


                modal.addComponents(

                    new ActionRowBuilder()
                        .addComponents(
                            champ
                        )

                );


                await interaction.showModal(
                    modal
                );


                return;

            }


            // ==================================================
            // SAUVEGARDER STREAMER
            // ==================================================

            if (
                interaction.isModalSubmit() &&
                interaction.customId ===
                    'modal_stream_add'
            ) {

                await interaction.deferReply({

                    flags:
                        MessageFlags.Ephemeral

                });


                const saisie =
                    interaction.fields
                        .getTextInputValue(
                            'stream_login'
                        )
                        .trim();


                let utilisateurTwitch;


                try {

                    utilisateurTwitch =
                        await trouverUtilisateurTwitch(
                            saisie
                        );

                }

                catch (error) {

                    console.error(
                        '❌ Recherche utilisateur Twitch :',
                        error
                    );


                    await interaction.editReply(
                        '❌ Impossible de contacter Twitch. Vérifie `TWITCH_CLIENT_ID` et `TWITCH_CLIENT_SECRET` sur Railway.'
                    );


                    return;

                }


                if (
                    !utilisateurTwitch
                ) {

                    await interaction.editReply(
                        '❌ Aucun compte Twitch trouvé avec ce pseudo.'
                    );


                    return;

                }


                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const login =
                    utilisateurTwitch.login
                        .toLowerCase();


                if (
                    config.streams.streamers[
                        login
                    ]
                ) {

                    await interaction.editReply(
                        `ℹ️ **${utilisateurTwitch.display_name}** est déjà surveillé.`
                    );


                    return;

                }


                config.streams.streamers[
                    login
                ] = {

                    login:
                        login,

                    displayName:
                        utilisateurTwitch.display_name ||
                        utilisateurTwitch.login,

                    twitchUserId:
                        utilisateurTwitch.id,

                    isLive:
                        false,

                    lastStreamId:
                        '',

                    messageId:
                        '',

                    channelId:
                        ''

                };


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.editReply(
                    `✅ **${utilisateurTwitch.display_name}** a été ajouté à la surveillance Twitch.`
                );


                return;

            }


            // ==================================================
            // RETIRER STREAMER
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'stream_remove'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const streamers =
                    Object.entries(
                        config.streams.streamers ||
                        {}
                    );


                if (
                    !streamers.length
                ) {

                    await interaction.reply({

                        content:
                            '❌ Aucun streamer n’est configuré.',

                        flags:
                            MessageFlags.Ephemeral

                    });


                    return;

                }


                const options =
                    streamers
                        .slice(
                            0,
                            25
                        )
                        .map(

                            ([login, streamer]) => ({

                                label:
                                    streamer.displayName ||
                                    login,

                                value:
                                    login,

                                description:
                                    `Retirer ${login}`
                                        .slice(
                                            0,
                                            100
                                        )

                            })

                        );


                const menu =
                    new StringSelectMenuBuilder()

                        .setCustomId(
                            'stream_remove_select'
                        )

                        .setPlaceholder(
                            'Choisir le streamer à retirer'
                        )

                        .addOptions(
                            options
                        );


                await interaction.reply({

                    content:
                        '➖ Choisis le streamer à retirer.',

                    components: [

                        new ActionRowBuilder()
                            .addComponents(
                                menu
                            )

                    ],

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // CONFIRMER RETRAIT STREAMER
            // ==================================================

            if (
                interaction.isStringSelectMenu() &&
                interaction.customId ===
                    'stream_remove_select'
            ) {

                const login =
                    interaction.values[0];


                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const streamer =
                    config.streams.streamers[
                        login
                    ];


                if (
                    !streamer
                ) {

                    await interaction.update({

                        content:
                            '❌ Ce streamer n’existe plus dans la configuration.',

                        components:
                            []

                    });


                    return;

                }


                if (
                    streamer.messageId
                ) {

                    await supprimerAnnonceStream(
                        interaction.guild,
                        streamer
                    );

                }


                const nom =
                    streamer.displayName ||
                    streamer.login;


                delete config.streams.streamers[
                    login
                ];


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.update({

                    content:
                        `✅ **${nom}** retiré de la surveillance Twitch.`,

                    components:
                        []

                });


                return;

            }


            // ==================================================
            // STYLE EMBED TWITCH
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'stream_style'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const modal =
                    new ModalBuilder()

                        .setCustomId(
                            'modal_stream_style'
                        )

                        .setTitle(
                            'Style des alertes Twitch'
                        );


                const titre =
                    new TextInputBuilder()

                        .setCustomId(
                            'stream_title'
                        )

                        .setLabel(
                            'Titre'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            256
                        )

                        .setValue(
                            config.streams.embed.title ||
                            '🔴 {streamer} EST EN LIVE !'
                        );


                const description =
                    new TextInputBuilder()

                        .setCustomId(
                            'stream_description'
                        )

                        .setLabel(
                            'Description'
                        )

                        .setStyle(
                            TextInputStyle.Paragraph
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            3000
                        )

                        .setValue(
                            config.streams.embed.description ||
                            '**{title}**'
                        );


                const couleur =
                    new TextInputBuilder()

                        .setCustomId(
                            'stream_color'
                        )

                        .setLabel(
                            'Couleur HEX'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            7
                        )

                        .setValue(
                            config.streams.embed.color ||
                            '#9146FF'
                        );


                const footer =
                    new TextInputBuilder()

                        .setCustomId(
                            'stream_footer'
                        )

                        .setLabel(
                            'Footer'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            false
                        )

                        .setMaxLength(
                            2048
                        );


                if (
                    config.streams.embed.footer
                ) {

                    footer.setValue(
                        config.streams.embed.footer
                    );

                }


                const bouton =
                    new TextInputBuilder()

                        .setCustomId(
                            'stream_button'
                        )

                        .setLabel(
                            'Texte du bouton'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            80
                        )

                        .setValue(
                            config.streams.embed.buttonLabel ||
                            'Regarder le live'
                        );


                modal.addComponents(

                    new ActionRowBuilder()
                        .addComponents(
                            titre
                        ),

                    new ActionRowBuilder()
                        .addComponents(
                            description
                        ),

                    new ActionRowBuilder()
                        .addComponents(
                            couleur
                        ),

                    new ActionRowBuilder()
                        .addComponents(
                            footer
                        ),

                    new ActionRowBuilder()
                        .addComponents(
                            bouton
                        )

                );


                await interaction.showModal(
                    modal
                );


                return;

            }


            // ==================================================
            // SAUVEGARDER STYLE TWITCH
            // ==================================================

            if (
                interaction.isModalSubmit() &&
                interaction.customId ===
                    'modal_stream_style'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                config.streams.embed.title =
                    interaction.fields
                        .getTextInputValue(
                            'stream_title'
                        )
                        .trim();


                config.streams.embed.description =
                    interaction.fields
                        .getTextInputValue(
                            'stream_description'
                        )
                        .trim();


                config.streams.embed.color =
                    couleurValide(

                        interaction.fields
                            .getTextInputValue(
                                'stream_color'
                            )
                            .trim(),

                        '#9146FF'

                    );


                config.streams.embed.footer =
                    interaction.fields
                        .getTextInputValue(
                            'stream_footer'
                        )
                        .trim();


                config.streams.embed.buttonLabel =
                    interaction.fields
                        .getTextInputValue(
                            'stream_button'
                        )
                        .trim();


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.reply({

                    content:
                        '✅ Style Twitch enregistré.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // TOGGLE @EVERYONE TWITCH
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'stream_toggle_everyone'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                config.streams.embed.mentionEveryone =
                    !config.streams.embed.mentionEveryone;


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.reply({

                    content:
                        config.streams.embed.mentionEveryone

                            ? '📣 @everyone activé pour les alertes Twitch.'

                            : '🔕 @everyone désactivé pour les alertes Twitch.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // VÉRIFICATION TWITCH MANUELLE
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'stream_check_now'
            ) {

                await interaction.deferReply({

                    flags:
                        MessageFlags.Ephemeral

                });


                try {

                    await verifierStreamsServeur(
                        interaction.guild
                    );


                    await interaction.editReply(
                        '✅ Vérification Twitch terminée.'
                    );

                }

                catch (error) {

                    console.error(
                        '❌ Vérification Twitch manuelle :',
                        error
                    );


                    await interaction.editReply(
                        `❌ Erreur Twitch : ${error.message}`
                    );

                }


                return;

            }

// ======================================================
// FIN DES INTERACTIONS
// ======================================================

        }

        catch (error) {

            console.error(
                '❌ Erreur InteractionCreate :',
                error
            );


            // ==================================================
            // SI L'INTERACTION PEUT ENCORE RECEVOIR UNE RÉPONSE
            // ==================================================

            try {

                if (
                    interaction.isRepliable()
                ) {

                    if (
                        interaction.replied ||
                        interaction.deferred
                    ) {

                        await interaction.followUp({

                            content:
                                '❌ Une erreur est survenue pendant cette action.',

                            flags:
                                MessageFlags.Ephemeral

                        });

                    }

                    else {

                        await interaction.reply({

                            content:
                                '❌ Une erreur est survenue pendant cette action.',

                            flags:
                                MessageFlags.Ephemeral

                        });

                    }

                }

            }

            catch (erreurReponse) {

                console.error(
                    '❌ Impossible de répondre après erreur :',
                    erreurReponse.message
                );

            }

        }

    }

);


// ======================================================
// ERREUR CLIENT DISCORD
// ======================================================

client.on(

    Events.Error,

    error => {

        console.error(
            '❌ Erreur client Discord :',
            error
        );

    }

);


// ======================================================
// WARNINGS DISCORD
// ======================================================

client.on(

    Events.Warn,

    info => {

        console.warn(
            '⚠️ Discord warning :',
            info
        );

    }

);


// ======================================================
// ERREURS NODE NON GÉRÉES
// ======================================================

process.on(

    'unhandledRejection',

    reason => {

        console.error(
            '❌ UNHANDLED REJECTION :',
            reason
        );

    }

);


process.on(

    'uncaughtException',

    error => {

        console.error(
            '❌ UNCAUGHT EXCEPTION :',
            error
        );

    }

);


// ======================================================
// DÉMARRAGE
// ======================================================

async function demarrerBot() {

    console.log(
        '🟠 BOTTEST // DÉMARRAGE'
    );


    // ==================================================
    // VÉRIFIER TOKEN DISCORD
    // ==================================================

    if (
        !process.env.DISCORD_TOKEN
    ) {

        console.error(
            '❌ DISCORD_TOKEN absent.'
        );


        process.exit(
            1
        );

    }


    // ==================================================
    // INSTALLER LES COMMANDES
    // ==================================================

    try {

        await enregistrerCommandes();

    }

    catch (error) {

        console.error(
            '❌ Impossible d’installer les commandes Discord :',
            error
        );

    }


    // ==================================================
    // CONNEXION
    // ==================================================

    try {

        await client.login(
            process.env.DISCORD_TOKEN
        );

    }

    catch (error) {

        console.error(
            '❌ Connexion Discord impossible :',
            error
        );


        process.exit(
            1
        );

    }

}


// ======================================================
// LANCER
// ======================================================

demarrerBot();