/**
 * ============================================================================
 * BOT AUTOMÁTICO DE REGISTRO (SET), AUSÊNCIA & LIMPEZA DE TAGS DISCORD
 * CLÃ HUNTERS & FAMÍLIA SOUZA (FIVEZ & LUMENFALL)
 * ============================================================================
 * 
 * 🛡️ CORREÇÕES DE SEGURANÇA & CARGOS APLICADAS:
 * 1. 🛑 REMOVIDA QUALQUER ATRIBUIÇÃO AUTOMÁTICA DE CARGO NA ENTRADA (GuildMemberAdd).
 * 2. 🛡️ REMOÇÃO ATIVA ANTI-AUTO-ROLE: Caso o Discord Onboarding ou outro bot dê o cargo 1515125826780135485, ele é removido imediatamente.
 * 3. 📝 O novo membro DEVE ir até o canal de registro (<#1515448138385592361>) para preencher o formulário e "pedir o set".
 * 4. 👮 Os cargos SÓ são entregues quando um Administrador clica em "Aprovar Cidadania".
 * 5. 🌐 Servidor Express Keep-Alive ativo na porta 3000 para estabilidade 24/7.
 * 
 * Dependências requeridas (package.json):
 * npm install discord.js dotenv express
 */

import dotenv from 'dotenv';
dotenv.config();

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

// ===============================
// CONFIGURAÇÃO DE AMBIENTE & TOKEN
// ===============================
const TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN || process.env.DISCORD_BOT_TOKEN || process.env.BOT_TOKEN;
const PORT = process.env.PORT || 3000;

if (!TOKEN || TOKEN.trim() === "") {
    console.warn("⚠️ AVISO: Configure a variável 'DISCORD_TOKEN' no seu arquivo .env ou no painel de hospedagem!");
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
    CANAL_LOGS_ID: process.env.CANAL_LOGS_ID || "1515448473246498866",
    CANAL_ENTRADA_SAIDA_ID: process.env.CANAL_ENTRADA_SAIDA_ID || "1524222632923496509",
    
    // IDs Exclusivos para o Painel de Ausência
    CANAL_PAINEL_AUSENCIA_ID: process.env.CANAL_PAINEL_AUSENCIA_ID || "1531070382365343774",
    CANAL_AUSENCIA_LOGS_ID: process.env.CANAL_AUSENCIA_LOGS_ID || "1531670383483158700",

    // IDs de Cargos para Proteção Anti-Auto-Role
    CARGO_AMIGOS_ID: process.env.CARGO_AMIGOS_ID || "1515125842328424640",
    CARGO_HUNTERS_RECRUTA_ID: process.env.CARGO_HUNTERS_RECRUTA_ID || "1515125826780135485",

    // Cargos Administradores Autorizados a Aprovar / Recusar
    CARGOS_ADMINS_APROVADORES: [
        "1515125820836941985",
        "1515125822795546715"
    ],

    // Cargos Notificados ao Postar o Painel de Ausência
    CARGOS_NOTIFICACAO_AUSENCIA: [
        "1527848364496912404",
        "1523277774436171796",
        "1528075981078663259",
        "1515125826780135485"
    ],

    EMBED_COLOR: "#2ECC71",
    EMBED_COLOR_AUSENCIA: "#E67E22",
    FOOTER: "Sistema de Gestão & Apelidos Oficial • Clã Hunters",

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
// SERVIDOR EXPRESS KEEP-ALIVE
// ===============================
const app = express();

app.get('/', (req, res) => {
    res.send('🟢 Bot Família Hunters Discord Keep-Alive está Rodando 24/7!');
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        botConnected: Boolean(client.user),
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
process.on('unhandledRejection', (reason) => {
    console.error('⚠️ [Anti-Crash] Rejeição não tratada capturada:', reason);
});

process.on('uncaughtException', (error) => {
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
 * Verifica todos os membros do servidor e remove tags indevidas de quem não possui o cargo
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

                // Se possui a tag no apelido mas NÃO tem o cargo oficial, remove a tag!
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
                        console.log(`🧹 Tag '${grupo.tag}' removida de ${member.user.tag} (Não possui o cargo '${grupo.name}')`);
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
    console.log(`🤖 BOT DE REGISTRO CONECTADO COMO: ${c.user.tag}`);
    console.log(`📍 Canal de Registro: ${CONFIG.CANAL_REGISTRO_ID}`);
    console.log(`⏳ Canal de Aprovação: ${CONFIG.CANAL_APROVACAO_ID}`);
    console.log(`📋 Canal Painel Ausência: ${CONFIG.CANAL_PAINEL_AUSENCIA_ID}`);
    console.log(`📜 Canal Logs Ausência: ${CONFIG.CANAL_AUSENCIA_LOGS_ID}`);
    console.log(`🛡️ NENHUM CARGO AUTOMÁTICO SERÁ ENTREGUE NA ENTRADA.`);
});

/**
 * Evento: Entrou novo membro no servidor
 * 
 * ✅ GARANTIA SEM CARGO AUTOMÁTICO:
 * - O Bot NÃO entrega cargo automaticamente.
 * - Caso o Discord Onboarding ou outro bot tente dar o cargo de Recruta (${CONFIG.CARGO_HUNTERS_RECRUTA_ID}),
 *   este bot REMOVE o cargo imediatamente na entrada.
 * - O membro é instruído a ir ao canal <#${CONFIG.CANAL_REGISTRO_ID}> solicitar o registro manualmente.
 */
client.on(Events.GuildMemberAdd, async (member) => {
    try {
        console.log(`👤 Novo membro entrou no servidor: ${member.user.tag} (${member.id})`);

        // 🛡️ REMOÇÃO ATIVA ANTI-AUTO-ROLE:
        // Caso o Discord Onboarding ou outro bot tenha atribuído o cargo de Recruta (1515125826780135485) ou Amigos,
        // removemos o cargo imediatamente para forçar a cidadania manual via formulário.
        const rolesParaRemover = [
            CONFIG.CARGO_HUNTERS_RECRUTA_ID,
            CONFIG.CARGO_AMIGOS_ID,
            "1515125826780135485"
        ].filter(id => id && id.trim() !== "");

        for (const roleId of rolesParaRemover) {
            if (member.roles.cache.has(roleId)) {
                try {
                    await member.roles.remove(roleId);
                    console.log(`🛡️ Cargo automático (${roleId}) REMOVIDO na entrada de ${member.user.tag}.`);
                } catch (e) {
                    console.error(`⚠️ Não foi possível remover cargo automático de ${member.user.tag}:`, e.message);
                }
            }
        }

        // Envia mensagem de boas-vindas instruindo o registro manual
        if (CONFIG.CANAL_ENTRADA_SAIDA_ID) {
            const channel = member.guild.channels.cache.get(CONFIG.CANAL_ENTRADA_SAIDA_ID) || 
                            await member.guild.channels.fetch(CONFIG.CANAL_ENTRADA_SAIDA_ID).catch(() => null);

            if (channel) {
                const embed = new EmbedBuilder()
                    .setColor(CONFIG.EMBED_COLOR)
                    .setTitle('🚪 NOVO MORADOR CHEGOU NA CIDADE!')
                    .setDescription(`Bem-vindo(a) <@${member.id}> ao servidor!\n\n> 📝 Por favor, dirija-se ao canal <#${CONFIG.CANAL_REGISTRO_ID}> para abrir o painel e solicitar o seu **Set / Registro de Cidadania**.\n> ⚠️ *Seus cargos só serão liberados após a aprovação manual da Liderança.*`)
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

// Comandos de Texto (!painel, !painelausencia, !verificartags, !ping)
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;

    const command = message.content.toLowerCase().trim();

    // Comando !ping / !status
    if (command === '!ping' || command === '!status') {
        return message.reply(`🏓 **Pong!** Latência da API: \`${Math.round(client.ws.ping)}ms\`!`);
    }

    // Comando !painel (Painel de Registro)
    if (command === '!painel' || command === '!postarpainel') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Apenas administradores podem postar o painel de registro.');
        }

        const guildIcon = message.guild.iconURL({ dynamic: true }) || 'https://i.imgur.com/8Q8S4Zb.png';

        const embed = new EmbedBuilder()
            .setColor(CONFIG.EMBED_COLOR)
            .setTitle('📜 REGRAS OBRIGATÓRIAS DO CLÃ HUNTERS')
            .setThumbnail(guildIcon)
            .setDescription(`Seja bem-vindo ao **CLÃ Hunters**!
Para garantir a organização e disciplina, leia e aceite as regras abaixo.

📌 **RESPEITO E HIERARQUIA:**
Respeite a liderança e companheiros.

📌 **COMPROMISSO:**
Compareça às reuniões quando convocado.

📌 **USO OBRIGATÓRIO DA TAG:**
Utilize a tag [HUNTERS REC] ou [HUNTERS].

📌 **CANAIS E DMs:**
Mantenha os chats organizados.

📌 **DESLIGAMENTO:**
Descumprimento resultará em expulsão.

⚠️ **ATENÇÃO:** Clique no botão abaixo para liberar a aprovação do seu registro!`)
            .setFooter({ text: CONFIG.FOOTER })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_iniciar_registro')
                .setLabel('Liberar Aprovação do Registro')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📜')
        );

        await message.channel.send({ content: '@everyone', embeds: [embed], components: [row] });
        return message.reply('✅ Painel de regras e registro publicado com sucesso!');
    }

    // Comando !painelausencia (Painel de Ausência)
    if (command === '!painelausencia' || command === '!postarpainelausencia' || command === '!ausencia') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Apenas administradores podem publicar o painel de ausência.');
        }

        const guildIcon = message.guild.iconURL({ dynamic: true }) || 'https://i.imgur.com/8Q8S4Zb.png';

        const embedAusencia = new EmbedBuilder()
            .setColor(CONFIG.EMBED_COLOR_AUSENCIA)
            .setAuthor({ name: '🛡️ FAMÍLIA HUNTERS • SISTEMA DE AUSÊNCIA 🛡️', iconURL: guildIcon })
            .setTitle('📋 PAINEL DE REGISTRO DE AUSÊNCIA')
            .setThumbnail(guildIcon)
            .setDescription(`
# **MODELO DE AUSÊNCIA • FAMÍLIA HUNTERS**

Caso você vá ficar ausente por **mais de 2 dias**, é obrigatório preencher o formulário para evitar advertências ou problemas com sua permanência no clã.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ **REGRAS IMPORTANTES:**

• 📢 A ausência deve ser informada **antes** de ficar inativo, sempre que possível.
• 📊 O período informado será analisado pela liderança.
• ⏰ Caso o retorno atrase, comunique a liderança novamente.
• 🚫 Ausências sem aviso prévio poderão resultar em **advertência** ou **remoção do clã**, conforme as regras da Família Hunters.

🛡️ **Família Hunters** – *Organização, compromisso e respeito acima de tudo.*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👇 *Clique no botão abaixo para abrir o formulário de ausência:*
`)
            .setFooter({ text: CONFIG.FOOTER })
            .setTimestamp();

        const rowAusencia = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_iniciar_ausencia')
                .setLabel('Registrar Ausência')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📝')
        );

        const mencoes = CONFIG.CARGOS_NOTIFICACAO_AUSENCIA.map(id => '<@&' + id + '>').join(' ');

        const targetChannel = message.guild.channels.cache.get(CONFIG.CANAL_PAINEL_AUSENCIA_ID) || message.channel;
        await targetChannel.send({ content: mencoes, embeds: [embedAusencia], components: [rowAusencia] });

        if (targetChannel.id !== message.channel.id) {
            return message.reply(`✅ Painel de Ausência publicado com sucesso no canal <#${CONFIG.CANAL_PAINEL_AUSENCIA_ID}>!`);
        } else {
            return message.reply('✅ Painel de Ausência publicado com sucesso neste canal!');
        }
    }

    // Comando !verificartags
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

// ===============================
// INTERAÇÕES (BOTÕES, DROPDOWNS E MODAIS)
// ===============================
client.on(Events.InteractionCreate, async (interaction) => {
    try {
        if (interaction.isButton()) {
            // REGISTRO DE CIDADANIA - INÍCIO
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

            // REGISTRO DE AUSÊNCIA - INÍCIO
            if (interaction.customId === 'btn_iniciar_ausencia') {
                const modal = new ModalBuilder()
                    .setCustomId('modal_ausencia')
                    .setTitle('Formulário de Ausência • Hunters');

                const inputNomeId = new TextInputBuilder()
                    .setCustomId('input_ausencia_nome_id')
                    .setLabel('Nome e ID no Jogo')
                    .setPlaceholder('Ex: Bruno Souza | ID: 1234')
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(40)
                    .setRequired(true);

                const inputCargo = new TextInputBuilder()
                    .setCustomId('input_ausencia_cargo')
                    .setLabel('Seu Cargo no Clã / Família')
                    .setPlaceholder('Ex: Recruta / Membro / Liderança')
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(30)
                    .setRequired(true);

                const inputDatas = new TextInputBuilder()
                    .setCustomId('input_ausencia_datas')
                    .setLabel('Período (Data de Início e Retorno)')
                    .setPlaceholder('Ex: Início 28/07/2026 - Retorno 05/08/2026')
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(50)
                    .setRequired(true);

                const inputMotivo = new TextInputBuilder()
                    .setCustomId('input_ausencia_motivo')
                    .setLabel('Motivo da Ausência')
                    .setPlaceholder('Descreva resumidamente o motivo da sua ausência...')
                    .setStyle(TextInputStyle.Paragraph)
                    .setMaxLength(300)
                    .setRequired(true);

                const inputObs = new TextInputBuilder()
                    .setCustomId('input_ausencia_obs')
                    .setLabel('Observações (Opcional)')
                    .setPlaceholder('Algum detalhe adicional para a liderança?')
                    .setStyle(TextInputStyle.Paragraph)
                    .setMaxLength(200)
                    .setRequired(false);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(inputNomeId),
                    new ActionRowBuilder().addComponents(inputCargo),
                    new ActionRowBuilder().addComponents(inputDatas),
                    new ActionRowBuilder().addComponents(inputMotivo),
                    new ActionRowBuilder().addComponents(inputObs)
                );

                return interaction.showModal(modal);
            }

            // APROVAÇÃO / RECUSA DE REGISTRO PELOS ADMINS (AQUI SIM OS CARGOS SÃO ADICIONADOS APÓS AVALIAÇÃO)
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

                    // 🎯 CARGO É ENTREGUE EXCLUSIVAMENTE AQUI APÓS APROVAÇÃO MANUAL DO ADMINISTRADOR!
                    try {
                        await member.roles.add(matchedGroup.roleId);
                        console.log(`✅ Cargo '${matchedGroup.name}' (${matchedGroup.roleId}) atribuído a ${member.user.tag} após APROVAÇÃO manual.`);
                    } catch (e) {
                        console.error(`⚠️ Erro ao adicionar cargo ${matchedGroup.name} a ${member.user.tag}:`, e.message);
                    }

                    const approvedEmbed = EmbedBuilder.from(embed)
                        .setColor('#2ECC71')
                        .setTitle('✅ Registro & Apelido Aprovados')
                        .setDescription('O membro preencheu o formulário de cidadania e foi **APROVADO** pela Administração.')
                        .addFields({ name: '👮 Avaliado por', value: `<@${interaction.user.id}>`, inline: false });

                    await interaction.message.edit({ embeds: [approvedEmbed], components: [] });

                    await member.send(`🎉 **Parabéns!** Seu registro no grupo **${matchedGroup.name}** foi aprovado no servidor **${interaction.guild.name}**! Seu apelido foi atualizado para \`${finalNickname}\`.`).catch(() => {});

                    await interaction.reply({ content: `✅ Registro de <@${userId}> aprovado com sucesso! Cargo entregue.`, ephemeral: true });
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

        // SELEÇÃO DE GRUPO NO REGISTRO
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

        // SUBMIT DO MODAL DE REGISTRO
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
                content: `✅ **Formulário enviado com sucesso!**\nSua solicitação para o grupo **${grupoObj.name}** foi enviada para a Administração. Seus cargos serão entregues somente após a aprovação!`,
                ephemeral: true
            });
        }

        // SUBMIT DO MODAL DE AUSÊNCIA
        if (interaction.isModalSubmit() && interaction.customId === 'modal_ausencia') {
            const nomeId = interaction.fields.getTextInputValue('input_ausencia_nome_id').trim();
            const cargo = interaction.fields.getTextInputValue('input_ausencia_cargo').trim();
            const datas = interaction.fields.getTextInputValue('input_ausencia_datas').trim();
            const motivo = interaction.fields.getTextInputValue('input_ausencia_motivo').trim();
            const obs = interaction.fields.getTextInputValue('input_ausencia_obs')?.trim() || 'Nenhuma observação informada.';

            const embedLogAusencia = new EmbedBuilder()
                .setColor('#E67E22')
                .setTitle('🛡️ NOVA NOTIFICAÇÃO DE AUSÊNCIA • HUNTERS')
                .addFields(
                    { name: '👤 Membro Discord', value: `<@${interaction.user.id}> (${interaction.user.tag})`, inline: true },
                    { name: '🆔 Nome & ID no Jogo', value: `**${nomeId}**`, inline: true },
                    { name: '🎮 Cargo no Clã', value: `**${cargo}**`, inline: true },
                    { name: '📅 Período de Ausência', value: `**${datas}**`, inline: false },
                    { name: '📝 Motivo da Ausência', value: `${motivo}`, inline: false },
                    { name: '📌 Observações', value: `${obs}`, inline: false },
                    { name: '📌 Status', value: '⏳ **Aguardando Análise da Liderança**', inline: false }
                )
                .setFooter({ text: CONFIG.FOOTER })
                .setTimestamp();

            const rowLideranca = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`btn_ausencia_ciente_${interaction.user.id}`)
                    .setLabel('Ciente / Aprovar Ausência')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅'),
                new ButtonBuilder()
                    .setCustomId(`btn_ausencia_finalizar_${interaction.user.id}`)
                    .setLabel('Finalizar Ausência')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏁')
            );

            const canalAusenciaLog = interaction.guild.channels.cache.get(CONFIG.CANAL_AUSENCIA_LOGS_ID) ||
                                     await interaction.guild.channels.fetch(CONFIG.CANAL_AUSENCIA_LOGS_ID).catch(() => null);

            if (canalAusenciaLog) {
                await canalAusenciaLog.send({ embeds: [embedLogAusencia], components: [rowLideranca] });
            }

            await interaction.reply({
                content: `✅ **Sua ausência foi registrada com sucesso!**\nAs informações foram enviadas para a Liderança no canal <#${CONFIG.CANAL_AUSENCIA_LOGS_ID}>.`,
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
