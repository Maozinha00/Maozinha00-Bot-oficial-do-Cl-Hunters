/**
 * ============================================================================
 * BOT OFICIAL DE REGISTRO & AUSÊNCIAS - CLÃ HUNTERS & FAMÍLIA SOUZA
 * CÓDIGO COMPLETO CORRIGIDO (ES MODULES - import) - DISCORD.JS V14
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
    "embedColor": "#2ECC71",
    "embedColorAusencia": "#E67E22",
    "authorName": "👑 FAMÍLIA SOUZA INFINITA 👑",
    "authorSub": "🏡 Sistema de Registro — Cidadania & Grupos",
    "thumbnailUrl": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
    "footer": "FiveZ & Lumenfall • Sistema Automático Anti-Queda",
    "tituloPainel": "Seja bem-vindo à nossa Comunidade!",
    "descricaoPainel": "📢 **AVISO IMPORTANTE PARA TODOS (@everyone):**\n> ⚠️ **PRAZO LIMITE DE REGISTRO:** Todo membro que entrar no servidor tem um prazo máximo de **3 dias** para realizar o registro de cidadania.\n> 🚫 Se você passar de **3 dias** no servidor sem realizar o seu registro (ficando sem os cargos dos grupos), você será **kickado automaticamente** pelo sistema!\n\nPara desbloquear todos os canais do servidor e registrar sua cidadania, selecione seu grupo abaixo.\n\n🎁 **Benefícios ao registrar:**\n> ✅ **Cargo do seu Grupo escolhido**\n> 🏷️ **Apelido Atualizado:** Com a tag da facção, seu Nome e ID\n> 🔓 **Liberação imediata** dos canais e categorias do servidor\n\n👇 *Clique no botão abaixo, escolha seu grupo e preencha o formulário!*",
    "tituloPainelAusencia": "🌴 Painel de Registro de Ausência",
    "descricaoPainelAusencia": "📢 **REGISTRO DE AUSÊNCIA & FOLGA**\n> 🌴 Pretende ficar ausente das atividades ou ações no servidor?\n> ⚠️ Registre sua ausência com motivo e prazo de retorno para avisar a administração e evitar ser removido por inatividade.\n\n👇 *Clique no botão abaixo para preencher sua justificativa!*",
    "regrasTexto": "# 📜 REGRAS OFICIAIS • CLÃ HUNTERS\n\n<@&1527848364496912404>\n<@&1523277774436171796>\n<@&1528075981078663259>\n<@&1515125826780135485>\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n## ⚔️ 1. Respeito\nRespeite todos os membros do clã, aliados, adversários e a liderança. Qualquer falta de respeito poderá resultar em punição.\n\n## 👑 2. Respeite a Hierarquia\nAs decisões da liderança devem ser respeitadas. Caso tenha dúvidas ou problemas, procure um superior.\n\n## 🦺 3. Uniforme Obrigatório\nÉ obrigatório utilizar o **Preset Hunters** durante:\nbind keyboard \"6\" \"preset Hunters\"\n* 🔴 Áreas Vermelhas;\n* 🟡 Áreas Amarelas;\n* ⚔️ Eventos;\n* 💥 Horários de PVP.\n\n## 📻 4. Rádio Oficial\nÉ obrigatório permanecer na **rádio 633** durante todas as atividades do Clã.\n🛒 Para vendas, utilize exclusivamente a **rádio 635**.\n\n## 🐺 5. Prioridade ao Clã\nSempre que houver **QRR**, defesa do território ou convocação da liderança, o **Clã Hunters** deve ser sua prioridade.\n\n## 🚫 6. Não Prejudique o Clã\nÉ proibido realizar qualquer ação que possa gerar punições ao Clã ou prejudicar sua reputação.\n\n## 🤝 7. Trabalho em Equipe\nAjude seus companheiros sempre que possível. O sucesso do Clã depende da união de todos.\n\n## 📦 8. Estoque do Clã\nTodo aço referente às metas obrigatórias deve ser depositado no estoque do Clã e registrado corretamente no painel.\n\n## 📅 9. Regra de Ausência\nCaso precise se ausentar, é **obrigatório informar a liderança** e registrar sua ausência.\n❌ Membros que ficarem **3 dias consecutivos sem entrar na cidade e sem justificar a ausência** serão **retirados do painel do Clã Hunters**.\n\n## 💬 10. Comunicação\nMantenha uma comunicação organizada nas rádios e no Discord.\n\n## ⚠️ 11. Punições\nO descumprimento de qualquer regra poderá resultar em Advertência, Suspensão, Rebaixamento ou Expulsão.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n> 🐺 **DISCIPLINA • RESPEITO • LEALDADE • UNIÃO**\n> **Quem veste o Preset Hunters representa todo o Clã. Honre a camisa e fortaleça a nossa família!** ⚔️🔥",
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
            "roleId": "1523277774436171796",
            "tag": "[Recruta]",
            "description": "Cargo de recruta em teste",
            "emoji": "🎯"
        },
        {
            "id": "grupo_hunters_membro",
            "name": "Membro Hunters",
            "roleId": "1527848364496912404",
            "tag": "[Hunters]",
            "description": "Membro oficial do Clã Hunters",
            "emoji": "🐺"
        },
        {
            "id": "grupo_souza_membro",
            "name": "Família Souza",
            "roleId": "1515125826780135485",
            "tag": "[Souza]",
            "description": "Membro da Família Souza",
            "emoji": "⚜️"
        },
        {
            "id": "grupo_aliado",
            "name": "Aliado",
            "roleId": "123456789012345689",
            "tag": "[Aliado]",
            "description": "Amigos que estão sempre aqui",
            "emoji": "🤝"
        },
        {
            "id": "grupo_comprador",
            "name": "Comprador",
            "roleId": "123456789012345686",
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

async function enviarRegrasPV(user) {
    if (!user) return false;
    const embedPV = new EmbedBuilder()
        .setColor(CONFIG.embedColor || "#2ECC71")
        .setTitle("📜 REGRAS OBRIGATÓRIAS - CLÃ HUNTERS & FAMÍLIA SOUZA")
        .setAuthor({ name: CONFIG.authorName || '👑 FAMÍLIA SOUZA INFINITA 👑', iconURL: CONFIG.botAvatarUrl || "https://i.imgur.com/B21O3Ok.gif" })
        .setThumbnail(CONFIG.thumbnailUrl || CONFIG.botAvatarUrl || "https://i.imgur.com/B21O3Ok.gif")
        .setImage(CONFIG.imageUrl || "https://i.imgur.com/B21O3Ok.gif")
        .setDescription("Olá <@" + user.id + ">!\n\n" + CONFIG.regrasTexto + "\n\n📖 **Livro Oficial de Regras FiveZ:** " + (CONFIG.regrasLink || "https://fivez.gitbook.io/fivez-regras") + "\n\n**Confirme a leitura no botão abaixo:**")
        .setFooter({ text: CONFIG.footer });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("btn_confirmar_regras_pv")
            .setLabel("Li e Aceito as Regras")
            .setEmoji("✅")
            .setStyle(ButtonStyle.Success)
    );

    try {
        await user.send({ embeds: [embedPV], components: [row] });
        return true;
    } catch (err) {
        return false;
    }
}

const app = express();
app.get('/', (req, res) => res.send('🤖 Bot Clã Hunters Online!'));
app.listen(PORT, () => console.log("🌐 Servidor HTTP rodando na porta " + PORT));

client.once(Events.ClientReady, (c) => {
    console.log("✅ Bot logado com sucesso como " + c.user.tag);
});

client.on(Events.GuildMemberAdd, async (member) => {
    await enviarRegrasPV(member.user);
    const canal = member.guild.channels.cache.get(CONFIG.canalEntradaSaidaId);
    if (canal && canal.isTextBased()) {
        canal.send({ content: "👋 Bem-vindo <@" + member.id + ">! Verifique seu PV para as regras (" + (CONFIG.regrasLink || "https://fivez.gitbook.io/fivez-regras") + ") e registre-se em <#" + CONFIG.canalRegistroId + ">." });
    }
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;

    if (message.content === '!painel' || message.content === '!painel-registro' || message.content === '!painelregistro') {
        const isStaff = message.member.permissions.has(PermissionsBitField.Flags.Administrator) ||
            CONFIG.cargosAdminsAprovadores.some(r => message.member.roles.cache.has(r));

        if (!isStaff) return message.reply({ content: "❌ Apenas Staff pode enviar o painel." });

        const embed = new EmbedBuilder()
            .setColor(CONFIG.embedColor)
            .setTitle(CONFIG.tituloPainel)
            .setAuthor({ name: CONFIG.authorName || '👑 FAMÍLIA SOUZA INFINITA 👑', iconURL: CONFIG.botAvatarUrl || "https://i.imgur.com/B21O3Ok.gif" })
            .setThumbnail(CONFIG.thumbnailUrl || CONFIG.botAvatarUrl || "https://i.imgur.com/B21O3Ok.gif")
            .setImage(CONFIG.imageUrl || "https://i.imgur.com/B21O3Ok.gif")
            .setDescription(CONFIG.descricaoPainel)
            .setFooter({ text: CONFIG.footer });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_iniciar_registro')
                .setLabel('Realizar Registro')
                .setStyle(ButtonStyle.Success)
        );

        await message.channel.send({ embeds: [embed], components: [row] });
    }

    if (message.content === '!painel-ausencia' || message.content === '!painel-ausência' || message.content === '!painelausencia') {
        const isStaff = message.member.permissions.has(PermissionsBitField.Flags.Administrator) ||
            CONFIG.cargosAdminsAprovadores.some(r => message.member.roles.cache.has(r));

        if (!isStaff) return message.reply({ content: "❌ Apenas Staff pode enviar o painel de ausência." });

        const embedAusencia = new EmbedBuilder()
            .setColor(CONFIG.embedColorAusencia || "#E67E22")
            .setTitle(CONFIG.tituloPainelAusencia || "🌴 Painel de Registro de Ausência")
            .setAuthor({ name: CONFIG.authorName || '👑 FAMÍLIA SOUZA INFINITA 👑', iconURL: CONFIG.botAvatarUrl || "https://i.imgur.com/B21O3Ok.gif" })
            .setThumbnail(CONFIG.thumbnailUrl || CONFIG.botAvatarUrl || "https://i.imgur.com/B21O3Ok.gif")
            .setImage(CONFIG.imageUrl || "https://i.imgur.com/B21O3Ok.gif")
            .setDescription(CONFIG.descricaoPainelAusencia || "Preencha sua justificativa de ausência.")
            .setFooter({ text: CONFIG.footer });

        const rowAusencia = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_registrar_ausencia')
                .setLabel('Registrar Ausência')
                .setStyle(ButtonStyle.Secondary)
        );

        await message.channel.send({ embeds: [embedAusencia], components: [rowAusencia] });
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton() && interaction.customId === 'btn_confirmar_regras_pv') {
        confirmacoesRegras.set(interaction.user.id, true);
        return interaction.reply({ content: "✅ Regras confirmadas!", ephemeral: true });
    }

    if (interaction.isButton() && (interaction.customId === 'btn_iniciar_registro' || interaction.customId === 'iniciar_registro_sigio')) {
        const gruposValidos = (CONFIG.grupos || []).filter(g => 
            g && (g.roleId || g.id) &&
            g.id !== 'grupo_cidadao_cincoz' &&
            g.roleId !== '1528075981078663259' &&
            g.roleId !== CONFIG.cargoCidadaoGeralId &&
            g.roleId !== CONFIG.cargoNaoRegistradoId &&
            (g.name || '').toLowerCase() !== 'cidadão fivez'
        );
        
        if (gruposValidos.length === 0) {
            return interaction.reply({ content: "❌ Nenhum grupo disponível para seleção no momento.", ephemeral: true });
        }

        const options = gruposValidos.map(g => {
            const roleIdStr = String(g.roleId || g.id || 'cargo_padrao');
            const nameStr = String(g.name || 'Grupo');
            const tagStr = String(g.tag || '');
            const descStr = String(g.description || ("Tag " + tagStr)).trim();

            const opt = {
                label: (nameStr + " " + tagStr).trim().substring(0, 100) || 'Grupo',
                value: roleIdStr,
                description: descStr.substring(0, 50) || 'Selecione este grupo'
            };

            if (g.emoji && typeof g.emoji === 'string' && g.emoji.trim() !== '') {
                opt.emoji = g.emoji.trim();
            }

            return opt;
        });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_grupo')
            .setPlaceholder('Selecione sua Tag / Grupo...')
            .addOptions(options);

        return interaction.reply({ 
            content: "👇 **Selecione a sua Tag / Grupo abaixo para abrir o formulário de cidadania:**", 
            components: [new ActionRowBuilder().addComponents(selectMenu)], 
            ephemeral: true 
        });
    }

    if (interaction.isButton() && (interaction.customId === 'btn_registrar_ausencia' || interaction.customId === 'abrir_modal_ausencia')) {
        const modal = new ModalBuilder().setCustomId('modal_ausencia').setTitle('Formulário de Ausência');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('motivo').setLabel('Motivo').setStyle(TextInputStyle.Paragraph).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('data_inicio').setLabel('Data de Início').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('previsao_retorno').setLabel('Previsão de Retorno').setStyle(TextInputStyle.Short).setRequired(true))
        );
        return interaction.showModal(modal);
    }

    if (interaction.isStringSelectMenu() && (interaction.customId === 'select_grupo' || interaction.customId === 'selecionar_grupo_registro')) {
        const roleId = interaction.values[0];
        const modal = new ModalBuilder().setCustomId('modal_reg_' + roleId).setTitle('Formulário de Registro');

        const lblRegras = (CONFIG.perguntaRegrasCincoZ || 'O que é RDM, VDM e Amor à Vida na Cidade?').substring(0, 45);
        const lblInat = (CONFIG.perguntaInatividadecincoZ || 'Ciente de SafeZone, Anti-Jogo e Inatividade?').substring(0, 45);

        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nome').setLabel('Nome no Jogo').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('id_jogo').setLabel('ID no Jogo').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('recrutador').setLabel('Quem te recrutou?').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('regras_fivez').setLabel(lblRegras).setPlaceholder('Explique com suas palavras (Proibido copiar/colar)').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('regras_inatividade').setLabel(lblInat).setPlaceholder('Responda com suas palavras (Não copie exemplo)').setStyle(TextInputStyle.Short).setRequired(true))
        );

        return interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'modal_ausencia') {
        const motivo = interaction.fields.getTextInputValue('motivo');
        const inicio = interaction.fields.getTextInputValue('data_inicio');
        const retorno = interaction.fields.getTextInputValue('previsao_retorno');

        const canalAusencia = interaction.guild.channels.cache.get(CONFIG.canalAusenciaLogsId);
        if (canalAusencia && canalAusencia.isTextBased()) {
            const embed = new EmbedBuilder()
                .setColor(CONFIG.embedColorAusencia)
                .setTitle('🌴 Registro de Ausência')
                .addFields(
                    { name: 'Membro', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'Início', value: inicio, inline: true },
                    { name: 'Retorno', value: retorno, inline: true },
                    { name: 'Motivo', value: motivo }
                )
                .setFooter({ text: CONFIG.footer });
            await canalAusencia.send({ embeds: [embed] });
        }
        return interaction.reply({ content: "✅ Ausência registrada!", ephemeral: true });
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_reg_')) {
        const roleId = interaction.customId.replace('modal_reg_', '');
        const grupo = CONFIG.grupos.find(g => g.roleId === roleId || g.id === roleId) || { name: "Recruta", tag: "[Recruta]" };
        const nome = interaction.fields.getTextInputValue('nome');
        const idJogo = interaction.fields.getTextInputValue('id_jogo');
        const recrutador = interaction.fields.getTextInputValue('recrutador');
        let respRegras = '';
        let respInat = '';
        try {
            respRegras = interaction.fields.getTextInputValue('regras_fivez');
            respInat = interaction.fields.getTextInputValue('regras_inatividade');
        } catch (e) {
            respRegras = '';
            respInat = '';
        }

        const regrasValidas = eRespostaValida(respRegras);
        const inatividadeValida = eRespostaValida(respInat);

        if (!regrasValidas || !inatividadeValida) {
            const motivoText = !regrasValidas && !inatividadeValida 
                ? "Respostas das 2 perguntas foram consideradas inválidas (ex: '.', 'não sei' ou muito curtas)."
                : !regrasValidas 
                    ? "Resposta sobre as Regras foi considerada inválida (ex: '.', 'não sei' ou resposta fora do padrão)."
                    : "Resposta sobre Anti-Jogo / Inatividade foi considerada inválida (ex: '.', 'não sei' ou muito curta).";

            const embedReprovado = new EmbedBuilder()
                .setTitle('❌ Registro REPROVADO Automaticamente!')
                .setColor('#E74C3C')
                .setDescription(`Olá <@${interaction.user.id}>, seu formulário de registro foi **REPROVADO AUTOMATICAMENTE** por conter respostas incorretas ou fora do acordo.\n\n⚠️ **Motivo:** ${motivoText}\n\n📖 **O que fazer?**\n1. Leia atentamente as regras em: ${CONFIG.regrasLink || 'https://fivez.gitbook.io/fivez-regras'}\n2. Acesse novamente o canal <#${CONFIG.canalRegistroId}> e preencha o formulário respondendo corretamente.`)
                .setFooter({ text: CONFIG.footer });

            await interaction.reply({ embeds: [embedReprovado], ephemeral: true });

            const canalAprov = client.channels.cache.get(CONFIG.canalAprovacaoId);
            if (canalAprov && canalAprov.isTextBased()) {
                const embedLogStaff = new EmbedBuilder()
                    .setTitle('🚫 Registro Reprovado Automático (Respostas Inválidas)')
                    .setColor('#95A5A6')
                    .addFields(
                        { name: 'Membro', value: `<@${interaction.user.id}>`, inline: true },
                        { name: 'Grupo Escolhido', value: grupo.name, inline: true },
                        { name: 'Nome | ID', value: `${nome} | ${idJogo}`, inline: true },
                        { name: 'Resposta Regras FiveZ', value: respRegras || '*(vazio)*' },
                        { name: 'Resposta Anti-Jogo/Inatividade', value: respInat || '*(vazio)*' },
                        { name: 'Status', value: '❌ **REPROVADO AUTOMATICAMENTE PELO SISTEMA**' }
                    )
                    .setFooter({ text: CONFIG.footer });

                await canalAprov.send({ embeds: [embedLogStaff] });
            }
            return;
        }

        const leuPV = confirmacoesRegras.get(interaction.user.id);
        const confirmado = leuPV ? "✅ Sim (PV)" : "❌ Não (PV)";

        if (!leuPV) {
            enviarRegrasPV(interaction.user).catch(() => {});
        }

        const nickFormatado = formatarApelido(grupo.tag, nome, idJogo);

        const embedStaff = new EmbedBuilder()
            .setTitle('📩 Novo Pedido de Set')
            .setAuthor({ name: CONFIG.authorName || '👑 FAMÍLIA SOUZA INFINITA 👑', iconURL: CONFIG.botAvatarUrl || "https://i.imgur.com/B21O3Ok.gif" })
            .setThumbnail(CONFIG.thumbnailUrl || CONFIG.botAvatarUrl || 'https://i.imgur.com/B21O3Ok.gif')
            .setColor('#F1C40F')
            .addFields(
                { name: 'Membro', value: `<@${interaction.user.id}>`, inline: true },
                { name: 'Grupo', value: grupo.name, inline: true },
                { name: 'Confirmou Regras PV?', value: confirmado, inline: true },
                { name: 'Nome | ID no Jogo', value: `${nome} | ${idJogo}` },
                { name: 'Recrutador', value: recrutador, inline: true },
                { name: '📖 Leu Regras FiveZ?', value: respRegras || 'Sim (fivez.gitbook.io/fivez-regras)' },
                { name: '⚠️ Anti-Jogo / Inatividade?', value: respInat || 'Sim, ciente' },
                { name: 'Apelido Previsto', value: `${nickFormatado}` }
            )
            .setFooter({ text: CONFIG.footer });

        const botoes = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`aprovar_${interaction.user.id}_${roleId}`).setLabel('Aprovar').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`recusar_${interaction.user.id}`).setLabel('Recusar').setStyle(ButtonStyle.Danger)
        );

        const canalAprov = client.channels.cache.get(CONFIG.canalAprovacaoId);
        if (canalAprov && canalAprov.isTextBased()) await canalAprov.send({ embeds: [embedStaff], components: [botoes] });

        return interaction.reply({ content: `✅ Pedido enviado! Apelido: ${nickFormatado}`, ephemeral: true });
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
            const grupo = CONFIG.grupos.find(g => g.roleId === roleId || g.id === roleId) || { tag: "[Recruta]" };
            const targetMember = await interaction.guild.members.fetch(targetId).catch(() => null);

            if (targetMember) {
                try {
                    const embedOriginal = interaction.message.embeds[0];
                    const infoNome = embedOriginal.fields[3].value.split(' | ');
                    const nick = formatarApelido(grupo.tag, infoNome[0], infoNome[1] || '00');

                    await targetMember.roles.add(roleId);
                    if (CONFIG.cargoCidadaoGeralId) await targetMember.roles.add(CONFIG.cargoCidadaoGeralId).catch(() => null);
                    if (CONFIG.cargoNaoRegistradoId) await targetMember.roles.remove(CONFIG.cargoNaoRegistradoId).catch(() => null);
                    if (interaction.guild.ownerId !== targetId) {
                        await targetMember.setNickname(nick);
                    }
                    if (CONFIG.regrasTexto) {
                        const dmEmbed = new EmbedBuilder()
                            .setColor(CONFIG.embedColor || '#2ECC71')
                            .setTitle('🎉 Seja bem-vindo ao Clã Hunters!')
                            .setDescription(`Olá <@${targetId}>, seu registro foi **APROVADO**! 🎉\n\nConfira abaixo as **REGRAS OFICIAIS DO CLÃ HUNTERS**:\n\n${CONFIG.regrasTexto}`)
                            .setFooter({ text: CONFIG.footer || 'Clã Hunters' })
                            .setTimestamp();
                        await targetMember.send({ embeds: [dmEmbed] }).catch(() => null);
                    }
                } catch (e) {
                    console.error("Erro ao alterar membro:", e);
                }
            }

            await interaction.message.edit({ content: `✅ Aprovado por <@${interaction.user.id}>`, components: [] });
            return interaction.reply({ content: "Membro aprovado com sucesso!", ephemeral: true });
        }

        if (action === 'recusar') {
            await interaction.message.edit({ content: `❌ Recusado por <@${interaction.user.id}>`, components: [] });
            return interaction.reply({ content: "Membro recusado!", ephemeral: true });
        }
    }
});

client.login(TOKEN);
