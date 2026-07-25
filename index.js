/**
 * ============================================================================
 * BOT AUTOMÁTICO DE REGISTRO DISCORD — FIVEZ & LUMENFALL CITY (ES MODULES)
 * ============================================================================
 */

import dotenv from 'dotenv';
dotenv.config();

import {
    Client,
    GatewayIntentBits,
    Partials,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    Events,
    PermissionsBitField
} from "discord.js";

import fs from "fs";
import express from "express";

const TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN || process.env.DISCORD_BOT_TOKEN || process.env.BOT_TOKEN;

const CONFIG = {
    CANAL_REGISTRO_ID: "1515448138385592361",
    CANAL_LOGS_ID: "1515448473246498866",
    CANAL_ENTRADA_SAIDA_ID: "1524222632923496509",
    CARGO_MORADOR_ID: "1515125842328424640",

    EMBED_COLOR: "#2ECC71",
    FOOTER: "FiveZ & Lumenfall • Sistema Automático",
    SPAM_COOLDOWN_MS: 30000,
    FORMATO_APELIDO: "{TAG} {NOME} | {ID}",
    PERMITIR_RECADASTRO: true,

    GRUPOS: [
        {
            "name": "Amigos",
            "roleId": "1515448138385592361",
            "emoji": "🤝",
            "tag": "|AMG|",
            "description": "Grupo geral de amigos e parceiros da comunidade"
        },
        {
            "name": "Família",
            "roleId": "1515125828185493675",
            "emoji": "❤️",
            "tag": "|Souza|",
            "description": "Membros mais próximos e família do servidor"
        },
        {
            "name": "FiveZ Hunters",
            "roleId": "1515125826780135485",
            "emoji": "🎯",
            "tag": "|Hunters|",
            "description": "Caçadores de elite de FiveZ e operações táticas"
        },
        {
            "name": "Lumenfall City",
            "roleId": "1520163929106550794",
            "emoji": "🏙️",
            "tag": "|Lumen|",
            "description": "Cidadãos e moradores oficiais de Lumenfall City"
        }
    ]
};

const PANEL_FILE = "./panel.json";
const cooldown = new Map();

// Servidor Web Keep-Alive (Porta 3000)
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`
    <html>
      <head>
        <title>Bot FiveZ & Lumenfall Online</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; height: 100vh; justify-content: center; align-items: center; margin: 0; }
          .card { background: #1e293b; padding: 2.5rem; border-radius: 16px; border: 1px solid #334155; text-align: center; max-width: 440px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .status { display: inline-block; width: 12px; height: 12px; background: #22c55e; border-radius: 50%; margin-right: 8px; box-shadow: 0 0 10px #22c55e; }
          h1 { margin-top: 0; font-size: 1.6rem; color: #38bdf8; }
          p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; }
          .badge { background: #0f172a; padding: 6px 12px; border-radius: 8px; border: 1px solid #334155; font-family: monospace; color: #a5f3fc; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1><span class="status"></span>Bot FiveZ & Lumenfall</h1>
          <p>Servidor Keep-Alive 24/7 Ativo!</p>
          <p class="badge">${client?.user ? `🟢 Conectado: ${client.user.tag}` : '🟡 Aguardando DISCORD_TOKEN'}</p>
        </div>
      </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        botOnline: Boolean(client?.user),
        botUser: client?.user?.tag || null,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 [HTTP SERVER] Keep-Alive rodando na porta ${PORT}`);
});

// Inicialização do Cliente Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.User
    ]
});

// Anti-Crash System
process.on('unhandledRejection', (reason) => {
    console.error('[ANTI-CRASH] Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('[ANTI-CRASH] Uncaught Exception:', err);
});

// Persistência do Painel (panel.json)
function salvarPainel(messageId) {
    try {
        fs.writeFileSync(
            PANEL_FILE,
            JSON.stringify({ messageId: messageId, updatedAt: new Date().toISOString() }, null, 4)
        );
    } catch (err) {
        console.error("⚠️ Erro ao salvar o arquivo do painel (panel.json):", err);
    }
}

function carregarPainel() {
    if (!fs.existsSync(PANEL_FILE)) return null;
    try {
        return JSON.parse(fs.readFileSync(PANEL_FILE, "utf-8"));
    } catch (e) {
        return null;
    }
}

// Construção do Painel Principal
function criarPainel(guild) {
    const embed = new EmbedBuilder()
        .setColor(CONFIG.EMBED_COLOR)
        .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL() || undefined
        })
        .setTitle("🏡 Sistema de Registro — Cidadania & Grupos")
        .setDescription(`# Seja bem-vindo à nossa Comunidade!

📢 **AVISO IMPORTANTE PARA TODOS (@everyone):**
> ⚠️ **PRAZO LIMITE DE REGISTRO:** Todo membro que entrar no servidor tem um prazo máximo de **3 dias** para realizar o registro de cidadania.
> 🚫 Se você passar de **3 dias** no servidor sem realizar o seu registro (ficando sem os cargos dos grupos), você será **kickado automaticamente** pelo sistema!

Para desbloquear todos os canais de voz e texto do servidor e registrar sua cidadania, selecione seu grupo abaixo.

### 🎁 Benefícios ao registrar:
> ✅ **Cargo do seu Grupo escolhido**
> 🏷️ **Apelido Atualizado:** Com a tag da facção, seu Nome, ID e quem te contratou
> 🔓 **Liberação imediata** dos canais e categorias do servidor
> 🎉 **Acesso completo** a eventos, caças e roleplay da cidade

👇 *Clique no botão abaixo, escolha seu grupo e preencha o formulário com seu Nome no Jogo, ID e quem te contratou!*`)
        .setThumbnail(guild.iconURL() || null)
        .setFooter({ text: CONFIG.FOOTER })
        .setTimestamp();

    const botao = new ButtonBuilder()
        .setCustomId("abrir_menu_registro")
        .setEmoji("🏡")
        .setLabel("Realizar Registro")
        .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(botao);

    return {
        content: "@everyone",
        embeds: [embed],
        components: [row]
    };
}

async function enviarPainel(guild, canal) {
    if (!canal) return;

    const painel = criarPainel(guild);
    const salvo = carregarPainel();

    if (salvo && salvo.messageId) {
        try {
            const message = await canal.messages.fetch(salvo.messageId);
            await message.edit(painel);
            console.log("✅ Painel de registro existente foi atualizado automaticamente.");
            return;
        } catch (e) {
            console.log("ℹ️ Mensagem antiga do painel não foi encontrada. Criando uma nova mensagem...");
        }
    }

    const novaMensagem = await canal.send(painel);
    salvarPainel(novaMensagem.id);
    console.log("✅ Novo painel de registro criado e salvo em panel.json. ID: " + novaMensagem.id);
}

client.once(Events.ClientReady, async () => {
    console.log("==================================================");
    console.log("✅ BOT ONLINE E CONECTADO: " + client.user.tag);
    console.log("🛡️ Proteção Anti-Spam: " + (CONFIG.SPAM_COOLDOWN_MS / 1000) + " segundos");
    console.log("📢 ID Canal de Entrada e Saída: " + CONFIG.CANAL_ENTRADA_SAIDA_ID);
    console.log("==================================================");

    const guild = client.guilds.cache.first();
    if (!guild) return console.log("❌ O bot não está em nenhum servidor no momento.");

    const canalRegistro = await guild.channels.fetch(CONFIG.CANAL_REGISTRO_ID).catch(() => null);
    if (canalRegistro) {
        await enviarPainel(guild, canalRegistro);
    }
});

// Registro de Entrada de Membros
client.on(Events.GuildMemberAdd, async (member) => {
    try {
        const canalLog = await member.guild.channels.fetch(CONFIG.CANAL_ENTRADA_SAIDA_ID).catch(() => null);
        if (canalLog && canalLog.isTextBased()) {
            const embed = new EmbedBuilder()
                .setColor("#2ECC71")
                .setAuthor({ name: "Membro Entrou no Servidor", iconURL: member.user.displayAvatarURL() })
                .setTitle(`Seja bem-vindo(a) à nossa Cidade, ${member.user.username}! 🏙️`)
                .setDescription(`Olá ${member}! Desejamos que tenha uma excelente jornada em nossa comunidade. 

⚠️ **Atenção:** Você tem até **3 dias** para se registrar no canal <#${CONFIG.CANAL_REGISTRO_ID}> e obter seus cargos de cidadão/grupo para evitar o desligamento automático.`)
                .setThumbnail(member.user.displayAvatarURL())
                .addFields(
                    { name: "👤 Usuário Discord", value: `${member.user.tag} (${member})`, inline: true },
                    { name: "🆔 Discord ID", value: `\`${member.id}\``, inline: true },
                    { name: "📅 Conta Criada Em", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: false },
                    { name: "📊 População Atual", value: `\`${member.guild.memberCount}\` cidadãos`, inline: true }
                )
                .setFooter({ text: CONFIG.FOOTER })
                .setTimestamp();

            await canalLog.send({ content: `${member}, bem-vindo!`, embeds: [embed] });
        }
    } catch (err) {
        console.error("❌ Erro em GuildMemberAdd:", err);
    }
});

// Registro de Saída de Membros
client.on(Events.GuildMemberRemove, async (member) => {
    try {
        const canalLog = await member.guild.channels.fetch(CONFIG.CANAL_ENTRADA_SAIDA_ID).catch(() => null);
        if (canalLog && canalLog.isTextBased()) {
            const joinedAt = member.joinedTimestamp 
                ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F> (<t:${Math.floor(member.joinedTimestamp / 1000)}:R>)` 
                : "Indisponível";

            const embed = new EmbedBuilder()
                .setColor("#E74C3C")
                .setAuthor({ name: "Membro Saiu do Servidor", iconURL: member.user.displayAvatarURL() })
                .setTitle(`Desconexão de Cidadão 🏃‍♂️💨`)
                .setDescription(`O cidadão **${member.user.username}** decidiu se mudar de nossa cidade. Esperamos vê-lo novamente.`)
                .setThumbnail(member.user.displayAvatarURL())
                .addFields(
                    { name: "👤 Usuário Discord", value: `**${member.user.tag}**`, inline: true },
                    { name: "🆔 Discord ID", value: `\`${member.id}\``, inline: true },
                    { name: "📅 Estava Conosco Desde", value: joinedAt, inline: false },
                    { name: "📊 População Atual", value: `\`${member.guild.memberCount}\` cidadãos`, inline: true }
                )
                .setFooter({ text: CONFIG.FOOTER })
                .setTimestamp();

            await canalLog.send({ embeds: [embed] });
        }
    } catch (err) {
        console.error("❌ Erro em GuildMemberRemove:", err);
    }
});

// Processamento de Interações (Botões, Modais, Menus)
client.on(Events.InteractionCreate, async (interaction) => {
    const guild = interaction.guild;
    if (!guild) return;

    if (interaction.isButton() && interaction.customId === "abrir_menu_registro") {
        try {
            if (cooldown.has(interaction.user.id)) {
                const tempoRestante = Math.ceil((cooldown.get(interaction.user.id) - Date.now()) / 1000);
                if (tempoRestante > 0) {
                    return interaction.reply({
                        content: "⏳ **Proteção Anti-Spam:** Por favor, aguarde **" + tempoRestante + " segundos** para utilizar o registro novamente.",
                        ephemeral: true
                    });
                } else {
                    cooldown.delete(interaction.user.id);
                }
            }

            const membro = await guild.members.fetch(interaction.user.id).catch(() => null);
            if (!membro) return interaction.reply({ content: "❌ Erro ao carregar seu perfil.", ephemeral: true });

            if (!CONFIG.PERMITIR_RECADASTRO && membro.roles.cache.has(CONFIG.CARGO_MORADOR_ID)) {
                return interaction.reply({
                    content: "✅ **Você já possui o cargo Morador no servidor!**",
                    ephemeral: true
                });
            }

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId("select_grupo_registro")
                .setPlaceholder("🎯 Selecione seu Grupo / Facção na lista...");

            CONFIG.GRUPOS.forEach(g => {
                selectMenu.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(g.name + " (" + (g.tag || '|TAG|') + ")")
                        .setValue(g.roleId)
                        .setEmoji(g.emoji)
                        .setDescription(g.description ? g.description.substring(0, 100) : "Ingressar no grupo " + g.name)
                );
            });

            const row = new ActionRowBuilder().addComponents(selectMenu);

            return interaction.reply({
                content: "🏡 **Processo de Cidadania & Apelido:**\nEscolha abaixo qual grupo ou família você deseja participar no servidor.\n*Em seguida, preencha o formulário para padronização do seu apelido!*",
                components: [row],
                ephemeral: true
            });
        } catch (err) {
            console.error("Erro no botão de registro:", err);
        }
    }

    if (interaction.isStringSelectMenu() && interaction.customId === "select_grupo_registro") {
        try {
            const roleIdEscolhido = interaction.values[0];
            const grupoEscolhido = CONFIG.GRUPOS.find(g => g.roleId === roleIdEscolhido) || { name: "Grupo", roleId: roleIdEscolhido, emoji: "👥", tag: "|TAG|" };

            const modal = new ModalBuilder()
                .setCustomId("modal_reg_" + grupoEscolhido.roleId)
                .setTitle("Registro - " + grupoEscolhido.name.replace(/[^a-zA-Z0-9 -]/g, "").trim().substring(0, 28));

            const inputNome = new TextInputBuilder()
                .setCustomId("input_nome")
                .setLabel("Seu Nome no Jogo / Personagem")
                .setPlaceholder("Ex: Henrique Souza")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(20);

            const inputId = new TextInputBuilder()
                .setCustomId("input_id")
                .setLabel("Seu ID no Jogo / Cidade")
                .setPlaceholder("Ex: 15420")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMinLength(1)
                .setMaxLength(10);

            const inputContratou = new TextInputBuilder()
                .setCustomId("input_contratou")
                .setLabel("Quem te contratou?")
                .setPlaceholder("Ex: Henrique Souza")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(30);

            modal.addComponents(
                new ActionRowBuilder().addComponents(inputNome),
                new ActionRowBuilder().addComponents(inputId),
                new ActionRowBuilder().addComponents(inputContratou)
            );

            await interaction.showModal(modal);
        } catch (err) {
            console.error("Erro ao abrir modal:", err);
        }
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith("modal_reg_")) {
        try {
            const roleIdEscolhido = interaction.customId.replace("modal_reg_", "");
            const grupoEscolhido = CONFIG.GRUPOS.find(g => g.roleId === roleIdEscolhido) || { name: "Grupo", roleId: roleIdEscolhido, emoji: "👥", tag: "|TAG|" };

            const membro = await guild.members.fetch(interaction.user.id).catch(() => null);
            if (!membro) return;

            const nomePersonagem = interaction.fields.getTextInputValue("input_nome").trim();
            const idJogo = interaction.fields.getTextInputValue("input_id").trim();
            const quemContratou = interaction.fields.getTextInputValue("input_contratou").trim();

            let novoApelido = CONFIG.FORMATO_APELIDO
                .replace("{TAG}", grupoEscolhido.tag || "|TAG|")
                .replace("{NOME}", nomePersonagem)
                .replace("{ID}", idJogo);

            if (novoApelido.length > 32) novoApelido = novoApelido.substring(0, 32);

            cooldown.set(interaction.user.id, Date.now() + CONFIG.SPAM_COOLDOWN_MS);
            setTimeout(() => cooldown.delete(interaction.user.id), CONFIG.SPAM_COOLDOWN_MS);

            const canalLogs = await guild.channels.fetch(CONFIG.CANAL_LOGS_ID).catch(() => null);
            if (!canalLogs) return interaction.reply({ content: "❌ Canal de logs não encontrado.", ephemeral: true });

            const embedLog = new EmbedBuilder()
                .setColor("#3498DB")
                .setTitle("📥 Nova Solicitação de Registro & Apelido")
                .setDescription("O membro preencheu o formulário de cidadania e aguarda aprovação da Administração.")
                .addFields(
                    { name: "👤 Usuário Discord", value: "<@" + membro.id + "> (" + membro.user.tag + ")", inline: true },
                    { name: "🆔 Discord ID", value: "`" + membro.id + "`", inline: true },
                    { name: "🎯 Grupo Escolhido", value: "" + grupoEscolhido.emoji + " **" + grupoEscolhido.name + "**\n(Tag: `" + (grupoEscolhido.tag || '|TAG|') + "`)", inline: false },
                    { name: "📝 Nome no Jogo", value: "**" + nomePersonagem + "**", inline: true },
                    { name: "🔢 ID no Jogo", value: "**" + idJogo + "**", inline: true },
                    { name: "🤝 Quem te Contratou", value: "**" + quemContratou + "**", inline: false },
                    { name: "🏷️ Novo Apelido (Após Aprovar)", value: "`" + novoApelido + "`", inline: false },
                    { name: "⏰ Data da Solicitação", value: "<t:" + Math.floor(Date.now() / 1000) + ":F>", inline: false }
                )
                .setThumbnail(membro.user.displayAvatarURL())
                .setFooter({ text: CONFIG.FOOTER })
                .setTimestamp();

            const rowAdmin = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("aprovar_reg_" + membro.id + "_" + grupoEscolhido.roleId).setEmoji("✅").setLabel("Aprovar Registro").setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId("recusar_reg_" + membro.id + "_" + grupoEscolhido.roleId).setEmoji("❌").setLabel("Recusar").setStyle(ButtonStyle.Danger)
            );

            await canalLogs.send({ embeds: [embedLog], components: [rowAdmin] });

            return interaction.reply({
                content: "✅ **Formulário enviado com sucesso!**\nSua solicitação foi enviada para a Administração.",
                ephemeral: true
            });
        } catch (err) {
            console.error("Erro no formulário:", err);
        }
    }

    if (interaction.isButton() && (interaction.customId.startsWith("aprovar_reg_") || interaction.customId.startsWith("recusar_reg_"))) {
        try {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.reply({ content: "❌ Sem permissão de Administrador.", ephemeral: true });
            }

            const partes = interaction.customId.split("_");
            const acao = partes[0];
            const alvoUserId = partes[2];
            const alvoRoleId = partes[3];

            const membroAlvo = await guild.members.fetch(alvoUserId).catch(() => null);
            const grupoInfo = CONFIG.GRUPOS.find(g => g.roleId === alvoRoleId) || { name: "Grupo", emoji: "✅", tag: "|TAG|" };

            if (acao === "aprovar") {
                if (!membroAlvo) return interaction.reply({ content: "⚠️ O usuário não está no servidor.", ephemeral: true });

                const embedAtual = interaction.message.embeds[0];
                const campoApelido = embedAtual.fields.find(f => f.name.includes("Novo Apelido"));
                const novoApelido = campoApelido ? campoApelido.value.replace(/[`]/g, "").trim() : null;

                const todosGruposIds = CONFIG.GRUPOS.map(g => g.roleId);
                const cargosRemover = membroAlvo.roles.cache.filter(r => todosGruposIds.includes(r.id) && r.id !== alvoRoleId);
                if (cargosRemover.size > 0) await membroAlvo.roles.remove(cargosRemover).catch(() => {});

                const cargosParaAdicionar = [];
                if (alvoRoleId) cargosParaAdicionar.push(alvoRoleId);
                if (CONFIG.CARGO_MORADOR_ID && !membroAlvo.roles.cache.has(CONFIG.CARGO_MORADOR_ID)) cargosParaAdicionar.push(CONFIG.CARGO_MORADOR_ID);

                await membroAlvo.roles.add(cargosParaAdicionar);

                let apelidoAlteradoMsg = "";
                if (novoApelido && membroAlvo.id !== guild.ownerId) {
                    await membroAlvo.setNickname(novoApelido).then(() => {
                        apelidoAlteradoMsg = "\n> 🏷️ **Apelido alterado para:** `" + novoApelido + "`";
                    }).catch(() => {});
                }

                const embedAprovada = EmbedBuilder.from(interaction.message.embeds[0])
                    .setColor("#2ECC71")
                    .setTitle("✅ Registro & Apelido Aprovados")
                    .addFields({ name: "👮 Avaliado por", value: "<@" + interaction.user.id + "> em <t:" + Math.floor(Date.now() / 1000) + ":f>", inline: false });

                await interaction.update({ embeds: [embedAprovada], components: [] });

                await membroAlvo.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#2ECC71")
                            .setTitle("🎉 Registro Aprovado!")
                            .setDescription("Olá **" + membroAlvo.user.username + "**! Seu registro para o grupo **" + grupoInfo.emoji + " " + grupoInfo.name + "** foi **APROVADO**!" + apelidoAlteradoMsg)
                            .setFooter({ text: CONFIG.FOOTER })
                            .setTimestamp()
                    ]
                }).catch(() => {});
            }

            if (acao === "recusar") {
                const embedRecusada = EmbedBuilder.from(interaction.message.embeds[0])
                    .setColor("#E74C3C")
                    .setTitle("❌ Registro Recusado")
                    .addFields({ name: "👮 Avaliado por", value: "<@" + interaction.user.id + "> em <t:" + Math.floor(Date.now() / 1000) + ":f>", inline: false });

                await interaction.update({ embeds: [embedRecusada], components: [] });

                if (membroAlvo) {
                    await membroAlvo.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor("#E74C3C")
                                .setTitle("❌ Registro Recusado")
                                .setDescription("Seu registro para o grupo **" + grupoInfo.name + "** foi recusado.")
                                .setFooter({ text: CONFIG.FOOTER })
                                .setTimestamp()
                        ]
                    }).catch(() => {});
                }
            }
        } catch (err) {
            console.error("Erro na ação do admin:", err);
        }
    }
});

// Comandos de Chat (!painel, !limparcargos)
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;

    const lowerContent = message.content.toLowerCase().trim();

    if (lowerContent === "!painel" || lowerContent === "!setup" || lowerContent === "!registro" ||
        lowerContent === ".painel" || lowerContent === ".setup" || lowerContent === ".registro") {
        try {
            if (!message.member || !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return message.reply("❌ Apenas Administradores podem enviar o painel.").catch(() => {});
            }

            await message.delete().catch(() => {});
            await enviarPainel(message.guild, message.channel);
        } catch (err) {
            console.error("Erro ao enviar painel:", err);
        }
        return;
    }

    if (lowerContent === "!limparcargos" || lowerContent === "!resetgrupos") {
        try {
            if (!message.member || !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return message.reply("❌ Apenas Administradores podem limpar cargos.");
            }

            await message.delete().catch(() => {});
            const msgStatus = await message.channel.send("⏳ **Iniciando limpeza de cargos...**");
            const todosGruposIds = CONFIG.GRUPOS.map(g => g.roleId);
            let countRemovidos = 0;

            const membros = await message.guild.members.fetch();
            for (const [id, mem] of membros) {
                if (mem.user.bot || mem.voice.channel || mem.voice.channelId) continue;

                const cargosRemover = mem.roles.cache.filter(r => todosGruposIds.includes(r.id));
                if (cargosRemover.size > 0) {
                    await mem.roles.remove(cargosRemover).catch(() => {});
                    countRemovidos++;
                }
            }

            await msgStatus.edit("✅ **Limpeza Concluída!** Removido de **" + countRemovidos + "** membros.");
        } catch (err) {
            console.error("Erro na limpeza:", err);
        }
    }
});

function iniciarBot() {
    const token = TOKEN?.trim();
    if (!token || token.length < 20 || token.includes("SEU_TOKEN") || token.includes("....")) {
        console.log("==================================================================");
        console.log("⚠️ DISCORD_TOKEN não configurado. Adicione no ambiente para conectar o Bot.");
        console.log("==================================================================");
        return;
    }

    console.log("🚀 Tentando conectar ao Discord...");
    client.login(token).catch(err => {
        console.error("❌ Falha na autenticação do Discord:", err.message);
    });
}

iniciarBot();
