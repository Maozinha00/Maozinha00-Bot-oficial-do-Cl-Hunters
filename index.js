import { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  StringSelectMenuBuilder, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  Events 
} from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const CONFIG = {
  token: process.env.DISCORD_TOKEN || "",
  guildId: process.env.DISCORD_GUILD_ID || "",
  
  // Canais
  canalRegistroId: process.env.CANAL_REGISTRO_ID || "",
  canalAprovacaoId: process.env.CANAL_APROVACAO_ID || "",
  canalBoasVindasId: process.env.CANAL_BOAS_VINDAS_ID || "",
  canalEntradaSaidaId: process.env.CANAL_ENTRADA_SAIDA_ID || "",
  canalLogsSetId: process.env.CANAL_LOGS_SET_ID || "",
  canalAusenciaLogsId: process.env.CANAL_AUSENCIA_LOGS_ID || "",

  // Aparência
  embedColor: "#2ECC71",
  embedColorAusencia: "#E67E22",
  footer: "Hunters FiveZ & Família Souza © 2026",

  // Mensagens
  regrasTexto: "1. Respeite a hierarquia e os companheiros de clã.\n2. Inatividade máxima permitida: 3 dias sem justificativa.\n3. Use a Tag oficial e o Apelido formatado obrigatoriamente.\n4. Proibido RDM, VDM, Anti-Jogo ou quebra de RP nas cidades (FiveZ / Lumenfall).",
  regrasLink: "https://fivez.gitbook.io/fivez-regras",
  perguntaRegrasCincoZ: "O que é RDM, VDM e Amor à Vida na Cidade?",
  perguntaInatividadecincoZ: "Ciente de SafeZone, Anti-Jogo e Inatividade?",
  prazoRegistroDias: 3,

  // Cargos / Grupos
  grupos: [
    {
      id: "hunters",
      name: "Hunters FiveZ (Recruta)",
      roleId: process.env.ROLE_HUNTERS_ID || "1000000000000000001",
      tag: "| HTR ",
      description: "Recruta oficial do Clã Hunters na cidade FiveZ",
      emoji: "🏹"
    },
    {
      id: "souza",
      name: "Família Souza (Lumenfall)",
      roleId: process.env.ROLE_SOUZA_ID || "1000000000000000002",
      tag: "| SOUZA ",
      description: "Membro da Família Souza na cidade Lumenfall",
      emoji: "🔱"
    }
  ]
};

function formatarApelido(tag, nome, idJogo) {
  let tagLimpa = tag.trim();
  if (!tagLimpa.startsWith("|")) tagLimpa = "|" + tagLimpa;
  if (!tagLimpa.endsWith("|")) tagLimpa = tagLimpa + "|";
  return `${tagLimpa} ${nome} | ${idJogo}`;
}

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

client.once(Events.ClientReady, (c) => {
  console.log(`✅ Bot conectado como: ${c.user.tag}`);
});

// 1. Boas-vindas e Envio de Regras no PV
client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const embedPV = new EmbedBuilder()
      .setColor(CONFIG.embedColor)
      .setTitle("📜 REGRAS OBRIGATÓRIAS - CLÃ HUNTERS & FAMÍLIA SOUZA")
      .setDescription(`Olá <@${member.id}>!\n\n${CONFIG.regrasTexto}\n\n📖 **Livro Oficial de Regras FiveZ:** ${CONFIG.regrasLink}\n\n**Confirme a leitura no botão abaixo:**`)
      .setFooter({ text: CONFIG.footer });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("btn_confirmar_regras_pv")
        .setLabel("Li e Aceito as Regras")
        .setStyle(ButtonStyle.Success)
    );

    await member.send({ embeds: [embedPV], components: [row] });
  } catch (err) {
    console.log(`PV fechado para ${member.user.tag}`);
  }

  const canal = member.guild.channels.cache.get(CONFIG.canalEntradaSaidaId);
  if (canal && canal.isTextBased()) {
    await canal.send({
      content: `👋 Bem-vindo <@${member.id}>! Leia as regras enviadas no seu PV e faça seu registro em <#${CONFIG.canalRegistroId}>!`
    });
  }
});

// 2. Comandos de Texto (!painel, !ausencia, !regras)
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  if (message.content === '!painel') {
    const embed = new EmbedBuilder()
      .setColor(CONFIG.embedColor)
      .setTitle("🏹 REGISTRO OFICIAL - CLÃ HUNTERS & FAMÍLIA SOUZA")
      .setDescription("Seja bem-vindo ao Discord Oficial!\n\nClique no botão abaixo para preencher o formulário de recrutamento.")
      .setFooter({ text: CONFIG.footer });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("btn_iniciar_registro")
        .setLabel("Iniciar Registro")
        .setStyle(ButtonStyle.Success)
    );

    await message.channel.send({ embeds: [embed], components: [row] });
  }

  if (message.content === '!ausencia') {
    const embedAusencia = new EmbedBuilder()
      .setColor(CONFIG.embedColorAusencia)
      .setTitle("🌴 REGISTRO DE AUSÊNCIA / INATIVIDADE")
      .setDescription("Vai se ausentar das atividades do clã ou da cidade?\nClique no botão abaixo para justificar seu prazo e evitar a remoção do clã.")
      .setFooter({ text: CONFIG.footer });

    const rowAusencia = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("btn_registrar_ausencia")
        .setLabel("Registrar Ausência")
        .setStyle(ButtonStyle.Secondary)
    );

    await message.channel.send({ embeds: [embedAusencia], components: [rowAusencia] });
  }
});

// 3. Interações (Botões, Menus e Modais)
client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton() && interaction.customId === 'btn_confirmar_regras_pv') {
    confirmacoesRegras.set(interaction.user.id, true);
    return interaction.reply({ content: "✅ Regras confirmadas!", ephemeral: true });
  }

  if (interaction.isButton() && interaction.customId === 'btn_iniciar_registro') {
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_grupo')
      .setPlaceholder('Escolha seu grupo...')
      .addOptions(CONFIG.grupos.map(g => ({
        label: g.name,
        value: g.roleId,
        emoji: g.emoji || '🎯',
        description: g.description.substring(0, 50)
      })));

    return interaction.reply({ 
      content: "Selecione seu grupo abaixo. Lembre-se de aceitar as regras enviadas no seu PV!", 
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

    const lblRegras = (CONFIG.perguntaRegrasCincoZ || 'O que é RDM, VDM e Amor à Vida na Cidade?').substring(0, 45);
    const lblInat = (CONFIG.perguntaInatividadecincoZ || 'Ciente de SafeZone, Anti-Jogo e Inatividade?').substring(0, 45);

    modal.addComponents(
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nome').setLabel('Nome no Jogo').setStyle(TextInputStyle.Short).setRequired(true)),
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('id_jogo').setLabel('ID no Jogo').setStyle(TextInputStyle.Short).setRequired(true)),
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('recrutador').setLabel('Quem te recrutou?').setStyle(TextInputStyle.Short).setRequired(true)),
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('regras_fivez').setLabel(lblRegras).setPlaceholder('Ex: RDM = matar sem RP, VDM = carro como arma, Amor à vida = se render').setStyle(TextInputStyle.Short).setRequired(true)),
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('regras_inatividade').setLabel(lblInat).setPlaceholder('Ex: Sim, ciente das regras de SafeZone, Anti-Jogo e prazo 3d').setStyle(TextInputStyle.Short).setRequired(true))
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
    return interaction.reply({ content: "✅ Sua ausência foi informada para a Staff com sucesso!", ephemeral: true });
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_reg_')) {
    const roleId = interaction.customId.replace('modal_reg_', '');
    const grupo = CONFIG.grupos.find(g => g.roleId === roleId) || { name: "Recruta", tag: "|Recruta|" };
    const nome = interaction.fields.getTextInputValue('nome');
    const idJogo = interaction.fields.getTextInputValue('id_jogo');
    const recrutador = interaction.fields.getTextInputValue('recrutador');
    let respRegras = interaction.fields.getTextInputValue('regras_fivez');
    let respInat = interaction.fields.getTextInputValue('regras_inatividade');

    const confirmado = confirmacoesRegras.get(interaction.user.id) ? "✅ Sim (PV)" : "❌ Não (PV)";
    const nickFormatado = formatarApelido(grupo.tag, nome, idJogo);

    const embedStaff = new EmbedBuilder()
      .setTitle('📩 Novo Pedido de Set')
      .setColor('#F1C40F')
      .addFields(
        { name: 'Membro', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Grupo', value: grupo.name, inline: true },
        { name: 'Confirmou Regras PV?', value: confirmado },
        { name: 'Nome | ID no Jogo', value: `${nome} | ${idJogo}` },
        { name: 'Recrutador', value: recrutador, inline: true },
        { name: '📖 Resposta RP / Regras', value: respRegras },
        { name: '⚠️ SafeZone / Anti-Jogo / Inatividade', value: respInat },
        { name: 'Apelido Previsto', value: `${nickFormatado}` }
      )
      .setFooter({ text: CONFIG.footer });

    const botoes = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`aprovar_${interaction.user.id}_${roleId}`).setLabel('Aprovar').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`recusar_${interaction.user.id}`).setLabel('Recusar').setStyle(ButtonStyle.Danger)
    );

    const canalAprov = client.channels.cache.get(CONFIG.canalAprovacaoId);
    if (canalAprov && canalAprov.isTextBased()) await canalAprov.send({ embeds: [embedStaff], components: [botoes] });

    return interaction.reply({ 
      content: `✅ Registro enviado com sucesso! Aguarde a aprovação da Staff no canal de aprovação.`, 
      ephemeral: true 
    });
  }

  // Aprovação
  if (interaction.isButton() && interaction.customId.startsWith('aprovar_')) {
    const [, userId, roleId] = interaction.customId.split('_');
    const guild = interaction.guild;
    const member = await guild.members.fetch(userId).catch(() => null);

    if (!member) return interaction.reply({ content: "❌ Membro não encontrado no servidor.", ephemeral: true });

    const embedOrig = interaction.message.embeds[0];
    const fieldNick = embedOrig.fields.find(f => f.name === 'Apelido Previsto');
    const novoNick = fieldNick ? fieldNick.value : member.displayName;

    try {
      await member.roles.add(roleId);
      await member.setNickname(novoNick).catch(() => console.log('Sem permissão para alterar apelido'));

      const embedAprovado = EmbedBuilder.from(embedOrig)
        .setColor('#2ECC71')
        .setTitle('✅ Registro APROVADO')
        .addFields({ name: 'Aprovado por', value: `<@${interaction.user.id}>` });

      await interaction.update({ embeds: [embedAprovado], components: [] });

      const canalLogs = guild.channels.cache.get(CONFIG.canalLogsSetId);
      if (canalLogs && canalLogs.isTextBased()) {
        await canalLogs.send({ content: `🎉 **SET APLICADO:** <@${userId}> recebeu o cargo e teve seu apelido alterado para \`${novoNick}\` por <@${interaction.user.id}>.` });
      }

      await member.send({ content: `🎉 Parabéns! Seu registro no clã foi **APROVADO**. Seu apelido foi formatado para: \`${novoNick}\`.` }).catch(() => {});
    } catch (err) {
      await interaction.reply({ content: `❌ Erro ao aplicar cargo/apelido: ${err.message}`, ephemeral: true });
    }
  }

  // Recusa
  if (interaction.isButton() && interaction.customId.startsWith('recusar_')) {
    const [, userId] = interaction.customId.split('_');
    const guild = interaction.guild;
    const member = await guild.members.fetch(userId).catch(() => null);

    const embedOrig = interaction.message.embeds[0];
    const embedRecusado = EmbedBuilder.from(embedOrig)
      .setColor('#E74C3C')
      .setTitle('❌ Registro RECUSADO')
      .addFields({ name: 'Recusado por', value: `<@${interaction.user.id}>` });

    await interaction.update({ embeds: [embedRecusado], components: [] });

    if (member) {
      await member.send({ content: `❌ Seu pedido de registro no clã foi **RECUSADO**. Entre em contato com a Staff.` }).catch(() => {});
    }
  }
});

client.login(CONFIG.token);
