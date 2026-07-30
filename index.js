/**
 * ============================================================================
 * BOT OFICIAL DE REGISTRO DE SET, REGRAS & INATIVIDADE DE 3 DIAS (DISCORD.JS V14)
 * CLÃ HUNTERS & FAMÍLIA SOUZA
 * ============================================================================
 * 
 * 🚀 FUNCIONA 100% DIRETO (SEM NECESSIDADE DE ARQUIVO .ENV)
 * 
 * 📜 REGRAS E CONFIRMAÇÃO OBRIGATÓRIA DE LEITURA:
 * - O jogador DEVE clicar no botão "Confirmar Leitura das Regras" antes de pedir o SET.
 * - O bot registra a confirmação e avisa a Staff no painel de aprovação.
 * - Inclui a regra de INATIVIDADE: "Ficar 3 dias sem entrar no servidor sem aviso resulta em remoção."
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

// ===============================
// CONFIGURAÇÃO DE AMBIENTE & TOKEN
// ===============================
const TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN || "SEU_DISCORD_BOT_TOKEN_AQUI";
const PORT = process.env.PORT || 3000;

// Map em memória para registrar a confirmação de leitura das regras por ID do jogador
const confirmacoesRegras = new Map();

// ===============================
// CONFIGURAÇÃO GERAL DO SISTEMA (IDs)
// ===============================
const CONFIG = {
    CLIENT_ID: "1493598260546375881",
    GUILD_ID: "1456655598031601727",
    
    // IDs dos Canais do Servidor
    CANAL_REGISTRO_ID: "1515448138385592361",
    CANAL_APROVACAO_ID: "1515448473246498866",
    CANAL_LOGS_ID: "1515448473246498866",
    CANAL_ENTRADA_SAIDA_ID: "1524222632923496509",
    
    // IDs do Painel de Ausência
    CANAL_PAINEL_AUSENCIA_ID: "1531070382365343774",
    CANAL_AUSENCIA_LOGS_ID: "1531670383483158700",

    // Cargos Administradores Autorizados a Aprovar
    CARGOS_ADMINS_APROVADORES: [
        "1515125820836941985",
        "1515125822795546715"
    ],

    CARGO_HUNTERS_RECRUTA_ID: "1515125826780135485",

    EMBED_COLOR: "#2ECC71",
    EMBED_COLOR_AUSENCIA: "#E67E22",
    FOOTER: "Sistema de Gestão Clã Hunters • Confirmação de Regras & Set",

    GRUPOS: [
        {
            id: 'grupo_hunters',
            name: 'Hunters FiveZ',
            roleId: '1515125826780135485',
            emoji: '🎯',
            tag: '|HUNTERS REC|',
            description: 'Caçadores de elite Hunters FiveZ (Recruta)'
        },
        {
            id: 'grupo_souza',
            name: 'Família Souza',
            roleId: '1515125828185493675',
            emoji: '❤️',
            tag: '|SOUZA|',
            description: 'Membros oficiais da Família Souza'
        },
        {
            id: 'grupo_comprador',
            name: 'Comprador FiveZ',
            roleId: '1517662363266842725',
            emoji: '🛒',
            tag: '|CPD| FiveZ',
            description: 'Compradores oficiais FiveZ'
        },
        {
            id: 'grupo_amigos',
            name: 'Amigos & Visitantes',
            roleId: '1515125842328424640',
            emoji: '🤝',
            tag: '|AMG|',
            description: 'Cargo de entrada para amigos e aliados'
        }
    ]
};

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
// SERVIDOR EXPRESS KEEP-ALIVE
// ===============================
const app = express();

app.get('/', (req, res) => {
    res.send('🟢 Bot Clã Hunters Online 24/7!');
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        botConnected: Boolean(client.user),
        botUser: client.user ? client.user.tag : null,
        confirmationsCount: confirmacoesRegras.size,
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Servidor HTTP Keep-Alive rodando na porta ${PORT}`);
});

// Proteção Anti-Crash Global
process.on('unhandledRejection', (reason) => {
    console.error('⚠️ [Anti-Crash] Rejeição não tratada:', reason);
});
process.on('uncaughtException', (error) => {
    console.error('⚠️ [Anti-Crash] Exceção não capturada:', error);
});

// ===============================
// FUNÇÃO AUXILIAR DE APELIDO
// ===============================
function formatarApelidoSeguro(tag, nome, id) {
    let nick = `${tag} ${nome} | ${id}`.trim();
    if (nick.length > 32) {
        const tamanhoExtra = tag.length + id.length + 4;
        const maxNome = Math.max(1, 32 - tamanhoExtra);
        nick = `${tag} ${nome.substring(0, maxNome)} | ${id}`.trim();
    }
    return nick.substring(0, 32);
}

// ===============================
// EVENTOS DO BOT
// ===============================
client.once(Events.ClientReady, (c) => {
    console.log(`🤖 BOT CLÃ HUNTERS CONECTADO COMO: ${c.user.tag}`);
});

// Entrada de novo membro
client.on(Events.GuildMemberAdd, async (member) => {
    try {
        if (CONFIG.CANAL_ENTRADA_SAIDA_ID) {
            const channel = member.guild.channels.cache.get(CONFIG.CANAL_ENTRADA_SAIDA_ID);
            if (channel) {
                const embed = new EmbedBuilder()
                    .setColor(CONFIG.EMBED_COLOR)
                    .setTitle('🚪 BEM-VINDO AO CLÃ HUNTERS!')
                    .setDescription(`Seja bem-vindo(a) <@${member.id}>!\n\n> 📝 Dirija-se ao canal <#${CONFIG.CANAL_REGISTRO_ID}>\n> 📜 Leia e **confirme as regras** para poder solicitar o seu **SET / Registro**.\n> ⚠️ *Seus cargos só serão liberados após a aprovação da Staff e verificação de leitura das regras!*`)
                    .setThumbnail(member.user.displayAvatarURL())
                    .setFooter({ text: CONFIG.FOOTER })
                    .setTimestamp();

                await channel.send({ content: `<@${member.id}>`, embeds: [embed] }).catch(() => {});
            }
        }
    } catch (err) {
        console.error('Erro no GuildMemberAdd:', err);
    }
});

// Comandos de Texto para Administradores (!painel, !painelausencia)
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;

    const command = message.content.toLowerCase().trim();

    // Comando !painel
    if (command === '!painel' || command === '!postarpainel') {
        if (!message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Apenas administradores podem executar este comando.');
        }

        const embed = new EmbedBuilder()
            .setColor(CONFIG.EMBED_COLOR)
            .setTitle('📜 REGRAS OBRIGATÓRIAS DO CLÃ HUNTERS')
            .setDescription(`Seja bem-vindo ao **CLÃ HUNTERS**!
Para garantir a organização, disciplina e respeito, leia e aceite as regras abaixo antes de solicitar seu **Set**.

📌 **1. RESPEITO E HIERARQUIA:**
Respeite a liderança e companheiros em todas as ocasiões.

📌 **2. COMPROMISSO:**
Compareça às reuniões quando convocado e participe das ações do clã.

📌 **3. USO OBRIGATÓRIO DA TAG:**
Utilize obrigatoriamente a tag [HUNTERS REC] ou [HUNTERS] no seu nick do Discord e no jogo.

📌 **4. CANAIS E DMs:**
Mantenha os chats organizados, respeitando as categorias de voz e texto.

📌 **5. INATIVIDADE (3 DIAS):**
Ficar sem entrar por 3 dias sem postar no Painel de Ausência resultará na remoção automática do painel e desligamento do clã.

📌 **6. DESLIGAMENTO:**
O descumprimento de qualquer uma das regras acima resultará em advertência ou expulsão imediata.

⚠️ **ATENÇÃO:** Clique no botão **"Confirmar Leitura das Regras"** abaixo para liberar a solicitação do seu Set!`)
            .setFooter({ text: CONFIG.FOOTER })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_confirmar_regras')
                .setLabel('Confirmar Leitura das Regras')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📜'),
            new ButtonBuilder()
                .setCustomId('btn_iniciar_registro')
                .setLabel('Solicitar Set / Registro')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🎯')
        );

        await message.channel.send({ content: '@everyone', embeds: [embed], components: [row] });
        return message.reply('✅ Painel de Regras e Registro postado com sucesso!');
    }

    // Comando !painelausencia
    if (command === '!painelausencia' || command === '!postarpainelausencia') {
        if (!message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Apenas administradores podem executar este comando.');
        }

        const embedAusencia = new EmbedBuilder()
            .setColor(CONFIG.EMBED_COLOR_AUSENCIA)
            .setTitle('📋 PAINEL DE REGISTRO DE AUSÊNCIA • CLÃ HUNTERS')
            .setDescription(`
Caso vá ficar ausente por **mais de 2 dias**, é obrigatório preencher o formulário para evitar a **remoção por inatividade de 3 dias**.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ **REGRAS IMPORTANTES DE INATIVIDADE:**
• 🚨 Ficar **3 dias sem entrar** no servidor sem registrar a ausência resultará na **remoção do painel e do clã**!
• 📢 A ausência deve ser informada **antes** de ficar inativo.
• ⏰ Caso o retorno atrase, comunique a liderança novamente.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👇 *Clique no botão abaixo para registrar sua ausência:*
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

        await message.channel.send({ embeds: [embedAusencia], components: [rowAusencia] });
        return message.reply('✅ Painel de Ausência postado com sucesso!');
    }
});

// ===============================
// HANDLER DE INTERAÇÕES
// ===============================
client.on(Events.InteractionCreate, async (interaction) => {
    try {
        if (interaction.isButton()) {

            // 1. CONFIRMAÇÃO DE LEITURA DAS REGRAS
            if (interaction.customId === 'btn_confirmar_regras') {
                confirmacoesRegras.set(interaction.user.id, { confirmadoAt: new Date() });

                return interaction.reply({
                    content: '✅ **Confirmação registrada!** Você confirmou que leu e aceita todas as regras do CLÃ HUNTERS (incluindo a inatividade máxima de 3 dias).\n\n🎯 Agora clique no botão **"Solicitar Set / Registro"** para preencher o formulário.',
                    ephemeral: true
                });
            }

            // 2. SOLICITAR REGISTRO (VERIFICA SE CONFIRMOU LEITURA DE REGRAS)
            if (interaction.customId === 'btn_iniciar_registro') {
                const confirmacao = confirmacoesRegras.get(interaction.user.id);

                if (!confirmacao) {
                    return interaction.reply({
                        content: '⚠️ **ATENÇÃO:** É **obrigatório** ler e aceitar as regras antes de solicitar seu Set!\n\n👉 Por favor, clique no botão **"📜 Confirmar Leitura das Regras"** primeiro, e depois tente novamente.',
                        ephemeral: true
                    });
                }

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
                    content: '📜 *Regras confirmadas!* Escolha abaixo para qual grupo você deseja solicitar o Set:',
                    components: [row],
                    ephemeral: true
                });
            }

            // 3. APROVAÇÃO OU RECUSA DO SET PELA STAFF
            if (interaction.customId.startsWith('btn_aprovar_') || interaction.customId.startsWith('btn_recusar_')) {
                const isApprove = interaction.customId.startsWith('btn_aprovar_');
                
                const hasAdmin = CONFIG.CARGOS_ADMINS_APROVADORES.some(r => interaction.member?.roles.cache.has(r)) ||
                                 interaction.member?.permissions.has(PermissionsBitField.Flags.Administrator);

                if (!hasAdmin) {
                    return interaction.reply({ content: '❌ Permissão negada! Apenas Administradores podem aprovar Sets.', ephemeral: true });
                }

                const embed = interaction.message.embeds[0];
                if (!embed) return interaction.reply({ content: '❌ Embed não encontrada.', ephemeral: true });

                const userDiscordField = embed.fields?.find(f => f.name.includes('Usuário Discord'));
                let userId = userDiscordField ? userDiscordField.value.match(/<@!?(\d+)>/)?.[1] : null;

                if (!userId) userId = interaction.customId.replace('btn_aprovar_', '').replace('btn_recusar_', '');

                const member = await interaction.guild?.members.fetch(userId).catch(() => null);
                if (!member) return interaction.reply({ content: '❌ Membro não encontrado no servidor.', ephemeral: true });

                const nomeField = embed.fields?.find(f => f.name.includes('Nome no Jogo'))?.value?.replace(/\*\*/g, '') || 'N/A';
                const idField = embed.fields?.find(f => f.name.includes('ID no Jogo'))?.value?.replace(/\*\*/g, '') || 'N/A';
                const grupoField = embed.fields?.find(f => f.name.includes('Grupo Escolhido'))?.value || '';

                const matchedGroup = CONFIG.GRUPOS.find(g => grupoField.includes(g.name)) || CONFIG.GRUPOS[0];

                if (isApprove) {
                    const nickFinal = formatarApelidoSeguro(matchedGroup.tag, nomeField, idField);

                    try { await member.setNickname(nickFinal); } catch (e) {}
                    try { await member.roles.add(matchedGroup.roleId); } catch (e) {}

                    const approvedEmbed = EmbedBuilder.from(embed)
                        .setColor('#2ECC71')
                        .setTitle('✅ SET & REGISTRO APROVADO')
                        .setDescription(`O jogador teve o Set aprovado e as regras devidamente verificadas.`)
                        .addFields({ name: '👮 Aprovado por', value: `<@${interaction.user.id}>`, inline: false });

                    await interaction.message.edit({ embeds: [approvedEmbed], components: [] });
                    await member.send(`🎉 **Parabéns!** Seu Set para **${matchedGroup.name}** foi APROVADO! Seu apelido foi ajustado para \`${nickFinal}\`.`).catch(() => {});

                    return interaction.reply({ content: `✅ Set de <@${userId}> APROVADO com sucesso!`, ephemeral: true });
                } else {
                    const rejectedEmbed = EmbedBuilder.from(embed)
                        .setColor('#E74C3C')
                        .setTitle('❌ SET RECUSADO')
                        .addFields({ name: '👮 Recusado por', value: `<@${interaction.user.id}>`, inline: false });

                    await interaction.message.edit({ embeds: [rejectedEmbed], components: [] });
                    await member.send(`❌ Seu pedido de Set para o Clã Hunters foi recusado.`).catch(() => {});

                    return interaction.reply({ content: `❌ Set de <@${userId}> recusado.`, ephemeral: true });
                }
            }

            // 4. REGISTRAR AUSÊNCIA
            if (interaction.customId === 'btn_iniciar_ausencia') {
                const modal = new ModalBuilder()
                    .setCustomId('modal_ausencia')
                    .setTitle('Formulário de Ausência • Hunters');

                modal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('input_ausencia_nome_id')
                            .setLabel('Nome e ID no Jogo')
                            .setPlaceholder('Ex: Bruno Hunter | ID: 1234')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('input_ausencia_datas')
                            .setLabel('Período de Ausência (Início e Retorno)')
                            .setPlaceholder('Ex: 30/07 a 05/08')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('input_ausencia_motivo')
                            .setLabel('Motivo da Ausência')
                            .setPlaceholder('Descreva o motivo...')
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true)
                    )
                );

                return interaction.showModal(modal);
            }
        }

        // SELEÇÃO DO MENU DE GRUPOS
        if (interaction.isStringSelectMenu() && interaction.customId === 'select_grupo_registro') {
            const roleId = interaction.values[0];
            const grupoObj = CONFIG.GRUPOS.find(g => g.roleId === roleId) || CONFIG.GRUPOS[0];

            const modal = new ModalBuilder()
                .setCustomId(`modal_registro_${grupoObj.roleId}`)
                .setTitle(`Set — ${grupoObj.name.substring(0, 25)}`);

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('input_nome_jogo')
                        .setLabel('Nome / Apelido no Jogo')
                        .setPlaceholder('Ex: Bruno Hunters')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('input_id_jogo')
                        .setLabel('Seu ID Numérico')
                        .setPlaceholder('Ex: 4502')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('input_contratante')
                        .setLabel('Quem te recrutou / convidou?')
                        .setPlaceholder('Ex: Bruno Liderança')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                )
            );

            return interaction.showModal(modal);
        }

        // MODAL SUBMIT DO REGISTRO DE SET
        if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_registro_')) {
            const roleId = interaction.customId.replace('modal_registro_', '');
            const grupoObj = CONFIG.GRUPOS.find(g => g.roleId === roleId) || CONFIG.GRUPOS[0];

            const nomeJogo = interaction.fields.getTextInputValue('input_nome_jogo').trim();
            const idJogo = interaction.fields.getTextInputValue('input_id_jogo').trim();
            const contratante = interaction.fields.getTextInputValue('input_contratante').trim();

            const nickFinal = formatarApelidoSeguro(grupoObj.tag, nomeJogo, idJogo);
            const confirmData = confirmacoesRegras.get(interaction.user.id);

            const dataConfirmacaoStr = confirmData 
                ? `✅ **SIM** (Confirmado em ${confirmData.confirmadoAt.toLocaleDateString('pt-BR')} ${confirmData.confirmadoAt.toLocaleTimeString('pt-BR')})`
                : `❌ **NÃO CONFIRMOU**`;

            const embedAprovacao = new EmbedBuilder()
                .setColor('#F1C40F')
                .setTitle('⏳ NOVO PEDIDO DE SET - AGUARDANDO STAFF')
                .addFields(
                    { name: '👤 Usuário Discord', value: `<@${interaction.user.id}> (${interaction.user.tag})`, inline: true },
                    { name: '🎯 Grupo Solicitado', value: `**${grupoObj.name}**`, inline: true },
                    { name: '📜 Regras Lidas & Aceitas?', value: dataConfirmacaoStr, inline: false },
                    { name: '📝 Nome no Jogo', value: `**${nomeJogo}**`, inline: true },
                    { name: '🔢 ID no Jogo', value: `**${idJogo}**`, inline: true },
                    { name: '🤝 Recrutado Por', value: `**${contratante}**`, inline: false },
                    { name: '🏷️ Apelido a ser Gerado', value: `\`${nickFinal}\``, inline: false }
                )
                .setFooter({ text: CONFIG.FOOTER })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`btn_aprovar_${interaction.user.id}`)
                    .setLabel('Aprovar Cidadania & Set')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅'),
                new ButtonBuilder()
                    .setCustomId(`btn_recusar_${interaction.user.id}`)
                    .setLabel('Recusar')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('❌')
            );

            const canalAprov = interaction.guild?.channels.cache.get(CONFIG.CANAL_APROVACAO_ID);
            if (canalAprov) {
                await canalAprov.send({ embeds: [embedAprovacao], components: [row] });
            }

            return interaction.reply({
                content: `✅ **Pedido de Set Enviado!**\nSua solicitação para **${grupoObj.name}** foi enviada para a Staff.\n📜 *Confirmação de leitura das regras incluída no pedido!*`,
                ephemeral: true
            });
        }

        // MODAL SUBMIT DA AUSÊNCIA
        if (interaction.isModalSubmit() && interaction.customId === 'modal_ausencia') {
            const nomeId = interaction.fields.getTextInputValue('input_ausencia_nome_id');
            const datas = interaction.fields.getTextInputValue('input_ausencia_datas');
            const motivo = interaction.fields.getTextInputValue('input_ausencia_motivo');

            const embedLog = new EmbedBuilder()
                .setColor('#E67E22')
                .setTitle('📋 REGISTRO DE AUSÊNCIA • CLÃ HUNTERS')
                .addFields(
                    { name: '👤 Jogador', value: `<@${interaction.user.id}>`, inline: true },
                    { name: '🆔 Nome & ID', value: `**${nomeId}**`, inline: true },
                    { name: '📅 Período', value: `**${datas}**`, inline: false },
                    { name: '📝 Motivo', value: motivo, inline: false },
                    { name: '🛡️ Proteção de Inatividade', value: '✅ **Protegido contra remoção de 3 dias**', inline: false }
                )
                .setFooter({ text: CONFIG.FOOTER })
                .setTimestamp();

            const canalLog = interaction.guild?.channels.cache.get(CONFIG.CANAL_AUSENCIA_LOGS_ID);
            if (canalLog) {
                await canalLog.send({ embeds: [embedLog] });
            }

            return interaction.reply({
                content: '✅ **Ausência registrada com sucesso!** Você está protegido contra a regra de remoção por 3 dias de inatividade.',
                ephemeral: true
            });
        }

    } catch (err) {
        console.error('Erro na interação:', err);
    }
});

client.login(TOKEN);
