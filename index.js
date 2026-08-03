/**
 * ============================================================================
 * BOT OFICIAL DE REGISTRO & AUSÊNCIAS - CLÃ HUNTERS & FAMÍLIA SOUZA
 * CÓDIGO COMPLETO (COMMONJS - require) - DISCORD.JS V14
 * ============================================================================
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
} = require('discord.js');

require('dotenv').config();

const TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN || "SEU_TOKEN_AQUI";
const PORT = process.env.PORT || 3000;

const CONFIG = {
    "token": "",
    "canalRegistroId": "123456789012345678",
    "canalAprovacaoId": "123456789012345678",
    "canalLogsId": "123456789012345678",
    "canalEntradaSaidaId": "123456789012345678",
    "canalAusenciaLogsId": "123456789012345678",
    "cargosAdminsAprovadores": [
        "123456789012345678",
        "987654321098765432"
    ],
    "embedColor": "#2ECC71",
    "embedColorAusencia": "#E67E22",
    "authorName": "👑 FAMÍLIA SOUZA INFINITA 👑",
    "authorSub": "🏡 Sistema de Registro — Cidadania & Grupos",
    "thumbnailUrl": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
    "footer": "FiveZ & Lumenfall • Sistema Automático Anti-Queda • 25/07/2026 05:44",
    "tituloPainel": "Seja bem-vindo à nossa Comunidade!",
    "descricaoPainel": "📢 **AVISO IMPORTANTE PARA TODOS (@everyone):**\n> ⚠️ **PRAZO LIMITE DE REGISTRO:** Todo membro que entrar no servidor tem um prazo máximo de **3 dias** para realizar o registro de cidadania.\n> 🚫 Se você passar de **3 dias** no servidor sem realizar o seu registro (ficando sem os cargos dos grupos), você será **kickado automaticamente** pelo sistema!\n\nPara desbloquear todos os canais do servidor e registrar sua cidadania, selecione seu grupo abaixo.\n\n🎁 **Benefícios ao registrar:**\n> ✅ **Cargo do seu Grupo escolhido**\n> 🏷️ **Apelido Atualizado:** Com a tag da facção, seu Nome e ID\n> 🔓 **Liberação imediata** dos canais e categorias do servidor\n\n👇 *Clique no botão abaixo, escolha seu grupo e preencha o formulário!*",
    "tituloPainelAusencia": "🌴 Painel de Registro de Ausência",
    "descricaoPainelAusencia": "📢 **REGISTRO DE AUSÊNCIA & FOLGA**\n> 🌴 Pretende ficar ausente das atividades ou ações no servidor?\n> ⚠️ Registre sua ausência com motivo e prazo de retorno para avisar a administração e evitar ser removido por inatividade.\n\n👇 *Clique no botão abaixo para preencher sua justificativa!*",
    "regrasTexto": "1. Respeite a hierarquia e os companheiros de clã.\n2. Inatividade máxima permitida: 3 dias sem justificativa.\n3. Use a Tag oficial e o Apelido formatado obrigatoriamente.\n4. Proibido anti-jogo ou conduta antidesportiva nas cidades (FiveZ / Lumenfall).",
    "prazoRegistroDias": 3,
    "grupos": [
        {
            "id": "grupo_hunters_recruta",
            "name": "Hunters FiveZ (Recruta)",
            "roleId": "123456789012345678",
            "tag": "|Recruta|",
            "description": "Set padrão para recrutas e novatos em teste no Clã Hunters",
            "emoji": "🎯"
        },
        {
            "id": "grupo_hunters_membro",
            "name": "Membro Oficial Hunters",
            "roleId": "123456789012345679",
            "tag": "|Hunters|",
            "description": "Membros oficiais aprovados do Clã Hunters",
            "emoji": "🛡️"
        },
        {
            "id": "grupo_hunters_elite",
            "name": "Elite Hunters FiveZ",
            "roleId": "123456789012345680",
            "tag": "|Elite-Hunters|",
            "description": "Tropa de elite e veteranos de combate FiveZ",
            "emoji": "⚡"
        },
        {
            "id": "grupo_sublider_hunters",
            "name": "Sub-Líder Hunters",
            "roleId": "123456789012345681",
            "tag": "|SubLíder-Hunters|",
            "description": "Sub-Liderança operacional do Clã Hunters",
            "emoji": "🎖️"
        },
        {
            "id": "grupo_lider_hunters",
            "name": "Líder Clã Hunters",
            "roleId": "123456789012345682",
            "tag": "|Líder-Hunters|",
            "description": "Liderança máxima do Clã Hunters",
            "emoji": "👑"
        },
        {
            "id": "grupo_souza_membro",
            "name": "Membro Família Souza",
            "roleId": "123456789012345683",
            "tag": "|FamíliaSouza|",
            "description": "Membros da Família Souza no FiveZ / Lumenfall",
            "emoji": "⚜️"
        },
        {
            "id": "grupo_souza_gerente",
            "name": "Gerente Família Souza",
            "roleId": "123456789012345684",
            "tag": "|Gerente-Souza|",
            "description": "Gestores de frota, armas e suprimentos Família Souza",
            "emoji": "💼"
        },
        {
            "id": "grupo_souza_lider",
            "name": "Líder Família Souza",
            "roleId": "123456789012345685",
            "tag": "|Líder-Souza|",
            "description": "Liderança suprema da Família Souza",
            "emoji": "👑"
        },
        {
            "id": "grupo_comprador",
            "name": "Comprador FiveZ / Souza",
            "roleId": "123456789012345686",
            "tag": "|Comprador|",
            "description": "Compradores oficiais e negociantes FiveZ",
            "emoji": "🛒"
        },
        {
            "id": "grupo_lumenfall",
            "name": "Membro Lumenfall",
            "roleId": "123456789012345687",
            "tag": "|Lumenfall|",
            "description": "Integrantes oficiais na cidade Lumenfall RP",
            "emoji": "🌌"
        },
        {
            "id": "grupo_staff",
            "name": "Staff / Moderador",
            "roleId": "123456789012345688",
            "tag": "|Staff|",
            "description": "Equipe de moderação, aprovação e suporte",
            "emoji": "🛠️"
        },
        {
            "id": "grupo_aliado",
            "name": "Aliado / Parceiro",
            "roleId": "123456789012345689",
            "tag": "|Aliado|",
            "description": "Clãs parceiros e aliados de aliança militar",
            "emoji": "🤝"
        },
        {
            "id": "grupo_ausente",
            "name": "Licença / Ausente",
            "roleId": "123456789012345690",
            "tag": "|Ausente|",
            "description": "Membros em período de justificativa ou ausência",
            "emoji": "⏳"
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

function formatarApelido(tag, nome, id) {
    let nick = `${tag} ${nome} | ${id}`.trim();
    return nick.length > 32 ? nick.substring(0, 29) + "..." : nick;
}

async function enviarRegrasPV(user) {
    const embedPV = new EmbedBuilder()
        .setColor(CONFIG.embedColor || "#2ECC71")
        .setTitle("📜 REGRAS OBRIGATÓRIAS - CLÃ HUNTERS & FAMÍLIA SOUZA")
        .setDescription(`Olá <@${user.id}>!\n\n${CONFIG.regrasTexto}\n\n**Confirme a leitura no botão abaixo:**`)
        .setFooter({ text: CONFIG.footer });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("btn_confirmar_regras_pv")
            .setLabel("Li e Aceito as Regras")
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
app.listen(PORT, () => console.log(`🌐 Servidor HTTP rodando na porta ${PORT}`));

client.once(Events.ClientReady, (c) => {
    console.log(`✅ Bot logado com sucesso como ${c.user.tag}`);
});

client.on(Events.GuildMemberAdd, async (member) => {
    await enviarRegrasPV(member.user);
    const canal = member.guild.channels.cache.get(CONFIG.canalEntradaSaidaId);
    if (canal && canal.isTextBased()) {
        canal.send({ content: `👋 Bem-vindo <@${member.id}>! Verifique seu PV para as regras e registre-se em <#${CONFIG.canalRegistroId}>.` });
    }
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;

    if (message.content === '!painel' || message.content === '!painel-registro') {
        const isStaff = message.member.permissions.has(PermissionsBitField.Flags.Administrator) ||
            CONFIG.cargosAdminsAprovadores.some(r => message.member.roles.cache.has(r));

        if (!isStaff) return message.reply({ content: "❌ Apenas Staff pode enviar o painel." });

        const embed = new EmbedBuilder()
            .setColor(CONFIG.embedColor)
            .setTitle(CONFIG.tituloPainel)
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

    if (message.content === '!painel-ausencia' || message.content === '!painel-ausência') {
        const isStaff = message.member.permissions.has(PermissionsBitField.Flags.Administrator) ||
            CONFIG.cargosAdminsAprovadores.some(r => message.member.roles.cache.has(r));

        if (!isStaff) return message.reply({ content: "❌ Apenas Staff pode enviar o painel de ausência." });

        const embedAusencia = new EmbedBuilder()
            .setColor(CONFIG.embedColorAusencia || "#E67E22")
            .setTitle(CONFIG.tituloPainelAusencia || "🌴 Painel de Registro de Ausência")
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

    if (interaction.isButton() && interaction.customId === 'btn_iniciar_registro') {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_grupo')
            .setPlaceholder('Escolha seu grupo...')
            .addOptions(CONFIG.grupos.map(g => ({ label: g.name, value: g.roleId, emoji: g.emoji || '🎯', description: g.description.substring(0, 50) })));

        return interaction.reply({ 
            content: "Selecione seu grupo abaixo. Verifique se confirmou as regras no seu PV!", 
            components: [new ActionRowBuilder().addComponents(selectMenu)], 
            ephemeral: true 
        });
    }

    if (interaction.isButton() && interaction.customId === 'btn_registrar_ausencia') {
        const modal = new ModalBuilder().setCustomId('modal_ausencia').setTitle('Formulário de Ausência');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('motivo').setLabel('Motivo').setStyle(TextInputStyle.Paragraph).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('data_inicio').setLabel('Data de Início').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('previsao_retorno').setLabel('Previsão de Retorno').setStyle(TextInputStyle.Short).setRequired(true))
        );
        return interaction.showModal(modal);
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'select_grupo') {
        const roleId = interaction.values[0];
        const modal = new ModalBuilder().setCustomId(`modal_reg_${roleId}`).setTitle('Formulário de Registro');

        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nome').setLabel('Nome no Jogo').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('id_jogo').setLabel('ID no Jogo').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('recrutador').setLabel('Quem te recrutou?').setStyle(TextInputStyle.Short).setRequired(true))
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
        const grupo = CONFIG.grupos.find(g => g.roleId === roleId) || { name: "Recruta", tag: "|Recruta|" };
        const nome = interaction.fields.getTextInputValue('nome');
        const idJogo = interaction.fields.getTextInputValue('id_jogo');
        const recrutador = interaction.fields.getTextInputValue('recrutador');
        const confirmado = confirmacoesRegras.get(interaction.user.id) ? "✅ Sim" : "❌ Não (Verificar PV)";
        const nickFormatado = formatarApelido(grupo.tag, nome, idJogo);

        const embedStaff = new EmbedBuilder()
            .setTitle('📩 Novo Pedido de Set')
            .setColor('#F1C40F')
            .addFields(
                { name: 'Membro', value: `<@${interaction.user.id}>`, inline: true },
                { name: 'Grupo', value: grupo.name, inline: true },
                { name: 'Confirmou Regras?', value: confirmado },
                { name: 'Nome | ID no Jogo', value: `${nome} | ${idJogo}` },
                { name: 'Recrutador', value: recrutador, inline: true },
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
            const grupo = CONFIG.grupos.find(g => g.roleId === roleId) || { tag: "|Recruta|" };
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
                } catch (e) {
                    console.error("Erro ao alterar membro:", e.message);
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
