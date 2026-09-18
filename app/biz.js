'use client'

import { useState } from 'react'
import { icons } from './ui'
import { CLIENTS as BASE_CLIENTS } from './data'

/* ═══════════════════════════════════════════════════════════
   «Управление продажами» — полный CRM-кабинет салона красоты
   (по референсу кабинета владельца, адаптирован под «Viron»)
   ═══════════════════════════════════════════════════════════ */

const money = (n) => Math.round(n).toLocaleString('ru-RU') + ' ₽'
const num = (n) => Math.round(n).toLocaleString('ru-RU')
function makeRnd(seed) {
  let s = seed || 1
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
}
const T = (i) => `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`

/* ── справочники ── */
const BRANCHES = [
  { id: 'b1', name: 'Viron · Цветной бульвар', short: 'Цветной бульвар', k: 1 },
  { id: 'b2', name: 'Viron · Хамовники', short: 'Хамовники', k: 0.72 },
  { id: 'b3', name: 'Viron · Марьино', short: 'Марьино', k: 0.51 },
  { id: 'all', name: 'Все филиалы', short: 'вся сеть', k: 2.23 },
]
const PERIODS = [
  { id: 'd', name: 'Сегодня', k: 1 / 30 }, { id: 'y', name: 'Вчера', k: 1 / 30 },
  { id: 'w', name: '7 дней', k: 7 / 30 }, { id: 'm', name: '30 дней', k: 1 },
]
const MASTERS = [
  { n: 'Ольга Ковалёва', r: 'Топ-мастер', g: 'Grade A', sv: 'Окрашивание, стрижки', rate: 4.9 },
  { n: 'Марина Селезнёва', r: 'Мастер', g: 'Grade B', sv: 'Маникюр, педикюр', rate: 4.8 },
  { n: 'Артём Митров', r: 'Барбер', g: 'Grade B', sv: 'Мужские стрижки, борода', rate: 4.7 },
  { n: 'Дина Шарипова', r: 'Косметолог', g: 'Grade A', sv: 'Уход, чистки', rate: 5.0 },
  { n: 'Полина Реброва', r: 'Мастер', g: 'Grade C', sv: 'Брови, ресницы', rate: 4.6 },
]
const SRV = [
  ['Окрашивание в один тон', 4800, 120], ['Стрижка женская', 2200, 60],
  ['Маникюр с покрытием', 2400, 90], ['Педикюр', 2900, 90],
  ['Мужская стрижка', 1600, 45], ['Оформление бороды', 1200, 30],
  ['Чистка лица', 3900, 90], ['Уход увлажняющий', 3200, 60],
  ['Коррекция бровей', 900, 30], ['Ламинирование ресниц', 2700, 90],
  ['Укладка', 1800, 45], ['Тонирование', 3400, 90],
].map(([n, p, d]) => ({ n, p, d }))
const SEG_BADGE = { vip: ['VIP', 'gold'], regular: ['Постоянный', 'blue'], new: ['Новый', 'green'], sleep: ['Потерянный', 'red'] }
const SOURCES = ['Яндекс Карты', '2ГИС', 'Соцсети', 'Сайт', 'Telegram', 'Рекомендация', 'Zoon']
const NOTES = ['Аллергия на аммиак', 'Предпочитает утренние слоты', 'Любит холодный оттенок', 'Не любит громкую музыку', 'Приходит с ребёнком', '—']

/* клиенты кабинета: база салона, обогащённая CRM-полями */
const rndC = makeRnd(77001)
const CLIENTS = BASE_CLIENTS.map((c, i) => {
  const seg = c.seg.includes('vip') ? 'vip' : c.seg[0]
  const avg = Math.round(c.spent / Math.max(1, c.orders))
  return {
    id: i + 1, name: c.name, ini: c.name.split(' ').map((w) => w[0]).join(''),
    phone: c.phone, visits: c.orders,
    last: Math.max(1, Math.round((new Date(2026, 7, 21) - (() => { const [d, m, y] = c.last.split('.').map(Number); return new Date(y, m - 1, d) })()) / 86400000)),
    avg, ltv: c.spent, bonus: Math.round(rndC() * 4200),
    seg, src: SOURCES[Math.floor(rndC() * SOURCES.length)],
    fav: MASTERS[Math.floor(rndC() * MASTERS.length)].n,
    note: NOTES[Math.floor(rndC() * NOTES.length)],
  }
})

/* журнал: детерминированные визиты 09:00–21:00 */
const VST_STATUS = {
  wait: ['Ожидает подтверждения', '#969FA8'], conf: ['Подтверждён', '#5B8DEF'],
  came: ['Пришёл', '#26CD58'], paid: ['Оплачен', '#0B7A33'], no: ['Не пришёл', '#E30611'],
}
function buildVisits() {
  const rnd = makeRnd(2211)
  const out = []
  MASTERS.forEach((m, mi) => {
    let t = 18 + Math.floor(rnd() * 4)
    let guard = 0
    while (t < 42 && guard++ < 12) {
      const sv = SRV[Math.floor(rnd() * SRV.length)]
      const len = Math.max(1, Math.round(sv.d / 30))
      if (t + len > 42) break
      const c = CLIENTS[Math.floor(rnd() * CLIENTS.length)]
      const st = ['wait', 'conf', 'conf', 'came', 'paid', 'paid', 'no'][Math.floor(rnd() * 7)]
      out.push({ id: `v${mi}_${t}`, m: mi, start: t, len, sv, c, st, online: rnd() > 0.45, prepaid: rnd() > 0.72 })
      t += len + (rnd() > 0.5 ? 1 : 2)
    }
  })
  return out
}

const chip = ([label, cls]) => <span className={`chip ${cls}`}>{label}</span>
const Mini = ({ vals, color }) => {
  const w = 110, h = 26
  const mx = Math.max(...vals), mn = Math.min(...vals), rg = mx - mn || 1
  const pts = vals.map((v, i) => `${(i / (vals.length - 1) * w).toFixed(1)},${(h - 2 - ((v - mn) / rg) * (h - 5)).toFixed(1)}`).join(' ')
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" /></svg>
}
const Bars = ({ rows, color = '#8F8FFF' }) => {
  const mx = Math.max(...rows.map((r) => r[1])) || 1
  return rows.map(([n, v, l]) => (
    <div key={n} className="bar-row">
      <span className="bar-label" style={{ width: 150, minWidth: 110, fontSize: 13 }}>{n}</span>
      <span className="bar-track"><i className="bar-fill" style={{ width: `${(v / mx) * 100}%`, background: color }} /></span>
      <span className="bar-val" style={{ width: 86 }}>{l}</span>
    </div>
  ))
}
const Donut = ({ parts }) => {
  const tot = parts.reduce((a, p) => a + p[1], 0) || 1
  let acc = 0
  return (
    <svg viewBox="0 0 120 120" width="116" height="116">
      {parts.map(([n, v, c]) => {
        const frac = v / tot, a0 = acc * 2 * Math.PI - Math.PI / 2
        acc += frac
        const a1 = acc * 2 * Math.PI - Math.PI / 2
        const x0 = 60 + 44 * Math.cos(a0), y0 = 60 + 44 * Math.sin(a0)
        const x1 = 60 + 44 * Math.cos(a1), y1 = 60 + 44 * Math.sin(a1)
        return <path key={n} d={`M ${x0.toFixed(1)} ${y0.toFixed(1)} A 44 44 0 ${frac > 0.5 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`} fill="none" stroke={c} strokeWidth="20" />
      })}
    </svg>
  )
}

const NAV = [
  ['g', 'Операции'],
  ['dashboard', 'Дашборд'], ['journal', 'Журнал записи'], ['clients', 'Клиенты'], ['booking', 'Онлайн-запись'],
  ['g', 'Деньги'],
  ['finance', 'Финансы'], ['loyalty', 'Лояльность'], ['stock', 'Склад'], ['salary', 'Зарплаты'],
  ['g', 'Аналитика'],
  ['reports', 'Отчёты и аналитика'],
  ['g', 'Управление'],
  ['staff', 'Сотрудники'], ['messaging', 'Уведомления и рассылки'], ['bset', 'Настройки'],
]

export function BizCabinet({ ctx }) {
  const [sec, setSec] = useState('dashboard')
  const [branch, setBranch] = useState(BRANCHES[0])
  const [period, setPeriod] = useState(PERIODS[3])
  const [panel, setPanel] = useState(null) // {title, sub, body, foot}
  const K = branch.k * period.k
  const go = (s) => { setSec(s); setPanel(null) }
  const P = { ctx, K, branch, period, go, setPanel }

  return (
    <div className="bz">
      <aside className="bz-nav">
        <div className="bz-brand">
          <b>Viron CRM</b>
          <span>кабинет владельца</span>
        </div>
        <div className="bz-nav-scroll">
          {NAV.map(([id, t], i) => id === 'g'
            ? <div key={i} className="bz-group">{t}</div>
            : <button key={id} className={`bz-link${sec === id ? ' on' : ''}`} onClick={() => go(id)}>{t}</button>)}
        </div>
        <button className="bz-link bz-help" onClick={() => ctx.ping('База знаний и вебинары — откроются в новом окне (демо)')}>Помощь и обучение</button>
      </aside>
      <div className="bz-main">
        <div className="bz-top">
          <select className="select" value={branch.id} onChange={(e) => setBranch(BRANCHES.find((b) => b.id === e.target.value))}>
            {BRANCHES.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select className="select" value={period.id} onChange={(e) => setPeriod(PERIODS.find((p) => p.id === e.target.value))}>
            {PERIODS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="input-search bz-search">{icons.search}<input placeholder="Клиент, визит, товар" /></div>
          <button className="bz-bell" onClick={() => setPanel({
            title: 'Уведомления', sub: '3 новых',
            body: [['Критические остатки', '4 позиции склада ниже минимума', '#E30611'], ['Потерянные клиенты', '12 клиентов не были 90 дней', '#f0862a'], ['Зарплаты', 'Ведомость за 1–15 августа не закрыта', '#E30611']]
              .map(([t, d, c]) => <div key={t} className="alert-row"><i style={{ background: c }} /><div><b>{t}</b><span>{d}</span></div></div>),
          })} aria-label="Уведомления">{icons.bell}<b>3</b></button>
        </div>
        <div className="bz-content">
          {sec === 'dashboard' && <Dashboard {...P} />}
          {sec === 'journal' && <Journal {...P} />}
          {sec === 'clients' && <Clients {...P} />}
          {sec === 'booking' && <Booking {...P} />}
          {sec === 'finance' && <Finance {...P} />}
          {sec === 'loyalty' && <Loyalty {...P} />}
          {sec === 'stock' && <Stock {...P} />}
          {sec === 'salary' && <Salary {...P} />}
          {sec === 'reports' && <Reports {...P} />}
          {sec === 'staff' && <Staff {...P} />}
          {sec === 'messaging' && <Messaging {...P} />}
          {sec === 'bset' && <BizSettings {...P} />}
        </div>
      </div>

      {panel && (
        <>
          <span className="pm-backdrop" style={{ zIndex: 140 }} onClick={() => setPanel(null)} />
          <div className="bz-panel">
            <button className="bz-panel-x" onClick={() => setPanel(null)} aria-label="Закрыть">{icons.close}</button>
            <h3>{panel.title}</h3>
            {panel.sub && <p className="bz-panel-sub">{panel.sub}</p>}
            <div className="bz-panel-body">{panel.body}</div>
            {panel.foot && <div className="bz-panel-foot">{panel.foot}</div>}
          </div>
        </>
      )}
    </div>
  )
}

const Head = ({ t, s, right }) => (
  <div className="bz-head">
    <div><h1>{t}</h1><p>{s}</p></div>
    <div className="bz-head-r">{right}</div>
  </div>
)

/* ═══ Дашборд ═══ */
function Dashboard({ ctx, K, branch, period, go }) {
  const kpi = [
    ['Выручка', money(2840000 * K), '+12,4%', true, [62, 58, 71, 66, 80, 74, 88, 79, 92, 86, 97, 104]],
    ['Записей', num(684 * K), '+8,1%', true, [18, 21, 19, 24, 22, 27, 25, 29, 26, 31, 30, 35]],
    ['Заполняемость', '78%', '+4 п.п.', true, [61, 64, 63, 68, 66, 71, 69, 73, 74, 76, 77, 78]],
    ['Средний чек', money(4152), '+3,9%', true, [38, 39, 37, 41, 40, 42, 41, 43, 43, 45, 44, 46]],
    ['Новых клиентов', num(68 * K), '−2,3%', false, [9, 11, 10, 12, 9, 13, 11, 10, 12, 11, 10, 8]],
    ['Отмены и неявки', num(41 * K), '−1,8 п.п.', true, [7, 6, 7, 5, 6, 4, 5, 4, 5, 4, 4, 3]],
  ]
  const rnd = makeRnd(9090)
  const rev = Array.from({ length: 15 }, (_, i) => 70 + i * 2 + Math.round((rnd() - 0.5) * 30))
  const prev = rev.map((v) => Math.round(v * 0.86 + (rnd() - 0.5) * 10))
  const mx = Math.max(...rev, ...prev) * 1.1
  const hours = ['09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20']
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  const rndH = makeRnd(5150)
  const hc = (v) => v > 85 ? '#E30611' : v > 70 ? '#FFA080' : v > 50 ? '#03A17B' : v > 30 ? '#8F8FFF' : '#E3E7EC'
  const alerts = [
    ['Критические остатки: 4 позиции', 'stock', '#E30611'], ['12 клиентов не были 90 дней', 'clients', '#f0862a'],
    ['Заполняемость среды — 41%', 'journal', '#f0862a'], ['Ведомость зарплат не закрыта', 'salary', '#E30611'],
  ]
  return (
    <div>
      <Head t="Дашборд" s={`Сеть «Viron» · ${branch.short} · ${period.name}`}
        right={<button className="btn-gray" style={{ width: 'auto' }} onClick={() => ctx.ping('Сводка выгружена в PDF (демо)')}>Экспорт сводки</button>} />
      <div className="bz-kpis">
        {kpi.map(([l, v, d, up, s]) => (
          <div key={l} className="bz-kpi">
            <div className="l">{l}</div><div className="v">{v}</div>
            <div className={`d ${up ? 'up' : 'down'}`}>{d}</div>
            <Mini vals={s} color={up ? '#26a95c' : '#E30611'} />
          </div>
        ))}
      </div>
      <div className="bz-grid21">
        <div className="card">
          <div className="bz-ct">Выручка за 30 дней <span className="bz-note">▮ текущий период · <i style={{ color: '#FFA080', fontStyle: 'normal' }}>—</i> прошлый</span></div>
          <svg viewBox="0 0 760 210" width="100%" height="200" preserveAspectRatio="none">
            {[0, 1, 2, 3].map((g) => <line key={g} x1="0" y1={200 - g * 60} x2="760" y2={200 - g * 60} stroke="var(--line)" strokeWidth="1" />)}
            {rev.map((v, i) => <rect key={i} x={i * 50 + 10} y={200 - (v / mx) * 190} width="30" height={(v / mx) * 190} rx="3" fill="#8F8FFF" opacity=".85" />)}
            <polyline points={prev.map((v, i) => `${i * 50 + 25},${(200 - (v / mx) * 190).toFixed(1)}`).join(' ')} fill="none" stroke="#FFA080" strokeWidth="2.4" />
          </svg>
        </div>
        <div className="card">
          <div className="bz-ct">Требует внимания</div>
          {alerts.map(([t, to, c]) => (
            <div key={t} className="alert-row"><i style={{ background: c }} /><div><span>{t}</span></div>
              <button className="link-inline" onClick={() => go(to)}>Открыть</button></div>
          ))}
        </div>
      </div>
      <div className="bz-grid3">
        <div className="card"><div className="bz-ct">Топ услуг</div>
          <Bars rows={[['Окрашивание', 482, money(482000 * K)], ['Маникюр', 356, money(356000 * K)], ['Мужская стрижка', 298, money(298000 * K)], ['Чистка лица', 241, money(241000 * K)], ['Ламинирование', 188, money(188000 * K)]]} /></div>
        <div className="card"><div className="bz-ct">Топ сотрудников</div>
          <Bars rows={MASTERS.slice(0, 5).map((m, i) => [m.n.split(' ')[0] + ' ' + m.n.split(' ')[1][0] + '.', 520 - i * 78, money((520000 - i * 78000) * K)])} color="#03A17B" /></div>
        <div className="card"><div className="bz-ct">Источники записей</div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <Donut parts={[['ЯК', 34, '#E30611'], ['2ГИС', 22, '#FFA080'], ['Соцсети', 18, '#8F8FFF'], ['Сайт', 14, '#03A17B'], ['Прочее', 12, '#6384E0']]} />
            <div className="bz-note" style={{ lineHeight: '22px' }}>
              {[['Яндекс Карты', 34, '#E30611'], ['2ГИС', 22, '#FFA080'], ['Соцсети', 18, '#8F8FFF'], ['Сайт', 14, '#03A17B'], ['Прочее', 12, '#6384E0']].map(([n, v, c]) => <div key={n}><i style={{ color: c, fontStyle: 'normal' }}>■</i> {n} — {v}%</div>)}
            </div>
          </div>
        </div>
      </div>
      <div className="bz-grid21">
        <div className="card">
          <div className="bz-ct">Загрузка по часам</div>
          <div className="bz-heat" style={{ gridTemplateColumns: `44px repeat(${hours.length},1fr)` }}><b /> {hours.map((h) => <b key={h}>{h}</b>)}</div>
          {days.map((d) => (
            <div key={d} className="bz-heat bz-heat-r" style={{ gridTemplateColumns: `44px repeat(${hours.length},1fr)` }}>
              <span>{d}</span>{hours.map((h) => { const v = 10 + Math.floor(rndH() * 90); return <i key={h} style={{ background: hc(v) }} title={`${v}%`} /> })}
            </div>
          ))}
          <div className="bz-note" style={{ marginTop: 10 }}>Доля занятых слотов. Красный — перегруз, серый — простой.</div>
        </div>
        <div className="card">
          <div className="bz-ct">Ближайшие визиты</div>
          {[['15:00 · Анетта А.', 'Окрашивание в один тон · Ольга Ковалёва · 4 800 ₽'], ['15:00 · Марина Б.', 'Ламинирование ресниц · Полина Реброва · 2 700 ₽'], ['16:00 · Екатерина С.', 'Чистка лица · Дина Шарипова · 3 900 ₽'], ['17:00 · Павел М.', 'Мужская стрижка · Артём Митров · 1 600 ₽']]
            .map(([t, d]) => <div key={t} className="bz-visit"><b>{t}</b><span>{d}</span></div>)}
          <div className="kv-row"><span>Осталось визитов сегодня</span><b>9</b></div>
          <div className="kv-row"><span>Свободных слотов до закрытия</span><b>11</b></div>
          <button className="btn-gray" style={{ width: '100%', marginTop: 12 }} onClick={() => go('journal')}>Открыть журнал</button>
        </div>
      </div>
    </div>
  )
}

/* ═══ Журнал записи ═══ */
function Journal({ ctx, branch, setPanel }) {
  const [visits, setVisits] = useState(buildVisits)
  const startI = 18, endI = 42
  const rows = Array.from({ length: endI - startI }, (_, i) => startI + i)
  const revenue = visits.filter((v) => v.st === 'paid').reduce((a, v) => a + v.sv.p, 0)
  const filled = visits.reduce((a, v) => a + v.len, 0) / (MASTERS.length * (endI - startI)) * 100
  const setStatus = (id, st, msg) => {
    setVisits((vs) => vs.map((v) => (v.id === id ? { ...v, st } : v)))
    setPanel(null)
    ctx.ping(msg)
  }
  const openVisit = (v) => {
    const disc = v.c.seg === 'vip' ? 0.15 : v.c.seg === 'regular' ? 0.1 : 0
    setPanel({
      title: v.c.name, sub: `${v.sv.n} · ${T(v.start)}–${T(v.start + v.len)}`,
      body: (
        <>
          {[['Клиент', <>{v.c.name} {chip(SEG_BADGE[v.c.seg])}</>], ['Телефон', v.c.phone], ['Сотрудник', MASTERS[v.m].n], ['Кабинет', `Зал ${v.m + 1}`], ['Услуга', `${v.sv.n} — ${money(v.sv.p)}`], ['Источник', v.online ? 'Онлайн-запись' : 'Администратор'], ['Статус', <b style={{ color: VST_STATUS[v.st][1] }}>{VST_STATUS[v.st][0]}</b>]]
            .map(([k, val]) => <div key={k} className="kv-row"><span>{k}</span><b>{val}</b></div>)}
          <div className="bz-ct" style={{ margin: '14px 0 6px' }}>Оплата</div>
          <div className="kv-row"><span>Услуги</span><b>{money(v.sv.p)}</b></div>
          <div className="kv-row"><span>Скидка по программе ({Math.round(disc * 100)}%)</span><b>−{money(v.sv.p * disc)}</b></div>
          <div className="kv-row"><span>К оплате</span><b style={{ fontSize: 16 }}>{money(v.sv.p * (1 - disc))}</b></div>
          <div className="bz-ct" style={{ margin: '14px 0 6px' }}>Заметка</div>
          <div className="bz-noteBox">{v.c.note}</div>
        </>
      ),
      foot: (
        <>
          <button className="btn-red" style={{ marginTop: 0 }} onClick={() => setStatus(v.id, 'came', 'Визит отмечен: клиент пришёл')}>Пришёл</button>
          <button className="btn-purple" style={{ marginTop: 0 }} onClick={() => setStatus(v.id, 'paid', `Оплата проведена — ${money(v.sv.p * (1 - disc))}`)}>Оплата</button>
          <button className="btn-gray" style={{ width: 'auto' }} onClick={() => setStatus(v.id, 'no', 'Визит отмечен: клиент не пришёл')}>Не пришёл</button>
        </>
      ),
    })
  }
  const newVisit = (mi, i) => {
    const sv = SRV[0]
    setPanel({
      title: 'Новая запись', sub: `${MASTERS[mi].n} · ${T(i)}`,
      body: (
        <>
          <div className="field"><label>Клиент</label><input placeholder="Поиск по базе или новый клиент" id="bz-nv-name" /></div>
          <div className="field"><label>Услуга</label>
            <select className="select" style={{ width: '100%' }} id="bz-nv-srv">{SRV.map((s) => <option key={s.n}>{s.n} · {money(s.p)}</option>)}</select>
          </div>
          {[['Сотрудник', `${MASTERS[mi].n} (${MASTERS[mi].g})`], ['Начало', T(i)], ['Кабинет (автоподбор)', `Зал ${mi + 1} — свободен`], ['Техперерыв после услуги', '15 мин']]
            .map(([k, val]) => <div key={k} className="kv-row"><span>{k}</span><b>{val}</b></div>)}
        </>
      ),
      foot: (
        <>
          <button className="btn-red" style={{ marginTop: 0 }} onClick={() => {
            const name = document.getElementById('bz-nv-name')?.value || 'Новый клиент'
            const svName = (document.getElementById('bz-nv-srv')?.value || '').split(' · ')[0]
            const s = SRV.find((x) => x.n === svName) || sv
            setVisits((vs) => [...vs, {
              id: 'nv' + Date.now(), m: mi, start: i, len: Math.max(1, Math.round(s.d / 30)), sv: s,
              c: { name, phone: '+7 900 000-00-00', seg: 'new', note: '—' }, st: 'conf', online: false, prepaid: false,
            }])
            setPanel(null)
            ctx.ping(`Запись создана: ${T(i)} · ${s.n}`)
          }}>Создать запись</button>
          <button className="btn-gray" style={{ width: 'auto' }} onClick={() => setPanel(null)}>Отмена</button>
        </>
      ),
    })
  }
  return (
    <div>
      <Head t="Журнал записи" s={`Пятница, 21 августа 2026 · ${branch.short}`}
        right={<button className="btn-red" style={{ marginTop: 0 }} onClick={() => newVisit(0, 20)}>Новая запись</button>} />
      <div className="chips-row">
        <span className="filter-chip active">День</span>
        <span className="filter-chip" onClick={() => ctx.ping('Недельный режим — в следующей итерации прототипа')}>Неделя</span>
        <span className="filter-chip">Все сотрудники · 5</span>
        <span className="filter-chip">Все услуги · 46</span>
        <span className="bz-jr-stat">Записей <b>{visits.length}</b> · Выручка <b>{money(revenue)}</b> · Заполняемость <b>{Math.round(filled)}%</b></span>
      </div>
      <div className="bz-jr-wrap">
        <div className="bz-jr card">
          <div className="bz-jr-head" style={{ gridTemplateColumns: `54px repeat(${MASTERS.length}, minmax(150px,1fr))` }}>
            <div />
            {MASTERS.map((m) => <div key={m.n}><b>{m.n.split(' ')[0]} {m.n.split(' ')[1][0]}.</b><small>{m.r} · {m.g}</small></div>)}
          </div>
          <div className="bz-jr-body" style={{ gridTemplateColumns: `54px repeat(${MASTERS.length}, minmax(150px,1fr))` }}>
            <div className="bz-jr-time">{rows.map((i) => <div key={i}>{i % 2 === 0 ? T(i) : ''}</div>)}</div>
            {MASTERS.map((m, mi) => (
              <div key={m.n} className="bz-jr-col">
                {rows.map((i) => <div key={i} className="bz-jr-cell" onClick={() => newVisit(mi, i)} />)}
                {visits.filter((v) => v.m === mi).map((v) => (
                  <div key={v.id} className="bz-jr-ev" style={{ top: (v.start - startI) * 30 + 2, height: v.len * 30 - 5 }}
                    onClick={(e) => { e.stopPropagation(); openVisit(v) }}>
                    <span style={{ background: VST_STATUS[v.st][1] }} />
                    <b>{T(v.start)} {v.c.name.split(' ')[0]}</b>
                    <i>{v.sv.n}</i>
                  </div>
                ))}
                {mi === 0 && <div className="bz-jr-now" style={{ top: (29 - startI) * 30 }} />}
              </div>
            ))}
          </div>
        </div>
        <div className="bz-jr-side">
          <div className="card">
            <div className="bz-ct">Лист ожидания</div>
            {[['Алина Титова', 'Окрашивание · любой мастер', 'сегодня после 16:00'], ['Вера Гущева', 'Маникюр · Марина С.', '18–19 сентября'], ['Софья Лапина', 'Чистка лица · Дина Ш.', 'любой день']]
              .map(([n, s, w]) => (
                <div key={n} className="bz-wait">
                  <b>{n}</b><span>{s}<br />{w}</span>
                  <button className="btn-gray" style={{ width: '100%', marginTop: 8 }} onClick={() => ctx.ping(`Клиенту «${n}» отправлено предложение слота`)}>Предложить слот</button>
                </div>
              ))}
          </div>
          <div className="card" style={{ marginTop: 12 }}>
            <div className="bz-ct">Статусы</div>
            {Object.values(VST_STATUS).map(([n, c]) => <div key={n} className="bz-note" style={{ padding: '3px 0' }}><i style={{ color: c, fontStyle: 'normal' }}>■</i> {n}</div>)}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══ Клиенты ═══ */
function Clients({ ctx, setPanel, go }) {
  const [seg, setSeg] = useState('all')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState({ f: 'ltv', dir: -1 })
  const SEGS = [['all', 'Все', 1284], ['new', 'Новые', 68], ['regular', 'Постоянные', 412], ['vip', 'VIP', 34], ['sleep', 'Потерянные', 96], ['bd', 'С днями рождения', 7]]
  let rows = CLIENTS.filter((c) => (seg === 'all' ? true : seg === 'bd' ? c.id % 7 === 0 : c.seg === seg))
    .filter((c) => (c.name + c.phone).toLowerCase().includes(q.toLowerCase()))
  rows = rows.slice().sort((a, b) => (a[sort.f] > b[sort.f] ? 1 : -1) * sort.dir)
  const th = (f, t) => (
    <th style={{ cursor: 'pointer' }} onClick={() => setSort((s) => (s.f === f ? { f, dir: -s.dir } : { f, dir: -1 }))}>
      {t}{sort.f === f ? (sort.dir > 0 ? ' ↑' : ' ↓') : ''}
    </th>
  )
  const openClient = (c) => setPanel({
    title: c.name, sub: `${SEG_BADGE[c.seg][0]} · LTV ${money(c.ltv)}`,
    body: (
      <>
        {[['Визитов', c.visits], ['Средний чек', money(c.avg)], ['LTV', money(c.ltv)], ['Бонусов на счёте', num(c.bonus)], ['Последний визит', `${c.last} дн. назад`], ['Любимый мастер', c.fav], ['Источник привлечения', c.src], ['Скидка по категории', c.seg === 'vip' ? '15%' : c.seg === 'regular' ? '10%' : '—']]
          .map(([k, v]) => <div key={k} className="kv-row"><span>{k}</span><b>{v}</b></div>)}
        <div className="bz-ct" style={{ margin: '14px 0 6px' }}>Заметки</div>
        <div className="bz-noteBox">{c.note}</div>
        <div className="bz-ct" style={{ margin: '14px 0 6px' }}>Коммуникации</div>
        {[['Напоминание о визите', 'Push · доставлено'], ['Акция «−20% на уход»', 'Соцсети · прочитано'], ['Запрос отзыва', 'SMS · оценка 5']]
          .map(([t, d]) => <div key={t} className="bz-visit"><b>{t}</b><span>{d}</span></div>)}
      </>
    ),
    foot: (
      <>
        <button className="btn-red" style={{ marginTop: 0 }} onClick={() => { setPanel(null); go('journal'); ctx.ping(`Выберите слот в журнале для ${c.name}`) }}>Записать</button>
        <button className="btn-gray" style={{ width: 'auto' }} onClick={() => ctx.ping('Чат с клиентом открыт (демо)')}>Написать</button>
        <button className="btn-gray" style={{ width: 'auto' }} onClick={() => ctx.ping('Начислено 500 бонусов')}>+500 бонусов</button>
      </>
    ),
  })
  return (
    <div>
      <Head t="Клиенты" s="База из 1 284 клиентов · сегменты, история, лояльность"
        right={<>
          <button className="btn-gray" style={{ width: 'auto' }} onClick={() => ctx.ping(`Рассылка по сегменту «${SEGS.find((s) => s[0] === seg)[1]}» — черновик создан`)}>Отправить рассылку</button>
          <button className="btn-red" style={{ marginTop: 0 }} onClick={() => ctx.ping('Форма добавления клиента — в следующей итерации')}>Добавить клиента</button>
        </>} />
      <div className="chips-row">
        {SEGS.map(([id, t, n]) => (
          <button key={id} className={`filter-chip${seg === id ? ' active' : ''}`} onClick={() => setSeg(id)}>{t} <b style={{ opacity: .55 }}>{num(n)}</b></button>
        ))}
      </div>
      <div className="card" style={{ padding: '12px 14px' }}>
        <div className="input-search" style={{ maxWidth: 320, marginBottom: 10 }}>{icons.search}<input placeholder="Поиск по имени или телефону" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="tbl-wrap" style={{ marginTop: 0, border: 'none' }}>
          <table className="tbl">
            <thead><tr>{th('name', 'Клиент')}{th('phone', 'Телефон')}{th('visits', 'Визитов')}{th('last', 'Последний визит')}{th('avg', 'Средний чек')}{th('ltv', 'LTV')}{th('bonus', 'Бонусы')}{th('seg', 'Категория')}{th('src', 'Источник')}</tr></thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} onClick={() => openClient(c)}>
                  <td><span className="ava">{c.ini}</span>{c.name}</td><td>{c.phone}</td><td>{c.visits}</td>
                  <td>{c.last} дн.</td><td>{money(c.avg)}</td><td><b>{money(c.ltv)}</b></td>
                  <td>{num(c.bonus)}</td><td>{chip(SEG_BADGE[c.seg])}</td><td>{c.src}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <p className="empty-note">В сегменте пока никого — измените фильтр.</p>}
      </div>
    </div>
  )
}

/* ═══ Онлайн-запись ═══ */
function Booking({ ctx }) {
  const [theme, setTheme] = useState('light')
  const [color, setColor] = useState('#8F8FFF')
  const [cats, setCats] = useState('tags')
  const sites = [['Яндекс Карты', 1, 214], ['2ГИС', 1, 138], ['Соцсети', 1, 112], ['Telegram', 0, 0], ['Мессенджер', 0, 0], ['Zoon', 1, 46], ['Сайт салона', 1, 88], ['QR-код в салоне', 1, 31]]
  return (
    <div>
      <Head t="Онлайн-запись" s="Форма записи, площадки размещения и источники визитов" />
      <div className="bz-grid2">
        <div className="card">
          <div className="bz-ct">Конструктор формы</div>
          <div className="kv-row"><span>Тема</span><b>
            <button className={`filter-chip${theme === 'light' ? ' active' : ''}`} onClick={() => setTheme('light')}>Светлая</button>{' '}
            <button className={`filter-chip${theme === 'dark' ? ' active' : ''}`} onClick={() => setTheme('dark')}>Тёмная</button></b></div>
          <div className="kv-row"><span>Цвет кнопок</span><b>
            {['#8F8FFF', '#E30611', '#03A17B', '#014FCE', '#1D2023'].map((c) => (
              <i key={c} onClick={() => setColor(c)} style={{ display: 'inline-block', width: 20, height: 20, borderRadius: 6, background: c, marginLeft: 6, cursor: 'pointer', outline: color === c ? '2px solid var(--text)' : 'none', outlineOffset: 2 }} />
            ))}</b></div>
          <div className="kv-row"><span>Вид категорий</span><b>
            <button className={`filter-chip${cats === 'tags' ? ' active' : ''}`} onClick={() => setCats('tags')}>Теги</button>{' '}
            <button className={`filter-chip${cats === 'list' ? ' active' : ''}`} onClick={() => setCats('list')}>Список</button></b></div>
          <div className="kv-row"><span>Предоплата за услуги</span><b>включена, 30%</b></div>
          <div className="kv-row"><span>Промоблок с акциями</span><b>включён</b></div>
          <div className="kv-row"><span>Продажа сертификатов</span><b>включена</b></div>
          <button className="btn-red" style={{ marginTop: 12 }} onClick={() => ctx.ping('Форма онлайн-записи сохранена')}>Сохранить форму</button>
        </div>
        <div className="card">
          <div className="bz-ct">Предпросмотр виджета</div>
          <div style={{ borderRadius: 14, border: '1px solid var(--line)', background: theme === 'dark' ? '#1D2023' : '#fff', color: theme === 'dark' ? '#fff' : '#1D2023', padding: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Салон красоты «Viron»</div>
            <div style={{ fontSize: 12, opacity: .6, margin: '2px 0 12px' }}>Цветной бульвар, 24 · Москва</div>
            <div style={{ fontSize: 12, opacity: .6, marginBottom: 8 }}>Шаг 1 · Услуга</div>
            {cats === 'tags'
              ? <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{['Стрижки', 'Окрашивание', 'Маникюр', 'Уход', 'Брови'].map((t) => (
                <span key={t} style={{ background: theme === 'dark' ? 'rgba(255,255,255,.1)' : '#F2F3F7', borderRadius: 100, padding: '5px 12px', fontSize: 12.5 }}>{t}</span>))}</div>
              : ['Стрижки', 'Окрашивание', 'Маникюр', 'Уход'].map((t) => (
                <div key={t} style={{ padding: '9px 0', borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,.1)' : '#EEF0F3'}`, fontSize: 13.5 }}>{t}</div>))}
            <div style={{ background: theme === 'dark' ? 'rgba(255,255,255,.06)' : '#F7F8FA', borderRadius: 10, padding: 12, margin: '12px 0', fontSize: 12.5 }}>
              <b>−20% на уход в будни до 14:00</b><br /><span style={{ opacity: .6 }}>Промоблок с акциями</span>
            </div>
            <button style={{ width: '100%', height: 44, borderRadius: 12, background: color, color: '#fff', fontSize: 14, fontWeight: 600 }}
              onClick={() => ctx.ping('Так выглядит форма для клиента (демо)')}>Продолжить</button>
          </div>
        </div>
      </div>
      <div className="bz-grid21">
        <div className="card">
          <div className="bz-ct">Площадки размещения <span className="bz-note">записей за 30 дней</span></div>
          <table className="tbl"><tbody>
            {sites.map(([n, on, cnt]) => (
              <tr key={n} style={{ cursor: 'default' }}><td style={{ width: '46%' }}>{n}</td>
                <td>{on ? chip(['Подключено', 'green']) : <button className="link-inline" onClick={() => ctx.ping(`«${n}» — подключение площадки (демо)`)}>Подключить</button>}</td>
                <td style={{ textAlign: 'right' }}>{on ? num(cnt) : '—'}</td></tr>
            ))}
          </tbody></table>
        </div>
        <div className="card">
          <div className="bz-ct">Источники записей</div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Donut parts={[['ЯК', 214, '#E30611'], ['2ГИС', 138, '#FFA080'], ['Соцсети', 112, '#8F8FFF'], ['Сайт', 88, '#03A17B'], ['Zoon', 46, '#6384E0'], ['QR', 31, '#2E00B2']]} />
          </div>
          <div className="kv-row" style={{ marginTop: 8 }}><span>Всего онлайн-записей</span><b>629</b></div>
          <div className="kv-row"><span>Доля онлайна</span><b>68%</b></div>
          <div className="kv-row"><span>Конверсия формы</span><b>41%</b></div>
        </div>
      </div>
    </div>
  )
}

/* ═══ Финансы ═══ */
function Finance({ ctx, K, branch }) {
  const months = ['мар', 'апр', 'май', 'июн', 'июл', 'авг']
  const inc = [2180, 2340, 2610, 2420, 2750, 2840], exp = [1490, 1520, 1660, 1580, 1720, 1780]
  const rnd = makeRnd(4004)
  const pays = Array.from({ length: 10 }, () => {
    const c = CLIENTS[Math.floor(rnd() * CLIENTS.length)], s = SRV[Math.floor(rnd() * SRV.length)]
    return { t: T(18 + Math.floor(rnd() * 24)), c: c.name, sum: s.p, m: ['СБП', 'Карта', 'Наличные', 'Предоплата', 'Сертификат'][Math.floor(rnd() * 5)], st: rnd() > 0.85 ? 'Возврат' : 'Проведён' }
  })
  return (
    <div>
      <Head t="Финансы" s={`Выручка, оплаты, кассовая смена и чаевые · ${branch.short}`} />
      <div className="bz-kpis" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
        {[['Выручка', money(2840000 * K)], ['Себестоимость', money(1780000 * K)], ['Валовая прибыль', money(1060000 * K)], ['Средний чек', money(4152)], ['Выручка на сотрудника', money(568000 * K)]]
          .map(([l, v]) => <div key={l} className="bz-kpi"><div className="l">{l}</div><div className="v" style={{ fontSize: 18 }}>{v}</div></div>)}
      </div>
      <div className="bz-grid21">
        <div className="card">
          <div className="bz-ct">Доходы и расходы, тыс. ₽ <span className="bz-note"><i style={{ color: '#8F8FFF', fontStyle: 'normal' }}>■</i> доходы · <i style={{ color: '#FFA080', fontStyle: 'normal' }}>■</i> расходы</span></div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, height: 170, paddingTop: 8 }}>
            {months.map((m, i) => (
              <div key={m} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end', justifyContent: 'center', height: 140 }}>
                  <div style={{ width: 20, height: inc[i] / 21, background: '#8F8FFF', borderRadius: 3 }} title={`Доход ${inc[i]} тыс`} />
                  <div style={{ width: 20, height: exp[i] / 21, background: '#FFA080', borderRadius: 3 }} title={`Расход ${exp[i]} тыс`} />
                </div>
                <div className="bz-note" style={{ marginTop: 6 }}>{m}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="bz-ct">Кассовая смена</div>
          {[['Открыта', '09:00, администратор Юлия'], ['Наличные', '18 400 ₽'], ['Безналичные', '42 100 ₽'], ['СБП', '23 700 ₽'], ['Итого за смену', '84 200 ₽']]
            .map(([k, v]) => <div key={k} className="kv-row"><span>{k}</span><b>{v}</b></div>)}
          <button className="btn-red" style={{ width: '100%', marginTop: 12 }} onClick={() => ctx.ping('Смена закрыта, Z-отчёт сформирован')}>Закрыть смену</button>
          <div className="bz-ct" style={{ margin: '16px 0 8px' }}>Чаевые за период</div>
          <Bars rows={MASTERS.slice(0, 4).map((m, i) => [m.n.split(' ')[0], 14000 - i * 2600, money((14000 - i * 2600) * K)])} color="#03A17B" />
        </div>
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <div className="bz-ct">Оплаты за сегодня</div>
        <table className="tbl">
          <thead><tr><th>Время</th><th>Клиент</th><th>Сумма</th><th>Способ</th><th>Статус</th></tr></thead>
          <tbody>{pays.map((p, i) => (
            <tr key={i} style={{ cursor: 'default' }}><td>{p.t}</td><td>{p.c}</td><td>{money(p.sum)}</td><td>{p.m}</td>
              <td>{chip(p.st === 'Возврат' ? ['Возврат', 'red'] : ['Проведён', 'green'])}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}

/* ═══ Лояльность ═══ */
function Loyalty({ ctx }) {
  const [tab, setTab] = useState('disc')
  const cats = [['Новый', '0–1 визит', '—', 68], ['Постоянный', 'от 5 визитов', '5%', 412], ['Лояльный', 'от 15 визитов', '10%', 190], ['VIP', 'от 29 визитов', '15%', 34]]
  return (
    <div>
      <Head t="Лояльность" s="Скидки, бонусы, сертификаты и рефералы — по всей сети" />
      <div className="chips-row">
        {[['disc', 'Скидки'], ['bon', 'Бонусы'], ['cert', 'Сертификаты и абонементы'], ['ref', 'Реферальная программа']].map(([id, t]) => (
          <button key={id} className={`filter-chip${tab === id ? ' active' : ''}`} onClick={() => setTab(id)}>{t}</button>
        ))}
      </div>
      {tab === 'disc' && (
        <div className="card">
          <div className="bz-ct">Правила скидок <button className="btn-gray" style={{ width: 'auto' }} onClick={() => ctx.ping('Конструктор правила — в следующей итерации')}>Добавить правило</button></div>
          <table className="tbl">
            <thead><tr><th>Условие</th><th>Тип</th><th>Размер</th><th>Область</th><th>Статус</th></tr></thead>
            <tbody>{[['Категория «Постоянный»', 'Фиксированная', '5%', 'Все услуги', 1], ['Категория «Лояльный»', 'Фиксированная', '10%', 'Все услуги', 1], ['Категория «VIP»', 'Фиксированная', '15%', 'Услуги и товары', 1], ['Сумма визитов от 50 000 ₽', 'Накопительная', 'до 12%', 'Все услуги', 1], ['Будни до 14:00, уход', 'Акция до 31.10', '20%', 'Категория «Уход»', 0]]
              .map((r, i) => <tr key={i} style={{ cursor: 'default' }}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{chip(r[4] ? ['Активно', 'green'] : ['Тест', 'orange'])}</td></tr>)}</tbody>
          </table>
        </div>
      )}
      {tab === 'bon' && (
        <div className="bz-grid2">
          <div className="card"><div className="bz-ct">Параметры бонусной программы</div>
            {[['Начисление с визита', '5%'], ['Начисление с товаров', '7%'], ['Максимум списания за визит', '30%'], ['Срок сгорания', '12 месяцев'], ['Действует', 'во всей сети']]
              .map(([k, v]) => <div key={k} className="kv-row"><span>{k}</span><b>{v}</b></div>)}</div>
          <div className="card"><div className="bz-ct">Начислено и списано, тыс. ₽</div>
            <Bars rows={[['Март', 186, '186'], ['Апрель', 204, '204'], ['Май', 241, '241'], ['Июнь', 218, '218'], ['Июль', 262, '262'], ['Август', 288, '288']]} color="#03A17B" />
            <div className="kv-row" style={{ marginTop: 8 }}><span>Остаток бонусов у клиентов</span><b>1 284 600 баллов</b></div></div>
        </div>
      )}
      {tab === 'cert' && (
        <div className="card">
          <div className="bz-ct">Сертификаты и абонементы</div>
          <table className="tbl">
            <thead><tr><th>Номинал / пакет</th><th>Продано</th><th>Активно</th><th>Погашено</th><th>Выручка</th><th>Онлайн-продажа</th></tr></thead>
            <tbody>{[['Сертификат 3 000 ₽', 42, 18, 24, 126000], ['Сертификат 5 000 ₽', 31, 14, 17, 155000], ['Сертификат 10 000 ₽', 12, 6, 6, 120000], ['Абонемент «Маникюр ×10»', 26, 11, 15, 187200], ['Абонемент «Уход ×5»', 18, 9, 9, 144000]]
              .map((r, i) => <tr key={i} style={{ cursor: 'default' }}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{money(r[4])}</td><td>{chip(['включена', 'green'])}</td></tr>)}</tbody>
          </table>
        </div>
      )}
      {tab === 'ref' && (
        <div className="bz-grid2">
          <div className="card"><div className="bz-ct">Условия</div>
            {[['Приглашающему', '500 бонусов после визита друга'], ['Приглашённому', 'скидка 15% на первый визит'], ['Канал', 'ссылка и QR в приложении']]
              .map(([k, v]) => <div key={k} className="kv-row"><span>{k}</span><b>{v}</b></div>)}</div>
          <div className="card"><div className="bz-ct">Результат за 6 месяцев</div>
            {[['Приведено клиентов', '184'], ['Из них вернулись повторно', '119 (65%)'], ['Выручка от рефералов', '742 000 ₽']]
              .map(([k, v]) => <div key={k} className="kv-row"><span>{k}</span><b>{v}</b></div>)}</div>
        </div>
      )}
      <div className="bz-kpis" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginTop: 14 }}>
        {cats.map(([n, cond, d, cnt]) => (
          <div key={n} className="bz-kpi"><div className="l">{n}</div>
            <div className="bz-note">Условие: {cond}<br />Скидка: {d}</div>
            <div className="v" style={{ marginTop: 8 }}>{num(cnt)}</div><div className="bz-note">клиентов в категории</div></div>
        ))}
      </div>
    </div>
  )
}

/* ═══ Склад ═══ */
function Stock({ ctx, branch }) {
  const [tab, setTab] = useState('goods')
  const STOCK = [
    ['SKU-1041', 'Краситель 6.0 натуральный', 'Расходники', 4, 10, 640, 0, 7.2],
    ['SKU-1088', 'Окислитель 6%', 'Расходники', 12, 8, 310, 0, 5.1],
    ['SKU-2210', 'Шампунь глубокой очистки 1 л', 'Товары', 6, 5, 1180, 2190, 3.4],
    ['SKU-2230', 'Маска восстанавливающая 500 мл', 'Товары', 3, 6, 1640, 2890, 2.8],
    ['SKU-3301', 'Гель-лак розовый', 'Расходники', 9, 6, 420, 0, 6.0],
    ['SKU-3318', 'Базовое покрытие', 'Расходники', 2, 8, 380, 0, 8.4],
    ['SKU-4402', 'Сыворотка для лица 30 мл', 'Товары', 11, 4, 2100, 3690, 2.1],
    ['SKU-4410', 'Перчатки нитриловые, 100 шт', 'Расходники', 5, 10, 690, 0, 9.6],
    ['SKU-5522', 'Состав для ламинирования', 'Расходники', 7, 5, 1340, 0, 4.2],
  ]
  const rows = STOCK.filter((s) => (tab === 'goods' ? s[2] === 'Товары' : s[2] === 'Расходники'))
  return (
    <div>
      <Head t="Склад" s={`Товары, расходники, поставки и техкарты · ${branch.short}`} />
      <div className="bz-kpis" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="bz-kpi"><div className="l">Критических остатков</div><div className="v" style={{ color: '#E30611' }}>4</div><div className="bz-note">по 2 категориям</div></div>
        <div className="bz-kpi"><div className="l">Списано за месяц</div><div className="v" style={{ fontSize: 18 }}>{money(214600 * branch.k)}</div><div className="d up">−4,1% к плану</div></div>
        <div className="bz-kpi"><div className="l">Потери и перерасход</div><div className="v">1,8%</div><div className="d up">−0,6 п.п.</div></div>
      </div>
      <div className="chips-row">
        {[['goods', 'Товары на продажу'], ['cons', 'Расходники'], ['sup', 'Поставки'], ['tech', 'Технологические карты']].map(([id, t]) => (
          <button key={id} className={`filter-chip${tab === id ? ' active' : ''}`} onClick={() => setTab(id)}>{t}</button>
        ))}
      </div>
      {(tab === 'goods' || tab === 'cons') && (
        <div className="card">
          <div className="bz-ct">{tab === 'goods' ? 'Товары на продажу' : 'Расходные материалы'}
            <button className="btn-gray" style={{ width: 'auto' }} onClick={() => ctx.ping('Импорт остатков — загрузите CSV (демо)')}>Импорт остатков</button></div>
          <table className="tbl">
            <thead><tr><th>SKU</th><th>Наименование</th><th>Остаток</th><th>Минимум</th><th>Себестоимость</th>{tab === 'goods' && <th>Цена</th>}<th>Оборачиваемость</th><th>Статус</th></tr></thead>
            <tbody>{rows.map((s) => (
              <tr key={s[0]} style={{ cursor: 'default', background: s[3] < s[4] ? 'var(--neg-soft)' : 'none' }}>
                <td>{s[0]}</td><td>{s[1]}</td><td>{s[3]}</td><td>{s[4]}</td><td>{money(s[5])}</td>
                {tab === 'goods' && <td>{money(s[6])}</td>}<td>{s[7]} дн.</td>
                <td>{chip(s[3] < s[4] ? ['Критический остаток', 'red'] : ['В норме', 'green'])}</td></tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {tab === 'sup' && (
        <div className="card">
          <div className="bz-ct">Поставки <button className="btn-red" style={{ marginTop: 0 }} onClick={() => ctx.ping('Заказ поставщику сформирован по позициям ниже минимума')}>Создать заказ</button></div>
          <table className="tbl">
            <thead><tr><th>Дата</th><th>Поставщик</th><th>Позиций</th><th>Сумма</th><th>Статус</th></tr></thead>
            <tbody>{[['14.08.2026', '«Космопрофф»', 14, 86400, 1], ['07.08.2026', '«БьютиОпт»', 8, 42100, 1], ['31.07.2026', '«Космопрофф»', 21, 131900, 1], ['21.08.2026', '«БьютиОпт»', 6, 28700, 0]]
              .map((r, i) => <tr key={i} style={{ cursor: 'default' }}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{money(r[3])}</td><td>{chip(r[4] ? ['Принята', 'green'] : ['Ожидает', 'orange'])}</td></tr>)}</tbody>
          </table>
        </div>
      )}
      {tab === 'tech' && (
        <div className="card">
          <div className="bz-ct">Техкарты — норма списания на одну процедуру</div>
          <table className="tbl">
            <thead><tr><th>Услуга</th><th>Расходник</th><th>Норма</th><th>Себестоимость</th><th>Автосписание</th></tr></thead>
            <tbody>{[['Окрашивание в один тон', 'Краситель 6.0', '60 г', 384], ['Окрашивание в один тон', 'Окислитель 6%', '90 мл', 279], ['Маникюр с покрытием', 'Гель-лак', '4 мл', 168], ['Чистка лица', 'Сыворотка', '5 мл', 350], ['Мужская стрижка', 'Перчатки', '1 пара', 7]]
              .map((r, i) => <tr key={i} style={{ cursor: 'default' }}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{money(r[3])}</td><td>{chip(['включено', 'green'])}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ═══ Зарплаты ═══ */
function Salary({ ctx, branch, setPanel }) {
  const [calc, setCalc] = useState(false)
  const rnd = makeRnd(6060)
  const rows = MASTERS.map((m, i) => {
    const base = 28000, svc = 52000 + Math.floor(rnd() * 42000), goods = 4000 + Math.floor(rnd() * 12000)
    const plan = rnd() > 0.4 ? 9000 : 0, cons = 3000 + Math.floor(rnd() * 6000), fine = rnd() > 0.8 ? 2000 : 0
    return { m, base, svc, goods, plan, cons, fine, total: base + svc + goods + plan - cons - fine, paid: i < 3 }
  })
  const fot = rows.reduce((a, r) => a + r.total, 0)
  return (
    <div>
      <Head t="Расчёт зарплат" s={`Период 01–15 августа 2026 · ${branch.short}`}
        right={<button className="btn-red" style={{ marginTop: 0 }} onClick={() => { setCalc(true); ctx.ping('Ведомость рассчитана') }}>{calc ? 'Пересчитать' : 'Рассчитать'}</button>} />
      <div className="bz-kpis" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="bz-kpi"><div className="l">ФОТ за период</div><div className="v" style={{ fontSize: 18 }}>{calc ? money(fot * branch.k) : '—'}</div><div className="bz-note">{calc ? '+6,2% к прошлому' : 'не рассчитан'}</div></div>
        <div className="bz-kpi"><div className="l">Доля ФОТ в выручке</div><div className="v">{calc ? '38%' : '—'}</div><div className="d up">{calc ? 'норма до 42%' : ''}</div></div>
        <div className="bz-kpi"><div className="l">Выплачено</div><div className="v" style={{ fontSize: 18 }}>{calc ? money(rows.filter((r) => r.paid).reduce((a, r) => a + r.total, 0) * branch.k) : '—'}</div><div className="bz-note">{calc ? '3 из 5 сотрудников' : ''}</div></div>
      </div>
      {calc ? (
        <div className="card">
          <div className="bz-ct">Расчётная ведомость</div>
          <table className="tbl">
            <thead><tr><th>Сотрудник</th><th>Ставка</th><th>% с услуг</th><th>% с товаров</th><th>Бонус за план</th><th>Расходники</th><th>Штрафы</th><th>Итого</th><th>Статус</th></tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.m.n} onClick={() => setPanel({
                title: r.m.n, sub: 'Детализация начислений за период',
                body: SRV.slice(0, 6).map((s) => <div key={s.n} className="bz-visit"><b>{s.n} — {money(s.p)}</b><span>процент мастера {money(s.p * 0.3)} · расходники −{money(s.p * 0.09)}</span></div>),
                foot: <button className="btn-red" style={{ marginTop: 0 }} onClick={() => { setPanel(null); ctx.ping(`Выплата ${r.m.n} проведена (демо)`) }}>Выплатить</button>,
              })}>
                <td><span className="ava">{r.m.n[0]}{r.m.n.split(' ')[1][0]}</span>{r.m.n}</td>
                <td>{money(r.base)}</td><td>{money(r.svc)}</td><td>{money(r.goods)}</td>
                <td>{r.plan ? money(r.plan) : '—'}</td><td>−{money(r.cons)}</td><td>{r.fine ? '−' + money(r.fine) : '—'}</td>
                <td><b>{money(r.total)}</b></td><td>{chip(r.paid ? ['Выплачено', 'green'] : ['К выплате', 'orange'])}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : (
        <div className="card"><div className="bz-empty"><b>Ведомость за период не рассчитана</b>
          <p>Нажмите «Рассчитать» — расчёт по 15 сотрудникам занимает около 15 минут вручную и секунды здесь</p></div></div>
      )}
      <div className="card" style={{ marginTop: 14 }}>
        <div className="bz-ct">Схема расчёта</div>
        <div className="bz-grid2" style={{ marginTop: 0 }}>
          <div>{[['Процент с услуг', '35% (Grade A) / 30% (B) / 25% (C)'], ['Процент с товаров', '10% от розничной цены'], ['План по обороту', '180 000 ₽ / период'], ['Надбавка за план', '+5 п.п. к проценту']].map(([k, v]) => <div key={k} className="kv-row"><span>{k}</span><b>{v}</b></div>)}</div>
          <div>{[['Учёт акций и скидок', 'процент от суммы со скидкой'], ['Себестоимость расходников', 'вычитается из базы'], ['История выплат', 'хранится за всё время']].map(([k, v]) => <div key={k} className="kv-row"><span>{k}</span><b>{v}</b></div>)}</div>
        </div>
      </div>
    </div>
  )
}

/* ═══ Отчёты и аналитика ═══ */
function Reports({ ctx, branch, period }) {
  const [rep, setRep] = useState(null)
  const DEFS = {
    srv: ['Востребованность услуг', 'Какие услуги приносят выручку и как меняется спрос', ['Услуга', 'Визитов', 'Выручка', 'Доля'], () => { const r = makeRnd(11); return SRV.slice(0, 10).map((s) => { const v = 28 + Math.floor(r() * 150); return [s.n, v, money(v * s.p), (v / 9).toFixed(1) + '%'] }) }],
    staff: ['Востребованность персонала', 'Нагрузка и результат каждого мастера', ['Сотрудник', 'Визитов', 'Выручка', 'Заполняемость'], () => { const r = makeRnd(12); return MASTERS.map((m) => { const v = 90 + Math.floor(r() * 100); return [m.n, v, money(v * 4100), (58 + Math.floor(r() * 34)) + '%'] }) }],
    eff: ['Эффективность сотрудников', 'Чек, возвращаемость, допродажи и рейтинг', ['Сотрудник', 'Выручка', 'Средний чек', 'Возвращаемость', 'Рейтинг'], () => { const r = makeRnd(13); return MASTERS.map((m) => { const v = 90 + Math.floor(r() * 100), rev = v * (3200 + Math.floor(r() * 2200)); return [m.n, money(rev), money(rev / v), (44 + Math.floor(r() * 34)) + '%', m.rate] }) }],
    vip: ['Важные клиенты', 'Кто приносит больше всего денег', ['Клиент', 'Визитов', 'LTV', 'Средний чек', 'Категория'], () => CLIENTS.slice().sort((a, b) => b.ltv - a.ltv).slice(0, 10).map((c) => [c.name, c.visits, money(c.ltv), money(c.avg), SEG_BADGE[c.seg][0]])],
    src: ['Источники записей', 'Откуда приходят записи и какая у них конверсия', ['Источник', 'Записей', 'Пришли', 'Конверсия'], () => [['Яндекс Карты', 214, 182, '85%'], ['2ГИС', 138, 119, '86%'], ['Соцсети', 112, 92, '82%'], ['Сайт', 88, 79, '90%'], ['Zoon', 46, 36, '78%'], ['QR в салоне', 31, 29, '94%']]],
    fill: ['Заполняемость мест', 'Соотношение рабочих часов и простоя', ['День недели', 'Рабочих часов', 'Занято', 'Заполняемость'], () => { const r = makeRnd(15); return ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'].map((d) => { const b = 24 + Math.floor(r() * 31); return [d, '60 ч', b + ' ч', Math.round(b / 60 * 100) + '%'] }) }],
    canc: ['Статистика отмен', 'Отмены, неявки и потерянная выручка', ['Причина', 'Количество', 'Доля', 'Потерянная выручка'], () => [['Клиент отменил заранее', 26, '46%', money(104000)], ['Не пришёл без предупреждения', 14, '25%', money(58000)], ['Отмена салоном', 9, '16%', money(37000)], ['Перенос на другую дату', 7, '13%', money(0)]]],
    lost: ['Потерянные клиенты', 'Кто не возвращался дольше 90 дней', ['Клиент', 'Визитов было', 'Последний визит', 'LTV', 'Любимый мастер'], () => CLIENTS.filter((c) => c.last > 60).slice(0, 10).map((c) => [c.name, c.visits, c.last + ' дн. назад', money(c.ltv), c.fav])],
    net: ['Сетевая статистика', 'Сравнение филиалов на одном экране', ['Филиал', 'Выручка', 'Визитов', 'Средний чек', 'Заполняемость'], () => [['Цветной бульвар', money(2840000), 684, money(4152), '78%'], ['Хамовники', money(2044800), 512, money(3994), '71%'], ['Марьино', money(1448400), 366, money(3957), '64%']]],
  }
  if (rep) {
    const [t, s, cols, rowsFn] = DEFS[rep]
    const rows = rowsFn()
    return (
      <div>
        <Head t={t} s={`${branch.short} · ${period.name}`}
          right={<>
            <button className="btn-gray" style={{ width: 'auto' }} onClick={() => setRep(null)}>← Все отчёты</button>
            <button className="btn-gray" style={{ width: 'auto' }} onClick={() => ctx.ping('CSV сформирован (демо)')}>Экспорт CSV</button>
          </>} />
        <div className="card">
          <table className="tbl">
            <thead><tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>{rows.map((r, i) => <tr key={i} style={{ cursor: 'default' }}>{r.map((v, j) => <td key={j}>{v}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </div>
    )
  }
  return (
    <div>
      <Head t="Отчёты и аналитика" s="9 отчётов по клиентам, персоналу, услугам и сети" />
      <div className="bz-grid3">
        {Object.entries(DEFS).map(([k, [t, s]]) => (
          <button key={k} className="card bz-tile" onClick={() => setRep(k)}><b>{t}</b><span>{s}</span></button>
        ))}
      </div>
    </div>
  )
}

/* ═══ Сотрудники ═══ */
function Staff({ ctx, K }) {
  const rnd = makeRnd(808)
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  return (
    <div>
      <Head t="Сотрудники" s="5 мастеров · график, загрузка и права доступа"
        right={<button className="btn-red" style={{ marginTop: 0 }} onClick={() => ctx.ping('Карточка нового сотрудника (демо)')}>Добавить сотрудника</button>} />
      <div className="bz-grid3">
        {MASTERS.map((m) => (
          <div key={m.n} className="card">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
              <span className="ava" style={{ width: 42, height: 42, fontSize: 14 }}>{m.n[0]}{m.n.split(' ')[1][0]}</span>
              <div><b style={{ display: 'block' }}>{m.n}</b><span className="bz-note">{m.r} · {m.g}</span></div>
            </div>
            {[['Услуги', m.sv], ['Загрузка', `${58 + Math.floor(rnd() * 34)}%`], ['Выручка за период', money((320 + Math.floor(rnd() * 300)) * 1000 * K)], ['Рейтинг', `${m.rate} ★`]]
              .map(([k, v]) => <div key={k} className="kv-row"><span>{k}</span><b>{v}</b></div>)}
          </div>
        ))}
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <div className="bz-ct">График работы на неделю</div>
        <div className="bz-heat" style={{ gridTemplateColumns: '150px repeat(7,1fr)' }}><b /> {days.map((d) => <b key={d}>{d}</b>)}</div>
        {MASTERS.map((m) => (
          <div key={m.n} className="bz-heat bz-heat-r" style={{ gridTemplateColumns: '150px repeat(7,1fr)' }}>
            <span>{m.n}</span>{days.map((d) => { const w = rnd() > 0.25; return <i key={d} style={{ background: w ? 'var(--green-soft)' : 'var(--bg)', border: '1px solid var(--line)' }} title={w ? '09:00–21:00' : 'выходной'} /> })}
          </div>
        ))}
        <div className="bz-note" style={{ marginTop: 10 }}>Цветной — рабочий день, серый — выходной</div>
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <div className="bz-ct">Права доступа</div>
        <table className="tbl">
          <thead><tr><th>Раздел</th><th>Владелец</th><th>Управляющий</th><th>Администратор</th><th>Мастер</th></tr></thead>
          <tbody>{[['Дашборд', 'полный', 'полный', '—', '—'], ['Журнал записи', 'полный', 'полный', 'полный', 'своё расписание'], ['Клиенты', 'полный', 'полный', 'полный', 'только свои'], ['Финансы', 'полный', 'полный', 'касса', '—'], ['Зарплаты', 'полный', 'просмотр', '—', 'своя'], ['Склад', 'полный', 'полный', 'полный', '—'], ['Настройки', 'полный', 'частично', '—', '—']]
            .map((r, i) => <tr key={i} style={{ cursor: 'default' }}>{r.map((v, j) => <td key={j}>{v === '—' ? <span style={{ color: 'var(--gray-light)' }}>—</span> : v}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  )
}

/* ═══ Уведомления и рассылки ═══ */
function Messaging({ ctx }) {
  const [scen, setScen] = useState([
    ['Подтверждение записи', 'сразу после записи', 'Push в приложении', true, '98%', '—'],
    ['Напоминание за 24 часа', 'за сутки до визита', 'Push + соцсети', true, '96%', '+7% доходимость'],
    ['Напоминание за 2 часа', 'за 2 часа до визита', 'SMS', true, '99%', '+4% доходимость'],
    ['Запрос отзыва', 'через 2 часа после визита', 'Push', true, '91%', '4,8 средняя оценка'],
    ['Поздравление с днём рождения', 'в день рождения', 'Push + соцсети', true, '94%', '18% визитов за 2 недели'],
    ['Возврат потерянного клиента', '90 дней без визита', 'SMS', false, '—', '—'],
  ])
  return (
    <div>
      <Head t="Уведомления и рассылки" s="Автосценарии, каналы и массовые рассылки" />
      <div className="card">
        <div className="bz-ct">Автоматические сценарии <span className="bz-note">клик по строке включает и выключает</span></div>
        <table className="tbl">
          <thead><tr><th>Сценарий</th><th>Когда</th><th>Канал</th><th>Статус</th><th>Доставка</th><th>Эффект</th></tr></thead>
          <tbody>{scen.map((s, i) => (
            <tr key={s[0]} onClick={() => { setScen((xs) => xs.map((x, j) => (j === i ? [x[0], x[1], x[2], !x[3], x[4], x[5]] : x))); ctx.ping(`${s[0]}: ${s[3] ? 'выключен' : 'включён'}`) }}>
              <td>{s[0]}</td><td>{s[1]}</td><td>{s[2]}</td>
              <td>{chip(s[3] ? ['Включён', 'green'] : ['Выключен', 'orange'])}</td><td>{s[4]}</td><td>{s[5]}</td></tr>
          ))}</tbody>
        </table>
      </div>
      <div className="bz-grid21">
        <div className="card">
          <div className="bz-ct">Воронка продаж</div>
          {[['Просмотр формы записи', 4820, 100], ['Начал запись', 1640, 34], ['Записался', 629, 13], ['Пришёл', 534, 11], ['Оплатил', 528, 11], ['Вернулся в 90 дней', 359, 7.4]]
            .map(([n, v, w], i) => (
              <div key={n} className="bar-row">
                <span className="bar-label" style={{ width: 190, minWidth: 150, fontSize: 13 }}>{n}</span>
                <span className="bar-track"><i className="bar-fill" style={{ width: `${w}%`, background: ['#8F8FFF', '#7B6CE8', '#6B5BD6', '#5B4AC8', '#03A17B', '#00724D'][i] }} /></span>
                <span className="bar-val" style={{ width: 90 }}>{num(v)}</span>
              </div>
            ))}
        </div>
        <div className="card">
          <div className="bz-ct">Массовая рассылка</div>
          {[['Сегмент', 'Потерянные · 96'], ['Канал', 'Push + соцсети'], ['Стоимость', '0 ₽']].map(([k, v]) => <div key={k} className="kv-row"><span>{k}</span><b>{v}</b></div>)}
          <div className="bz-ct" style={{ margin: '12px 0 6px' }}>Текст</div>
          <div className="bz-noteBox">Скучаем! Возвращайтесь — дарим 500 бонусов на любой уход до 30 сентября.</div>
          <button className="btn-red" style={{ width: '100%', marginTop: 12 }} onClick={() => ctx.ping('Рассылка поставлена в очередь — 96 получателей')}>Отправить 96 клиентам</button>
        </div>
      </div>
    </div>
  )
}

/* ═══ Настройки кабинета ═══ */
function BizSettings({ ctx }) {
  const [tab, setTab] = useState('comp')
  return (
    <div>
      <Head t="Настройки" s="Компания, услуги, ресурсы, интеграции и тариф" />
      <div className="chips-row">
        {[['comp', 'Компания и филиалы'], ['srv', 'Услуги и цены'], ['res', 'Ресурсы'], ['int', 'Интеграции'], ['tar', 'Тариф и оплата']].map(([id, t]) => (
          <button key={id} className={`filter-chip${tab === id ? ' active' : ''}`} onClick={() => setTab(id)}>{t}</button>
        ))}
      </div>
      {tab === 'comp' && (
        <div className="card"><div className="bz-ct">Филиалы</div>
          <table className="tbl">
            <thead><tr><th>Филиал</th><th>Адрес</th><th>Сотрудников</th><th>Кресел</th><th>Режим</th><th>Статус</th></tr></thead>
            <tbody>{[['Viron · Цветной бульвар', 'Москва, Цветной бульвар, 24', 5, 6, '09:00–21:00'], ['Viron · Хамовники', 'Москва, ул. Льва Толстого, 8', 4, 5, '10:00–21:00'], ['Viron · Марьино', 'Москва, Люблинская, 102', 3, 4, '10:00–20:00']]
              .map((r, i) => <tr key={i} style={{ cursor: 'default' }}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td><td>{chip(['Активен', 'green'])}</td></tr>)}</tbody>
          </table></div>
      )}
      {tab === 'srv' && (
        <div className="card"><div className="bz-ct">Услуги, цены и длительность по грейдам</div>
          <table className="tbl">
            <thead><tr><th>Услуга</th><th>Категория</th><th>Grade A</th><th>Grade B</th><th>Grade C</th><th>Длительность</th></tr></thead>
            <tbody>{SRV.map((s) => (
              <tr key={s.n} style={{ cursor: 'default' }}><td>{s.n}</td><td>{s.p > 3000 ? 'Премиум' : 'Базовая'}</td>
                <td>{money(s.p * 1.15)}</td><td>{money(s.p)}</td><td>{money(s.p * 0.88)}</td><td>{s.d} мин</td></tr>
            ))}</tbody>
          </table></div>
      )}
      {tab === 'res' && (
        <div className="card"><div className="bz-ct">Кабинеты и оборудование</div>
          <table className="tbl">
            <thead><tr><th>Ресурс</th><th>Тип</th><th>Филиал</th><th>Занятость сегодня</th><th>Автопроверка</th></tr></thead>
            <tbody>{[['Зал 1', 'Парикмахерский', 'Цветной бульвар', '78%'], ['Зал 2', 'Парикмахерский', 'Цветной бульвар', '64%'], ['Кабинет косметолога', 'Косметология', 'Цветной бульвар', '52%'], ['Маникюрный стол 1', 'Маникюр', 'Цветной бульвар', '88%'], ['Аппарат для чистки', 'Оборудование', 'Цветной бульвар', '41%']]
              .map((r, i) => <tr key={i} style={{ cursor: 'default' }}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{chip(['включена', 'green'])}</td></tr>)}</tbody>
          </table></div>
      )}
      {tab === 'int' && (
        <div className="bz-grid3">
          {[['Яндекс Карты', 'Площадка записи', 1], ['2ГИС', 'Площадка записи', 1], ['Соцсети', 'Уведомления', 1], ['Telegram-бот', 'Чат-бот', 0], ['SMS-агрегатор', 'Уведомления', 1], ['Приём оплаты и СБП', 'Платежи', 1], ['Онлайн-касса', 'Фискализация', 1], ['Сквозная аналитика', 'Маркетинг', 0], ['1С: Бухгалтерия', 'Учёт', 0]]
            .map(([n, d, on]) => (
              <div key={n} className="card bz-tile" style={{ cursor: 'default' }}>
                <b>{n}</b><span>{d}</span>
                <div style={{ marginTop: 10 }}>{on ? chip(['Подключено', 'green']) : <button className="link-inline" onClick={() => ctx.ping(`«${n}» — подключение (демо)`)}>Подключить</button>}</div>
              </div>
            ))}
        </div>
      )}
      {tab === 'tar' && (
        <div className="bz-grid2">
          <div className="card"><div className="bz-ct">Текущий тариф</div>
            {[['Тариф', '«Бизнес»'], ['Оплачен до', '18.10.2026'], ['Стоимость', '4 900 ₽ / месяц'], ['Филиалов', '3 из 3'], ['Сотрудников', '12 из 15']].map(([k, v]) => <div key={k} className="kv-row"><span>{k}</span><b>{v}</b></div>)}
            <button className="btn-red" style={{ marginTop: 12 }} onClick={() => ctx.ping('Продление тарифа — оплата со счёта МТС Бизнеса (демо)')}>Продлить тариф</button></div>
          <div className="card"><div className="bz-ct">История оплат</div>
            <table className="tbl"><tbody>{[['18.08.2026', 'Тариф «Бизнес», месяц', '4 900 ₽'], ['02.08.2026', 'SMS-пакет 2 000 шт', '7 800 ₽'], ['18.07.2026', 'Тариф «Бизнес», месяц', '4 900 ₽']]
              .map((r, i) => <tr key={i} style={{ cursor: 'default' }}><td>{r[0]}</td><td>{r[1]}</td><td style={{ textAlign: 'right' }}>{r[2]}</td></tr>)}</tbody></table></div>
        </div>
      )}
    </div>
  )
}
