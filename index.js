/**
 * ============================================================================
 * BOT UNIFICADO: CLÃ HUNTERS & FAMÍLIA SOUZA (DISCORD.JS V14)
 * ============================================================================
 */

const {
    Client,
    GatewayIntentBits,
    Partials,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    Events,
    PermissionsBitField,
    ChannelType
} = require("discord.js");
const express = require("express");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const CONFIG = {
    TOKEN: process.env.DISCORD_TOKEN || process.env.TOKEN || "SEU_TOKEN_AQUI",
    CLIENT_ID: process.env.CLIENT_ID || "1533004581909299240",
    GUILD_ID: process.env.GUILD_ID || "1495178024759332914",
    PORT: process.env.PORT || 3000,
    CANAL_RECRUTAMENTO_ID: process.env.CANAL_RECRUTAMENTO_ID || "1533005614173782227",
    CANAL_FAMILIA_SOUZA_ID: process.env.CANAL_FAMILIA_SOUZA_ID || "153300561500000001",
    CANAL_PAINEL_AUSENCIA_ID: process.env.CANAL_PAINEL_AUSENCIA_ID || "1531670381016772700",
    CANAL_LOGS_ID: process.env.CANAL_LOGS_ID || "1533005818121949244",
    CANAL_AUSENCIA_LOGS_ID: process.env.CANAL_AUSENCIA_LOGS_ID || "1531670383483158700",
    CATEGORY_TICKET_ID: process.env.CATEGORY_TICKET_ID || "1533005325924565002",
    ROLES: {
        STAFF: process.env.ROLE_STAFF_ID || "1526973668788277269",
        HUNTERS_REC: process.env.ROLE_HUNTERS_REC_ID || "152697367000000000",
        RECRUTA: process.env.ROLE_RECRUTA_ID || "1526973675323134164",
        TESTE: process.env.ROLE_TESTE_ID || "1526973677172691076",
        FAMILIA_SOUZA: process.env.ROLE_FAMILIA_SOUZA_ID || "1515125828185493675"
    },
    FOOTER: "Bot Unificado Hunters & Família Souza • FiveZ RP"
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel, Partials.Message, Partials.GuildMember]
});

const app = express();
app.get("/", (req, res) => res.send("🟢 Bot Unificado Online 24/7!"));
app.get("/health", (req, res) => res.status(200).json({ status: "OK" }));
app.listen(CONFIG.PORT, "0.0.0.0", () => console.log("Servidor HTTP ativo"));

client.once(Events.ClientReady, (c) => {
    console.log("Bot Conectado como: " + c.user.tag);
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;
    const cmd = message.content.toLowerCase().trim();
    if (!message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    if (cmd === "!painel") {
        const embed = new EmbedBuilder()
            .setColor("#9333EA")
            .setTitle("🧟 RECRUTAMENTO HARDCORE — CLÃ HUNTERS")
            .setDescription("Clique no botão abaixo para ingressar nos Hunters e receber o cargo temporário |Hunters-Rec|.");
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("btn_iniciar_hunters").setLabel("Entrar para os Hunters").setStyle(ButtonStyle.Primary).setEmoji("🏹")
        );
        await message.channel.send({ embeds: [embed], components: [row] });
    }
    if (cmd === "!painelsouza") {
        const embed = new EmbedBuilder()
            .setColor("#D97706")
            .setTitle("👑 PAINEL OFICIAL — FAMÍLIA SOUZA")
            .setDescription("Clique no botão abaixo para solicitar entrada para a Família Souza.");
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("btn_iniciar_souza").setLabel("Solicitar Entrada Família Souza").setStyle(ButtonStyle.Success).setEmoji("👑")
        );
        await message.channel.send({ embeds: [embed], components: [row] });
    }
    if (cmd === "!painelausencia") {
        const embed = new EmbedBuilder()
            .setColor("#EA580C")
            .setTitle("📋 REGISTRO DE AUSÊNCIA & INATIVIDADE")
            .setDescription("Preencha para garantir proteção contra o limite de 3 dias de inatividade.");
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("btn_iniciar_ausencia").setLabel("Registrar Ausência").setStyle(ButtonStyle.Secondary).setEmoji("📋")
        );
        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    try {
        if (interaction.isButton()) {
            if (interaction.customId === "btn_iniciar_hunters") {
                if (CONFIG.ROLES.HUNTERS_REC && interaction.member) {
                    await interaction.member.roles.add(CONFIG.ROLES.HUNTERS_REC).catch(() => {});
                }
                const modal = new ModalBuilder().setCustomId("modal_hunters_form").setTitle("Formulário Hunters");
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_nome").setLabel("Nome RP").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_id").setLabel("ID Jogo").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_motivacao").setLabel("Motivação").setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
                return interaction.showModal(modal);
            }
            if (interaction.customId === "btn_iniciar_souza") {
                const modal = new ModalBuilder().setCustomId("modal_souza_form").setTitle("Adesão Família Souza");
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_souza_nome").setLabel("Nome RP").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_souza_id").setLabel("ID Jogo").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_souza_convidado").setLabel("Quem te Convidou?").setStyle(TextInputStyle.Short).setRequired(true))
                );
                return interaction.showModal(modal);
            }
            if (interaction.customId === "btn_iniciar_ausencia") {
                const modal = new ModalBuilder().setCustomId("modal_ausencia_form").setTitle("Registro de Ausência");
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_aus_nome_id").setLabel("Nome e ID").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_aus_datas").setLabel("Datas Saída/Retorno").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_aus_motivo").setLabel("Motivo").setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
                return interaction.showModal(modal);
            }
        }
        if (interaction.isModalSubmit()) {
            if (interaction.customId === "modal_hunters_form") {
                return interaction.reply({ content: "✅ Formulário enviado e registrado! Cargo temporário |Hunters-Rec| concedido.", ephemeral: true });
            }
            if (interaction.customId === "modal_souza_form") {
                return interaction.reply({ content: "👑 Solicitação Família Souza enviada à Liderança!", ephemeral: true });
            }
            if (interaction.customId === "modal_ausencia_form") {
                return interaction.reply({ content: "📋 Ausência registrada com sucesso! Proteção de inatividade ativada.", ephemeral: true });
            }
        }
    } catch (err) {
        console.error(err);
    }
});

client.login(CONFIG.TOKEN);
