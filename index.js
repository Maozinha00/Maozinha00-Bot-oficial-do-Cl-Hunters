/**
 * ==============================================================================
 * 🐺 HUNTERS & FAMÍLIA SOUZA - BOT SIGIO & CENTRAL DE LOGS (ES Module / import)
 * ==============================================================================
 * Sistema completo de Registro SIGIO com Filtro Anti-Troll e Captura de Logs.
 * 
 * Requisitos:
 * - Node.js v18+ 
 * - npm install discord.js dotenv
 * - package.json contendo "type": "module" (OU salvar como index.js com ESM)
 * ==============================================================================
 */

import 'dotenv/config';
import { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle,
  Events 
} from 'discord.js';

// ⚙️ CONFIGURAÇÃO DE ID DOS CANAIS E CARGOS
const CONFIG = {
  // Canais onde os logs serão enviados
  channels: {
    logEntradaSaida: "123456789012345678", // Canal de Entrada/Saída
    logExclusoes: "123456789012345678",     // Canal de Mensagens Deletadas
    logVoz: "123456789012345678",           // Canal de Entrada/Saída de Voz
    logRegistros: "123456789012345678",      // Canal de Histórico de Aprovações
    painelRegistro: "123456789012345678"     // Canal onde o botão do SIGIO fica
  },

  // Filtros Anti-Troll (Respostas proibidas)
  antiTrollKeywords: [
    "piu", "piupiu", "pipi", "teste", "sua mae", "kkk", "admin", "god", 
    "dono", "foda", "pênis", "penis", "buceta", "vai tomar", "fdp", "corno"
  ],

  // Grupos cadastrados no SIGIO
  grupos: [
    {
      id: "grupo_membro_hunters",
      name: "Membro Hunters",
      tag: "[Hunters]",
      roleId: "123456789012345678",
      emoji: "🐺",
      description: "Membro oficial do Clã Hunters"
    },
    {
      id: "grupo_recruta_hunters",
      name: "Recruta Hunters",
      tag: "[Recruta]",
      roleId: "123456789012345678",
      emoji: "🎯",
      description: "Cargo de recruta em teste"
    },
    {
      id: "grupo_familia_souza",
      name: "Família Souza",
      tag: "[Souza]",
      roleId: "123456789012345678",
      emoji: "⚜️",
      description: "Membro da Família Souza"
    },
    {
      id: "grupo_cidadao_fivez",
      name: "Cidadão FiveZ",
      tag: "[Cidadão]",
      roleId: "123456789012345678",
      emoji: "🏙️",
      description: "Nome temporário antes de ser aprovado"
    },
    {
      id: "grupo_aliado",
      name: "Aliado",
      tag: "[Aliado]",
      roleId: "123456789012345678",
      emoji: "🤝",
      description: "Amigos que estão sempre aqui"
    }
  ]
};

// Inicialização do Client do Bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`✅ Bot Conectado com Sucesso como: ${readyClient.user.tag}`);
  console.log(`🐺 Sistema SIGIO Família Souza & Clã Hunters Ativo!`);
});

// ------------------------------------------------------------------------------
// 📊 CAPTURA DE LOGS AUTOMÁTICA
// ------------------------------------------------------------------------------

// 1. Log de Entrada de Membro
client.on(Events.GuildMemberAdd, async (member) => {
  const channel = member.guild.channels.cache.get(CONFIG.channels.logEntradaSaida);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle("📥 Novo Membro Entrou no Servidor")
    .setColor("#10B981")
    .setThumbnail(member.user.displayAvatarURL())
    .addFields(
      { name: "👤 Usuário", value: `${member.user.tag} (${member.id})`, inline: true },
      { name: "📅 Conta Criada", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
    )
    .setTimestamp();

  channel.send({ embeds: [embed] }).catch(console.error);
});

// 2. Log de Saída de Membro
client.on(Events.GuildMemberRemove, async (member) => {
  const channel = member.guild.channels.cache.get(CONFIG.channels.logEntradaSaida);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle("📤 Membro Saiu do Servidor")
    .setColor("#EF4444")
    .setThumbnail(member.user.displayAvatarURL())
    .addFields(
      { name: "👤 Usuário", value: `${member.user.tag} (${member.id})`, inline: true }
    )
    .setTimestamp();

  channel.send({ embeds: [embed] }).catch(console.error);
});

// 3. Log de Mensagem Deletada
client.on(Events.MessageDelete, async (message) => {
  if (message.author?.bot) return;
  const channel = message.guild?.channels.cache.get(CONFIG.channels.logExclusoes);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle("🗑️ Mensagem Excluída")
    .setColor("#F59E0B")
    .addFields(
      { name: "👤 Autor", value: message.author ? `${message.author.tag} (${message.author.id})` : "Desconhecido", inline: true },
      { name: "📌 Canal", value: message.channel ? `<#${message.channel.id}>` : "Desconhecido", inline: true },
      { name: "💬 Conteúdo", value: message.content || "*Nenhum texto (pode ter sido apenas imagem)*" }
    )
    .setTimestamp();

  channel.send({ embeds: [embed] }).catch(console.error);
});

// 4. Log de Estado de Voz
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  const channel = (newState.guild || oldState.guild).channels.cache.get(CONFIG.channels.logVoz);
  if (!channel) return;

  const member = newState.member || oldState.member;
  if (!member || member.user.bot) return;

  let title = "";
  let color = "#3B82F6";
  let desc = "";

  if (!oldState.channelId && newState.channelId) {
    title = "🎙️ Entrou na Call";
    color = "#10B981";
    desc = `**${member.user.tag}** entrou em <#${newState.channelId}>`;
  } else if (oldState.channelId && !newState.channelId) {
    title = "🔇 Saiu da Call";
    color = "#EF4444";
    desc = `**${member.user.tag}** saiu de <#${oldState.channelId}>`;
  } else if (oldState.channelId !== newState.channelId) {
    title = "🔀 Mudou de Call";
    color = "#F59E0B";
    desc = `**${member.user.tag}** mudou de <#${oldState.channelId}> para <#${newState.channelId}>`;
  } else {
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setColor(color)
    .setDescription(desc)
    .setTimestamp();

  channel.send({ embeds: [embed] }).catch(console.error);
});

// ------------------------------------------------------------------------------
// 📝 SISTEMA DE REGISTRO SIGIO (INTERAÇÕES & MODAIS)
// ------------------------------------------------------------------------------

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton() && interaction.customId === 'iniciar_registro_sigio') {
    const row = new ActionRowBuilder();
    CONFIG.grupos.forEach((grupo) => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`sigio_select_${grupo.id}`)
          .setLabel(grupo.name)
          .setEmoji(grupo.emoji)
          .setStyle(ButtonStyle.Primary)
      );
    });

    return interaction.reply({
      content: "🐺 **Selecione abaixo o seu Grupo para preencher a Ficha SIGIO:**",
      components: [row],
      ephemeral: true
    });
  }

  if (interaction.isButton() && interaction.customId.startsWith('sigio_select_')) {
    const grupoId = interaction.customId.replace('sigio_select_', '');
    const grupo = CONFIG.grupos.find(g => g.id === grupoId);

    const modal = new ModalBuilder()
      .setCustomId(`sigio_modal_${grupoId}`)
      .setTitle(`Ficha SIGIO - ${grupo ? grupo.name : 'Registro'}`);

    const nomeInput = new TextInputBuilder()
      .setCustomId('nome_ic')
      .setLabel('NOME COMPLETO IC (PERSONAGEM)')
      .setPlaceholder('Ex: Bruno Souza')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const passaporteInput = new TextInputBuilder()
      .setCustomId('passaporte')
      .setLabel('ID / PASSAPORTE NA CIDADE')
      .setPlaceholder('Ex: 1054')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const telefoneInput = new TextInputBuilder()
      .setCustomId('telefone')
      .setLabel('NÚMERO DE TELEFONE IN-GAME')
      .setPlaceholder('Ex: 555-019')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const recrutadorInput = new TextInputBuilder()
      .setCustomId('recrutador')
      .setLabel('QUEM TE RECRUTOU OU SEU LÍDER?')
      .setPlaceholder('Ex: Marcos Hunters')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(nomeInput),
      new ActionRowBuilder().addComponents(passaporteInput),
      new ActionRowBuilder().addComponents(telefoneInput),
      new ActionRowBuilder().addComponents(recrutadorInput)
    );

    return interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('sigio_modal_')) {
    const grupoId = interaction.customId.replace('sigio_modal_', '');
    const grupo = CONFIG.grupos.find(g => g.id === grupoId) || { name: 'Membro', tag: '[Membro]' };

    const nome = interaction.fields.getTextInputValue('nome_ic').trim();
    const passaporte = interaction.fields.getTextInputValue('passaporte').trim();
    const telefone = interaction.fields.getTextInputValue('telefone').trim();
    const recrutador = interaction.fields.getTextInputValue('recrutador').trim();

    const respostasConcatenadas = `${nome} ${passaporte} ${telefone} ${recrutador}`.toLowerCase();
    const palavraTrollEncontrada = CONFIG.antiTrollKeywords.find(kw => respostasConcatenadas.includes(kw));

    if (palavraTrollEncontrada) {
      return interaction.reply({
        content: `❌ **REGISTRO RECUSADO PELO FILTRO ANTI-TROLL!**\nSua resposta contém termos inválidos ou brincadeiras ("${palavraTrollEncontrada}"). Por favor, preencha seus dados reais da cidade.`,
        ephemeral: true
      });
    }

    const novoNick = `${grupo.tag} ${nome} | ${passaporte}`;
    const member = interaction.member;

    try {
      if (member.manageable) {
        await member.setNickname(novoNick);
      }
      if (grupo.roleId && grupo.roleId !== "123456789012345678") {
        await member.roles.add(grupo.roleId);
      }
    } catch (err) {
      console.error("Erro ao alterar nickname ou cargos do membro:", err);
    }

    await interaction.reply({
      content: `✅ **SEU REGISTRO SIGIO FOI APROVADO COM SUCESSO!**\n
👤 **Nome Setado:** `${novoNick}`\n🏷️ **Grupo:** ${grupo.name}\n📞 **Telefone:** ${telefone}\n👮 **Recrutador:** ${recrutador}`,
      ephemeral: true
    });

    const logChannel = interaction.guild.channels.cache.get(CONFIG.channels.logRegistros);
    if (logChannel) {
      const embedLog = new EmbedBuilder()
        .setTitle("📑 NOVO REGISTRO SIGIO APROVADO")
        .setColor("#10B981")
        .addFields(
          { name: "👤 Usuário", value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
          { name: "🏷️ Grupo", value: grupo.name, inline: true },
          { name: "🆔 Nick Setado", value: ```${novoNick}``` },
          { name: "📞 Telefone", value: telefone, inline: true },
          { name: "👮 Recrutador", value: recrutador, inline: true }
        )
        .setTimestamp();

      logChannel.send({ embeds: [embedLog] }).catch(console.error);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
