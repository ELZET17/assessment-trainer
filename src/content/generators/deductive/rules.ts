/** If-then rules (propositional logic): which statement must be true? */
import { core, tr, type GeneratorDef } from '../../generator'
import { firstAccepted } from '../../pipeline'
import type { Rng } from '../../rng'
import type { Lang } from '../../types'
import { entails, propHolds, type Lit, type Prop } from '../../validators/deductive'

interface EventText {
  en: [string, string]
  /** German: [main clause, subordinate clause (verb-final), inverted (verb-first after "dann")] × [pos, neg] */
  de: { main: [string, string]; sub: [string, string]; inv: [string, string] }
}

const EVENTS: EventText[] = [
  {
    en: ['the budget is approved', 'the budget is not approved'],
    de: { main: ['das Budget wird genehmigt', 'das Budget wird nicht genehmigt'], sub: ['das Budget genehmigt wird', 'das Budget nicht genehmigt wird'], inv: ['wird das Budget genehmigt', 'wird das Budget nicht genehmigt'] },
  },
  {
    en: ['the launch is delayed', 'the launch is not delayed'],
    de: { main: ['der Launch wird verschoben', 'der Launch wird nicht verschoben'], sub: ['der Launch verschoben wird', 'der Launch nicht verschoben wird'], inv: ['wird der Launch verschoben', 'wird der Launch nicht verschoben'] },
  },
  {
    en: ['Team Alpha is hired', 'Team Alpha is not hired'],
    de: { main: ['Team Alpha wird beauftragt', 'Team Alpha wird nicht beauftragt'], sub: ['Team Alpha beauftragt wird', 'Team Alpha nicht beauftragt wird'], inv: ['wird Team Alpha beauftragt', 'wird Team Alpha nicht beauftragt'] },
  },
  {
    en: ['the office moves', 'the office does not move'],
    de: { main: ['das Büro zieht um', 'das Büro zieht nicht um'], sub: ['das Büro umzieht', 'das Büro nicht umzieht'], inv: ['zieht das Büro um', 'zieht das Büro nicht um'] },
  },
  {
    en: ['prices rise', 'prices do not rise'],
    de: { main: ['die Preise steigen', 'die Preise steigen nicht'], sub: ['die Preise steigen', 'die Preise nicht steigen'], inv: ['steigen die Preise', 'steigen die Preise nicht'] },
  },
  {
    en: ['the audit is passed', 'the audit is not passed'],
    de: { main: ['das Audit wird bestanden', 'das Audit wird nicht bestanden'], sub: ['das Audit bestanden wird', 'das Audit nicht bestanden wird'], inv: ['wird das Audit bestanden', 'wird das Audit nicht bestanden'] },
  },
  {
    en: ['the contract is signed', 'the contract is not signed'],
    de: { main: ['der Vertrag wird unterschrieben', 'der Vertrag wird nicht unterschrieben'], sub: ['der Vertrag unterschrieben wird', 'der Vertrag nicht unterschrieben wird'], inv: ['wird der Vertrag unterschrieben', 'wird der Vertrag nicht unterschrieben'] },
  },
]

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const neg = (l: Lit): Lit => ({ v: l.v, neg: !l.neg })
/** Logical negation of a distractor statement (used to tell "false" from "not certain"). */
function negate(p: Prop): Prop {
  switch (p.t) {
    case 'lit':
      return { t: 'lit', l: neg(p.l) }
    case 'and':
      return { t: 'notBoth', a: p.a, b: p.b }
    case 'notBoth':
      return { t: 'and', a: p.a, b: p.b }
    case 'if':
      return { t: 'and', a: p.a, b: neg(p.b) }
    case 'or':
      return { t: 'and', a: neg(p.a), b: neg(p.b) }
  }
}
const lit = (v: number, n: boolean): Lit => ({ v, neg: n })

function render(p: Prop, ev: EventText[], lang: Lang): string {
  const en = (l: Lit) => ev[l.v].en[l.neg ? 1 : 0]
  const de = (l: Lit, f: 'main' | 'sub' | 'inv') => ev[l.v].de[f][l.neg ? 1 : 0]
  if (lang === 'de') {
    switch (p.t) {
      case 'lit':
        return `${cap(de(p.l, 'main'))}.`
      case 'if':
        return `Wenn ${de(p.a, 'sub')}, dann ${de(p.b, 'inv')}.`
      case 'or':
        return `${cap(de(p.a, 'main'))} oder ${de(p.b, 'main')} (oder beides).`
      case 'and':
        return `${cap(de(p.a, 'main'))} und ${de(p.b, 'main')}.`
      case 'notBoth':
        return `Es trifft nicht zu, dass sowohl ${de(p.a, 'sub')} als auch ${de(p.b, 'sub')}.`
    }
  }
  switch (p.t) {
    case 'lit':
      return `${cap(en(p.l))}.`
    case 'if':
      return `If ${en(p.a)}, then ${en(p.b)}.`
    case 'or':
      return `${cap(en(p.a))} or ${en(p.b)} (or both).`
    case 'and':
      return `${cap(en(p.a))} and ${en(p.b)}.`
    case 'notBoth':
      return `It is not the case that both ${en(p.a)} and ${en(p.b)}.`
  }
}

/** Forward chaining with named rules – produces a German derivation, or null. */
function derive(premises: Prop[], target: Lit, ev: EventText[]): string[] | null {
  const known = new Map<string, string>()
  const key = (l: Lit) => `${l.v}:${l.neg}`
  const name = (l: Lit) => `„${ev[l.v].de.main[l.neg ? 1 : 0]}“`
  premises.forEach((p) => p.t === 'lit' && known.set(key(p.l), `Gegeben: ${name(p.l)}.`))
  const steps: string[] = []
  let changed = true
  while (changed && !known.has(key(target))) {
    changed = false
    for (const p of premises) {
      const add = (l: Lit, why: string) => {
        if (!known.has(key(l))) {
          known.set(key(l), why)
          steps.push(why)
          changed = true
        }
      }
      const rule = `„${render(p, ev, 'de').replace(/\.$/, '')}“`
      if (p.t === 'if') {
        if (known.has(key(p.a))) add(p.b, `Regel ${rule}: Die Bedingung ${name(p.a)} ist erfüllt → ${name(p.b)} (Modus ponens).`)
        if (known.has(key(neg(p.b)))) add(neg(p.a), `Regel ${rule} rückwärts: Die Folge ist falsch, weil ${name(neg(p.b))} gilt → also ist auch die Bedingung falsch: ${name(neg(p.a))} (Modus tollens).`)
      } else if (p.t === 'or') {
        if (known.has(key(neg(p.a)))) add(p.b, `Regel ${rule}: Mindestens eins muss gelten; da ${name(neg(p.a))} gilt → ${name(p.b)}.`)
        if (known.has(key(neg(p.b)))) add(p.a, `Regel ${rule}: Mindestens eins muss gelten; da ${name(neg(p.b))} gilt → ${name(p.a)}.`)
      } else if (p.t === 'notBoth') {
        if (known.has(key(p.a))) add(neg(p.b), `Regel ${rule}: Da ${name(p.a)} gilt, kann das andere nicht auch gelten → ${name(neg(p.b))}.`)
        if (known.has(key(p.b))) add(neg(p.a), `Regel ${rule}: Da ${name(p.b)} gilt, kann das andere nicht auch gelten → ${name(neg(p.a))}.`)
      }
    }
  }
  if (!known.has(key(target))) return null
  return [...premises.filter((p) => p.t === 'lit').map((p) => known.get(key((p as { l: Lit }).l)) as string), ...steps]
}

/** A rule that lets one derive `to` from the known-true literal `from` (all true in the hidden model). */
function link(rng: Rng, from: Lit, to: Lit, allowed: ('mp' | 'mt' | 'ds' | 'nb')[]): Prop {
  switch (rng.pick(allowed)) {
    case 'mp':
      return { t: 'if', a: from, b: to }
    case 'mt':
      return { t: 'if', a: neg(to), b: neg(from) }
    case 'ds':
      return { t: 'or', a: neg(from), b: to }
    default:
      return { t: 'notBoth', a: from, b: neg(to) }
  }
}

export const rules: GeneratorDef = {
  id: 'ded.rules',
  version: 1,
  category: 'deductive',
  title: 'Wenn-dann-Regeln',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      // Exactly the events used in the statements – options never mention anything that was not introduced.
      const vars = d === 1 ? 2 : d === 2 ? 3 : 4
      const ev = rng.sample(EVENTS, vars)
      const order = rng.shuffle(Array.from({ length: vars }, (_, i) => i))
      const chainLen = d === 1 ? 1 : d === 2 ? 2 : 3
      const kinds: ('mp' | 'mt' | 'ds' | 'nb')[] = d === 1 ? ['mp', 'mt'] : ['mp', 'mt', 'ds', 'nb']
      // Hidden truth values; the chain runs order[0] → order[1] → …
      const truth = order.map(() => rng.chance(0.5))
      const L = (i: number): Lit => lit(order[i], !truth[i])
      const premises: Prop[] = [{ t: 'lit', l: L(0) }]
      for (let i = 0; i < chainLen; i++) premises.push(link(rng, L(i), L(i + 1), kinds))
      if (d === 3) {
        // A tempting extra rule whose condition is never established (invites "affirming the consequent").
        const spare = order[vars - 1] === order[chainLen] ? order[0] : order[vars - 1]
        premises.push({ t: 'if', a: lit(spare, rng.chance(0.5)), b: L(1) })
      }
      const m = order.reduce((acc, v, i) => acc | ((truth[i] ? 1 : 0) << v), 0)
      if (!premises.every((p) => propHolds(p, m))) return null
      const target = L(chainLen)
      const lits: Lit[] = []
      for (let v = 0; v < vars; v++) lits.push(lit(v, false), lit(v, true))
      const stated = (l: Lit) => premises.some((p) => p.t === 'lit' && p.l.v === l.v && p.l.neg === l.neg)
      if (!entails(vars, premises, { t: 'lit', l: target })) return null
      const derivation = derive(premises, target, ev)
      if (!derivation) return null
      // Distractors that do NOT follow: fallacies first (converse/inverse), then literals, then compounds.
      const fallacies: Prop[] = []
      premises.forEach((p) => {
        if (p.t === 'if') fallacies.push({ t: 'if', a: p.b, b: p.a }, { t: 'if', a: neg(p.a), b: neg(p.b) })
      })
      const litPool: Prop[] = lits.filter((l) => !stated(l)).map((l) => ({ t: 'lit', l }))
      const compounds: Prop[] = []
      for (const a of lits) for (const b of lits) if (a.v < b.v) compounds.push({ t: 'and', a, b }, { t: 'if', a, b }, { t: 'if', a: b, b: a })
      const seen = new Set<string>()
      const distract = [...rng.shuffle(fallacies), ...rng.shuffle(litPool), ...rng.shuffle(compounds)].filter((p) => {
        const k = JSON.stringify(p)
        if (seen.has(k) || entails(vars, premises, p)) return false
        seen.add(k)
        return true
      })
      if (distract.length < 4) return null
      const right: Prop = { t: 'lit', l: target }
      const options = rng.shuffle([right, ...distract.slice(0, 4)])
      const correct = options.indexOf(right)
      const texts = options.map((o) => render(o, ev, lang))
      if (new Set(texts).size !== 5) return null
      const notes = options
        .map((o, i) => ({ o, i }))
        .filter(({ i }) => i !== correct)
        .map(({ o, i }) => {
          // Gate 4: a statement whose negation follows is not merely "not certain" but false.
          const why = entails(vars, premises, negate(o))
            ? 'Widerspricht den Aussagen – unter den gegebenen Regeln ist diese Aussage sicher falsch.'
            : fallacies.some((f) => JSON.stringify(f) === JSON.stringify(o))
              ? 'Umkehrung bzw. Verneinung einer Wenn-dann-Regel – folgt nicht (aus „Wenn A, dann B“ folgt weder „Wenn B, dann A“ noch „Wenn nicht A, dann nicht B“).'
              : 'Folgt nicht zwingend – es gibt eine Konstellation, in der alle Aussagen gelten, diese aber nicht.'
          return `**${String.fromCharCode(65 + i)}**: ${why}`
        })
      const premiseOrder = d === 1 ? premises : rng.shuffle(premises)
      return {
        ...core(this, seed, d, lang),
        type: 'mcq' as const,
        exhibits: [{ kind: 'text' as const, title: tr(lang, 'Statements', 'Aussagen'), body: premiseOrder.map((p) => render(p, ev, lang)).join('\n') }],
        prompt: tr(lang, 'If all statements above are true, which of the following must also be true?', 'Wenn alle obigen Aussagen wahr sind, welche der folgenden Aussagen muss dann ebenfalls wahr sein?'),
        query: { family: 'rules', vars, premises: premiseOrder, options },
        options: texts.map((text) => ({ text })),
        correct,
        explanation: {
          steps: [...derivation, `Also: **${render(right, ev, lang)}**`],
          distractors: notes,
          shortcut: 'Nur zwei Schlüsse sind gültig: Wenn A, dann B + A → B (Modus ponens) und Wenn A, dann B + nicht B → nicht A (Modus tollens). „B, also A“ und „nicht A, also nicht B“ sind die klassischen Fallen.',
        },
      }
    })
  },
}
