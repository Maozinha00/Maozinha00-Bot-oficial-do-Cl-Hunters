/**
 * ============================================================================
 * BOT OFICIAL DE REGISTRO - CLÃ HUNTERS & FAMÍLIA SOUZA
 * CORRIGIDO E ATUALIZADO (DISCORD.JS V14)
 * ============================================================================
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

// ===============================
// CONFIGURAÇÃO DE AMBIENTE
// ===============================
const TOKEN = process.env.TOKEN || "SEU_TOKEN_AQUI";
const PORT = process.env.PORT || 3000;

const CONFIG = {
    // IDs dos Canais (SUBSTITUA PELOS SEUS IDS REAIS)
    CANAL_REGISTRO_ID: "123456789012345678", 
    CANAL_APROVACAO_ID: "123456789012345678",
    CANAL_LOGS_ID: "123456789012345678", 
    CANAL_ENTRADA_SAIDA_ID: "123456789012345678",
    CANAL_AUSENCIA_LOGS_ID: "123456789012345678",

    // Cargos que podem aprovar (Staff)
    CARGOS_ADMINS_APROVADORES: [
        "123456789012345678",
        "123456789012345678"
    ],

    EMBED_COLOR: "#2ECC71",
    EMBED_COLOR_AUSENCIA: "#E67E22",
    FOOTER: "FiveZ & Lumenfall • Sistema Anti-Queda • Família Souza",

    GRUPOS: [
        {
            id: "grupo_hunters",
            name: "Hunters FiveZ (Recruta)",
            roleId: "123456789012345678",
            tag: "|Recruta|",
            description: "Set padrão para recrutas do Clã Hunters",
            emoji: "🎯"
        },
        {
            id: "grupo_comprador",
            name: "Comprador FiveZ",
            roleId: "123456789012345678",
            tag: "|Comprador|",
            description: "Compradores oficiais FiveZ",
            emoji: "🛒"
        }
    ]
};

// ===============================
// INSTÂNCIA DO CLIENTE
// ===============================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, // Necessário para mudar apelido e dar cargo
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // Necessário para ler o comando !painel
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel, Partials.Message, Partials.GuildMember]
});

// Memória temporária para confirmação de regras
const confirmacoesRegras = new Map();

// ===============================
// SERVIDOR KEEP-ALIVE
// ===============================
const app = express();
app.get('/', (req, res) => res.send('Bot Online!'));
app.listen(PORT, () => console.log(`🌐 Servidor HTTP na porta ${PORT}`));

// ===============================
// FUNÇÕES AUXILIARES
// ===============================
function formatarApelido(tag, nome, id) {
    let nick = `${tag} ${nome} | ${id}`.trim();
    return nick.length > 32 ? nick.substring(0, 29) + "..." : nick;
}

async function enviarRegrasPV(user) {
    const embedPV = new EmbedBuilder()
        .setColor('#2ECC71')
        .setTitle('📜 REGRAS OBRIGATÓRIAS - CLÃ HUNTERS')
        .setDescription(`Olá <@${user.id}>!\n\n1. Respeite a hierarquia.\n2. Inatividade máxima: 3 dias.\n3. Use a Tag obrigatória.\n\n**Confirme a leitura no botão abaixo:**`)
        .setFooter({ text: CONFIG.FOOTER });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('btn_confirmar_regras_pv')
            .setLabel('Li e Aceito as Regras')
            .setStyle(ButtonStyle.Success)
    );

    try {
        await user.send({ embeds: [embedPV], components: [row] });
        return true;
    } catch (err) {
        return false;
    }
}

// ===============================
// EVENTOS
// ===============================
client.once(Events.ClientReady, () => {
    console.log(`✅ Logado como ${client.user.tag}`);
});

// Mensagem de boas-vindas e envio de regras
client.on(Events.GuildMemberAdd, async (member) => {
    await enviarRegrasPV(member.user);
    const canal = member.guild.channels.cache.get(CONFIG.CANAL_ENTRADA_SAIDA_ID);
    if (canal) {
        canal.send({ content: `Bem-vindo <@${member.id}>! Verifique seu PV para as regras e registre-se em <#${CONFIG.CANAL_REGISTRO_ID}>.` });
    }
});

// Comandos de Admin
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;

    if (message.content === '!painel' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        const embed = new EmbedBuilder()
            .setColor(CONFIG.EMBED_COLOR)
            .setTitle('👑 REGISTRO FAMÍLIA SOUZA')
            .setDescription('Clique no botão abaixo para iniciar seu registro.\n⚠️ Prazo: 3 dias para registrar ou será removido.');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_iniciar_registro')
                .setLabel('Realizar Registro')
                .setStyle(ButtonStyle.Success)
        );

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

// Handler de Interações
client.on(Events.InteractionCreate, async (interaction) => {
    // 1. Confirmação de Regras no PV
    if (interaction.isButton() && interaction.customId === 'btn_confirmar_regras_pv') {
        confirmacoesRegras.set(interaction.user.id, true);
        return interaction.reply({ content: "✅ Regras confirmadas!", ephemeral: true });
    }

    // 2. Iniciar Registro (Botão do Canal)
    if (interaction.isButton() && interaction.customId === 'btn_iniciar_registro') {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_grupo')
            .setPlaceholder('Escolha seu grupo...')
            .addOptions(CONFIG.GRUPOS.map(g => ({ label: g.name, value: g.roleId, emoji: g.emoji })));

        return interaction.reply({ 
            content: "Selecione seu grupo abaixo. Verifique se confirmou as regras no seu PV!", 
            components: [new ActionRowBuilder().addComponents(selectMenu)], 
            ephemeral: true 
        });
    }

    // 3. Menu de Seleção de Grupo -> Abre Modal
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

    // 4. Recebimento do Modal -> Envia para Staff
    if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_reg_')) {
        const roleId = interaction.customId.replace('modal_reg_', '');
        const grupo = CONFIG.GRUPOS.find(g => g.roleId === roleId);
        const nome = interaction.fields.getTextInputValue('nome');
        const idJogo = interaction.fields.getTextInputValue('id_jogo');
        const confirmado = confirmacoesRegras.get(interaction.user.id) ? "✅ Sim" : "❌ Não (Peça para ele ler o PV)";

        const embedStaff = new EmbedBuilder()
            .setTitle('📩 Novo Pedido de Set')
            .setColor('#F1C40F')
            .addFields(
                { name: 'Membro', value: `<@${interaction.user.id}>`, inline: true },
                { name: 'Grupo', value: grupo.name, inline: true },
                { name: 'Confirmou Regras?', value: confirmado },
                { name: 'Nome/ID no Jogo', value: `${nome} | ${idJogo}` }
            );

        const botoes = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`aprovar_${interaction.user.id}_${roleId}`).setLabel('Aprovar').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`recusar_${interaction.user.id}`).setLabel('Recusar').setStyle(ButtonStyle.Danger)
        );

        const canalAprov = client.channels.cache.get(CONFIG.CANAL_APROVACAO_ID);
        if (canalAprov) await canalAprov.send({ embeds: [embedStaff], components: [botoes] });

        return interaction.reply({ content: "✅ Pedido enviado para a Staff!", ephemeral: true });
    }

    // 5. Aprovação/Recusa (Staff)
    if (interaction.isButton() && (interaction.customId.startsWith('aprovar_') || interaction.customId.startsWith('recusar_'))) {
        if (!CONFIG.CARGOS_ADMINS_APROVADORES.some(id => interaction.member.roles.cache.has(id))) {
            return interaction.reply({ content: "Apenas staff pode fazer isso.", ephemeral: true });
        }

        const parts = interaction.customId.split('_');
        const action = parts[0];
        const targetId = parts[1];
        const targetMember = await interaction.guild.members.fetch(targetId).catch(() => null);

        if (action === 'aprovar') {
            const roleId = parts[2];
            const grupo = CONFIG.GRUPOS.find(g => g.roleId === roleId);
            
            if (targetMember) {
                // Tenta mudar apelido (evita erro se for o dono do server)
                try {
                    // Aqui pegamos os dados do embed anterior para remontar o nome
                    const embedOriginal = interaction.message.embeds[0];
                    const infoNome = embedOriginal.fields[3].value.split(' | ');
                    const nick = formatarApelido(grupo.tag, infoNome[0], infoNome[1]);
                    
                    await targetMember.roles.add(roleId);
                    if (interaction.guild.ownerId !== targetId) {
                        await targetMember.setNickname(nick);
                    }
                } catch (e) { console.log("Erro ao alterar membro:", e.message); }
            }

            await interaction.message.edit({ content: `✅ Aprovado por <@${interaction.user.id}>`, components: [] });
            return interaction.reply({ content: "Membro aprovado!", ephemeral: true });
        }
        
        if (action === 'recusar') {
            await interaction.message.edit({ content: `❌ Recusado por <@${interaction.user.id}>`, components: [] });
            return interaction.reply({ content: "Membro recusado!", ephemeral: true });
        }
    }
});

client.login(TOKEN);
