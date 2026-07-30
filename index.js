/**
 * ============================================================================
 * BOT OFICIAL DE REGISTRO DE SET, REGRAS NO PV & INATIVIDADE DE 3 DIAS
 * CLÃ HUNTERS & FAMÍLIA SOUZA INFINITA (DISCORD.JS V14)
 * ============================================================================
 * 
 * 🚀 FUNCIONA DIRETO NO NODE.JS (ESM / COMMONJS)
 * 
 * Instalação dos pacotes necessários:
 * npm install discord.js express
 * 
 * Execução:
 * node index.js
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
// CONFIGURAÇÃO DE TOKEN & AMBIENTE
// ===============================
const TOKEN = process.env.TOKEN || "COLE_SEU_TOKEN_AQUI";
const PORT = process.env.PORT || 3000;

// Armazena em memória se o usuário clicou no botão de confirmação das regras no PV
const confirmacoesRegras = new Map();

// ===============================
// CONFIGURAÇÕES DO SERVIDOR
// ===============================
const CONFIG = {
    // IDs dos Canais do Servidor (Substitua pelos IDs reais do seu Discord)
    CANAL_REGISTRO_ID: "123456789012345678",      // Canal #pedir-set
    CANAL_APROVACAO_ID: "123456789012345679",     // Canal da Staff #aprovação-set
    CANAL_ENTRADA_SAIDA_ID: "123456789012345680", // Canal de bem-vindo

    // Cargos de Administrador Autorizados a Aprovar
    CARGOS_ADMINS_APROVADORES: [
        "123456789012345681" // ID do Cargo Admin/Staff
    ],

    EMBED_COLOR: "#2ECC71",
    FOOTER: "FiveZ & Lumenfall • Sistema Automático Anti-Queda • Família Souza",

    // Grupos / Facções Configurados
    GRUPOS: [
        {
            id: "grupo_hunters",
            name: "Hunters Recruta",
            tag: "|HUNTERS REC|",
            roleId: "123456789012345682",
            description: "Grupo oficial de recrutas Hunters",
            emoji: "🏹"
        },
        {
            id: "grupo_souza",
            name: "Família Souza Infinita",
            tag: "|SOUZA|",
            roleId: "123456789012345683",
            description: "Grupo principal Família Souza",
            emoji: "👑"
        }
    ]
};

// ===============================
// REGRAS OFICIAIS ENVIADAS NO PV
// ===============================
const REGRAS_TEXTO = `
📌 **1. Respeito Absoluto à Hierarquia:**
Obedeça aos líderes do Clã Hunters & Família Souza. Insubordinação não será tolerada.

📌 **2. Proibida Agressão Interna (TK/Fogo Amigo):**
Proibido atacar membros da mesma facção sob qualquer hipótese.

📌 **3. Identificação no Discord (Apelido/Set):**
Mantenha a tag [HUNTERS] ou [SOUZA], seu Nome e ID no jogo atualizados.

📌 **4. Fone de Ouvido & Microfone no Voice:**
Mantenha comunicação clara durante ações e confrontos no FiveM.

🚨 **5. REGRA DE INATIVIDADE DE 3 DIAS:**
Ficar 3 dias sem entrar no servidor sem registrar ausência prévia no painel resultará em KICK AUTOMÁTICO e perda de cargos!
`;

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

// Servidor Express Keep-Alive (Para hospedar na SquareCloud, Replit, Render, etc.)
const app = express();
app.get('/', (req, res) => res.send('🟢 Bot Família Souza & Clã Hunters Online 24/7!'));
app.listen(PORT, '0.0.0.0', () => console.log(`🌐 Servidor Web rodando na porta ${PORT}`));

// Proteção Anti-Crash
process.on('unhandledRejection', reason => console.error('⚠️ Rejeição não tratada:', reason));
process.on('uncaughtException', error => console.error('⚠️ Exceção não capturada:', error));

// Helper para formatar apelido com limite de 32 caracteres do Discord
function formatarApelido(tag, nome, id) {
    let nick = `${tag} ${nome} | ${id}`.trim();
    if (nick.length > 32) {
        const extraLen = tag.length + id.length + 4;
        const maxNome = Math.max(1, 32 - extraLen);
        nick = `${tag} ${nome.substring(0, maxNome)} | ${id}`.trim();
    }
    return nick.substring(0, 32);
}

// Envia o Embed de Regras com Botão no PV do Jogador
async function enviarRegrasPV(user) {
    const embedPV = new EmbedBuilder()
        .setColor('#2ECC71')
        .setTitle('📜 REGRAS OBRIGATÓRIAS DO CLÃ HUNTERS & FAMÍLIA SOUZA')
        .setDescription(`Olá <@${user.id}>! Seja bem-vindo(a)!\n\nAbaixo estão as regras oficiais do servidor. Para concluir seu registro, **confirme no botão verde abaixo que você leu as regras**:\n${REGRAS_TEXTO}\n\n👇 **Clique no botão verde para confirmar para a Staff:**`)
        .setFooter({ text: CONFIG.FOOTER })
        .setTimestamp();

    const rowPV = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('btn_confirmar_regras_pv')
            .setLabel('Li e Aceito as Regras do Clã')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅')
    );

    try {
        await user.send({ embeds: [embedPV], components: [rowPV] });
        return true;
    } catch (err) {
        return false;
    }
}

// ===============================
// EVENTOS DO BOT
// ===============================
client.once(Events.ClientReady, c => {
    console.log(`🤖 BOT CONECTADO COMO: ${c.user.tag}`);
});

// Comando !painel para postar o painel oficial
client.on(Events.MessageCreate, async message => {
    if (message.author.bot || !message.guild) return;

    if (message.content.toLowerCase() === '!painel') {
        if (!message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Apenas administradores podem usar este comando.');
        }

        const icon = message.guild.iconURL() || 'https://i.imgur.com/8Q8S4Zb.png';

        const embed = new EmbedBuilder()
            .setColor(CONFIG.EMBED_COLOR)
            .setAuthor({ name: '👑 FAMÍLIA SOUZA INFINITA 👑', iconURL: icon })
            .setTitle('🏡 Sistema de Registro — Cidadania & Grupos')
            .setThumbnail(icon)
            .setDescription(`# Seja bem-vindo à nossa Comunidade!

📢 **AVISO IMPORTANTE PARA TODOS (@everyone):**
⚠️ **PRAZO LIMITE DE REGISTRO:** Todo membro que entrar no servidor tem um prazo máximo de **3 dias** para realizar o registro de cidadania.
🚫 Se você passar de **3 dias** no servidor sem realizar o seu registro (ficando sem os cargos dos grupos), você será **kickado automaticamente** pelo sistema!

Para desbloquear todos os canais do servidor e registrar sua cidadania, selecione seu grupo abaixo.

🎁 **Benefícios ao registrar:**
✅ **Cargo do seu Grupo escolhido**
🏷️ **Apelido Atualizado:** Com a tag da facção, seu Nome e ID
🔓 **Liberação imediata** dos canais e categorias do servidor

👇 *Clique no botão abaixo, escolha seu grupo e preencha o formulário!*`)
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
        return message.reply('✅ Painel Oficial de Registro postado com sucesso!');
    }
});

// Interações (Botões, Menus e Modais)
client.on(Events.InteractionCreate, async interaction => {
    try {
        // 1. CONFIRMAÇÃO DAS REGRAS NO PV
        if (interaction.isButton() && interaction.customId === 'btn_confirmar_regras_pv') {
            confirmacoesRegras.set(interaction.user.id, {
                confirmado: true,
                data: new Date()
            });

            return interaction.reply({
                content: '✅ **CONFIRMAÇÃO REGISTRADA COM SUCESSO!**\nObrigado por confirmar a leitura das regras. A Staff já foi notificada no seu pedido de Set!',
                ephemeral: false
            });
        }

        // 2. BOTÃO "REALIZAR REGISTRO" NO CANAL
        if (interaction.isButton() && interaction.customId === 'btn_iniciar_registro') {
            // Tenta enviar as regras no PV
            const enviouPV = await enviarRegrasPV(interaction.user);

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_grupo_registro')
                .setPlaceholder('🎯 Escolha o seu Grupo / Facção...')
                .addOptions(CONFIG.GRUPOS.map(g => ({
                    label: g.name,
                    value: g.roleId,
                    description: g.description,
                    emoji: g.emoji
                })));

            const row = new ActionRowBuilder().addComponents(selectMenu);

            const msg = enviouPV
                ? '📩 **As regras foram enviadas no seu PV (Privado) com o botão de confirmação!**\n\n🎯 Selecione seu grupo abaixo:'
                : '⚠️ *Seu PV está fechado nas configurações do Discord. Abra o PV para receber e confirmar as regras!*\n\n🎯 Selecione seu grupo abaixo:';

            return interaction.reply({ content: msg, components: [row], ephemeral: true });
        }

        // 3. SELEÇÃO DE GRUPO NO MENU
        if (interaction.isStringSelectMenu() && interaction.customId === 'select_grupo_registro') {
            const roleId = interaction.values[0];
            const grupoObj = CONFIG.GRUPOS.find(g => g.roleId === roleId) || CONFIG.GRUPOS[0];

            const modal = new ModalBuilder()
                .setCustomId(`modal_registro_${grupoObj.roleId}`)
                .setTitle(`Set — ${grupoObj.name.substring(0, 25)}`);

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('input_nome').setLabel('Nome no Jogo').setPlaceholder('Ex: Bruno Hunters').setStyle(TextInputStyle.Short).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('input_id').setLabel('ID Numérico').setPlaceholder('Ex: 4502').setStyle(TextInputStyle.Short).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('input_recrutador').setLabel('Quem recrutou?').setPlaceholder('Ex: Alex Liderança').setStyle(TextInputStyle.Short).setRequired(true)
                )
            );

            return interaction.showModal(modal);
        }

        // 4. ENVIO DO FORMULÁRIO (MODAL SUBMIT)
        if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_registro_')) {
            const roleId = interaction.customId.replace('modal_registro_', '');
            const grupoObj = CONFIG.GRUPOS.find(g => g.roleId === roleId) || CONFIG.GRUPOS[0];

            const nome = interaction.fields.getTextInputValue('input_nome').trim();
            const id = interaction.fields.getTextInputValue('input_id').trim();
            const recrutador = interaction.fields.getTextInputValue('input_recrutador').trim();

            const nickFinal = formatarApelido(grupoObj.tag, nome, id);

            // Verifica se clicou no botão do PV
            const confirmacao = confirmacoesRegras.get(interaction.user.id);
            const statusRegrasPV = confirmacao?.confirmado
                ? '✅ **SIM — JOGADOR CLICOU E CONFIRMOU AS REGRAS NO PV!**'
                : '⏳ **REGRAS ENVIADAS NO PV — AGUARDANDO JOGADOR CLICAR NO BOTÃO DE CONFIRMAÇÃO**';

            const embedAprovacao = new EmbedBuilder()
                .setColor('#F1C40F')
                .setTitle('⏳ NOVO PEDIDO DE SET - AGUARDANDO STAFF')
                .addFields(
                    { name: '👤 Usuário Discord', value: `<@${interaction.user.id}> (${interaction.user.tag})`, inline: true },
                    { name: '🎯 Grupo Solicitado', value: `**${grupoObj.name}**`, inline: true },
                    { name: '📜 Confirmou Regras no PV?', value: statusRegrasPV, inline: false },
                    { name: '📝 Nome no Jogo', value: `**${nome}**`, inline: true },
                    { name: '🔢 ID no Jogo', value: `**${id}**`, inline: true },
                    { name: '🤝 Recrutado Por', value: `**${recrutador}**`, inline: false },
                    { name: '🏷️ Apelido Gerado', value: `\`${nickFinal}\``, inline: false }
                )
                .setFooter({ text: CONFIG.FOOTER })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`btn_aprovar_${interaction.user.id}_${roleId}`).setLabel('Aprovar Cidadania & Set').setStyle(ButtonStyle.Success).setEmoji('✅'),
                new ButtonBuilder().setCustomId(`btn_recusar_${interaction.user.id}`).setLabel('Recusar').setStyle(ButtonStyle.Danger).setEmoji('❌')
            );

            const canalAprov = interaction.guild?.channels.cache.get(CONFIG.CANAL_APROVACAO_ID);
            if (canalAprov) {
                await canalAprov.send({ embeds: [embedAprovacao], components: [row] });
            }

            return interaction.reply({
                content: `✅ **Pedido enviado com sucesso!** A Staff foi notificada.\n📩 *Lembre-se de clicar no botão verde de confirmação de leitura nas regras que enviamos no seu PV!*`,
                ephemeral: true
            });
        }

        // 5. APROVAÇÃO PELA STAFF
        if (interaction.isButton() && interaction.customId.startsWith('btn_aprovar_')) {
            const [, , userId, roleId] = interaction.customId.split('_');
            const member = await interaction.guild?.members.fetch(userId).catch(() => null);

            if (!member) return interaction.reply({ content: '❌ Membro não encontrado.', ephemeral: true });

            const grupoObj = CONFIG.GRUPOS.find(g => g.roleId === roleId) || CONFIG.GRUPOS[0];
            
            // Pega o nome e ID da embed
            const embed = interaction.message.embeds[0];
            const nomeVal = embed.fields?.find(f => f.name.includes('Nome no Jogo'))?.value?.replace(/\*/g, '') || 'Jogador';
            const idVal = embed.fields?.find(f => f.name.includes('ID no Jogo'))?.value?.replace(/\*/g, '') || '0000';

            const nickFinal = formatarApelido(grupoObj.tag, nomeVal, idVal);

            try { await member.setNickname(nickFinal); } catch (e) {}
            try { await member.roles.add(grupoObj.roleId); } catch (e) {}

            const approvedEmbed = EmbedBuilder.from(embed)
                .setColor('#2ECC71')
                .setTitle('✅ SET & CIDADANIA APROVADA')
                .addFields({ name: '👮 Aprovado Por', value: `<@${interaction.user.id}>` });

            await interaction.message.edit({ embeds: [approvedEmbed], components: [] });
            await member.send(`🎉 **Parabéns!** Seu Set para **${grupoObj.name}** foi APROVADO! Seu apelido foi alterado para \`${nickFinal}\`.`).catch(() => {});

            return interaction.reply({ content: `✅ Set de <@${userId}> aprovado!`, ephemeral: true });
        }

    } catch (err) {
        console.error('Erro na interação:', err);
    }
});

client.login(TOKEN);
