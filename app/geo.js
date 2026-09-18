'use client'

import { useEffect, useState } from 'react'
import { icons } from './ui'

/* ═══════════════════════════════════════════════════════════
   «Масштабирование» — кабинет геоаналитики под капотом
   (интеграция по API), перенесён по референсу и адаптирован
   под визуальный язык прототипа
   ═══════════════════════════════════════════════════════════ */

/* ── легенда тепловой карты (люди на гексагон) ── */
const BUCKETS = [
  ['931 – 1,4 тыс.', '#E30611', 0.62],
  ['651 – 931', '#E30611', 0.4],
  ['511 – 651', '#FFA080', 0.52],
  ['371 – 511', '#00724D', 0.34],
  ['231 – 371', '#03A17B', 0.28],
  ['91 – 231', '#014FCE', 0.3],
  ['21 – 91', '#6384E0', 0.26],
  ['0 – 21', '#2E00B2', 0.18],
]
const HEAT_CHIPS = ['Трафик', 'Работающие', 'Проживающие', 'Визитёры', 'Расходы']
const HEAT_TEXT = {
  'Трафик': 'Тепловая карта по трафику показывает, где больше всего проходит и проезжает людей',
  'Работающие': 'Тепловая карта по работающему населению показывает, где больше всего людей работает',
  'Проживающие': 'Тепловая карта по проживающему населению показывает, где больше всего проживает людей',
  'Визитёры': 'Тепловая карта по визитёрам показывает, куда приезжают люди из других районов',
  'Расходы': 'Тепловая карта по расходам показывает, где люди тратят больше всего денег',
}

/* детерминированный генератор — карта стабильна между рендерами */
function makeRnd(seed) {
  let s = seed || 1
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
}

/* ── SVG-карта с гексагональной тепловой сеткой ── */
function HexMap({ seed, scale, heatOn, onClick }) {
  const W = 1200, H = 760
  const R = 46 * scale
  const N = 16
  const rnd = makeRnd(seed)
  const hexes = []
  for (let q = -N; q <= N; q++) {
    for (let r = -N; r <= N; r++) {
      const x = Math.sqrt(3) * (q + r / 2)
      const y = 1.5 * r
      const dd = Math.hypot(x, y)
      if (dd > N * 1.6) continue
      const cx = W / 2 + x * R
      const cy = H / 2 + y * R
      if (cx < -R || cx > W + R || cy < -R || cy > H + R) continue
      const v = Math.max(0, Math.min(1, (1 - dd / (N * 1.6)) ** 2 * 1.35 + (rnd() - 0.5) * 0.55))
      const b = BUCKETS[Math.min(7, Math.max(0, 7 - Math.round(v * 7)))]
      const pts = [0, 1, 2, 3, 4, 5].map((i) => {
        const a = (Math.PI / 180) * (60 * i - 30)
        return `${(cx + R * Math.cos(a)).toFixed(1)},${(cy + R * Math.sin(a)).toFixed(1)}`
      }).join(' ')
      hexes.push(<polygon key={`${q}:${r}`} points={pts} fill={b[1]} fillOpacity={b[2]} stroke={b[1]} strokeOpacity=".35" />)
    }
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="ge-map-svg" onClick={onClick}>
      <rect width={W} height={H} fill="#E8EEF3" />
      <g opacity=".55">
        <path d={`M0,${H * 0.55} Q ${W * 0.3},${H * 0.4} ${W * 0.55},${H * 0.62} T ${W},${H * 0.5}`} stroke="#BFD8EA" strokeWidth="30" fill="none" />
        <path d={`M${W * 0.2},0 L ${W * 0.35},${H}`} stroke="#D9DEE3" strokeWidth="8" fill="none" />
        <path d={`M${W * 0.62},0 L ${W * 0.5},${H}`} stroke="#D9DEE3" strokeWidth="6" fill="none" />
        <path d={`M0,${H * 0.28} L ${W},${H * 0.22}`} stroke="#E4C89B" strokeWidth="6" fill="none" />
        <path d={`M0,${H * 0.78} L ${W},${H * 0.84}`} stroke="#D9DEE3" strokeWidth="5" fill="none" />
      </g>
      {heatOn && hexes}
      <text x={W / 2} y={H / 2 + 6} textAnchor="middle" fontSize="19" fill="#3E4A57" fontWeight="600">Москва · Цветной бульвар</text>
    </svg>
  )
}

/* ── карточки витрины ── */
function CardArt({ kind }) {
  const rnd = makeRnd(kind.length * 37 + 7)
  if (kind === 'hex') {
    const items = Array.from({ length: 60 }, (_, i) => {
      const x = rnd() * 520, y = rnd() * 200, k = 6 + rnd() * 7
      const c = rnd() > 0.9 ? '#D8A8F0' : '#D9DEF2'
      const pts = [0, 1, 2, 3, 4, 5].map((n) => {
        const a = (Math.PI / 180) * (60 * n - 30)
        return `${(x + k * Math.cos(a)).toFixed(1)},${(y + k * Math.sin(a)).toFixed(1)}`
      }).join(' ')
      return <polygon key={i} points={pts} fill={c} opacity=".85" />
    })
    return <svg viewBox="0 0 520 202" preserveAspectRatio="xMidYMid slice" className="ge-card-art">{items}</svg>
  }
  if (kind === 'bubbles') {
    const items = Array.from({ length: 22 }, (_, i) => (
      <circle key={i} cx={rnd() * 520} cy={40 + rnd() * 160} r={8 + rnd() * 34} fill="#C7CDF7" opacity=".8" />
    ))
    return (
      <svg viewBox="0 0 520 202" preserveAspectRatio="xMidYMid slice" className="ge-card-art">
        {items}
        <circle cx="280" cy="105" r="46" fill="#B49AE8" />
        <text x="280" y="100" textAnchor="middle" fontSize="17" fill="#fff">11 583</text>
        <text x="280" y="120" textAnchor="middle" fontSize="15" fill="#fff">чел.</text>
      </svg>
    )
  }
  if (kind === 'bars') {
    const vals = [18, 26, 40, 34, 30, 52, 62, 46, 42, 70, 58, 74, 80, 66, 92, 120, 74, 96, 110, 104, 98]
    return (
      <svg viewBox="0 0 520 202" preserveAspectRatio="xMidYMid slice" className="ge-card-art">
        {vals.map((v, i) => (
          <rect key={i} x={14 + i * 23} y={190 - v * 1.35} width="15" height={v * 1.35} rx="2"
            fill={i === 15 ? '#8F8FFF' : i > 15 ? '#C9C9F5' : '#8FA0E8'} />
        ))}
      </svg>
    )
  }
  /* lines */
  const mk = (c, off) => {
    let d = `M0,${180 + off}`
    for (let x = 0; x <= 520; x += 26) d += ` L${x},${(180 + off - Math.sin(x / 170) * (70 + off / 2)).toFixed(0)}`
    return <path key={c + off} d={d} fill="none" stroke={c} strokeWidth="3" />
  }
  return (
    <svg viewBox="0 0 520 202" preserveAspectRatio="xMidYMid slice" className="ge-card-art">
      {[mk('#D8B0E8', -6), mk('#9FA8F3', 10), mk('#B9BFF0', 26), mk('#D6D9DD', 46)]}
    </svg>
  )
}

const SHOW_CARDS = [
  { t: 'Цифровой житель', locked: true, art: 'hex' },
  { t: 'Цифровой туризм', locked: true, art: 'hex' },
  { t: 'Портрет жителя', locked: true, art: 'bubbles' },
  { t: 'Портрет туриста', locked: true, art: 'bubbles' },
  { section: 'Масштабирование для бизнеса' },
  { t: 'Аналитика для бизнеса', locked: false, art: 'bubbles' },
  { t: 'Объекты', locked: true, art: 'lines' },
  { t: 'Мониторинг', locked: true, art: 'lines' },
  { t: 'Проектная аналитика', locked: true, art: 'hex' },
  { t: 'Настройка территорий', locked: true, art: 'hex' },
  { t: 'Отчёт по вашему ТЗ', locked: false, art: 'bars' },
]

const SLIDES = [
  ['Найдите место для второго салона', 'Оцените трафик и портрет аудитории района до подписания аренды', 'linear-gradient(115deg, #2b2360 0%, #5b4ac8 55%, #8F8FFF 100%)'],
  ['Увеличивайте поток клиентов', 'Определите точки притяжения рядом и сделайте салон заметнее', 'linear-gradient(115deg, #1f4f8f 0%, #3a7fc0 55%, #8fc0e8 100%)'],
  ['Управляйте локацией на данных', 'Смотрите, как люди живут, работают и перемещаются в вашем районе', 'linear-gradient(115deg, #0f6a58 0%, #2aa78c 55%, #9ad9c9 100%)'],
]

const SUPPORT_ACC = [
  ['Описание системы и вход', 'Геоаналитический сервис по обезличенным данным сотовой сети. Открывается прямо из кабинета МТС Бизнеса — отдельный вход не нужен.'],
  ['Тепловая карта', 'Гексагональная сетка показывает трафик, проживающих, работающих, визитёров и расходы на выбранной территории за период.'],
  ['Модуль «Расширенный портрет»', 'Социально-демографический портрет аудитории выбранной точки или области: пол, возраст, доход, интересы.'],
  ['Модуль «Аналитика территории»', 'Сравнение территорий по трафику, проживающим, работающим, визитёрам и расходам — например, двух локаций под новый салон.'],
  ['Модуль «Мониторинг»', 'Регулярное отслеживание показателей по выбранным объектам с уведомлениями об изменениях.'],
  ['Отчёты и тариф «Промо»', 'На бесплатном тарифе «Промо» доступны 3 отчёта. Готовые отчёты сохраняются в разделе «Отчёты» и выгружаются в PDF/XLSX.'],
]

export function ScalingCabinet({ ctx }) {
  const [view, setView] = useState('map')
  const [welcome, setWelcome] = useState(true)
  const nav = (v) => { setView(v); window.scrollTo({ top: 0 }) }
  return (
    <div>
      <div className="pm-bar">
        {[['map', 'Карта'], ['home', 'Витрина'], ['reports', 'Отчёты'], ['support', 'Поддержка']].map(([id, t]) => (
          <button key={id} className={`pm-item${view === id ? ' on' : ''}`} onClick={() => nav(id)}>{t}</button>
        ))}
        <span className="pm-sep" />
        <span className="ge-plan">Сформировано отчётов <b>0 из 3</b> · Тариф «Промо» до <b>18.10.2026</b></span>
        <button className="btn-red ge-buy" onClick={() => setWelcome(true)}>Купить тариф</button>
      </div>

      {view === 'map' && <MapView ctx={ctx} />}
      {view === 'home' && <ShowcaseView ctx={ctx} />}
      {view === 'reports' && <ReportsView ctx={ctx} nav={nav} />}
      {view === 'support' && <SupportView ctx={ctx} />}

      {welcome && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && setWelcome(false)}>
          <div className="modal" style={{ width: 480, textAlign: 'center' }}>
            <h3 style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.3 }}>Добро пожаловать<br />в «Масштабирование»!</h3>
            <p style={{ marginTop: 14, fontSize: 13.5, lineHeight: 1.55, color: 'var(--gray)' }}>
              Вам доступен бесплатный тариф «Промо». До 18.10.2026 вы можете познакомиться
              с сервисом и проанализировать 3 локации для нового салона по данным Москвы.
            </p>
            <button className="btn-red" style={{ width: '100%', marginTop: 20 }} onClick={() => setWelcome(false)}>Хорошо</button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Карта ── */
function MapView({ ctx }) {
  const [region, setRegion] = useState('Москва')
  const [city, setCity] = useState('р-н Тверской · Цветной бульвар')
  const [cmpOpen, setCmpOpen] = useState(false)
  const [heatOn, setHeatOn] = useState(true)
  const [chipT, setChipT] = useState('Проживающие')
  const [objOn, setObjOn] = useState(false)
  const [seed, setSeed] = useState(20260918)
  const [scale, setScale] = useState(1)
  const [legendOpen, setLegendOpen] = useState(true)
  const [howOpen, setHowOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [ctxPos, setCtxPos] = useState(null)
  const reseed = () => setSeed(Math.floor(Math.random() * 1e9) + 1)
  const mapClick = (e) => {
    const r = e.currentTarget.closest('.ge-map-area').getBoundingClientRect()
    setCtxPos({ x: e.clientX - r.left, y: e.clientY - r.top })
    setHowOpen(false); setToolsOpen(false)
  }
  return (
    <div className="ge-shell">
      <aside className="ge-side">
        <div className="ge-side-scroll">
          <div className="ge-title">Регион</div>
          <select className="select" style={{ width: '100%' }} value={region} onChange={(e) => setRegion(e.target.value)}>
            <option>Москва</option><option>Московская область</option><option>Санкт-Петербург</option>
          </select>
          <select className="select" style={{ width: '100%', marginTop: 8 }} value={city} onChange={(e) => setCity(e.target.value)}>
            <option>р-н Тверской · Цветной бульвар</option>
            <option>р-н Хамовники</option>
            <option>р-н Марьино</option>
          </select>

          <div className="ge-title" style={{ marginTop: 18 }}>Период</div>
          <input className="ge-date" defaultValue="30.08.2026 – 18.09.2026" />
          <button className="ge-cmp" onClick={() => setCmpOpen((v) => !v)}>Период для сравнения {cmpOpen ? '▴' : '▾'}</button>
          {cmpOpen && <input className="ge-date" defaultValue="15.08.2026 – 22.08.2026" />}

          <div className="ge-title" style={{ marginTop: 18 }}>Тепловая карта</div>
          <div className="bill-switch" style={{ marginTop: 4 }} onClick={() => setHeatOn((v) => !v)} role="switch" aria-checked={heatOn}>
            <span className={`toggle bill${heatOn ? ' on' : ''}`} aria-hidden="true" />
            <span className="on">{heatOn ? 'Вкл' : 'Выкл'}</span>
          </div>
          <div className="chips-row" style={{ marginTop: 10 }}>
            {HEAT_CHIPS.map((c) => (
              <button key={c} className={`filter-chip${chipT === c ? ' active' : ''}`}
                onClick={() => { setChipT(c); reseed() }}>{c}</button>
            ))}
          </div>
          <p className="ge-note">{HEAT_TEXT[chipT]}</p>

          <div className="ge-title" style={{ marginTop: 14 }}>Объекты</div>
          <button className={`filter-chip${objOn ? ' active' : ''}`} onClick={() => setObjOn((v) => !v)}>Объекты на карте</button>
        </div>
        <div className="ge-side-actions">
          <button className="btn-red" style={{ width: '100%' }} onClick={() => { reseed(); ctx.ping('Тепловая карта перестроена по выбранным фильтрам') }}>Применить</button>
          <button className="btn-gray" style={{ width: '100%', marginTop: 8 }}
            onClick={() => { setChipT('Проживающие'); setObjOn(false); setHeatOn(true); reseed() }}>Сбросить</button>
        </div>
      </aside>

      <div className="ge-map-area">
        <HexMap seed={seed} scale={scale} heatOn={heatOn} onClick={mapClick} />

        <div className="ge-ctl ge-tl"><button className="ge-round" aria-label="Поиск">{icons.search}</button></div>

        <div className="ge-ctl ge-tr">
          <button className="ge-pill" onClick={() => { setHowOpen((v) => !v); setToolsOpen(false) }}>Как это работает?</button>
          <button className="ge-round" title="Инструменты" onClick={() => { setToolsOpen((v) => !v); setHowOpen(false) }}>✏️</button>
          <button className="ge-round" title="Сравнение" onClick={() => ctx.ping('Добавьте объекты, чтобы сравнить локации')}>⇄</button>
        </div>

        <div className="ge-ctl ge-zoom">
          <button className="ge-round" title="Моё местоположение" onClick={() => ctx.ping('Центрируем карту на салоне «Viron» (демо)')}>➤</button>
          <div className="ge-zoom-group">
            <button onClick={() => setScale((s) => Math.min(2.2, s * 1.25))}>+</button>
            <button onClick={() => setScale((s) => Math.max(0.5, s * 0.8))}>−</button>
          </div>
        </div>

        <div className="ge-legend">
          <button className="ge-legend-head" onClick={() => setLegendOpen((v) => !v)}>
            <span className="ge-hex" /> 400 м. <span style={{ marginLeft: 'auto' }}>{legendOpen ? '▴' : '▾'}</span>
          </button>
          {legendOpen && BUCKETS.map(([l, c]) => (
            <div key={l} className="ge-legend-row"><i style={{ background: c }} />{l}</div>
          ))}
        </div>

        <div className="ge-snack">
          <span>Перестроить тепловую карту</span>
          <button onClick={() => { reseed(); ctx.ping('Тепловая карта перестроена') }}>Перестроить</button>
        </div>

        {howOpen && (
          <div className="ge-pop">
            <b>Как это работает?</b>
            <p>Познакомьтесь с сервисом «Масштабирование» и его возможностями</p>
            {['Полное обучение', 'Как сформировать отчёт?', 'Что показывает тепловая карта?', 'Как сравнить локации?'].map((t) => (
              <button key={t} className="ge-pop-i" onClick={() => ctx.ping(`«${t}» — обучение откроется в новом окне (демо)`)}>{t}</button>
            ))}
          </div>
        )}
        {toolsOpen && (
          <div className="ge-menu" style={{ right: 66, top: 62 }}>
            {['Радиус', 'Выделение области', 'Область доступности', 'Линейка'].map((t) => (
              <button key={t} onClick={() => { setToolsOpen(false); ctx.ping(`Инструмент «${t}» активирован — кликните по карте (демо)`) }}>{t}</button>
            ))}
          </div>
        )}
        {ctxPos && (
          <>
            <span className="pm-backdrop" style={{ position: 'absolute' }} onClick={() => setCtxPos(null)} />
            <div className="ge-menu" style={{ left: Math.min(ctxPos.x, 600), top: Math.min(ctxPos.y, 480) }}>
              {['Радиус', 'Выделение области', 'Область доступности', 'Сформировать отчёт по точке'].map((t) => (
                <button key={t} onClick={() => { setCtxPos(null); ctx.ping(t === 'Сформировать отчёт по точке' ? 'Отчёт по точке формируется — найдёте его в «Отчётах» (демо)' : `Инструмент «${t}» активирован (демо)`) }}>{t}</button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ── Витрина ── */
function ShowcaseView({ ctx }) {
  const [slide, setSlide] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 6000)
    return () => clearInterval(t)
  }, [])
  const [tags, setTags] = useState([])
  const toggleTag = (t) => setTags((x) => (x.includes(t) ? x.filter((i) => i !== t) : [...x, t]))
  const [h, sub, grad] = SLIDES[slide]
  return (
    <div>
      <div className="ge-slider" style={{ background: grad }}>
        <div className="ge-slide-txt">
          <h1>{h}</h1>
          <p>{sub}</p>
        </div>
        <div className="ge-slider-ctl">
          <button onClick={() => setSlide((s) => (s + SLIDES.length - 1) % SLIDES.length)}>‹</button>
          <button onClick={() => setSlide((s) => (s + 1) % SLIDES.length)}>›</button>
        </div>
      </div>
      <div className="chips-row" style={{ marginTop: 16 }}>
        {['★ Избранное', 'Доступно мне', 'Дашборд', 'Тепловая карта', 'Инструменты', 'Люди', 'Посещаемость', 'Бизнес', 'Перемещения'].map((t) => (
          <button key={t} className={`filter-chip${tags.includes(t) ? ' active' : ''}`} onClick={() => toggleTag(t)}>{t}</button>
        ))}
      </div>
      <div className="ge-cards">
        {SHOW_CARDS.map((c, i) => c.section
          ? <div key={i} className="ge-cards-title">{c.section}</div>
          : (
            <div key={i} className={`ge-card${c.locked ? ' locked' : ''}`}
              onClick={() => (c.locked ? ctx.ping('Модуль доступен на платном тарифе — напишите нам, чтобы получить доступ') : ctx.ping(`«${c.t}» открывается (демо)`))}>
              <CardArt kind={c.art} />
              {c.locked && <span className="ge-veil" />}
              <h5>{c.t}</h5>
              {c.locked && <span className="ge-lock">🔒</span>}
            </div>
          ))}
      </div>
    </div>
  )
}

/* ── Отчёты ── */
function ReportsView({ ctx, nav }) {
  return (
    <div className="card" style={{ marginTop: 14, minHeight: 420 }}>
      <h2 className="block-title" style={{ fontSize: 19 }}>Отчёты</h2>
      <div className="ge-empty">
        <b>Пока здесь пусто</b>
        <p>Когда вы исследуете свои первые локации,<br />отчёты по ним сохранятся в этом разделе</p>
        <button className="btn-gray" style={{ width: 'auto' }} onClick={() => nav('map')}>Вернуться на карту</button>
      </div>
    </div>
  )
}

/* ── Поддержка ── */
function SupportView({ ctx }) {
  const [open, setOpen] = useState(null)
  const [q, setQ] = useState('')
  const list = SUPPORT_ACC.filter(([t]) => t.toLowerCase().includes(q.toLowerCase()))
  return (
    <div>
      <div className="card" style={{ marginTop: 14, textAlign: 'center', padding: '26px 24px' }}>
        <h2 className="block-title" style={{ fontSize: 20 }}>Справка по «Масштабированию»</h2>
        <div className="input-search" style={{ maxWidth: 520, margin: '16px auto 0' }}>
          {icons.search}
          <input placeholder="Поиск по справке" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <div className="pm-acc" style={{ marginTop: 0 }}>
          {list.map(([t, b], i) => (
            <div key={t} className={`pm-acc-i${open === i ? ' on' : ''}`}>
              <button onClick={() => setOpen(open === i ? null : i)}>{t}<span>⌄</span></button>
              {open === i && <p>{b}</p>}
            </div>
          ))}
          {list.length === 0 && <p className="empty-note">Ничего не нашли по запросу «{q}».</p>}
        </div>
        <div className="modal-actions" style={{ marginTop: 16 }}>
          <button className="btn-gray" style={{ width: 'auto' }} onClick={() => ctx.ping('Напишите в чат в сайдбаре — поможем с геоаналитикой')}>Поддержка</button>
        </div>
      </div>
    </div>
  )
}
