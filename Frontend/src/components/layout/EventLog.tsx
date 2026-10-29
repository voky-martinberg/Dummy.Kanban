import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { Board, BoardEvent } from '../../api/types'
import './EventLog.css'

const POLL_MS = 5000

const time = new Intl.DateTimeFormat('sv-SE', { dateStyle: 'short', timeStyle: 'medium' })

/**
 * Senaste händelserna från den interna händelseloggen. Hämtas när tavlan ändras och
 * med jämna mellanrum. Nås inte loggen visas det, men inget annat påverkas.
 */
export function EventLog({ board }: { board: Board }) {
  const [events, setEvents] = useState<BoardEvent[] | null>(null)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = () =>
      api.getEvents().then(
        (e) => {
          if (cancelled) return
          setEvents(e)
          setUnavailable(false)
        },
        () => !cancelled && setUnavailable(true),
      )

    void load()
    const timer = setInterval(load, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [board])

  return (
    <section className="event-log">
      <h2>Händelser</h2>
      {unavailable ? (
        <p className="muted">Händelseloggen nås inte just nu.</p>
      ) : events === null ? (
        <p className="muted">Laddar…</p>
      ) : events.length === 0 ? (
        <p className="muted">Inget har hänt än.</p>
      ) : (
        <ol>
          {events.map((e) => (
            <li key={e.id}>
              <time dateTime={e.createdAt}>{time.format(new Date(e.createdAt))}</time>
              <span>{e.message}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
