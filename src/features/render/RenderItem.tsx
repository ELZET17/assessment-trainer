/**
 * /render/<itemKey>?lang=en&reveal=1 – renders one item in isolation.
 * Used for screenshots (Gate 6) and the blind-solving export (Gate 3).
 */
import { useParams, useSearchParams } from 'react-router'
import { resolveItem } from '../../content/items'
import { parseRefKey, type Lang } from '../../content/types'
import { Explanation, ItemView } from '../../ui/ItemView'

export default function RenderItem() {
  const { key = '' } = useParams()
  const [params] = useSearchParams()
  const ref = parseRefKey(decodeURIComponent(key))
  const lang = (params.get('lang') ?? 'en') as Lang
  const item = ref ? resolveItem(ref, lang) : null
  if (!item) return <p>Unbekannte Aufgabe.</p>
  return (
    <div data-testid="render-item">
      <ItemView item={item} mode="draft" revealed={params.get('reveal') === '1'} />
      {params.get('reveal') === '1' && <Explanation item={item} correct={null} />}
    </div>
  )
}
