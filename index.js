/**
 * ============================================================================
 * BOT OFICIAL DE REGISTRO DE SET, REGRAS NO PV, QUIZ FIVEZ & LOGS
 * CLÃ HUNTERS & FAMÍLIA SOUZA (DISCORD.JS V14 - ES MODULES)
 * ============================================================================
 * 
 * ⚠️ ATENÇÃO: Requer "type": "module" no seu package.json!
 * 
 * Instalação dos pacotes:
 * npm install discord.js express
 */

import express from 'express';
import {
    Client,
    GatewayIntentBits,
    Partials,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    Events,
    PermissionsBitField
} from "discord.js";

// CONFIGURAÇÃO DE AMBIENTE & TOKEN
const TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN || "SEU_DISCORD_BOT_TOKEN";
const PORT = process.env.PORT || 3000;

// CONFIGURAÇÃO DOS IDS DO SERVIDOR
const CONFIG = {
    CANAL_REGISTRO_ID: process.env.CANAL_REGISTRO_ID || "1515125852264603700",
    CANAL_APROVACAO_ID: process.env.CANAL_APROVACAO_ID || "1515448473246498866",
    CANAL_LOGS_ID: process.env.CANAL_LOGS_ID || "1515448473246498866",
    CANAL_ENTRADA_SAIDA_ID: process.env.CANAL_ENTRADA_SAIDA_ID || "1515125850419220500",
    CANAL_PAINEL_AUSENCIA_ID: process.env.CANAL_PAINEL_AUSENCIA_ID || "1531670381016772700",
    CANAL_AUSENCIA_LOGS_ID: process.env.CANAL_AUSENCIA_LOGS_ID || "1531670383483158700",

    CARGOS_ADMINS_APROVADORES: [
        process.env.CARGO_ADMIN_1 || "1515125820836941985",
        process.env.CARGO_ADMIN_2 || "1515125822795546715"
    ],

    EMBED_COLOR: "#2ECC71",
    FOOTER: "FiveZ & Lumenfall • Sistema Automático Anti-Queda • Família Souza",

    GRUPOS: [
        {
            id: "grupo_hunters",
            name: "Hunters FiveZ (Recruta)",
            roleId: process.env.CARGO_HUNTERS_RECRUTA || "1515125826780135485",
            tag: "|Recruta|",
            description: "Set padrão para recrutas do Clã Hunters com questionário FiveZ",
            emoji: "🎯"
        },
        {
            id: "grupo_comprador",
            name: "Comprador FiveZ",
            roleId: process.env.CARGO_COMPRADOR_FIVEZ || "1517662363266842725",
            tag: "|Comprador|",
            description: "Compradores oficiais FiveZ",
            emoji: "🛒"
        },
        {
            id: "grupo_souza",
            name: "Família Souza",
            roleId: process.env.CARGO_FAMILIA_SOUZA || "1515125828185493675",
            tag: "|Família Souza|",
            description: "Membros oficiais da Família Souza",
            emoji: "👑"
        }
    ]
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel, Partials.Message, Partials.GuildMember]
});

// SERVIDOR EXPRESS KEEP-ALIVE
const app = express();
app.get('/', (req, res) => res.send('🟢 Bot Família Souza & Clã Hunters Online 24/7!'));
app.listen(PORT, () => console.log(`🌐 Servidor Keep-Alive rodando na porta ${PORT}`));

client.once(Events.ClientReady, c => console.log(`🤖 BOT CONECTADO COMO: ${c.user.tag}`));

client.login(TOKEN);
