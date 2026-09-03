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
    MessageFlags
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

const CLIENT_ID = '1544812044862365716';


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
            recursive: true
        }
    );

}


const CONFIG_PATH =
    path.join(
        DATA_DIR,
        'config.json'
    );


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
                    '🎫 SUPPORT',

                description:
                    '**Besoin d’aide ?**\n\nClique sur le bouton pour ouvrir une demande.',

                buttonLabel:
                    'Ouvrir un ticket',

                color:
                    '#F47B20',

                footer:
                    'Ticket • Support'

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
                    'Ticket • Support',

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
                'Rédiger • Annonce'

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
                    'STREAMERS • Twitch',

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

        }

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
// CONFIG GLOBALE MULTI-SERVEURS
// ======================================================

function configBase() {

    return {

        guilds:
            {}

    };

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
// MIGRATION ANCIENNE CONFIG MONO-SERVEUR
// ======================================================

function migrerAncienneConfigSiNecessaire() {

    const config =
        chargerConfigGlobale();


    if (
        config.guilds
    ) {

        return;

    }


    const ancienFormat =
        config.tickets ||
        config.welcome ||
        config.annonces ||
        config.streams;


    if (
        !ancienFormat
    ) {

        sauvegarderConfigGlobale(
            configBase()
        );

        return;

    }


    const guild =
        client.guilds.cache.first();


    if (
        !guild
    ) {

        console.log(
            '⚠️ Migration config : aucun serveur disponible.'
        );

        return;

    }


    const nouvelleConfig =
        configBase();


    nouvelleConfig.guilds[
        guild.id
    ] = fusionnerDefauts(
        config,
        configBaseServeur()
    );


    sauvegarderConfigGlobale(
        nouvelleConfig
    );


    console.log(
        `✅ Ancienne configuration migrée vers le serveur : ${guild.name} (${guild.id})`
    );

}

// ======================================================
// CHARGER CONFIG D'UN SERVEUR
// ======================================================

function chargerConfigServeur(
    guildId
) {

    const configGlobale =
        chargerConfigGlobale();


    if (
        !configGlobale.guilds
    ) {

        configGlobale.guilds =
            {};

    }


    if (
        !configGlobale.guilds[
            guildId
        ]
    ) {

        configGlobale.guilds[
            guildId
        ] =
            configBaseServeur();


        sauvegarderConfigGlobale(
            configGlobale
        );

    }


    fusionnerDefauts(

        configGlobale.guilds[
            guildId
        ],

        configBaseServeur()

    );


    return configGlobale.guilds[
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

    const configGlobale =
        chargerConfigGlobale();


    if (
        !configGlobale.guilds
    ) {

        configGlobale.guilds =
            {};

    }


    configGlobale.guilds[
        guildId
    ] =
        configServeur;


    sauvegarderConfigGlobale(
        configGlobale
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
// TRANSCRIPT TICKET
// ======================================================

async function genererTranscript(
    channel
) {

    let tousLesMessages =
        [];

    let dernierMessageId =
        null;


    while (
        true
    ) {

        const options = {
            limit:
                100
        };


        if (
            dernierMessageId
        ) {

            options.before =
                dernierMessageId;

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


        dernierMessageId =
            messages.last().id;


        if (
            messages.size <
            100
        ) {

            break;

        }

    }


    tousLesMessages.sort(

        (a, b) =>
            a.createdTimestamp -
            b.createdTimestamp

    );


    let transcript =
        '';


    transcript +=
        '============================================================\n';

    transcript +=
        '                 TRANSCRIPT TICKET\n';

    transcript +=
        '============================================================\n\n';

    transcript +=
        `Salon : #${channel.name}\n`;

    transcript +=
        `ID Salon : ${channel.id}\n`;

    transcript +=
        `Serveur : ${channel.guild.name}\n`;

    transcript +=
        `Date du transcript : ${new Date().toLocaleString('fr-FR')}\n\n`;

    transcript +=
        '============================================================\n\n';


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


        transcript +=
            `[${date}] ${message.author.tag} (${message.author.id})\n`;


        if (
            message.content
        ) {

            transcript +=
                `${message.content}\n`;

        }


        for (
            const attachment
            of message.attachments.values()
        ) {

            transcript +=
                `[PIÈCE JOINTE] ${attachment.name}\n`;

            transcript +=
                `${attachment.url}\n`;

        }


        for (
            const embed
            of message.embeds
        ) {

            transcript +=
                '[EMBED]\n';


            if (
                embed.title
            ) {

                transcript +=
                    `Titre : ${embed.title}\n`;

            }


            if (
                embed.description
            ) {

                transcript +=
                    `Description : ${embed.description}\n`;

            }


            if (
                embed.url
            ) {

                transcript +=
                    `Lien : ${embed.url}\n`;

            }


            if (
                embed.fields?.length
            ) {

                for (
                    const field
                    of embed.fields
                ) {

                    transcript +=
                        `${field.name} : ${field.value}\n`;

                }

            }

        }


        for (
            const sticker
            of message.stickers.values()
        ) {

            transcript +=
                `[STICKER] ${sticker.name}\n`;

        }


        transcript +=
            '\n------------------------------------------------------------\n\n';

    }


    transcript +=
        '\n============================================================\n';

    transcript +=
        `FIN DU TRANSCRIPT - ${tousLesMessages.length} MESSAGE(S)\n`;

    transcript +=
        '============================================================\n';


    return {

        buffer:
            Buffer.from(
                transcript,
                'utf8'
            ),

        messageCount:
            tousLesMessages.length

    };

}

// ======================================================
// TWITCH API
// ======================================================

let twitchToken =
    null;


let twitchTokenExpireAt =
    0;


let streamCheckEnCours =
    false;


// ======================================================
// TOKEN TWITCH
// ======================================================

async function obtenirTwitchToken() {

    if (

        twitchToken &&

        Date.now() <
            twitchTokenExpireAt -
            60000

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
            'TWITCH_CLIENT_ID ou TWITCH_CLIENT_SECRET manquant.'
        );

    }


    const url =
        'https://id.twitch.tv/oauth2/token' +

        `?client_id=${encodeURIComponent(clientId)}` +

        `&client_secret=${encodeURIComponent(clientSecret)}` +

        '&grant_type=client_credentials';


    const response =
        await fetch(
            url,
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
            `Twitch OAuth ${response.status}: ${texte}`
        );

    }


    const data =
        await response.json();


    twitchToken =
        data.access_token;


    twitchTokenExpireAt =
        Date.now() +
        (
            (
                data.expires_in ||
                3600
            ) *
            1000
        );


    return twitchToken;

}


// ======================================================
// REQUÊTE TWITCH
// ======================================================

async function twitchFetch(
    endpoint
) {

    let token =
        await obtenirTwitchToken();


    let response =
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


        twitchTokenExpireAt =
            0;


        token =
            await obtenirTwitchToken();


        response =
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

    }


    if (
        !response.ok
    ) {

        throw new Error(
            `Twitch API ${response.status}: ${await response.text()}`
        );

    }


    return response.json();

}


// ======================================================
// TROUVER UNE CHAÎNE TWITCH
// ======================================================

async function trouverUtilisateurTwitch(
    login
) {

    const propre =
        login

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


    return data.data?.[0] ||
        null;

}


// ======================================================
// EMBED LIVE TWITCH
// ======================================================

function creerEmbedStream(
    config,
    streamer,
    stream
) {

    const e =
        config.streams.embed;


    const embed =
        new EmbedBuilder()

            .setColor(
                couleurValide(
                    e.color,
                    '#9146FF'
                )
            )

            .setTitle(
                remplacerVariablesStream(
                    e.title,
                    streamer,
                    stream
                )
            )

            .setDescription(
                remplacerVariablesStream(
                    e.description,
                    streamer,
                    stream
                )
            )

            .setURL(
                `https://www.twitch.tv/${streamer.login}`
            )

            .setTimestamp();


    if (
        e.footer
    ) {

        embed.setFooter({

            text:
                e.footer

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

            +

            `?t=${Date.now()}`

        );

    }


    return embed;

}


// ======================================================
// SUPPRIMER ANNONCE LIVE
// ======================================================

async function supprimerAnnonceStream(
    guild,
    config,
    streamer
) {

    if (
        !streamer.messageId ||
        !config.streams.channelId
    ) {

        return;

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

        return;

    }


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


// ======================================================
// PUBLIER ANNONCE LIVE
// ======================================================

async function publierAnnonceStream(
    guild,
    config,
    streamer,
    stream
) {

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

        throw new Error(
            `Salon Streams introuvable sur ${guild.name}.`
        );

    }


    const embed =
        creerEmbedStream(
            config,
            streamer,
            stream
        );


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


    const payload = {

        embeds: [
            embed
        ],

        components: [

            new ActionRowBuilder()
                .addComponents(
                    bouton
                )

        ]

    };


    if (
        config.streams.embed
            .mentionEveryone
    ) {

        payload.content =
            '@everyone';


        payload.allowedMentions = {

            parse: [
                'everyone'
            ]

        };

    }


    return salon.send(
        payload
    );

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


    if (

        !config.streams.channelId ||

        !Object.keys(
            config.streams.streamers
        ).length

    ) {

        return;

    }


    const streamers =
        Object.values(
            config.streams.streamers
        )
            .filter(
                streamer =>
                    streamer?.login
            );


    if (
        !streamers.length
    ) {

        return;

    }


    const onlineParLogin =
        new Map();


    for (
        let i = 0;
        i < streamers.length;
        i += 100
    ) {

        const lot =
            streamers.slice(
                i,
                i + 100
            );


        const params =
            lot
                .map(
                    streamer =>
                        `user_login=${encodeURIComponent(streamer.login)}`
                )
                .join(
                    '&'
                );


        const data =
            await twitchFetch(
                `/streams?${params}`
            );


        for (
            const stream
            of data.data ||
            []
        ) {

            onlineParLogin.set(

                stream.user_login
                    .toLowerCase(),

                stream

            );

        }

    }


    let modifie =
        false;


    for (
        const streamer
        of streamers
    ) {

        const login =
            streamer.login
                .toLowerCase();


        const stream =
            onlineParLogin.get(
                login
            );


        // ==============================================
        // ONLINE
        // ==============================================

        if (
            stream
        ) {

            if (
                !streamer.isLive ||
                !streamer.messageId
            ) {

                if (
                    streamer.messageId
                ) {

                    await supprimerAnnonceStream(
                        guild,
                        config,
                        streamer
                    );

                }


                const message =
                    await publierAnnonceStream(
                        guild,
                        config,
                        streamer,
                        stream
                    );


                streamer.messageId =
                    message.id;


                streamer.isLive =
                    true;


                streamer.lastStreamId =
                    stream.id ||
                    '';


                modifie =
                    true;


                console.log(
                    `🔴 Twitch ONLINE [${guild.name}] : ${streamer.login}`
                );

            }

        }


        // ==============================================
        // OFFLINE
        // ==============================================

        else {

            if (
                streamer.isLive ||
                streamer.messageId
            ) {

                await supprimerAnnonceStream(
                    guild,
                    config,
                    streamer
                );


                streamer.messageId =
                    '';


                streamer.isLive =
                    false;


                streamer.lastStreamId =
                    '';


                modifie =
                    true;


                console.log(
                    `⚫ Twitch OFFLINE [${guild.name}] : ${streamer.login}`
                );

            }

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
// VÉRIFICATION TWITCH MULTI-SERVEURS
// ======================================================

async function verifierStreams() {

    if (
        streamCheckEnCours ||
        !client.isReady()
    ) {

        return;

    }


    streamCheckEnCours =
        true;


    try {

        for (
            const guild
            of client.guilds.cache.values()
        ) {

            try {

                await verifierStreamsServeur(
                    guild
                );

            }

            catch (error) {

                console.error(
                    `❌ Twitch [${guild.name}] :`,
                    error.message
                );

            }

        }

    }

    catch (error) {

        console.error(
            '❌ Vérification Twitch globale :',
            error
        );

    }

    finally {

        streamCheckEnCours =
            false;

    }

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


    const embed =
        new EmbedBuilder()

            .setColor(
                '#F47B20'
            )

            .setTitle(
                '🎫 CONFIGURATION // TICKETS'
            )

            .setDescription(
                'Gère entièrement le système de tickets de ce serveur.'
            )

            .addFields(

                {
                    name:
                        '🛡️ Rôle Staff',

                    value:
                        config.tickets.staffRoleId
                            ? `<@&${config.tickets.staffRoleId}>`
                            : '❌ Non configuré'
                },

                {
                    name:
                        '📜 Salon Logs',

                    value:
                        config.tickets.logsChannelId
                            ? `<#${config.tickets.logsChannelId}>`
                            : '❌ Non configuré'
                }

            );


    const staffs =
        Object.entries(
            config.tickets.staffMembers
        );


    embed.addFields({

        name:
            '👥 Staff Tickets',

        value:
            staffs.length

                ? staffs
                    .map(
                        ([id, infos]) =>
                            `${emojiStaffValide(infos.emoji)} <@${id}>`
                    )
                    .join(
                        '\n'
                    )
                    .slice(
                        0,
                        1024
                    )

                : 'Aucun staff avec emoji personnel.'

    });


    const types =
        Object.entries(
            config.tickets.types
        );


    embed.addFields({

        name:
            '📂 Types de tickets',

        value:
            types.length

                ? types
                    .map(
                        ([, type]) =>
                            `${emojiValide(type.emoji)} **${type.name}**\n` +
                            `└ ${
                                type.categoryId
                                    ? `<#${type.categoryId}>`
                                    : '❌ Aucune catégorie'
                            }`
                    )
                    .join(
                        '\n\n'
                    )
                    .slice(
                        0,
                        1024
                    )

                : 'Aucun type créé.'

    });


    embed.addFields(

        {
            name:
                '🎨 Panel public',

            value:
                `Titre : **${config.tickets.panel.title}**\n` +
                `Bouton : **${config.tickets.panel.buttonLabel}**\n` +
                `Couleur : \`${config.tickets.panel.color}\``
        },

        {
            name:
                '📝 Embed interne',

            value:
                `Titre : **${config.tickets.ticketEmbed.title}**\n` +
                `Couleur : \`${config.tickets.ticketEmbed.color}\`\n` +
                `Avatar : ${
                    config.tickets.ticketEmbed.showAvatar
                        ? '✅'
                        : '❌'
                }`
        }

    );


    return embed;

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
            '👋 CONFIGURATION // BIENVENUE & DÉPART'
        )

        .setDescription(
            'Configure les messages d’arrivée et de départ de ce serveur.'
        )

        .addFields(

            {
                name:
                    '📥 Arrivées',

                value:
                    config.welcome.welcomeEnabled
                        ? '✅ Activées'
                        : '❌ Désactivées',

                inline:
                    true
            },

            {
                name:
                    '📤 Départs',

                value:
                    config.welcome.goodbyeEnabled
                        ? '✅ Activés'
                        : '❌ Désactivés',

                inline:
                    true
            },

            {
                name:
                    '📥 Salon arrivée',

                value:
                    config.welcome.welcomeChannelId
                        ? `<#${config.welcome.welcomeChannelId}>`
                        : '❌ Non configuré'
            },

            {
                name:
                    '📤 Salon départ',

                value:
                    config.welcome.goodbyeChannelId
                        ? `<#${config.welcome.goodbyeChannelId}>`
                        : '❌ Non configuré'
            },

            {
                name:
                    '🎨 Couleurs',

                value:
                    `Arrivée : \`${config.welcome.welcomeColor}\`\n` +
                    `Départ : \`${config.welcome.goodbyeColor}\``
            },

            {
                name:
                    '🖼️ Avatar membre',

                value:
                    `Arrivée : ${
                        config.welcome.welcomeShowAvatar
                            ? '✅'
                            : '❌'
                    }\n` +

                    `Départ : ${
                        config.welcome.goodbyeShowAvatar
                            ? '✅'
                            : '❌'
                    }`
            },

            {
                name:
                    '🖼️ Image arrivée',

                value:
                    config.welcome.welcomeImageUrl
                        ? '✅ Configurée'
                        : '❌ Aucune'
            },

            {
                name:
                    '🖼️ Image départ',

                value:
                    config.welcome.goodbyeImageUrl
                        ? '✅ Configurée'
                        : '❌ Aucune'
            }

        );

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
            '📢 CONFIGURATION // ANNONCES'
        )

        .setDescription(
            'Crée et publie les annonces de ce serveur directement depuis Discord.'
        )

        .addFields(

            {
                name:
                    '📍 Salon par défaut',

                value:
                    config.annonces.channelId
                        ? `<#${config.annonces.channelId}>`
                        : '❌ Non configuré'
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
            config.streams.streamers
        );


    const liste =
        streamers.length

            ? streamers
                .map(
                    streamer =>
                        `${
                            streamer.isLive
                                ? '🔴'
                                : '⚫'
                        } **${
                            streamer.displayName ||
                            streamer.login
                        }** (\`${streamer.login}\`)`
                )
                .join(
                    '\n'
                )
                .slice(
                    0,
                    1024
                )

            : 'Aucun streamer surveillé.';


    return new EmbedBuilder()

        .setColor(
            couleurValide(
                config.streams.embed.color,
                '#9146FF'
            )
        )

        .setTitle(
            '🔴 CONFIGURATION // STREAMS TWITCH'
        )

        .setDescription(
            'Les lives Twitch sont gérés indépendamment pour ce serveur.'
        )

        .addFields(

            {
                name:
                    '📍 Salon Streams',

                value:
                    config.streams.channelId
                        ? `<#${config.streams.channelId}>`
                        : '❌ Non configuré'
            },

            {
                name:
                    '⏱️ Vérification',

                value:
                    `${config.streams.checkInterval || 60} secondes`,

                inline:
                    true
            },

            {
                name:
                    '📣 @everyone',

                value:
                    config.streams.embed.mentionEveryone
                        ? '✅ Activé'
                        : '❌ Désactivé',

                inline:
                    true
            },

            {
                name:
                    '👤 Streamers surveillés',

                value:
                    liste
            },

            {
                name:
                    '🎨 Embed',

                value:
                    `Couleur : \`${config.streams.embed.color}\`\n` +
                    `Bouton : **${config.streams.embed.buttonLabel}**\n` +
                    `Footer : **${config.streams.embed.footer || 'Aucun'}**`
            }

        );

}


// ======================================================
// MÉMOIRE ANNONCES
// ======================================================

const annoncesEnAttente =
    new Map();


// ======================================================
// ATTENTE IMAGE BIENVENUE / DÉPART
// ======================================================

const attenteImageBienvenue =
    new Map();

// ======================================================
// COMMANDES
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
// REST
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
// ENREGISTRER COMMANDES GLOBALES
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
            '❌ Erreur commandes :',
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


        // ==============================================
        // MIGRATION ANCIENNE CONFIG
        // ==============================================

        migrerAncienneConfigSiNecessaire();


        // ==============================================
        // CRÉER CONFIG POUR TOUS LES SERVEURS
        // ==============================================

        for (
            const guild
            of client.guilds.cache.values()
        ) {

            chargerConfigServeur(
                guild.id
            );


            console.log(
                `⚙️ Config chargée : ${guild.name} (${guild.id})`
            );

        }


        // ==============================================
        // TWITCH
        // ==============================================

        await verifierStreams();


        setInterval(

            verifierStreams,

            60000

        );


        console.log(
            '🔴 Twitch : vérification multi-serveurs toutes les 60s'
        );

    }
);


// ======================================================
// BOT AJOUTÉ SUR UN NOUVEAU SERVEUR
// ======================================================

client.on(
    Events.GuildCreate,
    async guild => {

        console.log(
            `➕ Nouveau serveur : ${guild.name} (${guild.id})`
        );


        chargerConfigServeur(
            guild.id
        );


        console.log(
            `✅ Configuration créée pour ${guild.name}`
        );

    }
);


// ======================================================
// BOT RETIRÉ D'UN SERVEUR
// ======================================================

client.on(
    Events.GuildDelete,
    async guild => {

        console.log(
            `➖ Bot retiré du serveur : ${guild.name} (${guild.id})`
        );


        /*
            On NE supprime PAS automatiquement la config.

            Comme ça, si le bot est réinvité plus tard,
            les réglages du serveur peuvent être conservés.
        */

    }
);


// ======================================================
// BIENVENUE
// ======================================================

client.on(
    Events.GuildMemberAdd,
    async member => {

        console.log(
            `📥 Nouveau membre [${member.guild.name}] : ${member.user.tag}`
        );


        const config =
            chargerConfigServeur(
                member.guild.id
            );


        if (
            !config.welcome.welcomeEnabled
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
                `❌ Salon bienvenue introuvable [${member.guild.name}]`
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


            await salon.send({

                embeds: [
                    embed
                ]

            });


            console.log(
                `✅ Bienvenue envoyé [${member.guild.name}] : ${member.user.tag}`
            );

        }

        catch (error) {

            console.error(
                `❌ Erreur bienvenue [${member.guild.name}] :`,
                error
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

        console.log(
            `📤 Membre parti [${member.guild.name}] : ${member.user.tag}`
        );


        const config =
            chargerConfigServeur(
                member.guild.id
            );


        if (
            !config.welcome.goodbyeEnabled
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
                `❌ Salon départ introuvable [${member.guild.name}]`
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


            await salon.send({

                embeds: [
                    embed
                ]

            });


            console.log(
                `✅ Départ envoyé [${member.guild.name}] : ${member.user.tag}`
            );

        }

        catch (error) {

            console.error(
                `❌ Erreur départ [${member.guild.name}] :`,
                error
            );

        }

    }
);


// ======================================================
// RÉCUPÉRER IMAGE BIENVENUE / DÉPART
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


        const cleAttente =
            `${message.guild.id}:${message.author.id}`;


        const attente =
            attenteImageBienvenue.get(
                cleAttente
            );


        if (
            !attente
        ) {

            return;

        }


        if (
            attente.channelId !==
            message.channel.id
        ) {

            return;

        }


        if (
            Date.now() >
            attente.expiresAt
        ) {

            attenteImageBienvenue.delete(
                cleAttente
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
                '❌ Tu dois envoyer une image en pièce jointe.'
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
            attente.type ===
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
            cleAttente
        );


        await message.reply(

            attente.type ===
            'welcome'

                ? '✅ Image d’arrivée enregistrée pour ce serveur.'

                : '✅ Image de départ enregistrée pour ce serveur.'

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

            // ==============================================
            // SÉCURITÉ : INTERACTIONS UNIQUEMENT SERVEUR
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

                    })
                        .catch(
                            () => {}
                        );

                }


                return;

            }


// ======================================================
// IMAGE BIENVENUE / DÉPART
// ======================================================

            if (
                interaction.isButton() &&
                [
                    'welcome_image',
                    'goodbye_image'
                ].includes(
                    interaction.customId
                )
            ) {

                const type =
                    interaction.customId ===
                    'welcome_image'

                        ? 'welcome'

                        : 'goodbye';


                const cleAttente =
                    `${interaction.guild.id}:${interaction.user.id}`;


                attenteImageBienvenue.set(

                    cleAttente,

                    {

                        guildId:
                            interaction.guild.id,

                        type:
                            type,

                        channelId:
                            interaction.channel.id,

                        expiresAt:
                            Date.now() +
                            120000

                    }

                );


                await interaction.reply({

                    content:
                        type ===
                        'welcome'

                            ? '🖼️ Envoie maintenant **l’image d’arrivée** dans ce salon.\nTu as **2 minutes**.'

                            : '🖼️ Envoie maintenant **l’image de départ** dans ce salon.\nTu as **2 minutes**.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


// ======================================================
// SUPPRIMER IMAGE BIENVENUE / DÉPART
// ======================================================

            if (
                interaction.isButton() &&
                [
                    'welcome_image_delete',
                    'goodbye_image_delete'
                ].includes(
                    interaction.customId
                )
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const welcome =
                    interaction.customId ===
                    'welcome_image_delete';


                if (
                    welcome
                ) {

                    config.welcome.welcomeImageUrl =
                        '';

                }

                else {

                    config.welcome.goodbyeImageUrl =
                        '';

                }


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.reply({

                    content:
                        welcome

                            ? '✅ Image d’arrivée supprimée pour ce serveur.'

                            : '✅ Image de départ supprimée pour ce serveur.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


// ======================================================
// /BOT-PANEL
// ======================================================

            if (
                interaction.isChatInputCommand() &&
                interaction.commandName ===
                    'bot-panel'
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


// ======================================================
// PANEL BIENVENUE
// ======================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'admin_bienvenue'
            ) {

                const r1 =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    'welcome_toggle'
                                )

                                .setLabel(
                                    'Activer/Désactiver arrivée'
                                )

                                .setEmoji(
                                    '📥'
                                )

                                .setStyle(
                                    ButtonStyle.Primary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'goodbye_toggle'
                                )

                                .setLabel(
                                    'Activer/Désactiver départ'
                                )

                                .setEmoji(
                                    '📤'
                                )

                                .setStyle(
                                    ButtonStyle.Primary
                                )

                        );


                const r2 =
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
                                    '📥'
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
                                    '📤'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                )

                        );


                const r3 =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    'welcome_edit'
                                )

                                .setLabel(
                                    'Modifier arrivée'
                                )

                                .setEmoji(
                                    '✏️'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'goodbye_edit'
                                )

                                .setLabel(
                                    'Modifier départ'
                                )

                                .setEmoji(
                                    '✏️'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                )

                        );


                const r4 =
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
                                    '🖼️'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'goodbye_avatar_toggle'
                                )

                                .setLabel(
                                    'Avatar départ'
                                )

                                .setEmoji(
                                    '🖼️'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                )

                        );


                const r5 =
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
                                    'welcome_image_delete'
                                )

                                .setLabel(
                                    'Supprimer arrivée'
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
                                    'Supprimer départ'
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
                        r1,
                        r2,
                        r3,
                        r4,
                        r5
                    ]

                });


                return;

            }


// ======================================================
// TOGGLES BIENVENUE / DÉPART
// ======================================================

            if (
                interaction.isButton() &&
                [
                    'welcome_toggle',
                    'goodbye_toggle',
                    'welcome_avatar_toggle',
                    'goodbye_avatar_toggle'
                ].includes(
                    interaction.customId
                )
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                if (
                    interaction.customId ===
                    'welcome_toggle'
                ) {

                    config.welcome.welcomeEnabled =
                        !config.welcome.welcomeEnabled;

                }


                if (
                    interaction.customId ===
                    'goodbye_toggle'
                ) {

                    config.welcome.goodbyeEnabled =
                        !config.welcome.goodbyeEnabled;

                }


                if (
                    interaction.customId ===
                    'welcome_avatar_toggle'
                ) {

                    config.welcome.welcomeShowAvatar =
                        !config.welcome.welcomeShowAvatar;

                }


                if (
                    interaction.customId ===
                    'goodbye_avatar_toggle'
                ) {

                    config.welcome.goodbyeShowAvatar =
                        !config.welcome.goodbyeShowAvatar;

                }


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.update({

                    embeds: [

                        creerEmbedConfigBienvenue(
                            interaction.guild.id
                        )

                    ],

                    components:
                        interaction.message.components

                });


                return;

            }


// ======================================================
// SALONS BIENVENUE / DÉPART
// ======================================================

            if (
                interaction.isButton() &&
                [
                    'welcome_channel',
                    'goodbye_channel'
                ].includes(
                    interaction.customId
                )
            ) {

                const isWelcome =
                    interaction.customId ===
                    'welcome_channel';


                const menu =
                    new ChannelSelectMenuBuilder()

                        .setCustomId(
                            isWelcome

                                ? 'select_welcome_channel'

                                : 'select_goodbye_channel'
                        )

                        .setPlaceholder(
                            isWelcome

                                ? 'Choisis le salon arrivée'

                                : 'Choisis le salon départ'
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
                        isWelcome

                            ? '📥 Choisis le salon d’arrivée de **ce serveur** :'

                            : '📤 Choisis le salon de départ de **ce serveur** :',

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
// ENREGISTRER SALONS BIENVENUE / DÉPART
// ======================================================

            if (
                interaction.isChannelSelectMenu() &&
                [
                    'select_welcome_channel',
                    'select_goodbye_channel'
                ].includes(
                    interaction.customId
                )
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const isWelcome =
                    interaction.customId ===
                    'select_welcome_channel';


                if (
                    isWelcome
                ) {

                    config.welcome.welcomeChannelId =
                        interaction.values[0];

                }

                else {

                    config.welcome.goodbyeChannelId =
                        interaction.values[0];

                }


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.update({

                    content:
                        `✅ Salon ${
                            isWelcome
                                ? 'd’arrivée'
                                : 'de départ'
                        } enregistré pour **${interaction.guild.name}** : <#${interaction.values[0]}>`,

                    components:
                        []

                });


                return;

            }


// ======================================================
// MODIFIER BIENVENUE / DÉPART
// ======================================================

            if (
                interaction.isButton() &&
                [
                    'welcome_edit',
                    'goodbye_edit'
                ].includes(
                    interaction.customId
                )
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const isWelcome =
                    interaction.customId ===
                    'welcome_edit';


                const modal =
                    new ModalBuilder()

                        .setCustomId(
                            isWelcome

                                ? 'modal_welcome_edit'

                                : 'modal_goodbye_edit'
                        )

                        .setTitle(
                            isWelcome

                                ? 'Modifier arrivée'

                                : 'Modifier départ'
                        );


                const titre =
                    new TextInputBuilder()

                        .setCustomId(
                            'wg_title'
                        )

                        .setLabel(
                            'Titre'
                        )

                        .setValue(
                            isWelcome

                                ? config.welcome.welcomeTitle

                                : config.welcome.goodbyeTitle
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        );


                const message =
                    new TextInputBuilder()

                        .setCustomId(
                            'wg_message'
                        )

                        .setLabel(
                            'Message'
                        )

                        .setValue(
                            isWelcome

                                ? config.welcome.welcomeMessage

                                : config.welcome.goodbyeMessage
                        )

                        .setStyle(
                            TextInputStyle.Paragraph
                        )

                        .setRequired(
                            true
                        );


                const couleur =
                    new TextInputBuilder()

                        .setCustomId(
                            'wg_color'
                        )

                        .setLabel(
                            'Couleur HEX'
                        )

                        .setValue(
                            isWelcome

                                ? config.welcome.welcomeColor

                                : config.welcome.goodbyeColor
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


// ======================================================
// SAUVEGARDER MODIFICATION BIENVENUE / DÉPART
// ======================================================

            if (
                interaction.isModalSubmit() &&
                [
                    'modal_welcome_edit',
                    'modal_goodbye_edit'
                ].includes(
                    interaction.customId
                )
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const isWelcome =
                    interaction.customId ===
                    'modal_welcome_edit';


                const titre =
                    interaction.fields
                        .getTextInputValue(
                            'wg_title'
                        );


                const message =
                    interaction.fields
                        .getTextInputValue(
                            'wg_message'
                        );


                const couleur =
                    interaction.fields
                        .getTextInputValue(
                            'wg_color'
                        );


                if (
                    isWelcome
                ) {

                    config.welcome.welcomeTitle =
                        titre;


                    config.welcome.welcomeMessage =
                        message;


                    config.welcome.welcomeColor =
                        couleurValide(
                            couleur,
                            '#F47B20'
                        );

                }

                else {

                    config.welcome.goodbyeTitle =
                        titre;


                    config.welcome.goodbyeMessage =
                        message;


                    config.welcome.goodbyeColor =
                        couleurValide(
                            couleur,
                            '#ED4245'
                        );

                }


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.reply({

                    content:
                        `✅ Message ${
                            isWelcome
                                ? 'd’arrivée'
                                : 'de départ'
                        } de **${interaction.guild.name}** modifié.`,

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }

// ======================================================
// AJOUTER STAFF
// ======================================================

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
                            'Choisis un membre du staff'
                        )

                        .setMinValues(
                            1
                        )

                        .setMaxValues(
                            1
                        );


                await interaction.reply({

                    content:
                        '👥 Sélectionne le membre du Staff de ce serveur :',

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
// SÉLECTION STAFF À AJOUTER
// ======================================================

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
                            `modal_ticket_staff_add_${userId}`
                        )

                        .setTitle(
                            'Emoji du Staff'
                        );


                const emoji =
                    new TextInputBuilder()

                        .setCustomId(
                            'staff_emoji'
                        )

                        .setLabel(
                            'Emoji personnel'
                        )

                        .setPlaceholder(
                            'Ex : 🐸'
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
                            emoji
                        )

                );


                await interaction.showModal(
                    modal
                );


                return;

            }


// ======================================================
// SAUVEGARDER STAFF
// ======================================================

            if (
                interaction.isModalSubmit() &&
                interaction.customId.startsWith(
                    'modal_ticket_staff_add_'
                )
            ) {

                const userId =
                    interaction.customId.replace(
                        'modal_ticket_staff_add_',
                        ''
                    );


                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                config.tickets.staffMembers[
                    userId
                ] = {

                    emoji:
                        emojiStaffValide(

                            interaction.fields
                                .getTextInputValue(
                                    'staff_emoji'
                                )

                        )

                };


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.reply({

                    content:
                        `✅ <@${userId}> ajouté aux Staffs Tickets de **${interaction.guild.name}**.`,

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


// ======================================================
// MODIFIER / RETIRER STAFF
// ======================================================

            if (
                interaction.isButton() &&
                [
                    'ticket_staff_edit',
                    'ticket_staff_delete'
                ].includes(
                    interaction.customId
                )
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
                            '❌ Aucun Staff personnalisé sur ce serveur.',

                        flags:
                            MessageFlags.Ephemeral

                    });


                    return;

                }


                const options =
                    [];


                for (
                    const [userId, infos]
                    of staffs.slice(
                        0,
                        25
                    )
                ) {

                    let userName =
                        `Utilisateur ${userId}`;


                    try {

                        const user =
                            await client.users.fetch(
                                userId
                            );


                        userName =
                            user.username;

                    }

                    catch (_) {}


                    options.push({

                        label:
                            `${emojiStaffValide(infos.emoji)} ${userName}`
                                .slice(
                                    0,
                                    100
                                ),

                        description:
                            `ID : ${userId}`
                                .slice(
                                    0,
                                    100
                                ),

                        value:
                            userId

                    });

                }


                const edit =
                    interaction.customId ===
                    'ticket_staff_edit';


                const menu =
                    new StringSelectMenuBuilder()

                        .setCustomId(
                            edit
                                ? 'select_ticket_staff_edit'
                                : 'select_ticket_staff_delete'
                        )

                        .setPlaceholder(
                            edit
                                ? 'Staff à modifier'
                                : 'Staff à retirer'
                        )

                        .addOptions(
                            options
                        );


                await interaction.reply({

                    content:
                        edit
                            ? '✏️ Choisis le Staff à modifier :'
                            : '🗑️ Choisis le Staff à retirer :',

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
// MODIFIER EMOJI STAFF
// ======================================================

            if (
                interaction.isStringSelectMenu() &&
                interaction.customId ===
                    'select_ticket_staff_edit'
            ) {

                const userId =
                    interaction.values[0];


                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const infos =
                    config.tickets.staffMembers[
                        userId
                    ];


                if (
                    !infos
                ) {

                    return;

                }


                const modal =
                    new ModalBuilder()

                        .setCustomId(
                            `modal_ticket_staff_edit_${userId}`
                        )

                        .setTitle(
                            'Modifier emoji Staff'
                        );


                const emoji =
                    new TextInputBuilder()

                        .setCustomId(
                            'staff_emoji_edit'
                        )

                        .setLabel(
                            'Nouvel emoji'
                        )

                        .setValue(
                            emojiStaffValide(
                                infos.emoji
                            )
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
                            emoji
                        )

                );


                await interaction.showModal(
                    modal
                );


                return;

            }


            if (
                interaction.isModalSubmit() &&
                interaction.customId.startsWith(
                    'modal_ticket_staff_edit_'
                )
            ) {

                const userId =
                    interaction.customId.replace(
                        'modal_ticket_staff_edit_',
                        ''
                    );


                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                if (
                    !config.tickets.staffMembers[
                        userId
                    ]
                ) {

                    return;

                }


                config.tickets.staffMembers[
                    userId
                ].emoji =
                    emojiStaffValide(

                        interaction.fields
                            .getTextInputValue(
                                'staff_emoji_edit'
                            )

                    );


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.reply({

                    content:
                        `✅ Emoji de <@${userId}> modifié sur **${interaction.guild.name}**.`,

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


// ======================================================
// RETIRER STAFF
// ======================================================

            if (
                interaction.isStringSelectMenu() &&
                interaction.customId ===
                    'select_ticket_staff_delete'
            ) {

                const userId =
                    interaction.values[0];


                const ligne =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    `confirm_ticket_staff_delete_${userId}`
                                )

                                .setLabel(
                                    'Confirmer'
                                )

                                .setEmoji(
                                    '🗑️'
                                )

                                .setStyle(
                                    ButtonStyle.Danger
                                ),


                            new ButtonBuilder()

                                .setCustomId(
                                    'cancel_ticket_staff_delete'
                                )

                                .setLabel(
                                    'Annuler'
                                )

                                .setStyle(
                                    ButtonStyle.Secondary
                                )

                        );


                await interaction.update({

                    content:
                        `⚠️ Retirer <@${userId}> des Staffs Tickets de **${interaction.guild.name}** ?`,

                    components: [
                        ligne
                    ]

                });


                return;

            }


            if (
                interaction.isButton() &&
                interaction.customId.startsWith(
                    'confirm_ticket_staff_delete_'
                )
            ) {

                const userId =
                    interaction.customId.replace(
                        'confirm_ticket_staff_delete_',
                        ''
                    );


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
                        `✅ <@${userId}> retiré des Staffs Tickets de **${interaction.guild.name}**.`,

                    components:
                        []

                });


                return;

            }


            if (
                interaction.isButton() &&
                interaction.customId ===
                    'cancel_ticket_staff_delete'
            ) {

                await interaction.update({

                    content:
                        '❌ Suppression annulée.',

                    components:
                        []

                });


                return;

            }


// ======================================================
// AJOUTER TYPE TICKET
// ======================================================

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
                            'ticket_name'
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
                        );


                const emoji =
                    new TextInputBuilder()

                        .setCustomId(
                            'ticket_emoji'
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
                            false
                        );


                const description =
                    new TextInputBuilder()

                        .setCustomId(
                            'ticket_description'
                        )

                        .setLabel(
                            'Description'
                        )

                        .setPlaceholder(
                            'Ex : Ouvrir une candidature'
                        )

                        .setStyle(
                            TextInputStyle.Paragraph
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            100
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
                            description
                        )

                );


                await interaction.showModal(
                    modal
                );


                return;

            }


// ======================================================
// SAUVEGARDER TYPE TICKET
// ======================================================

            if (
                interaction.isModalSubmit() &&
                interaction.customId ===
                    'modal_ticket_type_add'
            ) {

                const nom =
                    interaction.fields
                        .getTextInputValue(
                            'ticket_name'
                        );


                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                let id =
                    creerSlug(
                        nom
                    );


                if (
                    !id
                ) {

                    id =
                        `ticket-${Date.now()}`;

                }


                if (
                    config.tickets.types[
                        id
                    ]
                ) {

                    id =
                        `${id}-${Date.now()}`;

                }


                config.tickets.types[
                    id
                ] = {

                    name:
                        nom,

                    emoji:
                        emojiValide(

                            interaction.fields
                                .getTextInputValue(
                                    'ticket_emoji'
                                )

                        ),

                    description:
                        interaction.fields
                            .getTextInputValue(
                                'ticket_description'
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
                            `ticket_new_category_${id}`
                        )

                        .setPlaceholder(
                            `Catégorie pour ${nom}`
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
                        `✅ Type **${config.tickets.types[id].emoji} ${nom}** créé sur **${interaction.guild.name}**.\n\nChoisis maintenant sa catégorie :`,

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
// CATÉGORIE NOUVEAU TYPE
// ======================================================

            if (
                interaction.isChannelSelectMenu() &&
                interaction.customId.startsWith(
                    'ticket_new_category_'
                )
            ) {

                const id =
                    interaction.customId.replace(
                        'ticket_new_category_',
                        ''
                    );


                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                if (
                    !config.tickets.types[
                        id
                    ]
                ) {

                    return;

                }


                config.tickets.types[
                    id
                ].categoryId =
                    interaction.values[0];


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.update({

                    content:
                        `✅ Catégorie enregistrée : <#${interaction.values[0]}>`,

                    components:
                        []

                });


                return;

            }


// ======================================================
// MODIFIER / SUPPRIMER TYPE
// ======================================================

            if (
                interaction.isButton() &&
                [
                    'ticket_type_edit',
                    'ticket_type_delete'
                ].includes(
                    interaction.customId
                )
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
                            '❌ Aucun type disponible sur ce serveur.',

                        flags:
                            MessageFlags.Ephemeral

                    });


                    return;

                }


                const edit =
                    interaction.customId ===
                    'ticket_type_edit';


                const options =
                    types
                        .slice(
                            0,
                            25
                        )
                        .map(
                            ([id, type]) => ({

                                label:
                                    `${emojiValide(type.emoji)} ${type.name}`
                                        .slice(
                                            0,
                                            100
                                        ),

                                description:
                                    edit
                                        ? (
                                            type.description ||
                                            'Ticket'
                                        ).slice(
                                            0,
                                            100
                                        )
                                        : undefined,

                                value:
                                    id

                            })
                        );


                const menu =
                    new StringSelectMenuBuilder()

                        .setCustomId(
                            edit
                                ? 'select_ticket_type_edit'
                                : 'select_ticket_type_delete'
                        )

                        .setPlaceholder(
                            edit
                                ? 'Choisis le type'
                                : 'Type à supprimer'
                        )

                        .addOptions(
                            options
                        );


                await interaction.reply({

                    content:
                        edit
                            ? '✏️ Choisis le type à modifier :'
                            : '🗑️ Choisis le type à supprimer :',

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
// MODIFIER TYPE
// ======================================================

            if (
                interaction.isStringSelectMenu() &&
                interaction.customId ===
                    'select_ticket_type_edit'
            ) {

                const id =
                    interaction.values[0];


                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const type =
                    config.tickets.types[
                        id
                    ];


                if (
                    !type
                ) {

                    return;

                }


                const modal =
                    new ModalBuilder()

                        .setCustomId(
                            `modal_ticket_type_edit_${id}`
                        )

                        .setTitle(
                            'Modifier type'
                        );


                const nom =
                    new TextInputBuilder()

                        .setCustomId(
                            'ticket_name_edit'
                        )

                        .setLabel(
                            'Nom'
                        )

                        .setValue(
                            type.name
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        );


                const emoji =
                    new TextInputBuilder()

                        .setCustomId(
                            'ticket_emoji_edit'
                        )

                        .setLabel(
                            'Emoji'
                        )

                        .setValue(
                            emojiValide(
                                type.emoji
                            )
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            false
                        );


                const description =
                    new TextInputBuilder()

                        .setCustomId(
                            'ticket_description_edit'
                        )

                        .setLabel(
                            'Description'
                        )

                        .setValue(
                            type.description ||
                            ''
                        )

                        .setStyle(
                            TextInputStyle.Paragraph
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            100
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
                            description
                        )

                );


                await interaction.showModal(
                    modal
                );


                return;

            }


            if (
                interaction.isModalSubmit() &&
                interaction.customId.startsWith(
                    'modal_ticket_type_edit_'
                )
            ) {

                const id =
                    interaction.customId.replace(
                        'modal_ticket_type_edit_',
                        ''
                    );


                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const type =
                    config.tickets.types[
                        id
                    ];


                if (
                    !type
                ) {

                    return;

                }


                type.name =
                    interaction.fields
                        .getTextInputValue(
                            'ticket_name_edit'
                        );


                type.emoji =
                    emojiValide(

                        interaction.fields
                            .getTextInputValue(
                                'ticket_emoji_edit'
                            )

                    );


                type.description =
                    interaction.fields
                        .getTextInputValue(
                            'ticket_description_edit'
                        );


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                const menu =
                    new ChannelSelectMenuBuilder()

                        .setCustomId(
                            `ticket_edit_category_${id}`
                        )

                        .setPlaceholder(
                            'Choisir la catégorie'
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
                        `✅ **${type.emoji} ${type.name}** modifié sur **${interaction.guild.name}**.\n\nTu peux aussi changer sa catégorie :`,

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
                interaction.customId.startsWith(
                    'ticket_edit_category_'
                )
            ) {

                const id =
                    interaction.customId.replace(
                        'ticket_edit_category_',
                        ''
                    );


                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                if (
                    !config.tickets.types[
                        id
                    ]
                ) {

                    return;

                }


                config.tickets.types[
                    id
                ].categoryId =
                    interaction.values[0];


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.update({

                    content:
                        `✅ Nouvelle catégorie : <#${interaction.values[0]}>`,

                    components:
                        []

                });


                return;

            }


// ======================================================
// SUPPRIMER TYPE
// ======================================================

            if (
                interaction.isStringSelectMenu() &&
                interaction.customId ===
                    'select_ticket_type_delete'
            ) {

                const id =
                    interaction.values[0];


                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const type =
                    config.tickets.types[
                        id
                    ];


                if (
                    !type
                ) {

                    return;

                }


                const ligne =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    `confirm_delete_ticket_type_${id}`
                                )

                                .setLabel(
                                    'Confirmer'
                                )

                                .setEmoji(
                                    '🗑️'
                                )

                                .setStyle(
                                    ButtonStyle.Danger
                                )

                        );


                await interaction.update({

                    content:
                        `⚠️ Supprimer **${emojiValide(type.emoji)} ${type.name}** de **${interaction.guild.name}** ?`,

                    components: [
                        ligne
                    ]

                });


                return;

            }


            if (
                interaction.isButton() &&
                interaction.customId.startsWith(
                    'confirm_delete_ticket_type_'
                )
            ) {

                const id =
                    interaction.customId.replace(
                        'confirm_delete_ticket_type_',
                        ''
                    );


                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const type =
                    config.tickets.types[
                        id
                    ];


                if (
                    !type
                ) {

                    return;

                }


                delete config.tickets.types[
                    id
                ];


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.update({

                    content:
                        `✅ ${emojiValide(type.emoji)} ${type.name} supprimé de **${interaction.guild.name}**.`,

                    components:
                        []

                });


                return;

            }


// ======================================================
// /TICKET-PANEL
// ======================================================

            if (
                interaction.isChatInputCommand() &&
                interaction.commandName ===
                    'ticket-panel'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const panel =
                    config.tickets.panel;


                const embed =
                    new EmbedBuilder()

                        .setColor(
                            couleurValide(
                                panel.color,
                                '#F47B20'
                            )
                        )

                        .setTitle(
                            panel.title
                        )

                        .setDescription(
                            panel.description
                        );


                if (
                    panel.footer
                ) {

                    embed.setFooter({

                        text:
                            panel.footer

                    });

                }


                const bouton =
                    new ButtonBuilder()

                        .setCustomId(
                            'ouvrir_ticket'
                        )

                        .setLabel(
                            panel.buttonLabel
                        )

                        .setEmoji(
                            '🎫'
                        )

                        .setStyle(
                            ButtonStyle.Primary
                        );


                await interaction.reply({

                    content:
                        '✅ Panneau créé sur ce serveur.',

                    flags:
                        MessageFlags.Ephemeral

                });


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


                return;

            }


// ======================================================
// OUVRIR MENU TICKET
// ======================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'ouvrir_ticket'
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
                            '❌ Aucun type de ticket disponible sur ce serveur.',

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
                                    `${emojiValide(type.emoji)} ${type.name}`
                                        .slice(
                                            0,
                                            100
                                        ),

                                description:
                                    (
                                        type.description ||
                                        'Demande de support'
                                    )
                                        .slice(
                                            0,
                                            100
                                        ),

                                value:
                                    id

                            })
                        );


                const menu =
                    new StringSelectMenuBuilder()

                        .setCustomId(
                            'choix_ticket'
                        )

                        .setPlaceholder(
                            'Sélectionne ton type de demande'
                        )

                        .addOptions(
                            options
                        );


                await interaction.reply({

                    content:
                        '🎫 **Quel type de support souhaites-tu contacter ?**',

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
// CRÉER TICKET
// ======================================================

            if (
                interaction.isStringSelectMenu() &&
                interaction.customId ===
                    'choix_ticket'
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


                if (
                    !config.tickets.staffRoleId
                ) {

                    await interaction.update({

                        content:
                            '❌ Aucun rôle Staff configuré sur ce serveur.',

                        components:
                            []

                    });


                    return;

                }


                if (
                    !type.categoryId
                ) {

                    await interaction.update({

                        content:
                            `❌ Aucune catégorie configurée pour **${type.name}**.`,

                        components:
                            []

                    });


                    return;

                }


                const ticketExistant =
                    interaction.guild.channels.cache
                        .find(
                            channel =>
                                channel.topic?.includes(
                                    `ticket-owner:${interaction.user.id}`
                                )
                        );


                if (
                    ticketExistant
                ) {

                    await interaction.update({

                        content:
                            `❌ Tu as déjà un ticket ouvert sur ce serveur : ${ticketExistant}`,

                        components:
                            []

                    });


                    return;

                }


                const pseudo =
                    creerSlug(
                        interaction.user.username
                    ) ||
                    'membre';


                const ticketChannel =
                    await interaction.guild.channels.create({

                        name:
                            `ticket-${creerSlug(type.name)}-${pseudo}`,

                        type:
                            ChannelType.GuildText,

                        parent:
                            type.categoryId,

                        topic:
                            `ticket-owner:${interaction.user.id};ticket-type:${typeId}`,

                        permissionOverwrites: [

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
                                    config.tickets.staffRoleId,

                                allow: [
                                    PermissionFlagsBits.ViewChannel,
                                    PermissionFlagsBits.SendMessages,
                                    PermissionFlagsBits.ReadMessageHistory,
                                    PermissionFlagsBits.AttachFiles,
                                    PermissionFlagsBits.EmbedLinks,
                                    PermissionFlagsBits.ManageMessages
                                ]
                            }

                        ]

                    });


                const e =
                    config.tickets.ticketEmbed;


                const embed =
                    new EmbedBuilder()

                        .setColor(
                            couleurValide(
                                e.color,
                                '#F47B20'
                            )
                        )

                        .setTitle(
                            remplacerVariablesTicket(
                                e.title,
                                interaction,
                                type
                            )
                        )

                        .setDescription(
                            remplacerVariablesTicket(
                                e.description,
                                interaction,
                                type
                            )
                        )

                        .setTimestamp();


                if (
                    e.footer
                ) {

                    embed.setFooter({

                        text:
                            e.footer

                    });

                }


                if (
                    e.showAvatar
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


                const boutons =
                    new ActionRowBuilder()

                        .addComponents(

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
                                    ButtonStyle.Primary
                                ),


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
                                )

                        );


                await ticketChannel.send({

                    content:
                        `${interaction.user} <@&${config.tickets.staffRoleId}>`,

                    embeds: [
                        embed
                    ],

                    components: [
                        boutons
                    ]

                });


                await interaction.update({

                    content:
                        `✅ Ton ticket a été créé : ${ticketChannel}`,

                    components:
                        []

                });


                const logs =
                    interaction.guild.channels.cache.get(
                        config.tickets.logsChannelId
                    );


                if (
                    logs
                ) {

                    await logs.send({

                        embeds: [

                            new EmbedBuilder()

                                .setColor(
                                    '#57F287'
                                )

                                .setTitle(
                                    '🎫 Ticket ouvert'
                                )

                                .addFields(

                                    {
                                        name:
                                            'Membre',

                                        value:
                                            `${interaction.user}`,

                                        inline:
                                            true
                                    },

                                    {
                                        name:
                                            'Type',

                                        value:
                                            `${emojiValide(type.emoji)} ${type.name}`,

                                        inline:
                                            true
                                    },

                                    {
                                        name:
                                            'Salon',

                                        value:
                                            `${ticketChannel}`
                                    }

                                )

                                .setTimestamp()

                        ]

                    });

                }


                return;

            }


// ======================================================
// CLAIM TICKET
// ======================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'ticket_claim'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                if (
                    !interaction.member.roles.cache.has(
                        config.tickets.staffRoleId
                    )
                ) {

                    await interaction.reply({

                        content:
                            '❌ Seul le Staff de ce serveur peut prendre en charge ce ticket.',

                        flags:
                            MessageFlags.Ephemeral

                    });


                    return;

                }


                const claim =
                    interaction.channel.topic
                        ?.match(
                            /ticket-claim:(\d+)/
                        );


                if (
                    claim
                ) {

                    await interaction.reply({

                        content:
                            `❌ Ce ticket est déjà pris en charge par <@${claim[1]}>.`,

                        flags:
                            MessageFlags.Ephemeral

                    });


                    return;

                }


                await interaction.channel.setTopic(

                    `${interaction.channel.topic || ''};ticket-claim:${interaction.user.id}`

                );


                const emoji =
                    emojiStaffValide(

                        config.tickets.staffMembers[
                            interaction.user.id
                        ]?.emoji

                    );


                try {

                    if (
                        !interaction.channel.name
                            .startsWith(
                                `${emoji}-`
                            )
                    ) {

                        await interaction.channel.setName(

                            `${emoji}-${interaction.channel.name}`

                        );

                    }

                }

                catch (error) {

                    console.error(
                        '⚠️ Impossible de renommer le ticket :',
                        error
                    );

                }


                await interaction.reply({

                    embeds: [

                        new EmbedBuilder()

                            .setColor(
                                '#F47B20'
                            )

                            .setDescription(
                                `${emoji} ${interaction.user} a pris en charge ce ticket.`
                            )

                            .setTimestamp()

                    ]

                });


                return;

            }


// ======================================================
// FERMER TICKET
// ======================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'ticket_close'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                const estStaff =
                    interaction.member.roles.cache.has(
                        config.tickets.staffRoleId
                    );


                const ownerId =
                    interaction.channel.topic
                        ?.match(
                            /ticket-owner:(\d+)/
                        )?.[1] ||
                    null;


                const claimStaffId =
                    interaction.channel.topic
                        ?.match(
                            /ticket-claim:(\d+)/
                        )?.[1] ||
                    null;


                if (
                    !estStaff &&
                    ownerId !==
                    interaction.user.id
                ) {

                    await interaction.reply({

                        content:
                            '❌ Tu ne peux pas fermer ce ticket.',

                        flags:
                            MessageFlags.Ephemeral

                    });


                    return;

                }


                await interaction.reply({

                    content:
                        '📄 Génération du transcript et fermeture du ticket...',

                    flags:
                        MessageFlags.Ephemeral

                });


                const transcript =
                    await genererTranscript(
                        interaction.channel
                    );


                const nomFichier =
                    `transcript-${interaction.channel.name}.txt`;


                let proprietaire =
                    null;


                if (
                    ownerId
                ) {

                    try {

                        proprietaire =
                            await client.users.fetch(
                                ownerId
                            );

                    }

                    catch (_) {}

                }


                const salonLogs =
                    interaction.guild.channels.cache.get(
                        config.tickets.logsChannelId
                    );


                if (
                    salonLogs
                ) {

                    const logEmbed =
                        new EmbedBuilder()

                            .setColor(
                                '#ED4245'
                            )

                            .setTitle(
                                '🔒 Ticket fermé'
                            )

                            .setDescription(
                                'Le transcript complet du ticket est disponible ci-dessous.'
                            )

                            .addFields(

                                {
                                    name:
                                        '🎫 Ticket',

                                    value:
                                        `#${interaction.channel.name}`,

                                    inline:
                                        true
                                },

                                {
                                    name:
                                        '👤 Ouvert par',

                                    value:
                                        proprietaire
                                            ? `<@${proprietaire.id}>`
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
                                            : '❌ Non pris en charge',

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
                                }

                            )

                            .setTimestamp();


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


// ======================================================
// DM TRANSCRIPT
// ======================================================

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

                    catch (_) {}

                }


                if (
                    !dmEnvoye &&
                    salonLogs
                ) {

                    await salonLogs.send({

                        content:
                            `⚠️ Impossible d'envoyer le transcript en DM à ${
                                proprietaire
                                    ? `<@${proprietaire.id}>`
                                    : 'l’utilisateur'
                            }.`

                    });

                }


                await interaction.channel.send({

                    content:
                        '🔒 **Ticket fermé.**\n' +
                        '📄 Le transcript a été sauvegardé.\n' +
                        '🗑️ Suppression du salon dans **5 secondes**...'

                });


                setTimeout(

                    () =>

                        interaction.channel
                            .delete(
                                `Ticket fermé par ${interaction.user.tag}`
                            )
                            .catch(
                                console.error
                            ),

                    5000

                );


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
// SALON ANNONCES
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
                        `✅ Salon d'annonces de **${interaction.guild.name}** : <#${interaction.values[0]}>`,

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
                            config.annonces.color
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
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
                            ' '
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
                            ),

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
                            '❌ Configure d’abord le salon des annonces de ce serveur.',

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
                        );


                const message =
                    interaction.fields
                        .getTextInputValue(
                            'annonce_message'
                        );


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
// MENTION ANNONCE : AUCUNE / EVERYONE
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
                            '❌ Cette annonce n’est plus disponible ou appartient à un autre serveur.',

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
// MENTION ROLE ANNONCE
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
                        '👥 Choisis le rôle de ce serveur :',

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
                        `✅ L'annonce mentionnera <@&${interaction.values[0]}> sur **${interaction.guild.name}**.`,

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
                            '❌ Cette annonce n’est plus disponible ou appartient à un autre serveur.',

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
                            '❌ Salon d’annonces introuvable sur ce serveur.',

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


                let content;


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


                await salon.send({

                    content:
                        content,

                    embeds: [
                        embed
                    ],

                    allowedMentions:
                        allowedMentions

                });


                annoncesEnAttente.delete(
                    annonceId
                );


                await interaction.update({

                    content:
                        `✅ Annonce publiée dans ${salon} sur **${interaction.guild.name}**.`,

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
                        `✅ Salon Streams de **${interaction.guild.name}** : <#${interaction.values[0]}>`,

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
                        config.streams.streamers
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
                        config,
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
                        `✅ **${streamer.displayName || streamer.login}** supprimé de la surveillance Twitch de **${interaction.guild.name}**.`,

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
                            e.title
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
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
                            e.description
                        )

                        .setStyle(
                            TextInputStyle.Paragraph
                        )

                        .setRequired(
                            true
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
                            e.color
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
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
                            ' '
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            false
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
                        );


                config.streams.embed.description =
                    interaction.fields
                        .getTextInputValue(
                            'stream_embed_description'
                        );


                config.streams.embed.color =
                    couleurValide(

                        interaction.fields
                            .getTextInputValue(
                                'stream_embed_color'
                            ),

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
                        `✅ Embed Twitch de **${interaction.guild.name}** modifié.\n\nVariables disponibles : \`{streamer}\`, \`{login}\`, \`{title}\`, \`{game}\`, \`{viewers}\``,

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

        }

        catch (error) {

            console.error(
                '❌ Erreur interaction :',
                error
            );


            try {

                if (
                    interaction.deferred ||
                    interaction.replied
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

            catch (_) {}

        }

    }
);


// ======================================================
// DÉMARRAGE
// ======================================================

async function demarrerBot() {

    try {

        await enregistrerCommandes();


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


demarrerBot();