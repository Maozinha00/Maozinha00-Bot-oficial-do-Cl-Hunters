/**
 * ============================================================================
 * BOT OFICIAL DE REGISTRO DE SET, REGRAS & INATIVIDADE DE 3 DIAS (DISCORD.JS V14)
 * CLÃ HUNTERS & FAMÍLIA SOUZA
 * ============================================================================
 * 
 * 📌 Como Rodar (Sem .env):
 * 1. Instale as dependências:
 *    npm install discord.js express
 * 2. Preencha os IDs e o TOKEN no bloco CONFIG abaixo.
 * 3. Execute o bot:
 *    node bot.js
 */

const express = require('express');
const {
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
} = require("discord.js");

// ============================================================================
// ⚙️ CONFIGURAÇÃO DIRETA (SUBSTITUA PELOS SEUS DADOS AQUI SE NÃO USAR .ENV)
// ============================================================================
const TOKEN = "SEU_BOT_TOKEN_AQUI"; // Cole aqui o Token do Bot do Discord Developer Portal
const PORT = 3000;

const CONFIG = {
    CLIENT_ID: "123456789012345678",           // ID da aplicação/bot
    GUILD_ID: "123456789012345678",            // ID do seu servidor do Discord
    
    // IDs dos Canais do Servidor
    CANAL_REGISTRO_ID: "123456789012345678",       // Canal onde ficará o painel (!painel)
    CANAL_APROVACAO_ID: "123456789012345678",      // Canal restrito da Staff para aprovar Sets
    CANAL_LOGS_ID: "123456789012345678",           // Canal de histórico de aprovações/recusas
    CANAL_ENTRADA_SAIDA_ID: "123456789012345678",  // Canal de boas-vindas
    
    // IDs do Painel de Ausência
    CANAL_PAINEL_AUSENCIA_ID: "123456789012345678",// Canal para solicitar ausência (!painelausencia)
    CANAL_AUSENCIA_LOGS_ID: "123456789012345678",   // Canal de logs de ausência aprovadas

    // IDs de Cargos da Administrações/Staff Autorizados
    CARGOS_ADMINS_APROVADORES: [
        "123456789012345678", // Cargo Liderança / Admin 1
        "123456789012345678"  // Cargo Staff / Admin 2
    ],

    // Cargo Inicial atribuído ao aprovar
    CARGO_HUNTERS_RECRUTA_ID: "123456789012345678",

    EMBED_COLOR: "#2ECC71",         // Verde Hunters
    EMBED_COLOR_AUSENCIA: "#E67E22",// Laranja Ausência
    FOOTER: "Sistema de Gestão Clã Hunters • Confirmação de Regras & Set",

    // Grupos e Cargos do Servidor
    GRUPOS: [
        {
            id: "hunters_rec",
            nome: "Hunters Recruta",
            tag: "|HUNTERS REC|",
            cargoId: "123456789012345678",
            descricao: "Membros em período de experiência no Clã Hunters"
        },
        {
            id: "hunters_membro",
            nome: "Hunters Membro Oficial",
            tag: "|HUNTERS|",
            cargoId: "123456789012345678",
            descricao: "Membro oficial efetivado do Clã Hunters"
        },
        {
            id: "fam_souza",
            nome: "Família Souza",
            tag: "|SOUZA|",
            cargoId: "123456789012345678",
            descricao: "Integrantes da Família Souza"
        }
    ]
};

// Map em memória para registrar a confirmação de leitura das regras por ID do jogador
const confirmacoesRegras = new Map();

// ============================================================================
// 🌐 SERVIDOR HTTP KEEP-ALIVE (Para Replit, Render ou VPS)
// ============================================================================
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
    console.log(`🌐 Servidor HTTP ativo na porta ${PORT}`);
});

// ============================================================================
// 🤖 INSTÂNCIA DO CLIENTE DISCORD
// ============================================================================
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

// Proteção Anti-Crash Global
process.on('unhandledRejection', (reason) => {
    console.error('⚠️ [Anti-Crash] Rejeição não tratada:', reason);
});
process.on('uncaughtException', (error) => {
    console.error('⚠️ [Anti-Crash] Exceção não capturada:', error);
});

// Helper para formatar apelidos respeitando o limite de 32 caracteres do Discord
function formatarApelidoSeguro(tag, nome, id) {
    let nick = `${tag} ${nome} | ${id}`.trim();
    if (nick.length > 32) {
        const tamanhoExtra = tag.length + id.length + 4;
        const maxNome = Math.max(1, 32 - tamanhoExtra);
        nick = `${tag} ${nome.substring(0, maxNome)} | ${id}`.trim();
    }
    return nick.substring(0, 32);
}

// ============================================================================
// 📌 EVENTOS DO BOT
// ============================================================================
client.once(Events.ClientReady, (c) => {
    console.log(`🤖 BOT CLÃ HUNTERS CONECTADO COM SUCESSO COMO: ${c.user.tag}`);
});

// Boas-Vindas de Novo Membro
client.on(Events.GuildMemberAdd, async (member) => {
    try {
        console.log(`👤 Novo membro entrou: ${member.user.tag}`);

        if (CONFIG.CARGO_HUNTERS_RECRUTA_ID && member.roles.cache.has(CONFIG.CARGO_HUNTERS_RECRUTA_ID)) {
            await member.roles.remove(CONFIG.CARGO_HUNTERS_RECRUTA_ID).catch(() => {});
        }

        if (CONFIG.CANAL_ENTRADA_SAIDA_ID) {
            const channel = member.guild.channels.cache.get(CONFIG.CANAL_ENTRADA_SAIDA_ID);
            if (channel) {
                const embed = new EmbedBuilder()
                    .setColor(CONFIG.EMBED_COLOR)
                    .setTitle('🚪 BEM-VINDO AO CLÃ HUNTERS!')
                    .setDescription(`Seja bem-vindo(a) <@${member.id}>!\n\n> 📝 Dirija-se ao canal <#${CONFIG.CANAL_REGISTRO_ID}>\n> 📜 Leia e **confirme as regras** para solicitar o seu **SET / Registro**.\n> ⚠️ *Cargos e permissões só serão liberados após a aprovação da Staff e verificação de leitura das regras!*`)
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

// Comandos de Texto (!painel, !painelausencia, !verificartags, !inativos)
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;

    const command = message.content.toLowerCase().trim();

    // !painel (Posta o painel com botão obrigatório de regras)
    if (command === '!painel' || command === '!postarpainel') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Apenas administradores podem executar este comando.');
        }

        const guildIcon = message.guild.iconURL() || 'https://i.imgur.com/8Q8S4Zb.png';

        const embed = new EmbedBuilder()
            .setColor(CONFIG.EMBED_COLOR)
            .setTitle('📜 REGRAS OBRIGATÓRIAS DO CLÃ HUNTERS')
            .setThumbnail(guildIcon)
            .setDescription(`Seja bem-vindo ao **CLÃ HUNTERS**!
Para garantir a organização, disciplina e respeito, leia e aceite as regras abaixo antes de solicitar seu **Set**.

📌 **1. Respeito e Hierarquia:**
Respeite a liderança e todos os membros. Ofensas, preconceito e desacato não serão tolerados.

📌 **2. Compromisso e Presença:**
Compareça às ações do clã, reuniões e treinamentos quando convocado.

📌 **3. Uso Obrigatório da Tag:**
É obrigatório colocar a Tag do Clã no nome (|HUNTERS REC| ou |HUNTERS|).

📌 **4. Uso Correto dos Canais:**
Utilize os canais de texto e voz adequadamente sem spam ou poluição sonoras.

📌 **5. REGRA DE INATIVIDADE (DESLIGAMENTO):**
🚨 **Ficar 3 dias sem entrar no servidor sem registrar aviso de ausência resultará em REMOÇÃO DO PAINEL E DO CLÃ!**

📌 **6. Desligamento:**
Caso deseje sair do clã, informe a liderança com antecedência.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

    // !painelausencia
    if (command === '!painelausencia' || command === '!postarpainelausencia') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Apenas administradores podem executar este comando.');
        }

        const embedAusencia = new EmbedBuilder()
            .setColor(CONFIG.EMBED_COLOR_AUSENCIA)
            .setTitle('📋 PAINEL DE REGISTRO DE AUSÊNCIA • CLÃ HUNTERS')
            .setDescription(`
# **MODELO DE AUSÊNCIA • HUNTERS**

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

    // !verificartags
    if (command === '!verificartags') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const members = await message.guild.members.fetch();
        let semTagCount = 0;
        let ajustados = 0;

        for (const [_, member] of members) {
            if (member.user.bot) continue;
            const hasRecruta = member.roles.cache.has(CONFIG.CARGO_HUNTERS_RECRUTA_ID);
            const currentNick = member.displayName;

            if (hasRecruta && !currentNick.includes('|HUNTERS REC|')) {
                semTagCount++;
                try {
                    const novoNick = formatarApelidoSeguro('|HUNTERS REC|', member.user.username, member.id.slice(-4));
                    await member.setNickname(novoNick);
                    ajustados++;
                } catch (e) {
                    // Ignora membros com imunidade/cargos superiores ao bot
                }
            }
        }

        return message.reply(`🔍 **Verificação de Tags Concluída!**\n- Membros sem tag encontrados: **${semTagCount}**\n- Nicks ajustados automaticamente: **${ajustados}**`);
    }
});

// ============================================================================
// 🔄 INTERAÇÕES (BOTÕES / MODAIS / MENUS)
// ============================================================================
client.on(Events.InteractionCreate, async (interaction) => {
    try {
        if (interaction.isButton()) {

            // 1. CONFIRMAÇÃO DE LEITURA DAS REGRAS
            if (interaction.customId === 'btn_confirmar_regras') {
                confirmacoesRegras.set(interaction.user.id, { confirmadoAt: new Date() });

                return interaction.reply({
                    content: '✅ **Confirmação registrada com sucesso!** Você confirmou que leu e aceita todas as regras do ClÃ HUNTERS (incluindo a regra de inatividade de no máximo 3 dias).\n\n🎯 Agora clique no botão **"Solicitar Set / Registro"** para preencher o formulário.',
                    ephemeral: true
                });
            }

            // 2. SOLICITAR REGISTRO DE SET (EXIGE CONFIRMAÇÃO DAS REGRAS PRIMEIRO!)
            if (interaction.customId === 'btn_iniciar_registro') {
                const confirmacao = confirmacoesRegras.get(interaction.user.id);

                if (!confirmacao) {
                    return interaction.reply({
                        content: '⚠️ **ATENÇÃO:** Você precisa ler e confirmar as regras primeiro!\n\n👉 Por favor, clique no botão **"📜 Confirmar Leitura das Regras"** no painel acima e depois tente novamente.',
                        ephemeral: true
                    });
                }

                // Exibe o Select Menu para escolher a divisão/grupo
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('select_grupo_registro')
                    .setPlaceholder('Selecione seu Grupo / Divisão...')
                    .addOptions(
                        CONFIG.GRUPOS.map(g => ({
                            label: g.nome,
                            value: g.id,
                            description: g.descricao,
                            emoji: '🛡️'
                        }))
                    );

                const row = new ActionRowBuilder().addComponents(selectMenu);

                return interaction.reply({
                    content: '🎯 **Selecione o seu Grupo / Divisão para prosseguir com o pedido de Set:**',
                    components: [row],
                    ephemeral: true
                });
            }

            // 3. BOTÃO REGISTRAR AUSÊNCIA
            if (interaction.customId === 'btn_iniciar_ausencia') {
                const modal = new ModalBuilder()
                    .setCustomId('modal_ausencia_submit')
                    .setTitle('Formulário de Ausência • Clã Hunters');

                const inputNome = new TextInputBuilder()
                    .setCustomId('ausencia_nome')
                    .setLabel('Nome em Jogo e ID')
                    .setPlaceholder('Ex: Maozinha | 1002')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const inputDias = new TextInputBuilder()
                    .setCustomId('ausencia_dias')
                    .setLabel('Quantidade de Dias de Ausência')
                    .setPlaceholder('Ex: 5 dias (Evita saída por 3 dias sem entrar)')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const inputMotivo = new TextInputBuilder()
                    .setCustomId('ausencia_motivo')
                    .setLabel('Motivo da Ausência')
                    .setPlaceholder('Ex: Trabalho, Estudos, Viagem ou Problemas Técnicos')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(inputNome),
                    new ActionRowBuilder().addComponents(inputDias),
                    new ActionRowBuilder().addComponents(inputMotivo)
                );

                return interaction.showModal(modal);
            }

            // 4. BOTOES DA STAFF (APROVAR / RECUSAR SET)
            if (interaction.customId.startsWith('btn_aprovar_set_') || interaction.customId.startsWith('btn_recusar_set_')) {
                // Verificar se quem clicou é Admin/Staff autorizado
                const hasAdminRole = interaction.member.roles.cache.some(r => CONFIG.CARGOS_ADMINS_APROVADORES.includes(r.id)) ||
                                     interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

                if (!hasAdminRole) {
                    return interaction.reply({
                        content: '❌ Você não tem permissão de Staff para gerenciar aprovações de Set!',
                        ephemeral: true
                    });
                }

                const isAprovar = interaction.customId.startsWith('btn_aprovar_set_');
                const targetUserId = interaction.customId.replace(isAprovar ? 'btn_aprovar_set_' : 'btn_recusar_set_', '');

                const targetMember = await interaction.guild.members.fetch(targetUserId).catch(() => null);

                if (!targetMember) {
                    return interaction.reply({ content: '❌ Membro não encontrado no servidor!', ephemeral: true });
                }

                const embedOriginal = interaction.message.embeds[0];
                if (!embedOriginal) return;

                // Extrair Nome, ID e Tag das fields da Embed
                const nomeField = embedOriginal.fields.find(f => f.name.includes('Nome'))?.value || targetMember.user.username;
                const idGameField = embedOriginal.fields.find(f => f.name.includes('ID'))?.value || targetMember.id.slice(-4);
                const grupoIdField = embedOriginal.fields.find(f => f.name.includes('Grupo'))?.value;

                const grupoInfo = CONFIG.GRUPOS.find(g => g.nome === grupoIdField) || CONFIG.GRUPOS[0];
                const tag = grupoInfo ? grupoInfo.tag : '|HUNTERS REC|';

                if (isAprovar) {
                    // Formatar o Nickname oficial
                    const novoNick = formatarApelidoSeguro(tag, nomeField, idGameField);

                    // Alterar Apelido
                    await targetMember.setNickname(novoNick).catch(err => console.error('Erro ao alterar nick:', err));

                    // Atribuir Cargos
                    if (grupoInfo && grupoInfo.cargoId) {
                        await targetMember.roles.add(grupoInfo.cargoId).catch(() => {});
                    }
                    if (CONFIG.CARGO_HUNTERS_RECRUTA_ID) {
                        await targetMember.roles.add(CONFIG.CARGO_HUNTERS_RECRUTA_ID).catch(() => {});
                    }

                    // Atualizar Mensagem na Aprovação
                    const embedAprovado = EmbedBuilder.from(embedOriginal)
                        .setColor('#2ECC71')
                        .setTitle('✅ SET & CIDADANIA APROVADOS!')
                        .addFields(
                            { name: '👮 Aprovado por:', value: `<@${interaction.user.id}>`, inline: true },
                            { name: '🏷️ Apelido Definido:', value: `\`${novoNick}\``, inline: true }
                        )
                        .setTimestamp();

                    await interaction.update({ embeds: [embedAprovado], components: [] });

                    // Log no canal de logs
                    if (CONFIG.CANAL_LOGS_ID) {
                        const canalLogs = interaction.guild.channels.cache.get(CONFIG.CANAL_LOGS_ID);
                        if (canalLogs) {
                            await canalLogs.send({ embeds: [embedAprovado] });
                        }
                    }

                    // DM para o jogador
                    await targetMember.send({
                        content: `🎉 **Parabéns! Seu Set foi APROVADO no Clã Hunters!**\n\n> 🏷️ Seu nick foi atualizado para: **${novoNick}**\n> 🛡️ Seus cargos foram liberados.\n> ⚠️ *Lembre-se: Inatividade de 3 dias sem aviso prévio resulta no desligamento do clã.*`
                    }).catch(() => {});

                } else {
                    // Recusar
                    const embedRecusado = EmbedBuilder.from(embedOriginal)
                        .setColor('#E74C3C')
                        .setTitle('❌ SOLICITAÇÃO DE SET RECUSADA')
                        .addFields({ name: '👮 Recusado por:', value: `<@${interaction.user.id}>`, inline: true })
                        .setTimestamp();

                    await interaction.update({ embeds: [embedRecusado], components: [] });

                    // DM para o jogador
                    await targetMember.send({
                        content: `❌ **Sua solicitação de Set no Clã Hunters foi recusada pela Staff.**\n\nPor favor, verifique se preencheu seu Nome e ID corretamente e certifique-se de ter confirmado a leitura das regras.`
                    }).catch(() => {});
                }
            }
        }

        // 5. SELEÇÃO DE GRUPO NO SELECT MENU
        if (interaction.isStringSelectMenu() && interaction.customId === 'select_grupo_registro') {
            const grupoSelecionadoId = interaction.values[0];
            const grupoInfo = CONFIG.GRUPOS.find(g => g.id === grupoSelecionadoId);

            // Exibir Modal de Dados (Nome e ID)
            const modal = new ModalBuilder()
                .setCustomId(`modal_registro_${grupoSelecionadoId}`)
                .setTitle(`Registro Set • ${grupoInfo ? grupoInfo.nome : 'Hunters'}`);

            const inputNome = new TextInputBuilder()
                .setCustomId('reg_nome')
                .setLabel('Seu Nome em Jogo')
                .setPlaceholder('Ex: Maozinha')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const inputID = new TextInputBuilder()
                .setCustomId('reg_id')
                .setLabel('Seu ID no Servidor / Cidade')
                .setPlaceholder('Ex: 1002')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(inputNome),
                new ActionRowBuilder().addComponents(inputID)
            );

            return interaction.showModal(modal);
        }

        // 6. ENVIO DO MODAL DE REGISTRO DE SET
        if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_registro_')) {
            const grupoId = interaction.customId.replace('modal_registro_', '');
            const grupoInfo = CONFIG.GRUPOS.find(g => g.id === grupoId) || CONFIG.GRUPOS[0];

            const nome = interaction.fields.getTextInputValue('reg_nome');
            const idGame = interaction.fields.getTextInputValue('reg_id');

            const canalAprovacao = interaction.guild.channels.cache.get(CONFIG.CANAL_APROVACAO_ID);

            if (!canalAprovacao) {
                return interaction.reply({
                    content: '❌ Canal de aprovação da Staff não encontrado. Avise um administrador!',
                    ephemeral: true
                });
            }

            const confirmacao = confirmacoesRegras.get(interaction.user.id);
            const tagSugerida = grupoInfo.tag;
            const nickSugerido = formatarApelidoSeguro(tagSugerida, nome, idGame);

            const embedAprovacao = new EmbedBuilder()
                .setColor('#F1C40F')
                .setTitle('🎯 NOVA SOLICITAÇÃO DE SET / REGISTRO')
                .setDescription(`Um novo jogador solicitou o registro de Set no servidor!`)
                .addFields(
                    { name: '👤 Jogador (Discord):', value: `<@${interaction.user.id}> (${interaction.user.tag})`, inline: false },
                    { name: '📝 Nome em Jogo:', value: nome, inline: true },
                    { name: '🆔 ID do Jogador:', value: idGame, inline: true },
                    { name: '🛡️ Grupo Solicitado:', value: grupoInfo.nome, inline: true },
                    { name: '🏷️ Apelido Previsto:', value: `\`${nickSugerido}\``, inline: false },
                    { name: '📜 Regras Lidas:', value: confirmacao ? '✅ **SIM** - Confirmado pelo jogador' : '❌ NÃO', inline: false }
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter({ text: CONFIG.FOOTER })
                .setTimestamp();

            const rowBotoesStaff = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`btn_aprovar_set_${interaction.user.id}`)
                    .setLabel('Aprovar Set & Cidadania')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅'),
                new ButtonBuilder()
                    .setCustomId(`btn_recusar_set_${interaction.user.id}`)
                    .setLabel('Recusar')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('❌')
            );

            await canalAprovacao.send({
                content: `🔔 <@&${CONFIG.CARGOS_ADMINS_APROVADORES[0]}> Nova solicitação de Set de <@${interaction.user.id}>:`,
                embeds: [embedAprovacao],
                components: [rowBotoesStaff]
            });

            return interaction.reply({
                content: '✅ **Sua solicitação de Set foi enviada para a Staff do Clã Hunters!**\n\n> ⏳ Aguarde a análise da liderança no canal de aprovação.',
                ephemeral: true
            });
        }

        // 7. ENVIO DO MODAL DE AUSÊNCIA
        if (interaction.isModalSubmit() && interaction.customId === 'modal_ausencia_submit') {
            const nome = interaction.fields.getTextInputValue('ausencia_nome');
            const dias = interaction.fields.getTextInputValue('ausencia_dias');
            const motivo = interaction.fields.getTextInputValue('ausencia_motivo');

            const canalLogsAusencia = interaction.guild.channels.cache.get(CONFIG.CANAL_AUSENCIA_LOGS_ID);

            const embedAusenciaLog = new EmbedBuilder()
                .setColor(CONFIG.EMBED_COLOR_AUSENCIA)
                .setTitle('📋 NOVO REGISTRO DE AUSÊNCIA • CLÃ HUNTERS')
                .addFields(
                    { name: '👤 Membro:', value: `<@${interaction.user.id}>`, inline: true },
                    { name: '📝 Nome / ID:', value: nome, inline: true },
                    { name: '⏳ Período Ausente:', value: dias, inline: true },
                    { name: '📄 Motivo:', value: motivo, inline: false },
                    { name: '🛡️ Proteção Inatividade:', value: '✅ Registrado - Isento da remoção de 3 dias', inline: false }
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter({ text: CONFIG.FOOTER })
                .setTimestamp();

            if (canalLogsAusencia) {
                await canalLogsAusencia.send({ embeds: [embedAusenciaLog] });
            }

            return interaction.reply({
                content: '✅ **Sua ausência foi registrada com sucesso!** A liderança foi notificada e seu registro de inatividade foi protegido.',
                ephemeral: true
            });
        }

    } catch (err) {
        console.error('Erro ao processar interação:', err);
    }
});

// ============================================================================
// 🚀 INICIALIZAÇÃO DO BOT
// ============================================================================
client.login(TOKEN).catch((err) => {
    console.error("❌ ERRO AO CONECTAR O BOT AO DISCORD:", err.message);
    console.error("👉 Verifique se preencheu o TOKEN correto no topo do arquivo bot.js!");
});
