/**
 * ============================================================================
 * BOT AUTOMÁTICO DE REGISTRO, CIDADANIA & LIMPEZA DE TAGS DISCORD
 * CLÃ HUNTERS & FAMÍLIA SOUZA (FIVEZ & LUMENFALL)
 * ============================================================================
 * 
 * Como Rodar (SEM ARQUIVO .ENV):
 * 1. Cole seu Token do Discord em BOT_TOKEN na linha 'const BOT_TOKEN = "..."'
 * 2. Execute: node bot.js
 */

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import fs from 'fs';
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

// ===============================
// CONFIGURAÇÃO DE AMBIENTE & TOKEN
// ===============================
// 👉 TOKEN DO DISCORD (configurado via Railway Variables / fallback direto):
const BOT_TOKEN = "SEU_TOKEN_AQUI";

const TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN || process.env.DISCORD_BOT_TOKEN || process.env.BOT_TOKEN || BOT_TOKEN;
const PORT = process.env.PORT || 3000;

if (!TOKEN || TOKEN.trim() === "" || TOKEN.includes("COLE_SEU_TOKEN") || TOKEN.includes("SEU_TOKEN_AQUI")) {
    console.error("\n❌ ERRO CRÍTICO: TOKEN DO DISCORD NÃO ENCONTRADO!");
    console.error("👉 Defina a variável 'DISCORD_TOKEN' ou 'TOKEN' no painel de Variables do Railway.com ou no código.\n");
    process.exit(1);
}

// ===============================
// CONFIGURAÇÃO GERAL DO SISTEMA
// ===============================
const CONFIG = {
    CLIENT_ID: process.env.CLIENT_ID || "1493598260546375881",
    GUILD_ID: process.env.GUILD_ID || "1456655598031601727",
    // IDs dos Canais do Servidor
    CANAL_REGISTRO_ID: process.env.CANAL_REGISTRO_ID || "1515448138385592361",
    CANAL_APROVACAO_ID: process.env.CANAL_APROVACAO_ID || "1515448473246498866",
    CANAL_LOGS_ID: process.env.CANAL_LOGS_ID || "1525000000000000000",
    CANAL_ENTRADA_SAIDA_ID: process.env.CANAL_ENTRADA_SAIDA_ID || "1524222632923496509",

    // Cargos Iniciais
    CARGO_AMIGOS_ID: process.env.CARGO_AMIGOS_ID || "1515125842328424640",
    CARGO_HUNTERS_RECRUTA_ID: process.env.CARGO_HUNTERS_RECRUTA_ID || "1515125826780135485",

    // Cargos Administradores Autorizados a Aprovar / Recusar
    CARGOS_ADMINS_APROVADORES: [
    "1515125820836941985",
    "1515125822795546715"
],

    EMBED_COLOR: "#2ECC71",
    COLOR_HUNTERS: "#8E44AD",
    FOOTER: "FiveZ & Lumenfall • Sistema Automático Anti-Queda",
    FORMATO_APELIDO: "{TAG} {NOME} | {ID}",

    GRUPOS: [
    {
        "id": "grupo_souza",
        "name": "Família Souza",
        "roleId": "1515125828185493675",
        "emoji": "❤️",
        "tag": "|Souza|",
        "description": "Membros oficiais da Família Souza"
    },
    {
        "id": "grupo_hunters",
        "name": "Hunters FiveZ",
        "roleId": "1515125826780135485",
        "emoji": "🎯",
        "tag": "|Recruta|",
        "description": "Caçadores de elite Hunters FiveZ (Recruta)"
    },
    {
        "id": "grupo_comprador",
        "name": "Comprador FiveZ",
        "roleId": "1517662363266842725",
        "emoji": "🛒",
        "tag": "|CPD| FiveZ",
        "description": "Compradores oficiais FiveZ"
    },
    {
        "id": "grupo_amigos",
        "name": "Amigos",
        "roleId": "1515125842328424640",
        "emoji": "🤝",
        "tag": "|AMG|",
        "description": "Cargo inicial de entrada, Amigos e Visitantes"
    }
]
};

// ===============================
// SERVIDOR EXPRESS KEEP-ALIVE (RAILWAY / REPLIT / VPS)
// ===============================
const app = express();

app.get('/', (req, res) => {
    res.send('🟢 Bot do Discord Keep-Alive está Rodando 24/7!');
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        botConnected: client.user ? true : false,
        botUser: client.user ? client.user.tag : null,
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n==================================================`);
    console.log(`🌐 SERVIDOR HTTP ANTI-QUEDA ONLINE NA PORTA: ${PORT}`);
    console.log(`🩺 Healthcheck: http://0.0.0.0:${PORT}/health`);
    console.log(`==================================================\n`);
});

// ===============================
// INSTÂNCIA DO CLIENTE DISCORD
// ===============================
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

// ===============================
// PROTEÇÃO ANTI-CRASH GLOBAL
// ===============================
process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ [Anti-Crash] Rejeição não tratada capturada:', reason);
});

process.on('uncaughtException', (error, origin) => {
    console.error('⚠️ [Anti-Crash] Exceção não capturada:', error);
});

// ===============================
// FUNÇÕES AUXILIARES
// ===============================

/**
 * Trunca o apelido para o limite máximo permitido pelo Discord (32 caracteres)
 */
function formatarApelidoSeguro(tag, nome, id) {
    let nick = `${tag} ${nome} | ${id}`.trim();
    if (nick.length > 32) {
        const tamanhoExtra = tag.length + id.length + 4;
        const maxNome = Math.max(1, 32 - tamanhoExtra);
        const nomeCortado = nome.substring(0, maxNome);
        nick = `${tag} ${nomeCortado} | ${id}`.trim();
    }
    return nick.substring(0, 32);
}

/**
 * Verifica todos os membros do servidor.
 * Se alguém tiver a tag da facção no apelido mas NÃO tiver o cargo no Discord, a tag é removida!
 */
async function verificarELimparTags(guild) {
    let totalAnalisados = 0;
    let tagsRemovidas = 0;
    const modificados = [];

    try {
        const members = await guild.members.fetch();
        for (const member of members.values()) {
            if (member.user.bot) continue;
            totalAnalisados++;

            const nickname = member.nickname || member.displayName || '';

            for (const grupo of CONFIG.GRUPOS) {
                if (!grupo.tag || grupo.tag.trim() === '') continue;

                const temTag = nickname.includes(grupo.tag);
                const temCargo = member.roles.cache.has(grupo.roleId);

                // SE TEM A TAG NO NOME, MAS NÃO TEM O CARGO NO DISCORD -> REMOVE A TAG
                if (temTag && !temCargo) {
                    let novoNick = nickname.replace(grupo.tag, '').trim();
                    novoNick = novoNick.replace(/^[\s|\-]+|[\s|\-]+$/g, '').trim();

                    try {
                        const nickFinal = novoNick.length > 0 ? novoNick.substring(0, 32) : null;
                        await member.setNickname(nickFinal);
                        tagsRemovidas++;
                        modificados.push({
                            tagUsuario: member.user.tag,
                            idUsuario: member.id,
                            apelidoAntigo: nickname,
                            apelidoNovo: nickFinal || member.user.username,
                            grupoNome: grupo.name
                        });
                        console.log(`🧹 Tag '${grupo.tag}' removida de ${member.user.tag} (Sem o cargo '${grupo.name}')`);
                    } catch (err) {
                        console.error(`❌ Não foi possível alterar o apelido de ${member.user.tag}:`, err.message);
                    }
                }
            }
        }
    } catch (err) {
        console.error('Erro na função verificarELimparTags:', err);
    }

    return { totalAnalisados, tagsRemovidas, modificados };
}

// ===============================
// EVENTOS DO BOT
// ===============================

client.once(Events.ClientReady, (c) => {
    console.log(`🤖 BOT CONECTADO COMO: ${c.user.tag}`);
    console.log(`📍 Canal de Registro: ${CONFIG.CANAL_REGISTRO_ID}`);
    console.log(`⏳ Canal de Aprovação: ${CONFIG.CANAL_APROVACAO_ID}`);
});

// Evento: Entrou novo membro
client.on(Events.GuildMemberAdd, async (member) => {
    try {
        if (CONFIG.CARGO_AMIGOS_ID) {
            await member.roles.add(CONFIG.CARGO_AMIGOS_ID).catch((err) => {
                console.error(`⚠️ Erro ao adicionar cargo inicial ao membro ${member.user.tag}:`, err.message);
            });
        }

        if (CONFIG.CANAL_ENTRADA_SAIDA_ID) {
            const channel = member.guild.channels.cache.get(CONFIG.CANAL_ENTRADA_SAIDA_ID) || 
                            await member.guild.channels.fetch(CONFIG.CANAL_ENTRADA_SAIDA_ID).catch(() => null);

            if (channel) {
                const embed = new EmbedBuilder()
                    .setColor(CONFIG.EMBED_COLOR)
                    .setTitle('🚪 NOVO MORADOR CHEGOU NA CIDADE!')
                    .setDescription(`Bem-vindo(a) <@${member.id}> ao servidor!\n\n> 📝 Por favor, dirija-se ao canal <#${CONFIG.CANAL_REGISTRO_ID}> para realizar seu **Registro de Cidadania** e escolher seu grupo.`)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: CONFIG.FOOTER })
                    .setTimestamp();

                await channel.send({ content: `<@${member.id}>`, embeds: [embed] }).catch(() => {});
            }
        }
    } catch (err) {
        console.error('Erro no evento GuildMemberAdd:', err);
    }
});

// Comandos de Texto (!painel, !verificartags, !ping)
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;

    const command = message.content.toLowerCase().trim();

    // Comando !ping
    if (command === '!ping' || command === '!status') {
        return message.reply(`🏓 **Pong!** Latência da API: \`${Math.round(client.ws.ping)}ms\`!`);
    }

    // Comando !painel
    if (command === '!painel' || command === '!postarpainel') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Apenas administradores podem postar o painel de registro.');
        }

        const guildIcon = message.guild.iconURL({ dynamic: true }) || 'https://i.imgur.com/8Q8S4Zb.png';

        const embed = new EmbedBuilder()
            .setColor(CONFIG.EMBED_COLOR)
            .setAuthor({ name: '👑 FAMÍLIA SOUZA INFINITA 👑', iconURL: guildIcon })
            .setTitle('🏡 Sistema de Registro — Cidadania & Grupos')
            .setThumbnail(guildIcon)
            .setDescription(`
# **Seja bem-vindo à nossa Comunidade!**

📢 **AVISO IMPORTANTE PARA TODOS (@everyone):**
> ⚠️ **PRAZO LIMITE DE REGISTRO:** Todo membro que entrar no servidor tem um prazo máximo de **3 dias** para realizar o registro de cidadania.
> 🚫 Se você passar de **3 dias** no servidor sem realizar o seu registro (ficando sem os cargos dos grupos), você será **kickado automaticamente** pelo sistema!

Para desbloquear todos os canais do servidor e registrar sua cidadania, selecione seu grupo abaixo.

🎁 **Benefícios ao registrar:**
> ✅ **Cargo do seu Grupo escolhido**
> 🏷️ **Apelido Atualizado:** Com a tag da facção, seu Nome e ID
> 🔓 **Liberação imediata** dos canais e categorias do servidor

👇 *Clique no botão abaixo, escolha seu grupo e preencha o formulário!*
`)
            .setFooter({ text: CONFIG.FOOTER })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_iniciar_registro')
                .setLabel('Realizar Registro')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🏡')
        );

        await message.channel.send({ content: '@everyone', embeds: [embed], components: [row] });
        return message.reply('✅ Painel de registro publicado com sucesso!');
    }

    // Comando !verificartags (Limpeza de membros sem cargo)
    if (command === '!verificartags' || command === '!limpartags' || command === '!checartags') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Apenas administradores podem executar a verificação de tags.');
        }

        const statusMsg = await message.reply('🔍 **Verificando membros e removendo tags de quem está sem cargo...**');
        const res = await verificarELimparTags(message.guild);

        const embed = new EmbedBuilder()
            .setColor(CONFIG.EMBED_COLOR)
            .setTitle('🧹 Limpeza e Verificação de Tags Concluída')
            .addFields(
                { name: '👥 Membros Analisados', value: `${res.totalAnalisados}`, inline: true },
                { name: '🏷️ Tags Removidas', value: `${res.tagsRemovidas}`, inline: true }
            )
            .setFooter({ text: CONFIG.FOOTER })
            .setTimestamp();

        if (res.modificados.length > 0) {
            const amostra = res.modificados.slice(0, 5).map(m => `• <@${m.idUsuario}>: \`${m.apelidoAntigo}\` ➔ \`${m.apelidoNovo}\``).join('\n');
            embed.addFields({ name: '📝 Membros Ajustados (Amostra)', value: amostra + (res.modificados.length > 5 ? `\n*...e mais ${res.modificados.length - 5} membros.*`: ''), inline: false });
        }

        await statusMsg.edit({ content: '✅ **Varredura finalizada!**', embeds: [embed] });
    }
});

// Interações (Botões, Seleção de Grupo, Formulário e Aprovação)
client.on(Events.InteractionCreate, async (interaction) => {
    try {
        if (interaction.isButton()) {
            if (interaction.customId === 'btn_iniciar_registro') {
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('select_grupo_registro')
                    .setPlaceholder('🎯 Escolha o seu Grupo / Facção...')
                    .addOptions(
                        CONFIG.GRUPOS.map(g => ({
                            label: g.name,
                            value: g.roleId,
                            description: g.description,
                            emoji: g.emoji
                        }))
                    );

                const row = new ActionRowBuilder().addComponents(selectMenu);

                return interaction.reply({
                    content: '👇 **Selecione abaixo qual grupo você pertence:**',
                    components: [row],
                    ephemeral: true
                });
            }

            if (interaction.customId.startsWith('btn_aprovar_') || interaction.customId.startsWith('btn_recusar_')) {
                const isApprove = interaction.customId.startsWith('btn_aprovar_');
                
                const hasAdminRole = CONFIG.CARGOS_ADMINS_APROVADORES.some(roleId => interaction.member.roles.cache.has(roleId)) ||
                                     interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

                if (!hasAdminRole) {
                    return interaction.reply({ content: '❌ Você não tem permissão para aprovar ou recusar registros.', ephemeral: true });
                }

                const embed = interaction.message.embeds[0];
                if (!embed) return interaction.reply({ content: '❌ Erro ao ler embed de registro.', ephemeral: true });

                let userId = null;
                const userDiscordField = embed.fields?.find(f => f.name.includes('Usuário Discord'));
                if (userDiscordField) {
                    const m = userDiscordField.value.match(/<@!?(\d+)>/);
                    if (m) userId = m[1];
                }

                if (!userId) {
                    userId = interaction.customId.replace('btn_aprovar_', '').replace('btn_recusar_', '');
                }

                if (!userId) return interaction.reply({ content: '❌ Usuário não localizado no formulário.', ephemeral: true });

                const member = await interaction.guild.members.fetch(userId).catch(() => null);
                if (!member) {
                    return interaction.reply({ content: '❌ Membro não encontrado no servidor (pode ter saído).', ephemeral: true });
                }

                const nomeField = embed.fields?.find(f => f.name.includes('Nome no Jogo'))?.value?.replace(/\*\*/g, '') || 'N/A';
                const idField = embed.fields?.find(f => f.name.includes('ID no Jogo'))?.value?.replace(/\*\*/g, '') || 'N/A';
                const grupoField = embed.fields?.find(f => f.name.includes('Grupo Escolhido'))?.value || '';

                let matchedGroup = CONFIG.GRUPOS[0];
                for (const g of CONFIG.GRUPOS) {
                    if (grupoField.includes(g.name)) {
                        matchedGroup = g;
                        break;
                    }
                }

                if (isApprove) {
                    const finalNickname = formatarApelidoSeguro(matchedGroup.tag, nomeField, idField);

                    try {
                        await member.setNickname(finalNickname);
                    } catch (e) {
                        console.error(`⚠️ Erro ao alterar apelido de ${member.user.tag}:`, e.message);
                    }

                    try {
                        await member.roles.add(matchedGroup.roleId);
                    } catch (e) {
                        console.error(`⚠️ Erro ao adicionar cargo ${matchedGroup.name} a ${member.user.tag}:`, e.message);
                    }

                    const approvedEmbed = EmbedBuilder.from(embed)
                        .setColor('#2ECC71')
                        .setTitle('✅ Registro & Apelido Aprovados')
                        .setDescription('O membro preencheu o formulário de cidadania e foi **APROVADO**.')
                        .addFields({ name: '👮 Avaliado por', value: `<@${interaction.user.id}>`, inline: false });

                    await interaction.message.edit({ embeds: [approvedEmbed], components: [] });

                    await member.send(`🎉 **Parabéns!** Seu registro no grupo **${matchedGroup.name}** foi aprovado no servidor **${interaction.guild.name}**! Seu apelido foi atualizado para \`${finalNickname}\`.`).catch(() => {});

                    await interaction.reply({ content: `✅ Registro de <@${userId}> aprovado com sucesso!`, ephemeral: true });
                } else {
                    const rejectedEmbed = EmbedBuilder.from(embed)
                        .setColor('#E74C3C')
                        .setTitle('❌ Registro Recusado')
                        .setDescription('O membro preencheu o formulário de cidadania e foi **RECUSADO**.')
                        .addFields({ name: '👮 Avaliado por', value: `<@${interaction.user.id}>`, inline: false });

                    await interaction.message.edit({ embeds: [rejectedEmbed], components: [] });

                    await member.send(`❌ Seu registro no servidor **${interaction.guild.name}** foi recusado pela administração.`).catch(() => {});

                    await interaction.reply({ content: `❌ Registro de <@${userId}> recusado.`, ephemeral: true });
                }
            }
        }

        if (interaction.isStringSelectMenu() && interaction.customId === 'select_grupo_registro') {
            const roleId = interaction.values[0];
            const grupoObj = CONFIG.GRUPOS.find(g => g.roleId === roleId) || CONFIG.GRUPOS[0];

            const modal = new ModalBuilder()
                .setCustomId(`modal_registro_${grupoObj.roleId}`)
                .setTitle(`Formulário — ${grupoObj.name.substring(0, 30)}`);

            const inputNome = new TextInputBuilder()
                .setCustomId('input_nome_jogo')
                .setLabel('Seu Nome / Apelido no Jogo')
                .setPlaceholder('Ex: Bruno Souza')
                .setStyle(TextInputStyle.Short)
                .setMaxLength(20)
                .setRequired(true);

            const inputId = new TextInputBuilder()
                .setCustomId('input_id_jogo')
                .setLabel('Seu ID numérico no Jogo')
                .setPlaceholder('Ex: 1234')
                .setStyle(TextInputStyle.Short)
                .setMaxLength(8)
                .setRequired(true);

            const inputContratante = new TextInputBuilder()
                .setCustomId('input_contratante')
                .setLabel('Quem te contratou / convidou?')
                .setPlaceholder('Ex: Liderança / Souza')
                .setStyle(TextInputStyle.Short)
                .setMaxLength(30)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(inputNome),
                new ActionRowBuilder().addComponents(inputId),
                new ActionRowBuilder().addComponents(inputContratante)
            );

            await interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_registro_')) {
            const roleId = interaction.customId.replace('modal_registro_', '');
            const grupoObj = CONFIG.GRUPOS.find(g => g.roleId === roleId) || CONFIG.GRUPOS[0];

            const nomeJogo = interaction.fields.getTextInputValue('input_nome_jogo').trim();
            const idJogo = interaction.fields.getTextInputValue('input_id_jogo').trim();
            const contratante = interaction.fields.getTextInputValue('input_contratante').trim();

            const finalNickname = formatarApelidoSeguro(grupoObj.tag, nomeJogo, idJogo);

            const embedAprovacao = new EmbedBuilder()
                .setColor('#F1C40F')
                .setTitle('⏳ Novo Registro Aguardando Aprovação')
                .addFields(
                    { name: '👤 Usuário Discord', value: `<@${interaction.user.id}> (${interaction.user.tag})`, inline: true },
                    { name: '🎯 Grupo Escolhido', value: `🎯 **${grupoObj.name}**\n(Tag: \`${grupoObj.tag}\`)`, inline: false },
                    { name: '📝 Nome no Jogo', value: `**${nomeJogo}**`, inline: true },
                    { name: '🔢 ID no Jogo', value: `**${idJogo}**`, inline: true },
                    { name: '🤝 Quem te Contratou', value: `**${contratante}**`, inline: false },
                    { name: '🏷️ Apelido a Aplicar', value: `\`${finalNickname}\``, inline: false }
                )
                .setFooter({ text: CONFIG.FOOTER })
                .setTimestamp();

            const rowAprovacao = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`btn_aprovar_${interaction.user.id}`)
                    .setLabel('Aprovar Cidadania')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅'),
                new ButtonBuilder()
                    .setCustomId(`btn_recusar_${interaction.user.id}`)
                    .setLabel('Recusar Cidadania')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('❌')
            );

            const aprovacaoChannel = interaction.guild.channels.cache.get(CONFIG.CANAL_APROVACAO_ID) ||
                                     await interaction.guild.channels.fetch(CONFIG.CANAL_APROVACAO_ID).catch(() => null);

            if (aprovacaoChannel) {
                await aprovacaoChannel.send({ embeds: [embedAprovacao], components: [rowAprovacao] });
            }

            await interaction.reply({
                content: `✅ **Formulário enviado com sucesso!**\nSua solicitação para o grupo **${grupoObj.name}** foi enviada para a Administração. Aguarde a liberação dos cargos!`,
                ephemeral: true
            });
        }
    } catch (err) {
        console.error('Erro ao processar interação:', err);
    }
});

// Login no Discord
client.login(TOKEN).catch((err) => {
    console.error("❌ ERRO AO FAZER LOGIN NO DISCORD:", err.message);
});
