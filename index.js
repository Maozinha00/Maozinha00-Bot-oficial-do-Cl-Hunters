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
try { require("dotenv").config(); } catch (e) {}

const CONFIG = {
    TOKEN: process.env.DISCORD_TOKEN || process.env.TOKEN || "SEU_TOKEN_AQUI",
    CLIENT_ID: "1533004581909299240",
    GUILD_ID: "1495178024759332914",
    PORT: 3000,
    CANAIS: {
        RECRUTAMENTO: "1533005614173782227",
        FAMILIA_SOUZA: "153300561500000001",
        PAINEL_AUSENCIA: "1531670381016772700",
        LOGS_GERAIS: "1533005818121949244",
        LOGS_AUSENCIA: "1531670383483158700",
        ENTRADA_SAIDA: "1515125850419220500",
        CATEGORY_TICKET: "1533005325924565002"
    },
    ROLES: {
        STAFF: "1526973668788277269",
        ADMIN_1: "1515125820836941985",
        ADMIN_2: "1515125822795546715",
        HUNTERS_REC: "152697367000000000",
        RECRUTA: "1526973675323134164",
        TESTE: "1526973677172691076",
        FAMILIA_SOUZA: "1515125828185493675",
        COMPRADOR_FIVEZ: "1517662363266842725",
        AMIGOS: "1515125842328424640"
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
    console.log("Canais configurados:", CONFIG.CANAIS);
    console.log("Cargos configurados:", CONFIG.ROLES);
});

// Evento de Entrada de Membro no Servidor
client.on(Events.GuildMemberAdd, async (member) => {
    try {
        const channel = member.guild.channels.cache.get(CONFIG.CANAIS.ENTRADA_SAIDA);
        if (channel) {
            const embed = new EmbedBuilder()
                .setColor("#22C55E")
                .setTitle("👋 Bem-vindo ao Servidor!")
                .setDescription(`Olá ${member}! Bem-vindo ao Discord do Clã Hunters & Família Souza!`)
                .setFooter({ text: CONFIG.FOOTER });
            await channel.send({ embeds: [embed] });
        }
    } catch (e) { console.error("Erro no GuildMemberAdd:", e); }
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;
    const cmd = message.content.toLowerCase().trim();
    if (!message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    if (cmd === "!painel") {
        const embed = new EmbedBuilder()
            .setColor("#9333EA")
            .setAuthor({ name: "👑 FAMÍLIA SOUZA INFINITA 👑" })
            .setTitle("🏡 Sistema de Registro — Cidadania & Grupos")
            .setDescription(
                "📢 **AVISO IMPORTANTE PARA TODOS (@everyone):**\n\n" +
                "⚠️ **PRAZO LIMITE DE REGISTRO:** Todo membro que entrar no servidor tem um prazo máximo de **3 dias** para realizar o registro de cidadania.\n\n" +
                "🚫 Se você passar de **3 dias** no servidor sem realizar o seu registro, você será **kickado automaticamente** pelo sistema!\n\n" +
                "Para desbloquear todos os canais do servidor e registrar sua cidadania, selecione seu grupo abaixo.\n\n" +
                "🎁 **Benefícios ao registrar:**\n" +
                "✅ **Cargo do seu Grupo escolhido**\n" +
                "🏷️ **Apelido Atualizado:** Com a tag do grupo, seu Nome e ID\n" +
                "🔓 **Liberação imediata** dos canais do servidor\n\n" +
                "👇 *Clique no botão abaixo, escolha seu grupo e preencha o formulário!*"
            );
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("btn_iniciar_registro").setLabel("Realizar Registro").setStyle(ButtonStyle.Success).setEmoji("🏡")
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
            if (interaction.customId === "btn_iniciar_registro") {
                const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
                const select = new StringSelectMenuBuilder()
                    .setCustomId("select_grupo_registro")
                    .setPlaceholder("Selecione seu Grupo / Função no Servidor...")
                    .addOptions(
                        new StringSelectMenuOptionBuilder().setLabel("Hunters FiveZ (Recruta)").setValue("grupo_hunters").setDescription("Inicia o formulário e teste tático do Clã Hunters").setEmoji("🎯"),
                        new StringSelectMenuOptionBuilder().setLabel("Comprador FiveZ").setValue("grupo_comprador").setDescription("Recebe cargo |Comprador| e libera canais").setEmoji("🛒"),
                        new StringSelectMenuOptionBuilder().setLabel("Família Souza").setValue("grupo_souza").setDescription("Solicita adesão oficial à Família Souza").setEmoji("👑"),
                        new StringSelectMenuOptionBuilder().setLabel("Amigos & Visitantes").setValue("grupo_amigos").setDescription("Recebe cargo |Amigos| e libera os canais").setEmoji("🤝")
                    );
                const row = new ActionRowBuilder().addComponents(select);
                return interaction.reply({ content: "👇 Escolha abaixo o seu grupo para iniciar o registro:", components: [row], ephemeral: true });
            }
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
        if (interaction.isStringSelectMenu() && interaction.customId === "select_grupo_registro") {
            const selected = interaction.values[0];
            if (selected === "grupo_hunters") {
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
            if (selected === "grupo_comprador") {
                const modal = new ModalBuilder().setCustomId("modal_comprador_form").setTitle("Registro Comprador FiveZ");
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_comp_nome").setLabel("Nome RP").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_comp_id").setLabel("ID Jogo").setStyle(TextInputStyle.Short).setRequired(true))
                );
                return interaction.showModal(modal);
            }
            if (selected === "grupo_souza") {
                const modal = new ModalBuilder().setCustomId("modal_souza_form").setTitle("Adesão Família Souza");
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_souza_nome").setLabel("Nome RP").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_souza_id").setLabel("ID Jogo").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_souza_convidado").setLabel("Quem te Convidou?").setStyle(TextInputStyle.Short).setRequired(true))
                );
                return interaction.showModal(modal);
            }
            if (selected === "grupo_amigos") {
                const modal = new ModalBuilder().setCustomId("modal_amigos_form").setTitle("Registro Amigos & Visitantes");
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_ami_nome").setLabel("Nome RP").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("input_ami_id").setLabel("ID Jogo").setStyle(TextInputStyle.Short).setRequired(true))
                );
                return interaction.showModal(modal);
            }
        }
        if (interaction.isModalSubmit()) {
            if (interaction.customId === "modal_hunters_form") {
                const logChannel = interaction.guild?.channels.cache.get(CONFIG.CANAIS.LOGS_GERAIS);
                if (logChannel) {
                    const embed = new EmbedBuilder()
                        .setColor("#9333EA")
                        .setTitle("🏹 Novo Form Recrutamento Hunters")
                        .setDescription(`Candidato ${interaction.user} preencheu o formulário. Cargo temporário <@&${CONFIG.ROLES.HUNTERS_REC}> atribuído.`)
                        .setFooter({ text: CONFIG.FOOTER });
                    await logChannel.send({ embeds: [embed] });
                }
                return interaction.reply({ content: "✅ Formulário enviado e registrado! Cargo temporário |Hunters-Rec| concedido.", ephemeral: true });
            }
            if (interaction.customId === "modal_comprador_form") {
                const nome = interaction.fields.getTextInputValue("input_comp_nome");
                const id = interaction.fields.getTextInputValue("input_comp_id");
                if (CONFIG.ROLES.COMPRADOR_FIVEZ && interaction.member) {
                    await interaction.member.roles.add(CONFIG.ROLES.COMPRADOR_FIVEZ).catch(() => {});
                    await interaction.member.setNickname("|Comprador| " + nome + " | " + id).catch(() => {});
                }
                return interaction.reply({ content: "🛒 Registro de Comprador concluído! Cargo |Comprador| concedido e apelido alterado para: |Comprador| " + nome + " | " + id, ephemeral: true });
            }
            if (interaction.customId === "modal_amigos_form") {
                const nome = interaction.fields.getTextInputValue("input_ami_nome");
                const id = interaction.fields.getTextInputValue("input_ami_id");
                if (CONFIG.ROLES.AMIGOS && interaction.member) {
                    await interaction.member.roles.add(CONFIG.ROLES.AMIGOS).catch(() => {});
                    await interaction.member.setNickname("|Amigos| " + nome + " | " + id).catch(() => {});
                }
                return interaction.reply({ content: "🤝 Registro concluído! Cargo |Amigos| concedido e apelido alterado para: |Amigos| " + nome + " | " + id, ephemeral: true });
            }
            if (interaction.customId === "modal_souza_form") {
                const logChannel = interaction.guild?.channels.cache.get(CONFIG.CANAIS.LOGS_GERAIS);
                if (logChannel) {
                    const embed = new EmbedBuilder()
                        .setColor("#D97706")
                        .setTitle("👑 Solicitação Família Souza")
                        .setDescription(`Membro ${interaction.user} solicitou adesão à Família Souza. Notificando Staff <@&${CONFIG.ROLES.STAFF}>.`)
                        .setFooter({ text: CONFIG.FOOTER });
                    await logChannel.send({ embeds: [embed] });
                }
                return interaction.reply({ content: "👑 Solicitação Família Souza enviada à Liderança!", ephemeral: true });
            }
            if (interaction.customId === "modal_ausencia_form") {
                const ausLogChannel = interaction.guild?.channels.cache.get(CONFIG.CANAIS.LOGS_AUSENCIA);
                if (ausLogChannel) {
                    const embed = new EmbedBuilder()
                        .setColor("#EA580C")
                        .setTitle("📋 Registro de Ausência Confirmado")
                        .setDescription(`Membro ${interaction.user} registrou ausência no sistema. Proteção de inatividade ativada.`)
                        .setFooter({ text: CONFIG.FOOTER });
                    await ausLogChannel.send({ embeds: [embed] });
                }
                return interaction.reply({ content: "📋 Ausência registrada com sucesso! Proteção de inatividade ativada.", ephemeral: true });
            }
        }
    } catch (err) {
        console.error(err);
    }
});

client.login(CONFIG.TOKEN);
