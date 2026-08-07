/**
 * ============================================================================
 * BOT OFICIAL DE REGISTRO & AUSÊNCIAS - CLÃ HUNTERS & FAMÍLIA SOUZA
 * CÓDIGO COMPLETO CORRIGIDO (ES MODULES - import) - DISCORD.JS V14
 * TAG DO RECRUTA ATUALIZADA PARA: |Recruta|
 * ============================================================================
 *
 * Instruções de instalação:
 * 1. Salve este arquivo como "index.js"
 * 2. Crie "package.json" com "type": "module"
 * 3. Execute: npm install discord.js express dotenv
 * 4. Crie o arquivo .env com DISCORD_TOKEN=seu_token_aqui
 * 5. Execute: node index.js
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
} from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN || "SEU_TOKEN_AQUI";
const PORT = process.env.PORT || 3000;

const CONFIG = {
    "token": "",
    "canalRegistroId": "123456789012345678",
    "canalAprovacaoId": "1515448473246498866",
    "canalLogsId": "1515448473246498866",
    "canalEntradaSaidaId": "123456789012345678",
    "canalAusenciaId": "1531070382365343774",
    "canalAusenciaLogsId": "1531670383483158700",
    "cargosAdminsAprovadores": [
        "1515125822795546715",
        "123456789012345678",
        "987654321098765432"
    ],
    "embedColor": "#8A2BE2",
    "embedColorAusencia": "#E67E22",
    "authorName": "👑 CLÃ HUNTERS & FAMÍLIA SOUZA 👑",
    "authorSub": "🏡 Sistema de Registro — Cidadania & Grupos",
    "thumbnailUrl": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
    "footer": "FiveZ & Lumenfall • Sistema Automático Anti-Queda",
    "tituloPainel": "Seja bem-vindo à nossa Comunidade!",
    "descricaoPainel": "📢 **AVISO IMPORTANTE PARA TODOS (@everyone):**\n> ⚠️ **PRAZO LIMITE DE REGISTRO:** Todo membro que entrar no servidor tem um prazo máximo de **3 dias** para realizar o registro de cidadania.\n> 🚫 Se você passar de **3 dias** no servidor sem realizar o seu registro (ficando sem os cargos dos grupos), você será **kickado automaticamente** pelo sistema!\n\nPara desbloquear todos os canais do servidor e registrar sua cidadania, selecione seu grupo abaixo.\n\n🎁 **Benefícios ao registrar:**\n> ✅ **Cargo do seu Grupo escolhido**\n> 🏷️ **Apelido Atualizado:** Com a tag da facção, seu Nome e ID\n> 🔓 **Liberação imediata** dos canais e categorias do servidor\n\n👇 *Clique no botão abaixo, escolha seu grupo e preencha o formulário!*",
    "tituloPainelAusencia": "🌴 Painel de Registro de Ausência",
    "descricaoPainelAusencia": "📢 **REGISTRO DE AUSÊNCIA & FOLGA**\n> 🌴 Pretende ficar ausente das atividades ou ações no servidor?\n> ⚠️ Registre sua ausência com motivo e prazo de retorno para avisar a administração e evitar ser removido por inatividade.\n\n👇 *Clique no botão abaixo para preencher sua justificativa!*",
    "regrasTexto": "# 📜 REGRAS OFICIAIS • CLÃ HUNTERS\⚔️ 1. Respeito\nRespeite todos os membros do clã, aliados, adversários e a liderança. Qualquer falta de respeito poderá resultar em punição.\n\n## 👑 2. Respeite a Hierarquia\nAs decisões da liderança devem ser respeitadas. Caso tenha dúvidas ou problemas, procure um superior.\n\n## 🦺 3. Uniforme Obrigatório\nÉ obrigatório utilizar o **Preset Hunters** durante:\nbind keyboard \"6\" \"preset Hunters\"\n* 🔴 Áreas Vermelhas;\n* 🟡 Áreas Amarelas;\n* ⚔️ Eventos;\n* 💥 Horários de PVP.\n\n## 📻 4. Rádio Oficial\nÉ obrigatório permanecer na **rádio 633** durante todas as atividades do Clã.\n🛒 Para vendas, utilize exclusivamente a **rádio 635**.\n\n## 🐺 5. Prioridade ao Clã\nSempre que houver **QRR**, defesa do território ou convocação da liderança, o **Clã Hunters** deve ser sua prioridade.\n\n## 🚫 6. Não Prejudique o Clã\nÉ proibido realizar qualquer ação que possa gerar punições ao Clã ou prejudicar sua reputação.\n\n## 🤝 7. Trabalho em Equipe\nAjude seus companheiros sempre que possível. O sucesso do Clã depende da união de todos.\n\n## 📦 8. Estoque do Clã\nTodo aço referente às metas obrigatórias deve ser depositado no estoque do Clã e registrado corretamente no painel.\n\n## 📅 9. Regra de Ausência\nCaso precise se ausentar, é **obrigatório informar a liderança** e registrar sua ausência.\n❌ Membros que ficarem **3 dias consecutivos sem entrar na cidade e sem justificar a ausência** serão **retirados do painel do Clã Hunters**.\n\n## 💬 10. Comunicação\nMantenha uma comunicação organizada nas rádios e no Discord.\n\n## ⚠️ 11. Punições\nO descumprimento de qualquer regra poderá resultar em Advertência, Suspensão, Rebaixamento ou Expulsão.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n> 🐺 **DISCIPLINA • RESPEITO • LEALDADE • UNIÃO**\n> **Quem veste o Preset Hunters representa todo o Clã. Honre a camisa e fortaleça a nossa família!** ⚔️🔥",
    "regrasLink": "https://fivez.gitbook.io/fivez-regras",
    "perguntaRegrasCincoZ": "O que é RDM, VDM e Amor à Vida na Cidade?",
    "perguntaInatividadecincoZ": "Ciente de SafeZone, Anti-Jogo e Inatividade?",
    "cargoCidadaoGeralId": "123456789012345691",
    "cargoNaoRegistradoId": "123456789012345692",
    "prazoRegistroDias": 3,
    "autoReprovarRespostasInvalidas": true,
    "grupos": [
        {
            "id": "grupo_cidadao_cincoz",
            "name": "Cidadão FiveZ",
            "roleId": "1528075981078663259",
            "tag": "[Cidadão]",
            "description": "Nome temporário antes de ser aprovado",
            "emoji": "🏙️"
        },
        {
            "id": "grupo_hunters_recruta",
            "name": "Recruta Hunters",
            "roleId": "1515125826780135485",
            "tag": "|Recruta|", // TAG ATUALIZADA |Recruta|
            "description": "Cargo de recruta em teste",
            "emoji": "🎯"
        },
        {
            "id": "grupo_hunters_membro",
            "name": "Membro Hunters",
            "roleId": "1528075981078663259",
            "tag": "|Membro|",
            "description": "Membro oficial do Clã Hunters",
            "emoji": "🐺"
        },
        {
            "id": "grupo_souza_membro",
            "name": "Família Souza",
            "roleId": "1515125828185493675",
            "tag": "|Souza|",
            "description": "Membro da Família Souza",
            "emoji": "⚜️"
        },
        {
            "id": "grupo_aliado",
            "name": "Aliado",
            "roleId": "1515125842328424640",
            "tag": "|Aliado|",
            "description": "Amigos que estão sempre aqui",
            "emoji": "🤝"
        },
        {
            "id": "grupo_comprador",
            "name": "Comprador",
            "roleId": "1517662363266842725",
            "tag": "[Comprador]",
            "description": "Comprador de armas",
            "emoji": "🛒"
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

const confirmacoesRegras = new Map();

function eRespostaValida(texto) {
    if (!texto || typeof texto !== 'string') return false;
    const limpo = texto.trim().toLowerCase();
    
    if (limpo.length < 5) return false;
    
    const invalidas = [
        '.', ',', '..', '...', '....', '?', '!', '-', 'a', 'x', 'n', 'no',
        'nao', 'não', 'nao sei', 'não sei', 'num sei', 'nem sei', 'sei nao', 'sei não',
        'sei la', 'sei lá', 'slk', 'fodase', 'foda-se', 'nada', 'nenhum', 'nenhuma',
        'qualquer', 'qualquer coisa', 'nao li', 'não li', 'nao sei de nada', 'recuso',
        'depois', 'pular', 'so sim', 'so nao', 'sla', 'slam', 'saber nao', 'concordo',
        'sim li', 'sim, li', 'sim ciente', 'sim, ciente', 'tudo ok'
    ];

    if (invalidas.includes(limpo)) return false;
    if (/^[.,!?;:\-_\s]+$/.test(limpo)) return false;

    const frasesCopiadas = [
        'fivez.gitbook.io',
        'gitbook.io',
        'sim, li em fivez.gitbook.io/fivez-regras',
        'sim, li em',
        'sim, ciente do prazo e anti-jogo',
        'o que é rdm, vdm e amor à vida na cidade',
        'o que e rdm, vdm e amor a vida na cidade',
        'ciente de safezone, anti-jogo e inatividade',
        'responda com suas palavras',
        'proibido copiar e colar',
        'ex: sim, li em'
    ];

    for (const frase of frasesCopiadas) {
        if (limpo.includes(frase)) return false;
    }

    return true;
}

function formatarApelido(tag, nome, id) {
    let nick = (tag + " " + nome + " | " + id).trim();
    return nick.length > 32 ? nick.substring(0, 29) + "..." : nick;
}

async function enviarWelcomeEmbed(member, tag, nome, idJogo) {
    const canal = member.guild.channels.cache.get(CONFIG.canalEntradaSaidaId);
    if (!canal || !canal.isTextBased()) return;

    const totalMembros = member.guild.memberCount;

    const welcomeEmbed = new EmbedBuilder()
        .setColor("#8A2BE2")
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setDescription(
            `╔════════════════════════════════════ 👑 FAMÍLIA SOUZA • HUNTERS 🐺 ════════════════════════════════════╗\n` +
            `║                                                                                                      ║\n` +
            `║                                   ✦ BEM-VINDO À FAMÍLIA HUNTERS ✦                                   ║\n` +
            `║                                                                                                      ║\n` +
            `║                                      🐺 "FORÇA • LEALDADE • RESPEITO" 🐺                            ║\n` +
            `║                                                                                                      ║\n` +
            `╠══════════════════════════════════════════════════════════════════════════════════════════════════════╣\n` +
            `║                                                                                                      ║\n` +
            `║  👤 MEMBRO............... ➜ <@${member.id}>                                                          ║\n` +
            `║  🏷️ ORGANIZAÇÃO.......... ➜ HUNTERS                                                                  ║\n` +
            `║  🌍 SERVIDOR............. ➜ Família Souza                                                            ║\n` +
            `║  👥 MEMBROS.............. ➜ ${totalMembros}                                                          ║\n` +
            `║                                                                                                      ║\n` +
            `╠══════════════════════════════════════════════════════════════════════════════════════════════════════╣\n` +
            `║                                                                                                      ║\n` +
            `║  📖 Leia as regras do servidor.                                                                      ║\n` +
            `║  🎯 Aguarde um Líder realizar seu registro.                                                          ║\n` +
            `║  🎙️ Utilize a rádio oficial quando solicitado.                                                      ║\n` +
            `║  🤝 Respeite todos os membros e a hierarquia.                                                        ║\n` +
            `║  ⚔️ Vista a camisa e honre o nome da HUNTERS.                                                        ║\n` +
            `║                                                                                                      ║\n` +
            `╠══════════════════════════════════════════════════════════════════════════════════════════════════════╣\n` +
            `║                                                                                                      ║\n` +
            `║                     👑 "A GLÓRIA É CONQUISTADA POR QUEM LUTA AO LADO DA FAMÍLIA." 👑                ║\n` +
            `║                                                                                                      ║\n` +
            `║                              💜 SEJA MUITO BEM-VINDO À HUNTERS 💜                                   ║\n` +
            `║                                                                                                      ║\n` +
            `╚════════════════════════════════════ 👑 FAMÍLIA SOUZA • HUNTERS 🐺 ════════════════════════════════════╝`
        )
        .setFooter({ text: "👑 HUNTERS • Disciplina • União • Lealdade" })
        .setTimestamp();

    await canal.send({ embeds: [welcomeEmbed] }).catch(err => console.error("Erro envio welcome:", err));
}

const app = express();
app.get('/', (req, res) => res.send('🤖 Bot Clã Hunters Online!'));
app.listen(PORT, () => console.log("🌐 Servidor HTTP rodando na porta " + PORT));

client.once(Events.ClientReady, (c) => {
    console.log("✅ Bot logado com sucesso como " + c.user.tag);
});

client.on(Events.GuildMemberAdd, async (member) => {
    const canal = member.guild.channels.cache.get(CONFIG.canalEntradaSaidaId);
    if (canal && canal.isTextBased()) {
        const totalMembros = member.guild.memberCount;
        const embedEntrada = new EmbedBuilder()
            .setColor("#8A2BE2")
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(
                `╔════════════════════════════════════ 👑 FAMÍLIA SOUZA • HUNTERS 🐺 ════════════════════════════════════╗\n` +
                `║                                                                                                      ║\n` +
                `║                                   ✦ BEM-VINDO À FAMÍLIA HUNTERS ✦                                   ║\n` +
                `║                                                                                                      ║\n` +
                `║                                      🐺 "FORÇA • LEALDADE • RESPEITO" 🐺                            ║\n` +
                `║                                                                                                      ║\n` +
                `╠══════════════════════════════════════════════════════════════════════════════════════════════════════╣\n` +
                `║                                                                                                      ║\n` +
                `║  👤 MEMBRO............... ➜ <@${member.id}>                                                          ║\n` +
                `║  🏷️ ORGANIZAÇÃO.......... ➜ HUNTERS                                                                  ║\n` +
                `║  🌍 SERVIDOR............. ➜ Família Souza                                                            ║\n` +
                `║  👥 MEMBROS.............. ➜ ${totalMembros}                                                          ║\n` +
                `║                                                                                                      ║\n` +
                `╠══════════════════════════════════════════════════════════════════════════════════════════════════════╣\n` +
                `║                                                                                                      ║\n` +
                `║  📖 Leia as regras do servidor.                                                                      ║\n` +
                `║  🎯 Aguarde um Líder realizar seu registro.                                                          ║\n` +
                `║  🎙️ Utilize a rádio oficial quando solicitado.                                                      ║\n` +
                `║  🤝 Respeite todos os membros e a hierarquia.                                                        ║\n` +
                `║  ⚔️ Vista a camisa e honre o nome da HUNTERS.                                                        ║\n` +
                `║                                                                                                      ║\n` +
                `╠══════════════════════════════════════════════════════════════════════════════════════════════════════╣\n` +
                `║                                                                                                      ║\n` +
                `║                     👑 "A GLÓRIA É CONQUISTADA POR QUEM LUTA AO LADO DA FAMÍLIA." 👑                ║\n` +
                `║                                                                                                      ║\n` +
                `║                              💜 SEJA MUITO BEM-VINDO À HUNTERS 💜                                   ║\n` +
                `║                                                                                                      ║\n` +
                `╚════════════════════════════════════ 👑 FAMÍLIA SOUZA • HUNTERS 🐺 ════════════════════════════════════╝`
            )
            .setFooter({ text: "👑 HUNTERS • Disciplina • União • Lealdade" })
            .setTimestamp();
        await canal.send({ embeds: [embedEntrada] });
    }
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;

    if (message.content === '!painel' || message.content === '!painel-registro' || message.content === '!painelregistro') {
        const isStaff = message.member.permissions.has(PermissionsBitField.Flags.Administrator) ||
            CONFIG.cargosAdminsAprovadores.some(r => message.member.roles.cache.has(r));

        if (!isStaff) return message.reply({ content: "❌ Apenas Staff pode enviar o painel." });

        const embed = new EmbedBuilder()
            .setColor("#8A2BE2")
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setDescription(
                `╔════════════════════════════════════ 👑 FAMÍLIA SOUZA • HUNTERS 🐺 ════════════════════════════════════╗\n` +
                `║                                                                                                      ║\n` +
                `║                                   ✦ BEM-VINDO À FAMÍLIA HUNTERS ✦                                   ║\n` +
                `║                                                                                                      ║\n` +
                `║                                      🐺 "FORÇA • LEALDADE • RESPEITO" 🐺                            ║\n` +
                `║                                                                                                      ║\n` +
                `╠══════════════════════════════════════════════════════════════════════════════════════════════════════╣\n` +
                `║                                                                                                      ║\n` +
                `║  👤 MEMBRO............... ➜ Clique no botão abaixo para registrar                                    ║\n` +
                `║  🏷️ ORGANIZAÇÃO.......... ➜ HUNTERS                                                                  ║\n` +
                `║  🌍 SERVIDOR............. ➜ Família Souza                                                            ║\n` +
                `║  👥 MEMBROS.............. ➜ ${message.guild.memberCount}                                             ║\n` +
                `║                                                                                                      ║\n` +
                `╠══════════════════════════════════════════════════════════════════════════════════════════════════════╣\n` +
                `║                                                                                                      ║\n` +
                `║  📖 Leia as regras do servidor.                                                                      ║\n` +
                `║  🎯 Clique no botão **📝 Realizar Registro / Set** abaixo para iniciar seu cadastro.                ║\n` +
                `║  🎙️ Utilize a rádio oficial quando solicitado (Rádio 633).                                          ║\n` +
                `║  🤝 Respeite todos os membros e a hierarquia.                                                        ║\n` +
                `║  ⚔️ Vista a camisa e honre o nome da HUNTERS.                                                        ║\n` +
                `║                                                                                                      ║\n` +
                `╠══════════════════════════════════════════════════════════════════════════════════════════════════════╣\n` +
                `║                                                                                                      ║\n` +
                `║                     👑 "A GLÓRIA É CONQUISTADA POR QUEM LUTA AO LADO DA FAMÍLIA." 👑                ║\n` +
                `║                                                                                                      ║\n` +
                `║                              💜 SEJA MUITO BEM-VINDO À HUNTERS 💜                                   ║\n` +
                `║                                                                                                      ║\n` +
                `╚════════════════════════════════════ 👑 FAMÍLIA SOUZA • HUNTERS 🐺 ════════════════════════════════════╝`
            )
            .setFooter({ text: "👑 HUNTERS • Disciplina • União • Lealdade" })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_iniciar_registro')
                .setLabel('Realizar Registro / Set')
                .setEmoji('📝')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setLabel('Regras Oficiais')
                .setEmoji('📜')
                .setURL(CONFIG.regrasLink || 'https://fivez.gitbook.io/fivez-regras')
                .setStyle(ButtonStyle.Link)
        );

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton() && (interaction.customId === 'btn_iniciar_registro' || interaction.customId === 'iniciar_registro_sigio')) {
        const gruposValidos = (CONFIG.grupos || []).filter(g => 
            g && (g.roleId || g.id) &&
            g.id !== 'grupo_cidadao_cincoz' &&
            (g.name || '').toLowerCase() !== 'cidadão fivez'
        );

        const options = gruposValidos.map(g => ({
            label: (`${g.name} ${g.tag}`).trim().substring(0, 100),
            value: String(g.roleId || g.id),
            description: (g.description || `Tag ${g.tag}`).substring(0, 50),
            emoji: g.emoji || '🎯'
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_grupo')
            .setPlaceholder('Selecione sua Tag / Grupo...')
            .addOptions(options);

        return interaction.reply({ 
            content: "👇 **Selecione a sua Tag / Grupo abaixo para abrir o formulário:**", 
            components: [new ActionRowBuilder().addComponents(selectMenu)], 
            ephemeral: true 
        });
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'select_grupo') {
        const roleId = interaction.values[0];
        const modal = new ModalBuilder().setCustomId('modal_reg_' + roleId).setTitle('Formulário de Registro');

        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nome').setLabel('Nome no Jogo').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('id_jogo').setLabel('ID no Jogo').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('recrutador').setLabel('Quem te recrutou?').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('regras_fivez').setLabel('O que é RDM, VDM e Amor à Vida?').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('regras_inatividade').setLabel('Ciente de Inatividade (Máx 3 dias)?').setStyle(TextInputStyle.Short).setRequired(true))
        );

        return interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_reg_')) {
        const roleId = interaction.customId.replace('modal_reg_', '');
        const grupo = CONFIG.grupos.find(g => g.roleId === roleId || g.id === roleId) || { tag: "|Recruta|", name: "Recruta Hunters" };
        const nome = interaction.fields.getTextInputValue('nome');
        const idJogo = interaction.fields.getTextInputValue('id_jogo');
        const recrutador = interaction.fields.getTextInputValue('recrutador');
        const respRegras = interaction.fields.getTextInputValue('regras_fivez');
        const respInat = interaction.fields.getTextInputValue('regras_inatividade');

        const nickFormatado = formatarApelido(grupo.tag, nome, idJogo);

        const embedStaff = new EmbedBuilder()
            .setTitle('📩 Novo Pedido de Set')
            .setColor('#F1C40F')
            .addFields(
                { name: 'Membro', value: `<@${interaction.user.id}>`, inline: true },
                { name: 'Grupo Escolhido', value: grupo.name, inline: true },
                { name: 'Tag Prevista', value: grupo.tag, inline: true },
                { name: 'Nome | ID no Jogo', value: `${nome} | ${idJogo}` },
                { name: 'Recrutador', value: recrutador, inline: true },
                { name: 'Apelido Final', value: nickFormatado }
            )
            .setFooter({ text: CONFIG.footer });

        const botoes = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`aprovar_${interaction.user.id}_${roleId}`).setLabel('Aprovar (' + grupo.tag + ')').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`recusar_${interaction.user.id}`).setLabel('Recusar').setStyle(ButtonStyle.Danger)
        );

        const canalAprov = client.channels.cache.get(CONFIG.canalAprovacaoId);
        if (canalAprov && canalAprov.isTextBased()) await canalAprov.send({ embeds: [embedStaff], components: [botoes] });

        return interaction.reply({ content: `✅ Pedido enviado! Apelido previsto: ${nickFormatado}`, ephemeral: true });
    }

    if (interaction.isButton() && (interaction.customId.startsWith('aprovar_') || interaction.customId.startsWith('recusar_'))) {
        const isStaff = CONFIG.cargosAdminsAprovadores.some(id => interaction.member.roles.cache.has(id)) ||
            interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

        if (!isStaff) return interaction.reply({ content: "Apenas staff pode aprovar/recusar.", ephemeral: true });

        const parts = interaction.customId.split('_');
        const action = parts[0];
        const targetId = parts[1];

        if (action === 'aprovar') {
            const roleId = parts[2];
            const grupo = CONFIG.grupos.find(g => g.roleId === roleId || g.id === roleId) || { tag: "|Recruta|" };
            const targetMember = await interaction.guild.members.fetch(targetId).catch(() => null);

            if (targetMember) {
                try {
                    const embedOriginal = interaction.message.embeds[0];
                    const infoNome = embedOriginal.fields[3].value.split(' | ');
                    const nick = formatarApelido(grupo.tag, infoNome[0], infoNome[1] || '00');

                    await targetMember.roles.add(roleId);
                    if (interaction.guild.ownerId !== targetId) {
                        await targetMember.setNickname(nick);
                    }

                    // Envia o Card Oficial de Boas-Vindas no Canal de Entrada!
                    await enviarWelcomeEmbed(targetMember, grupo.tag, infoNome[0], infoNome[1] || '00');
                } catch (e) {
                    console.error("Erro ao alterar membro:", e);
                }
            }

            await interaction.message.edit({ content: `✅ Aprovado por <@${interaction.user.id}> com a tag ${grupo.tag}`, components: [] });
            return interaction.reply({ content: `Membro aprovado com sucesso com a tag ${grupo.tag}!`, ephemeral: true });
        }

        if (action === 'recusar') {
            await interaction.message.edit({ content: `❌ Recusado por <@${interaction.user.id}>`, components: [] });
            return interaction.reply({ content: "Membro recusado!", ephemeral: true });
        }
    }
});

client.login(TOKEN);
