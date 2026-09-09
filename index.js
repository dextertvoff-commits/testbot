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

        GatewayIntentBits.GuildVoiceStates,

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
        // ACCÈS ADMINISTRATION ORYUM SYSTEMS
        // ==================================================

        access: {

            // Rôles autorisés à utiliser les commandes et panneaux ORYUM SYSTEMS
            staffRoleIds:
                []

        },


        // ==================================================
        // TICKETS
        // ==================================================

        tickets: {

            // Rôles autorisés à voir, écrire et gérer les tickets
            ticketAccessRoleIds:
                [],

            logsChannelId:
                '',

            staffMembers:
                {},

            types:
                {},


            panel: {

                title:
                    '🎫 ORYUM SYSTEMS // SUPPORT',

                description:
                    '**Besoin d’aide ?**\n\nClique sur le bouton pour ouvrir une demande.',

                buttonLabel:
                    'Ouvrir un ticket',

                buttonStyle:
                    'Primary',

                color:
                    '#F47B20',

                footer:
                    'ORYUM SYSTEMS • Support',

                thumbnailUrl:
                    ''

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
                    'ORYUM SYSTEMS • Support',

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
                'ORYUM SYSTEMS • Annonces'

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
                    'ORYUM SYSTEMS • Twitch',

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

            welcomeDmEnabled:
                false,

            welcomeDmTitle:
                '👋 Bienvenue sur {server}',

            welcomeDmMessage:
                'Ravi de t’avoir parmi nous !',

            welcomeDmColor:
                '#F47B20',

            welcomeDmShowAvatar:
                false,

            welcomeDmImageUrl:
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
        // VÉRIFICATION / IDENTITÉ RP
        // ==================================================

        verification: {

            enabled:
                false,

            channelId:
                '',

            pendingRoleId:
                '',

            verifiedRoleIds:
                [],

            panelTitle:
                '📜 VALIDATION DU RÈGLEMENT',

            panelDescription:
                'Avant de commencer, valide le règlement puis renseigne ton identité RP.',

            panelColor:
                '#F47B20',

            panelFooter:
                'ORYUM SYSTEMS • Vérification',

            buttonLabel:
                'Valider le règlement',

            nicknameEnabled:
                true,

            nicknameFormat:
                '{NOM} | {Prenom}',

            keepDiscordUsername:
                false,

            panelThumbnailUrl:
                '',

            panelImageUrl:
                ''

        },


        // ==================================================
        // VOCAUX ÉPHÉMÈRES
        // ==================================================

        temporaryVoices: {

            enabled:
                false,

            creators:
                {},

            activeChannels:
                {}

        },


        // ==================================================
        // COMMANDES PERSONNALISÉES
        // ==================================================

        customCommands: {
            commands: {}
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


    // --------------------------------------------------
    // Migration des anciens rôles Staff vers l'accès général
    // --------------------------------------------------
    const configServeur =
        globalConfig.guilds[
            guildId
        ];

    if (
        !Array.isArray(
            configServeur.access.staffRoleIds
        )
    ) {
        configServeur.access.staffRoleIds = [];
    }

    const anciensRolesStaff = [
        configServeur.access.staffRoleId,
        configServeur.tickets.staffRoleId
    ].filter(Boolean);

    let migrationEffectuee = false;

    for (
        const roleId
        of anciensRolesStaff
    ) {
        if (
            !configServeur.access.staffRoleIds.includes(
                roleId
            )
        ) {
            configServeur.access.staffRoleIds.push(
                roleId
            );
            migrationEffectuee = true;
        }
    }

    if (
        Object.prototype.hasOwnProperty.call(
            configServeur.access,
            'staffRoleId'
        )
    ) {
        delete configServeur.access.staffRoleId;
        migrationEffectuee = true;
    }

    if (
        Object.prototype.hasOwnProperty.call(
            configServeur.tickets,
            'staffRoleId'
        )
    ) {
        delete configServeur.tickets.staffRoleId;
        migrationEffectuee = true;
    }

    if (
        migrationEffectuee
    ) {
        sauvegarderConfigGlobale(
            globalConfig
        );
    }


    return configServeur;

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
// STYLE BOUTON DISCORD
// ======================================================

function styleBoutonDiscord(
    style,
    fallback = ButtonStyle.Primary
) {

    const styles = {
        Primary: ButtonStyle.Primary,
        Secondary: ButtonStyle.Secondary,
        Success: ButtonStyle.Success,
        Danger: ButtonStyle.Danger
    };

    return styles[style] ?? fallback;

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
// ACCÈS ADMINISTRATION ORYUM SYSTEMS
// ======================================================

function utilisateurPeutAdministrerBot(
    interaction,
    config
) {

    if (
        !interaction.member
    ) {
        return false;
    }


    if (
        interaction.member.permissions.has(
            PermissionFlagsBits.Administrator
        )
    ) {
        return true;
    }


    const roleIds =
        Array.isArray(
            config?.access?.staffRoleIds
        )
            ? config.access.staffRoleIds
            : [];


    return roleIds.some(
        roleId =>
            interaction.member.roles?.cache?.has(
                roleId
            )
    );

}


// ======================================================
// CATÉGORIES D'UN TYPE DE TICKET
// ======================================================

function categorieOuvertureTicket(
    type
) {

    return (
        type?.openCategoryId ||
        type?.categoryId ||
        ''
    );

}


function categorieClaimTicket(
    type
) {

    return (
        type?.claimedCategoryId ||
        type?.categoryId ||
        ''
    );

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
                        'ORYUM SYSTEMS-WEBHOOK'

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
                        'ORYUM SYSTEMS-WEBHOOK',

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


    const rolesAccesTickets =
        Array.isArray(
            config.tickets.ticketAccessRoleIds
        )
            ? config.tickets.ticketAccessRoleIds
            : [];


    const texteRolesAcces =
        rolesAccesTickets.length
            ? rolesAccesTickets
                .slice(0, 10)
                .map(roleId => `<@&${roleId}>`)
                .join(' • ') +
                (rolesAccesTickets.length > 10
                    ? `
+${rolesAccesTickets.length - 10} autre(s)`
                    : '')
            : '❌ Aucun rôle configuré';


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
                    '🎟️ Accès aux tickets',

                value:
                    texteRolesAcces,

                inline:
                    false
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
            },

            {
                name:
                    '🎨 Couleur bouton',

                value:
                    ({
                        Primary: '🔵 Bleu',
                        Secondary: '⚫ Gris',
                        Success: '🟢 Vert',
                        Danger: '🔴 Rouge'
                    })[config.tickets.panel.buttonStyle] || '🔵 Bleu',

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


    return new EmbedBuilder()

        .setColor(
            '#F47B20'
        )

        .setTitle(
            '👋 BIENVENUE / DÉPART'
        )

        .setDescription(
            'Choisis la partie que tu souhaites configurer.'
        )

        .addFields(

            {
                name:
                    '🎉 Message public d’arrivée',

                value:
                    config.welcome.welcomeEnabled
                        ? `✅ Activé${config.welcome.welcomeChannelId ? ` • <#${config.welcome.welcomeChannelId}>` : ' • Salon non configuré'}`
                        : '❌ Désactivé',

                inline:
                    false
            },

            {
                name:
                    '👋 Message public de départ',

                value:
                    config.welcome.goodbyeEnabled
                        ? `✅ Activé${config.welcome.goodbyeChannelId ? ` • <#${config.welcome.goodbyeChannelId}>` : ' • Salon non configuré'}`
                        : '❌ Désactivé',

                inline:
                    false
            },

            {
                name:
                    '✉️ Message privé de bienvenue',

                value:
                    config.welcome.welcomeDmEnabled
                        ? '✅ Activé'
                        : '❌ Désactivé',

                inline:
                    false
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


const attenteImageTicketPanel =
    new Map();


const attenteImageVerification =
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

        .toJSON(),


    new SlashCommandBuilder()

        .setName(
            'bot-panel'
        )

        .setDescription(
            'Ouvrir le panneau d’administration du bot'
        )

        .toJSON(),


    new SlashCommandBuilder()
        .setName('vocal')
        .setDescription('Gérer ton salon vocal éphémère')
        .addSubcommand(sub => sub.setName('renommer').setDescription('Renommer ton vocal éphémère').addStringOption(opt => opt.setName('nom').setDescription('Nouveau nom du salon').setRequired(true).setMaxLength(100)))
        .addSubcommand(sub => sub.setName('limite').setDescription('Changer la limite de places').addIntegerOption(opt => opt.setName('places').setDescription('0 = illimité').setRequired(true).setMinValue(0).setMaxValue(99)))
        .addSubcommand(sub => sub.setName('verrouiller').setDescription('Verrouiller ton vocal'))
        .addSubcommand(sub => sub.setName('deverrouiller').setDescription('Déverrouiller ton vocal'))
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
            '🟠 ORYUM SYSTEMS // MULTI-SERVEURS ACTIF'
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


        // --------------------------------------------------
        // RÔLE TEMPORAIRE DE VÉRIFICATION
        // --------------------------------------------------

        if (
            config.verification?.enabled &&
            config.verification?.pendingRoleId
        ) {

            try {

                const roleAttente =
                    member.guild.roles.cache.get(
                        config.verification.pendingRoleId
                    )
                    ||
                    await member.guild.roles.fetch(
                        config.verification.pendingRoleId
                    ).catch(() => null);

                if (
                    roleAttente &&
                    roleAttente.editable
                ) {
                    await member.roles.add(
                        roleAttente,
                        'ORYUM SYSTEMS • En attente de vérification'
                    );
                }

            }
            catch (error) {
                console.log(
                    `⚠️ Rôle de vérification impossible pour ${member.user.tag} : ${error.message}`
                );
            }

        }


        // --------------------------------------------------
        // MESSAGE PUBLIC D'ARRIVÉE
        // --------------------------------------------------

        if (
            config.welcome.welcomeEnabled &&
            config.welcome.welcomeChannelId
        ) {

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
                salon &&
                salon.isTextBased()
            ) {

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
                                extension: 'png',
                                size: 256
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
                        `❌ Erreur bienvenue publique [${member.guild.name}] :`,
                        error.message
                    );

                }

            }

        }


        // --------------------------------------------------
        // MESSAGE PRIVÉ DE BIENVENUE
        // --------------------------------------------------

        if (
            config.welcome.welcomeDmEnabled
        ) {

            try {

                const embedDm =
                    new EmbedBuilder()

                        .setColor(
                            couleurValide(
                                config.welcome.welcomeDmColor,
                                '#F47B20'
                            )
                        )

                        .setTitle(
                            remplacerVariables(
                                config.welcome.welcomeDmTitle,
                                member
                            )
                        )

                        .setDescription(
                            remplacerVariables(
                                config.welcome.welcomeDmMessage,
                                member
                            )
                        )

                        .setTimestamp();


                if (
                    config.welcome.welcomeDmShowAvatar
                ) {

                    embedDm.setThumbnail(
                        member.user.displayAvatarURL({
                            extension: 'png',
                            size: 256
                        })
                    );

                }


                if (
                    config.welcome.welcomeDmImageUrl
                ) {

                    embedDm.setImage(
                        config.welcome.welcomeDmImageUrl
                    );

                }


                await member.send({
                    embeds: [
                        embedDm
                    ]
                });

            }

            catch (error) {

                console.log(
                    `⚠️ DM de bienvenue impossible pour ${member.user.tag} : ${error.message}`
                );

            }

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

            else if (
                attenteBienvenue.type ===
                'welcome_dm'
            ) {

                config.welcome.welcomeDmImageUrl =
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

                    : attenteBienvenue.type ===
                        'welcome_dm'

                        ? '✅ Image du DM de bienvenue enregistrée.'

                        : '✅ Image de départ enregistrée.'

            );


            return;

        }


        // ==================================================
        // LOGO DU PANNEAU TICKETS
        // ==================================================

        const attenteTicketPanel =
            attenteImageTicketPanel.get(cle);

        if (
            attenteTicketPanel &&
            attenteTicketPanel.channelId === message.channel.id
        ) {

            if (Date.now() > attenteTicketPanel.expiresAt) {
                attenteImageTicketPanel.delete(cle);
                await message.reply(
                    '❌ Temps écoulé. Recommence depuis `/bot-panel`.'
                );
                return;
            }

            const attachment =
                message.attachments.first();

            if (!attachment) {
                await message.reply('❌ Tu dois envoyer une image.');
                return;
            }

            const contentType =
                attachment.contentType || '';

            const extensionImage =
                /\.(png|jpe?g|gif|webp)$/i.test(
                    attachment.name || attachment.url
                );

            if (
                !contentType.startsWith('image/') &&
                !extensionImage
            ) {
                await message.reply(
                    '❌ Le fichier envoyé n’est pas une image.'
                );
                return;
            }

            const config =
                chargerConfigServeur(message.guild.id);

            config.tickets.panel.thumbnailUrl =
                attachment.url;

            sauvegarderConfigServeur(
                message.guild.id,
                config
            );

            attenteImageTicketPanel.delete(cle);

            await message.reply(
                '✅ Logo du panneau tickets enregistré.'
            );

            return;
        }


        // ==================================================
        // IMAGES DU PANNEAU DE VÉRIFICATION
        // ==================================================

        const attenteVerification =
            attenteImageVerification.get(cle);

        if (
            attenteVerification &&
            attenteVerification.channelId === message.channel.id
        ) {

            if (Date.now() > attenteVerification.expiresAt) {
                attenteImageVerification.delete(cle);
                await message.reply(
                    '❌ Temps écoulé. Recommence depuis `/bot-panel`.'
                );
                return;
            }

            const attachment =
                message.attachments.first();

            if (!attachment) {
                await message.reply('❌ Tu dois envoyer une image.');
                return;
            }

            const contentType =
                attachment.contentType || '';

            const extensionImage =
                /\.(png|jpe?g|gif|webp)$/i.test(
                    attachment.name || attachment.url
                );

            if (
                !contentType.startsWith('image/') &&
                !extensionImage
            ) {
                await message.reply(
                    '❌ Le fichier envoyé n’est pas une image.'
                );
                return;
            }

            const config =
                chargerConfigServeur(message.guild.id);

            if (attenteVerification.type === 'logo') {
                config.verification.panelThumbnailUrl =
                    attachment.url;
            }
            else {
                config.verification.panelImageUrl =
                    attachment.url;
            }

            sauvegarderConfigServeur(
                message.guild.id,
                config
            );

            attenteImageVerification.delete(cle);

            await message.reply(
                attenteVerification.type === 'logo'
                    ? '✅ Logo du panneau de vérification enregistré.'
                    : '✅ Photo du panneau de vérification enregistrée.'
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
// SUPPRESSION AUTOMATIQUE DES RÉPONSES ÉPHÉMÈRES
// ======================================================

function programmerSuppressionEphemere(
    interaction,
    delai = 15000
) {

    setTimeout(
        async () => {

            try {
                await interaction.deleteReply();
            }
            catch (_) {
                // Réponse déjà supprimée, expirée ou remplacée.
            }

        },
        delai
    );

}


// ======================================================
// FORMAT DU PSEUDO APRÈS VÉRIFICATION
// ======================================================

function formaterPseudoVerification(
    format,
    nom,
    prenom,
    pseudoDiscord = ''
) {
    const modele = String(
        format || '{NOM} | {Prenom}'
    );

    return modele
        .replaceAll('{NOM}', nom)
        .replaceAll('{Nom}', nom)
        .replaceAll('{nom}', nom)
        .replaceAll('{PRENOM}', prenom.toLocaleUpperCase('fr-FR'))
        .replaceAll('{Prenom}', prenom)
        .replaceAll('{prenom}', prenom.toLocaleLowerCase('fr-FR'))
        .replaceAll('{PSEUDO}', pseudoDiscord)
        .replaceAll('{Pseudo}', pseudoDiscord)
        .replaceAll('{pseudo}', pseudoDiscord)
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 32);
}


// ======================================================
// VOCAUX ÉPHÉMÈRES - ÉTAT TEMPORAIRE
// ======================================================

const temporaryVoiceSetupPending = new Map();
const temporaryVoiceEditPending = new Map();

function cleUtilisateurServeur(guildId, userId) {
    return `${guildId}:${userId}`;
}

function obtenirConfigVocauxTemporaires(config) {
    if (!config.temporaryVoices || typeof config.temporaryVoices !== 'object') {
        config.temporaryVoices = { enabled: false, creators: {}, activeChannels: {} };
    }
    if (!config.temporaryVoices.creators || typeof config.temporaryVoices.creators !== 'object') config.temporaryVoices.creators = {};
    if (!config.temporaryVoices.activeChannels || typeof config.temporaryVoices.activeChannels !== 'object') config.temporaryVoices.activeChannels = {};
    for (const profil of Object.values(config.temporaryVoices.creators)) {
        if (profil && !Array.isArray(profil.allowedRoleIds)) profil.allowedRoleIds = [];
        if (profil && !Array.isArray(profil.visibleRoleIds)) profil.visibleRoleIds = [];
    }
    return config.temporaryVoices;
}

function rolesAutorisesProfilVocal(profil) {
    return Array.isArray(profil?.allowedRoleIds)
        ? [...new Set(profil.allowedRoleIds.filter(Boolean))].slice(0, 10)
        : [];
}

function rolesVisiblesProfilVocal(profil) {
    return Array.isArray(profil?.visibleRoleIds)
        ? [...new Set(profil.visibleRoleIds.filter(Boolean))].slice(0, 10)
        : [];
}

function membreAutoriseProfilVocal(member, profil) {
    const roles = rolesAutorisesProfilVocal(profil);
    if (!roles.length) return true;
    if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
    return roles.some(roleId => member.roles.cache.has(roleId));
}

async function appliquerPermissionsSalonCreateur(guild, profil, anciensRoleIds = []) {
    const channel = guild.channels.cache.get(profil?.triggerChannelId);
    if (!channel || channel.type !== ChannelType.GuildVoice) return;

    const rolesConnexion = rolesAutorisesProfilVocal(profil);
    const rolesVisibilite = rolesVisiblesProfilVocal(profil);
    const rolesActuels = new Set([...rolesConnexion, ...rolesVisibilite]);

    for (const roleId of anciensRoleIds) {
        if (!rolesActuels.has(roleId)) {
            await channel.permissionOverwrites.delete(roleId, 'ORYUM SYSTEMS - nettoyage ancienne permission vocal').catch(() => {});
        }
    }

    if (!rolesConnexion.length && !rolesVisibilite.length) {
        await channel.permissionOverwrites.delete(guild.roles.everyone.id, 'ORYUM SYSTEMS - accès public vocal créateur').catch(() => {});
        return;
    }

    if (rolesVisibilite.length) {
        await channel.permissionOverwrites.edit(
            guild.roles.everyone.id,
            { ViewChannel: false, Connect: false },
            { reason: 'ORYUM SYSTEMS - restriction visibilité vocal créateur' }
        ).catch(() => {});
    } else {
        await channel.permissionOverwrites.edit(
            guild.roles.everyone.id,
            { ViewChannel: null, Connect: rolesConnexion.length ? false : null },
            { reason: 'ORYUM SYSTEMS - restriction connexion vocal créateur' }
        ).catch(() => {});
    }

    for (const roleId of rolesVisibilite) {
        if (guild.roles.cache.has(roleId)) {
            await channel.permissionOverwrites.edit(roleId, { ViewChannel: true }, { reason: 'ORYUM SYSTEMS - rôle autorisé à voir le vocal créateur' }).catch(() => {});
        }
    }

    for (const roleId of rolesConnexion) {
        if (guild.roles.cache.has(roleId)) {
            await channel.permissionOverwrites.edit(roleId, { ViewChannel: true, Connect: true, Speak: true }, { reason: 'ORYUM SYSTEMS - rôle autorisé vocal créateur' }).catch(() => {});
        }
    }
}

function formatNomVocalTemporaire(format, member, numero = 1) {
    const pseudo = member.user.username;
    const display = member.displayName || member.user.globalName || member.user.username;
    const global = member.user.globalName || member.user.username;
    return String(format || '🎙️ Vocal de {DISPLAYNAME}')
        .replaceAll('{PSEUDO}', pseudo)
        .replaceAll('{USERNAME}', pseudo)
        .replaceAll('{DISPLAYNAME}', display)
        .replaceAll('{GLOBALNAME}', global)
        .replaceAll('{NUMBER}', String(numero))
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 100);
}

function trouverProfilCreateurParSalon(config, channelId) {
    const tv = obtenirConfigVocauxTemporaires(config);
    return Object.entries(tv.creators).find(([, profil]) => profil && profil.triggerChannelId === channelId) || null;
}

function creerEmbedConfigVocauxTemporaires(guild, config) {
    const tv = obtenirConfigVocauxTemporaires(config);
    const profils = Object.values(tv.creators);
    const lignes = profils.length
        ? profils.slice(0, 20).map((p, i) => {
            const salon = p.triggerChannelId ? `<#${p.triggerChannelId}>` : 'Salon manquant';
            const cat = p.categoryId ? `<#${p.categoryId}>` : 'Sans catégorie';
            const limite = Number(p.userLimit) || 0;
            const roles = rolesAutorisesProfilVocal(p);
            const visibles = rolesVisiblesProfilVocal(p);
            const acces = roles.length ? roles.map(id => `<@&${id}>`).join(', ') : '🌐 Public';
            const visibilite = visibles.length ? visibles.map(id => `<@&${id}>`).join(', ') : '🌐 Visible par tous';
            return `**${i + 1}.** ${salon} → \`${p.voiceNameFormat || '🎙️ Vocal de {DISPLAYNAME}'}\` • ${limite || '∞'} places • ${cat}\n└ 🔗 Rejoindre : ${acces}\n└ 👁️ Voir : ${visibilite}`;
        }).join('\n')
        : 'Aucun salon créateur configuré.';

    return new EmbedBuilder()
        .setColor(tv.enabled ? '#57F287' : '#ED4245')
        .setTitle('🔊 ORYUM SYSTEMS // VOCAUX ÉPHÉMÈRES')
        .setDescription('Crée plusieurs salons déclencheurs. Lorsqu’un membre rejoint l’un d’eux, ORYUM crée automatiquement son vocal, le déplace dedans puis supprime le salon lorsqu’il est vide.')
        .addFields(
            { name: '⚙️ État', value: tv.enabled ? '✅ Activé' : '❌ Désactivé', inline: true },
            { name: '🧩 Salons créateurs', value: `${profils.length}`, inline: true },
            { name: '📋 Configuration', value: lignes, inline: false }
        )
        .setFooter({ text: `Serveur : ${guild.name}` });
}

function creerComposantsVocauxTemporaires(config) {
    const tv = obtenirConfigVocauxTemporaires(config);
    const ligne1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('tempvoice_toggle').setLabel(tv.enabled ? 'Désactiver' : 'Activer').setEmoji(tv.enabled ? '⛔' : '✅').setStyle(tv.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
        new ButtonBuilder().setCustomId('tempvoice_add').setLabel('Ajouter un créateur').setEmoji('➕').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('tempvoice_edit').setLabel('Modifier').setEmoji('✏️').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('tempvoice_roles').setLabel('Rôles pour rejoindre').setEmoji('🔗').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('tempvoice_delete').setLabel('Supprimer').setEmoji('🗑️').setStyle(ButtonStyle.Danger)
    );
    const ligne2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('tempvoice_view_roles').setLabel('Rôles pouvant voir').setEmoji('👁️').setStyle(ButtonStyle.Secondary)
    );
    return [ligne1, ligne2, creerLigneRetourAdmin()];
}

function creerMenuProfilsVocaux(config, customId, placeholder) {
    const tv = obtenirConfigVocauxTemporaires(config);
    const options = Object.entries(tv.creators).slice(0, 25).map(([id, p]) => ({
        label: String(p.triggerName || 'Salon créateur').slice(0, 100),
        description: String(p.voiceNameFormat || 'Vocal temporaire').slice(0, 100),
        value: id
    }));
    if (!options.length) return null;
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder().setCustomId(customId).setPlaceholder(placeholder).addOptions(options)
    );
}

// ======================================================
// COMMANDES PERSONNALISÉES
// ======================================================

function obtenirCommandesPersonnalisees(config) {
    if (!config.customCommands || typeof config.customCommands !== 'object') config.customCommands = { commands: {} };
    if (!config.customCommands.commands || typeof config.customCommands.commands !== 'object') config.customCommands.commands = {};
    return config.customCommands.commands;
}

function parserOptionsCommande(texte = '') {
    const types = { text: 3, texte: 3, string: 3, user: 6, utilisateur: 6, membre: 6, role: 8, rôle: 8, channel: 7, salon: 7, integer: 4, nombre: 4, boolean: 5, booleen: 5, bool: 5 };
    const options = [];
    for (const ligne of String(texte).split(/\r?\n/).map(v => v.trim()).filter(Boolean)) {
        const [nomBrut, typeBrut = 'text', requisBrut = 'optional', ...descParts] = ligne.split(':');
        const name = String(nomBrut || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 32);
        const type = types[String(typeBrut).trim().toLowerCase()];
        if (!name || !type) continue;
        options.push({ name, type, required: ['required','requis','obligatoire','oui','true'].includes(String(requisBrut).trim().toLowerCase()), description: (descParts.join(':').trim() || `Valeur pour ${name}`).slice(0,100) });
        if (options.length >= 25) break;
    }
    return options;
}

function commandeVersDiscord(cmd) {
    const data = { name: cmd.name, description: (cmd.description || `Commande /${cmd.name}`).slice(0,100), type: 1, options: [] };
    for (const opt of (cmd.options || [])) data.options.push({ type: opt.type, name: opt.name, description: opt.description || `Valeur pour ${opt.name}`, required: !!opt.required });
    return data;
}

async function synchroniserCommandesServeur(guildId) {
    const config = chargerConfigServeur(guildId);
    const customs = Object.values(obtenirCommandesPersonnalisees(config));
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, guildId), { body: customs.map(commandeVersDiscord) });
}

function creerPanelCommandes(guildId) {
    const config = chargerConfigServeur(guildId);
    const commandes = Object.values(obtenirCommandesPersonnalisees(config));
    const liste = commandes.length ? commandes.slice(0,20).map(c => `• **/${c.name}** — ${c.description || 'Sans description'}`).join('\n') : 'Aucune commande personnalisée.';
    const embed = new EmbedBuilder().setColor('#F47B20').setTitle('⌨️ COMMANDES PERSONNALISÉES').setDescription('Crée et gère les commandes slash de ce serveur directement depuis ORYUM SYSTEMS.').addFields({name:'📋 Commandes',value:liste});
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('customcmd_create').setLabel('Créer').setEmoji('➕').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('customcmd_edit').setLabel('Modifier').setEmoji('✏️').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('customcmd_delete').setLabel('Supprimer').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('customcmd_permissions').setLabel('Permissions').setEmoji('🔐').setStyle(ButtonStyle.Secondary)
    );
    return { embeds:[embed], components:[row, creerLigneRetourAdmin()] };
}

function menuCommandesPersonnalisees(config, customId, placeholder) {
    const cmds = Object.values(obtenirCommandesPersonnalisees(config)).slice(0,25);
    if (!cmds.length) return null;
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId(customId).setPlaceholder(placeholder).addOptions(cmds.map(c => ({label:`/${c.name}`.slice(0,100),description:(c.description||'Commande personnalisée').slice(0,100),value:c.name}))));
}

function remplacerVariablesCommande(texte, interaction, cmd) {
    let out = String(texte || '');
    out = out.replaceAll('{AUTEUR}', interaction.user.username).replaceAll('{AUTEUR_MENTION}', `<@${interaction.user.id}>`).replaceAll('{SERVEUR}', interaction.guild.name);
    for (const opt of (cmd.options || [])) {
        const key = `{${opt.name.toUpperCase()}}`;
        let value = '';
        if (opt.type === 6) { const u = interaction.options.getUser(opt.name); value = u ? `<@${u.id}>` : ''; }
        else if (opt.type === 8) { const r = interaction.options.getRole(opt.name); value = r ? `<@&${r.id}>` : ''; }
        else if (opt.type === 7) { const c = interaction.options.getChannel(opt.name); value = c ? `<#${c.id}>` : ''; }
        else if (opt.type === 4) { const v = interaction.options.getInteger(opt.name); value = v == null ? '' : String(v); }
        else if (opt.type === 5) { const v = interaction.options.getBoolean(opt.name); value = v == null ? '' : (v ? 'Oui' : 'Non'); }
        else value = interaction.options.getString(opt.name) || '';
        out = out.replaceAll(key, value);
        if (opt.type === 6) out = out.replaceAll(`{${opt.name.toUpperCase()}_MENTION}`, value);
    }
    return out;
}

// ======================================================
// DÉBUT DES INTERACTIONS
// ======================================================

// ======================================================
// NAVIGATION PANNEAU ADMIN
// ======================================================

function creerLigneRetourAdmin() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('admin_back')
            .setLabel('Retour')
            .setEmoji('⬅️')
            .setStyle(ButtonStyle.Secondary)
    );
}

function creerPanelPrincipalAdmin(guild) {
    const embed = new EmbedBuilder()
        .setColor('#F47B20')
        .setTitle('⚙️ ORYUM SYSTEMS // PANNEAU ADMIN')
        .setDescription(`Configuration de **${guild.name}**.\n\nGérez les modules et paramètres disponibles depuis ce panneau.`)
        .setFooter({ text: `Serveur ID : ${guild.id}` });

    const ligne = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('admin_tickets').setLabel('Tickets').setEmoji('🎫').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('admin_bienvenue').setLabel('Bienvenue').setEmoji('👋').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('admin_annonces').setLabel('Annonces').setEmoji('📢').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('admin_streams').setLabel('Streams').setEmoji('🔴').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('admin_appearance').setLabel('Apparence').setEmoji('🤖').setStyle(ButtonStyle.Secondary)
    );

    const ligneAcces = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('admin_verification').setLabel('Vérification').setEmoji('✅').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('admin_tempvoices').setLabel('Vocaux éphémères').setEmoji('🔊').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('admin_commands').setLabel('Commandes').setEmoji('⌨️').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('admin_access').setLabel('Accès Bot').setEmoji('🔐').setStyle(ButtonStyle.Secondary)
    );

    return { embeds: [embed], components: [ligne, ligneAcces] };
}

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
                    programmerSuppressionEphemere(interaction, 15000);

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

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                if (
                    !utilisateurPeutAdministrerBot(
                        interaction,
                        config
                    )
                ) {

                    await interaction.reply({

                        content:
                            '❌ Tu n’as pas l’autorisation d’utiliser ORYUM SYSTEMS sur ce serveur.',

                        flags:
                            MessageFlags.Ephemeral

                    });
                    programmerSuppressionEphemere(interaction, 15000);


                    return;

                }


                const panel = creerPanelPrincipalAdmin(interaction.guild);

                await interaction.reply({
                    ...panel,
                    flags: MessageFlags.Ephemeral
                });


                return;

            }

            // ==================================================
            // RETOUR AU PANNEAU PRINCIPAL
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId === 'admin_back'
            ) {

                const config = chargerConfigServeur(interaction.guild.id);

                if (!utilisateurPeutAdministrerBot(interaction, config)) {
                    await interaction.reply({
                        content: '❌ Tu n’as pas l’autorisation d’utiliser ORYUM SYSTEMS sur ce serveur.',
                        flags: MessageFlags.Ephemeral
                    });
                    programmerSuppressionEphemere(interaction, 15000);
                    return;
                }

                const panel = creerPanelPrincipalAdmin(interaction.guild);

                await interaction.update(panel);
                return;
            }

            // ==================================================
            // COMMANDES PERSONNALISÉES - ADMIN
            // ==================================================

            if (interaction.isButton() && interaction.customId === 'admin_commands') {
                const config = chargerConfigServeur(interaction.guild.id);
                if (!utilisateurPeutAdministrerBot(interaction, config)) return interaction.reply({content:'❌ Accès refusé.',flags:MessageFlags.Ephemeral});
                await interaction.update(creerPanelCommandes(interaction.guild.id));
                return;
            }

            if (interaction.isButton() && interaction.customId === 'customcmd_create') {
                const modal = new ModalBuilder().setCustomId('customcmd_create_modal').setTitle('Créer une commande');
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('cc_name').setLabel('Nom de la commande (sans /)').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(32).setPlaceholder('convoc')),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('cc_desc').setLabel('Description').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(100).setPlaceholder('Convoquer un membre')),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('cc_options').setLabel('Options : nom:type:obligatoire').setStyle(TextInputStyle.Paragraph).setRequired(false).setPlaceholder('membre:user:obligatoire\nmotif:text:optionnel\nlieu:text:optionnel')),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('cc_title').setLabel('Titre de l’embed').setStyle(TextInputStyle.Short).setRequired(false).setMaxLength(256).setPlaceholder('📜 CONVOCATION OFFICIELLE')),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('cc_body').setLabel('Texte / variables {MEMBRE}, {MOTIF}...').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(4000).setPlaceholder('{MEMBRE}, vous êtes convoqué par {AUTEUR_MENTION}.'))
                );
                await interaction.showModal(modal); return;
            }

            if (interaction.isModalSubmit() && interaction.customId === 'customcmd_create_modal') {
                const config = chargerConfigServeur(interaction.guild.id);
                if (!utilisateurPeutAdministrerBot(interaction, config)) return interaction.reply({content:'❌ Accès refusé.',flags:MessageFlags.Ephemeral});
                const cmds = obtenirCommandesPersonnalisees(config);
                const name = interaction.fields.getTextInputValue('cc_name').trim().toLowerCase().replace(/[^a-z0-9_-]/g,'-').slice(0,32);
                if (!name || ['bot-panel','ticket-panel','vocal'].includes(name)) return interaction.reply({content:'❌ Nom invalide ou réservé.',flags:MessageFlags.Ephemeral});
                cmds[name] = { name, description:interaction.fields.getTextInputValue('cc_desc').trim(), options:parserOptionsCommande(interaction.fields.getTextInputValue('cc_options')), title:interaction.fields.getTextInputValue('cc_title').trim(), body:interaction.fields.getTextInputValue('cc_body'), color:'#F47B20', footer:'ORYUM SYSTEMS', allowedRoleIds:Array.isArray(config.access.staffRoleIds)?[...config.access.staffRoleIds]:[], pingUser:true };
                sauvegarderConfigServeur(interaction.guild.id, config);
                try { await synchroniserCommandesServeur(interaction.guild.id); } catch(e) { console.error('❌ Sync commande:',e); }
                await interaction.reply({content:`✅ La commande **/${name}** a été créée et synchronisée sur ce serveur.`,flags:MessageFlags.Ephemeral}); programmerSuppressionEphemere(interaction,15000); return;
            }

            if (interaction.isButton() && ['customcmd_edit','customcmd_delete','customcmd_permissions'].includes(interaction.customId)) {
                const config=chargerConfigServeur(interaction.guild.id); const map={customcmd_edit:['customcmd_edit_select','Choisis la commande à modifier'],customcmd_delete:['customcmd_delete_select','Choisis la commande à supprimer'],customcmd_permissions:['customcmd_perm_select','Choisis la commande']};
                const menu=menuCommandesPersonnalisees(config,map[interaction.customId][0],map[interaction.customId][1]);
                if(!menu) return interaction.reply({content:'❌ Aucune commande personnalisée.',flags:MessageFlags.Ephemeral});
                await interaction.reply({content:'⌨️ Sélectionne une commande :',components:[menu],flags:MessageFlags.Ephemeral}); return;
            }

            if (interaction.isStringSelectMenu() && interaction.customId === 'customcmd_delete_select') {
                const config=chargerConfigServeur(interaction.guild.id); const name=interaction.values[0]; delete obtenirCommandesPersonnalisees(config)[name]; sauvegarderConfigServeur(interaction.guild.id,config); await synchroniserCommandesServeur(interaction.guild.id).catch(()=>{}); await interaction.update({content:`✅ **/${name}** supprimée.`,components:[]}); return;
            }

            if (interaction.isStringSelectMenu() && interaction.customId === 'customcmd_edit_select') {
                const config=chargerConfigServeur(interaction.guild.id); const cmd=obtenirCommandesPersonnalisees(config)[interaction.values[0]]; if(!cmd) return;
                const modal=new ModalBuilder().setCustomId(`customcmd_edit_modal:${cmd.name}`).setTitle(`Modifier /${cmd.name}`);
                const spec=(cmd.options||[]).map(o=>`${o.name}:${o.type===6?'user':o.type===8?'role':o.type===7?'channel':o.type===4?'integer':o.type===5?'boolean':'text'}:${o.required?'obligatoire':'optionnel'}`).join('\n');
                modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('cc_desc').setLabel('Description').setStyle(TextInputStyle.Short).setRequired(true).setValue(cmd.description||'')),new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('cc_options').setLabel('Options').setStyle(TextInputStyle.Paragraph).setRequired(false).setValue(spec)),new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('cc_title').setLabel('Titre de l’embed').setStyle(TextInputStyle.Short).setRequired(false).setValue(cmd.title||'')),new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('cc_body').setLabel('Texte de l’embed').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(4000).setValue(String(cmd.body||'').slice(0,4000))));
                await interaction.showModal(modal); return;
            }

            if (interaction.isModalSubmit() && interaction.customId.startsWith('customcmd_edit_modal:')) {
                const name=interaction.customId.split(':')[1]; const config=chargerConfigServeur(interaction.guild.id); const cmd=obtenirCommandesPersonnalisees(config)[name]; if(!cmd) return interaction.reply({content:'❌ Commande introuvable.',flags:MessageFlags.Ephemeral});
                cmd.description=interaction.fields.getTextInputValue('cc_desc').trim(); cmd.options=parserOptionsCommande(interaction.fields.getTextInputValue('cc_options')); cmd.title=interaction.fields.getTextInputValue('cc_title').trim(); cmd.body=interaction.fields.getTextInputValue('cc_body'); sauvegarderConfigServeur(interaction.guild.id,config); await synchroniserCommandesServeur(interaction.guild.id).catch(()=>{}); await interaction.reply({content:`✅ **/${name}** modifiée.`,flags:MessageFlags.Ephemeral}); programmerSuppressionEphemere(interaction,15000); return;
            }

            if (interaction.isStringSelectMenu() && interaction.customId === 'customcmd_perm_select') {
                const name=interaction.values[0]; const row=new ActionRowBuilder().addComponents(new RoleSelectMenuBuilder().setCustomId(`customcmd_roles:${name}`).setPlaceholder('Rôles autorisés (vide = administrateurs)').setMinValues(0).setMaxValues(10)); await interaction.update({content:`🔐 Rôles autorisés à utiliser **/${name}** :`,components:[row]}); return;
            }

            if (interaction.isRoleSelectMenu() && interaction.customId.startsWith('customcmd_roles:')) {
                const name=interaction.customId.split(':')[1]; const config=chargerConfigServeur(interaction.guild.id); const cmd=obtenirCommandesPersonnalisees(config)[name]; if(!cmd) return; cmd.allowedRoleIds=[...interaction.values]; sauvegarderConfigServeur(interaction.guild.id,config); await interaction.update({content:`✅ Permissions de **/${name}** enregistrées.`,components:[]}); return;
            }

            // Exécution d'une commande personnalisée
            if (interaction.isChatInputCommand() && !['bot-panel','ticket-panel','vocal'].includes(interaction.commandName)) {
                const config=chargerConfigServeur(interaction.guild.id); const cmd=obtenirCommandesPersonnalisees(config)[interaction.commandName];
                if (cmd) {
                    const roles=Array.isArray(cmd.allowedRoleIds)?cmd.allowedRoleIds:[]; const admin=interaction.member.permissions.has(PermissionFlagsBits.Administrator); const autorise=admin || roles.some(id=>interaction.member.roles.cache.has(id));
                    if (!autorise) { await interaction.reply({content:'❌ Tu n’as pas l’autorisation d’utiliser cette commande.',flags:MessageFlags.Ephemeral}); programmerSuppressionEphemere(interaction,15000); return; }
                    const embed=new EmbedBuilder().setColor(couleurValide(cmd.color,'#F47B20')).setDescription(remplacerVariablesCommande(cmd.body,interaction,cmd)).setTimestamp(); if(cmd.title) embed.setTitle(remplacerVariablesCommande(cmd.title,interaction,cmd)); if(cmd.footer) embed.setFooter({text:cmd.footer});
                    let content; if(cmd.pingUser){ const u=(cmd.options||[]).find(o=>o.type===6); if(u){ const user=interaction.options.getUser(u.name); if(user) content=`<@${user.id}>`; } }
                    const pingUser = (cmd.options || []).find(o => o.type === 6) ? interaction.options.getUser((cmd.options || []).find(o => o.type === 6).name) : null;
                    await interaction.reply({
                        content,
                        embeds: [embed],
                        allowedMentions: { users: pingUser ? [pingUser.id] : [] }
                    });
                    return;
                }
            }

            // ==================================================
            // PANEL ACCÈS ORYUM SYSTEMS
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'admin_access'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );

                const rolesAutorises =
                    Array.isArray(
                        config.access.staffRoleIds
                    )
                        ? config.access.staffRoleIds
                        : [];

                const listeRoles =
                    rolesAutorises.length
                        ? rolesAutorises
                            .map(
                                roleId =>
                                    `<@&${roleId}>`
                            )
                            .join(
                                '\n'
                            )
                        : 'Administrateurs Discord uniquement.';


                const embed =
                    new EmbedBuilder()

                        .setColor(
                            '#5865F2'
                        )

                        .setTitle(
                            '🔐 ORYUM SYSTEMS // ACCÈS AU BOT'
                        )

                        .setDescription(
                            'Choisis les rôles autorisés à utiliser les commandes et panneaux d’administration d’ORYUM SYSTEMS.\n\n' +
                            '**Les Administrateurs Discord restent toujours autorisés.**'
                        )

                        .addFields(
                            {
                                name:
                                    '🛡️ Rôles autorisés',

                                value:
                                    listeRoles,

                                inline:
                                    false
                            }
                        );


                const ligne =
                    new ActionRowBuilder()

                        .addComponents(

                            new ButtonBuilder()

                                .setCustomId(
                                    'access_staff_roles'
                                )

                                .setLabel(
                                    'Choisir les rôles'
                                )

                                .setEmoji(
                                    '🛡️'
                                )

                                .setStyle(
                                    ButtonStyle.Primary
                                ),

                            new ButtonBuilder()

                                .setCustomId(
                                    'access_staff_clear'
                                )

                                .setLabel(
                                    'Admins uniquement'
                                )

                                .setEmoji(
                                    '🔒'
                                )

                                .setStyle(
                                    ButtonStyle.Danger
                                )

                        );


                await interaction.update({

                    embeds: [
                        embed
                    ],

                    components: [
                        ligne,
                        creerLigneRetourAdmin()
                    ]

                });


                return;

            }


            if (
                interaction.isButton() &&
                interaction.customId ===
                    'access_staff_roles'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );

                const actuels =
                    Array.isArray(
                        config.access.staffRoleIds
                    )
                        ? config.access.staffRoleIds
                        : [];

                const menu =
                    new RoleSelectMenuBuilder()

                        .setCustomId(
                            'select_access_staff_roles'
                        )

                        .setPlaceholder(
                            'Choisis les rôles autorisés à utiliser ORYUM'
                        )

                        .setMinValues(
                            1
                        )

                        .setMaxValues(
                            10
                        );

                const texteActuel =
                    actuels.length
                        ? actuels
                            .map(
                                roleId =>
                                    `<@&${roleId}>`
                            )
                            .join(
                                ' • '
                            )
                        : 'Aucun rôle configuré.';


                await interaction.reply({

                    content:
                        '🔐 **Accès à ORYUM SYSTEMS**\n' +
                        'Sélectionne jusqu’à **10 rôles** autorisés à utiliser le bot et ses panneaux de configuration.\n\n' +
                        `**Actuellement :** ${texteActuel}\n\n` +
                        'La nouvelle sélection remplacera la sélection actuelle.',

                    components: [

                        new ActionRowBuilder()
                            .addComponents(
                                menu
                            )

                    ],

                    flags:
                        MessageFlags.Ephemeral

                });

                programmerSuppressionEphemere(
                    interaction,
                    30000
                );


                return;

            }


            if (
                interaction.isRoleSelectMenu() &&
                interaction.customId ===
                    'select_access_staff_roles'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );

                const roleIds =
                    [...new Set(
                        interaction.values
                    )]
                        .filter(
                            roleId =>
                                interaction.guild.roles.cache.has(
                                    roleId
                                )
                        );


                config.access.staffRoleIds =
                    roleIds;


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                const liste =
                    roleIds
                        .map(
                            roleId =>
                                `<@&${roleId}>`
                        )
                        .join(
                            ' • '
                        );


                await interaction.update({

                    content:
                        `✅ Accès à ORYUM SYSTEMS configuré pour : ${liste}`,

                    components:
                        []

                });

                programmerSuppressionEphemere(
                    interaction,
                    15000
                );


                return;

            }


            if (
                interaction.isButton() &&
                interaction.customId ===
                    'access_staff_clear'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                config.access.staffRoleIds =
                    [];


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.update({

                    content:
                        '✅ ORYUM SYSTEMS est maintenant utilisable uniquement par les Administrateurs Discord.',

                    embeds:
                        [],

                    components:
                        []

                });

                programmerSuppressionEphemere(
                    interaction,
                    15000
                );


                return;

            }


            // ==================================================
            // MODULE VOCAUX ÉPHÉMÈRES
            // ==================================================

            if (interaction.isButton() && interaction.customId === 'admin_tempvoices') {
                const config = chargerConfigServeur(interaction.guild.id);
                if (!utilisateurPeutAdministrerBot(interaction, config)) {
                    await interaction.reply({ content: '❌ Tu n’as pas l’autorisation d’utiliser ce module.', flags: MessageFlags.Ephemeral });
                    programmerSuppressionEphemere(interaction, 15000);
                    return;
                }
                await interaction.update({ embeds: [creerEmbedConfigVocauxTemporaires(interaction.guild, config)], components: creerComposantsVocauxTemporaires(config) });
                return;
            }

            if (interaction.isButton() && interaction.customId === 'tempvoice_toggle') {
                const config = chargerConfigServeur(interaction.guild.id);
                if (!utilisateurPeutAdministrerBot(interaction, config)) return;
                const tv = obtenirConfigVocauxTemporaires(config);
                tv.enabled = !tv.enabled;
                sauvegarderConfigServeur(interaction.guild.id, config);
                await interaction.update({ embeds: [creerEmbedConfigVocauxTemporaires(interaction.guild, config)], components: creerComposantsVocauxTemporaires(config) });
                return;
            }

            if (interaction.isButton() && interaction.customId === 'tempvoice_add') {
                const config = chargerConfigServeur(interaction.guild.id);
                if (!utilisateurPeutAdministrerBot(interaction, config)) return;
                const modal = new ModalBuilder().setCustomId('modal_tempvoice_add').setTitle('Ajouter un salon créateur');
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('tempvoice_trigger_name').setLabel('Nom du salon créateur').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(100).setValue('➕ Créer un vocal')),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('tempvoice_format').setLabel('Nom des salons éphémères').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(100).setValue('🎙️ Vocal de {DISPLAYNAME}')),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('tempvoice_limit').setLabel('Limite de places (0 = illimité)').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(2).setValue('0'))
                );
                await interaction.showModal(modal);
                return;
            }

            if (interaction.isModalSubmit() && interaction.customId === 'modal_tempvoice_add') {
                const config = chargerConfigServeur(interaction.guild.id);
                if (!utilisateurPeutAdministrerBot(interaction, config)) return;
                const triggerName = interaction.fields.getTextInputValue('tempvoice_trigger_name').trim();
                const voiceNameFormat = interaction.fields.getTextInputValue('tempvoice_format').trim();
                const userLimit = Number.parseInt(interaction.fields.getTextInputValue('tempvoice_limit').trim(), 10);
                if (!Number.isInteger(userLimit) || userLimit < 0 || userLimit > 99) {
                    await interaction.reply({ content: '❌ La limite doit être comprise entre 0 et 99.', flags: MessageFlags.Ephemeral });
                    programmerSuppressionEphemere(interaction, 15000);
                    return;
                }
                temporaryVoiceSetupPending.set(cleUtilisateurServeur(interaction.guild.id, interaction.user.id), { triggerName, voiceNameFormat, userLimit, expiresAt: Date.now() + 120000 });
                const menu = new ChannelSelectMenuBuilder().setCustomId('select_tempvoice_category_add').setPlaceholder('Choisir la catégorie des vocaux').addChannelTypes(ChannelType.GuildCategory);
                await interaction.reply({ content: '📁 Choisis la catégorie où seront placés le salon créateur et les vocaux éphémères.', components: [new ActionRowBuilder().addComponents(menu)], flags: MessageFlags.Ephemeral });
                programmerSuppressionEphemere(interaction, 30000);
                return;
            }

            if (interaction.isChannelSelectMenu() && interaction.customId === 'select_tempvoice_category_add') {
                const config = chargerConfigServeur(interaction.guild.id);
                if (!utilisateurPeutAdministrerBot(interaction, config)) return;
                const key = cleUtilisateurServeur(interaction.guild.id, interaction.user.id);
                const pending = temporaryVoiceSetupPending.get(key);
                if (!pending || Date.now() > pending.expiresAt) {
                    temporaryVoiceSetupPending.delete(key);
                    await interaction.update({ content: '❌ Configuration expirée. Recommence avec « Ajouter un créateur ».', components: [] });
                    return;
                }
                const categoryId = interaction.values[0];
                const category = interaction.guild.channels.cache.get(categoryId);
                if (!category || category.type !== ChannelType.GuildCategory) {
                    await interaction.update({ content: '❌ Catégorie introuvable.', components: [] });
                    return;
                }
                const triggerChannel = await interaction.guild.channels.create({ name: pending.triggerName, type: ChannelType.GuildVoice, parent: categoryId, reason: `ORYUM SYSTEMS - salon créateur configuré par ${interaction.user.tag}` });
                const tv = obtenirConfigVocauxTemporaires(config);
                tv.creators[triggerChannel.id] = { triggerChannelId: triggerChannel.id, triggerName: pending.triggerName, categoryId, voiceNameFormat: pending.voiceNameFormat, userLimit: pending.userLimit, allowedRoleIds: [], visibleRoleIds: [] };
                temporaryVoiceSetupPending.delete(key);
                sauvegarderConfigServeur(interaction.guild.id, config);
                await interaction.update({ content: `✅ Salon créateur créé : ${triggerChannel}\nFormat des vocaux : \`${pending.voiceNameFormat}\``, components: [] });
                return;
            }

            if (interaction.isButton() && interaction.customId === 'tempvoice_edit') {
                const config = chargerConfigServeur(interaction.guild.id);
                if (!utilisateurPeutAdministrerBot(interaction, config)) return;
                const row = creerMenuProfilsVocaux(config, 'select_tempvoice_edit', 'Choisir le salon créateur à modifier');
                if (!row) {
                    await interaction.reply({ content: '❌ Aucun salon créateur configuré.', flags: MessageFlags.Ephemeral });
                    programmerSuppressionEphemere(interaction, 15000);
                    return;
                }
                await interaction.reply({ content: '✏️ Choisis le salon créateur à modifier.', components: [row], flags: MessageFlags.Ephemeral });
                programmerSuppressionEphemere(interaction, 30000);
                return;
            }

            if (interaction.isStringSelectMenu() && interaction.customId === 'select_tempvoice_edit') {
                const config = chargerConfigServeur(interaction.guild.id);
                if (!utilisateurPeutAdministrerBot(interaction, config)) return;
                const tv = obtenirConfigVocauxTemporaires(config);
                const profileId = interaction.values[0];
                const p = tv.creators[profileId];
                if (!p) return;
                temporaryVoiceEditPending.set(cleUtilisateurServeur(interaction.guild.id, interaction.user.id), { profileId, expiresAt: Date.now() + 120000 });
                const modal = new ModalBuilder().setCustomId('modal_tempvoice_edit').setTitle('Modifier le salon créateur');
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('tempvoice_edit_trigger_name').setLabel('Nom du salon créateur').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(100).setValue(String(p.triggerName || '➕ Créer un vocal').slice(0, 100))),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('tempvoice_edit_format').setLabel('Nom des salons éphémères').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(100).setValue(String(p.voiceNameFormat || '🎙️ Vocal de {DISPLAYNAME}').slice(0, 100))),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('tempvoice_edit_limit').setLabel('Limite de places (0 = illimité)').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(2).setValue(String(Number(p.userLimit) || 0)))
                );
                await interaction.showModal(modal);
                return;
            }

            if (interaction.isModalSubmit() && interaction.customId === 'modal_tempvoice_edit') {
                const config = chargerConfigServeur(interaction.guild.id);
                if (!utilisateurPeutAdministrerBot(interaction, config)) return;
                const key = cleUtilisateurServeur(interaction.guild.id, interaction.user.id);
                const pending = temporaryVoiceEditPending.get(key);
                if (!pending || Date.now() > pending.expiresAt) {
                    temporaryVoiceEditPending.delete(key);
                    await interaction.reply({ content: '❌ Modification expirée. Recommence.', flags: MessageFlags.Ephemeral });
                    programmerSuppressionEphemere(interaction, 15000);
                    return;
                }
                const tv = obtenirConfigVocauxTemporaires(config);
                const p = tv.creators[pending.profileId];
                if (!p) return;
                const triggerName = interaction.fields.getTextInputValue('tempvoice_edit_trigger_name').trim();
                const voiceNameFormat = interaction.fields.getTextInputValue('tempvoice_edit_format').trim();
                const userLimit = Number.parseInt(interaction.fields.getTextInputValue('tempvoice_edit_limit').trim(), 10);
                if (!Number.isInteger(userLimit) || userLimit < 0 || userLimit > 99) {
                    await interaction.reply({ content: '❌ La limite doit être comprise entre 0 et 99.', flags: MessageFlags.Ephemeral });
                    programmerSuppressionEphemere(interaction, 15000);
                    return;
                }
                p.triggerName = triggerName;
                p.voiceNameFormat = voiceNameFormat;
                p.userLimit = userLimit;
                const channel = interaction.guild.channels.cache.get(p.triggerChannelId);
                if (channel) await channel.setName(triggerName).catch(() => {});
                temporaryVoiceEditPending.delete(key);
                sauvegarderConfigServeur(interaction.guild.id, config);
                await interaction.reply({ content: '✅ Salon créateur mis à jour.', flags: MessageFlags.Ephemeral });
                programmerSuppressionEphemere(interaction, 15000);
                return;
            }

            if (interaction.isButton() && interaction.customId === 'tempvoice_roles') {
                const config = chargerConfigServeur(interaction.guild.id);
                if (!utilisateurPeutAdministrerBot(interaction, config)) return;
                const row = creerMenuProfilsVocaux(config, 'select_tempvoice_roles_profile', 'Choisir le salon créateur');
                if (!row) {
                    await interaction.reply({ content: '❌ Aucun salon créateur configuré.', flags: MessageFlags.Ephemeral });
                    programmerSuppressionEphemere(interaction, 15000);
                    return;
                }
                await interaction.reply({ content: '👥 Choisis le salon créateur dont tu veux gérer les rôles autorisés.', components: [row], flags: MessageFlags.Ephemeral });
                programmerSuppressionEphemere(interaction, 30000);
                return;
            }

            if (interaction.isStringSelectMenu() && interaction.customId === 'select_tempvoice_roles_profile') {
                const config = chargerConfigServeur(interaction.guild.id);
                if (!utilisateurPeutAdministrerBot(interaction, config)) return;
                const tv = obtenirConfigVocauxTemporaires(config);
                const profileId = interaction.values[0];
                const profil = tv.creators[profileId];
                if (!profil) return;
                temporaryVoiceEditPending.set(cleUtilisateurServeur(interaction.guild.id, interaction.user.id), { profileId, mode: 'roles', expiresAt: Date.now() + 120000 });
                const roles = rolesAutorisesProfilVocal(profil);
                const menu = new RoleSelectMenuBuilder()
                    .setCustomId('select_tempvoice_allowed_roles')
                    .setPlaceholder('Choisir jusqu’à 10 rôles autorisés')
                    .setMinValues(0)
                    .setMaxValues(10);
                if (roles.length) menu.setDefaultRoles(roles);
                const clear = new ButtonBuilder().setCustomId('tempvoice_roles_clear').setLabel('Rendre public').setEmoji('🌐').setStyle(ButtonStyle.Secondary);
                await interaction.update({
                    content: `👥 Rôles autorisés pour <#${profil.triggerChannelId}>.\n${roles.length ? roles.map(id => `<@&${id}>`).join(', ') : '**Actuellement : public**'}\n\nSi aucun rôle n’est sélectionné, le salon est accessible à tout le monde.`,
                    components: [new ActionRowBuilder().addComponents(menu), new ActionRowBuilder().addComponents(clear)]
                });
                return;
            }

            if (interaction.isRoleSelectMenu() && interaction.customId === 'select_tempvoice_allowed_roles') {
                const config = chargerConfigServeur(interaction.guild.id);
                if (!utilisateurPeutAdministrerBot(interaction, config)) return;
                const key = cleUtilisateurServeur(interaction.guild.id, interaction.user.id);
                const pending = temporaryVoiceEditPending.get(key);
                if (!pending || pending.mode !== 'roles' || Date.now() > pending.expiresAt) {
                    temporaryVoiceEditPending.delete(key);
                    await interaction.update({ content: '❌ Configuration expirée. Recommence depuis le panneau.', components: [] });
                    return;
                }
                const tv = obtenirConfigVocauxTemporaires(config);
                const profil = tv.creators[pending.profileId];
                if (!profil) return;
                const anciensRoles = [...rolesAutorisesProfilVocal(profil), ...rolesVisiblesProfilVocal(profil)];
                profil.allowedRoleIds = [...new Set(interaction.values)].slice(0, 10);
                await appliquerPermissionsSalonCreateur(interaction.guild, profil, anciensRoles);
                temporaryVoiceEditPending.delete(key);
                sauvegarderConfigServeur(interaction.guild.id, config);
                await interaction.update({ content: profil.allowedRoleIds.length ? `✅ Accès configuré : ${profil.allowedRoleIds.map(id => `<@&${id}>`).join(', ')}` : '✅ Ce salon créateur est maintenant public.', components: [] });
                return;
            }

            if (interaction.isButton() && interaction.customId === 'tempvoice_roles_clear') {
                const config = chargerConfigServeur(interaction.guild.id);
                if (!utilisateurPeutAdministrerBot(interaction, config)) return;
                const key = cleUtilisateurServeur(interaction.guild.id, interaction.user.id);
                const pending = temporaryVoiceEditPending.get(key);
                if (!pending || pending.mode !== 'roles' || Date.now() > pending.expiresAt) {
                    temporaryVoiceEditPending.delete(key);
                    await interaction.update({ content: '❌ Configuration expirée. Recommence depuis le panneau.', components: [] });
                    return;
                }
                const tv = obtenirConfigVocauxTemporaires(config);
                const profil = tv.creators[pending.profileId];
                if (!profil) return;
                const anciensRoles = [...rolesAutorisesProfilVocal(profil), ...rolesVisiblesProfilVocal(profil)];
                profil.allowedRoleIds = [];
                await appliquerPermissionsSalonCreateur(interaction.guild, profil, anciensRoles);
                temporaryVoiceEditPending.delete(key);
                sauvegarderConfigServeur(interaction.guild.id, config);
                await interaction.update({ content: '🌐 Salon créateur rendu public. Tout le monde peut créer et rejoindre ses vocaux éphémères.', components: [] });
                return;
            }

            if (interaction.isButton() && interaction.customId === 'tempvoice_view_roles') {
                const config = chargerConfigServeur(interaction.guild.id);
                if (!utilisateurPeutAdministrerBot(interaction, config)) return;
                const row = creerMenuProfilsVocaux(config, 'select_tempvoice_view_roles_profile', 'Choisir le salon créateur');
                if (!row) {
                    await interaction.reply({ content: '❌ Aucun salon créateur configuré.', flags: MessageFlags.Ephemeral });
                    programmerSuppressionEphemere(interaction, 15000);
                    return;
                }
                await interaction.reply({ content: '👁️ Choisis le salon créateur dont tu veux gérer la visibilité.', components: [row], flags: MessageFlags.Ephemeral });
                programmerSuppressionEphemere(interaction, 30000);
                return;
            }

            if (interaction.isStringSelectMenu() && interaction.customId === 'select_tempvoice_view_roles_profile') {
                const config = chargerConfigServeur(interaction.guild.id);
                if (!utilisateurPeutAdministrerBot(interaction, config)) return;
                const tv = obtenirConfigVocauxTemporaires(config);
                const profileId = interaction.values[0];
                const profil = tv.creators[profileId];
                if (!profil) return;
                temporaryVoiceEditPending.set(cleUtilisateurServeur(interaction.guild.id, interaction.user.id), { profileId, mode: 'view_roles', expiresAt: Date.now() + 120000 });
                const roles = rolesVisiblesProfilVocal(profil);
                const menu = new RoleSelectMenuBuilder().setCustomId('select_tempvoice_visible_roles').setPlaceholder('Choisir jusqu’à 10 rôles pouvant voir').setMinValues(0).setMaxValues(10);
                if (roles.length) menu.setDefaultRoles(roles);
                const clear = new ButtonBuilder().setCustomId('tempvoice_view_roles_clear').setLabel('Visible par tous').setEmoji('🌐').setStyle(ButtonStyle.Secondary);
                await interaction.update({
                    content: `👁️ Rôles pouvant voir <#${profil.triggerChannelId}> et ses vocaux éphémères.
${roles.length ? roles.map(id => `<@&${id}>`).join(', ') : '**Actuellement : visible par tous**'}

La visibilité et le droit de rejoindre sont deux réglages séparés.`,
                    components: [new ActionRowBuilder().addComponents(menu), new ActionRowBuilder().addComponents(clear)]
                });
                return;
            }

            if (interaction.isRoleSelectMenu() && interaction.customId === 'select_tempvoice_visible_roles') {
                const config = chargerConfigServeur(interaction.guild.id);
                if (!utilisateurPeutAdministrerBot(interaction, config)) return;
                const key = cleUtilisateurServeur(interaction.guild.id, interaction.user.id);
                const pending = temporaryVoiceEditPending.get(key);
                if (!pending || pending.mode !== 'view_roles' || Date.now() > pending.expiresAt) {
                    temporaryVoiceEditPending.delete(key);
                    await interaction.update({ content: '❌ Configuration expirée. Recommence depuis le panneau.', components: [] });
                    return;
                }
                const tv = obtenirConfigVocauxTemporaires(config);
                const profil = tv.creators[pending.profileId];
                if (!profil) return;
                const anciensRoles = [...rolesAutorisesProfilVocal(profil), ...rolesVisiblesProfilVocal(profil)];
                profil.visibleRoleIds = [...new Set(interaction.values)].slice(0, 10);
                await appliquerPermissionsSalonCreateur(interaction.guild, profil, anciensRoles);
                temporaryVoiceEditPending.delete(key);
                sauvegarderConfigServeur(interaction.guild.id, config);
                await interaction.update({ content: profil.visibleRoleIds.length ? `✅ Visibilité configurée : ${profil.visibleRoleIds.map(id => `<@&${id}>`).join(', ')}` : '✅ Ces salons sont maintenant visibles par tout le monde.', components: [] });
                return;
            }

            if (interaction.isButton() && interaction.customId === 'tempvoice_view_roles_clear') {
                const config = chargerConfigServeur(interaction.guild.id);
                if (!utilisateurPeutAdministrerBot(interaction, config)) return;
                const key = cleUtilisateurServeur(interaction.guild.id, interaction.user.id);
                const pending = temporaryVoiceEditPending.get(key);
                if (!pending || pending.mode !== 'view_roles' || Date.now() > pending.expiresAt) {
                    temporaryVoiceEditPending.delete(key);
                    await interaction.update({ content: '❌ Configuration expirée. Recommence depuis le panneau.', components: [] });
                    return;
                }
                const tv = obtenirConfigVocauxTemporaires(config);
                const profil = tv.creators[pending.profileId];
                if (!profil) return;
                const anciensRoles = [...rolesAutorisesProfilVocal(profil), ...rolesVisiblesProfilVocal(profil)];
                profil.visibleRoleIds = [];
                await appliquerPermissionsSalonCreateur(interaction.guild, profil, anciensRoles);
                temporaryVoiceEditPending.delete(key);
                sauvegarderConfigServeur(interaction.guild.id, config);
                await interaction.update({ content: '🌐 Les salons de ce créateur sont maintenant visibles par tout le monde.', components: [] });
                return;
            }

            if (interaction.isButton() && interaction.customId === 'tempvoice_delete') {
                const config = chargerConfigServeur(interaction.guild.id);
                if (!utilisateurPeutAdministrerBot(interaction, config)) return;
                const row = creerMenuProfilsVocaux(config, 'select_tempvoice_delete', 'Choisir le salon créateur à supprimer');
                if (!row) {
                    await interaction.reply({ content: '❌ Aucun salon créateur configuré.', flags: MessageFlags.Ephemeral });
                    programmerSuppressionEphemere(interaction, 15000);
                    return;
                }
                await interaction.reply({ content: '🗑️ Choisis le salon créateur à supprimer.', components: [row], flags: MessageFlags.Ephemeral });
                programmerSuppressionEphemere(interaction, 30000);
                return;
            }

            if (interaction.isStringSelectMenu() && interaction.customId === 'select_tempvoice_delete') {
                const config = chargerConfigServeur(interaction.guild.id);
                if (!utilisateurPeutAdministrerBot(interaction, config)) return;
                const tv = obtenirConfigVocauxTemporaires(config);
                const profileId = interaction.values[0];
                const p = tv.creators[profileId];
                if (!p) return;
                const channel = interaction.guild.channels.cache.get(p.triggerChannelId);
                if (channel) await channel.delete('ORYUM SYSTEMS - suppression du salon créateur').catch(() => {});
                delete tv.creators[profileId];
                sauvegarderConfigServeur(interaction.guild.id, config);
                await interaction.update({ content: '✅ Salon créateur supprimé.', components: [] });
                return;
            }

            if (interaction.isChatInputCommand() && interaction.commandName === 'vocal') {
                const config = chargerConfigServeur(interaction.guild.id);
                const tv = obtenirConfigVocauxTemporaires(config);
                const voiceChannel = interaction.member?.voice?.channel;
                if (!voiceChannel) {
                    await interaction.reply({ content: '❌ Tu dois être dans ton vocal éphémère.', flags: MessageFlags.Ephemeral });
                    programmerSuppressionEphemere(interaction, 15000);
                    return;
                }
                const active = tv.activeChannels[voiceChannel.id];
                if (!active || active.ownerId !== interaction.user.id) {
                    await interaction.reply({ content: '❌ Tu n’es pas le propriétaire de ce vocal éphémère.', flags: MessageFlags.Ephemeral });
                    programmerSuppressionEphemere(interaction, 15000);
                    return;
                }
                const sub = interaction.options.getSubcommand();
                if (sub === 'renommer') {
                    const nom = interaction.options.getString('nom', true).trim().slice(0, 100);
                    await voiceChannel.setName(nom);
                    await interaction.reply({ content: `✅ Ton vocal s’appelle maintenant **${nom}**.`, flags: MessageFlags.Ephemeral });
                } else if (sub === 'limite') {
                    const places = interaction.options.getInteger('places', true);
                    await voiceChannel.setUserLimit(places);
                    await interaction.reply({ content: `✅ Limite réglée sur **${places || 'illimité'}**.`, flags: MessageFlags.Ephemeral });
                } else if (sub === 'verrouiller') {
                    await voiceChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, { Connect: false });
                    await interaction.reply({ content: '🔒 Ton vocal est maintenant verrouillé.', flags: MessageFlags.Ephemeral });
                } else if (sub === 'deverrouiller') {
                    await voiceChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, { Connect: null });
                    await interaction.reply({ content: '🔓 Ton vocal est maintenant déverrouillé.', flags: MessageFlags.Ephemeral });
                }
                programmerSuppressionEphemere(interaction, 15000);
                return;
            }

            // ==================================================
            // MODULE VÉRIFICATION / IDENTITÉ RP
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId === 'admin_verification'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );

                if (!utilisateurPeutAdministrerBot(interaction, config)) {
                    await interaction.reply({
                        content: '❌ Tu n’as pas l’autorisation d’utiliser ce module.',
                        flags: MessageFlags.Ephemeral
                    });
                    programmerSuppressionEphemere(interaction, 15000);
                    return;
                }

                const v = config.verification || {};
                const rolesValides = Array.isArray(v.verifiedRoleIds)
                    ? v.verifiedRoleIds
                    : [];

                const embed = new EmbedBuilder()
                    .setColor(v.enabled ? '#57F287' : '#ED4245')
                    .setTitle('✅ ORYUM SYSTEMS // VÉRIFICATION')
                    .setDescription(
                        'Configure la validation du règlement, les rôles automatiques et le pseudo RP.'
                    )
                    .addFields(
                        {
                            name: '⚙️ État',
                            value: v.enabled ? '✅ Activée' : '❌ Désactivée',
                            inline: true
                        },
                        {
                            name: '📍 Salon du panneau',
                            value: v.channelId ? `<#${v.channelId}>` : '❌ Non configuré',
                            inline: true
                        },
                        {
                            name: '⏳ Rôle avant validation',
                            value: v.pendingRoleId ? `<@&${v.pendingRoleId}>` : 'Aucun',
                            inline: false
                        },
                        {
                            name: '🎭 Rôles après validation',
                            value: rolesValides.length
                                ? rolesValides.map(id => `<@&${id}>`).join(' • ')
                                : '❌ Aucun rôle configuré',
                            inline: false
                        },
                        {
                            name: '🏷️ Modification du pseudo',
                            value: v.nicknameEnabled === false
                                ? '❌ Désactivée'
                                : '✅ Activée',
                            inline: true
                        },
                        {
                            name: '👤 Conserver le pseudo Discord',
                            value: v.keepDiscordUsername === true
                                ? '✅ Oui'
                                : '❌ Non',
                            inline: true
                        },
                        {
                            name: '🧩 Format du pseudo',
                            value: `\`${v.nicknameFormat || '{NOM} | {Prenom}'}\``,
                            inline: false
                        },
                        {
                            name: '🖼️ Logo du panneau',
                            value: v.panelThumbnailUrl ? '✅ Configuré' : '❌ Aucun',
                            inline: true
                        },
                        {
                            name: '🌄 Photo du panneau',
                            value: v.panelImageUrl ? '✅ Configurée' : '❌ Aucune',
                            inline: true
                        }
                    );

                const ligne1 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('verification_toggle')
                        .setLabel(v.enabled ? 'Désactiver' : 'Activer')
                        .setEmoji(v.enabled ? '🔴' : '🟢')
                        .setStyle(v.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('verification_channel')
                        .setLabel('Salon')
                        .setEmoji('📍')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('verification_pending_role')
                        .setLabel('Rôle attente')
                        .setEmoji('⏳')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('verification_verified_roles')
                        .setLabel('Rôles validés')
                        .setEmoji('🎭')
                        .setStyle(ButtonStyle.Primary)
                );

                const ligne2 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('verification_style')
                        .setLabel('Message')
                        .setEmoji('📝')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('verification_publish')
                        .setLabel('Publier le panneau')
                        .setEmoji('📤')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('verification_nickname_toggle')
                        .setLabel(v.nicknameEnabled === false ? 'Activer pseudo' : 'Désactiver pseudo')
                        .setEmoji('🏷️')
                        .setStyle(v.nicknameEnabled === false ? ButtonStyle.Success : ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('verification_nickname_format')
                        .setLabel('Format pseudo')
                        .setEmoji('🧩')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('verification_clear_pending')
                        .setLabel('Retirer rôle attente')
                        .setEmoji('🗑️')
                        .setStyle(ButtonStyle.Danger)
                );

                const ligne3 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('verification_keep_username_toggle')
                        .setLabel(v.keepDiscordUsername === true ? 'Ne pas garder pseudo' : 'Garder pseudo Discord')
                        .setEmoji('👤')
                        .setStyle(v.keepDiscordUsername === true ? ButtonStyle.Danger : ButtonStyle.Success)
                );

                const ligne4 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('verification_logo')
                        .setLabel('Logo')
                        .setEmoji('🖼️')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('verification_photo')
                        .setLabel('Photo')
                        .setEmoji('🌄')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('verification_remove_logo')
                        .setLabel('Retirer logo')
                        .setEmoji('🗑️')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('verification_remove_photo')
                        .setLabel('Retirer photo')
                        .setEmoji('🗑️')
                        .setStyle(ButtonStyle.Danger)
                );

                await interaction.update({
                    embeds: [embed],
                    components: [
                        ligne1,
                        ligne2,
                        ligne3,
                        ligne4,
                        creerLigneRetourAdmin()
                    ]
                });
                return;
            }


            if (
                interaction.isButton() &&
                interaction.customId === 'verification_logo'
            ) {
                const cle = `${interaction.guild.id}:${interaction.user.id}`;

                attenteImageVerification.set(cle, {
                    type: 'logo',
                    channelId: interaction.channel.id,
                    expiresAt: Date.now() + 120000
                });

                await interaction.reply({
                    content: '🖼️ Envoie maintenant le **logo** du panneau de vérification dans ce salon.\nTu as **2 minutes**.',
                    flags: MessageFlags.Ephemeral
                });
                programmerSuppressionEphemere(interaction, 30000);
                return;
            }


            if (
                interaction.isButton() &&
                interaction.customId === 'verification_photo'
            ) {
                const cle = `${interaction.guild.id}:${interaction.user.id}`;

                attenteImageVerification.set(cle, {
                    type: 'photo',
                    channelId: interaction.channel.id,
                    expiresAt: Date.now() + 120000
                });

                await interaction.reply({
                    content: '🌄 Envoie maintenant la **photo / bannière** du panneau de vérification dans ce salon.\nTu as **2 minutes**.',
                    flags: MessageFlags.Ephemeral
                });
                programmerSuppressionEphemere(interaction, 30000);
                return;
            }


            if (
                interaction.isButton() &&
                interaction.customId === 'verification_remove_logo'
            ) {
                const config = chargerConfigServeur(interaction.guild.id);
                config.verification.panelThumbnailUrl = '';
                sauvegarderConfigServeur(interaction.guild.id, config);

                await interaction.reply({
                    content: '✅ Logo du panneau de vérification retiré.',
                    flags: MessageFlags.Ephemeral
                });
                programmerSuppressionEphemere(interaction, 15000);
                return;
            }


            if (
                interaction.isButton() &&
                interaction.customId === 'verification_remove_photo'
            ) {
                const config = chargerConfigServeur(interaction.guild.id);
                config.verification.panelImageUrl = '';
                sauvegarderConfigServeur(interaction.guild.id, config);

                await interaction.reply({
                    content: '✅ Photo du panneau de vérification retirée.',
                    flags: MessageFlags.Ephemeral
                });
                programmerSuppressionEphemere(interaction, 15000);
                return;
            }


            if (
                interaction.isButton() &&
                interaction.customId === 'verification_nickname_toggle'
            ) {
                const config = chargerConfigServeur(interaction.guild.id);
                config.verification.nicknameEnabled =
                    config.verification.nicknameEnabled === false;

                sauvegarderConfigServeur(interaction.guild.id, config);

                await interaction.reply({
                    content: config.verification.nicknameEnabled
                        ? '✅ Modification automatique du pseudo activée.'
                        : '❌ Modification automatique du pseudo désactivée.',
                    flags: MessageFlags.Ephemeral
                });
                programmerSuppressionEphemere(interaction, 15000);
                return;
            }


            if (
                interaction.isButton() &&
                interaction.customId === 'verification_keep_username_toggle'
            ) {
                const config = chargerConfigServeur(interaction.guild.id);
                config.verification.keepDiscordUsername =
                    config.verification.keepDiscordUsername !== true;

                // Quand on active la conservation du pseudo, on ajoute automatiquement
                // {PSEUDO} au format s'il n'est pas déjà présent.
                if (
                    config.verification.keepDiscordUsername === true &&
                    !/\{(?:PSEUDO|Pseudo|pseudo)\}/.test(config.verification.nicknameFormat || '')
                ) {
                    config.verification.nicknameFormat =
                        `${config.verification.nicknameFormat || '{NOM} | {Prenom}'} | {PSEUDO}`;
                }

                sauvegarderConfigServeur(interaction.guild.id, config);

                await interaction.reply({
                    content: config.verification.keepDiscordUsername
                        ? `✅ Le pseudo Discord sera conservé.\nFormat actuel : \`${config.verification.nicknameFormat}\``
                        : '❌ Le pseudo Discord ne sera plus conservé.',
                    flags: MessageFlags.Ephemeral
                });
                programmerSuppressionEphemere(interaction, 15000);
                return;
            }


            if (
                interaction.isButton() &&
                interaction.customId === 'verification_nickname_format'
            ) {
                const config = chargerConfigServeur(interaction.guild.id);
                const v = config.verification || {};

                const modal = new ModalBuilder()
                    .setCustomId('modal_verification_nickname_format')
                    .setTitle('Format du pseudo RP');

                const formatInput = new TextInputBuilder()
                    .setCustomId('verification_nickname_format_value')
                    .setLabel('Format du pseudo')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(80)
                    .setValue(v.nicknameFormat || '{NOM} | {Prenom}')
                    .setPlaceholder('{NOM} | {Prenom}');

                modal.addComponents(
                    new ActionRowBuilder().addComponents(formatInput)
                );

                await interaction.showModal(modal);
                return;
            }


            if (
                interaction.isModalSubmit() &&
                interaction.customId === 'modal_verification_nickname_format'
            ) {
                const config = chargerConfigServeur(interaction.guild.id);
                const format = interaction.fields
                    .getTextInputValue('verification_nickname_format_value')
                    .trim();

                if (
                    !format.includes('{NOM}') &&
                    !format.includes('{Nom}') &&
                    !format.includes('{nom}') &&
                    !format.includes('{PRENOM}') &&
                    !format.includes('{Prenom}') &&
                    !format.includes('{prenom}')
                ) {
                    await interaction.reply({
                        content: '❌ Le format doit contenir au moins une variable : `{NOM}` ou `{Prenom}`.',
                        flags: MessageFlags.Ephemeral
                    });
                    programmerSuppressionEphemere(interaction, 15000);
                    return;
                }

                config.verification.nicknameFormat = format;
                sauvegarderConfigServeur(interaction.guild.id, config);

                await interaction.reply({
                    content: `✅ Format du pseudo enregistré : \`${format}\`\nVariables : \`{NOM}\`, \`{Prenom}\`, \`{prenom}\`, \`{PRENOM}\`.`,
                    flags: MessageFlags.Ephemeral
                });
                programmerSuppressionEphemere(interaction, 15000);
                return;
            }


            if (
                interaction.isButton() &&
                interaction.customId === 'verification_toggle'
            ) {
                const config = chargerConfigServeur(interaction.guild.id);
                config.verification.enabled = !config.verification.enabled;
                sauvegarderConfigServeur(interaction.guild.id, config);

                await interaction.reply({
                    content: config.verification.enabled
                        ? '✅ Module de vérification activé.'
                        : '✅ Module de vérification désactivé.',
                    flags: MessageFlags.Ephemeral
                });
                programmerSuppressionEphemere(interaction, 15000);
                return;
            }


            if (
                interaction.isButton() &&
                interaction.customId === 'verification_channel'
            ) {
                const menu = new ChannelSelectMenuBuilder()
                    .setCustomId('select_verification_channel')
                    .setPlaceholder('Choisis le salon du panneau de validation')
                    .setChannelTypes(ChannelType.GuildText)
                    .setMinValues(1)
                    .setMaxValues(1);

                await interaction.reply({
                    content: '📍 Choisis le salon dans lequel le panneau de validation sera publié.',
                    components: [new ActionRowBuilder().addComponents(menu)],
                    flags: MessageFlags.Ephemeral
                });
                programmerSuppressionEphemere(interaction, 30000);
                return;
            }


            if (
                interaction.isChannelSelectMenu() &&
                interaction.customId === 'select_verification_channel'
            ) {
                const config = chargerConfigServeur(interaction.guild.id);
                config.verification.channelId = interaction.values[0];
                sauvegarderConfigServeur(interaction.guild.id, config);

                await interaction.update({
                    content: `✅ Salon de validation configuré : <#${interaction.values[0]}>`,
                    components: []
                });
                programmerSuppressionEphemere(interaction, 15000);
                return;
            }


            if (
                interaction.isButton() &&
                interaction.customId === 'verification_pending_role'
            ) {
                const menu = new RoleSelectMenuBuilder()
                    .setCustomId('select_verification_pending_role')
                    .setPlaceholder('Choisis le rôle donné avant validation')
                    .setMinValues(1)
                    .setMaxValues(1);

                await interaction.reply({
                    content: '⏳ Choisis le rôle temporaire attribué aux nouveaux membres avant validation.',
                    components: [new ActionRowBuilder().addComponents(menu)],
                    flags: MessageFlags.Ephemeral
                });
                programmerSuppressionEphemere(interaction, 30000);
                return;
            }


            if (
                interaction.isRoleSelectMenu() &&
                interaction.customId === 'select_verification_pending_role'
            ) {
                const config = chargerConfigServeur(interaction.guild.id);
                config.verification.pendingRoleId = interaction.values[0];
                sauvegarderConfigServeur(interaction.guild.id, config);

                await interaction.update({
                    content: `✅ Rôle d’attente configuré : <@&${interaction.values[0]}>`,
                    components: []
                });
                programmerSuppressionEphemere(interaction, 15000);
                return;
            }


            if (
                interaction.isButton() &&
                interaction.customId === 'verification_clear_pending'
            ) {
                const config = chargerConfigServeur(interaction.guild.id);
                config.verification.pendingRoleId = '';
                sauvegarderConfigServeur(interaction.guild.id, config);

                await interaction.reply({
                    content: '✅ Le rôle d’attente a été retiré de la configuration.',
                    flags: MessageFlags.Ephemeral
                });
                programmerSuppressionEphemere(interaction, 15000);
                return;
            }


            if (
                interaction.isButton() &&
                interaction.customId === 'verification_verified_roles'
            ) {
                const menu = new RoleSelectMenuBuilder()
                    .setCustomId('select_verification_verified_roles')
                    .setPlaceholder('Choisis les rôles attribués après validation')
                    .setMinValues(1)
                    .setMaxValues(10);

                await interaction.reply({
                    content: '🎭 Sélectionne jusqu’à **10 rôles** à attribuer après validation.',
                    components: [new ActionRowBuilder().addComponents(menu)],
                    flags: MessageFlags.Ephemeral
                });
                programmerSuppressionEphemere(interaction, 30000);
                return;
            }


            if (
                interaction.isRoleSelectMenu() &&
                interaction.customId === 'select_verification_verified_roles'
            ) {
                const config = chargerConfigServeur(interaction.guild.id);
                config.verification.verifiedRoleIds = [...new Set(interaction.values)];
                sauvegarderConfigServeur(interaction.guild.id, config);

                await interaction.update({
                    content:
                        '✅ Rôles après validation : ' +
                        config.verification.verifiedRoleIds.map(id => `<@&${id}>`).join(' • '),
                    components: []
                });
                programmerSuppressionEphemere(interaction, 15000);
                return;
            }


            if (
                interaction.isButton() &&
                interaction.customId === 'verification_style'
            ) {
                const config = chargerConfigServeur(interaction.guild.id);
                const v = config.verification;

                const modal = new ModalBuilder()
                    .setCustomId('modal_verification_style')
                    .setTitle('Message de vérification');

                const titre = new TextInputBuilder()
                    .setCustomId('verification_title')
                    .setLabel('Titre')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(256)
                    .setValue(v.panelTitle || '📜 VALIDATION DU RÈGLEMENT');

                const description = new TextInputBuilder()
                    .setCustomId('verification_description')
                    .setLabel('Description')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setMaxLength(2000)
                    .setValue(v.panelDescription || 'Valide le règlement puis renseigne ton identité RP.');

                const bouton = new TextInputBuilder()
                    .setCustomId('verification_button_label')
                    .setLabel('Texte du bouton')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(80)
                    .setValue(v.buttonLabel || 'Valider le règlement');

                const couleur = new TextInputBuilder()
                    .setCustomId('verification_color')
                    .setLabel('Couleur HEX')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(7)
                    .setValue(v.panelColor || '#F47B20');

                const footer = new TextInputBuilder()
                    .setCustomId('verification_footer')
                    .setLabel('Footer')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)
                    .setMaxLength(200)
                    .setValue(v.panelFooter || '');

                modal.addComponents(
                    new ActionRowBuilder().addComponents(titre),
                    new ActionRowBuilder().addComponents(description),
                    new ActionRowBuilder().addComponents(bouton),
                    new ActionRowBuilder().addComponents(couleur),
                    new ActionRowBuilder().addComponents(footer)
                );

                await interaction.showModal(modal);
                return;
            }


            if (
                interaction.isModalSubmit() &&
                interaction.customId === 'modal_verification_style'
            ) {
                const config = chargerConfigServeur(interaction.guild.id);
                const couleur = interaction.fields.getTextInputValue('verification_color').trim();

                config.verification.panelTitle =
                    interaction.fields.getTextInputValue('verification_title').trim();
                config.verification.panelDescription =
                    interaction.fields.getTextInputValue('verification_description').trim();
                config.verification.buttonLabel =
                    interaction.fields.getTextInputValue('verification_button_label').trim();
                config.verification.panelColor =
                    couleurValide(couleur, '#F47B20');
                config.verification.panelFooter =
                    interaction.fields.getTextInputValue('verification_footer').trim();

                sauvegarderConfigServeur(interaction.guild.id, config);

                await interaction.reply({
                    content: '✅ Message de vérification enregistré.',
                    flags: MessageFlags.Ephemeral
                });
                programmerSuppressionEphemere(interaction, 15000);
                return;
            }


            if (
                interaction.isButton() &&
                interaction.customId === 'verification_publish'
            ) {
                const config = chargerConfigServeur(interaction.guild.id);
                const v = config.verification;

                if (!v.channelId) {
                    await interaction.reply({
                        content: '❌ Configure d’abord le salon de validation.',
                        flags: MessageFlags.Ephemeral
                    });
                    programmerSuppressionEphemere(interaction, 15000);
                    return;
                }

                const salon =
                    interaction.guild.channels.cache.get(v.channelId)
                    ||
                    await interaction.guild.channels.fetch(v.channelId).catch(() => null);

                if (!salon || !salon.isTextBased()) {
                    await interaction.reply({
                        content: '❌ Le salon de validation est introuvable.',
                        flags: MessageFlags.Ephemeral
                    });
                    programmerSuppressionEphemere(interaction, 15000);
                    return;
                }

                const embed = new EmbedBuilder()
                    .setColor(couleurValide(v.panelColor, '#F47B20'))
                    .setTitle(v.panelTitle || '📜 VALIDATION DU RÈGLEMENT')
                    .setDescription(v.panelDescription || 'Valide le règlement puis renseigne ton identité RP.');

                if (v.panelFooter) {
                    embed.setFooter({ text: v.panelFooter });
                }

                if (v.panelThumbnailUrl) {
                    embed.setThumbnail(v.panelThumbnailUrl);
                }

                if (v.panelImageUrl) {
                    embed.setImage(v.panelImageUrl);
                }

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('verification_start')
                        .setLabel(v.buttonLabel || 'Valider le règlement')
                        .setEmoji('✅')
                        .setStyle(ButtonStyle.Success)
                );

                await salon.send({
                    embeds: [embed],
                    components: [row]
                });

                await interaction.reply({
                    content: `✅ Panneau de validation publié dans ${salon}.`,
                    flags: MessageFlags.Ephemeral
                });
                programmerSuppressionEphemere(interaction, 15000);
                return;
            }


            // --------------------------------------------------
            // BOUTON PUBLIC : COMMENCER LA VÉRIFICATION
            // --------------------------------------------------

            if (
                interaction.isButton() &&
                interaction.customId === 'verification_start'
            ) {
                const config = chargerConfigServeur(interaction.guild.id);
                const v = config.verification;

                if (!v?.enabled) {
                    await interaction.reply({
                        content: '❌ La vérification est actuellement désactivée.',
                        flags: MessageFlags.Ephemeral
                    });
                    programmerSuppressionEphemere(interaction, 15000);
                    return;
                }

                const rolesValides = Array.isArray(v.verifiedRoleIds)
                    ? v.verifiedRoleIds
                    : [];

                const dejaValide =
                    rolesValides.length > 0 &&
                    rolesValides.every(roleId => interaction.member.roles.cache.has(roleId)) &&
                    (!v.pendingRoleId || !interaction.member.roles.cache.has(v.pendingRoleId));

                if (dejaValide) {
                    await interaction.reply({
                        content: '✅ Ton compte est déjà validé sur ce serveur.',
                        flags: MessageFlags.Ephemeral
                    });
                    programmerSuppressionEphemere(interaction, 15000);
                    return;
                }

                const modal = new ModalBuilder()
                    .setCustomId('modal_verification_identity')
                    .setTitle('Identité RP');

                const nom = new TextInputBuilder()
                    .setCustomId('verification_last_name')
                    .setLabel('Nom RP')
                    .setPlaceholder('Ex : BUFFALO')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(2)
                    .setMaxLength(20);

                const prenom = new TextInputBuilder()
                    .setCustomId('verification_first_name')
                    .setLabel('Prénom RP')
                    .setPlaceholder('Ex : Joshua')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(2)
                    .setMaxLength(20);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(nom),
                    new ActionRowBuilder().addComponents(prenom)
                );

                await interaction.showModal(modal);
                return;
            }


            // --------------------------------------------------
            // VALIDATION DE L'IDENTITÉ RP
            // --------------------------------------------------

            if (
                interaction.isModalSubmit() &&
                interaction.customId === 'modal_verification_identity'
            ) {
                await interaction.deferReply({
                    flags: MessageFlags.Ephemeral
                });

                const config = chargerConfigServeur(interaction.guild.id);
                const v = config.verification;

                if (!v?.enabled) {
                    await interaction.editReply('❌ La vérification est actuellement désactivée.');
                    programmerSuppressionEphemere(interaction, 15000);
                    return;
                }

                const nettoyerNom = valeur =>
                    String(valeur || '')
                        .trim()
                        .replace(/\s+/g, ' ')
                        .replace(/[^\p{L}\p{M}' -]/gu, '');

                const nomBrut = nettoyerNom(
                    interaction.fields.getTextInputValue('verification_last_name')
                );
                const prenomBrut = nettoyerNom(
                    interaction.fields.getTextInputValue('verification_first_name')
                );

                if (nomBrut.length < 2 || prenomBrut.length < 2) {
                    await interaction.editReply('❌ Le nom et le prénom RP ne sont pas valides.');
                    programmerSuppressionEphemere(interaction, 15000);
                    return;
                }

                const nomRp = nomBrut.toLocaleUpperCase('fr-FR');
                const prenomRp = prenomBrut
                    .toLocaleLowerCase('fr-FR')
                    .replace(/(^|[ '\-])\p{L}/gu, lettre => lettre.toLocaleUpperCase('fr-FR'));

                const pseudoDiscord =
                    interaction.user.username;

                let formatPseudo =
                    v.nicknameFormat || '{NOM} | {Prenom}';

                // Si la conservation du pseudo est désactivée, {PSEUDO}
                // est retiré proprement même s'il était présent dans un ancien format.
                if (v.keepDiscordUsername !== true) {
                    formatPseudo = formatPseudo
                        .replace(/\s*[|•-]?\s*\{(?:PSEUDO|Pseudo|pseudo)\}/g, '')
                        .replace(/\{(?:PSEUDO|Pseudo|pseudo)\}\s*[|•-]?\s*/g, '');
                }

                const pseudo = formaterPseudoVerification(
                    formatPseudo,
                    nomRp,
                    prenomRp,
                    pseudoDiscord
                );
                const rolesValides = Array.isArray(v.verifiedRoleIds)
                    ? v.verifiedRoleIds
                    : [];

                const rolesAjoutes = [];
                const rolesEchoues = [];

                for (const roleId of rolesValides) {
                    const role =
                        interaction.guild.roles.cache.get(roleId)
                        ||
                        await interaction.guild.roles.fetch(roleId).catch(() => null);

                    if (!role || !role.editable) {
                        rolesEchoues.push(roleId);
                        continue;
                    }

                    try {
                        await interaction.member.roles.add(
                            role,
                            'ORYUM SYSTEMS • Validation du règlement'
                        );
                        rolesAjoutes.push(roleId);
                    }
                    catch (_) {
                        rolesEchoues.push(roleId);
                    }
                }

                if (v.pendingRoleId) {
                    const roleAttente =
                        interaction.guild.roles.cache.get(v.pendingRoleId)
                        ||
                        await interaction.guild.roles.fetch(v.pendingRoleId).catch(() => null);

                    if (
                        roleAttente &&
                        roleAttente.editable &&
                        interaction.member.roles.cache.has(roleAttente.id)
                    ) {
                        await interaction.member.roles.remove(
                            roleAttente,
                            'ORYUM SYSTEMS • Validation terminée'
                        ).catch(() => {});
                    }
                }

                const modificationPseudoActivee =
                    v.nicknameEnabled !== false;

                let pseudoModifie = false;
                if (
                    modificationPseudoActivee &&
                    interaction.member.manageable
                ) {
                    try {
                        await interaction.member.setNickname(
                            pseudo,
                            'ORYUM SYSTEMS • Identité RP validée'
                        );
                        pseudoModifie = true;
                    }
                    catch (_) {}
                }

                let message =
                    `✅ **Validation terminée !**\n` +
                    `🪪 Identité RP : **${nomRp} ${prenomRp}**\n` +
                    `🎭 Rôles attribués : **${rolesAjoutes.length}**`;

                if (modificationPseudoActivee) {
                    message += `\n🏷️ Pseudo demandé : **${pseudo}**`;

                    if (!pseudoModifie) {
                        message += '\n⚠️ ORYUM n’a pas pu modifier ton pseudo. Vérifie la hiérarchie des rôles du bot.';
                    }
                }
                else {
                    message += '\n🏷️ Modification automatique du pseudo : **désactivée**';
                }

                if (rolesEchoues.length) {
                    message += `\n⚠️ ${rolesEchoues.length} rôle(s) n’ont pas pu être attribués.`;
                }

                await interaction.editReply(message);
                programmerSuppressionEphemere(interaction, 20000);
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
                        ligne2,
                        creerLigneRetourAdmin()
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
                            'Ex : Communauté Gaming'
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
                programmerSuppressionEphemere(interaction, 15000);


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
                programmerSuppressionEphemere(interaction, 15000);


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
                programmerSuppressionEphemere(interaction, 15000);


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
                programmerSuppressionEphemere(interaction, 15000);


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
                programmerSuppressionEphemere(interaction, 15000);


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

                // --------------------------------------------------
                // Ligne 1 : accès et permissions
                // --------------------------------------------------
                const ligne1 =
                    new ActionRowBuilder()
                        .addComponents(

                            new ButtonBuilder()
                                .setCustomId('ticket_access_roles')
                                .setLabel('Accès tickets')
                                .setEmoji('🎟️')
                                .setStyle(ButtonStyle.Primary),

                            new ButtonBuilder()
                                .setCustomId('ticket_access_roles_clear')
                                .setLabel('Effacer accès')
                                .setEmoji('🧹')
                                .setStyle(ButtonStyle.Secondary),

                            new ButtonBuilder()
                                .setCustomId('ticket_logs_channel')
                                .setLabel('Salon Logs')
                                .setEmoji('📜')
                                .setStyle(ButtonStyle.Secondary)

                        );


                // --------------------------------------------------
                // Ligne 2 : membres Staff individuels
                // --------------------------------------------------
                const ligne2 =
                    new ActionRowBuilder()
                        .addComponents(

                            new ButtonBuilder()
                                .setCustomId('ticket_staff_add')
                                .setLabel('Ajouter Staff')
                                .setEmoji('➕')
                                .setStyle(ButtonStyle.Success),

                            new ButtonBuilder()
                                .setCustomId('ticket_staff_remove')
                                .setLabel('Retirer Staff')
                                .setEmoji('➖')
                                .setStyle(ButtonStyle.Danger)

                        );


                // --------------------------------------------------
                // Ligne 3 : types de tickets
                // --------------------------------------------------
                const ligne3 =
                    new ActionRowBuilder()
                        .addComponents(

                            new ButtonBuilder()
                                .setCustomId('ticket_type_add')
                                .setLabel('Ajouter type')
                                .setEmoji('📂')
                                .setStyle(ButtonStyle.Success),

                            new ButtonBuilder()
                                .setCustomId('ticket_type_remove')
                                .setLabel('Supprimer type')
                                .setEmoji('🗑️')
                                .setStyle(ButtonStyle.Danger)

                        );


                // --------------------------------------------------
                // Ligne 4 : apparence du système de tickets
                // --------------------------------------------------
                const ligne4 =
                    new ActionRowBuilder()
                        .addComponents(

                            new ButtonBuilder()
                                .setCustomId('ticket_panel_style')
                                .setLabel('Style panneau')
                                .setEmoji('🎨')
                                .setStyle(ButtonStyle.Secondary),

                            new ButtonBuilder()
                                .setCustomId('ticket_embed_style')
                                .setLabel('Style ticket')
                                .setEmoji('📝')
                                .setStyle(ButtonStyle.Secondary),

                            new ButtonBuilder()
                                .setCustomId('ticket_panel_logo')
                                .setLabel('Logo panneau')
                                .setEmoji('🖼️')
                                .setStyle(ButtonStyle.Secondary),

                            new ButtonBuilder()
                                .setCustomId('ticket_panel_logo_remove')
                                .setLabel('Retirer logo')
                                .setEmoji('🗑️')
                                .setStyle(ButtonStyle.Danger),

                            new ButtonBuilder()
                                .setCustomId('ticket_button_color')
                                .setLabel('Couleur bouton')
                                .setEmoji('🎨')
                                .setStyle(ButtonStyle.Secondary)

                        );


                await interaction.update({

                    embeds: [
                        creerEmbedConfigTickets(
                            interaction.guild.id
                        )
                    ],

                    components: [
                        ligne1,
                        ligne2,
                        ligne3,
                        ligne4,
                        creerLigneRetourAdmin()
                    ]

                });


                return;

            }


            // ==================================================
            // COULEUR DU BOUTON PUBLIC DES TICKETS
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId === 'ticket_button_color'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );

                const menu =
                    new StringSelectMenuBuilder()
                        .setCustomId('ticket_button_color_select')
                        .setPlaceholder('Choisir la couleur du bouton')
                        .addOptions(
                            {
                                label: 'Bleu',
                                description: 'Style Primary de Discord',
                                value: 'Primary',
                                emoji: '🔵',
                                default: (config.tickets.panel.buttonStyle || 'Primary') === 'Primary'
                            },
                            {
                                label: 'Gris',
                                description: 'Style Secondary de Discord',
                                value: 'Secondary',
                                emoji: '⚫',
                                default: config.tickets.panel.buttonStyle === 'Secondary'
                            },
                            {
                                label: 'Vert',
                                description: 'Style Success de Discord',
                                value: 'Success',
                                emoji: '🟢',
                                default: config.tickets.panel.buttonStyle === 'Success'
                            },
                            {
                                label: 'Rouge',
                                description: 'Style Danger de Discord',
                                value: 'Danger',
                                emoji: '🔴',
                                default: config.tickets.panel.buttonStyle === 'Danger'
                            }
                        );

                await interaction.reply({
                    content:
                        '🎨 Choisis la couleur du bouton **Ouvrir un ticket** :',
                    components: [
                        new ActionRowBuilder()
                            .addComponents(menu)
                    ],
                    flags: MessageFlags.Ephemeral
                });

                return;
            }


            if (
                interaction.isStringSelectMenu() &&
                interaction.customId === 'ticket_button_color_select'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );

                const style = interaction.values[0];

                if (
                    !['Primary', 'Secondary', 'Success', 'Danger']
                        .includes(style)
                ) {
                    await interaction.update({
                        content: '❌ Couleur invalide.',
                        components: []
                    });
                    return;
                }

                config.tickets.panel.buttonStyle = style;

                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );

                const noms = {
                    Primary: '🔵 Bleu',
                    Secondary: '⚫ Gris',
                    Success: '🟢 Vert',
                    Danger: '🔴 Rouge'
                };

                await interaction.update({
                    content:
                        `✅ Couleur du bouton enregistrée : **${noms[style]}**.\n` +
                        'Elle sera utilisée lors de la prochaine création du panneau avec `/ticket-panel`.',
                    components: []
                });

                return;
            }


            // ==================================================
            // LOGO / THUMBNAIL DU PANNEAU TICKETS
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId === 'ticket_panel_logo'
            ) {

                const cle =
                    `${interaction.guild.id}:${interaction.user.id}`;

                attenteImageTicketPanel.set(
                    cle,
                    {
                        channelId: interaction.channel.id,
                        expiresAt: Date.now() + 120000
                    }
                );

                await interaction.reply({
                    content:
                        '🖼️ Envoie maintenant le **logo du panneau tickets** dans ce salon.\n' +
                        'Il sera affiché **en haut à droite** de l’embed.\n' +
                        'Tu as **2 minutes**.',
                    flags: MessageFlags.Ephemeral
                });

                programmerSuppressionEphemere(interaction, 30000);
                return;
            }


            if (
                interaction.isButton() &&
                interaction.customId === 'ticket_panel_logo_remove'
            ) {

                const config =
                    chargerConfigServeur(interaction.guild.id);

                config.tickets.panel.thumbnailUrl = '';

                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );

                await interaction.reply({
                    content: '✅ Logo du panneau tickets supprimé.',
                    flags: MessageFlags.Ephemeral
                });

                programmerSuppressionEphemere(interaction, 15000);
                return;
            }


            // ==================================================
            // RÔLES AYANT ACCÈS AUX TICKETS
            // ==================================================

            if (
                interaction.isButton() &&
                interaction.customId === 'ticket_access_roles'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );

                const actuels =
                    Array.isArray(config.tickets.ticketAccessRoleIds)
                        ? config.tickets.ticketAccessRoleIds
                        : [];

                const menu =
                    new RoleSelectMenuBuilder()
                        .setCustomId('select_ticket_access_roles')
                        .setPlaceholder('Choisis les rôles ayant accès aux tickets')
                        .setMinValues(1)
                        .setMaxValues(10);

                const texteActuel =
                    actuels.length
                        ? actuels.map(id => `<@&${id}>`).join(' • ')
                        : 'Aucun rôle configuré.';

                await interaction.reply({
                    content:
                        '🎟️ **Rôles ayant accès aux tickets**\n' +
                        'Les rôles sélectionnés pourront voir et écrire dans tous les nouveaux tickets.\n\n' +
                        `**Actuellement :** ${texteActuel}\n\n` +
                        'La nouvelle sélection remplacera la sélection actuelle.',
                    components: [
                        new ActionRowBuilder()
                            .addComponents(menu)
                    ],
                    flags: MessageFlags.Ephemeral
                });

                programmerSuppressionEphemere(interaction, 30000);
                return;
            }


            if (
                interaction.isRoleSelectMenu() &&
                interaction.customId === 'select_ticket_access_roles'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );

                const roleIds =
                    [...new Set(interaction.values)]
                        .filter(roleId =>
                            interaction.guild.roles.cache.has(roleId)
                        );

                config.tickets.ticketAccessRoleIds =
                    roleIds;

                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );

                const liste =
                    roleIds.map(id => `<@&${id}>`).join(' • ');

                await interaction.update({
                    content:
                        `✅ Accès aux tickets configuré pour : ${liste}`,
                    components: []
                });

                programmerSuppressionEphemere(interaction, 15000);
                return;
            }


            if (
                interaction.isButton() &&
                interaction.customId === 'ticket_access_roles_clear'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );

                config.tickets.ticketAccessRoleIds = [];

                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );

                await interaction.reply({
                    content:
                        '✅ La liste des rôles ayant accès aux tickets a été vidée.',
                    flags: MessageFlags.Ephemeral
                });

                programmerSuppressionEphemere(interaction, 15000);
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
                programmerSuppressionEphemere(interaction, 30000);


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
                programmerSuppressionEphemere(interaction, 30000);


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
                programmerSuppressionEphemere(interaction, 15000);


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
                    programmerSuppressionEphemere(interaction, 15000);


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
                programmerSuppressionEphemere(interaction, 30000);


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

                    openCategoryId:
                        '',

                    claimedCategoryId:
                        ''

                };


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                const menu =
                    new ChannelSelectMenuBuilder()

                        .setCustomId(
                            `select_ticket_type_open_category_${typeId}`
                        )

                        .setPlaceholder(
                            'Catégorie à l’ouverture du ticket'
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
                        `📂 Type **${nom}** créé.\nChoisis la catégorie où le ticket doit être créé :`,

                    components: [

                        new ActionRowBuilder()
                            .addComponents(
                                menu
                            )

                    ],

                    flags:
                        MessageFlags.Ephemeral

                });
                programmerSuppressionEphemere(interaction, 30000);


                return;

            }


            // ==================================================
            // CATÉGORIE À L'OUVERTURE DU TICKET
            // ==================================================

            if (
                interaction.isChannelSelectMenu() &&
                interaction.customId.startsWith(
                    'select_ticket_type_open_category_'
                )
            ) {

                const typeId =
                    interaction.customId.replace(
                        'select_ticket_type_open_category_',
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


                type.openCategoryId =
                    interaction.values[0];


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                const menu =
                    new ChannelSelectMenuBuilder()

                        .setCustomId(
                            `select_ticket_type_claimed_category_${typeId}`
                        )

                        .setPlaceholder(
                            'Catégorie après prise en charge'
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


                await interaction.update({

                    content:
                        `✅ Catégorie d’ouverture : <#${type.openCategoryId}>\n\n` +
                        '📂 Choisis maintenant la catégorie où le ticket sera déplacé lorsqu’un Staff le prendra en charge :',

                    components: [

                        new ActionRowBuilder()
                            .addComponents(
                                menu
                            )

                    ]

                });


                return;

            }


            // ==================================================
            // CATÉGORIE APRÈS PRISE EN CHARGE
            // ==================================================

            if (
                interaction.isChannelSelectMenu() &&
                interaction.customId.startsWith(
                    'select_ticket_type_claimed_category_'
                )
            ) {

                const typeId =
                    interaction.customId.replace(
                        'select_ticket_type_claimed_category_',
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


                type.claimedCategoryId =
                    interaction.values[0];


                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );


                await interaction.update({

                    content:
                        `✅ ${emojiValide(type.emoji)} **${type.name}** configuré.\n\n` +
                        `📥 Ouverture : <#${type.openCategoryId}>\n` +
                        `🙋 Après prise en charge : <#${type.claimedCategoryId}>`,

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
                    programmerSuppressionEphemere(interaction, 15000);


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
                programmerSuppressionEphemere(interaction, 30000);


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
                programmerSuppressionEphemere(interaction, 15000);


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
                programmerSuppressionEphemere(interaction, 15000);


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

                const configAcces =
                    chargerConfigServeur(
                        interaction.guild.id
                    );


                if (
                    !utilisateurPeutAdministrerBot(
                        interaction,
                        configAcces
                    )
                ) {

                    await interaction.reply({

                        content:
                            '❌ Tu n’as pas l’autorisation de créer le panneau des tickets.',

                        flags:
                            MessageFlags.Ephemeral

                    });
                    programmerSuppressionEphemere(interaction, 15000);


                    return;

                }


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
                    programmerSuppressionEphemere(interaction, 15000);


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


                if (
                    config.tickets.panel.thumbnailUrl
                ) {

                    embed.setThumbnail(
                        config.tickets.panel.thumbnailUrl
                    );

                }

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
                            styleBoutonDiscord(
                                config.tickets.panel.buttonStyle,
                                ButtonStyle.Primary
                            )
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
                programmerSuppressionEphemere(interaction, 15000);


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
                    programmerSuppressionEphemere(interaction, 15000);


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
                programmerSuppressionEphemere(interaction, 30000);


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
                    programmerSuppressionEphemere(interaction, 15000);


                    return;

                }


                const openCategoryId =
                    categorieOuvertureTicket(
                        type
                    );


                if (
                    !openCategoryId
                ) {

                    await interaction.editReply(
                        '❌ Aucune catégorie d’ouverture n’est configurée pour ce type de ticket.'
                    );
                    programmerSuppressionEphemere(interaction, 15000);


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
                    programmerSuppressionEphemere(interaction, 15000);


                    return;

                }


                // --------------------------------------------------
                // Vérifier catégorie
                // --------------------------------------------------

                const categorie =

                    interaction.guild.channels.cache.get(
                        openCategoryId
                    )

                    ||

                    await interaction.guild.channels.fetch(
                        openCategoryId
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
                        '❌ La catégorie d’ouverture configurée pour ce type de ticket est introuvable.'
                    );
                    programmerSuppressionEphemere(interaction, 15000);


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


                // --------------------------------------------------
                // Rôles autorisés à voir les tickets
                // --------------------------------------------------

                const rolesAccesTickets =
                    Array.isArray(
                        config.tickets.ticketAccessRoleIds
                    )
                        ? config.tickets.ticketAccessRoleIds
                        : [];


                for (
                    const roleId
                    of rolesAccesTickets
                ) {

                    const role =
                        interaction.guild.roles.cache.get(
                            roleId
                        );

                    if (
                        !role ||
                        role.id === interaction.guild.roles.everyone.id
                    ) {
                        continue;
                    }

                    permissions.push({

                        id: role.id,

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
                        [
                            `${interaction.user}`,
                            ...(
                                Array.isArray(
                                    config.tickets.ticketAccessRoleIds
                                )
                                    ? config.tickets.ticketAccessRoleIds
                                        .map(
                                            roleId =>
                                                `<@&${roleId}>`
                                        )
                                    : []
                            )
                        ].join(' '),

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
                            Array.isArray(
                                config.tickets.ticketAccessRoleIds
                            )
                                ? config.tickets.ticketAccessRoleIds
                                : []

                    }

                });


                await interaction.editReply(
                    `✅ Ton ticket a été créé : ${ticketChannel}`
                );
                programmerSuppressionEphemere(interaction, 15000);


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
                    programmerSuppressionEphemere(interaction, 15000);


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


                const aRoleTicket =
                    Array.isArray(
                        config.tickets.ticketAccessRoleIds
                    ) &&
                    config.tickets.ticketAccessRoleIds.some(
                        roleId =>
                            membre.roles.cache.has(
                                roleId
                            )
                    );


                const estStaffConfigure =
                    Boolean(
                        config.tickets.staffMembers[
                            interaction.user.id
                        ]
                    );


                if (
                    !estAdmin &&
                    !aRoleTicket &&
                    !estStaffConfigure
                ) {

                    await interaction.reply({

                        content:
                            '❌ Tu n’as pas l’autorisation de gérer ce ticket.',

                        flags:
                            MessageFlags.Ephemeral

                    });
                    programmerSuppressionEphemere(interaction, 15000);


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
                        programmerSuppressionEphemere(interaction, 15000);

                    }

                    else {

                        await interaction.reply({

                            content:
                                `❌ Ce ticket est déjà pris en charge par <@${claimId}>.`,

                            flags:
                                MessageFlags.Ephemeral

                        });
                        programmerSuppressionEphemere(interaction, 15000);

                    }


                    return;

                }


                // --------------------------------------------------
                // Retrouver le type du ticket et sa catégorie de claim
                // --------------------------------------------------

                const typeId =
                    topic.match(
                        /ticket-type:([^|\s]+)/
                    )?.[1] ||
                    null;


                const type =
                    typeId
                        ? config.tickets.types[
                            typeId
                        ]
                        : null;


                if (
                    !type
                ) {

                    await interaction.reply({

                        content:
                            '❌ Impossible de retrouver le type de ce ticket.',

                        flags:
                            MessageFlags.Ephemeral

                    });
                    programmerSuppressionEphemere(interaction, 15000);


                    return;

                }


                const claimedCategoryId =
                    categorieClaimTicket(
                        type
                    );


                if (
                    !claimedCategoryId
                ) {

                    await interaction.reply({

                        content:
                            '❌ Aucune catégorie de prise en charge n’est configurée pour ce type de ticket.',

                        flags:
                            MessageFlags.Ephemeral

                    });
                    programmerSuppressionEphemere(interaction, 15000);


                    return;

                }


                const categorieClaim =
                    interaction.guild.channels.cache.get(
                        claimedCategoryId
                    )

                    ||

                    await interaction.guild.channels.fetch(
                        claimedCategoryId
                    )
                        .catch(
                            () => null
                        );


                if (
                    !categorieClaim ||
                    categorieClaim.type !==
                        ChannelType.GuildCategory
                ) {

                    await interaction.reply({

                        content:
                            '❌ La catégorie de prise en charge configurée pour ce type est introuvable.',

                        flags:
                            MessageFlags.Ephemeral

                    });
                    programmerSuppressionEphemere(interaction, 15000);


                    return;

                }


                // --------------------------------------------------
                // Déplacer le ticket vers la catégorie du type
                // --------------------------------------------------

                if (
                    interaction.channel.parentId !==
                    categorieClaim.id
                ) {

                    await interaction.channel.setParent(
                        categorieClaim.id,
                        {
                            lockPermissions:
                                false
                        }
                    );

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


                    // Retire un ancien préfixe "claim-" si présent
                    let nomPropre =
                        nomActuel.replace(
                            /^claim-/,
                            ''
                        );


                    // Retire aussi un ancien emoji placé devant
                    nomPropre =
                        nomPropre.replace(
                            /^[^\p{L}\p{N}]+/u,
                            ''
                        );


                    // Ajoute l'emoji du staff devant le ticket
                    const nouveauNom =
                        `${emojiStaff}・${nomPropre}`
                            .slice(
                                0,
                                100
                            );


                    await interaction.channel.setName(
                        nouveauNom
                    )
                        .catch(
                            error => {

                                console.error(
                                    '❌ Impossible de mettre l’emoji dans le nom du ticket :',
                                    error
                                );

                            }
                        );

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
                programmerSuppressionEphemere(interaction, 15000);


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
                    programmerSuppressionEphemere(interaction, 15000);


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


                const aRoleTicket =
                    Array.isArray(
                        config.tickets.ticketAccessRoleIds
                    ) &&
                    config.tickets.ticketAccessRoleIds.some(
                        roleId =>
                            membre.roles.cache.has(
                                roleId
                            )
                    );


                const estStaffConfigure =
                    Boolean(
                        config.tickets.staffMembers[
                            interaction.user.id
                        ]
                    );


                if (
                    !estAdmin &&
                    !aRoleTicket &&
                    !estStaffConfigure
                ) {

                    await interaction.reply({

                        content:
                            '❌ Tu n’as pas l’autorisation de fermer ce ticket.',

                        flags:
                            MessageFlags.Ephemeral

                    });
                    programmerSuppressionEphemere(interaction, 15000);


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
                    programmerSuppressionEphemere(interaction, 15000);


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
                programmerSuppressionEphemere(interaction, 15000);


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

                const ligne1 =
                    new ActionRowBuilder()
                        .addComponents(

                            new ButtonBuilder()
                                .setCustomId('welcome_arrival_panel')
                                .setLabel('Arrivée publique')
                                .setEmoji('🎉')
                                .setStyle(ButtonStyle.Primary),

                            new ButtonBuilder()
                                .setCustomId('welcome_departure_panel')
                                .setLabel('Départ public')
                                .setEmoji('👋')
                                .setStyle(ButtonStyle.Secondary),

                            new ButtonBuilder()
                                .setCustomId('welcome_dm_panel')
                                .setLabel('Bienvenue en DM')
                                .setEmoji('✉️')
                                .setStyle(ButtonStyle.Success)

                        );


                await interaction.update({
                    embeds: [
                        creerEmbedConfigBienvenue(
                            interaction.guild.id
                        )
                    ],
                    components: [
                        ligne1,
                        creerLigneRetourAdmin()
                    ]
                });

                return;

            }


// ==================================================
// SOUS-PANEL ARRIVÉE PUBLIQUE
// ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'welcome_arrival_panel'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );

                const embed =
                    new EmbedBuilder()
                        .setColor('#F47B20')
                        .setTitle('🎉 ARRIVÉE PUBLIQUE')
                        .setDescription('Configure le message envoyé dans un salon lorsqu’un membre rejoint le serveur.')
                        .addFields(
                            {
                                name: 'État',
                                value: config.welcome.welcomeEnabled ? '✅ Activé' : '❌ Désactivé',
                                inline: true
                            },
                            {
                                name: 'Salon',
                                value: config.welcome.welcomeChannelId ? `<#${config.welcome.welcomeChannelId}>` : '❌ Non configuré',
                                inline: true
                            },
                            {
                                name: 'Avatar membre',
                                value: config.welcome.welcomeShowAvatar ? '✅ Affiché' : '❌ Masqué',
                                inline: true
                            },
                            {
                                name: 'Image',
                                value: config.welcome.welcomeImageUrl ? '✅ Configurée' : '❌ Aucune',
                                inline: true
                            }
                        );

                const ligne1 =
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('welcome_toggle')
                            .setLabel(config.welcome.welcomeEnabled ? 'Désactiver' : 'Activer')
                            .setEmoji(config.welcome.welcomeEnabled ? '🔴' : '🟢')
                            .setStyle(config.welcome.welcomeEnabled ? ButtonStyle.Danger : ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('welcome_channel')
                            .setLabel('Salon')
                            .setEmoji('📍')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('welcome_style')
                            .setLabel('Message')
                            .setEmoji('📝')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('welcome_avatar_toggle')
                            .setLabel('Avatar')
                            .setEmoji('👤')
                            .setStyle(config.welcome.welcomeShowAvatar ? ButtonStyle.Success : ButtonStyle.Secondary)
                    );

                const ligne2 =
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('welcome_image')
                            .setLabel('Ajouter image')
                            .setEmoji('🖼️')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('welcome_image_delete')
                            .setLabel('Retirer image')
                            .setEmoji('🗑️')
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId('admin_bienvenue')
                            .setLabel('Retour')
                            .setEmoji('⬅️')
                            .setStyle(ButtonStyle.Secondary)
                    );

                await interaction.update({
                    embeds: [embed],
                    components: [ligne1, ligne2]
                });

                return;

            }


// ==================================================
// SOUS-PANEL DÉPART PUBLIC
// ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'welcome_departure_panel'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );

                const embed =
                    new EmbedBuilder()
                        .setColor('#F47B20')
                        .setTitle('👋 DÉPART PUBLIC')
                        .setDescription('Configure le message envoyé dans un salon lorsqu’un membre quitte le serveur.')
                        .addFields(
                            {
                                name: 'État',
                                value: config.welcome.goodbyeEnabled ? '✅ Activé' : '❌ Désactivé',
                                inline: true
                            },
                            {
                                name: 'Salon',
                                value: config.welcome.goodbyeChannelId ? `<#${config.welcome.goodbyeChannelId}>` : '❌ Non configuré',
                                inline: true
                            },
                            {
                                name: 'Avatar membre',
                                value: config.welcome.goodbyeShowAvatar ? '✅ Affiché' : '❌ Masqué',
                                inline: true
                            },
                            {
                                name: 'Image',
                                value: config.welcome.goodbyeImageUrl ? '✅ Configurée' : '❌ Aucune',
                                inline: true
                            }
                        );

                const ligne1 =
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('goodbye_toggle')
                            .setLabel(config.welcome.goodbyeEnabled ? 'Désactiver' : 'Activer')
                            .setEmoji(config.welcome.goodbyeEnabled ? '🔴' : '🟢')
                            .setStyle(config.welcome.goodbyeEnabled ? ButtonStyle.Danger : ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('goodbye_channel')
                            .setLabel('Salon')
                            .setEmoji('📍')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('goodbye_style')
                            .setLabel('Message')
                            .setEmoji('📝')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('goodbye_avatar_toggle')
                            .setLabel('Avatar')
                            .setEmoji('👤')
                            .setStyle(config.welcome.goodbyeShowAvatar ? ButtonStyle.Success : ButtonStyle.Secondary)
                    );

                const ligne2 =
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('goodbye_image')
                            .setLabel('Ajouter image')
                            .setEmoji('🖼️')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('goodbye_image_delete')
                            .setLabel('Retirer image')
                            .setEmoji('🗑️')
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId('admin_bienvenue')
                            .setLabel('Retour')
                            .setEmoji('⬅️')
                            .setStyle(ButtonStyle.Secondary)
                    );

                await interaction.update({
                    embeds: [embed],
                    components: [ligne1, ligne2]
                });

                return;

            }


// ==================================================
// SOUS-PANEL BIENVENUE EN DM
// ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'welcome_dm_panel'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );

                const embed =
                    new EmbedBuilder()
                        .setColor('#F47B20')
                        .setTitle('✉️ BIENVENUE EN MESSAGE PRIVÉ')
                        .setDescription('Configure le message envoyé directement en DM au nouveau membre.')
                        .addFields(
                            {
                                name: 'État',
                                value: config.welcome.welcomeDmEnabled ? '✅ Activé' : '❌ Désactivé',
                                inline: true
                            },
                            {
                                name: 'Avatar membre',
                                value: config.welcome.welcomeDmShowAvatar ? '✅ Affiché' : '❌ Masqué',
                                inline: true
                            },
                            {
                                name: 'Image',
                                value: config.welcome.welcomeDmImageUrl ? '✅ Configurée' : '❌ Aucune',
                                inline: true
                            },
                            {
                                name: 'Information',
                                value: 'Le membre doit autoriser les messages privés du serveur pour recevoir ce message.',
                                inline: false
                            }
                        );

                const ligne1 =
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('welcome_dm_toggle')
                            .setLabel(config.welcome.welcomeDmEnabled ? 'Désactiver' : 'Activer')
                            .setEmoji(config.welcome.welcomeDmEnabled ? '🔴' : '🟢')
                            .setStyle(config.welcome.welcomeDmEnabled ? ButtonStyle.Danger : ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('welcome_dm_style')
                            .setLabel('Message')
                            .setEmoji('📝')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('welcome_dm_avatar_toggle')
                            .setLabel('Avatar')
                            .setEmoji('👤')
                            .setStyle(config.welcome.welcomeDmShowAvatar ? ButtonStyle.Success : ButtonStyle.Secondary)
                    );

                const ligne2 =
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('welcome_dm_image')
                            .setLabel('Ajouter image')
                            .setEmoji('🖼️')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('welcome_dm_image_delete')
                            .setLabel('Retirer image')
                            .setEmoji('🗑️')
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId('admin_bienvenue')
                            .setLabel('Retour')
                            .setEmoji('⬅️')
                            .setStyle(ButtonStyle.Secondary)
                    );

                await interaction.update({
                    embeds: [embed],
                    components: [ligne1, ligne2]
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
                programmerSuppressionEphemere(interaction, 15000);


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
                programmerSuppressionEphemere(interaction, 15000);


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
                programmerSuppressionEphemere(interaction, 30000);


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
                programmerSuppressionEphemere(interaction, 30000);


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
                programmerSuppressionEphemere(interaction, 15000);


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
                programmerSuppressionEphemere(interaction, 15000);


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
                programmerSuppressionEphemere(interaction, 15000);


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
                programmerSuppressionEphemere(interaction, 15000);


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
                programmerSuppressionEphemere(interaction, 30000);


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
                programmerSuppressionEphemere(interaction, 30000);


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
                programmerSuppressionEphemere(interaction, 15000);


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
                programmerSuppressionEphemere(interaction, 15000);


                return;

            }

// ==================================================
// ACTIVER / DÉSACTIVER BIENVENUE EN DM
// ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'welcome_dm_toggle'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );

                config.welcome.welcomeDmEnabled =
                    !config.welcome.welcomeDmEnabled;

                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );

                await interaction.reply({
                    content:
                        config.welcome.welcomeDmEnabled
                            ? '✅ Message privé de bienvenue activé.'
                            : '❌ Message privé de bienvenue désactivé.',
                    flags:
                        MessageFlags.Ephemeral
                });
                programmerSuppressionEphemere(interaction, 15000);

                return;

            }


// ==================================================
// STYLE BIENVENUE EN DM
// ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'welcome_dm_style'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );

                const modal =
                    new ModalBuilder()
                        .setCustomId('modal_welcome_dm_style')
                        .setTitle('Message privé de bienvenue');

                const titre =
                    new TextInputBuilder()
                        .setCustomId('welcome_dm_title')
                        .setLabel('Titre')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                        .setMaxLength(256)
                        .setValue(config.welcome.welcomeDmTitle || '👋 Bienvenue sur {server}');

                const message =
                    new TextInputBuilder()
                        .setCustomId('welcome_dm_message')
                        .setLabel('Message')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                        .setMaxLength(4000)
                        .setValue(config.welcome.welcomeDmMessage || 'Ravi de t’avoir parmi nous !');

                const couleur =
                    new TextInputBuilder()
                        .setCustomId('welcome_dm_color')
                        .setLabel('Couleur HEX')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                        .setMaxLength(7)
                        .setPlaceholder('#F47B20')
                        .setValue(config.welcome.welcomeDmColor || '#F47B20');

                modal.addComponents(
                    new ActionRowBuilder().addComponents(titre),
                    new ActionRowBuilder().addComponents(message),
                    new ActionRowBuilder().addComponents(couleur)
                );

                await interaction.showModal(modal);

                return;

            }


            if (
                interaction.isModalSubmit() &&
                interaction.customId ===
                    'modal_welcome_dm_style'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );

                config.welcome.welcomeDmTitle =
                    interaction.fields.getTextInputValue('welcome_dm_title').trim();

                config.welcome.welcomeDmMessage =
                    interaction.fields.getTextInputValue('welcome_dm_message').trim();

                config.welcome.welcomeDmColor =
                    couleurValide(
                        interaction.fields.getTextInputValue('welcome_dm_color').trim(),
                        '#F47B20'
                    );

                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );

                await interaction.reply({
                    content: '✅ Message privé de bienvenue enregistré.',
                    flags: MessageFlags.Ephemeral
                });
                programmerSuppressionEphemere(interaction, 15000);

                return;

            }


// ==================================================
// AVATAR BIENVENUE EN DM
// ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'welcome_dm_avatar_toggle'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );

                config.welcome.welcomeDmShowAvatar =
                    !config.welcome.welcomeDmShowAvatar;

                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );

                await interaction.reply({
                    content:
                        config.welcome.welcomeDmShowAvatar
                            ? '✅ Avatar activé dans le DM de bienvenue.'
                            : '❌ Avatar désactivé dans le DM de bienvenue.',
                    flags: MessageFlags.Ephemeral
                });
                programmerSuppressionEphemere(interaction, 15000);

                return;

            }


// ==================================================
// IMAGE BIENVENUE EN DM
// ==================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                    'welcome_dm_image'
            ) {

                const cle =
                    `${interaction.guild.id}:${interaction.user.id}`;

                attenteImageBienvenue.set(
                    cle,
                    {
                        type: 'welcome_dm',
                        channelId: interaction.channel.id,
                        expiresAt: Date.now() + 120000
                    }
                );

                await interaction.reply({
                    content: '🖼️ Envoie maintenant **l’image du DM de bienvenue** dans ce salon.\nTu as **2 minutes**.',
                    flags: MessageFlags.Ephemeral
                });
                programmerSuppressionEphemere(interaction, 30000);

                return;

            }


            if (
                interaction.isButton() &&
                interaction.customId ===
                    'welcome_dm_image_delete'
            ) {

                const config =
                    chargerConfigServeur(
                        interaction.guild.id
                    );

                config.welcome.welcomeDmImageUrl =
                    '';

                sauvegarderConfigServeur(
                    interaction.guild.id,
                    config
                );

                await interaction.reply({
                    content: '✅ Image du DM de bienvenue supprimée.',
                    flags: MessageFlags.Ephemeral
                });
                programmerSuppressionEphemere(interaction, 15000);

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
                        ligne,
                        creerLigneRetourAdmin()
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
                programmerSuppressionEphemere(interaction, 30000);


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
                programmerSuppressionEphemere(interaction, 15000);


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
                    programmerSuppressionEphemere(interaction, 15000);


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
                programmerSuppressionEphemere(interaction, 15000);


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
                    programmerSuppressionEphemere(interaction, 15000);


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
                    programmerSuppressionEphemere(interaction, 15000);


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
                programmerSuppressionEphemere(interaction, 30000);


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
                    programmerSuppressionEphemere(interaction, 15000);


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
                    programmerSuppressionEphemere(interaction, 15000);


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
                    programmerSuppressionEphemere(interaction, 15000);


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
                        r2,
                        creerLigneRetourAdmin()
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
                programmerSuppressionEphemere(interaction, 30000);


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
                        programmerSuppressionEphemere(interaction, 15000);


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
                    programmerSuppressionEphemere(interaction, 15000);

                }

                catch (error) {

                    console.error(
                        '❌ Ajout streamer :',
                        error
                    );


                    await interaction.editReply(
                        `❌ Impossible d'ajouter cette chaîne Twitch.\n\`${error.message}\``
                    );
                    programmerSuppressionEphemere(interaction, 15000);

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
                    programmerSuppressionEphemere(interaction, 15000);


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
                programmerSuppressionEphemere(interaction, 30000);


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
                programmerSuppressionEphemere(interaction, 15000);


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
                    programmerSuppressionEphemere(interaction, 15000);

                }

                catch (error) {

                    console.error(
                        `❌ Vérification Twitch manuelle [${interaction.guild.name}] :`,
                        error
                    );


                    await interaction.editReply(
                        `❌ Erreur Twitch : \`${error.message}\``
                    );
                    programmerSuppressionEphemere(interaction, 15000);

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
// VOCAUX ÉPHÉMÈRES - CRÉATION / SUPPRESSION
// ======================================================

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    try {
        const guild = newState.guild || oldState.guild;
        if (!guild) return;
        const config = chargerConfigServeur(guild.id);
        const tv = obtenirConfigVocauxTemporaires(config);

        if (oldState.channelId && oldState.channelId !== newState.channelId) {
            const active = tv.activeChannels[oldState.channelId];
            if (active) {
                const oldChannel = guild.channels.cache.get(oldState.channelId);
                if (!oldChannel || oldChannel.members.size === 0) {
                    if (oldChannel) await oldChannel.delete('ORYUM SYSTEMS - vocal éphémère vide').catch(() => {});
                    delete tv.activeChannels[oldState.channelId];
                    sauvegarderConfigServeur(guild.id, config);
                }
            }
        }

        if (!tv.enabled || !newState.channelId || oldState.channelId === newState.channelId) return;
        const profilEntree = trouverProfilCreateurParSalon(config, newState.channelId);
        if (!profilEntree) return;

        const [profileId, profil] = profilEntree;
        const member = newState.member;
        if (!member || member.user.bot) return;
        if (!membreAutoriseProfilVocal(member, profil)) {
            await member.voice.disconnect('ORYUM SYSTEMS - rôle non autorisé pour ce salon créateur').catch(() => {});
            return;
        }
        const categorie = guild.channels.cache.get(profil.categoryId);
        const parentId = categorie && categorie.type === ChannelType.GuildCategory ? categorie.id : newState.channel?.parentId || null;
        const numero = Object.values(tv.activeChannels).filter(x => x && x.profileId === profileId).length + 1;
        const nom = formatNomVocalTemporaire(profil.voiceNameFormat, member, numero);

        const rolesAutorises = rolesAutorisesProfilVocal(profil);
        const rolesVisibles = rolesVisiblesProfilVocal(profil);
        const permissionOverwrites = [];

        if (rolesVisibles.length) {
            permissionOverwrites.push({
                id: guild.roles.everyone.id,
                deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
            });
            for (const roleId of rolesVisibles) {
                if (guild.roles.cache.has(roleId)) {
                    permissionOverwrites.push({ id: roleId, allow: [PermissionFlagsBits.ViewChannel] });
                }
            }
        } else if (rolesAutorises.length) {
            permissionOverwrites.push({ id: guild.roles.everyone.id, deny: [PermissionFlagsBits.Connect] });
        }

        for (const roleId of rolesAutorises) {
            if (guild.roles.cache.has(roleId)) {
                permissionOverwrites.push({
                    id: roleId,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
                });
            }
        }
        permissionOverwrites.push({
            id: member.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers]
        });

        const tempChannel = await guild.channels.create({
            name: nom || `Vocal de ${member.displayName}`,
            type: ChannelType.GuildVoice,
            parent: parentId,
            userLimit: Math.max(0, Math.min(99, Number(profil.userLimit) || 0)),
            permissionOverwrites,
            reason: `ORYUM SYSTEMS - vocal éphémère de ${member.user.tag}`
        });

        tv.activeChannels[tempChannel.id] = { ownerId: member.id, profileId, createdAt: Date.now() };
        sauvegarderConfigServeur(guild.id, config);

        try {
            await member.voice.setChannel(tempChannel);
        } catch (moveError) {
            delete tv.activeChannels[tempChannel.id];
            sauvegarderConfigServeur(guild.id, config);
            await tempChannel.delete('ORYUM SYSTEMS - déplacement impossible').catch(() => {});
            console.error('❌ Impossible de déplacer le membre dans son vocal éphémère :', moveError);
        }
    } catch (error) {
        console.error('❌ Erreur VoiceStateUpdate / vocaux éphémères :', error);
    }
});


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
        '🟠 ORYUM SYSTEMS // DÉMARRAGE'
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
