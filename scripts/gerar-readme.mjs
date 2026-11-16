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
  return `${a} │ ${b}`;
};

const ficha = [
  `${USUARIO}@github ${'─'.repeat(LARGURA - USUARIO.length - 8)}`,
  linha('OS:', 'Windows'),
  linha('Uptime:', u.created_at ? tempoDesde(u.created_at) : '—'),
  linha('Host:', 'Vorkeza Digital'),
  linha('Kernel:', 'Front-end'),
  linha('Shell:', 'Claude Code'),
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

// ---------- junta as duas colunas ----------
const larguraArte = Math.max(...arte.map((l) => [...l].length)) + 3;
const total = Math.max(arte.length, ficha.length);
const topoArte = Math.floor((total - arte.length) / 2);
const linhas = [];
for (let i = 0; i < total; i++) {
  const esq = arte[i - topoArte] ?? '';
  const dir = ficha[i] ?? '';
  linhas.push((esq + ' '.repeat(larguraArte - [...esq].length) + dir).trimEnd());
}

const dataBR = new Date().toLocaleString('pt-BR', {
  timeZone: 'America/Sao_Paulo', dateStyle: 'medium', timeStyle: 'short',
});

const readme = `<!-- Gerado por scripts/gerar-readme.mjs. Edite o script, não este arquivo. -->
<h3 align="center">Oi, eu sou o Pedro 👾</h3>
<p align="center">Construo sites e micro SaaS que resolvem problema de pequeno negócio,<br>do código até o vídeo que traz o cliente.</p>

\`\`\`text
${linhas.join('\n')}
\`\`\`

<p align="right"><sub>Atualizado em ${dataBR}</sub></p>

<p align="center">
  <a href="https://vorkeza.com.br"><img alt="vorkeza.com.br" src="https://img.shields.io/badge/vorkeza.com.br-7C3AED?style=for-the-badge"></a>
</p>
`;

fs.writeFileSync(new URL('../README.md', import.meta.url), readme);
console.log(readme);
