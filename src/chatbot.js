import { TOPICS, CHAT } from './data'

const norm = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/['’]/g, ' ')
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const has = (q, k) =>
  new RegExp((k[0] === '%' ? '' : '(^|[^a-z0-9_%])') + esc(k) + 's?($|[^a-z0-9_%])').test(q)
const any = (q, arr) => arr.some((k) => has(q, k))
const pick = (a) => a[Math.floor(Math.random() * a.length)]

const fmt = (t) =>
  `${t.title} : ${t.summary}\n\n` +
  t.details.map((s) => `${s.h} :\n` + s.l.map((x) => '• ' + x).join('\n')).join('\n\n') +
  `\n\nTu peux aussi demander un exemple de code.`

export function answer(text) {
  const q = norm(text).trim()
  if (!q) return ''

  const ranked = TOPICS
    .map((t) => ({ t, s: t.kw.filter((k) => has(q, k)).length }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)

  // Aucune notion détectée : questions générales, salutations, aide...
  if (!ranked.length) {
    const g = CHAT.general.find((x) => any(q, x.k))
    if (g) return g.a
    const it = CHAT.intents.find((x) => any(q, x.k))
    if (it) return pick(it.a)
    return pick(CHAT.fallback)
  }

  const greet = any(q, CHAT.intents[CHAT.intents.length - 1].k)
  const hi = greet ? pick(CHAT.hiShort) + '\n\n' : ''
  const ids = ranked.map((x) => x.t.id)

  // Question qui combine plusieurs notions
  const combo = CHAT.combos.find((c) => c.t.every((id) => ids.includes(id)))
  if (combo) return hi + combo.a

  // Plusieurs notions sans réponse dédiée
  if (ranked.length >= 2 && ranked[0].s < ranked[1].s + 2) {
    return (
      hi +
      `Ta question touche plusieurs notions :\n\n` +
      ranked.map((x) => `• ${x.t.title} : ${x.t.summary}`).join('\n') +
      `\n\nPrécise ce que tu veux comparer ou relier (ex : "différence entre ...", "... avec ...") ou ouvre la table dans la mindmap.`
    )
  }

  // Une seule notion
  const t = ranked[0].t
  const f = (t.faq || []).find((x) => any(q, x.k))
  if (f) return hi + f.a
  if (any(q, ['exemple', 'code', 'syntaxe', 'montre', 'montrer'])) {
    return hi + `Exemple : ${t.title}\n\n${t.code}`
  }
  return hi + fmt(t)
}