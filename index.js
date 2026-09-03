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
const SERVEUR_ID = '1544812678843736076';


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


function configBase() {

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

            goodbyeTitle:
                'Un membre vient de partir... 😢',

            goodbyeMessage:
                'À bientôt **{username}** 👋',

            goodbyeColor:
                '#ED4245',

            goodbyeShowAvatar:
                true

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
// CHARGER CONFIG
// ======================================================

function chargerConfig() {

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


        return fusionnerDefauts(
            config,
            configBase()
        );

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
// SAUVEGARDER CONFIG
// ======================================================

function sauvegarderConfig(
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
        '                 TRANSCRIPT TICKET - LE REFUGE FR\n';

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
            'TWITCH_CLIENT_ID ou TWITCH_CLIENT_SECRET manquant dans le .env'
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
            'Salon Streams introuvable.'
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
// VÉRIFICATION ONLINE / OFFLINE
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

        const guild =

            client.guilds.cache.get(
                SERVEUR_ID
            )

            ||

            await client.guilds.fetch(
                SERVEUR_ID
            )
                .catch(
                    () => null
                );


        if (
            !guild
        ) {

            return;

        }


        const config =
            chargerConfig();


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
                        `🔴 Twitch ONLINE : ${streamer.login}`
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
                        `⚫ Twitch OFFLINE : ${streamer.login}`
                    );

                }

            }

        }


        if (
            modifie
        ) {

            sauvegarderConfig(
                config
            );

        }

    }

    catch (error) {

        console.error(
            '❌ Vérification Twitch :',
            error.message
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

function creerEmbedConfigTickets() {

    const config =
        chargerConfig();


    const embed =
        new EmbedBuilder()

            .setColor(
                '#F47B20'
            )

            .setTitle(
                '🎫 CONFIGURATION // TICKETS'
            )

            .setDescription(
                'Gère entièrement le système de tickets depuis Discord.'
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

function creerEmbedConfigBienvenue() {

    const config =
        chargerConfig();


    return new EmbedBuilder()

        .setColor(
            '#F47B20'
        )

        .setTitle(
            '👋 CONFIGURATION // BIENVENUE & DÉPART'
        )

        .setDescription(
            'Configure les messages d’arrivée et de départ directement depuis Discord.'
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
            }

        );

}


// ======================================================
// EMBED CONFIG ANNONCES
// ======================================================

function creerEmbedConfigAnnonces() {

    const config =
        chargerConfig();


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
            'Crée et publie les annonces du serveur directement depuis Discord.'
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

function creerEmbedConfigStreams() {

    const config =
        chargerConfig();


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
            'Le bot annonce automatiquement les lives Twitch et supprime l’annonce quand le live est terminé.'
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
// ENREGISTRER COMMANDES
// ======================================================

async function enregistrerCommandes() {

    try {

        console.log(
            '⚙️ Installation des commandes...'
        );


        await rest.put(

            Routes.applicationGuildCommands(
                CLIENT_ID,
                SERVEUR_ID
            ),

            {

                body:
                    commands

            }

        );


        console.log(
            '✅ Commandes installées.'
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
    'clientReady',
    async () => {

        console.log(
            '================================='
        );

        console.log(
            `✅ BOT CONNECTÉ : ${client.user.tag}`
        );

        console.log(
            '🟠 BOTTEST // SYSTÈME ACTIF'
        );

        console.log(
            '================================='
        );


        const config =
            chargerConfig();


        const secondes =
            Math.max(

                30,

                Number(
                    config.streams.checkInterval
                ) ||
                60

            );


        await verifierStreams();


        setInterval(

            verifierStreams,

            secondes *
            1000

        );


        console.log(
            `🔴 Twitch : vérification toutes les ${secondes}s`
        );

    }
);


// ======================================================
// BIENVENUE
// ======================================================

client.on(
    'guildMemberAdd',
    async member => {

        const config =
            chargerConfig();


        if (
            !config.welcome.welcomeEnabled
        ) {

            return;

        }


        const salon =
            member.guild.channels.cache.get(
                config.welcome.welcomeChannelId
            );


        if (
            !salon
        ) {

            return;

        }


        try {

            const imagePath =
                path.join(
                    __dirname,
                    'assets',
                    'welcome.png'
                );


            const files =
                [];


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
                fs.existsSync(
                    imagePath
                )
            ) {

                files.push(

                    new AttachmentBuilder(

                        imagePath,

                        {

                            name:
                                'welcome.png'

                        }

                    )

                );


                embed.setImage(
                    'attachment://welcome.png'
                );

            }


            await salon.send({

                embeds: [
                    embed
                ],

                files:
                    files

            });

        }

        catch (error) {

            console.error(
                '❌ Erreur bienvenue :',
                error
            );

        }

    }
);


// ======================================================
// DÉPART
// ======================================================

client.on(
    'guildMemberRemove',
    async member => {

        const config =
            chargerConfig();


        if (
            !config.welcome.goodbyeEnabled
        ) {

            return;

        }


        const salon =
            member.guild.channels.cache.get(
                config.welcome.goodbyeChannelId
            );


        if (
            !salon
        ) {

            return;

        }


        try {

            const imagePath =
                path.join(
                    __dirname,
                    'assets',
                    'goodbye.png'
                );


            const files =
                [];


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
                fs.existsSync(
                    imagePath
                )
            ) {

                files.push(

                    new AttachmentBuilder(

                        imagePath,

                        {

                            name:
                                'goodbye.png'

                        }

                    )

                );


                embed.setImage(
                    'attachment://goodbye.png'
                );

            }


            await salon.send({

                embeds: [
                    embed
                ],

                files:
                    files

            });

        }

        catch (error) {

            console.error(
                '❌ Erreur départ :',
                error
            );

        }

    }
);


// ======================================================
// INTERACTIONS
// ======================================================

client.on(
    Events.InteractionCreate,
    async interaction => {

        try {


// ======================================================
// /BOT-PANEL
// ======================================================

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
                            'Sélectionne le module à configurer.'
                        );


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
                                .setEmoji('📥')
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
                                .setEmoji('📤')
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
                                .setEmoji('📥')
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
                                .setEmoji('📤')
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
                                .setEmoji('✏️')
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
                                .setEmoji('✏️')
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
                                .setEmoji('🖼️')
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
                                .setEmoji('🖼️')
                                .setStyle(
                                    ButtonStyle.Secondary
                                )

                        );


                await interaction.update({

                    embeds: [
                        creerEmbedConfigBienvenue()
                    ],

                    components: [
                        r1,
                        r2,
                        r3,
                        r4
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
                    chargerConfig();


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


                sauvegarderConfig(
                    config
                );


                await interaction.update({

                    embeds: [
                        creerEmbedConfigBienvenue()
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
                            ? '📥 Choisis le salon arrivée :'
                            : '📤 Choisis le salon départ :',

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
                [
                    'select_welcome_channel',
                    'select_goodbye_channel'
                ].includes(
                    interaction.customId
                )
            ) {

                const config =
                    chargerConfig();


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


                sauvegarderConfig(
                    config
                );


                await interaction.update({

                    content:
                        `✅ Salon ${
                            isWelcome
                                ? 'arrivée'
                                : 'départ'
                        } : <#${interaction.values[0]}>`,

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
                    chargerConfig();


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
                    chargerConfig();


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


                sauvegarderConfig(
                    config
                );


                await interaction.reply({

                    content:
                        `✅ Message ${
                            isWelcome
                                ? 'd’arrivée'
                                : 'de départ'
                        } modifié.`,

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


// ======================================================
// PANEL TICKETS
// ======================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'admin_tickets'
            ) {

                const r1 =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()
                                .setCustomId(
                                    'config_staff_role'
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
                                    'config_ticket_logs'
                                )
                                .setLabel(
                                    'Salon Logs'
                                )
                                .setEmoji(
                                    '📜'
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
                                    'ticket_type_add'
                                )
                                .setLabel(
                                    'Ajouter type'
                                )
                                .setEmoji(
                                    '➕'
                                )
                                .setStyle(
                                    ButtonStyle.Success
                                ),

                            new ButtonBuilder()
                                .setCustomId(
                                    'ticket_type_edit'
                                )
                                .setLabel(
                                    'Modifier type'
                                )
                                .setEmoji(
                                    '✏️'
                                )
                                .setStyle(
                                    ButtonStyle.Secondary
                                ),

                            new ButtonBuilder()
                                .setCustomId(
                                    'ticket_type_delete'
                                )
                                .setLabel(
                                    'Supprimer type'
                                )
                                .setEmoji(
                                    '🗑️'
                                )
                                .setStyle(
                                    ButtonStyle.Danger
                                )

                        );


                const r3 =
                    new ActionRowBuilder()

                        .addComponents(

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
                                    'ticket_staff_edit'
                                )
                                .setLabel(
                                    'Modifier emoji'
                                )
                                .setEmoji(
                                    '✏️'
                                )
                                .setStyle(
                                    ButtonStyle.Secondary
                                ),

                            new ButtonBuilder()
                                .setCustomId(
                                    'ticket_staff_delete'
                                )
                                .setLabel(
                                    'Retirer Staff'
                                )
                                .setEmoji(
                                    '🗑️'
                                )
                                .setStyle(
                                    ButtonStyle.Danger
                                )

                        );


                const r4 =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()
                                .setCustomId(
                                    'ticket_panel_edit'
                                )
                                .setLabel(
                                    'Modifier Panel'
                                )
                                .setEmoji(
                                    '🎨'
                                )
                                .setStyle(
                                    ButtonStyle.Secondary
                                ),

                            new ButtonBuilder()
                                .setCustomId(
                                    'ticket_embed_edit'
                                )
                                .setLabel(
                                    'Modifier Embed'
                                )
                                .setEmoji(
                                    '📝'
                                )
                                .setStyle(
                                    ButtonStyle.Secondary
                                ),

                            new ButtonBuilder()
                                .setCustomId(
                                    'ticket_embed_avatar_toggle'
                                )
                                .setLabel(
                                    'Avatar Embed'
                                )
                                .setEmoji(
                                    '🖼️'
                                )
                                .setStyle(
                                    ButtonStyle.Secondary
                                )

                        );


                await interaction.update({

                    embeds: [
                        creerEmbedConfigTickets()
                    ],

                    components: [
                        r1,
                        r2,
                        r3,
                        r4
                    ]

                });


                return;

            }


// ======================================================
// CONFIG ROLE STAFF
// ======================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'config_staff_role'
            ) {

                const menu =
                    new RoleSelectMenuBuilder()

                        .setCustomId(
                            'select_staff_role'
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
                        '🛡️ Sélectionne le rôle Staff :',

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
                interaction.customId ===
                    'select_staff_role'
            ) {

                const config =
                    chargerConfig();


                config.tickets.staffRoleId =
                    interaction.values[0];


                sauvegarderConfig(
                    config
                );


                await interaction.update({

                    content:
                        `✅ Rôle Staff : <@&${interaction.values[0]}>`,

                    components:
                        []

                });


                return;

            }


// ======================================================
// CONFIG LOGS
// ======================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'config_ticket_logs'
            ) {

                const menu =
                    new ChannelSelectMenuBuilder()

                        .setCustomId(
                            'select_ticket_logs'
                        )

                        .setPlaceholder(
                            'Choisis le salon Logs'
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
                        '📜 Choisis le salon des logs :',

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
                    'select_ticket_logs'
            ) {

                const config =
                    chargerConfig();


                config.tickets.logsChannelId =
                    interaction.values[0];


                sauvegarderConfig(
                    config
                );


                await interaction.update({

                    content:
                        `✅ Salon Logs : <#${interaction.values[0]}>`,

                    components:
                        []

                });


                return;

            }


// ======================================================
// MODIFIER PANEL TICKET
// ======================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'ticket_panel_edit'
            ) {

                const config =
                    chargerConfig();


                const modal =
                    new ModalBuilder()

                        .setCustomId(
                            'modal_ticket_panel_edit'
                        )

                        .setTitle(
                            'Modifier Panel Ticket'
                        );


                const titre =
                    new TextInputBuilder()

                        .setCustomId(
                            'panel_title'
                        )

                        .setLabel(
                            'Titre'
                        )

                        .setValue(
                            config.tickets.panel.title
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
                            'panel_description'
                        )

                        .setLabel(
                            'Description'
                        )

                        .setValue(
                            config.tickets.panel.description
                        )

                        .setStyle(
                            TextInputStyle.Paragraph
                        )

                        .setRequired(
                            true
                        );


                const bouton =
                    new TextInputBuilder()

                        .setCustomId(
                            'panel_button'
                        )

                        .setLabel(
                            'Texte du bouton'
                        )

                        .setValue(
                            config.tickets.panel.buttonLabel
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        );


                const couleur =
                    new TextInputBuilder()

                        .setCustomId(
                            'panel_color'
                        )

                        .setLabel(
                            'Couleur HEX'
                        )

                        .setValue(
                            config.tickets.panel.color
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
                            'panel_footer'
                        )

                        .setLabel(
                            'Footer'
                        )

                        .setValue(
                            config.tickets.panel.footer ||
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


            if (
                interaction.isModalSubmit() &&
                interaction.customId ===
                    'modal_ticket_panel_edit'
            ) {

                const config =
                    chargerConfig();


                config.tickets.panel.title =
                    interaction.fields
                        .getTextInputValue(
                            'panel_title'
                        );


                config.tickets.panel.description =
                    interaction.fields
                        .getTextInputValue(
                            'panel_description'
                        );


                config.tickets.panel.buttonLabel =
                    interaction.fields
                        .getTextInputValue(
                            'panel_button'
                        );


                config.tickets.panel.color =
                    couleurValide(

                        interaction.fields
                            .getTextInputValue(
                                'panel_color'
                            ),

                        '#F47B20'

                    );


                config.tickets.panel.footer =
                    interaction.fields
                        .getTextInputValue(
                            'panel_footer'
                        )
                        .trim();


                sauvegarderConfig(
                    config
                );


                await interaction.reply({

                    content:
                        '✅ Panel public des tickets modifié.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


// ======================================================
// MODIFIER EMBED TICKET
// ======================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'ticket_embed_edit'
            ) {

                const config =
                    chargerConfig();


                const modal =
                    new ModalBuilder()

                        .setCustomId(
                            'modal_ticket_embed_edit'
                        )

                        .setTitle(
                            'Modifier Embed Ticket'
                        );


                const titre =
                    new TextInputBuilder()

                        .setCustomId(
                            'ticket_embed_title'
                        )

                        .setLabel(
                            'Titre'
                        )

                        .setValue(
                            config.tickets.ticketEmbed.title
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
                            'ticket_embed_description'
                        )

                        .setLabel(
                            'Description'
                        )

                        .setValue(
                            config.tickets.ticketEmbed.description
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
                            'ticket_embed_color'
                        )

                        .setLabel(
                            'Couleur HEX'
                        )

                        .setValue(
                            config.tickets.ticketEmbed.color
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
                            'ticket_embed_footer'
                        )

                        .setLabel(
                            'Footer'
                        )

                        .setValue(
                            config.tickets.ticketEmbed.footer ||
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


            if (
                interaction.isModalSubmit() &&
                interaction.customId ===
                    'modal_ticket_embed_edit'
            ) {

                const config =
                    chargerConfig();


                config.tickets.ticketEmbed.title =
                    interaction.fields
                        .getTextInputValue(
                            'ticket_embed_title'
                        );


                config.tickets.ticketEmbed.description =
                    interaction.fields
                        .getTextInputValue(
                            'ticket_embed_description'
                        );


                config.tickets.ticketEmbed.color =
                    couleurValide(

                        interaction.fields
                            .getTextInputValue(
                                'ticket_embed_color'
                            ),

                        '#F47B20'

                    );


                config.tickets.ticketEmbed.footer =
                    interaction.fields
                        .getTextInputValue(
                            'ticket_embed_footer'
                        )
                        .trim();


                sauvegarderConfig(
                    config
                );


                await interaction.reply({

                    content:
                        '✅ Embed interne des tickets modifié.',

                    flags:
                        MessageFlags.Ephemeral

                });


                return;

            }


// ======================================================
// TOGGLE AVATAR TICKET
// ======================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'ticket_embed_avatar_toggle'
            ) {

                const config =
                    chargerConfig();


                config.tickets.ticketEmbed.showAvatar =
                    !config.tickets.ticketEmbed.showAvatar;


                sauvegarderConfig(
                    config
                );


                await interaction.update({

                    embeds: [
                        creerEmbedConfigTickets()
                    ],

                    components:
                        interaction.message.components

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

                        .setMinValues(1)

                        .setMaxValues(1);


                await interaction.reply({

                    content:
                        '👥 Sélectionne le membre du Staff :',

                    components: [

                        new ActionRowBuilder()
                            .addComponents(menu)

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

                        .setRequired(true)

                        .setMaxLength(10);


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
                    chargerConfig();


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


                sauvegarderConfig(
                    config
                );


                await interaction.reply({

                    content:
                        `✅ <@${userId}> ajouté aux Staffs Tickets.`,

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
                    chargerConfig();


                const staffs =
                    Object.entries(
                        config.tickets.staffMembers
                    );


                if (
                    !staffs.length
                ) {

                    await interaction.reply({

                        content:
                            '❌ Aucun Staff personnalisé.',

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
                    chargerConfig();


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

                        .setRequired(true)

                        .setMaxLength(10);


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
                    chargerConfig();


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


                sauvegarderConfig(
                    config
                );


                await interaction.reply({

                    content:
                        `✅ Emoji de <@${userId}> modifié.`,

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
                        `⚠️ Retirer <@${userId}> des Staffs Tickets ?`,

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
                    chargerConfig();


                delete config.tickets.staffMembers[
                    userId
                ];


                sauvegarderConfig(
                    config
                );


                await interaction.update({

                    content:
                        `✅ <@${userId}> retiré des Staffs Tickets.`,

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

                        .setRequired(true);


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

                        .setRequired(false);


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

                        .setRequired(true)

                        .setMaxLength(100);


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
                    chargerConfig();


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


                sauvegarderConfig(
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

                        .setMinValues(1)

                        .setMaxValues(1);


                await interaction.reply({

                    content:
                        `✅ Type **${config.tickets.types[id].emoji} ${nom}** créé.\n\nChoisis maintenant sa catégorie :`,

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
                    chargerConfig();


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


                sauvegarderConfig(
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
                    chargerConfig();


                const types =
                    Object.entries(
                        config.tickets.types
                    );


                if (
                    !types.length
                ) {

                    await interaction.reply({

                        content:
                            '❌ Aucun type disponible.',

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
                    chargerConfig();


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

                        .setRequired(true);


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

                        .setRequired(false);


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

                        .setRequired(true)

                        .setMaxLength(100);


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
                    chargerConfig();


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


                sauvegarderConfig(
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

                        .setMinValues(1)

                        .setMaxValues(1);


                await interaction.reply({

                    content:
                        `✅ **${type.emoji} ${type.name}** modifié.\n\nTu peux aussi changer sa catégorie :`,

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
                    chargerConfig();


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


                sauvegarderConfig(
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
                    chargerConfig();


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
                        `⚠️ Supprimer **${emojiValide(type.emoji)} ${type.name}** ?`,

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
                    chargerConfig();


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


                sauvegarderConfig(
                    config
                );


                await interaction.update({

                    content:
                        `✅ ${emojiValide(type.emoji)} ${type.name} supprimé.`,

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
                    chargerConfig();


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
                        '✅ Panneau créé.',

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
                    chargerConfig();


                const types =
                    Object.entries(
                        config.tickets.types
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
                    chargerConfig();


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
                            '❌ Aucun rôle Staff configuré.',

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
                            `❌ Tu as déjà un ticket ouvert : ${ticketExistant}`,

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
                    chargerConfig();


                if (
                    !interaction.member.roles.cache.has(
                        config.tickets.staffRoleId
                    )
                ) {

                    await interaction.reply({

                        content:
                            '❌ Seul le Staff peut prendre en charge ce ticket.',

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
                    chargerConfig();


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
                                        'LE REFUGE FR • Support'

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
                        creerEmbedConfigAnnonces()
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

                        .setMinValues(1)

                        .setMaxValues(1);


                await interaction.reply({

                    content:
                        '📍 Choisis le salon des annonces :',

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
                    chargerConfig();


                config.annonces.channelId =
                    interaction.values[0];


                sauvegarderConfig(
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
                    chargerConfig();


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

                        .setRequired(true);


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

                        .setRequired(false);


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
                    chargerConfig();


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


                sauvegarderConfig(
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


// ======================================================
// CRÉER ANNONCE
// ======================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'annonce_create'
            ) {

                const config =
                    chargerConfig();


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

                        .setRequired(true);


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

                        .setRequired(true);


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

                        .setRequired(false);


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
                    chargerConfig();


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
                    `${interaction.user.id}_${Date.now()}`;


                annoncesEnAttente.set(

                    annonceId,

                    {

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
                        '👁️ **APERÇU DE TON ANNONCE**\nMention : **Aucune**',

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
// MENTION ANNONCE NONE / EVERYONE
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


                annonce.mention =
                    everyone
                        ? 'everyone'
                        : 'none';


                annonce.roleId =
                    null;


                await interaction.update({

                    content:
                        `👁️ **APERÇU DE TON ANNONCE**\nMention : **${
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
                    interaction.user.id
                ) {

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

                        .setMinValues(1)

                        .setMaxValues(1);


                await interaction.reply({

                    content:
                        '👥 Choisis le rôle :',

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
                    !annonce
                ) {

                    return;

                }


                annonce.mention =
                    'role';


                annonce.roleId =
                    interaction.values[0];


                await interaction.update({

                    content:
                        `✅ L'annonce mentionnera <@&${interaction.values[0]}>.`,

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


                const config =
                    chargerConfig();


                const salon =
                    interaction.guild.channels.cache.get(
                        config.annonces.channelId
                    );


                if (
                    !salon
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
                                    'stream_delete'
                                )

                                .setLabel(
                                    'Retirer streamer'
                                )

                                .setEmoji(
                                    '🗑️'
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
                                    'stream_embed_edit'
                                )

                                .setLabel(
                                    'Modifier Embed'
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
                        creerEmbedConfigStreams()
                    ],

                    components: [
                        ligne1,
                        ligne2
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
                        '📍 Choisis le salon des annonces Twitch :',

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
                    chargerConfig();


                config.streams.channelId =
                    interaction.values[0];


                sauvegarderConfig(
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
                            'Pseudo ou lien Twitch'
                        )

                        .setPlaceholder(
                            'Ex : zerator'
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


            if (
                interaction.isModalSubmit() &&
                interaction.customId ===
                    'modal_stream_add'
            ) {

                await interaction.deferReply({

                    flags:
                        MessageFlags.Ephemeral

                });


                const brut =
                    interaction.fields
                        .getTextInputValue(
                            'stream_login'
                        );


                let user;


                try {

                    user =
                        await trouverUtilisateurTwitch(
                            brut
                        );

                }

                catch (error) {

                    await interaction.editReply({

                        content:
                            `❌ Erreur Twitch : ${error.message}`

                    });


                    return;

                }


                if (
                    !user
                ) {

                    await interaction.editReply({

                        content:
                            '❌ Cette chaîne Twitch est introuvable.'

                    });


                    return;

                }


                const config =
                    chargerConfig();


                config.streams.streamers[
                    user.login.toLowerCase()
                ] = {

                    userId:
                        user.id,

                    login:
                        user.login.toLowerCase(),

                    displayName:
                        user.display_name,

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


                sauvegarderConfig(
                    config
                );


                await interaction.editReply({

                    content:
                        `✅ **${user.display_name}** (\`${user.login}\`) ajouté aux streamers surveillés.`

                });


                setTimeout(
                    verifierStreams,
                    1000
                );


                return;

            }


// ======================================================
// RETIRER STREAMER
// ======================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'stream_delete'
            ) {

                const config =
                    chargerConfig();


                const streamers =
                    Object.entries(
                        config.streams.streamers
                    );


                if (
                    !streamers.length
                ) {

                    await interaction.reply({

                        content:
                            '❌ Aucun streamer surveillé.',

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
                            'Choisis le streamer à retirer'
                        )

                        .addOptions(

                            streamers
                                .slice(
                                    0,
                                    25
                                )
                                .map(
                                    ([login, streamer]) => ({

                                        label:
                                            `${
                                                streamer.isLive
                                                    ? '🔴'
                                                    : '⚫'
                                            } ${
                                                streamer.displayName ||
                                                login
                                            }`
                                                .slice(
                                                    0,
                                                    100
                                                ),

                                        value:
                                            login

                                    })
                                )

                        );


                await interaction.reply({

                    content:
                        '🗑️ Choisis le streamer à retirer :',

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
                    interaction.values[0];


                const ligne =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    `confirm_stream_delete_${login}`
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
                        `⚠️ Retirer **${login}** de la surveillance Twitch ?`,

                    components: [
                        ligne
                    ]

                });


                return;

            }


            if (
                interaction.isButton() &&
                interaction.customId.startsWith(
                    'confirm_stream_delete_'
                )
            ) {

                const login =
                    interaction.customId.replace(
                        'confirm_stream_delete_',
                        ''
                    );


                const config =
                    chargerConfig();


                const streamer =
                    config.streams.streamers[
                        login
                    ];


                if (
                    streamer
                ) {

                    await supprimerAnnonceStream(

                        interaction.guild,
                        config,
                        streamer

                    );


                    delete config.streams.streamers[
                        login
                    ];


                    sauvegarderConfig(
                        config
                    );

                }


                await interaction.update({

                    content:
                        `✅ **${login}** retiré des streamers surveillés.`,

                    components:
                        []

                });


                return;

            }


// ======================================================
// @EVERYONE STREAM
// ======================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'stream_everyone_toggle'
            ) {

                const config =
                    chargerConfig();


                config.streams.embed.mentionEveryone =
                    !config.streams.embed.mentionEveryone;


                sauvegarderConfig(
                    config
                );


                await interaction.update({

                    embeds: [
                        creerEmbedConfigStreams()
                    ],

                    components:
                        interaction.message.components

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
                    chargerConfig();


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
                    chargerConfig();


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


                sauvegarderConfig(
                    config
                );


                await interaction.reply({

                    content:
                        '✅ Embed Twitch modifié.\n\nVariables disponibles : `{streamer}`, `{login}`, `{title}`, `{game}`, `{viewers}`',

                    flags:
                        MessageFlags.Ephemeral

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


                await verifierStreams();


                await interaction.editReply({

                    content:
                        '✅ Vérification Twitch terminée.'

                });


                return;

            }


// ======================================================
// ERREURS INTERACTIONS
// ======================================================

        }

        catch (error) {

            console.error(
                '❌ Erreur interaction :',
                error
            );


            if (

                interaction.isRepliable() &&

                !interaction.replied &&

                !interaction.deferred

            ) {

                await interaction.reply({

                    content:
                        '❌ Une erreur est survenue.',

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
// DÉMARRAGE
// ======================================================

enregistrerCommandes();


client.login(
    process.env.DISCORD_TOKEN
);