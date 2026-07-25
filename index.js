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
  Events
} from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

// CONFIGURAÇÃO OFICIAL DO BOT FIVEZ & LUMENFALL
export const CONFIG = {
  token: process.env.DISCORD_TOKEN || process.env.TOKEN || process.env.DISCORD_BOT_TOKEN || process.env.BOT_TOKEN || "",
  clientId: process.env.CLIENT_ID || "1493598260546375881",
  guildId: process.env.GUILD_ID || "1456655598031601727",
  canalRegistroId: process.env.CANAL_REGISTRO_ID || "1515448138385592361",
  canalAprovacaoId: process.env.CANAL_APROVACAO_ID || "1515448473246498866",
  canalLogsId: process.env.CANAL_LOGS_ID || "1525000000000000000",
  canalEntradaSaidaId: process.env.CANAL_ENTRADA_SAIDA_ID || "1524222632923496509",
  cargoAmigosId: process.env.CARGO_AMIGOS_ID || "1515125842328424640",
  cargoHuntersRecrutaId: process.env.CARGO_HUNTERS_RECRUTA_ID || "1515125826780135485",
  cargosAdminsAprovadores: [
    "1515125820836941985",
    "1515125822795546715"
  ],
  embedColor: "#2ECC71",
  colorHunters: "#8E44AD",
  footer: "FiveZ & Lumenfall • Sistema Automático Anti-Queda",
  formatoApelido: "{TAG} {NOME} | {ID}",
  grupos: [
    {
      id: "grupo_souza",
      name: "Família Souza",
      roleId: "1515125828185493675",
      emoji: "❤️",
      tag: "|Souza|",
      description: "Membros oficiais da Família Souza"
    },
    {
      id: "grupo_hunters",
      name: "Hunters FiveZ",
      roleId: "1515125826780135485",
      emoji: "🎯",
      tag: "|Recruta|",
      description: "Caçadores de elite Hunters FiveZ (Recruta)"
    },
    {
      id: "grupo_comprador",
      name: "Comprador FiveZ",
      roleId: "1517662363266842725",
      emoji: "🛒",
      tag: "|CPD| FiveZ",
      description: "Compradores oficiais FiveZ"
    },
    {
      id: "grupo_amigos",
      name: "Amigos",
      roleId: "1515125842328424640",
      emoji: "🤝",
      tag: "|AMG|",
      description: "Cargo inicial de entrada, Amigos e Visitantes"
    }
  ]
};

// Express Keep-Alive 24/7
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🟢 Bot FiveZ & Lumenfall Keep-Alive 24/7!');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    botOnline: Boolean(client?.user),
    userTag: client?.user?.tag || null,
    uptime: process.uptime()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 [HTTP SERVER] Keep-Alive rodando na porta ${PORT}`);
});

// Discord Client Setup
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

function formatarApelido(tag, nome, id) {
  let nick = `${tag} ${nome} | ${id}`.trim();
  if (nick.length > 32) {
    const extra = tag.length + id.length + 4;
    const maxNome = Math.max(1, 32 - extra);
    nick = `${tag} ${nome.substring(0, maxNome)} | ${id}`.trim();
  }
  return nick.substring(0, 32);
}

// ANTI-CRASH SYSTEM
process.on('unhandledRejection', (reason) => {
  console.error('[ANTI-CRASH] Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[ANTI-CRASH] Uncaught Exception:', err);
});

client.once(Events.ClientReady, (c) => {
  console.log(`✅ [FIVEZ BOT ONLINE] Logado como ${c.user.tag}`);
});

// Entrada de Membro
client.on(Events.GuildMemberAdd, async (member) => {
  try {
    if (CONFIG.cargoAmigosId) {
      await member.roles.add(CONFIG.cargoAmigosId).catch(() => {});
    }
    if (CONFIG.canalEntradaSaidaId) {
      const channel = member.guild.channels.cache.get(CONFIG.canalEntradaSaidaId) ||
        await member.guild.channels.fetch(CONFIG.canalEntradaSaidaId).catch(() => null);
      if (channel && channel.isTextBased()) {
        const embed = new EmbedBuilder()
          .setColor(CONFIG.embedColor)
          .setTitle('🚪 NOVO MORADOR CHEGOU NA CIDADE!')
          .setDescription(`Bem-vindo(a) <@${member.id}> ao servidor!\n\n> 📝 Por favor, vá até <#${CONFIG.canalRegistroId}> para fazer seu registro.`)
          .setThumbnail(member.user.displayAvatarURL())
          .setFooter({ text: CONFIG.footer })
          .setTimestamp();
        await channel.send({ content: `<@${member.id}>`, embeds: [embed] }).catch(() => {});
      }
    }
  } catch (err) {
    console.error('Erro no GuildMemberAdd:', err);
  }
});

// Saída de Membro
client.on(Events.GuildMemberRemove, async (member) => {
  try {
    if (CONFIG.canalEntradaSaidaId) {
      const channel = member.guild.channels.cache.get(CONFIG.canalEntradaSaidaId) ||
        await member.guild.channels.fetch(CONFIG.canalEntradaSaidaId).catch(() => null);
      if (channel && channel.isTextBased()) {
        const embed = new EmbedBuilder()
          .setColor('#E74C3C')
          .setTitle('🚪 UM MORADOR SAIU DA CIDADE')
          .setDescription(`O membro **${member.user.tag}** (<@${member.id}>) saiu do servidor.`)
          .setThumbnail(member.user.displayAvatarURL())
          .setFooter({ text: CONFIG.footer })
          .setTimestamp();
        await channel.send({ embeds: [embed] }).catch(() => {});
      }
    }
  } catch (err) {
    console.error('Erro no GuildMemberRemove:', err);
  }
});

// Interações Botões & Modais
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isButton()) {
      if (interaction.customId === 'iniciar_registro') {
        const select = new StringSelectMenuBuilder()
          .setCustomId('select_grupo_registro')
          .setPlaceholder('Selecione seu Grupo / Família...');

        CONFIG.grupos.forEach(g => {
          select.addOptions({
            label: g.name,
            value: g.id,
            description: g.description,
            emoji: g.emoji
          });
        });

        const row = new ActionRowBuilder().addComponents(select);
        await interaction.reply({
          content: '👇 **Escolha abaixo qual grupo você pertence:**',
          components: [row],
          ephemeral: true
        });
      }

      if (interaction.customId.startsWith('aprovar_') || interaction.customId.startsWith('rejeitar_')) {
        const isApprove = interaction.customId.startsWith('aprovar_');
        const [action, userId, grupoId] = interaction.customId.split('_');

        const memberAprovador = interaction.member;
        const temPermissao = CONFIG.cargosAdminsAprovadores.some(roleId => memberAprovador?.roles?.cache?.has(roleId));

        if (!temPermissao) {
          return interaction.reply({ content: '❌ Você não tem permissão para aprovar registros.', ephemeral: true });
        }

        const targetMember = await interaction.guild.members.fetch(userId).catch(() => null);
        const grupo = CONFIG.grupos.find(g => g.id === grupoId);

        if (isApprove) {
          if (targetMember && grupo) {
            await targetMember.roles.add(grupo.roleId).catch(() => {});
            if (CONFIG.cargoAmigosId) await targetMember.roles.remove(CONFIG.cargoAmigosId).catch(() => {});
          }

          const embedUpdated = EmbedBuilder.from(interaction.message.embeds[0])
            .setColor('#2ECC71')
            .setTitle('✅ REGISTRO APROVADO!')
            .setFooter({ text: `Aprovado por ${interaction.user.tag}` });

          await interaction.update({ embeds: [embedUpdated], components: [] });
          if (targetMember) {
            await targetMember.send(`🎉 Seus dados foram **APROVADOS** no servidor FiveZ! Seja bem-vindo(a)!`).catch(() => {});
          }
        } else {
          const embedUpdated = EmbedBuilder.from(interaction.message.embeds[0])
            .setColor('#E74C3C')
            .setTitle('❌ REGISTRO REJEITADO')
            .setFooter({ text: `Rejeitado por ${interaction.user.tag}` });

          await interaction.update({ embeds: [embedUpdated], components: [] });
          if (targetMember) {
            await targetMember.send(`❌ Seu registro foi **REJEITADO**. Entre em contato com a equipe de suporte.`).catch(() => {});
          }
        }
      }
    }

    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'select_grupo_registro') {
        const grupoId = interaction.values[0];
        const modal = new ModalBuilder()
          .setCustomId(`modal_registro_${grupoId}`)
          .setTitle('📝 Formulário de Registro FiveZ');

        const inputNome = new TextInputBuilder()
          .setCustomId('nome_ic')
          .setLabel('Nome no Personagem (IC):')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Ex: Gabriel Souza')
          .setRequired(true);

        const inputId = new TextInputBuilder()
          .setCustomId('id_cidade')
          .setLabel('ID da Cidade (Passaporte):')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Ex: 1024')
          .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder().addComponents(inputNome),
          new ActionRowBuilder().addComponents(inputId)
        );

        await interaction.showModal(modal);
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith('modal_registro_')) {
        const grupoId = interaction.customId.replace('modal_registro_', '');
        const nome = interaction.fields.getTextInputValue('nome_ic').trim();
        const idCidade = interaction.fields.getTextInputValue('id_cidade').trim();
        const grupo = CONFIG.grupos.find(g => g.id === grupoId);

        if (!grupo) return interaction.reply({ content: '❌ Grupo inválido.', ephemeral: true });

        const apelidoFormatado = formatarApelido(grupo.tag, nome, idCidade);
        await interaction.member.setNickname(apelidoFormatado).catch(() => {});

        const canalAprovacao = interaction.guild.channels.cache.get(CONFIG.canalAprovacaoId);
        if (canalAprovacao) {
          const embedAprovacao = new EmbedBuilder()
            .setColor(CONFIG.embedColor)
            .setTitle('📋 NOVO REGISTRO PARA APROVAÇÃO')
            .setThumbnail(interaction.user.displayAvatarURL())
            .addFields(
              { name: '👤 Usuário Discord:', value: `<@${interaction.user.id}> (${interaction.user.tag})`, inline: true },
              { name: '🆔 ID Discord:', value: `\`${interaction.user.id}\``, inline: true },
              { name: '🎭 Nome IC:', value: `\`${nome}\``, inline: true },
              { name: '🪪 ID Cidade:', value: `\`${idCidade}\``, inline: true },
              { name: '🏷️ Grupo Solicitado:', value: `${grupo.emoji} **${grupo.name}**`, inline: true },
              { name: '🏷️ Apelido Gerado:', value: `\`${apelidoFormatado}\``, inline: false }
            )
            .setTimestamp();

          const btnAprovar = new ButtonBuilder()
            .setCustomId(`aprovar_${interaction.user.id}_${grupo.id}`)
            .setLabel('Aprovar')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅');

          const btnRejeitar = new ButtonBuilder()
            .setCustomId(`rejeitar_${interaction.user.id}_${grupo.id}`)
            .setLabel('Rejeitar')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('❌');

          const row = new ActionRowBuilder().addComponents(btnAprovar, btnRejeitar);

          await canalAprovacao.send({ embeds: [embedAprovacao], components: [row] });
        }

        await interaction.reply({
          content: '✅ **Seu formulário foi enviado com sucesso!** Aguarde a aprovação de um Administrador.',
          ephemeral: true
        });
      }
    }
  } catch (err) {
    console.error('Erro na interacao:', err);
  }
});

// Inicialização
if (CONFIG.token && CONFIG.token.length > 20 && !CONFIG.token.includes("SEU_TOKEN") && !CONFIG.token.includes("....")) {
  client.login(CONFIG.token).catch(err => {
    console.error("❌ Erro ao logar bot no Discord:", err.message);
    if (err.message.includes("invalid token") || err.message.includes("An invalid token")) {
      console.log("👉 Por favor, defina a variável DISCORD_TOKEN com um Token válido do Discord Developer Portal.");
    }
  });
} else {
  console.log("⚠️ Token do bot não configurado em index.js. Insira seu token nas variáveis de ambiente (DISCORD_TOKEN).");
}
