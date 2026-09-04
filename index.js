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
// DURÉE
// ======================================================

function calculerDuree(
    dateDebut
) {

    const difference =
        new Date() -
        dateDebut;


    const jours =
        Math.max(

            0,

            Math.floor(
                difference /
                86400000
            )

        );


    const annees =
        Math.floor(
            jours /
            365
        );


    const mois =
        Math.floor(
            (jours % 365) /
            30
        );


    const reste =
        jours %
        30;


    if (
        annees > 0
    ) {

        return `${annees} an${annees > 1 ? 's' : ''}`;

    }


    if (
        mois > 0
    ) {

        return `${mois} mois`;

    }


    return `${reste} jour${reste > 1 ? 's' : ''}`;

}


// ======================================================
// EMOJI TICKET
// ======================================================

function emojiValide(
    emoji
) {

    if (
        !emoji ||
        typeof emoji !==
            'string'
    ) {

        return '🎫';

    }


    const valeur =
        emoji.trim();


    if (
        /^<a?:[a-zA-Z0-9_]+:\d+>$/.test(
            valeur
        )
    ) {

        return valeur;

    }


    try {

        const match =
            valeur.match(
                /\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*/u
            );


        if (
            match
        ) {

            return match[0];

        }

    }

    catch (_) {}


    return '🎫';

}


// ======================================================
// EMOJI STAFF
// ======================================================

function emojiStaffValide(
    emoji
) {

    if (
        !emoji ||
        typeof emoji !==
            'string'
    ) {

        return '🛡️';

    }


    try {

        const match =
            emoji.trim().match(
                /\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*/u
            );


        if (
            match
        ) {

            return match[0];

        }

    }

    catch (_) {}


    return '🛡️';

}


// ======================================================
// VARIABLES BIENVENUE
// ======================================================

function remplacerVariables(
    texte,
    member
) {

    return String(
        texte ||
        ''
    )

        .replaceAll(
            '{member}',
            `${member}`
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
            '{memberCount}',
            `${member.guild.memberCount}`
        );

}


// ======================================================
// VARIABLES TICKET
// ======================================================

function remplacerVariablesTicket(
    texte,
    interaction,
    type
) {

    return String(
        texte ||
        ''
    )

        .replaceAll(
            '{member}',
            `${interaction.user}`
        )

        .replaceAll(
            '{username}',
            interaction.user.username
        )

        .replaceAll(
            '{type}',
            type.name
        )

        .replaceAll(
            '{emoji}',
            emojiValide(
                type.emoji
            )
        )

        .replaceAll(
            '{server}',
            interaction.guild.name
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
// APPARENCE PUBLIQUE DU BOT
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
        client.user.username
    );

}


function obtenirAvatarPublicServeur(
    guild
) {

    const config =
        chargerConfigServeur(
            guild.id
        );


    return (
        config.appearance.avatarUrl ||
        client.user.displayAvatarURL({
            extension:
                'png',

            size:
                256
        })
    );

}


// ======================================================
// APPLIQUER LE SURNOM SUR LE SERVEUR
// ======================================================

async function appliquerSurnomServeur(
    guild
) {

    try {

        const config =
            chargerConfigServeur(
                guild.id
            );


        const me =
            guild.members.me ||

            await guild.members
                .fetchMe()
                .catch(
                    () => null
                );


        if (
            !me
        ) {

            return;

        }


        await me.setNickname(

            config.appearance.nickname ||
            null

        );

    }

    catch (error) {

        console.error(
            `❌ Impossible de modifier le surnom sur ${guild.name} :`,
            error.message
        );

    }

}


// ======================================================
// APPLIQUER LA BANNIÈRE AUX EMBEDS
// ======================================================

function appliquerBanniereEmbed(
    embed,
    guild
) {

    const config =
        chargerConfigServeur(
            guild.id
        );


    if (
        config.appearance.bannerUrl
    ) {

        embed.setImage(
            config.appearance.bannerUrl
        );

    }


    return embed;

}


// ======================================================
// ENVOYER UN MESSAGE AVEC L'APPARENCE DU SERVEUR
//
// IMPORTANT :
// - utilisé pour annonces / streams / bienvenue
// - PAS utilisé pour les boutons des tickets
//
// Chaque salon possède son propre webhook.
// On ne stocke donc plus un webhook unique dans config.json.
// ======================================================

async function envoyerMessagePersonnalise(
    channel,
    options = {}
) {

    if (
        !channel ||
        !channel.guild ||
        !channel.isTextBased()
    ) {

        throw new Error(
            'Salon invalide pour le webhook.'
        );

    }


    try {

        // --------------------------------------------------
        // Chercher un webhook appartenant À CE SALON
        // --------------------------------------------------

        const webhooks =
            await channel.fetchWebhooks();


        let webhook =
            webhooks.find(

                hook =>
                    hook.owner?.id ===
                        client.user.id &&

                    hook.name ===
                        'BOTTEST-WEBHOOK'

            );


        // --------------------------------------------------
        // Aucun webhook dans ce salon : création
        // --------------------------------------------------

        if (
            !webhook
        ) {

            webhook =
                await channel.createWebhook({

                    name:
                        'BOTTEST-WEBHOOK',

                    reason:
                        'Apparence personnalisée du bot'

                });

        }


        // --------------------------------------------------
        // Envoyer
        // --------------------------------------------------

        return await webhook.send({

            ...options,

            username:
                obtenirNomPublicServeur(
                    channel.guild
                ),

            avatarURL:
                obtenirAvatarPublicServeur(
                    channel.guild
                )

        });

    }

    catch (error) {

        console.error(
            `⚠️ Webhook impossible dans #${channel.name}, utilisation du bot normal :`,
            error.message
        );


        // --------------------------------------------------
        // FALLBACK
        // --------------------------------------------------

        return await channel.send(
            options
        );

    }

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
        config.appearance.nickname ||
        client.user.username;


    const avatar =
        config.appearance.avatarUrl
            ? '✅ Personnalisé'
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
                'Personnalise l’identité visuelle du bot pour **ce serveur uniquement**.'
            )

            .addFields(

                {
                    name:
                        '✏️ Nom sur le serveur',

                    value:
                        `\`${nom}\``,

                    inline:
                        false
                },

                {
                    name:
                        '🖼️ Avatar public',

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
                        ? `${guild.name} • Configuration`
                        : 'Configuration du serveur'

            });


    if (
        config.appearance.avatarUrl
    ) {

        embed.setThumbnail(
            config.appearance.avatarUrl
        );

    }

    else if (
        client.user
    ) {

        embed.setThumbnail(
            client.user.displayAvatarURL({
                extension:
                    'png',

                size:
                    256
            })
        );

    }


    if (
        config.appearance.bannerUrl
    ) {

        embed.setImage(
            config.appearance.bannerUrl
        );

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


    const nombreTypes =
        Object.keys(
            config.tickets.types ||
            {}
        ).length;


    const nombreStaff =
        Object.keys(
            config.tickets.staffMembers ||
            {}
        ).length;


    return new EmbedBuilder()

        .setColor(
            '#F47B20'
        )

        .setTitle(
            '🎫 CONFIGURATION DES TICKETS'
        )

        .setDescription(
            'Configure ici le système de tickets de ce serveur.'
        )

        .addFields(

            {
                name:
                    '🛡️ Rôle Staff',

                value:
                    config.tickets.staffRoleId
                        ? `<@&${config.tickets.staffRoleId}>`
                        : '❌ Non configuré',

                inline:
                    true
            },

            {
                name:
                    '📜 Salon Logs',

                value:
                    config.tickets.logsChannelId
                        ? `<#${config.tickets.logsChannelId}>`
                        : '❌ Non configuré',

                inline:
                    true
            },

            {
                name:
                    '📂 Types de tickets',

                value:
                    `${nombreTypes}`,

                inline:
                    true
            },

            {
                name:
                    '👥 Membres Staff',

                value:
                    `${nombreStaff}`,

                inline:
                    true
            }

        );

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


    const embed =
        new EmbedBuilder()

            .setColor(
                '#F47B20'
            )

            .setTitle(
                '👋 BIENVENUE / DÉPART'
            )

            .setDescription(
                'Configure les messages automatiques d’arrivée et de départ.'
            )

            .addFields(

                {
                    name:
                        '🎉 Arrivées',

                    value:
                        config.welcome.welcomeEnabled
                            ? '✅ Activées'
                            : '❌ Désactivées',

                    inline:
                        true
                },

                {
                    name:
                        '👋 Départs',

                    value:
                        config.welcome.goodbyeEnabled
                            ? '✅ Activés'
                            : '❌ Désactivés',

                    inline:
                        true
                },

                {
                    name:
                        '📍 Salon arrivée',

                    value:
                        config.welcome.welcomeChannelId
                            ? `<#${config.welcome.welcomeChannelId}>`
                            : '❌ Non configuré',

                    inline:
                        false
                },

                {
                    name:
                        '📍 Salon départ',

                    value:
                        config.welcome.goodbyeChannelId
                            ? `<#${config.welcome.goodbyeChannelId}>`
                            : '❌ Non configuré',

                    inline:
                        false
                }

            );


    return embed;

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

        .setDescription(
            'Configure le salon et l’apparence des annonces.'
        )

        .addFields(

            {
                name:
                    '📍 Salon',

                value:
                    config.annonces.channelId
                        ? `<#${config.annonces.channelId}>`
                        : '❌ Non configuré',

                inline:
                    false
            },

            {
                name:
                    '🎨 Couleur',

                value:
                    `\`${config.annonces.color}\``,

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

        );

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

            : 'Aucun streamer configuré.';


    return new EmbedBuilder()

        .setColor(
            '#9146FF'
        )

        .setTitle(
            '🔴 CONFIGURATION TWITCH'
        )

        .setDescription(
            'Configure les notifications Twitch de ce serveur.'
        )

        .addFields(

            {
                name:
                    '📍 Salon Streams',

                value:
                    config.streams.channelId
                        ? `<#${config.streams.channelId}>`
                        : '❌ Non configuré',

                inline:
                    false
            },

            {
                name:
                    '📣 Mention @everyone',

                value:
                    config.streams.embed.mentionEveryone
                        ? '✅ Activée'
                        : '❌ Désactivée',

                inline:
                    true
            },

            {
                name:
                    '👤 Streamers',

                value:
                    liste,

                inline:
                    false
            }

        );

}


// ======================================================
// MAPS TEMPORAIRES
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


let twitchTokenExpiration =
    0;


// ======================================================
// OBTENIR TOKEN TWITCH
// ======================================================

async function getTwitchAppToken() {

    if (
        twitchToken &&
        Date.now() <
            twitchTokenExpiration
    ) {

        return twitchToken;

    }


    if (
        !process.env.TWITCH_CLIENT_ID ||
        !process.env.TWITCH_CLIENT_SECRET
    ) {

        throw new Error(
            'TWITCH_CLIENT_ID ou TWITCH_CLIENT_SECRET manquant.'
        );

    }


    const params =
        new URLSearchParams({

            client_id:
                process.env.TWITCH_CLIENT_ID,

            client_secret:
                process.env.TWITCH_CLIENT_SECRET,

            grant_type:
                'client_credentials'

        });


    const response =
        await fetch(

            `https://id.twitch.tv/oauth2/token?${params.toString()}`,

            {
                method:
                    'POST'
            }

        );


    if (
        !response.ok
    ) {

        const texte =
            await response.text();


        throw new Error(
            `Twitch OAuth ${response.status} : ${texte}`
        );

    }


    const data =
        await response.json();


    twitchToken =
        data.access_token;


    twitchTokenExpiration =
        Date.now() +
        (
            Math.max(
                60,
                data.expires_in - 60
            ) *
            1000
        );


    return twitchToken;

}


// ======================================================
// TWITCH FETCH
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

                    Authorization:
                        `Bearer ${token}`

                }
            }

        );


    if (
        !response.ok
    ) {

        const texte =
            await response.text();


        throw new Error(
            `Twitch API ${response.status} : ${texte}`
        );

    }


    return await response.json();

}


// ======================================================
// TROUVER UTILISATEUR TWITCH
// ======================================================

async function trouverUtilisateurTwitch(
    login
) {

    const propre =
        String(
            login ||
            ''
        )

            .trim()

            .toLowerCase()

            .replace(
                /^https?:\/\/(www\.)?twitch\.tv\//i,
                ''
            )

            .replace(
                /\/.*$/,
                ''
            );


    if (
        !propre
    ) {

        return null;

    }


    const data =
        await twitchFetch(
            `/users?login=${encodeURIComponent(propre)}`
        );


    return (
        data.data?.[0] ||
        null
    );

}


// ======================================================
// PUBLIER ANNONCE STREAM
// ======================================================

async function publierAnnonceStream(
    guild,
    streamerConfig,
    stream
) {

    const config =
        chargerConfigServeur(
            guild.id
        );


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

                    streamerConfig,

                    stream

                )

            )

            .setDescription(

                remplacerVariablesStream(

                    config.streams.embed.description,

                    streamerConfig,

                    stream

                )

            )

            .setURL(
                `https://www.twitch.tv/${streamerConfig.login}`
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

    else {

        appliquerBanniereEmbed(
            embed,
            guild
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
                `https://www.twitch.tv/${streamerConfig.login}`
            );


    const row =
        new ActionRowBuilder()

            .addComponents(
                bouton
            );


    const content =
        config.streams.embed.mentionEveryone
            ? '@everyone'
            : undefined;


    const message =
        await envoyerMessagePersonnalise(

            salon,

            {

                content:
                    content,

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

            }

        );


    return message;

}


// ======================================================
// SUPPRIMER ANNONCE STREAM
// ======================================================

async function supprimerAnnonceStream(
    guild,
    streamerConfig
) {

    if (
        !streamerConfig.messageId ||
        !streamerConfig.channelId
    ) {

        return;

    }


    try {

        const salon =

            guild.channels.cache.get(
                streamerConfig.channelId
            )

            ||

            await guild.channels.fetch(
                streamerConfig.channelId
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


        const message =
            await salon.messages
                .fetch(
                    streamerConfig.messageId
                )
                .catch(
                    () => null
                );


        if (
            message
        ) {

            await message
                .delete()
                .catch(
                    () => {}
                );

        }

    }

    catch (_) {}

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


    let modifie =
        false;


    for (
        const streamer
        of streamers
    ) {

        try {

            const data =
                await twitchFetch(

                    `/streams?user_login=${encodeURIComponent(streamer.login)}`

                );


            const stream =
                data.data?.[0] ||
                null;


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


                if (
                    message
                ) {

                    streamer.messageId =
                        message.id;

                    streamer.channelId =
                        message.channelId;

                }


                modifie =
                    true;

            }


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


                modifie =
                    true;

            }

        }

        catch (error) {

            console.error(
                `❌ Twitch ${streamer.login} :`,
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
// ENREGISTRER LES COMMANDES GLOBALES
// ======================================================

async function enregistrerCommandes() {

    try {

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

    catch (error) {

        console.error(
            '❌ Erreur installation commandes :',
            error
        );

    }

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
            `🌍 Serveurs connectés : ${client.guilds.cache.size}`
        );

        console.log(
            '🟠 BOTTEST // MULTI-SERVEURS ACTIF'
        );

        console.log(
            '================================='
        );


        // ----------------------------------------------
        // Charger chaque serveur
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
                    `⚙️ Config chargée : ${guild.name} (${guild.id})`
                );

            }

            catch (error) {

                console.error(
                    `❌ Erreur config ${guild.name} :`,
                    error.message
                );

            }

        }


        // ----------------------------------------------
        // Vérification Twitch au démarrage
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


        // ----------------------------------------------
        // Vérification Twitch toutes les 60 secondes
        // ----------------------------------------------

        setInterval(

            async () => {

                try {

                    await verifierStreams();

                }

                catch (error) {

                    console.error(
                        '❌ Vérification Twitch :',
                        error.message
                    );

                }

            },

            60000

        );


        console.log(
            '🔴 Twitch : vérification toutes les 60 secondes'
        );

    }

);


// ======================================================
// BOT AJOUTÉ SUR UN SERVEUR
// ======================================================

client.on(

    Events.GuildCreate,

    async guild => {

        try {

            console.log(
                `➕ Nouveau serveur : ${guild.name} (${guild.id})`
            );


            chargerConfigServeur(
                guild.id
            );


            await appliquerSurnomServeur(
                guild
            );


            console.log(
                `✅ Configuration créée pour ${guild.name}`
            );

        }

        catch (error) {

            console.error(
                `❌ Erreur GuildCreate ${guild.name} :`,
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
            `➖ Bot retiré du serveur : ${guild.name} (${guild.id})`
        );

    }

);


// ======================================================
// BIENVENUE
// ======================================================

client.on(

    Events.GuildMemberAdd,

    async member => {

        const config =
            chargerConfigServeur(
                member.guild.id
            );


        if (
            !config.welcome.welcomeEnabled
        ) {

            return;

        }


        if (
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

            console.log(
                `⚠️ Salon bienvenue introuvable sur ${member.guild.name}`
            );

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

                        remplacerVariables(
                            config.welcome.welcomeTitle,
                            member
                        )

                    )

                    .setDescription(

                        remplacerVariables(
                            config.welcome.welcomeMessage,
                            member
                        )

                    )

                    .setFooter({

                        text:
                            `Compte Discord créé il y a ${calculerDuree(member.user.createdAt)}`

                    })

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


            if (
                config.welcome.welcomeImageUrl
            ) {

                embed.setImage(
                    config.welcome.welcomeImageUrl
                );

            }

            else {

                appliquerBanniereEmbed(
                    embed,
                    member.guild
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
                `❌ Erreur bienvenue [${member.guild.name}] :`,
                error.message
            );

        }

    }

);


// ======================================================
// DÉPART
// ======================================================

client.on(

    Events.GuildMemberRemove,

    async member => {

        const config =
            chargerConfigServeur(
                member.guild.id
            );


        if (
            !config.welcome.goodbyeEnabled
        ) {

            return;

        }


        if (
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

            console.log(
                `⚠️ Salon départ introuvable sur ${member.guild.name}`
            );

            return;

        }


        try {

            const duree =
                member.joinedAt

                    ? calculerDuree(
                        member.joinedAt
                    )

                    : 'Durée inconnue';


            const embed =
                new EmbedBuilder()

                    .setColor(
                        couleurValide(
                            config.welcome.goodbyeColor,
                            '#ED4245'
                        )
                    )

                    .setTitle(

                        remplacerVariables(
                            config.welcome.goodbyeTitle,
                            member
                        )

                    )

                    .setDescription(

                        remplacerVariables(
                            config.welcome.goodbyeMessage,
                            member
                        )

                    )

                    .setFooter({

                        text:
                            `Avait rejoint le serveur il y a ${duree}`

                    })

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

            else {

                appliquerBanniereEmbed(
                    embed,
                    member.guild
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
                `❌ Erreur départ [${member.guild.name}] :`,
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

                ? '✅ Avatar du bot enregistré pour ce serveur.'

                : '✅ Bannière du bot enregistrée pour ce serveur.'

        );

    }

);


// ======================================================
// DÉBUT DES INTERACTIONS
// ======================================================

client.on(

    Events.InteractionCreate,

    async interaction => {

        try {

            // ==============================================
            // SÉCURITÉ : UNIQUEMENT DANS UN SERVEUR
            // ==============================================

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


            // ==============================================
            // /BOT-PANEL
            // ==============================================

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
                                    'Avatar'
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
                                    'Retirer avatar'
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
                            'Nom du bot'
                        );


                const nom =
                    new TextInputBuilder()

                        .setCustomId(
                            'appearance_nickname_value'
                        )

                        .setLabel(
                            'Nom sur ce serveur'
                        )

                        .setPlaceholder(
                            'Ex : Le Refuge'
                        )

                        .setValue(
                            config.appearance.nickname ||
                            ''
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


                modal.addComponents(

                    new ActionRowBuilder()

                        .addComponents(
                            nom
                        )

                );


                await interaction.showModal(
                    modal
                );


                return;

            }


            // ==================================================
            // SAUVEGARDER NOM DU BOT
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
                        .trim();


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
            // CHANGER AVATAR
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
                        '🖼️ Envoie maintenant **l’avatar du bot** dans ce salon.\nTu as **2 minutes**.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // CHANGER BANNIÈRE
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
                        '🌄 Envoie maintenant **la bannière du bot** dans ce salon.\nTu as **2 minutes**.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // RETIRER AVATAR
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
                        '✅ Avatar personnalisé retiré pour ce serveur.',

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
                            `Voici l’identité publique utilisée sur **${interaction.guild.name}**.`
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
                                    'Avatar',

                                value:
                                    config.appearance.avatarUrl
                                        ? 'Personnalisé'
                                        : 'Avatar global',

                                inline:
                                    true
                            },

                            {
                                name:
                                    'Bannière',

                                value:
                                    config.appearance.bannerUrl
                                        ? 'Configurée'
                                        : 'Aucune',

                                inline:
                                    true
                            }

                        )

                        .setThumbnail(
                            obtenirAvatarPublicServeur(
                                interaction.guild
                            )
                        )

                        .setTimestamp();


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
                                    'ticket_logs_channel'
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
                                    'ticket_staff_add'
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
                                    'ticket_staff_remove'
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
                                    'ticket_type_add'
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
                                    'ticket_type_remove'
                                )

                                .setLabel(
                                    'Supprimer type'
                                )

                                .setEmoji(
                                    '🗑️'
                                )

                                .setStyle(
                                    ButtonStyle.Danger
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'ticket_panel_style'
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
                                    'ticket_embed_style'
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
                            'select_ticket_staff_role'
                        )

                        .setPlaceholder(
                            'Choisis le rôle Staff'
                        )

                        .setMinValues(
                            1
                        )

                        .setMaxValues(
                            1
                        );


                await interaction.reply({

                    content:
                        '🛡️ Choisis le rôle Staff pour les tickets :',

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
                    'select_ticket_staff_role'
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
                        `✅ Rôle Staff configuré : <@&${interaction.values[0]}>`,

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
                    'ticket_logs_channel'
            ) {

                const menu =
                    new ChannelSelectMenuBuilder()

                        .setCustomId(
                            'select_ticket_logs_channel'
                        )

                        .setPlaceholder(
                            'Choisis le salon des logs'
                        )

                        .addChannelTypes(
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
                        '📜 Choisis le salon où seront envoyés les logs et transcripts :',

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
                    'select_ticket_logs_channel'
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
                        `✅ Salon Logs configuré : <#${interaction.values[0]}>`,

                    components:
                        []

                });


                return;

            }


            // ==================================================
            // AJOUTER MEMBRE STAFF
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'ticket_staff_add'
            ) {

                const menu =
                    new UserSelectMenuBuilder()

                        .setCustomId(
                            'select_ticket_staff_add'
                        )

                        .setPlaceholder(
                            'Choisis un membre Staff'
                        )

                        .setMinValues(
                            1
                        )

                        .setMaxValues(
                            1
                        );


                await interaction.reply({

                    content:
                        '👤 Choisis le membre du Staff à ajouter :',

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
                    'select_ticket_staff_add'
            ) {

                const userId =
                    interaction.values[0];


                const modal =
                    new ModalBuilder()

                        .setCustomId(
                            `modal_ticket_staff_emoji_${userId}`
                        )

                        .setTitle(
                            'Emoji du Staff'
                        );


                const emoji =
                    new TextInputBuilder()

                        .setCustomId(
                            'ticket_staff_emoji'
                        )

                        .setLabel(
                            'Emoji personnel'
                        )

                        .setPlaceholder(
                            'Ex : 🛡️'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            false
                        )

                        .setMaxLength(
                            20
                        );


                modal.addComponents(

                    new ActionRowBuilder()

                        .addComponents(
                            emoji
                        )

                );


                await interaction.showModal(
                    modal
                );


                return;

            }


            // ==================================================
            // SAUVEGARDER MEMBRE STAFF + EMOJI
            // ==================================================

            if (
                interaction.isModalSubmit() &&
                interaction.customId.startsWith(
                    'modal_ticket_staff_emoji_'
                )
            ) {

                const userId =
                    interaction.customId.replace(
                        'modal_ticket_staff_emoji_',
                        ''
                    );


                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const emoji =
                    interaction.fields
                        .getTextInputValue(
                            'ticket_staff_emoji'
                        )
                        .trim();


                config.tickets.staffMembers[
                    userId
                ] = {

                    emoji:
                        emojiStaffValide(
                            emoji
                        )

                };


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.reply({

                    content:
                        `✅ <@${userId}> ajouté au Staff Tickets avec ${emojiStaffValide(emoji)}.`,

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // RETIRER MEMBRE STAFF
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'ticket_staff_remove'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const staffs =
                    Object.entries(
                        config.tickets.staffMembers
                    );


                if (
                    !staffs.length
                ) {

                    await interaction.reply({

                        content:
                            '❌ Aucun membre Staff configuré.',

                        flags:
                            MessageFlags.Ephemeral

                    });


                    return;

                }


                const menu =
                    new StringSelectMenuBuilder()

                        .setCustomId(
                            'select_ticket_staff_remove'
                        )

                        .setPlaceholder(
                            'Choisis le Staff à retirer'
                        );


                for (
                    const [userId, infos]
                    of staffs.slice(
                        0,
                        25
                    )
                ) {

                    const membre =
                        interaction.guild.members.cache.get(
                            userId
                        );


                    menu.addOptions({

                        label:
                            membre?.user.username ||
                            userId,

                        value:
                            userId,

                        description:
                            'Retirer ce membre du Staff Tickets',

                        emoji:
                            emojiStaffValide(
                                infos.emoji
                            )

                    });

                }


                await interaction.reply({

                    content:
                        '➖ Choisis le membre Staff à retirer :',

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
                    'select_ticket_staff_remove'
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
                    'ticket_type_add'
            ) {

                const modal =
                    new ModalBuilder()

                        .setCustomId(
                            'modal_ticket_type_add'
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
                            'Nom du type'
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
                            'Ex : 📋'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            false
                        )

                        .setMaxLength(
                            20
                        );


                modal.addComponents(

                    new ActionRowBuilder()
                        .addComponents(
                            nom
                        ),

                    new ActionRowBuilder()
                        .addComponents(
                            emoji
                        )

                );


                await interaction.showModal(
                    modal
                );


                return;

            }


            // ==================================================
            // NOM TYPE VALIDÉ → CHOIX CATÉGORIE
            // ==================================================

            if (
                interaction.isModalSubmit() &&
                interaction.customId ===
                    'modal_ticket_type_add'
            ) {

                const nom =
                    interaction.fields
                        .getTextInputValue(
                            'ticket_type_name'
                        )
                        .trim();


                const emoji =
                    interaction.fields
                        .getTextInputValue(
                            'ticket_type_emoji'
                        )
                        .trim();


                const typeId =
                    creerSlug(
                        nom
                    ) ||
                    `ticket-${Date.now()}`;


                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                config.tickets.types[
                    typeId
                ] = {

                    name:
                        nom,

                    emoji:
                        emojiValide(
                            emoji
                        ),

                    categoryId:
                        ''

                };


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                const menu =
                    new ChannelSelectMenuBuilder()

                        .setCustomId(
                            `select_ticket_type_category_${typeId}`
                        )

                        .setPlaceholder(
                            'Choisis la catégorie Discord'
                        )

                        .addChannelTypes(
                            ChannelType.GuildCategory
                        )

                        .setMinValues(
                            1
                        )

                        .setMaxValues(
                            1
                        );


                await interaction.reply({

                    content:
                        `📂 Type **${nom}** créé.\nChoisis maintenant sa catégorie :`,

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
            // SAUVEGARDER CATÉGORIE DU TYPE
            // ==================================================

            if (
                interaction.isChannelSelectMenu() &&
                interaction.customId.startsWith(
                    'select_ticket_type_category_'
                )
            ) {

                const typeId =
                    interaction.customId.replace(
                        'select_ticket_type_category_',
                        ''
                    );


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
                            '❌ Ce type de ticket n’existe plus.',

                        components:
                            []

                    });


                    return;

                }


                type.categoryId =
                    interaction.values[0];


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.update({

                    content:
                        `✅ ${emojiValide(type.emoji)} **${type.name}** utilisera la catégorie <#${interaction.values[0]}>.`,

                    components:
                        []

                });


                return;

            }


            // ==================================================
            // SUPPRIMER TYPE DE TICKET
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'ticket_type_remove'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const types =
                    Object.entries(
                        config.tickets.types
                    );


                if (
                    !types.length
                ) {

                    await interaction.reply({

                        content:
                            '❌ Aucun type de ticket à supprimer.',

                        flags:
                            MessageFlags.Ephemeral

                    });


                    return;

                }


                const menu =
                    new StringSelectMenuBuilder()

                        .setCustomId(
                            'select_ticket_type_delete'
                        )

                        .setPlaceholder(
                            'Choisis le type à supprimer'
                        );


                for (
                    const [typeId, type]
                    of types.slice(
                        0,
                        25
                    )
                ) {

                    menu.addOptions({

                        label:
                            type.name.slice(
                                0,
                                100
                            ),

                        value:
                            typeId,

                        description:
                            'Supprimer ce type de ticket'

                    });

                }


                await interaction.reply({

                    content:
                        '🗑️ Choisis le type de ticket à supprimer :',

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
            // CONFIRMER SUPPRESSION TYPE
            // ==================================================

            if (
                interaction.isStringSelectMenu() &&
                interaction.customId ===
                    'select_ticket_type_delete'
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
                            '❌ Type introuvable.',

                        components:
                            []

                    });


                    return;

                }


                delete config.tickets.types[
                    typeId
                ];


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.update({

                    content:
                        `✅ ${emojiValide(type.emoji)} **${type.name}** supprimé.`,

                    components:
                        []

                });


                return;

            }

            // ==================================================
            // MODIFIER STYLE DU PANNEAU PUBLIC
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'ticket_panel_style'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const modal =
                    new ModalBuilder()

                        .setCustomId(
                            'modal_ticket_panel_style'
                        )

                        .setTitle(
                            'Style du panneau tickets'
                        );


                const titre =
                    new TextInputBuilder()

                        .setCustomId(
                            'ticket_panel_title'
                        )

                        .setLabel(
                            'Titre'
                        )

                        .setValue(
                            config.tickets.panel.title ||
                            ''
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
                            'ticket_panel_description'
                        )

                        .setLabel(
                            'Description'
                        )

                        .setValue(
                            config.tickets.panel.description ||
                            ''
                        )

                        .setStyle(
                            TextInputStyle.Paragraph
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            2000
                        );


                const bouton =
                    new TextInputBuilder()

                        .setCustomId(
                            'ticket_panel_button'
                        )

                        .setLabel(
                            'Texte du bouton'
                        )

                        .setValue(
                            config.tickets.panel.buttonLabel ||
                            'Ouvrir un ticket'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            80
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

                        .setValue(
                            config.tickets.panel.color ||
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
                        );


                const footer =
                    new TextInputBuilder()

                        .setCustomId(
                            'ticket_panel_footer'
                        )

                        .setLabel(
                            'Footer'
                        )

                        .setValue(
                            config.tickets.panel.footer ||
                            ''
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
            // SAUVEGARDER STYLE DU PANNEAU PUBLIC
            // ==================================================

            if (
                interaction.isModalSubmit() &&
                interaction.customId ===
                    'modal_ticket_panel_style'
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
                        '✅ Style du panneau public enregistré.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // MODIFIER STYLE DE L'EMBED INTERNE DU TICKET
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'ticket_embed_style'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const modal =
                    new ModalBuilder()

                        .setCustomId(
                            'modal_ticket_embed_style'
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

                        .setPlaceholder(
                            '{emoji} TICKET // {type}'
                        )

                        .setValue(
                            config.tickets.ticketEmbed.title ||
                            ''
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
                            'ticket_embed_description'
                        )

                        .setLabel(
                            'Description'
                        )

                        .setValue(
                            config.tickets.ticketEmbed.description ||
                            ''
                        )

                        .setStyle(
                            TextInputStyle.Paragraph
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            3000
                        );


                const couleur =
                    new TextInputBuilder()

                        .setCustomId(
                            'ticket_embed_color'
                        )

                        .setLabel(
                            'Couleur HEX'
                        )

                        .setValue(
                            config.tickets.ticketEmbed.color ||
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
                        );


                const footer =
                    new TextInputBuilder()

                        .setCustomId(
                            'ticket_embed_footer'
                        )

                        .setLabel(
                            'Footer'
                        )

                        .setValue(
                            config.tickets.ticketEmbed.footer ||
                            ''
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
                    'modal_ticket_embed_style'
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


                appliquerBanniereEmbed(
                    embed,
                    interaction.guild
                );


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
                // Les boutons interactifs du système ticket
                // sont envoyés directement par le BOT.
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
                        '✅ Panneau ticket créé dans ce salon.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


            // ==================================================
            // BOUTON OUVRIR UN TICKET
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
                    Object.entries(
                        config.tickets.types ||
                        {}
                    );


                if (
                    !types.length
                ) {

                    await interaction.reply({

                        content:
                            '❌ Aucun type de ticket disponible.',

                        flags:
                            MessageFlags.Ephemeral

                    });


                    return;

                }


                const menu =
                    new StringSelectMenuBuilder()

                        .setCustomId(
                            'ticket_type_select'
                        )

                        .setPlaceholder(
                            'Choisis le type de ticket'
                        )

                        .setMinValues(
                            1
                        )

                        .setMaxValues(
                            1
                        );


                for (
                    const [typeId, type]
                    of types.slice(
                        0,
                        25
                    )
                ) {

                    menu.addOptions({

                        label:
                            `${emojiValide(type.emoji)} ${type.name}`
                                .slice(
                                    0,
                                    100
                                ),

                        value:
                            typeId,

                        description:
                            `Ouvrir un ticket ${type.name}`
                                .slice(
                                    0,
                                    100
                                )

                    });

                }


                await interaction.reply({

                    content:
                        '📂 Choisis le type de ticket que tu souhaites ouvrir :',

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
            // CRÉER LE SALON DU TICKET
            // ==================================================

            if (
                interaction.isStringSelectMenu() &&
                interaction.customId ===
                    'ticket_type_select'
            ) {

                await interaction.deferReply({

                    flags:
                        MessageFlags.Ephemeral

                });


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

                    await interaction.editReply(
                        '❌ Type de ticket introuvable.'
                    );


                    return;

                }


                if (
                    !type.categoryId
                ) {

                    await interaction.editReply(
                        '❌ Aucune catégorie n’est configurée pour ce type de ticket.'
                    );


                    return;

                }


                // --------------------------------------------------
                // Vérifier si l'utilisateur possède déjà un ticket
                // --------------------------------------------------

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

                    await interaction.editReply(
                        `❌ Tu possèdes déjà un ticket ouvert : ${ticketExistant}`
                    );


                    return;

                }


                // --------------------------------------------------
                // Vérifier catégorie
                // --------------------------------------------------

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

                    await interaction.editReply(
                        '❌ La catégorie configurée pour ce type de ticket est introuvable.'
                    );


                    return;

                }


                // --------------------------------------------------
                // Nom du salon
                // --------------------------------------------------

                const username =
                    creerSlug(
                        interaction.user.username
                    ) ||
                    'membre';


                const typeSlug =
                    creerSlug(
                        type.name
                    ) ||
                    'ticket';


                let nomSalon =
                    `${typeSlug}-${username}`;


                nomSalon =
                    nomSalon.slice(
                        0,
                        90
                    );


                // --------------------------------------------------
                // Permissions du salon
                // --------------------------------------------------

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
                            PermissionFlagsBits.ManageMessages,
                            PermissionFlagsBits.AttachFiles,
                            PermissionFlagsBits.EmbedLinks
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


                // --------------------------------------------------
                // Création du salon
                // --------------------------------------------------

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


                // --------------------------------------------------
                // Embed interne
                // --------------------------------------------------

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
                                interaction,
                                type
                            )

                        )

                        .setDescription(

                            remplacerVariablesTicket(
                                config.tickets.ticketEmbed.description,
                                interaction,
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


                // --------------------------------------------------
                // Boutons Claim / Fermer
                // --------------------------------------------------

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
                            'Fermer'
                        )

                        .setEmoji(
                            '🔒'
                        )

                        .setStyle(
                            ButtonStyle.Danger
                        );


                const boutons =
                    new ActionRowBuilder()

                        .addComponents(
                            boutonClaim,
                            boutonClose
                        );


                // IMPORTANT :
                // Ce message contient des boutons.
                // Il est donc envoyé DIRECTEMENT par le bot.
                await ticketChannel.send({

                    content:
                        config.tickets.staffRoleId

                            ? `${interaction.user} <@&${config.tickets.staffRoleId}>`

                            : `${interaction.user}`,

                    embeds: [
                        embed
                    ],

                    components: [
                        boutons
                    ],

                    allowedMentions: {

                        users: [
                            interaction.user.id
                        ],

                        roles:
                            config.tickets.staffRoleId

                                ? [
                                    config.tickets.staffRoleId
                                ]

                                : []

                    }

                });


                await interaction.editReply(
                    `✅ Ton ticket a été créé : ${ticketChannel}`
                );


                return;

            }

// ==================================================
// CLAIM TICKET
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


                // --------------------------------------------------
                // Vérifier que c'est bien un ticket
                // --------------------------------------------------

                const topic =
                    interaction.channel.topic ||
                    '';


                if (
                    !topic.includes(
                        'ticket-owner:'
                    )
                ) {

                    await interaction.reply({

                        content:
                            '❌ Ce salon n’est pas reconnu comme un ticket.',

                        flags:
                            MessageFlags.Ephemeral

                    });


                    return;

                }


                // --------------------------------------------------
                // Vérifier si l'utilisateur est autorisé
                // --------------------------------------------------

                const membre =
                    interaction.member;


                const estAdmin =
                    membre.permissions.has(
                        PermissionFlagsBits.Administrator
                    );


                const aRoleStaff =
                    config.tickets.staffRoleId

                        ? membre.roles.cache.has(
                            config.tickets.staffRoleId
                        )

                        : false;


                const estStaffConfigure =
                    Boolean(
                        config.tickets.staffMembers[
                            interaction.user.id
                        ]
                    );


                if (
                    !estAdmin &&
                    !aRoleStaff &&
                    !estStaffConfigure
                ) {

                    await interaction.reply({

                        content:
                            '❌ Tu ne fais pas partie du Staff Tickets.',

                        flags:
                            MessageFlags.Ephemeral

                    });


                    return;

                }


                // --------------------------------------------------
                // Déjà claim ?
                // --------------------------------------------------

                const matchClaim =
                    topic.match(
                        /ticket-claim:(\d+)/
                    );


                if (
                    matchClaim
                ) {

                    const claimId =
                        matchClaim[1];


                    if (
                        claimId ===
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
                                `❌ Ce ticket est déjà pris en charge par <@${claimId}>.`,

                            flags:
                                MessageFlags.Ephemeral

                        });

                    }


                    return;

                }


                // --------------------------------------------------
                // Ajouter le claim dans le topic
                // --------------------------------------------------

                const nouveauTopic =
                    `${topic} | ticket-claim:${interaction.user.id}`;


                await interaction.channel.setTopic(
                    nouveauTopic.slice(
                        0,
                        1024
                    )
                );


                // --------------------------------------------------
                // Emoji personnalisé du Staff
                // --------------------------------------------------

                const emojiStaff =
                    emojiStaffValide(

                        config.tickets.staffMembers[
                            interaction.user.id
                        ]?.emoji

                    );


                // --------------------------------------------------
                // Renommer le salon
                // --------------------------------------------------

                const nomActuel =
                    interaction.channel.name;


                const prefix =
                    creerSlug(
                        emojiStaff
                    );


                // Les emojis Unicode ne passent pas dans les noms
                // Discord, donc on utilise "claim" dans le nom.
                if (
                    !nomActuel.startsWith(
                        'claim-'
                    )
                ) {

                    await interaction.channel.setName(

                        `claim-${nomActuel}`
                            .slice(
                                0,
                                100
                            )

                    )
                        .catch(
                            () => {}
                        );

                }


                // --------------------------------------------------
                // Message de prise en charge
                // --------------------------------------------------

                const embed =
                    new EmbedBuilder()

                        .setColor(
                            '#57F287'
                        )

                        .setTitle(
                            `${emojiStaff} Ticket pris en charge`
                        )

                        .setDescription(
                            `${interaction.user} a pris en charge ce ticket.`
                        )

                        .setTimestamp();


                // IMPORTANT :
                // message ticket envoyé directement par le bot
                await interaction.channel.send({

                    embeds: [
                        embed
                    ]

                });


                await interaction.reply({

                    content:
                        '✅ Ticket pris en charge.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


// ==================================================
// FERMER TICKET
// ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'ticket_close'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const topic =
                    interaction.channel.topic ||
                    '';


                if (
                    !topic.includes(
                        'ticket-owner:'
                    )
                ) {

                    await interaction.reply({

                        content:
                            '❌ Ce salon n’est pas reconnu comme un ticket.',

                        flags:
                            MessageFlags.Ephemeral

                    });


                    return;

                }


                // --------------------------------------------------
                // Vérifier les droits
                // --------------------------------------------------

                const membre =
                    interaction.member;


                const estAdmin =
                    membre.permissions.has(
                        PermissionFlagsBits.Administrator
                    );


                const aRoleStaff =
                    config.tickets.staffRoleId

                        ? membre.roles.cache.has(
                            config.tickets.staffRoleId
                        )

                        : false;


                const estStaffConfigure =
                    Boolean(
                        config.tickets.staffMembers[
                            interaction.user.id
                        ]
                    );


                if (
                    !estAdmin &&
                    !aRoleStaff &&
                    !estStaffConfigure
                ) {

                    await interaction.reply({

                        content:
                            '❌ Seul le Staff peut fermer ce ticket.',

                        flags:
                            MessageFlags.Ephemeral

                    });


                    return;

                }


                await interaction.deferReply({

                    flags:
                        MessageFlags.Ephemeral

                });


                // --------------------------------------------------
                // Récupérer propriétaire / claim
                // --------------------------------------------------

                const matchOwner =
                    topic.match(
                        /ticket-owner:(\d+)/
                    );


                const matchClaim =
                    topic.match(
                        /ticket-claim:(\d+)/
                    );


                const ownerId =
                    matchOwner
                        ? matchOwner[1]
                        : null;


                const claimStaffId =
                    matchClaim
                        ? matchClaim[1]
                        : null;


                let proprietaire =
                    null;


                if (
                    ownerId
                ) {

                    proprietaire =
                        await client.users.fetch(
                            ownerId
                        )
                            .catch(
                                () => null
                            );

                }


                // --------------------------------------------------
                // Générer transcript
                // --------------------------------------------------

                let transcript;


                try {

                    transcript =
                        await genererTranscript(
                            interaction.channel
                        );

                }

                catch (error) {

                    console.error(
                        '❌ Erreur génération transcript :',
                        error
                    );


                    await interaction.editReply(
                        '❌ Impossible de générer le transcript.'
                    );


                    return;

                }


                const nomFichier =
                    `transcript-${interaction.channel.name}-${Date.now()}.txt`;


// ==================================================
// LOG DU TICKET
// ==================================================

                const salonLogs =

                    config.tickets.logsChannelId

                        ? (
                            interaction.guild.channels.cache.get(
                                config.tickets.logsChannelId
                            )

                            ||

                            await interaction.guild.channels.fetch(
                                config.tickets.logsChannelId
                            )
                                .catch(
                                    () => null
                                )
                        )

                        : null;


                if (
                    salonLogs &&
                    salonLogs.isTextBased()
                ) {

                    try {

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
                                            '🎫 Salon',

                                        value:
                                            `#${interaction.channel.name}`,

                                        inline:
                                            true
                                    },

                                    {
                                        name:
                                            '👤 Propriétaire',

                                        value:
                                            ownerId
                                                ? `<@${ownerId}>`
                                                : 'Inconnu',

                                        inline:
                                            true
                                    },

                                    {
                                        name:
                                            '🙋 Pris en charge par',

                                        value:
                                            claimStaffId
                                                ? `<@${claimStaffId}>`
                                                : 'Non pris en charge',

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
                                            `${transcript.messageCount}`,

                                        inline:
                                            true
                                    },

                                    {
                                        name:
                                            '🕒 Fermeture',

                                        value:
                                            `<t:${Math.floor(Date.now() / 1000)}:F>`,

                                        inline:
                                            false
                                    }

                                )

                                .setFooter({

                                    text:
                                        `${interaction.guild.name} • Logs Tickets`

                                })

                                .setTimestamp();


                        // IMPORTANT :
                        // logs tickets envoyés directement par le bot
                        await salonLogs.send({

                            embeds: [
                                logEmbed
                            ],

                            files: [

                                new AttachmentBuilder(

                                    transcript.buffer,

                                    {
                                        name:
                                            nomFichier
                                    }

                                )

                            ]

                        });

                    }

                    catch (error) {

                        console.error(
                            '❌ Impossible d’envoyer le log du ticket :',
                            error
                        );

                    }

                }


// ==================================================
// DM TRANSCRIPT AU PROPRIÉTAIRE
// ==================================================

                let dmEnvoye =
                    false;


                if (
                    proprietaire
                ) {

                    try {

                        const dmEmbed =
                            new EmbedBuilder()

                                .setColor(
                                    '#F47B20'
                                )

                                .setTitle(
                                    '🎫 Ton ticket a été fermé'
                                )

                                .setDescription(
                                    `Ton ticket **#${interaction.channel.name}** sur **${interaction.guild.name}** a été fermé.\n\n` +
                                    'Tu trouveras ci-dessous une copie complète de la conversation.'
                                )

                                .addFields(

                                    {
                                        name:
                                            '🙋 Pris en charge par',

                                        value:
                                            claimStaffId
                                                ? `<@${claimStaffId}>`
                                                : 'Non pris en charge'
                                    },

                                    {
                                        name:
                                            '🔒 Fermé par',

                                        value:
                                            `${interaction.user}`
                                    },

                                    {
                                        name:
                                            '💬 Nombre de messages',

                                        value:
                                            `${transcript.messageCount}`
                                    }

                                )

                                .setFooter({

                                    text:
                                        `${interaction.guild.name} • Support`

                                })

                                .setTimestamp();


                        const configApparence =
                            chargerConfigServeur(
                                interaction.guild.id
                            );


                        if (
                            configApparence.appearance.bannerUrl
                        ) {

                            dmEmbed.setImage(
                                configApparence.appearance.bannerUrl
                            );

                        }


                        await proprietaire.send({

                            embeds: [
                                dmEmbed
                            ],

                            files: [

                                new AttachmentBuilder(

                                    transcript.buffer,

                                    {
                                        name:
                                            nomFichier
                                    }

                                )

                            ]

                        });


                        dmEnvoye =
                            true;

                    }

                    catch (error) {

                        console.log(
                            `⚠️ DM transcript impossible pour ${ownerId || 'inconnu'}`
                        );

                    }

                }


// ==================================================
// AVERTIR DANS LES LOGS SI DM IMPOSSIBLE
// ==================================================

                if (
                    !dmEnvoye &&
                    salonLogs &&
                    salonLogs.isTextBased()
                ) {

                    await salonLogs.send({

                        content:
                            `⚠️ Impossible d'envoyer le transcript en DM à ${
                                proprietaire
                                    ? `<@${proprietaire.id}>`
                                    : 'l’utilisateur'
                            }.`

                    })
                        .catch(
                            () => {}
                        );

                }


// ==================================================
// MESSAGE FINAL DANS LE TICKET
// ==================================================

                await interaction.channel.send({

                    content:
                        '🔒 **Ticket fermé.**\n' +
                        '📄 Le transcript a été sauvegardé.\n' +
                        '🗑️ Suppression du salon dans **5 secondes**...'

                })
                    .catch(
                        () => {}
                    );


                await interaction.editReply(
                    '✅ Ticket fermé.'
                );


// ==================================================
// SUPPRESSION DU SALON
// ==================================================

                setTimeout(

                    async () => {

                        try {

                            await interaction.channel.delete(
                                `Ticket fermé par ${interaction.user.tag}`
                            );

                        }

                        catch (error) {

                            console.error(
                                '❌ Impossible de supprimer le salon ticket :',
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

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const ligne1 =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    'welcome_toggle'
                                )

                                .setLabel(
                                    config.welcome.welcomeEnabled
                                        ? 'Désactiver arrivées'
                                        : 'Activer arrivées'
                                )

                                .setEmoji(
                                    config.welcome.welcomeEnabled
                                        ? '🔴'
                                        : '🟢'
                                )

                                .setStyle(
                                    config.welcome.welcomeEnabled
                                        ? ButtonStyle.Danger
                                        : ButtonStyle.Success
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'goodbye_toggle'
                                )

                                .setLabel(
                                    config.welcome.goodbyeEnabled
                                        ? 'Désactiver départs'
                                        : 'Activer départs'
                                )

                                .setEmoji(
                                    config.welcome.goodbyeEnabled
                                        ? '🔴'
                                        : '🟢'
                                )

                                .setStyle(
                                    config.welcome.goodbyeEnabled
                                        ? ButtonStyle.Danger
                                        : ButtonStyle.Success
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
                                    'Message arrivée'
                                )

                                .setEmoji(
                                    '🎉'
                                )

                                .setStyle(
                                    ButtonStyle.Primary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'goodbye_style'
                                )

                                .setLabel(
                                    'Message départ'
                                )

                                .setEmoji(
                                    '👋'
                                )

                                .setStyle(
                                    ButtonStyle.Primary
                                )

                        );


                const ligne4 =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    'welcome_avatar_toggle'
                                )

                                .setLabel(
                                    'Avatar arrivée'
                                )

                                .setEmoji(
                                    '👤'
                                )

                                .setStyle(
                                    config.welcome.welcomeShowAvatar
                                        ? ButtonStyle.Success
                                        : ButtonStyle.Secondary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'goodbye_avatar_toggle'
                                )

                                .setLabel(
                                    'Avatar départ'
                                )

                                .setEmoji(
                                    '👤'
                                )

                                .setStyle(
                                    config.welcome.goodbyeShowAvatar
                                        ? ButtonStyle.Success
                                        : ButtonStyle.Secondary
                                )

                        );


                const ligne5 =
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
                                    ButtonStyle.Secondary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'welcome_image_delete'
                                )

                                .setLabel(
                                    'Retirer'
                                )

                                .setStyle(
                                    ButtonStyle.Danger
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
                                    ButtonStyle.Secondary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'goodbye_image_delete'
                                )

                                .setLabel(
                                    'Retirer'
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
// ACTIVER / DÉSACTIVER ARRIVÉES
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
                            : '❌ Messages d’arrivée désactivés.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


// ==================================================
// ACTIVER / DÉSACTIVER DÉPARTS
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
                            : '❌ Messages de départ désactivés.',

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
                            'select_welcome_channel'
                        )

                        .setPlaceholder(
                            'Choisis le salon d’arrivée'
                        )

                        .addChannelTypes(
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
                        '📍 Choisis le salon des messages d’arrivée :',

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
                    'select_welcome_channel'
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
                        `✅ Salon d’arrivée : <#${interaction.values[0]}>`,

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
                            'select_goodbye_channel'
                        )

                        .setPlaceholder(
                            'Choisis le salon de départ'
                        )

                        .addChannelTypes(
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
                        '📍 Choisis le salon des messages de départ :',

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
                    'select_goodbye_channel'
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
                        `✅ Salon de départ : <#${interaction.values[0]}>`,

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

                        .setValue(
                            config.welcome.welcomeTitle ||
                            ''
                        )

                        .setPlaceholder(
                            'Bienvenue {user} !'
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


                const message =
                    new TextInputBuilder()

                        .setCustomId(
                            'welcome_message'
                        )

                        .setLabel(
                            'Message'
                        )

                        .setValue(
                            config.welcome.welcomeMessage ||
                            ''
                        )

                        .setPlaceholder(
                            'Bienvenue sur {server}, {mention} !'
                        )

                        .setStyle(
                            TextInputStyle.Paragraph
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            3000
                        );


                const couleur =
                    new TextInputBuilder()

                        .setCustomId(
                            'welcome_color'
                        )

                        .setLabel(
                            'Couleur HEX'
                        )

                        .setValue(
                            config.welcome.welcomeColor ||
                            '#57F287'
                        )

                        .setPlaceholder(
                            '#57F287'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            7
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

                        '#57F287'

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

                        .setValue(
                            config.welcome.goodbyeTitle ||
                            ''
                        )

                        .setPlaceholder(
                            '{user} a quitté le serveur'
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


                const message =
                    new TextInputBuilder()

                        .setCustomId(
                            'goodbye_message'
                        )

                        .setLabel(
                            'Message'
                        )

                        .setValue(
                            config.welcome.goodbyeMessage ||
                            ''
                        )

                        .setPlaceholder(
                            'Au revoir {user}.'
                        )

                        .setStyle(
                            TextInputStyle.Paragraph
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            3000
                        );


                const couleur =
                    new TextInputBuilder()

                        .setCustomId(
                            'goodbye_color'
                        )

                        .setLabel(
                            'Couleur HEX'
                        )

                        .setValue(
                            config.welcome.goodbyeColor ||
                            '#ED4245'
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
// AVATAR ARRIVÉE
// ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'welcome_avatar_toggle'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                config.welcome.welcomeShowAvatar =
                    !config.welcome.welcomeShowAvatar;


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.reply({

                    content:
                        config.welcome.welcomeShowAvatar
                            ? '✅ Avatar activé dans les messages d’arrivée.'
                            : '❌ Avatar désactivé dans les messages d’arrivée.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


// ==================================================
// AVATAR DÉPART
// ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'goodbye_avatar_toggle'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                config.welcome.goodbyeShowAvatar =
                    !config.welcome.goodbyeShowAvatar;


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.reply({

                    content:
                        config.welcome.goodbyeShowAvatar
                            ? '✅ Avatar activé dans les messages de départ.'
                            : '❌ Avatar désactivé dans les messages de départ.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


// ==================================================
// IMAGE ARRIVÉE
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
// IMAGE DÉPART
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

// ======================================================
// PANEL ANNONCES
// ======================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'admin_annonces'
            ) {

                const ligne =
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
                                    'annonce_create'
                                )

                                .setLabel(
                                    'Créer une annonce'
                                )

                                .setEmoji(
                                    '➕'
                                )

                                .setStyle(
                                    ButtonStyle.Success
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
                                )

                        );


                await interaction.update({

                    embeds: [

                        creerEmbedConfigAnnonces(
                            interaction.guild.id
                        )

                    ],

                    components: [
                        ligne
                    ]

                });


                return;

            }


// ======================================================
// CHOISIR SALON ANNONCES
// ======================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'annonce_channel'
            ) {

                const menu =
                    new ChannelSelectMenuBuilder()

                        .setCustomId(
                            'select_annonce_channel'
                        )

                        .setPlaceholder(
                            'Choisis le salon des annonces'
                        )

                        .addChannelTypes(
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
                        `📍 Choisis le salon des annonces de **${interaction.guild.name}** :`,

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


// ======================================================
// SAUVEGARDER SALON ANNONCES
// ======================================================

            if (
                interaction.isChannelSelectMenu() &&
                interaction.customId ===
                    'select_annonce_channel'
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
                        `✅ Salon d'annonces : <#${interaction.values[0]}>`,

                    components:
                        []

                });


                return;

            }


// ======================================================
// STYLE ANNONCES
// ======================================================

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
                            'annonce_style_color'
                        )

                        .setLabel(
                            'Couleur HEX'
                        )

                        .setValue(
                            config.annonces.color ||
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
                        );


                const footer =
                    new TextInputBuilder()

                        .setCustomId(
                            'annonce_style_footer'
                        )

                        .setLabel(
                            'Footer'
                        )

                        .setValue(
                            config.annonces.footer ||
                            ''
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


// ======================================================
// SAUVEGARDER STYLE ANNONCES
// ======================================================

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
                                'annonce_style_color'
                            )
                            .trim(),

                        '#F47B20'

                    );


                config.annonces.footer =
                    interaction.fields
                        .getTextInputValue(
                            'annonce_style_footer'
                        )
                        .trim();


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.reply({

                    content:
                        `✅ Style des annonces de **${interaction.guild.name}** enregistré.`,

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


// ======================================================
// CRÉER ANNONCE
// ======================================================

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
                            'Ex : Informations importantes'
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


                const message =
                    new TextInputBuilder()

                        .setCustomId(
                            'annonce_message'
                        )

                        .setLabel(
                            'Message'
                        )

                        .setPlaceholder(
                            'Écris ton annonce ici...'
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
                            'URL image (facultatif)'
                        )

                        .setPlaceholder(
                            'https://...'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            false
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
                            image
                        )

                );


                await interaction.showModal(
                    modal
                );


                return;

            }


// ======================================================
// APERÇU ANNONCE
// ======================================================

            if (
                interaction.isModalSubmit() &&
                interaction.customId ===
                    'modal_annonce_create'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const titre =
                    interaction.fields
                        .getTextInputValue(
                            'annonce_title'
                        )
                        .trim();


                const message =
                    interaction.fields
                        .getTextInputValue(
                            'annonce_message'
                        )
                        .trim();


                const image =
                    interaction.fields
                        .getTextInputValue(
                            'annonce_image'
                        )
                        .trim();


                const embed =
                    new EmbedBuilder()

                        .setColor(
                            couleurValide(
                                config.annonces.color,
                                '#F47B20'
                            )
                        )

                        .setTitle(
                            titre
                        )

                        .setDescription(
                            message
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
                    image &&
                    /^https?:\/\//i.test(
                        image
                    )
                ) {

                    embed.setImage(
                        image
                    );

                }

                else {

                    appliquerBanniereEmbed(
                        embed,
                        interaction.guild
                    );

                }


                const annonceId =
                    `${interaction.guild.id}_${interaction.user.id}_${Date.now()}`;


                annoncesEnAttente.set(

                    annonceId,

                    {

                        guildId:
                            interaction.guild.id,

                        userId:
                            interaction.user.id,

                        title:
                            titre,

                        message:
                            message,

                        image:
                            image,

                        mention:
                            'none',

                        roleId:
                            null

                    }

                );


                const ligne1 =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    `annonce_publish_${annonceId}`
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
                                    `annonce_cancel_${annonceId}`
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


                const ligne2 =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    `annonce_none_${annonceId}`
                                )

                                .setLabel(
                                    'Aucune mention'
                                )

                                .setEmoji(
                                    '🔕'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    `annonce_everyone_${annonceId}`
                                )

                                .setLabel(
                                    '@everyone'
                                )

                                .setEmoji(
                                    '📣'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    `annonce_role_${annonceId}`
                                )

                                .setLabel(
                                    'Mentionner un rôle'
                                )

                                .setEmoji(
                                    '👥'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                )

                        );


                await interaction.reply({

                    content:
                        `👁️ **APERÇU DE TON ANNONCE — ${interaction.guild.name}**\nMention : **Aucune**`,

                    embeds: [
                        embed
                    ],

                    components: [
                        ligne1,
                        ligne2
                    ],

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


// ======================================================
// MENTION : AUCUNE / @EVERYONE
// ======================================================

            if (
                interaction.isButton() &&
                (
                    interaction.customId.startsWith(
                        'annonce_none_'
                    ) ||
                    interaction.customId.startsWith(
                        'annonce_everyone_'
                    )
                )
            ) {

                const everyone =
                    interaction.customId.startsWith(
                        'annonce_everyone_'
                    );


                const annonceId =
                    interaction.customId.replace(

                        everyone
                            ? 'annonce_everyone_'
                            : 'annonce_none_',

                        ''

                    );


                const annonce =
                    annoncesEnAttente.get(
                        annonceId
                    );


                if (
                    !annonce ||
                    annonce.userId !==
                        interaction.user.id ||
                    annonce.guildId !==
                        interaction.guild.id
                ) {

                    await interaction.reply({

                        content:
                            '❌ Cette annonce n’est plus disponible.',

                        flags:
                            MessageFlags.Ephemeral

                    });


                    return;

                }


                annonce.mention =
                    everyone
                        ? 'everyone'
                        : 'none';


                annonce.roleId =
                    null;


                await interaction.update({

                    content:
                        `👁️ **APERÇU DE TON ANNONCE — ${interaction.guild.name}**\nMention : **${
                            everyone
                                ? '@everyone'
                                : 'Aucune'
                        }**`,

                    embeds:
                        interaction.message.embeds,

                    components:
                        interaction.message.components

                });


                return;

            }


// ======================================================
// CHOISIR UN RÔLE À MENTIONNER
// ======================================================

            if (
                interaction.isButton() &&
                interaction.customId.startsWith(
                    'annonce_role_'
                )
            ) {

                const annonceId =
                    interaction.customId.replace(
                        'annonce_role_',
                        ''
                    );


                const annonce =
                    annoncesEnAttente.get(
                        annonceId
                    );


                if (
                    !annonce ||
                    annonce.guildId !==
                        interaction.guild.id ||
                    annonce.userId !==
                        interaction.user.id
                ) {

                    await interaction.reply({

                        content:
                            '❌ Cette annonce n’est plus disponible.',

                        flags:
                            MessageFlags.Ephemeral

                    });


                    return;

                }


                const menu =
                    new RoleSelectMenuBuilder()

                        .setCustomId(
                            `annonce_select_role_${annonceId}`
                        )

                        .setPlaceholder(
                            'Choisis le rôle à mentionner'
                        )

                        .setMinValues(
                            1
                        )

                        .setMaxValues(
                            1
                        );


                await interaction.reply({

                    content:
                        '👥 Choisis le rôle à mentionner :',

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


// ======================================================
// SAUVEGARDER RÔLE À MENTIONNER
// ======================================================

            if (
                interaction.isRoleSelectMenu() &&
                interaction.customId.startsWith(
                    'annonce_select_role_'
                )
            ) {

                const annonceId =
                    interaction.customId.replace(
                        'annonce_select_role_',
                        ''
                    );


                const annonce =
                    annoncesEnAttente.get(
                        annonceId
                    );


                if (
                    !annonce ||
                    annonce.guildId !==
                        interaction.guild.id ||
                    annonce.userId !==
                        interaction.user.id
                ) {

                    await interaction.update({

                        content:
                            '❌ Cette annonce n’est plus disponible.',

                        components:
                            []

                    });


                    return;

                }


                annonce.mention =
                    'role';


                annonce.roleId =
                    interaction.values[0];


                await interaction.update({

                    content:
                        `✅ L’annonce mentionnera <@&${interaction.values[0]}>.`,

                    components:
                        []

                });


                return;

            }


// ======================================================
// PUBLIER ANNONCE
// ======================================================

            if (
                interaction.isButton() &&
                interaction.customId.startsWith(
                    'annonce_publish_'
                )
            ) {

                const annonceId =
                    interaction.customId.replace(
                        'annonce_publish_',
                        ''
                    );


                const annonce =
                    annoncesEnAttente.get(
                        annonceId
                    );


                if (
                    !annonce ||
                    annonce.userId !==
                        interaction.user.id ||
                    annonce.guildId !==
                        interaction.guild.id
                ) {

                    await interaction.reply({

                        content:
                            '❌ Cette annonce n’est plus disponible.',

                        flags:
                            MessageFlags.Ephemeral

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

                    await interaction.reply({

                        content:
                            '❌ Salon d’annonces introuvable.',

                        flags:
                            MessageFlags.Ephemeral

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
                            annonce.message
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


                let content =
                    undefined;


                let allowedMentions = {

                    parse:
                        []

                };


                if (
                    annonce.mention ===
                    'everyone'
                ) {

                    content =
                        '@everyone';


                    allowedMentions = {

                        parse: [
                            'everyone'
                        ]

                    };

                }


                if (
                    annonce.mention ===
                        'role' &&
                    annonce.roleId
                ) {

                    content =
                        `<@&${annonce.roleId}>`;


                    allowedMentions = {

                        parse:
                            [],

                        roles: [
                            annonce.roleId
                        ]

                    };

                }


                // --------------------------------------------------
                // ICI on utilise le webhook d'apparence
                // car l'annonce est un message PUBLIC.
                // --------------------------------------------------

                await envoyerMessagePersonnalise(

                    salon,

                    {

                        content:
                            content,

                        embeds: [
                            embed
                        ],

                        allowedMentions:
                            allowedMentions

                    }

                );


                annoncesEnAttente.delete(
                    annonceId
                );


                await interaction.update({

                    content:
                        `✅ Annonce publiée dans ${salon}.`,

                    embeds:
                        [],

                    components:
                        []

                });


                return;

            }


// ======================================================
// ANNULER ANNONCE
// ======================================================

            if (
                interaction.isButton() &&
                interaction.customId.startsWith(
                    'annonce_cancel_'
                )
            ) {

                const annonceId =
                    interaction.customId.replace(
                        'annonce_cancel_',
                        ''
                    );


                const annonce =
                    annoncesEnAttente.get(
                        annonceId
                    );


                if (
                    annonce &&
                    (
                        annonce.guildId !==
                            interaction.guild.id ||
                        annonce.userId !==
                            interaction.user.id
                    )
                ) {

                    await interaction.reply({

                        content:
                            '❌ Tu ne peux pas annuler cette annonce.',

                        flags:
                            MessageFlags.Ephemeral

                    });


                    return;

                }


                annoncesEnAttente.delete(
                    annonceId
                );


                await interaction.update({

                    content:
                        '❌ Création de l’annonce annulée.',

                    embeds:
                        [],

                    components:
                        []

                });


                return;

            }

// ======================================================
// PANEL STREAMS TWITCH
// ======================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'admin_streams'
            ) {

                const r1 =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    'stream_channel'
                                )

                                .setLabel(
                                    'Salon Streams'
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
                                    'stream_delete'
                                )

                                .setLabel(
                                    'Supprimer streamer'
                                )

                                .setEmoji(
                                    '🗑️'
                                )

                                .setStyle(
                                    ButtonStyle.Danger
                                )

                        );


                const r2 =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    'stream_embed_edit'
                                )

                                .setLabel(
                                    'Modifier embed'
                                )

                                .setEmoji(
                                    '🎨'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'stream_everyone_toggle'
                                )

                                .setLabel(
                                    '@everyone'
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
                        r1,
                        r2
                    ]

                });


                return;

            }


// ======================================================
// SALON STREAMS
// ======================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'stream_channel'
            ) {

                const menu =
                    new ChannelSelectMenuBuilder()

                        .setCustomId(
                            'select_stream_channel'
                        )

                        .setPlaceholder(
                            'Choisis le salon Streams'
                        )

                        .addChannelTypes(
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
                        `📍 Choisis le salon Streams de **${interaction.guild.name}** :`,

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


            if (
                interaction.isChannelSelectMenu() &&
                interaction.customId ===
                    'select_stream_channel'
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
                        `✅ Salon Streams : <#${interaction.values[0]}>`,

                    components:
                        []

                });


                return;

            }


// ======================================================
// AJOUTER STREAMER
// ======================================================

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


                const login =
                    new TextInputBuilder()

                        .setCustomId(
                            'stream_login'
                        )

                        .setLabel(
                            'Pseudo ou URL Twitch'
                        )

                        .setPlaceholder(
                            'Ex : dexter ou https://twitch.tv/dexter'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        );


                modal.addComponents(

                    new ActionRowBuilder()
                        .addComponents(
                            login
                        )

                );


                await interaction.showModal(
                    modal
                );


                return;

            }


// ======================================================
// SAUVEGARDER STREAMER
// ======================================================

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
                        );


                try {

                    const user =
                        await trouverUtilisateurTwitch(
                            saisie
                        );


                    if (
                        !user
                    ) {

                        await interaction.editReply(
                            '❌ Chaîne Twitch introuvable.'
                        );


                        return;

                    }


                    const config =
                        chargerConfigServeur(
                            interaction.guild.id
                        );


                    config.streams.streamers[
                        user.login.toLowerCase()
                    ] = {

                        id:
                            user.id,

                        login:
                            user.login.toLowerCase(),

                        displayName:
                            user.display_name ||
                            user.login,

                        profileImageUrl:
                            user.profile_image_url ||
                            '',

                        isLive:
                            false,

                        messageId:
                            '',

                        channelId:
                            '',

                        lastStreamId:
                            ''

                    };


                    sauvegarderConfigServeur(
                        interaction.guild.id,
                        config
                    );


                    await interaction.editReply(
                        `✅ **${user.display_name || user.login}** est maintenant surveillé sur **${interaction.guild.name}**.`
                    );

                }

                catch (error) {

                    console.error(
                        '❌ Ajout streamer :',
                        error
                    );


                    await interaction.editReply(
                        `❌ Impossible d'ajouter cette chaîne Twitch.\n\`${error.message}\``
                    );

                }


                return;

            }


// ======================================================
// SUPPRIMER STREAMER
// ======================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'stream_delete'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const streamers =
                    Object.values(
                        config.streams.streamers ||
                        {}
                    );


                if (
                    !streamers.length
                ) {

                    await interaction.reply({

                        content:
                            '❌ Aucun streamer surveillé sur ce serveur.',

                        flags:
                            MessageFlags.Ephemeral

                    });


                    return;

                }


                const menu =
                    new StringSelectMenuBuilder()

                        .setCustomId(
                            'select_stream_delete'
                        )

                        .setPlaceholder(
                            'Choisis le streamer à supprimer'
                        )

                        .addOptions(

                            streamers

                                .slice(
                                    0,
                                    25
                                )

                                .map(
                                    streamer => ({

                                        label:
                                            (
                                                streamer.displayName ||
                                                streamer.login
                                            )
                                                .slice(
                                                    0,
                                                    100
                                                ),

                                        description:
                                            `twitch.tv/${streamer.login}`
                                                .slice(
                                                    0,
                                                    100
                                                ),

                                        value:
                                            streamer.login
                                                .toLowerCase()

                                    })
                                )

                        );


                await interaction.reply({

                    content:
                        `🗑️ Choisis le streamer à supprimer de **${interaction.guild.name}** :`,

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


// ======================================================
// CONFIRMER SUPPRESSION STREAMER
// ======================================================

            if (
                interaction.isStringSelectMenu() &&
                interaction.customId ===
                    'select_stream_delete'
            ) {

                const login =
                    interaction.values[0]
                        .toLowerCase();


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
                            '❌ Ce streamer n’existe plus.',

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


                delete config.streams.streamers[
                    login
                ];


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.update({

                    content:
                        `✅ **${streamer.displayName || streamer.login}** supprimé de la surveillance Twitch.`,

                    components:
                        []

                });


                return;

            }


// ======================================================
// MODIFIER EMBED STREAM
// ======================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'stream_embed_edit'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const e =
                    config.streams.embed;


                const modal =
                    new ModalBuilder()

                        .setCustomId(
                            'modal_stream_embed_edit'
                        )

                        .setTitle(
                            'Modifier Embed Twitch'
                        );


                const titre =
                    new TextInputBuilder()

                        .setCustomId(
                            'stream_embed_title'
                        )

                        .setLabel(
                            'Titre'
                        )

                        .setValue(
                            e.title ||
                            '{streamer} est en live !'
                        )

                        .setPlaceholder(
                            '{streamer} est en live !'
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
                            'stream_embed_description'
                        )

                        .setLabel(
                            'Description'
                        )

                        .setValue(
                            e.description ||
                            ''
                        )

                        .setPlaceholder(
                            '{title}\nJeu : {game}\nSpectateurs : {viewers}'
                        )

                        .setStyle(
                            TextInputStyle.Paragraph
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            3000
                        );


                const couleur =
                    new TextInputBuilder()

                        .setCustomId(
                            'stream_embed_color'
                        )

                        .setLabel(
                            'Couleur HEX'
                        )

                        .setValue(
                            e.color ||
                            '#9146FF'
                        )

                        .setPlaceholder(
                            '#9146FF'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            7
                        );


                const footer =
                    new TextInputBuilder()

                        .setCustomId(
                            'stream_embed_footer'
                        )

                        .setLabel(
                            'Footer'
                        )

                        .setValue(
                            e.footer ||
                            ''
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


                const bouton =
                    new TextInputBuilder()

                        .setCustomId(
                            'stream_button_label'
                        )

                        .setLabel(
                            'Texte du bouton'
                        )

                        .setValue(
                            e.buttonLabel ||
                            'Regarder le live'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            80
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


// ======================================================
// SAUVEGARDER EMBED STREAM
// ======================================================

            if (
                interaction.isModalSubmit() &&
                interaction.customId ===
                    'modal_stream_embed_edit'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                config.streams.embed.title =
                    interaction.fields
                        .getTextInputValue(
                            'stream_embed_title'
                        )
                        .trim();


                config.streams.embed.description =
                    interaction.fields
                        .getTextInputValue(
                            'stream_embed_description'
                        )
                        .trim();


                config.streams.embed.color =
                    couleurValide(

                        interaction.fields
                            .getTextInputValue(
                                'stream_embed_color'
                            )
                            .trim(),

                        '#9146FF'

                    );


                config.streams.embed.footer =
                    interaction.fields
                        .getTextInputValue(
                            'stream_embed_footer'
                        )
                        .trim();


                config.streams.embed.buttonLabel =
                    interaction.fields
                        .getTextInputValue(
                            'stream_button_label'
                        )
                        .trim()

                    ||

                    'Regarder le live';


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.reply({

                    content:
                        `✅ Embed Twitch de **${interaction.guild.name}** modifié.`,

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


// ======================================================
// TOGGLE @EVERYONE TWITCH
// ======================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'stream_everyone_toggle'
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


                await interaction.update({

                    embeds: [

                        creerEmbedConfigStreams(
                            interaction.guild.id
                        )

                    ],

                    components:
                        interaction.message.components

                });


                return;

            }


// ======================================================
// VÉRIFIER TWITCH MAINTENANT
// ======================================================

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
                        `✅ Vérification Twitch effectuée pour **${interaction.guild.name}**.`
                    );

                }

                catch (error) {

                    console.error(
                        `❌ Vérification Twitch manuelle [${interaction.guild.name}] :`,
                        error
                    );


                    await interaction.editReply(
                        `❌ Erreur Twitch : \`${error.message}\``
                    );

                }


                return;

            }

// ======================================================
// FIN DES INTERACTIONS NON TRAITÉES
// ======================================================

        }

        catch (error) {

            console.error(
                '❌ Erreur InteractionCreate :',
                error
            );


            // --------------------------------------------------
            // Si Discord a déjà reçu une réponse
            // --------------------------------------------------

            if (
                interaction.deferred ||
                interaction.replied
            ) {

                await interaction.followUp({

                    content:
                        '❌ Une erreur est survenue pendant cette action.',

                    flags:
                        MessageFlags.Ephemeral

                })
                    .catch(
                        () => {}
                    );

            }

            // --------------------------------------------------
            // Sinon réponse normale
            // --------------------------------------------------

            else if (
                interaction.isRepliable()
            ) {

                await interaction.reply({

                    content:
                        '❌ Une erreur est survenue pendant cette action.',

                    flags:
                        MessageFlags.Ephemeral

                })
                    .catch(
                        () => {}
                    );

            }

        }

    }

);


// ======================================================
// GÉNÉRER LE TRANSCRIPT COMPLET D'UN TICKET
// ======================================================

async function genererTranscript(
    channel
) {

    const messages =
        [];


    let before =
        undefined;


    // ==================================================
    // RÉCUPÉRATION DE TOUS LES MESSAGES
    // ==================================================

    while (
        true
    ) {

        const options = {

            limit:
                100

        };


        if (
            before
        ) {

            options.before =
                before;

        }


        const collection =
            await channel.messages.fetch(
                options
            );


        if (
            !collection.size
        ) {

            break;

        }


        messages.push(
            ...collection.values()
        );


        before =
            collection.last().id;


        if (
            collection.size <
            100
        ) {

            break;

        }

    }


    // ==================================================
    // ORDRE CHRONOLOGIQUE
    // ==================================================

    messages.sort(

        (
            a,
            b
        ) =>
            a.createdTimestamp -
            b.createdTimestamp

    );


    // ==================================================
    // EN-TÊTE
    // ==================================================

    const lignes = [

        '============================================================',

        '                    TRANSCRIPT DU TICKET',

        '============================================================',

        '',

        `Serveur : ${channel.guild.name}`,

        `Serveur ID : ${channel.guild.id}`,

        `Salon : #${channel.name}`,

        `Salon ID : ${channel.id}`,

        `Sujet : ${channel.topic || 'Aucun'}`,

        `Date du transcript : ${new Date().toLocaleString('fr-FR')}`,

        '',

        '============================================================',

        ''

    ];


    // ==================================================
    // TRAITEMENT DE CHAQUE MESSAGE
    // ==================================================

    for (
        const message
        of messages
    ) {

        const date =
            new Date(
                message.createdTimestamp
            )
                .toLocaleString(
                    'fr-FR'
                );


        const auteur =
            message.author

                ? `${message.author.tag} (${message.author.id})`

                : 'Auteur inconnu';


        lignes.push(
            `[${date}] ${auteur}`
        );


        // --------------------------------------------------
        // CONTENU TEXTE
        // --------------------------------------------------

        if (
            message.content
        ) {

            lignes.push(
                message.content
            );

        }


        // --------------------------------------------------
        // PIÈCES JOINTES
        // --------------------------------------------------

        if (
            message.attachments.size
        ) {

            for (
                const attachment
                of message.attachments.values()
            ) {

                lignes.push(

                    `[PIÈCE JOINTE] ${
                        attachment.name ||
                        'fichier'
                    }`

                );


                lignes.push(
                    attachment.url
                );

            }

        }


        // --------------------------------------------------
        // EMBEDS
        // --------------------------------------------------

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
                    embed.url
                ) {

                    lignes.push(
                        `URL : ${embed.url}`
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
                    embed.image?.url
                ) {

                    lignes.push(
                        `Image : ${embed.image.url}`
                    );

                }


                if (
                    embed.thumbnail?.url
                ) {

                    lignes.push(
                        `Miniature : ${embed.thumbnail.url}`
                    );

                }


                if (
                    embed.footer?.text
                ) {

                    lignes.push(
                        `Footer : ${embed.footer.text}`
                    );

                }

            }

        }


        // --------------------------------------------------
        // STICKERS
        // --------------------------------------------------

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


        // --------------------------------------------------
        // RÉPONSE À UN MESSAGE
        // --------------------------------------------------

        if (
            message.reference?.messageId
        ) {

            lignes.push(
                `[RÉPONSE AU MESSAGE] ${message.reference.messageId}`
            );

        }


        lignes.push(
            ''
        );


        lignes.push(
            '------------------------------------------------------------'
        );


        lignes.push(
            ''
        );

    }


    // ==================================================
    // FIN DU TRANSCRIPT
    // ==================================================

    lignes.push(
        ''
    );


    lignes.push(
        '============================================================'
    );


    lignes.push(
        `Nombre total de messages : ${messages.length}`
    );


    lignes.push(
        '============================================================'
    );


    const texte =
        lignes.join(
            '\n'
        );


    return {

        buffer:
            Buffer.from(
                texte,
                'utf8'
            ),

        messageCount:
            messages.length,

        text:
            texte

    };

}


// ======================================================
// ERREURS PROCESS NODE.JS
// ======================================================

process.on(

    'unhandledRejection',

    error => {

        console.error(
            '❌ UNHANDLED REJECTION :',
            error
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
// ARRÊT PROPRE DU BOT
// ======================================================

async function arreterBot(
    signal
) {

    console.log(
        `🛑 Signal ${signal} reçu. Arrêt du bot...`
    );


    try {

        client.destroy();

    }

    catch (error) {

        console.error(
            '❌ Erreur arrêt client Discord :',
            error
        );

    }


    process.exit(
        0
    );

}


process.once(

    'SIGINT',

    () =>
        arreterBot(
            'SIGINT'
        )

);


process.once(

    'SIGTERM',

    () =>
        arreterBot(
            'SIGTERM'
        )

);


// ======================================================
// DÉMARRAGE
// ======================================================

async function demarrerBot() {

    console.log(
        '================================='
    );

    console.log(
        '🟠 BOTTEST // DÉMARRAGE'
    );

    console.log(
        '================================='
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


    try {

        // ----------------------------------------------
        // Installation des commandes
        // ----------------------------------------------

        await enregistrerCommandes();


        // ----------------------------------------------
        // Connexion Discord
        // ----------------------------------------------

        console.log(
            '🔐 Connexion à Discord...'
        );


        await client.login(
            process.env.DISCORD_TOKEN
        );

    }

    catch (error) {

        console.error(
            '❌ Impossible de démarrer le bot :',
            error
        );


        process.exit(
            1
        );

    }

}


// ======================================================
// LANCEMENT FINAL
// ======================================================

demarrerBot();