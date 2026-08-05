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

const TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN || "SEU_DISCORD_TOKEN_AQUI";
const PORT = process.env.PORT || 3000;

const CONFIG = {
    "token": TOKEN,
    "prefixo": "!",
    "comandoPainelRegistro": "!painelregistro",
    "comandoPainelAusencia": "!painelausencia",
    "botName": "HUNTERS BOT!",
    "botAvatarUrl": "https://i.imgur.com/0iMBT5C.jpeg",
    "canalRegistroId": "123456789012345678",
    "canalAprovacaoId": "123456789012345678",
    "canalLogsId": "123456789012345678",
    "canalEntradaSaidaId": "123456789012345678",
    "canalAusenciaId": "123456789012345678",
    "canalAusenciaLogsId": "123456789012345678",
    "cargosAdminsAprovadores": ["123456789012345678"],
    "embedColor": "#1ABC9C",
    "embedColorAusencia": "#E67E22",
    "embedColorSaida": "#E74C3C",
    "authorName": "👑 HUNTERS & FAMÍLIA SOUZA 👑",
    "authorSub": "🏡 Família Souza — Entrada & Registro",
    "footer": "Família Souza • Sistema de Registro Automático SIGIO",
    "footerSaida": "Família Souza • Notificação de Saída de Membro",
    "tituloPainel": "📋 Painel de Registro — Família Souza & Clã Hunters",
    "descricaoPainel": "Seja muito bem-vindo(a) à nossa comunidade!\n\nPara iniciar seu processo de integração, escolha no menu abaixo o seu grupo/função e preencha o formulário de registro.",
    "tituloPainelAusencia": "🌴 Painel de Registro de Ausência",
    "descricaoPainelAusencia": "Caso precise se ausentar da cidade/servidor por alguns dias, registe sua ausência pelo formulário abaixo para evitar advertências.",
    "regrasTexto": "⚠️ **REGRAS GERAIS DA FAMÍLIA & CLÃ HUNTERS:**\n\n1. Respeite todos os membros e a liderança acima de tudo.\n2. É proibido RDM, VDM, Anti-Amor à Vida e Anti-Jogo na cidade.\n3. Mantenha o apelido/nick do Discord no padrão: `[TAG] Nome | ID`.\n4. Em caso de ausência por mais de 3 dias, obrigatoriamente registre no canal de ausência.",
    "regrasLink": "https://discord.com",
    "perguntaRegrasCincoZ": "O que é RDM, VDM e Amor à Vida na Cidade?",
    "perguntaInatividadecincoZ": "Ciente de SafeZone, Anti-Jogo e Inatividade?",
    "cargoCidadaoGeralId": "123456789012345678",
    "cargoNaoRegistradoId": "123456789012345678",
    "prazoRegistroDias": 3,
    "autoReprovarRespostasInvalidas": true,
    "grupos": [
        {
            "id": "grupo_sub_lideres",
            "name": "Sub-Líderes",
            "tag": "[Sub-Líder]",
            "roleId": "123456789012345678",
            "emoji": "👑",
            "description": "Formulário de verificação para Sub-Liderança."
        },
        {
            "id": "grupo_membros_fixos",
            "name": "Membros Fixos",
            "tag": "[Membro]",
            "roleId": "123456789012345678",
            "emoji": "⚔️",
            "description": "Formulário de registro oficial de Membro Fixo."
        },
        {
            "id": "grupo_recrutas",
            "name": "Recrutas",
            "tag": "[Recruta]",
            "roleId": "123456789012345678",
            "emoji": "🔰",
            "description": "Formulário de teste e registro para novos Recrutas."
        }
    ]
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
});

// Cache local de confirmações
const confirmacoesRegras = new Map();

function formatarApelido(tag, nome, id) {
    const cleanTag = tag ? tag.trim() : "";
    const cleanNome = nome ? nome.trim() : "Membro";
    const cleanId = id ? id.trim() : "00";
    return `${cleanTag} ${cleanNome} | ${cleanId}`.substring(0, 32);
}

function eRespostaValida(resposta) {
    if (!resposta || typeof resposta !== "string") return false;
    const txt = resposta.trim().toLowerCase();
    if (txt.length < 5) return false;
    const troll = ["nao sei", "não sei", "sei la", "sei lá", "sla", ".", "..", "...", "rdm", "vdm", "nada", "qualquer", "sim", "nao", "não"];
    return !troll.includes(txt);
}

client.once(Events.ClientReady, (c) => {
    console.log(`✅ Bot ${c.user.tag} iniciado com sucesso!`);
});

// EVENTO: Entrada de Novo Membro
client.on(Events.GuildMemberAdd, async (member) => {
    try {
        if (CONFIG.cargoNaoRegistradoId && CONFIG.cargoNaoRegistradoId !== "123456789012345678") {
            await member.roles.add(CONFIG.cargoNaoRegistradoId).catch(() => {});
        }

        const channel = member.guild.channels.cache.get(CONFIG.canalEntradaSaidaId) || member.guild.channels.cache.get(CONFIG.canalRegistroId);
        if (channel && channel.isTextBased()) {
            const embed = new EmbedBuilder()
                .setTitle(`🎉 Bem-vindo(a) à Família Souza & Clã Hunters!`)
                .setAuthor({ name: CONFIG.authorName, iconURL: CONFIG.botAvatarUrl })
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setColor(CONFIG.embedColor)
                .setDescription(
                    `Olá <@${member.id}>!\n\n` +
                    `Seja muito bem-vindo(a) ao nosso servidor. Você tem até **${CONFIG.prazoRegistroDias} dias** para realizar seu registro em <#${CONFIG.canalRegistroId}>.\n\n` +
                    `💡 Selecione o seu grupo no painel para abrir seu formulário.`
                )
                .setFooter({ text: CONFIG.footer });

            await channel.send({ content: `<@${member.id}>`, embeds: [embed] });
        }
    } catch (err) {
        console.error("Erro no evento GuildMemberAdd:", err);
    }
});

// EVENTO: Saída de Membro
client.on(Events.GuildMemberRemove, async (member) => {
    try {
        const channel = member.guild.channels.cache.get(CONFIG.canalEntradaSaidaId) || member.guild.channels.cache.get(CONFIG.canalLogsId);
        if (channel && channel.isTextBased()) {
            const embed = new EmbedBuilder()
                .setTitle(`🚪 Membro Saiu do Servidor`)
                .setColor(CONFIG.embedColorSaida)
                .setDescription(`O membro **${member.user.tag}** (${member.id}) saiu do servidor.`)
                .setFooter({ text: CONFIG.footerSaida });

            await channel.send({ embeds: [embed] });
        }
    } catch (err) {
        console.error("Erro no evento GuildMemberRemove:", err);
    }
});

// EVENTO: Comandos do Bot
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;

    // Comandos de Painéis (Staff)
    if (message.content.startsWith(CONFIG.comandoPainelRegistro) || message.content.startsWith("!painel")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("❌ Apenas administradores podem enviar este painel.");
        }

        let options = (CONFIG.grupos || []).map(g => {
            const nameStr = (g.name || "Grupo").trim();
            const tagStr = (g.tag || "").trim();
            const label = (nameStr + (tagStr ? " " + tagStr : "")).substring(0, 100);
            const description = (g.description || ("Função " + nameStr)).trim().substring(0, 100);
            const value = String(g.id || g.roleId || "grupo_padrao").trim();

            const opt = {
                label: label || "Grupo",
                description: description || "Selecione esta opção",
                value: value
            };

            if (g.emoji && typeof g.emoji === "string" && g.emoji.trim().length > 0) {
                opt.emoji = g.emoji.trim();
            }

            return opt;
        });

        if (options.length === 0) {
            options = [{
                label: "Cidadão / Registre-se",
                description: "Clique para preencher seu formulário",
                value: "grupo_cidadao",
                emoji: "🏙️"
            }];
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("selecionar_grupo_registro")
            .setPlaceholder("Escolha o seu grupo para iniciar o registro...")
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const embed = new EmbedBuilder()
            .setTitle(CONFIG.tituloPainel)
            .setDescription(CONFIG.descricaoPainel)
            .setColor(CONFIG.embedColor)
            .setFooter({ text: CONFIG.footer });

        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete().catch(() => {});
    }

    if (message.content.startsWith(CONFIG.comandoPainelAusencia)) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("❌ Apenas administradores podem enviar este painel.");
        }

        const btnAusencia = new ButtonBuilder()
            .setCustomId("abrir_modal_ausencia")
            .setLabel("Registrar Ausência")
            .setEmoji("🌴")
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(btnAusencia);

        const embed = new EmbedBuilder()
            .setTitle(CONFIG.tituloPainelAusencia)
            .setDescription(CONFIG.descricaoPainelAusencia)
            .setColor(CONFIG.embedColorAusencia)
            .setFooter({ text: CONFIG.footer });

        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete().catch(() => {});
    }
});

// EVENTO: Interações (Select Menu, Botões, Modais)
client.on(Events.InteractionCreate, async (interaction) => {
    try {
        // 1. SELECT MENU DE SELEÇÃO DE GRUPOS
        if (interaction.isStringSelectMenu() && (interaction.customId === "selecionar_grupo_registro" || interaction.customId === "select_grupo")) {
            const roleIdOrGroupId = interaction.values[0];
            const grupo = (CONFIG.grupos || []).find(g => g.id === roleIdOrGroupId || g.roleId === roleIdOrGroupId || String(g.id || g.roleId) === roleIdOrGroupId) || {
                name: "Cidadão",
                tag: "[Cidadão]",
                roleId: CONFIG.cargoCidadaoGeralId || "123456789012345678"
            };

            const targetRoleId = grupo.roleId || grupo.id || "123456789012345678";
            const cleanRoleId = String(targetRoleId).replace(/[^a-zA-Z0-9_]/g, "").substring(0, 40) || "default";

            const modalTitle = ("Formulário — " + (grupo.name || "Cidadão")).substring(0, 45);

            const modal = new ModalBuilder()
                .setCustomId("modal_reg_" + cleanRoleId)
                .setTitle(modalTitle);

            const inputNome = new TextInputBuilder()
                .setCustomId("nome")
                .setLabel("Nome no Jogo")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Ex: Igor Kz")
                .setRequired(true);

            const inputId = new TextInputBuilder()
                .setCustomId("id_jogo")
                .setLabel("ID no Jogo")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Ex: 24257")
                .setRequired(true);

            const inputRecrutador = new TextInputBuilder()
                .setCustomId("recrutador")
                .setLabel("Quem te recrutou?")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Ex: Liderança / Kz")
                .setRequired(true);

            const lblRegras = (CONFIG.perguntaRegrasCincoZ || "O que é RDM, VDM e Amor à Vida?").trim().substring(0, 45) || "Regras da Cidade";
            const inputRegras = new TextInputBuilder()
                .setCustomId("regras_fivez")
                .setLabel(lblRegras)
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder("Explique com suas palavras (Proibido copiar e colar)".substring(0, 100))
                .setRequired(true);

            const lblInat = (CONFIG.perguntaInatividadecincoZ || "Ciente de SafeZone, Anti-Jogo e Inatividade?").trim().substring(0, 45) || "Anti-Jogo e Inatividade";
            const inputInatividade = new TextInputBuilder()
                .setCustomId("regras_inatividade")
                .setLabel(lblInat)
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Ciente do prazo máximo e regras da cidade".substring(0, 100))
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(inputNome),
                new ActionRowBuilder().addComponents(inputId),
                new ActionRowBuilder().addComponents(inputRecrutador),
                new ActionRowBuilder().addComponents(inputRegras),
                new ActionRowBuilder().addComponents(inputInatividade)
            );

            return await interaction.showModal(modal);
        }

        // 2. BOTÃO DO PAINEL DE AUSÊNCIA
        if (interaction.isButton() && (interaction.customId === "abrir_modal_ausencia" || interaction.customId === "btn_registrar_ausencia")) {
            const modal = new ModalBuilder()
                .setCustomId("modal_ausencia")
                .setTitle("Registro de Ausência");

            const inputMotivo = new TextInputBuilder()
                .setCustomId("motivo")
                .setLabel("Motivo da Ausência")
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder("Descreva o motivo da ausência...")
                .setRequired(true);

            const inputInicio = new TextInputBuilder()
                .setCustomId("data_inicio")
                .setLabel("Data de Início")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Ex: 06/08/2026")
                .setRequired(true);

            const inputRetorno = new TextInputBuilder()
                .setCustomId("previsao_retorno")
                .setLabel("Previsão de Retorno")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Ex: 12/08/2026")
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(inputMotivo),
                new ActionRowBuilder().addComponents(inputInicio),
                new ActionRowBuilder().addComponents(inputRetorno)
            );

            return await interaction.showModal(modal);
        }

        // 3. ENVIO DO FORMULÁRIO DE REGISTRO
        if (interaction.isModalSubmit() && interaction.customId.startsWith("modal_reg_")) {
            const roleIdClean = interaction.customId.replace("modal_reg_", "");
            const grupo = (CONFIG.grupos || []).find(g => 
                g.roleId === roleIdClean || 
                g.id === roleIdClean || 
                String(g.roleId || g.id).replace(/[^a-zA-Z0-9_]/g, "") === roleIdClean
            ) || { name: "Cidadão", tag: "[Cidadão]", roleId: roleIdClean };

            const nome = interaction.fields.getTextInputValue("nome");
            const idJogo = interaction.fields.getTextInputValue("id_jogo");
            const recrutador = interaction.fields.getTextInputValue("recrutador");
            const respRegras = interaction.fields.getTextInputValue("regras_fivez");
            const respInat = interaction.fields.getTextInputValue("regras_inatividade");

            // Filtro Anti-Troll
            if (CONFIG.autoReprovarRespostasInvalidas) {
                const regrasOk = eRespostaValida(respRegras);
                const inatOk = eRespostaValida(respInat);

                if (!regrasOk || !inatOk) {
                    const motivoText = !regrasOk && !inatOk
                        ? "Respostas das 2 perguntas foram consideradas inválidas (ex: '.', 'não sei' ou curtas demais)."
                        : !regrasOk
                        ? "Resposta sobre RDM/VDM/Amor à Vida foi considerada inválida."
                        : "Resposta sobre Anti-Jogo / Inatividade foi considerada inválida.";

                    const embedReproved = new EmbedBuilder()
                        .setTitle("❌ Registro REPROVADO Automaticamente!")
                        .setColor("#E74C3C")
                        .setDescription(`Olá <@${interaction.user.id}>, seu formulário foi **REPROVADO AUTOMATICAMENTE** pelo filtro anti-troll.\n\n⚠️ **Motivo:** ${motivoText}\n\n📖 Leia atentamente as regras no canal e tente novamente com a resposta completa!`)
                        .setFooter({ text: CONFIG.footer });

                    return await interaction.reply({ embeds: [embedReproved], ephemeral: true });
                }
            }

            const nickFormatado = formatarApelido(grupo.tag, nome, idJogo);

            // Envia para canal de aprovação da Staff
            const canalAprov = interaction.guild.channels.cache.get(CONFIG.canalAprovacaoId);
            if (canalAprov && canalAprov.isTextBased()) {
                const embedStaff = new EmbedBuilder()
                    .setTitle("📩 Novo Pedido de Set / Registro")
                    .setColor("#F1C40F")
                    .addFields(
                        { name: "Membro", value: `<@${interaction.user.id}> (${interaction.user.id})`, inline: true },
                        { name: "Grupo Escolhido", value: `${grupo.name} (${grupo.tag})`, inline: true },
                        { name: "Nome e ID no Jogo", value: `${nome} | ${idJogo}`, inline: false },
                        { name: "Recrutador", value: recrutador, inline: true },
                        { name: "Apelido Formatado", value: nickFormatado, inline: true },
                        { name: "📖 Resposta Regras", value: respRegras || "*(vazio)*" },
                        { name: "⚠️ Resposta Anti-Jogo", value: respInat || "*(vazio)*" }
                    )
                    .setFooter({ text: CONFIG.footer });

                const targetRoleId = grupo.roleId || grupo.id || roleIdClean;
                const cleanRoleId = String(targetRoleId).replace(/[^a-zA-Z0-9_]/g, "");

                const rowBtns = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`aprovar_${interaction.user.id}_${cleanRoleId}`)
                        .setLabel("Aprovar Set")
                        .setEmoji("✅")
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`recusar_${interaction.user.id}`)
                        .setLabel("Recusar Set")
                        .setEmoji("❌")
                        .setStyle(ButtonStyle.Danger)
                );

                await canalAprov.send({ embeds: [embedStaff], components: [rowBtns] });
            }

            return await interaction.reply({
                content: `✅ Formulário enviado com sucesso para a aprovação da Staff!\n**Apelido previsto:** \`${nickFormatado}\``,
                ephemeral: true
            });
        }

        // 4. SUBMIT DO MODAL DE AUSÊNCIA
        if (interaction.isModalSubmit() && interaction.customId === "modal_ausencia") {
            const motivo = interaction.fields.getTextInputValue("motivo");
            const inicio = interaction.fields.getTextInputValue("data_inicio");
            const retorno = interaction.fields.getTextInputValue("previsao_retorno");

            const canalAusence = interaction.guild.channels.cache.get(CONFIG.canalAusenciaLogsId) || interaction.guild.channels.cache.get(CONFIG.canalAusenciaId);

            if (canalAusence && canalAusence.isTextBased()) {
                const embedAus = new EmbedBuilder()
                    .setTitle("🌴 Registro de Ausência de Membro")
                    .setColor(CONFIG.embedColorAusencia)
                    .addFields(
                        { name: "Membro", value: `<@${interaction.user.id}>`, inline: true },
                        { name: "Data Início", value: inicio, inline: true },
                        { name: "Previsão Retorno", value: retorno, inline: true },
                        { name: "Motivo", value: motivo }
                    )
                    .setFooter({ text: "Família Souza • Registro de Ausência" });

                await canalAusence.send({ embeds: [embedAus] });
            }

            return await interaction.reply({ content: "✅ Sua ausência foi registrada com sucesso no sistema!", ephemeral: true });
        }

        // 5. BOTÕES APROVAR / RECUSAR SET DA STAFF
        if (interaction.isButton() && (interaction.customId.startsWith("aprovar_") || interaction.customId.startsWith("recusar_"))) {
            const isStaff = interaction.member?.permissions.has(PermissionsBitField.Flags.Administrator) ||
                interaction.member?.roles.cache.some(r => CONFIG.cargosAdminsAprovadores.includes(r.id));

            if (!isStaff) {
                return await interaction.reply({ content: "❌ Apenas membros da Staff podem aprovar ou recusar registros.", ephemeral: true });
            }

            const parts = interaction.customId.split("_");
            const action = parts[0];
            const targetUserId = parts[1];

            if (action === "aprovar") {
                const roleId = parts[2];
                const grupo = (CONFIG.grupos || []).find(g => 
                    g.roleId === roleId || 
                    g.id === roleId || 
                    String(g.roleId || g.id).replace(/[^a-zA-Z0-9_]/g, "") === roleId
                ) || { tag: "[Hunters]", roleId };

                const member = await interaction.guild.members.fetch(targetUserId).catch(() => null);

                if (member) {
                    try {
                        const embedMsg = interaction.message.embeds[0];
                        let nickFormatado = "";
                        if (embedMsg && embedMsg.fields && embedMsg.fields[4]) {
                            nickFormatado = embedMsg.fields[4].value;
                        } else if (embedMsg && embedMsg.fields && embedMsg.fields[2]) {
                            const partesNomeId = embedMsg.fields[2].value.split(" | ");
                            nickFormatado = formatarApelido(grupo.tag, partesNomeId[0], partesNomeId[1] || "00");
                        }

                        if (roleId && roleId !== "123456789012345678") {
                            await member.roles.add(roleId).catch(() => null);
                        }
                        if (CONFIG.cargoCidadaoGeralId && CONFIG.cargoCidadaoGeralId !== "123456789012345678") {
                            await member.roles.add(CONFIG.cargoCidadaoGeralId).catch(() => null);
                        }
                        if (CONFIG.cargoNaoRegistradoId && CONFIG.cargoNaoRegistradoId !== "123456789012345678") {
                            await member.roles.remove(CONFIG.cargoNaoRegistradoId).catch(() => null);
                        }

                        if (nickFormatado && interaction.guild.ownerId !== targetUserId) {
                            await member.setNickname(nickFormatado).catch(() => {});
                        }

                        if (CONFIG.regrasTexto) {
                            const dmEmbed = new EmbedBuilder()
                                .setTitle("🎉 Registro Aprovado — Clã Hunters & Família Souza!")
                                .setColor("#2ECC71")
                                .setDescription(`Parabéns <@${targetUserId}>, seu registro foi aprovado com sucesso!\n\n${CONFIG.regrasTexto}`)
                                .setFooter({ text: CONFIG.footer });
                            await member.send({ embeds: [dmEmbed] }).catch(() => null);
                        }
                    } catch (e) {
                        console.error("Erro ao aprovar membro:", e);
                    }
                }

                await interaction.message.edit({
                    content: `✅ **Aprovado por <@${interaction.user.id}>**`,
                    components: []
                });

                return await interaction.reply({ content: `✅ Membro <@${targetUserId}> foi aprovado com sucesso!`, ephemeral: true });
            }

            if (action === "recusar") {
                await interaction.message.edit({
                    content: `❌ **Recusado por <@${interaction.user.id}>**`,
                    components: []
                });

                return await interaction.reply({ content: "❌ Registro do membro recusado.", ephemeral: true });
            }
        }
    } catch (err) {
        console.error("Erro na interação do Discord:", err);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: "❌ Ocorreu um erro ao processar esta ação. Verifique os logs.", ephemeral: true }).catch(() => {});
        }
    }
});

// HTTP Express Server Keep-Alive
const app = express();
app.get('/', (req, res) => res.send('🤖 Bot SIGIO Online!'));
app.listen(PORT, () => console.log(`🌐 Servidor HTTP rodando na porta ${PORT}`));

client.login(TOKEN);
