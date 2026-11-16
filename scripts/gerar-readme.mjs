// Gera o README do perfil no estilo "neofetch".
// Roda sozinho todo dia pela GitHub Action (.github/workflows/atualizar.yml)
// e também pode rodar no PC: node scripts/gerar-readme.mjs
import fs from 'node:fs';

const USUARIO = 'DevPdrovisky';
const LARGURA = 58; // largura da ficha da direita

// ---------- arte da esquerda (arte.txt, em pontinhos) ----------
const arte = fs.readFileSync(new URL('../arte.txt', import.meta.url), 'utf8').replace(/\r/g, '').split('\n').filter((l, i, t) => i < t.length - 1 || l);

// ---------- busca os números de verdade no GitHub ----------
async function api(caminho) {
  const cab = { 'User-Agent': 'perfil-readme', Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) cab.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const r = await fetch(`https://api.github.com${caminho}`, { headers: cab });
  if (!r.ok) throw new Error(`${caminho}: ${r.status}`);
  return r.json();
}

function tempoDesde(data) {
  const ini = new Date(data), hoje = new Date();
  let anos = hoje.getFullYear() - ini.getFullYear();
  let meses = hoje.getMonth() - ini.getMonth();
  let dias = hoje.getDate() - ini.getDate();
  if (dias < 0) { meses--; dias += new Date(hoje.getFullYear(), hoje.getMonth(), 0).getDate(); }
  if (meses < 0) { anos--; meses += 12; }
  const p = [];
  if (anos) p.push(`${anos} ${anos === 1 ? 'ano' : 'anos'}`);
  if (meses) p.push(`${meses} ${meses === 1 ? 'mês' : 'meses'}`);
  p.push(`${dias} ${dias === 1 ? 'dia' : 'dias'}`);
  return p.join(', ');
}

let u = {}, commits = null, estrelas = null;
try { u = await api(`/users/${USUARIO}`); } catch (e) { console.error(e.message); }
try { commits = (await api(`/search/commits?q=author:${USUARIO}&per_page=1`)).total_count; } catch (e) { console.error(e.message); }
try {
  const repos = await api(`/users/${USUARIO}/repos?per_page=100&type=owner`);
  estrelas = repos.reduce((s, r) => s + r.stargazers_count, 0);
} catch (e) { console.error(e.message); }
const n = (v) => (v === null || v === undefined ? '—' : String(v));

// ---------- ficha da direita ----------
const linha = (rotulo, valor) => {
  const pontos = LARGURA - rotulo.length - valor.length - 4;
  return `. ${rotulo} ${'.'.repeat(Math.max(pontos, 1))} ${valor}`;
};
const titulo = (t) => `- ${t} ${'─'.repeat(Math.max(LARGURA - t.length - 3, 1))}`;
const dupla = (r1, v1, r2, v2) => {
  const a = `. ${r1} ${'.'.repeat(Math.max(24 - r1.length - v1.length, 1))} ${v1}`;
  const b = `${r2} ${'.'.repeat(Math.max(LARGURA - a.length - 3 - r2.length - v2.length - 2, 1))} ${v2}`;
  return `${a} | ${b}`;
};

const ficha = [
  `${USUARIO}@github ${'─'.repeat(LARGURA - USUARIO.length - 8)}`,
  linha('OS:', 'Windows'),
  linha('Uptime:', u.created_at ? tempoDesde(u.created_at) : '—'),
  linha('Host:', 'Vorkeza Digital'),
  linha('Kernel:', 'Front-end'),
  '.',
  linha('Languages.Programming:', 'HTML, CSS, JavaScript, TS'),
  linha('Languages.Web:', 'Next.js, Cloudflare Pages'),
  linha('Languages.Real:', 'Português'),
  linha('Skills.Extra:', 'Design, Vídeo, Marketing'),
  '.',
  linha('Projects.Agency:', 'Vorkeza Digital'),
  linha('Projects.Brands:', 'Vitrine Motor, Vitrine Imóvel'),
  linha('', 'Bem no Mapa, Boca a Boca'),
  linha('Projects.SaaS:', 'Fornada'),
  linha('Projects.WIP:', 'Inventário Tech'),
  '.',
  linha('Hobbies.Offline:', 'Games, animes, séries'),
  linha('Hobbies.Audio:', 'Música o dia inteiro'),
  '',
  titulo('Contact'),
  linha('Website:', 'vorkeza.com.br'),
  linha('Location:', 'Brasil'),
  '',
  titulo('GitHub Stats'),
  dupla('Repos:', n(u.public_repos), 'Stars:', n(estrelas)),
  dupla('Commits:', n(commits), 'Followers:', n(u.followers)),
];

// ---------- monta a imagem (SVG) nas versões clara e escura ----------
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const colorir = (t) => esc(t)
  .replace(/^(- )([^─]+?)( ─+)$/, '<tspan class="d">$1</tspan><tspan class="k">$2</tspan><tspan class="d">$3</tspan>')
  .replace(/^(\S+@github)( ─+)$/, '<tspan class="k">$1</tspan><tspan class="d">$2</tspan>')
  .replace(/([A-Za-z.]+:)(?= )/g, '<tspan class="k">$1</tspan>')
  .replace(/( \.{2,} )/g, '<tspan class="d">$1</tspan>')
  .replace(/^\.(?=\s|$)/, '<tspan class="d">.</tspan>');

const CHAR = 8.4, PASSO = 18, FONTE = 14;
const ARTE_L = 380, ARTE_A = Math.round(ARTE_L * (arte.length * 4) / ([...arte[0]].length * 2));
const passoArte = ARTE_A / arte.length;
const fichaA = ficha.length * PASSO;
const altura = Math.max(ARTE_A, fichaA) + 70;
const xFicha = 20 + ARTE_L + 30;
const largura = xFicha + Math.max(...ficha.map((l) => [...l].length)) * CHAR + 24;
const yArte = 24 + (altura - 70 - ARTE_A) / 2;
const yFicha = 24 + (altura - 70 - fichaA) / 2;

const dataBR = new Date().toLocaleString('pt-BR', {
  timeZone: 'America/Sao_Paulo', dateStyle: 'medium', timeStyle: 'short',
});

function svg(tema) {
  const c = tema === 'escuro'
    ? { fundo: '#161b22', borda: '#30363d', txt: '#c9d1d9', k: '#b794f6', d: '#6e7681', arte: '#c9d1d9' }
    : { fundo: '#f6f8fa', borda: '#d0d7de', txt: '#24292f', k: '#7c3aed', d: '#8c959f', arte: '#24292f' };
  const linhasArte = arte.map((l, i) =>
    `<text x="20" y="${(yArte + (i + 1) * passoArte).toFixed(1)}" textLength="${ARTE_L}" lengthAdjust="spacingAndGlyphs" class="a">${esc(l)}</text>`).join('\n');
  const linhasFicha = ficha.map((l, i) => l ? `<text x="${xFicha}" y="${yFicha + (i + 1) * PASSO - 4}"${[...l].length > 3 ? ` textLength="${([...l].length * CHAR).toFixed(1)}"` : ''}>${colorir(l)}</text>` : '').join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(largura)}" height="${altura}" viewBox="0 0 ${Math.round(largura)} ${altura}" font-family="ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace" font-size="${FONTE}px">
<style>text{fill:${c.txt};white-space:pre}.k{fill:${c.k}}.d{fill:${c.d}}.a{fill:${c.arte};font-size:${(passoArte * 0.95).toFixed(1)}px}.u{fill:${c.d};font-size:11px}</style>
<rect x="0.5" y="0.5" width="${Math.round(largura) - 1}" height="${altura - 1}" rx="10" fill="${c.fundo}" stroke="${c.borda}"/>
${linhasArte}
${linhasFicha}
<text x="${Math.round(largura) - 20}" y="${altura - 18}" text-anchor="end" class="u">Atualizado em ${esc(dataBR)}</text>
</svg>
`;
}

fs.writeFileSync(new URL('../perfil-claro.svg', import.meta.url), svg('claro'));
fs.writeFileSync(new URL('../perfil-escuro.svg', import.meta.url), svg('escuro'));

const versao = Date.now().toString(36);
const readme = `<!-- Gerado por scripts/gerar-readme.mjs. Edite o script, não este arquivo. -->

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/DevPdrovisky/DevPdrovisky/main/perfil-escuro.svg?v=${versao}">
    <img alt="${esc(USUARIO)}@github: Front-end, fundador da Vorkeza Digital" src="https://raw.githubusercontent.com/DevPdrovisky/DevPdrovisky/main/perfil-claro.svg?v=${versao}" width="100%">
  </picture>
</p>

<p align="center">
  <a href="https://vorkeza.com.br"><img alt="vorkeza.com.br" src="https://img.shields.io/badge/vorkeza.com.br-7C3AED?style=for-the-badge"></a>
</p>
`;

fs.writeFileSync(new URL('../README.md', import.meta.url), readme);
console.log('ok', Math.round(largura), altura);
