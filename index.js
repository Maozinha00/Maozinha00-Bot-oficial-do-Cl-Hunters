/**
 * ============================================================================
 * HUNTERS BOT! - BOT OFICIAL DE ENTRADA, SAÍDA, REGISTRO & AUSÊNCIAS
 * FAMÍLIA SOUZA & CLÃ HUNTERS
 * DISCORD.JS V14 - ES MODULES (import)
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
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN || "OTk4ODM3MTIxOTkwMTIzNDU2.GzX123.DiscordBotTokenOriginal";
const PORT = process.env.PORT || 3000;

const CONFIG = {
    "token": TOKEN,
    "botName": "HUNTERS BOT!",
    "botAvatarUrl": "https://i.imgur.com/0iMBT5C.jpeg",
    "canalRegistroId": "123456789012345679",
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
    "embedColorSaida": "#E74C3C",
    "authorName": "👑 Família Souza 👑",
    "authorSub": "🏡 Família Souza — Entrada & Registro",
    "footer": "Família Souza • Entrada - Boas-vindas",
    "footerSaida": "Família Souza • Saída - Registrado",
    "tituloPainel": "Seja bem-vindo à nossa Comunidade!",
    "descricaoPainel": "📢 **AVISO IMPORTANTE PARA TODOS (@everyone):**\n> ⚠️ **PRAZO LIMITE DE REGISTRO:** Todo membro que entrar no servidor tem um prazo máximo de **3 dias** para realizar o registro.\n> 🚫 Caso contrário, será removido automaticamente!\n\nPara desbloquear os canais, escolha seu grupo abaixo.",
    "tituloPainelAusencia": "🌴 Painel de Registro de Ausência",
    "descricaoPainelAusencia": "📢 **REGISTRO DE AUSÊNCIA & FOLGA**\nPreencha com o motivo e previsão de retorno.",
    "regrasTexto": `# 📜 REGRAS OFICIAIS • CLÃ HUNTERS & FAMÍLIA SOUZA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ⚔️ 1. Respeito
Respeite todos os membros do clã, aliados, adversários e a liderança.

## 👑 2. Respeite a Hierarquia
As decisões da liderança devem ser respeitadas.

## 🦺 3. Uniforme Obrigatório
É obrigatório utilizar o Preset Hunters durante ações e eventos.

## 📻 4. Rádio Oficial
É obrigatório permanecer na rádio 633 durante todas as atividades.

## 🐺 5. Prioridade ao Clã
Sempre que houver QRR, a convocação deve ser sua prioridade.

## 📅 9. Regra de Ausência
Ficar 3 dias sem justificar ausência resulta em remoção.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    "regrasLink": "https://fivez.gitbook.io/fivez-regras",
    "perguntaRegrasCincoZ": "O que é RDM, VDM e Amor à Vida na Cidade?",
    "perguntaInatividadecincoZ": "Ciente de SafeZone, Anti-Jogo e Inatividade?",
    "cargoCidadaoGeralId": "123456789012345691",
    "cargoNaoRegistradoId": "123456789012345692",
    "prazoRegistroDias": 3,
    "autoReprovarRespostasInvalidas": true,
    "grupos": [
        {
                "id": "grupo_hunters_membro",
                "name": "Membro Hunters",
                "roleId": "1527848364496912404",
                "tag": "[Hunters]",
                "description": "Membro oficial do Clã Hunters",
                "emoji": "🐺"
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
                "id": "grupo_souza_membro",
                "name": "Família Souza",
                "roleId": "1515125826780135485",
                "tag": "[Souza]",
                "description": "Membro da Família Souza",
                "emoji": "⚜️"
        },
        {
                "id": "grupo_cidadao_cincoz",
                "name": "Cidadão FiveZ",
                "roleId": "1528075981078663259",
                "tag": "[Cidadão]",
                "description": "Nome temporário antes de ser aprovado",
                "emoji": "🏙️"
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

// Validation function against quick troll answers (e.g., '.', 'não sei')
function eRespostaValida(texto) {
    if (!texto || typeof texto !== 'string') return false;
    const limpo = texto.trim().toLowerCase();
    if (limpo.length < 5) return false;
    
    const invalidas = [
        '.', ',', '..', '...', '?', '!', '-', 'a', 'x', 'n', 'no',
        'nao', 'não', 'nao sei', 'não sei', 'num sei', 'nem sei', 'sei nao', 'sei não',
        'sei la', 'sei lá', 'slk', 'fodase', 'foda-se', 'nada', 'nenhum', 'qualquer'
    ];
    if (invalidas.includes(limpo)) return false;
    if (/^[.,!?;:\-_\s]+$/.test(limpo)) return false;
    return true;
}

function formatarApelido(tag, nome, id) {
    let nick = (tag + " " + nome + " | " + id).trim();
    return nick.length > 32 ? nick.substring(0, 29) + "..." : nick;
}

// ----------------------------------------------------------------------------
// EVENTO: Entrada de Membro (GuildMemberAdd) - Mensagem SIGIO Visual
// ----------------------------------------------------------------------------
client.on(Events.GuildMemberAdd, async (member) => {
    const canal = member.guild.channels.cache.get(CONFIG.canalEntradaSaidaId);
    if (!canal || !canal.isTextBased()) return;

    const membros = member.guild.memberCount;
    const mainText = `Olá {user}, você acaba de entrar em {organizacao}.
Estamos felices em ter você por aqui.`
        .replace(/\{user\}/g, `<@${member.user.id}>`)
        .replace(/\{username\}/g, member.user.username)
        .replace(/\{organizacao\}/g, "Família Souza")
        .replace(/\{servidor\}/g, member.guild.name)
        .replace(/\{membros\}/g, membros);

    const subText = "Acesse o canal para acompanhar informações, solicitações e recursos da organização.";

    const content = `👋 **Seja bem-vindo(a)!**\n\n${mainText}\n${subText}`;

    const embed = new EmbedBuilder()
        .setColor("#2ECC71")
        .setTitle("👥 Boas-vindas")
        .addFields(
            { name: '', value: `<@${member.user.id}>`, inline: false },
            { name: 'Organização', value: "Família Souza", inline: true },
            { name: 'Servidor', value: "Família Souza", inline: true },
            { name: 'Membros', value: `${membros}`, inline: true }
        )
        .setImage("https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80")
        .setFooter({ text: CONFIG.footer });

    const btn = new ButtonBuilder()
        .setLabel("Acessar Regras")
        .setStyle(ButtonStyle.Link)
        .setURL("https://fivez.gitbook.io/fivez-regras");
    if ("🔑") {
        btn.setEmoji("🔑");
    }

    const row = new ActionRowBuilder().addComponents(btn);

    await canal.send({ content, embeds: [embed], components: [row] });
});

// ----------------------------------------------------------------------------
// EVENTO: Saída de Membro (GuildMemberRemove) - Mensagem SIGIO
// ----------------------------------------------------------------------------
client.on(Events.GuildMemberRemove, async (member) => {
    const canal = member.guild.channels.cache.get(CONFIG.canalEntradaSaidaId);
    if (!canal || !canal.isTextBased()) return;

    const mainText = `O membro {user} acabou de sair de {organizacao}.`
        .replace(/\{user\}/g, `**${member.user.username}**`)
        .replace(/\{organizacao\}/g, "Família Souza");

    const content = `👋 **Saída de Membro**\n\n${mainText}\nEsperamos que tenha uma boa jornada. As permissões no servidor foram revogadas.`;

    const embed = new EmbedBuilder()
        .setColor("#E74C3C")
        .setTitle("🚪 Saída Registrada")
        .addFields(
            { name: 'Membro Saiu', value: `**${member.user.username}** (${member.user.id})`, inline: false },
            { name: 'Organização', value: "Família Souza", inline: true },
            { name: 'Servidor', value: "Família Souza", inline: true }
        )
        .setImage("https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80")
        .setFooter({ text: CONFIG.footerSaida });

    await canal.send({ content, embeds: [embed] });
});

// HTTP Express Server Keep-Alive
const app = express();
app.get('/', (req, res) => res.send('🤖 Bot SIGIO Online!'));
app.listen(PORT, () => console.log("🌐 Server HTTP rodando na porta " + PORT));

client.once(Events.ClientReady, (c) => {
    console.log("✅ Bot SIGIO Online como " + c.user.tag);
});

client.login(TOKEN);
