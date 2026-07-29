/**
 * ============================================================================
 * BOT AUTOMÁTICO DE REGISTRO, CIDADANIA, AUSÊNCIA, LEITOR DE LOGS E FIXER DE NICKNAMES
 * CLÃ HUNTERS & FAMÍLIA SOUZA (FIVEZ & LUMENFALL)
 * ============================================================================
 * 
 * NOVOS COMANDOS INCLUÍDOS:
 * - !arrumarnomes ou !sincronizarnomes: Puxa o histórico de mensagens do canal de logs/aprovação,
 *   identifica quem fez o registro, extrai o Nome no Jogo, ID e Tag da Facção, e corrige
 *   o apelido do membro no servidor para o formato oficial: {TAG} {NOME} | {ID}.
 * - !arrumarnome @membro: Busca a ficha do membro nas logs e arruma o apelido individualmente.
 * - !verificartags: Varre o servidor e remove as tags de quem perdeu o cargo.
 * - !painel: Posta o painel interativo de Registro de Cidadania.
 * - !painelausencia: Posta o painel de aviso de ausência da liderança.
 * 
 * Como Rodar:
 * 1. Instale as dependências: npm install discord.js express dotenv
 * 2. Configure seu TOKEN na variável de ambiente DISCORD_TOKEN ou no arquivo .env
 * 3. Execute: node bot.js
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
const BOT_TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN || process.env.DISCORD_BOT_TOKEN || process.env.BOT_TOKEN || "SEU_TOKEN_AQUI";
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN || BOT_TOKEN.trim() === "" || BOT_TOKEN.includes("COLE_SEU_TOKEN") || BOT_TOKEN.includes("SEU_TOKEN_AQUI")) {
    console.error("\n❌ ERRO CRÍTICO: TOKEN DO DISCORD NÃO ENCONTRADO!");
    console.error("👉 Defina a variável 'DISCORD_TOKEN' no seu painel de hospedagem ou no arquivo .env.\n");
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
    CANAL_LOGS_ID: process.env.CANAL_LOGS_ID || "1515448473246498866",
    CANAL_ENTRADA_SAIDA_ID: process.env.CANAL_ENTRADA_SAIDA_ID || "1524222632923496509",
    
    // IDs Exclusivos para o Painel de Ausência
    CANAL_PAINEL_AUSENCIA_ID: process.env.CANAL_PAINEL_AUSENCIA_ID || "1531070382365343774",
    CANAL_AUSENCIA_LOGS_ID: process.env.CANAL_AUSENCIA_LOGS_ID || "1531670383483158700",

    // Cargos Iniciais
    CARGO_AMIGOS_ID: process.env.CARGO_AMIGOS_ID || "1515125842328424640",
    CARGO_HUNTERS_RECRUTA_ID: process.env.CARGO_HUNTERS_RECRUTA_ID || "1515125826780135485",

    // Cargos Administradores Autorizados a Aprovar e Gerenciar
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
    FORMATO_APELIDO: "{TAG} {NOME} | {ID}",
    FOOTER: "FiveZ & Lumenfall • Família Hunters • Anti-Queda",

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
// SERVIDOR EXPRESS KEEP-ALIVE (24/7)
// ===============================
const app = express();

app.get('/', (req, res) => {
    res.send('🟢 Bot Família Hunters Discord Keep-Alive está Rodando 24/7!');
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

// Anti-Crash Global para evitar que o bot caia
process.on('unhandledRejection', (reason) => {
    console.error('⚠️ [Anti-Crash] Rejeição não tratada capturada:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('⚠️ [Anti-Crash] Exceção não capturada:', error);
});

// ===============================
// FUNÇÕES AUXILIARES DE APELIDOS E LOGS
// ===============================

/**
 * Formata o apelido respeitando o limite máximo do Discord (32 caracteres)
 */
function formatarApelidoSeguro(pattern, tag, nome, id) {
    const tagLimpa = (tag || '').trim();
    const nomeLimpo = (nome || '').trim();
    const idLimpo = (id || '').trim();

    let nick = pattern
        .replace('{TAG}', tagLimpa)
        .replace('{NOME}', nomeLimpo)
        .replace('{ID}', idLimpo)
        .replace(/\s+/g, ' ')
        .trim();

    if (nick.length > 32) {
        const tamanhoExtra = tagLimpa.length + idLimpo.length + 5;
        const maxNome = Math.max(2, 32 - tamanhoExtra);
        const nomeCortado = nomeLimpo.substring(0, maxNome);

        nick = pattern
            .replace('{TAG}', tagLimpa)
            .replace('{NOME}', nomeCortado)
            .replace('{ID}', idLimpo)
            .replace(/\s+/g, ' ')
            .trim();
    }

    return nick.substring(0, 32);
}

/**
 * Lê o histórico de mensagens do canal de aprovação/logs e recupera as fichas
 */
async function extrairFichasDasLogs(guild) {
    const canalId = CONFIG.CANAL_APROVACAO_ID || CONFIG.CANAL_LOGS_ID;
    const canal = guild.channels.cache.get(canalId) || await guild.channels.fetch(canalId).catch(() => null);

    if (!canal) {
        throw new Error(`Canal de aprovação/logs (${canalId}) não foi encontrado.`);
    }

    let messages = await canal.messages.fetch({ limit: 100 }).catch(() => null);
    if (!messages) return [];

    const fichasEncontradas = new Map();

    for (const msg of messages.values()) {
        if (!msg.embeds || msg.embeds.length === 0) continue;

        for (const embed of msg.embeds) {
            const isAprovado = embed.title?.includes('Aprovad') || embed.description?.includes('APROVADO') || embed.title?.includes('Registro');
            if (!isAprovado) continue;

            let userId = null;
            let nomeJogo = null;
            let idJogo = null;
            let grupoNome = null;
            let tagGrupo = null;

            for (const field of embed.fields || []) {
                const name = field.name.toLowerCase();
                const val = field.value;

                if (name.includes('usuário discord') || name.includes('membro')) {
                    const match = val.match(/<@!?(\d+)>/);
                    if (match) userId = match[1];
                }
                if (name.includes('nome no jogo') || name.includes('nome')) {
                    nomeJogo = val.replace(/\*\*/g, '').trim();
                }
                if (name.includes('id no jogo') || name.includes('id')) {
                    idJogo = val.replace(/\*\*/g, '').trim();
                }
                if (name.includes('grupo') || name.includes('facção')) {
                    grupoNome = val;
                }
            }

            if (userId && nomeJogo && idJogo) {
                let matchedGroup = CONFIG.GRUPOS[0];
                for (const g of CONFIG.GRUPOS) {
                    if (grupoNome && (grupoNome.includes(g.name) || grupoNome.includes(g.tag))) {
                        matchedGroup = g;
                        break;
                    }
                }

                tagGrupo = matchedGroup.tag;
                const apelidoIdeal = formatarApelidoSeguro(CONFIG.FORMATO_APELIDO, tagGrupo, nomeJogo, idJogo);

                if (!fichasEncontradas.has(userId)) {
                    fichasEncontradas.set(userId, {
                        userId,
                        nomeJogo,
                        idJogo,
                        grupoObj: matchedGroup,
                        tagGrupo,
                        apelidoIdeal,
                        dataMsg: msg.createdAt
                    });
                }
            }
        }
    }

    return Array.from(fichasEncontradas.values());
}

/**
 * Função principal do comando !arrumarnomes: lê logs e corrige apelidos
 */
async function sincronizarEArrumarApelidosDasLogs(guild) {
    const fichas = await extrairFichasDasLogs(guild);
    let alterados = 0;
    let jaCorretos = 0;
    let erros = 0;
    const detalhes = [];

    const members = await guild.members.fetch().catch(() => null);
    if (!members) throw new Error('Não foi possível carregar a lista de membros do servidor.');

    for (const ficha of fichas) {
        const member = members.get(ficha.userId);
        if (!member) continue;

        const apelidoAtual = member.nickname || member.user.displayName || member.user.username;

        if (apelidoAtual === ficha.apelidoIdeal) {
            jaCorretos++;
            continue;
        }

        try {
            await member.setNickname(ficha.apelidoIdeal);
            alterados++;
            detalhes.push({
                userTag: member.user.tag,
                userId: member.id,
                antigo: apelidoAtual,
                novo: ficha.apelidoIdeal,
                grupo: ficha.grupoObj.name
            });
            console.log(`🔧 Apelido corrigido para ${member.user.tag}: '${apelidoAtual}' ➔ '${ficha.apelidoIdeal}'`);
        } catch (err) {
            erros++;
            console.error(`❌ Falha ao alterar apelido de ${member.user.tag}:`, err.message);
        }
    }

    return { totalFichas: fichas.length, alterados, jaCorretos, erros, detalhes };
}

/**
 * Limpa tags de quem não possui mais o cargo no servidor
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
                        console.log(`🧹 Tag '${grupo.tag}' removida de ${member.user.tag}`);
                    } catch (err) {
                        console.error(`❌ Erro ao alterar apelido de ${member.user.tag}:`, err.message);
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
// EVENTOS DO BOT DISCORD
// ===============================

client.once(Events.ClientReady, (c) => {
    console.log(`🤖 BOT CONECTADO COMO: ${c.user.tag}`);
    console.log(`📍 Canal Registro: ${CONFIG.CANAL_REGISTRO_ID}`);
    console.log(`⏳ Canal Aprovação: ${CONFIG.CANAL_APROVACAO_ID}`);
});

// Novo membro entra no servidor
client.on(Events.GuildMemberAdd, async (member) => {
    try {
        if (CONFIG.CARGO_AMIGOS_ID) {
            await member.roles.add(CONFIG.CARGO_AMIGOS_ID).catch(() => {});
        }

        if (CONFIG.CANAL_ENTRADA_SAIDA_ID) {
            const channel = member.guild.channels.cache.get(CONFIG.CANAL_ENTRADA_SAIDA_ID) || 
                            await member.guild.channels.fetch(CONFIG.CANAL_ENTRADA_SAIDA_ID).catch(() => null);

            if (channel) {
                const embed = new EmbedBuilder()
                    .setColor(CONFIG.EMBED_COLOR)
                    .setTitle('🚪 NOVO MORADOR CHEGOU NA CIDADE!')
                    .setDescription(`Bem-vindo(a) <@${member.id}> ao servidor!\n\n> 📝 Dirija-se ao canal <#${CONFIG.CANAL_REGISTRO_ID}> para realizar seu **Registro de Cidadania** e escolher seu grupo.`)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: CONFIG.FOOTER })
                    .setTimestamp();

                await channel.send({ content: `<@${member.id}>`, embeds: [embed] }).catch(() => {});
            }
        }
    } catch (err) {
        console.error('Erro no GuildMemberAdd:', err);
    }
});

// Comandos de Texto (!arrumarnomes, !arrumarnome, !verificartags, !painel, !painelausencia)
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;

    const command = message.content.toLowerCase().trim();

    // Comando !ping
    if (command === '!ping' || command === '!status') {
        return message.reply(`🏓 **Pong!** Latência da API: \`${Math.round(client.ws.ping)}ms\`!`);
    }

    // ==========================================
    // COMANDO: !arrumarnomes OU !sincronizarnomes
    // (Lê as logs e corrige todos os apelidos)
    // ==========================================
    if (command === '!arrumarnomes' || command === '!sincronizarnomes' || command === '!fixnicks') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Apenas administradores podem executar a sincronização.');
        }

        const statusMsg = await message.reply('🔍 **Lendo fichas do canal de logs e arrumando apelidos...**');

        try {
            const result = await sincronizarEArrumarApelidosDasLogs(message.guild);

            const embed = new EmbedBuilder()
                .setColor(CONFIG.EMBED_COLOR)
                .setTitle('🔧 Sincronização & Correção de Apelidos Concluída!')
                .setDescription('O bot analisou as logs do canal de aprovação e atualizou os apelidos dos membros.')
                .addFields(
                    { name: '📋 Fichas Encontradas nas Logs', value: `**${result.totalFichas}**`, inline: true },
                    { name: '✏️ Apelidos Arrumados', value: `**${result.alterados}**`, inline: true },
                    { name: '✅ Já Estavam Corretos', value: `**${result.jaCorretos}**`, inline: true }
                )
                .setFooter({ text: CONFIG.FOOTER })
                .setTimestamp();

            if (result.detalhes.length > 0) {
                const amostra = result.detalhes.slice(0, 5).map(m => `• <@${m.userId}>: \`${m.antigo}\` ➔ \`${m.novo}\``).join('\n');
                embed.addFields({
                    name: '📝 Membros Ajustados (Amostra)',
                    value: amostra + (result.detalhes.length > 5 ? `\n*...e mais ${result.detalhes.length - 5} membros.*` : ''),
                    inline: false
                });
            }

            await statusMsg.edit({ content: '✅ **Processo finalizado com sucesso!**', embeds: [embed] });
        } catch (err) {
            console.error('Erro no !arrumarnomes:', err);
            await statusMsg.edit(`❌ **Erro ao sincronizar:** ${err.message}`);
        }
    }

    // ==========================================
    // COMANDO: !arrumarnome @Membro
    // (Arruma apelido individual pelas logs)
    // ==========================================
    if (command.startsWith('!arrumarnome ')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Apenas administradores.');
        }

        const targetUser = message.mentions.members.first() || await message.guild.members.fetch(message.content.split(' ')[1]).catch(() => null);
        if (!targetUser) {
            return message.reply('❌ Mencione um membro válido. Exemplo: `!arrumarnome @Bruno`');
        }

        const statusMsg = await message.reply(`🔍 Buscando ficha de <@${targetUser.id}> nas logs...`);

        try {
            const fichas = await extrairFichasDasLogs(message.guild);
            const ficha = fichas.find(f => f.userId === targetUser.id);

            if (!ficha) {
                return statusMsg.edit(`⚠️ Ficha de registro não localizada nas logs para <@${targetUser.id}>.`);
            }

            const antigo = targetUser.nickname || targetUser.displayName;
            await targetUser.setNickname(ficha.apelidoIdeal);

            const embed = new EmbedBuilder()
                .setColor(CONFIG.EMBED_COLOR)
                .setTitle('✨ Apelido Arrumado com Sucesso!')
                .addFields(
                    { name: '👤 Membro', value: `<@${targetUser.id}>`, inline: true },
                    { name: '📝 Apelido Antigo', value: `\`${antigo}\``, inline: true },
                    { name: '🏷️ Apelido Novo (Formatado)', value: `\`${ficha.apelidoIdeal}\``, inline: true },
                    { name: '🎯 Grupo Encontrado', value: `**${ficha.grupoObj.name}**`, inline: false }
                )
                .setFooter({ text: CONFIG.FOOTER })
                .setTimestamp();

            await statusMsg.edit({ content: '✅ **Apelido corrigido!**', embeds: [embed] });
        } catch (err) {
            await statusMsg.edit(`❌ Erro ao arrumar apelido: ${err.message}`);
        }
    }

    // Comando !painel (Painel de Registro)
    if (command === '!painel' || command === '!postarpainel') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Apenas administradores.');
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
> ⚠️ **PRAZO LIMITE DE REGISTRO:** Todo membro tem um prazo máximo de **3 dias** para realizar o registro de cidadania.
> 🚫 Se você passar de **3 dias** sem registro, será **kickado automaticamente**!

Para desbloquear o servidor e registrar sua cidadania, selecione seu grupo abaixo.

🎁 **Benefícios:**
> ✅ **Cargo do seu Grupo escolhido**
> 🏷️ **Apelido Atualizado:** Com a tag da facção, seu Nome e ID
> 🔓 **Liberação imediata** dos canais

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

    // Comando !painelausencia
    if (command === '!painelausencia' || command === '!postarpainelausencia' || command === '!ausencia') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Apenas administradores.');
        }

        const guildIcon = message.guild.iconURL({ dynamic: true }) || 'https://i.imgur.com/8Q8S4Zb.png';

        const embedAusencia = new EmbedBuilder()
            .setColor(CONFIG.EMBED_COLOR_AUSENCIA)
            .setAuthor({ name: '🛡️ FAMÍLIA HUNTERS • SISTEMA DE AUSÊNCIA 🛡️', iconURL: guildIcon })
            .setTitle('📋 PAINEL DE REGISTRO DE AUSÊNCIA')
            .setThumbnail(guildIcon)
            .setDescription(`
# **MODELO DE AUSÊNCIA • FAMÍLIA HUNTERS**

Caso você vá ficar ausente por **mais de 2 dias**, é obrigatório preencher o formulário para evitar advertências.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ **REGRAS IMPORTANTES:**

• 📢 Informe a ausência **antes** de ficar inativo.
• 📊 O período será analisado pela liderança.
• ⏰ Caso o retorno atrase, comunique novamente.

🛡️ **Família Hunters** – *Organização e respeito acima de tudo.*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👇 *Clique no botão abaixo para abrir o formulário:*
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

        return message.reply('✅ Painel de Ausência publicado com sucesso!');
    }

    // Comando !verificartags
    if (command === '!verificartags' || command === '!limpartags') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Apenas administradores.');
        }

        const statusMsg = await message.reply('🔍 **Verificando membros e removendo tags de quem está sem cargo...**');
        const res = await verificarELimparTags(message.guild);

        const embed = new EmbedBuilder()
            .setColor(CONFIG.EMBED_COLOR)
            .setTitle('🧹 Limpeza de Tags Concluída')
            .addFields(
                { name: '👥 Membros Analisados', value: `${res.totalAnalisados}`, inline: true },
                { name: '🏷️ Tags Removidas', value: `${res.tagsRemovidas}`, inline: true }
            )
            .setFooter({ text: CONFIG.FOOTER })
            .setTimestamp();

        await statusMsg.edit({ content: '✅ **Varredura finalizada!**', embeds: [embed] });
    }
});

// Interações (Botões e Modais)
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
                return interaction.reply({ content: '👇 **Selecione abaixo qual grupo você pertence:**', components: [row], ephemeral: true });
            }

            if (interaction.customId === 'btn_iniciar_ausencia') {
                const modal = new ModalBuilder().setCustomId('modal_ausencia').setTitle('Formulário de Ausência • Hunters');

                const inputNomeId = new TextInputBuilder().setCustomId('input_ausencia_nome_id').setLabel('Nome e ID no Jogo').setPlaceholder('Ex: Bruno Souza | ID: 1234').setStyle(TextInputStyle.Short).setMaxLength(40).setRequired(true);
                const inputCargo = new TextInputBuilder().setCustomId('input_ausencia_cargo').setLabel('Seu Cargo no Clã').setPlaceholder('Ex: Recruta / Membro').setStyle(TextInputStyle.Short).setMaxLength(30).setRequired(true);
                const inputDatas = new TextInputBuilder().setCustomId('input_ausencia_datas').setLabel('Período (Início e Retorno)').setPlaceholder('Ex: Início 28/07 - Retorno 05/08').setStyle(TextInputStyle.Short).setMaxLength(50).setRequired(true);
                const inputMotivo = new TextInputBuilder().setCustomId('input_ausencia_motivo').setLabel('Motivo da Ausência').setStyle(TextInputStyle.Paragraph).setMaxLength(300).setRequired(true);
                const inputObs = new TextInputBuilder().setCustomId('input_ausencia_obs').setLabel('Observações (Opcional)').setStyle(TextInputStyle.Paragraph).setMaxLength(200).setRequired(false);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(inputNomeId),
                    new ActionRowBuilder().addComponents(inputCargo),
                    new ActionRowBuilder().addComponents(inputDatas),
                    new ActionRowBuilder().addComponents(inputMotivo),
                    new ActionRowBuilder().addComponents(inputObs)
                );

                return interaction.showModal(modal);
            }

            // Aprovação e Recusa
            if (interaction.customId.startsWith('btn_aprovar_') || interaction.customId.startsWith('btn_recusar_')) {
                const isApprove = interaction.customId.startsWith('btn_aprovar_');
                const embed = interaction.message.embeds[0];
                if (!embed) return interaction.reply({ content: '❌ Erro ao ler embed.', ephemeral: true });

                let userId = null;
                const userField = embed.fields?.find(f => f.name.includes('Usuário Discord'));
                if (userField) {
                    const m = userField.value.match(/<@!?(\d+)>/);
                    if (m) userId = m[1];
                }
                if (!userId) userId = interaction.customId.replace('btn_aprovar_', '').replace('btn_recusar_', '');

                const member = await interaction.guild.members.fetch(userId).catch(() => null);
                if (!member) return interaction.reply({ content: '❌ Membro não encontrado.', ephemeral: true });

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
                    const finalNick = formatarApelidoSeguro(CONFIG.FORMATO_APELIDO, matchedGroup.tag, nomeField, idField);
                    await member.setNickname(finalNick).catch(() => {});
                    await member.roles.add(matchedGroup.roleId).catch(() => {});

                    const approvedEmbed = EmbedBuilder.from(embed)
                        .setColor('#2ECC71')
                        .setTitle('✅ Registro & Apelido Aprovados')
                        .addFields({ name: '👮 Avaliado por', value: `<@${interaction.user.id}>`, inline: false });

                    await interaction.message.edit({ embeds: [approvedEmbed], components: [] });
                    await interaction.reply({ content: `✅ Registro de <@${userId}> aprovado! Apelido definido para \`${finalNick}\`.`, ephemeral: true });
                } else {
                    const rejectedEmbed = EmbedBuilder.from(embed)
                        .setColor('#E74C3C')
                        .setTitle('❌ Registro Recusado')
                        .addFields({ name: '👮 Avaliado por', value: `<@${interaction.user.id}>`, inline: false });

                    await interaction.message.edit({ embeds: [rejectedEmbed], components: [] });
                    await interaction.reply({ content: `❌ Registro de <@${userId}> recusado.`, ephemeral: true });
                }
            }
        }

        // Submits
        if (interaction.isStringSelectMenu() && interaction.customId === 'select_grupo_registro') {
            const roleId = interaction.values[0];
            const grupoObj = CONFIG.GRUPOS.find(g => g.roleId === roleId) || CONFIG.GRUPOS[0];

            const modal = new ModalBuilder().setCustomId(`modal_registro_${grupoObj.roleId}`).setTitle(`Formulário — ${grupoObj.name.substring(0, 30)}`);

            const inputNome = new TextInputBuilder().setCustomId('input_nome_jogo').setLabel('Seu Nome / Apelido no Jogo').setPlaceholder('Ex: Bruno Souza').setStyle(TextInputStyle.Short).setMaxLength(20).setRequired(true);
            const inputId = new TextInputBuilder().setCustomId('input_id_jogo').setLabel('Seu ID numérico no Jogo').setPlaceholder('Ex: 1234').setStyle(TextInputStyle.Short).setMaxLength(8).setRequired(true);
            const inputContratante = new TextInputBuilder().setCustomId('input_contratante').setLabel('Quem te contratou / convidou?').setPlaceholder('Ex: Liderança / Souza').setStyle(TextInputStyle.Short).setMaxLength(30).setRequired(true);

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

            const finalNick = formatarApelidoSeguro(CONFIG.FORMATO_APELIDO, grupoObj.tag, nomeJogo, idJogo);

            const embedAprovacao = new EmbedBuilder()
                .setColor('#F1C40F')
                .setTitle('⏳ Novo Registro Aguardando Aprovação')
                .addFields(
                    { name: '👤 Usuário Discord', value: `<@${interaction.user.id}> (${interaction.user.tag})`, inline: true },
                    { name: '🎯 Grupo Escolhido', value: `🎯 **${grupoObj.name}**\n(Tag: \`${grupoObj.tag}\`)`, inline: false },
                    { name: '📝 Nome no Jogo', value: `**${nomeJogo}**`, inline: true },
                    { name: '🔢 ID no Jogo', value: `**${idJogo}**`, inline: true },
                    { name: '🤝 Quem te Contratou', value: `**${contratante}**`, inline: false },
                    { name: '🏷️ Apelido a Aplicar', value: `\`${finalNick}\``, inline: false }
                )
                .setFooter({ text: CONFIG.FOOTER })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`btn_aprovar_${interaction.user.id}`).setLabel('Aprovar Cidadania').setStyle(ButtonStyle.Success).setEmoji('✅'),
                new ButtonBuilder().setCustomId(`btn_recusar_${interaction.user.id}`).setLabel('Recusar Cidadania').setStyle(ButtonStyle.Danger).setEmoji('❌')
            );

            const channel = interaction.guild.channels.cache.get(CONFIG.CANAL_APROVACAO_ID) ||
                            await interaction.guild.channels.fetch(CONFIG.CANAL_APROVACAO_ID).catch(() => null);

            if (channel) {
                await channel.send({ embeds: [embedAprovacao], components: [row] });
            }

            await interaction.reply({
                content: `✅ **Formulário enviado com sucesso!**\nSua solicitação foi enviada para a Liderança.`,
                ephemeral: true
            });
        }
    } catch (err) {
        console.error('Erro ao processar interação:', err);
    }
});

client.login(BOT_TOKEN).catch(err => console.error("Erro no login:", err.message));
