/** Flow-chart model for diagrammatic items. */

export interface FlowRow {
  input: string[]
  /** Operator symbols in order; null marks the missing operator ("?"). */
  ops: (string | null)[]
  /** Output; null marks the value to find ("?"). */
  output: string[] | null
}

export interface FlowSpec {
  /** Worked examples (operators must be inferred from them). */
  examples: FlowRow[]
  question: FlowRow
  /** Operators whose meaning is given explicitly. */
  legend: { symbol: string; meaning: string }[]
  /** All operator symbols used anywhere (for rendering). */
  symbols: string[]
}
