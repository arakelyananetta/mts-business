'use client'

import { useState } from 'react'
import { icons } from './ui'

/* ═══════════════════════════════════════════════════════════
   «Налоги и бухгалтерия» — кабинет онлайн-бухгалтерии салона
   (по референсу кабинета для отрасли «красота и тело»,
   адаптирован под ИП Сиванева и Салон красоты «Viron»)
   ═══════════════════════════════════════════════════════════ */

const money = (n) => Math.round(n).toLocaleString('ru-RU') + ' ₽'
const num = (n) => Math.round(n).toLocaleString('ru-RU')
function makeRnd(seed) {
  let s = seed || 1
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
}

const ORGS = [
  { id: 'ip', name: 'ИП Сиванев В. А.', mode: 'УСН «Доходы» 6% + патент', k: 1 },
  { id: 'ooo', name: 'ООО «Вирон Бьюти»', mode: 'УСН «Доходы минус расходы» 15%', k: 0.64 },
]
const PERIODS = [
  { id: 'y26', name: '2026 год', k: 1 },
  { id: 'q2', name: '2 квартал 2026', k: 0.27 },
  { id: 'm8', name: 'Август 2026', k: 0.09 },
  { id: 'y25', name: '2025 год', k: 0.82 },
]

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг']
const INC_SERIES = [
  { n: 'Услуги мастеров', c: '#8F8FFF', v: [482, 510, 548, 571, 604, 632, 588, 641].map((x) => x * 1000) },
  { n: 'Розница косметики', c: '#6384E0', v: [74, 82, 91, 88, 103, 112, 97, 118].map((x) => x * 1000) },
  { n: 'Сертификаты и абонементы', c: '#26a95c', v: [38, 44, 52, 41, 57, 63, 49, 71].map((x) => x * 1000) },
  { n: 'Маркетплейсы', c: '#f0862a', v: [12, 18, 21, 25, 29, 33, 31, 38].map((x) => x * 1000) },
]
const INCOME_YEAR = INC_SERIES.reduce((a, s) => a + s.v.reduce((x, y) => x + y, 0), 0)

const SRC = [
  ['Эквайринг', 'Оплата картой в салоне', '#8F8FFF', 0.58],
  ['Касса (наличные)', 'Наличные через онлайн-кассу', '#6384E0', 0.17],
  ['Переводы', 'Перевод на расчётный счёт', '#26a95c', 0.14],
  ['Маркетплейс', 'Продажи косметики', '#f0862a', 0.07],
  ['Другие банки', 'Загружено по мультибанку', '#2E00B2', 0.04],
]

function buildOps() {
  const rnd = makeRnd(60607)
  const pick = (a) => a[Math.floor(rnd() * a.length)]
  const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1))
  return Array.from({ length: 34 }, (_, i) => {
    const s = pick(SRC)
    const d = String(ri(1, 21)).padStart(2, '0') + '.08.2026'
    const base = s[0] === 'Маркетплейс' ? ri(3000, 14000) : s[0] === 'Переводы' ? ri(6000, 48000) : ri(1200, 9800)
    const fee = s[0] === 'Эквайринг' ? base * 0.017 : s[0] === 'Маркетплейс' ? base * 0.17 : 0
    const taxable = !(s[0] === 'Переводы' && rnd() > 0.82)
    const desc = s[0] === 'Маркетплейс' ? 'Продажа косметики, вывод площадки'
      : s[0] === 'Переводы' ? pick(['Оплата от корпоративного клиента', 'Пополнение с личного счёта', 'Возврат от поставщика', 'Оплата по счёту, ТЦ «Радуга»'])
      : s[0] === 'Касса (наличные)' ? 'Инкассация выручки смены'
      : pick(['Окрашивание, стрижка', 'Маникюр с покрытием', 'Чистка лица', 'Мужская стрижка', 'Ламинирование ресниц', 'Абонемент «Уход ×5»'])
    return { id: i + 1, d, desc, sum: base, fee, taxable, cat: s[0] }
  })
}

const QUARTERS = [
  { q: '1 квартал', inc: 1806000, paid: true, due: '28.04.2026' },
  { q: 'Полугодие', inc: 3902000, paid: true, due: '28.07.2026' },
  { q: '9 месяцев', inc: INCOME_YEAR, paid: false, due: '28.10.2026' },
  { q: 'Год', inc: 0, paid: false, due: '28.04.2027' },
]

const DOCS_INIT = [
  { n: 'Уведомление об исчисленном налоге (9 мес)', t: 'Уведомление', due: '27.10.2026', st: 'Сформирован' },
  { n: 'КУДиР за 2026 год', t: 'Книга учёта', due: 'постоянно', st: 'Ведётся' },
  { n: 'Декларация по УСН за 2025 год', t: 'Декларация', due: '25.04.2026', st: 'Принят' },
  { n: '6-НДФЛ за 9 месяцев', t: 'Зарплатный', due: '25.10.2026', st: 'Требует действий' },
  { n: 'РСВ за 9 месяцев', t: 'Зарплатный', due: '25.10.2026', st: 'Сформирован' },
  { n: 'Персонифицированные сведения за август', t: 'Зарплатный', due: '25.09.2026', st: 'Сформирован' },
  { n: 'ЕФС-1, подраздел 1.1 (кадровые)', t: 'Зарплатный', due: 'по событию', st: 'Подан' },
  { n: 'Декларация по УСН за 2026 год', t: 'Декларация', due: '25.04.2027', st: 'Не сформирован' },
]

const ENS = [
  ['18.08.2026', 'Пополнение ЕНС', 'Платёж', '+120 000', 'Зачтено'],
  ['28.07.2026', 'Аванс по УСН за полугодие', 'Начисление', '−128 400', 'Зачтено'],
  ['28.07.2026', 'Пополнение ЕНС', 'Платёж', '+128 400', 'Зачтено'],
  ['01.07.2026', 'Страховые взносы за сотрудников, июнь', 'Начисление', '−41 260', 'Зачтено'],
  ['28.04.2026', 'Аванс по УСН за 1 квартал', 'Начисление', '−62 700', 'Зачтено'],
  ['15.04.2026', 'Пополнение ЕНС', 'Платёж', '+80 000', 'Зачтено'],
]

const RISKS = [
  ['Налоговая нагрузка по отрасли', 82, 'выше среднего по ОКВЭД 96.02'],
  ['Доля наличных в обороте', 58, '17% — в норме для салона'],
  ['Своевременность платежей в бюджет', 94, 'без просрочек 14 месяцев'],
  ['Назначения платежей', 76, '3 платежа без детализации'],
  ['Благонадёжность контрагентов', 88, '1 поставщик с признаками риска'],
  ['Снятие наличных со счёта', 64, '22% оборота — держите ниже 30%'],
  ['Работа с самозанятыми', 41, 'риск переквалификации в трудовые'],
]

const NOTIFS = [
  ['Уведомление за 9 месяцев', 'Сформировано, подайте до 27.10.2026', 'warn', 'reports'],
  ['6-НДФЛ за 9 месяцев', 'Не хватает данных по выплате от 05.08', 'err', 'staff'],
  ['Патент истекает', 'Парикмахерские и косметические услуги — до 31.12.2026', 'warn', 'patent'],
  ['Чек от самозанятого', 'Артём Митров не прислал чек за июль', 'err', 'staff'],
]

const chip = (label, cls) => <span className={`chip ${cls}`}>{label}</span>
const Mini = ({ vals, color = '#8F8FFF' }) => {
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
      <span className="bar-val" style={{ width: 96 }}>{l}</span>
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
const StackChart = ({ months, series }) => {
  const W = 760, H = 200, n = months.length, gap = W / n, bw = gap * 0.55
  const tot = months.map((_, i) => series.reduce((a, s) => a + s.v[i], 0))
  const mx = Math.max(...tot) * 1.15 || 1
  return (
    <svg viewBox={`0 0 ${W} ${H + 26}`} width="100%" height="225" preserveAspectRatio="none">
      {[0, 1, 2, 3].map((g) => <line key={g} x1="0" y1={H - (H * g / 3.2)} x2={W} y2={H - (H * g / 3.2)} stroke="var(--line)" strokeWidth="1" />)}
      {months.map((m, i) => {
        let acc = 0
        return (
          <g key={m}>
            {series.map((ser) => {
              const hh = ser.v[i] / mx * H
              const y = H - acc - hh
              acc += hh
              return <rect key={ser.n} x={(i * gap + (gap - bw) / 2).toFixed(1)} y={y.toFixed(1)} width={bw.toFixed(1)} height={Math.max(0, hh).toFixed(1)} fill={ser.c}><title>{ser.n}: {num(ser.v[i])} ₽</title></rect>
            })}
            <text x={(i * gap + gap / 2).toFixed(1)} y={H + 19} textAnchor="middle" fontSize="12" fill="var(--gray)">{m}</text>
          </g>
        )
      })}
    </svg>
  )
}
const KV = ({ k, v, last }) => (
  <div className="kv-row" style={last ? { borderBottom: 'none' } : null}><span>{k}</span><b>{v}</b></div>
)
const CalItem = ({ d, m, t, s }) => (
  <div className="tx-cal"><div className="tx-cal-d"><b>{d}</b><span>{m}</span></div>
    <div className="tx-cal-b"><b>{t}</b><span>{s}</span></div></div>
)

const NAV = [
  ['g', 'Налоги'],
  ['dash', 'Налоги в одном окне'], ['income', 'Доходы и мультибанк'], ['taxes', 'Налоги и взносы'], ['savings', 'Налоговая копилка'], ['patent', 'Патент'],
  ['g', 'Отчётность'],
  ['reports', 'Отчётные документы'], ['fns', 'Сверка с ФНС и ЕНС'],
  ['g', 'Салон'],
  ['staff', 'Мастера и выплаты'], ['cash', 'Касса и эквайринг'], ['docs', 'Документы салона'],
  ['g', 'Поддержка'],
  ['risk', 'Риски и проверки'], ['consult', 'Консультация бухгалтера'], ['tset', 'Настройки и подписка'],
]

export function TaxCabinet({ ctx }) {
  const [sec, setSec] = useState('dash')
  const [org, setOrg] = useState(ORGS[0])
  const [period, setPeriod] = useState(PERIODS[0])
  const [panel, setPanel] = useState(null)
  const K = org.k * period.k
  const go = (s) => { setSec(s); setPanel(null) }
  const P = { ctx, K, org, period, go, setPanel }

  return (
    <div className="bz">
      <aside className="bz-nav">
        <div className="bz-brand">
          <b>Онлайн-бухгалтерия</b>
          <span>салон красоты «Viron»</span>
        </div>
        <div className="bz-nav-scroll">
          {NAV.map(([id, t], i) => id === 'g'
            ? <div key={i} className="bz-group">{t}</div>
            : <button key={id} className={`bz-link${sec === id ? ' on' : ''}`} onClick={() => go(id)}>{t}</button>)}
        </div>
        <button className="bz-link bz-help" onClick={() => setPanel({
          title: 'Справка и обучение', sub: 'Материалы для салонов красоты и студий',
          body: ['Патент или УСН: что выгоднее салону красоты', 'Как принимать оплату и не нарушить 54-ФЗ', 'Самозанятые мастера: как оформить без риска переквалификации', 'Учёт сертификатов и абонементов: когда возникает доход', 'Что готовить к проверке Роспотребнадзора', 'Как уменьшить налог на страховые взносы']
            .map((t) => <div key={t} className="tx-doct" onClick={() => ctx.ping('Инструкция откроется в новом окне (демо)')}><b>{t}</b><span>инструкция · 4 мин</span></div>),
        })}>Справка и обучение</button>
      </aside>
      <div className="bz-main">
        <div className="bz-top">
          <select className="select" value={org.id} onChange={(e) => { const o = ORGS.find((x) => x.id === e.target.value); setOrg(o); ctx.ping(`${o.name} · ${o.mode}`) }}>
            {ORGS.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <select className="select" value={period.id} onChange={(e) => setPeriod(PERIODS.find((p) => p.id === e.target.value))}>
            {PERIODS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="input-search bz-search">{icons.search}<input placeholder="Платёж, документ, отчёт" /></div>
          <button className="bz-bell" onClick={() => setPanel({
            title: 'Уведомления', sub: '4 новых',
            body: NOTIFS.map(([t, d, lvl, to]) => (
              <div key={t} className="alert-row"><i style={{ background: lvl === 'err' ? 'var(--neg)' : '#f0862a' }} />
                <div><b>{t}</b><span>{d}</span></div>
                <button className="link-inline" onClick={() => go(to)}>Открыть</button></div>
            )),
          })} aria-label="Уведомления">{icons.bell}<b>4</b></button>
        </div>
        <div className="bz-content">
          {sec === 'dash' && <TaxDash {...P} />}
          {sec === 'income' && <Income {...P} />}
          {sec === 'taxes' && <Taxes {...P} />}
          {sec === 'savings' && <Savings {...P} />}
          {sec === 'patent' && <Patent {...P} />}
          {sec === 'reports' && <RepDocs {...P} />}
          {sec === 'fns' && <Fns {...P} />}
          {sec === 'staff' && <StaffPay {...P} />}
          {sec === 'cash' && <CashDesk {...P} />}
          {sec === 'docs' && <SalonDocs {...P} />}
          {sec === 'risk' && <Risk {...P} />}
          {sec === 'consult' && <Consult {...P} />}
          {sec === 'tset' && <TaxSettings {...P} />}
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

/* ═══ Налоги в одном окне ═══ */
function TaxDash({ ctx, K, org, period, go }) {
  const k = K, ko = org.k
  const inc = INCOME_YEAR * k
  const toPay = 94600 * ko
  const riskAvg = Math.round(RISKS.reduce((a, r) => a + r[1], 0) / RISKS.length)
  return (
    <div>
      <Head t="Налоги в одном окне" s={`${org.name} · ${org.mode} · ${period.name}`}
        right={<button className="btn-gray" style={{ width: 'auto' }} onClick={() => ctx.ping('Данные из налоговой обновлены')}>Обновить данные ФНС</button>} />
      <div className="bz-grid21" style={{ marginTop: 0 }}>
        <div className="tx-pay">
          <div className="l">Ближайший платёж · авансовый платёж по УСН за 9 месяцев</div>
          <div className="v">{money(toPay)}</div>
          <div className="d">Уведомление подать до 27.10.2026, оплатить до 28.10.2026 · осталось 68 дней</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="tx-pay-btn" onClick={() => ctx.ping(`Платёжное поручение на ${money(toPay)} подготовлено`)}>Оплатить с расчётного счёта</button>
            <button className="tx-pay-btn ghost" onClick={() => go('reports')}>Подать уведомление</button>
          </div>
          <div className="note2">В копилке отложено {money(214800 * ko)} — этого хватит на платёж и страховые взносы за квартал</div>
        </div>
        <div className="card">
          <div className="bz-ct">Единый налоговый счёт</div>
          <KV k="Сальдо ЕНС" v={<b style={{ color: 'var(--pos)' }}>+ {num(18400 * ko)} ₽</b>} />
          <KV k="Зарезервировано под начисления" v={money(41260 * ko)} />
          <KV k="Задолженность и пени" v="нет" />
          <KV k="Данные из налоговой обновлены" v="сегодня в 06:40" last />
          <button className="btn-gray" style={{ width: '100%', marginTop: 12 }} onClick={() => go('fns')}>Открыть сверку с ФНС</button>
        </div>
      </div>
      <div className="bz-kpis" style={{ gridTemplateColumns: 'repeat(5,1fr)', marginTop: 14 }}>
        {[['Доход с начала года', money(inc), '+18,4% к прошлому году', [62, 66, 71, 74, 79, 83, 77, 86]],
          ['Налог УСН 6% начислено', money(inc * 0.06), 'с учётом вычета взносов', [38, 40, 43, 45, 48, 50, 47, 52]],
          ['Страховые взносы', money(61200 * ko), 'фиксированные + 1%', [20, 20, 20, 20, 20, 20, 20, 20]],
          ['Отложено в копилке', money(214800 * ko), '+ 3 120 ₽ процентов', [10, 14, 19, 24, 28, 33, 38, 44]],
          ['Лимит для АУСН', Math.round(inc / 20000000 * 100) + '%', 'из 20 млн ₽ дохода', [12, 18, 24, 31, 38, 46, 52, 61]]]
          .map(([l, v, d, sp]) => (
            <div key={l} className="bz-kpi"><div className="l">{l}</div><div className="v" style={{ fontSize: 18 }}>{v}</div>
              <div className="bz-note" style={{ marginBottom: 4 }}>{d}</div><Mini vals={sp} /></div>
          ))}
      </div>
      <div className="bz-grid21">
        <div className="card">
          <div className="bz-ct">Доходы по месяцам
            <span className="bz-note">{INC_SERIES.map((s) => <span key={s.n}><i style={{ color: s.c, fontStyle: 'normal' }}>■</i> {s.n}  </span>)}</span></div>
          <StackChart months={MONTHS} series={INC_SERIES.map((s) => ({ n: s.n, c: s.c, v: s.v.map((v) => v * k) }))} />
        </div>
        <div className="card">
          <div className="bz-ct">Требует внимания</div>
          {NOTIFS.map(([t, d, lvl, to]) => (
            <div key={t} className="alert-row"><i style={{ background: lvl === 'err' ? 'var(--neg)' : '#f0862a' }} />
              <div><b>{t}</b><span>{d}</span></div>
              <button className="link-inline" onClick={() => go(to)}>Открыть</button></div>
          ))}
        </div>
      </div>
      <div className="bz-grid3">
        <div className="card"><div className="bz-ct">Откуда приходят деньги</div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <Donut parts={SRC.map((s) => [s[0], s[3] * 100, s[2]])} />
            <div className="bz-note" style={{ lineHeight: '22px', flex: 1 }}>
              {SRC.map((s) => <div key={s[0]}><i style={{ color: s[2], fontStyle: 'normal' }}>■</i> {s[0]} — {Math.round(s[3] * 100)}%</div>)}
            </div>
          </div>
          <div className="bz-note" style={{ marginTop: 10 }}>Комиссии эквайринга и маркетплейсов учтены в доходе автоматически</div>
        </div>
        <div className="card"><div className="bz-ct">Налоговый календарь</div>
          <CalItem d="27" m="окт" t="Уведомление об исчисленном налоге" s="за 9 месяцев 2026" />
          <CalItem d="28" m="окт" t="Авансовый платёж по УСН" s={money(toPay)} />
          <CalItem d="28" m="сен" t="Страховые взносы за сотрудников" s="за август" />
          <CalItem d="25" m="сен" t="Персонифицированные сведения" s="за август, сдать в налоговую" />
          <CalItem d="31" m="дек" t="Фиксированные взносы ИП" s="и продление патента" />
        </div>
        <div className="card"><div className="bz-ct">Индикатор риска</div>
          <div className="tx-gauge"><b style={{ color: riskAvg > 75 ? 'var(--pos)' : riskAvg > 55 ? '#f0862a' : 'var(--neg)' }}>{riskAvg}</b>
            <span>из 100 · {riskAvg > 75 ? 'низкий риск' : riskAvg > 55 ? 'средний риск' : 'повышенный риск'}</span></div>
          <div style={{ marginTop: 10 }}>
            {RISKS.slice(0, 4).map((r) => (
              <div key={r[0]} className="tx-risk"><span className="nm">{r[0]}</span>
                <span className="sc"><i style={{ width: `${r[1]}%`, background: r[1] > 75 ? 'var(--pos)' : r[1] > 55 ? '#f0862a' : 'var(--neg)' }} /></span></div>
            ))}
          </div>
          <button className="btn-gray" style={{ width: '100%', marginTop: 12 }} onClick={() => go('risk')}>Все 7 критериев</button>
        </div>
      </div>
    </div>
  )
}

/* ═══ Доходы и мультибанк ═══ */
function Income({ ctx, setPanel }) {
  const [ops, setOps] = useState(buildOps)
  const [filter, setFilter] = useState('all')
  const rows = ops.filter((o) => (filter === 'all' ? true : o.cat === filter))
  const taxable = ops.filter((o) => o.taxable).reduce((a, o) => a + o.sum, 0)
  const untax = ops.filter((o) => !o.taxable).reduce((a, o) => a + o.sum, 0)
  const fees = ops.reduce((a, o) => a + o.fee, 0)
  const openOp = (o) => setPanel({
    title: o.desc, sub: `${o.d} · ${o.cat}`,
    body: (
      <>
        <KV k="Сумма поступления" v={money(o.sum)} />
        <KV k="Комиссия площадки" v={o.fee ? money(o.fee) : 'нет'} />
        <KV k="Сумма, которую заплатил клиент" v={money(o.sum + o.fee)} />
        <KV k="Источник" v={o.cat} />
        <KV k="Учитывается в налоговой базе" v={o.taxable ? 'да' : 'нет'} last />
        <div className="bz-ct" style={{ margin: '16px 0 8px' }}>Корректировка</div>
        <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13.5, cursor: 'pointer' }}>
          <input type="checkbox" defaultChecked={o.taxable} id="tx-op-sw" /> Включать в облагаемый доход
        </label>
        <div className="bz-ct" style={{ margin: '16px 0 8px' }}>Комментарий для КУДиР</div>
        <div className="field" style={{ margin: 0 }}><input placeholder="Например: оплата услуг по договору №14" /></div>
      </>
    ),
    foot: (
      <>
        <button className="btn-red" style={{ marginTop: 0 }} onClick={() => {
          const on = document.getElementById('tx-op-sw')?.checked
          setOps((xs) => xs.map((x) => (x.id === o.id ? { ...x, taxable: on } : x)))
          setPanel(null)
          ctx.ping('Доход перенесён в ' + (on ? 'облагаемые' : 'необлагаемые'))
        }}>Сохранить</button>
        <button className="btn-gray" style={{ width: 'auto' }} onClick={() => setPanel(null)}>Отмена</button>
      </>
    ),
  })
  return (
    <div>
      <Head t="Доходы и мультибанк" s="Поступления из всех источников за август 2026 · комиссии учтены автоматически"
        right={<>
          <button className="btn-gray" style={{ width: 'auto' }} onClick={() => ctx.ping('Форма добавления дохода (демо)')}>Добавить вручную</button>
          <button className="btn-red" style={{ marginTop: 0 }} onClick={() => ctx.ping('Загружено 12 операций из подключённых банков')}>Загрузить из банков</button>
        </>} />
      <div className="bz-kpis" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="bz-kpi"><div className="l">Облагаемый доход</div><div className="v" style={{ fontSize: 18 }}>{money(taxable)}</div><div className="bz-note">попадёт в налоговую базу</div></div>
        <div className="bz-kpi"><div className="l">Необлагаемый доход</div><div className="v" style={{ fontSize: 18 }}>{money(untax)}</div><div className="bz-note">пополнения, возвраты, займы</div></div>
        <div className="bz-kpi"><div className="l">Учтено комиссий</div><div className="v" style={{ fontSize: 18 }}>{money(fees)}</div><div className="bz-note">эквайринг и маркетплейсы</div></div>
      </div>
      <div className="chips-row">
        <button className={`filter-chip${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>Все <b style={{ opacity: .55 }}>{ops.length}</b></button>
        {SRC.map((s) => (
          <button key={s[0]} className={`filter-chip${filter === s[0] ? ' active' : ''}`} onClick={() => setFilter(s[0])}>{s[0]} <b style={{ opacity: .55 }}>{ops.filter((o) => o.cat === s[0]).length}</b></button>
        ))}
      </div>
      <div className="card" style={{ padding: '12px 14px' }}>
        <table className="tbl">
          <thead><tr><th>Дата</th><th>Источник</th><th>Назначение</th><th>Сумма</th><th>Комиссия</th><th>В доход</th><th>Статус</th></tr></thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} onClick={() => openOp(o)}>
                <td>{o.d}</td>
                <td><i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: (SRC.find((s) => s[0] === o.cat) || [])[2], marginRight: 8 }} />{o.cat}</td>
                <td>{o.desc}</td><td>{money(o.sum)}</td>
                <td>{o.fee ? money(o.fee) : '—'}</td>
                <td>{o.taxable ? money(o.sum) : '—'}</td>
                <td>{chip(o.taxable ? 'Облагаемый' : 'Не облагается', o.taxable ? 'green' : 'orange')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="empty-note">Поступлений в этом источнике нет — выберите другой фильтр.</p>}
      </div>
      <div className="tx-note">Комиссия эквайринга и маркетплейсов сервис прибавляет к доходу: налог считается с полной суммы, которую заплатил клиент, а не с той, что пришла на счёт.</div>
    </div>
  )
}

/* ═══ Налоги и взносы ═══ */
function Taxes({ ctx, org }) {
  const k = org.k
  const rows = QUARTERS.map((q, i) => {
    const inc = q.inc * k, tax = inc * 0.06, ded = i === 2 ? 126400 * k : i === 1 ? 98200 * k : i === 0 ? 62300 * k : 0
    return { q: q.q, due: q.due, paid: q.paid, inc, tax, ded, pay: Math.max(0, tax - ded) }
  })
  return (
    <div>
      <Head t="Налоги и взносы" s="Расчёт по УСН «Доходы» 6% нарастающим итогом · уменьшение на страховые взносы"
        right={<button className="btn-gray" style={{ width: 'auto' }} onClick={() => ctx.ping('Налоги и взносы пересчитаны по данным на 21.08.2026')}>Пересчитать</button>} />
      <div className="bz-kpis" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[['УСН «Доходы» 6%', money(INCOME_YEAR * 0.06 * k), 'начислено с начала года'],
          ['Фиксированные взносы ИП', money(61200 * k), 'срок — 31.12.2026'],
          ['1% с дохода свыше 300 тыс ₽', money((INCOME_YEAR * k - 300000) * 0.01), 'срок — 01.07.2027'],
          ['Патент', money(48600 * k), 'оплачен полностью']]
          .map(([l, v, d]) => <div key={l} className="bz-kpi"><div className="l">{l}</div><div className="v" style={{ fontSize: 18 }}>{v}</div><div className="bz-note">{d}</div></div>)}
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <div className="bz-ct">Расчёт по периодам</div>
        <table className="tbl">
          <thead><tr><th>Период</th><th>Доход нарастающим итогом</th><th>Налог 6%</th><th>Уменьшение на взносы</th><th>К уплате</th><th>Срок</th><th>Статус</th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.q} style={{ cursor: 'default' }}>
              <td>{r.q}</td><td>{r.inc ? money(r.inc) : '—'}</td><td>{r.tax ? money(r.tax) : '—'}</td>
              <td>{r.ded ? '−' + money(r.ded) : '—'}</td><td><b>{r.pay ? money(r.pay) : '—'}</b></td><td>{r.due}</td>
              <td>{chip(r.paid ? 'Оплачен' : r.inc ? 'К уплате' : 'Впереди', r.paid ? 'green' : r.inc ? 'orange' : 'blue')}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="bz-grid2">
        <div className="card"><div className="bz-ct">Как считаем уменьшение налога</div>
          <KV k="Взносы за себя, уплаченные в периоде" v={money(45900 * k)} />
          <KV k="Взносы за сотрудников" v={money(80500 * k)} />
          <KV k="Ограничение для ИП с работниками" v="не более 50% налога" />
          <KV k="Принято к уменьшению" v={money(126400 * k)} last />
          <div className="tx-note" style={{ marginTop: 12 }}>У салона есть сотрудники в штате, поэтому налог уменьшается не более чем наполовину. Без работников ограничение не действует.</div>
        </div>
        <div className="card"><div className="bz-ct">История платежей</div>
          <table className="tbl"><tbody>
            {[['28.07.2026', 'Аванс по УСН за полугодие', 128400], ['15.07.2026', 'Страховые взносы за июнь', 41260], ['28.04.2026', 'Аванс по УСН за 1 квартал', 62700], ['31.03.2026', 'Патент, первая часть', 16200], ['25.02.2026', 'Фиксированные взносы, часть 1', 20400]]
              .map((r, i) => <tr key={i} style={{ cursor: 'default' }}><td>{r[0]}</td><td>{r[1]}</td><td>{money(r[2] * k)}</td><td>{chip('Зачтён', 'green')}</td></tr>)}
          </tbody></table>
        </div>
      </div>
    </div>
  )
}

/* ═══ Налоговая копилка ═══ */
function Savings({ ctx, org }) {
  const [rate, setRate] = useState(8)
  const k = org.k, bal = 214800 * k, goal = (94600 + 41260) * k
  const hist = [['21.08.2026', 'Отчисление с поступлений дня', 6840], ['20.08.2026', 'Отчисление с поступлений дня', 5120], ['19.08.2026', 'Начисление процентов на остаток', 780], ['18.08.2026', 'Отчисление с поступлений дня', 7310], ['17.08.2026', 'Отчисление с поступлений дня', 4980], ['16.08.2026', 'Отчисление с поступлений дня', 9240]]
  return (
    <div>
      <Head t="Налоговая копилка" s="Автоматически откладываем часть каждого поступления и начисляем процент на остаток" />
      <div className="bz-grid21" style={{ marginTop: 0 }}>
        <div className="card">
          <div className="bz-ct">Накоплено на налоги</div>
          <div style={{ fontSize: 32, fontWeight: 800, lineHeight: '40px' }}>{money(bal)}</div>
          <div className="bz-note" style={{ marginBottom: 12 }}>Цель до 28 октября — {money(goal)} (аванс по УСН и взносы за август)</div>
          <div className="tx-prog"><i style={{ width: `${Math.min(100, bal / goal * 100).toFixed(0)}%` }} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }} className="bz-note">
            <span>{Math.round(bal / goal * 100)}% от цели</span><span>осталось отложить {money(Math.max(0, goal - bal))}</span></div>
          <div style={{ marginTop: 18 }}>
            <Bars rows={[['Май', 142, '142 000 ₽'], ['Июнь', 168, '168 000 ₽'], ['Июль', 191, '191 000 ₽'], ['Август', 215, '215 000 ₽']]} color="#26a95c" />
          </div>
        </div>
        <div className="card">
          <div className="bz-ct">Правило отчисления</div>
          <KV k="Откладывать с каждого поступления" v={`${rate}%`} />
          <div style={{ display: 'flex', gap: 8, margin: '10px 0 14px', flexWrap: 'wrap' }}>
            {[5, 6, 8, 10, 12].map((v) => (
              <button key={v} className={`filter-chip${v === rate ? ' active' : ''}`} onClick={() => { setRate(v); ctx.ping(`Теперь откладываем ${v}% с каждого поступления`) }}>{v}%</button>
            ))}
          </div>
          <KV k="Процент на остаток" v="12% годовых" />
          <KV k="Начислено процентов за год" v={<b style={{ color: 'var(--pos)' }}>+ {money(3120 * k)}</b>} />
          <KV k="Списание при уплате налога" v="автоматически" last />
          <button className="btn-red" style={{ width: '100%', marginTop: 12 }} onClick={() => ctx.ping('Налог оплачен из копилки, остаток обновлён')}>Оплатить налог из копилки</button>
          <button className="btn-gray" style={{ width: '100%', marginTop: 8 }} onClick={() => ctx.ping('Вывод на расчётный счёт оформлен')}>Вывести на расчётный счёт</button>
        </div>
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <div className="bz-ct">Движение по копилке</div>
        <table className="tbl">
          <thead><tr><th>Дата</th><th>Операция</th><th>Сумма</th><th>Остаток</th></tr></thead>
          <tbody>{hist.map((h, i) => (
            <tr key={i} style={{ cursor: 'default' }}><td>{h[0]}</td><td>{h[1]}</td>
              <td style={{ color: 'var(--pos)' }}>+ {money(h[2] * k)}</td>
              <td>{money(bal - hist.slice(0, i).reduce((a, x) => a + x[2] * k, 0))}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}

/* ═══ Патент ═══ */
function Patent({ ctx, org }) {
  const k = org.k, cost = 48600 * k, incYear = INCOME_YEAR * k
  return (
    <div>
      <Head t="Патент" s="Парикмахерские и косметические услуги · ОКВЭД 96.02 · Москва"
        right={<button className="btn-red" style={{ marginTop: 0 }} onClick={() => ctx.ping('Заявление на патент 2027 сформировано, проверьте данные')}>Продлить на 2027 год</button>} />
      <div className="bz-grid21" style={{ marginTop: 0 }}>
        <div className="card"><div className="bz-ct">Действующий патент</div>
          <KV k="Вид деятельности" v="Парикмахерские и косметические услуги" />
          <KV k="Срок действия" v="01.01.2026 — 31.12.2026" />
          <KV k="Потенциально возможный доход" v={money(810000 * k)} />
          <KV k="Стоимость патента" v={money(cost)} />
          <KV k="Уменьшено на страховые взносы" v={'−' + money(24300 * k)} />
          <KV k="Оплачено" v={<b style={{ color: 'var(--pos)' }}>полностью</b>} last />
          <div className="tx-note" style={{ marginTop: 14 }}>До 31 декабря подайте заявление на следующий год, иначе с 1 января деятельность перейдёт на УСН и налог вырастет.</div>
        </div>
        <div className="card"><div className="bz-ct">Лимиты патента</div>
          <div className="bz-note" style={{ marginBottom: 4 }}>Доход по патентным видам деятельности</div>
          <div className="tx-prog"><i style={{ width: `${Math.min(100, incYear / 60000000 * 100).toFixed(1)}%`, background: 'var(--pos)' }} /></div>
          <div className="bz-note" style={{ marginBottom: 14 }}>{money(incYear)} из 60 000 000 ₽</div>
          <div className="bz-note" style={{ marginBottom: 4 }}>Средняя численность работников</div>
          <div className="tx-prog"><i style={{ width: '33%', background: 'var(--pos)' }} /></div>
          <div className="bz-note" style={{ marginBottom: 14 }}>5 из 15 человек</div>
          <KV k="Статус" v={<b style={{ color: 'var(--pos)' }}>лимиты соблюдаются</b>} last />
        </div>
      </div>
      <div className="bz-grid2">
        <div className="card"><div className="bz-ct">Что выгоднее салону</div>
          <table className="tbl">
            <thead><tr><th>Режим</th><th>Налог за 2026</th><th>Отчётность</th><th>Вывод</th></tr></thead>
            <tbody>
              <tr style={{ cursor: 'default' }}><td>Патент на услуги + УСН на розницу</td><td><b>{money(cost + incYear * 0.012)}</b></td><td>декларация УСН</td><td>{chip('текущий выбор', 'green')}</td></tr>
              <tr style={{ cursor: 'default' }}><td>Только УСН «Доходы» 6%</td><td>{money(incYear * 0.06 - 126400 * k)}</td><td>декларация УСН</td><td>{chip('дороже', 'blue')}</td></tr>
              <tr style={{ cursor: 'default' }}><td>АУСН 8% с доходов</td><td>{money(incYear * 0.08)}</td><td>без деклараций</td><td>{chip('доход в лимите 20 млн', 'orange')}</td></tr>
            </tbody>
          </table>
          <div className="bz-note" style={{ marginTop: 10 }}>Расчёт демонстрационный: сервис сравнивает режимы по фактическим поступлениям салона.</div>
        </div>
        <div className="card"><div className="bz-ct">Календарь патента</div>
          <CalItem d="31" m="дек" t="Заявление на патент 2027" s="подать за 10 рабочих дней до начала" />
          <CalItem d="31" m="дек" t="Вторая часть оплаты патента" s="2/3 стоимости" />
          <CalItem d="31" m="дек" t="Фиксированные взносы ИП" s="уменьшают стоимость патента" />
          <CalItem d="01" m="янв" t="Начало нового патента" s="при поданном заявлении" />
        </div>
      </div>
    </div>
  )
}

/* ═══ Отчётные документы ═══ */
function RepDocs({ ctx, org, setPanel }) {
  const [docs, setDocs] = useState(DOCS_INIT)
  const [filter, setFilter] = useState('all')
  const types = ['Уведомление', 'Книга учёта', 'Декларация', 'Зарплатный']
  const rows = docs.filter((d) => (filter === 'all' ? true : d.t === filter))
  const badgeCls = (st) => st === 'Принят' || st === 'Ведётся' ? 'green' : st === 'Подан' ? 'blue' : st === 'Требует действий' ? 'red' : 'orange'
  const openDoc = (d, i) => setPanel({
    title: d.n, sub: `${d.t} · срок ${d.due}`,
    body: (
      <>
        <KV k="Статус" v={d.st} />
        <KV k="Период" v="9 месяцев 2026" />
        <KV k="Заполнен" v="автоматически по данным сервиса" />
        <KV k="Способ подачи" v="онлайн или лично в налоговой" last />
        <div className="bz-ct" style={{ margin: '16px 0 8px' }}>Ключевые показатели</div>
        <KV k="Доход нарастающим итогом" v={money(INCOME_YEAR * org.k)} />
        <KV k="Исчисленный налог" v={money(INCOME_YEAR * 0.06 * org.k)} />
        <KV k="Уменьшение на взносы" v={'−' + money(126400 * org.k)} />
        <KV k="К уплате" v={money(94600 * org.k)} last />
        {d.st === 'Требует действий' && <div className="tx-note" style={{ marginTop: 14 }}>Не хватает данных по выплате самозанятому от 05.08 — приложите чек, иначе сумма не попадёт в отчёт.</div>}
      </>
    ),
    foot: (
      <>
        <button className="btn-red" style={{ marginTop: 0 }} onClick={() => {
          setDocs((xs) => xs.map((x, j) => (j === i ? { ...x, st: 'Подан' } : x)))
          setPanel(null)
          ctx.ping(d.n + ' — отправлен в налоговую')
        }}>Подать онлайн</button>
        <button className="btn-gray" style={{ width: 'auto' }} onClick={() => setPanel(null)}>Закрыть</button>
      </>
    ),
  })
  return (
    <div>
      <Head t="Отчётные документы" s="Заполняем декларацию, КУДиР и уведомления — остаётся подать онлайн или лично"
        right={<button className="btn-red" style={{ marginTop: 0 }} onClick={() => ctx.ping('Выберите тип документа для формирования')}>Сформировать документ</button>} />
      <div className="chips-row">
        <button className={`filter-chip${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>Все <b style={{ opacity: .55 }}>{docs.length}</b></button>
        {types.map((t) => (
          <button key={t} className={`filter-chip${filter === t ? ' active' : ''}`} onClick={() => setFilter(t)}>{t} <b style={{ opacity: .55 }}>{docs.filter((d) => d.t === t).length}</b></button>
        ))}
      </div>
      <div className="card">
        <table className="tbl">
          <thead><tr><th>Документ</th><th>Тип</th><th>Срок подачи</th><th>Статус</th><th /></tr></thead>
          <tbody>{rows.map((d) => (
            <tr key={d.n} onClick={() => openDoc(d, docs.indexOf(d))}>
              <td>{d.n}</td><td>{d.t}</td><td>{d.due}</td>
              <td>{chip(d.st, badgeCls(d.st))}</td>
              <td><span className="link-inline">{d.st === 'Не сформирован' ? 'Сформировать' : 'Открыть'}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="bz-grid3">
        <div className="card"><div className="bz-ct">Онлайн-подача</div>
          <KV k="Декларация по УСН" v={<b style={{ color: 'var(--pos)' }}>доступна</b>} />
          <KV k="Уведомление об исчисленном налоге" v={<b style={{ color: 'var(--pos)' }}>доступна</b>} />
          <KV k="Зарплатные отчёты" v="через оператора ЭДО" />
          <KV k="Электронная подпись" v="УКЭП действует до 14.03.2027" last />
        </div>
        <div className="card"><div className="bz-ct">КУДиР</div>
          <KV k="Записей за 2026 год" v="1 284" />
          <KV k="Последняя запись" v="21.08.2026" />
          <KV k="Заполняется" v="автоматически из доходов" />
          <KV k="Формат выгрузки" v="PDF, XLSX" last />
          <button className="btn-gray" style={{ width: '100%', marginTop: 12 }} onClick={() => ctx.ping('КУДиР выгружена в PDF')}>Выгрузить КУДиР</button>
        </div>
        <div className="card"><div className="bz-ct">Что сдаёт салон с работниками</div>
          <div className="bz-note" style={{ lineHeight: '23px', fontSize: 13 }}>
            6-НДФЛ — ежеквартально<br />РСВ — ежеквартально<br />Персонифицированные сведения — ежемесячно<br />
            ЕФС-1 — по кадровым событиям<br />Декларация по УСН — раз в год<br />Уведомления по ЕНП — ежеквартально
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══ Сверка с ФНС и ЕНС ═══ */
function Fns({ ctx, org }) {
  const k = org.k
  return (
    <div>
      <Head t="Сверка с ФНС и ЕНС" s="Ежедневно забираем данные из личного кабинета налогоплательщика — смотреть отдельно не нужно"
        right={<button className="btn-gray" style={{ width: 'auto' }} onClick={() => ctx.ping('Данные из налоговой обновлены — расхождений не найдено')}>Обновить сейчас</button>} />
      <div className="bz-kpis" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="bz-kpi"><div className="l">Сальдо единого налогового счёта</div><div className="v" style={{ fontSize: 22, color: 'var(--pos)' }}>+ {num(18400 * k)} ₽</div><div className="bz-note">положительное, задолженности нет</div></div>
        <div className="bz-kpi"><div className="l">Предстоящие начисления</div><div className="v" style={{ fontSize: 22 }}>{money(135860 * k)}</div><div className="bz-note">спишутся 28.10.2026</div></div>
        <div className="bz-kpi"><div className="l">Обновлено</div><div className="v" style={{ fontSize: 22 }}>сегодня, 06:40</div><div className="bz-note">данные ФНС синхронизируются раз в сутки</div></div>
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <div className="bz-ct">Начисления и платежи по ЕНС</div>
        <table className="tbl">
          <thead><tr><th>Дата</th><th>Операция</th><th>Тип</th><th>Сумма</th><th>Статус</th></tr></thead>
          <tbody>{ENS.map((r, i) => (
            <tr key={i} style={{ cursor: 'default' }}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td>
              <td style={{ color: r[3][0] === '+' ? 'var(--pos)' : 'inherit' }}>{r[3]} ₽</td>
              <td>{chip(r[4], 'green')}</td></tr>
          ))}</tbody>
        </table>
      </div>
      <div className="bz-grid2">
        <div className="card"><div className="bz-ct">Статус по налогам и взносам</div>
          <table className="tbl">
            <thead><tr><th>Платёж</th><th>Начислено</th><th>Уплачено</th><th>Статус</th></tr></thead>
            <tbody>{[['УСН, аванс за 1 квартал', 62700, 62700, 'Зачтён'], ['УСН, аванс за полугодие', 128400, 128400, 'Зачтён'], ['УСН, аванс за 9 месяцев', 94600, 0, 'Ожидает'], ['Страховые взносы, июль', 41260, 41260, 'Зачтён'], ['Страховые взносы, август', 41260, 0, 'Ожидает'], ['НДФЛ за сотрудников, август', 28900, 0, 'Ожидает']]
              .map((r, i) => <tr key={i} style={{ cursor: 'default' }}><td>{r[0]}</td><td>{money(r[1] * k)}</td><td>{r[2] ? money(r[2] * k) : '—'}</td><td>{chip(r[3], r[3] === 'Зачтён' ? 'green' : 'orange')}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="card"><div className="bz-ct">Расхождения с данными сервиса</div>
          <div className="alert-row"><i style={{ background: '#f0862a' }} />
            <div><b>Налоговая пока не отразила платёж от 21.08 на 120 000 ₽</b><span>обычно зачисление занимает 1–3 рабочих дня</span></div></div>
          <div className="alert-row"><i style={{ background: 'var(--pos)' }} />
            <div><b>Остальные начисления совпадают</b><span>сверено 24 операции за 2026 год</span></div></div>
          <div className="kv-row" style={{ borderBottom: 'none', marginTop: 8 }}><span>Акт сверки с налоговой</span>
            <button className="link-inline" onClick={() => ctx.ping('Запрос акта сверки отправлен в налоговую')}>Запросить</button></div>
        </div>
      </div>
    </div>
  )
}

/* ═══ Мастера и выплаты ═══ */
function StaffPay({ ctx, org, setPanel }) {
  const k = org.k
  const pay = [
    ['Марина Селезнёва', 'Штат', 'Мастер маникюра', 68000, 8840, 20536],
    ['Дина Шарипова', 'Штат', 'Косметолог', 74000, 9620, 22348],
    ['Артём Митров', 'Самозанятый', 'Барбер', 52000, 0, 0],
    ['Полина Реброва', 'Самозанятый', 'Мастер бровей', 41000, 0, 0],
  ]
  return (
    <div>
      <Head t="Мастера и выплаты" s="4 мастера: 2 в штате и 2 самозанятых · НДФЛ, взносы и чеки НПД"
        right={<button className="btn-red" style={{ marginTop: 0 }} onClick={() => ctx.ping('Ведомость за август сформирована')}>Сформировать выплаты за август</button>} />
      <div className="bz-kpis" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="bz-kpi"><div className="l">Фонд оплаты труда, август</div><div className="v" style={{ fontSize: 18 }}>{money(235000 * k)}</div><div className="bz-note">штат и самозанятые</div></div>
        <div className="bz-kpi"><div className="l">НДФЛ к перечислению</div><div className="v" style={{ fontSize: 18 }}>{money(18460 * k)}</div><div className="bz-note">срок — 28.09.2026</div></div>
        <div className="bz-kpi"><div className="l">Страховые взносы</div><div className="v" style={{ fontSize: 18 }}>{money(42884 * k)}</div><div className="bz-note">только за штатных</div></div>
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <div className="bz-ct">Выплаты за август 2026</div>
        <table className="tbl">
          <thead><tr><th>Мастер</th><th>Статус</th><th>Специализация</th><th>Начислено</th><th>НДФЛ</th><th>Взносы</th><th>К выплате</th><th>Документ</th></tr></thead>
          <tbody>{pay.map((p) => (
            <tr key={p[0]} onClick={() => setPanel({
              title: p[0], sub: 'Карточка мастера · выплаты и документы',
              body: (
                <>
                  <KV k="Статус" v={p[1] === 'Штат' ? 'Штатный сотрудник' : 'Самозанятый'} />
                  <KV k="Договор" v="№ 14 от 12.01.2026" />
                  <KV k="Выплат за 2026 год" v="8" />
                  <KV k="Документы" v="договор, акты, чеки" last />
                  <div className="bz-ct" style={{ margin: '16px 0 8px' }}>История выплат</div>
                  {['Август', 'Июль', 'Июнь', 'Май'].map((m, i) => (
                    <div key={m} className="bz-visit"><b>{m} 2026 — {money((p[3] - i * 1500) * k)}</b><span>выплачено {5 + i}.0{9 - i}.2026</span></div>
                  ))}
                </>
              ),
            })}>
              <td><span className="ava">{p[0][0]}{p[0].split(' ')[1][0]}</span>{p[0]}</td>
              <td>{chip(p[1], p[1] === 'Штат' ? 'blue' : 'green')}</td><td>{p[2]}</td>
              <td>{money(p[3] * k)}</td><td>{p[4] ? money(p[4] * k) : '—'}</td><td>{p[5] ? money(p[5] * k) : '—'}</td>
              <td><b>{money((p[3] - p[4]) * k)}</b></td>
              <td>{p[1] === 'Штат' ? chip('Ведомость', 'green') : p[0] === 'Артём Митров' ? chip('Чек не получен', 'red') : chip('Чек НПД', 'green')}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="bz-grid2">
        <div className="card"><div className="bz-ct">Работа с самозанятыми мастерами</div>
          <div className="alert-row"><i style={{ background: 'var(--neg)' }} />
            <div><b>Артём Митров не прислал чек за июль</b><span>без чека выплата не уменьшает базу и повышает риск проверки</span></div>
            <button className="link-inline" onClick={() => ctx.ping('Запрос чека отправлен мастеру')}>Запросить</button></div>
          <div className="tx-note" style={{ marginTop: 12 }}>Признаки трудовых отношений с самозанятым — фиксированный график, рабочее место салона, ежемесячная одинаковая сумма. Разнесите выплаты по датам и суммам и храните чеки и акты.</div>
          <KV k="Чеков получено за 2026 год" v="19 из 21" />
          <KV k="Индикатор риска переквалификации" v={<b style={{ color: 'var(--neg)' }}>повышенный</b>} last />
        </div>
        <div className="card"><div className="bz-ct">Зарплатная отчётность</div>
          <CalItem d="25" m="сен" t="Персонифицированные сведения" s="за август, сформированы" />
          <CalItem d="28" m="сен" t="НДФЛ и взносы за август" s="к уплате" />
          <CalItem d="25" m="окт" t="6-НДФЛ за 9 месяцев" s="не хватает данных" />
          <CalItem d="25" m="окт" t="РСВ за 9 месяцев" s="сформирован" />
        </div>
      </div>
    </div>
  )
}

/* ═══ Касса и эквайринг ═══ */
function CashDesk({ ctx, org }) {
  const k = org.k
  const rnd = makeRnd(3131)
  const pick = (a) => a[Math.floor(rnd() * a.length)]
  const checks = Array.from({ length: 10 }, (_, i) => ({
    t: String(9 + i).padStart(2, '0') + ':' + pick(['05', '20', '35', '50']),
    n: '000' + (1420 + i), s: 1200 + Math.floor(rnd() * 7400), m: pick(['СБП', 'Карта', 'Наличные']),
    sv: pick(['Окрашивание', 'Маникюр', 'Чистка лица', 'Мужская стрижка', 'Ламинирование ресниц', 'Шампунь, розница']),
  }))
  return (
    <div>
      <Head t="Касса и эквайринг" s="Онлайн-касса по 54-ФЗ и приём оплат в салоне"
        right={<button className="btn-gray" style={{ width: 'auto' }} onClick={() => ctx.ping('Смена закрыта, Z-отчёт передан в ОФД')}>Закрыть смену</button>} />
      <div className="bz-grid21" style={{ marginTop: 0 }}>
        <div className="card">
          <div className="bz-ct">Смена открыта с 09:00</div>
          <div className="bz-kpis" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 8 }}>
            {[['Чеков пробито', '38'], ['Выручка за смену', money(84200 * k)], ['Средний чек', money(2216)]]
              .map(([l, v]) => <div key={l} className="bz-kpi"><div className="l">{l}</div><div className="v" style={{ fontSize: 18 }}>{v}</div></div>)}
          </div>
          <KV k="Карты и СБП" v={money(65800 * k)} />
          <KV k="Наличные" v={money(18400 * k)} />
          <KV k="Возвраты" v={'1 чек на ' + money(2400)} />
          <KV k="Передано в ОФД" v={<b style={{ color: 'var(--pos)' }}>все чеки</b>} last />
        </div>
        <div className="card">
          <div className="bz-ct">Оборудование и эквайринг</div>
          <KV k="Онлайн-касса" v="подключена" />
          <KV k="Фискальный накопитель" v="до 14.06.2027" />
          <KV k="Ставка эквайринга" v="1,7%" />
          <KV k="Комиссия за август" v={money(11186 * k)} />
          <KV k="Зачисление на счёт" v="на следующий рабочий день" last />
          <div className="tx-note" style={{ marginTop: 12 }}>Комиссия эквайринга не уменьшает доход на УСН «Доходы» — сервис учитывает её отдельно, но налог считает с полной суммы чека.</div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <div className="bz-ct">Чеки за сегодня</div>
        <table className="tbl">
          <thead><tr><th>Время</th><th>Чек</th><th>Услуга или товар</th><th>Сумма</th><th>Способ</th><th>ОФД</th></tr></thead>
          <tbody>{checks.map((c) => (
            <tr key={c.n} style={{ cursor: 'default' }}><td>{c.t}</td><td>№ {c.n}</td><td>{c.sv}</td><td>{money(c.s)}</td><td>{c.m}</td>
              <td>{chip('Передан', 'green')}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}

/* ═══ Документы салона ═══ */
function SalonDocs({ ctx, setPanel }) {
  const tpl = [
    ['Договор оказания косметологических услуг', 'с информированным согласием клиента'],
    ['Информированное добровольное согласие', 'на процедуру — отдельный бланк под каждую услугу'],
    ['Договор с самозанятым мастером', 'возмездное оказание услуг, без признаков трудовых'],
    ['Договор аренды рабочего места', 'кресло, кабинет косметолога'],
    ['Акт оказанных услуг', 'для юрлиц и корпоративных клиентов'],
    ['Счёт на оплату', 'сертификаты и корпоративные пакеты'],
    ['Правила оказания услуг салона', 'для уголка потребителя'],
    ['Журнал учёта дезинфекции', 'для проверки Роспотребнадзора'],
    ['Договор на вывоз медицинских отходов', 'класс Б для косметологии'],
  ]
  const made = [
    ['18.08.2026', 'Счёт № 214', 'ООО «Руста», корпоративные сертификаты', 48000, 'Оплачен'],
    ['12.08.2026', 'Акт № 96', 'ООО «Руста», сертификаты на 8 визитов', 48000, 'Подписан'],
    ['05.08.2026', 'Договор № 31', 'Артём Митров, самозанятый', 0, 'Действует'],
    ['01.08.2026', 'Счёт № 203', 'ИП Сафина, аренда рабочего места', 26000, 'Оплачен'],
  ]
  return (
    <div>
      <Head t="Документы салона" s="Шаблоны под отрасль и созданные документы"
        right={<button className="btn-red" style={{ marginTop: 0 }} onClick={() => ctx.ping('Выберите шаблон, чтобы создать документ')}>Создать документ</button>} />
      <div className="card" style={{ marginTop: 0 }}>
        <div className="bz-ct">Шаблоны для салонов красоты и студий</div>
        <div className="bz-grid3" style={{ marginTop: 0 }}>
          {tpl.map(([t, d]) => (
            <div key={t} className="tx-doct" onClick={() => setPanel({
              title: t, sub: 'Шаблон документа',
              body: (
                <>
                  <KV k="Формат" v="DOCX, PDF" />
                  <KV k="Реквизиты" v="подставляются автоматически" />
                  <KV k="Обновлён" v="июль 2026" last />
                  <div className="tx-note" style={{ marginTop: 14 }}>Шаблон демонстрационный. Перед использованием проверьте его с юристом — требования к согласиям и договорам в бьюти зависят от перечня услуг и наличия медицинской лицензии.</div>
                </>
              ),
              foot: (
                <>
                  <button className="btn-red" style={{ marginTop: 0 }} onClick={() => { setPanel(null); ctx.ping('Документ создан по шаблону, реквизиты подставлены') }}>Заполнить</button>
                  <button className="btn-gray" style={{ width: 'auto' }} onClick={() => setPanel(null)}>Закрыть</button>
                </>
              ),
            })}><b>{t}</b><span>{d}</span></div>
          ))}
        </div>
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <div className="bz-ct">Созданные документы</div>
        <table className="tbl">
          <thead><tr><th>Дата</th><th>Документ</th><th>Контрагент и предмет</th><th>Сумма</th><th>Статус</th></tr></thead>
          <tbody>{made.map((m, i) => (
            <tr key={i} style={{ cursor: 'default' }}><td>{m[0]}</td><td>{m[1]}</td><td>{m[2]}</td><td>{m[3] ? money(m[3]) : '—'}</td>
              <td>{chip(m[4], 'green')}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}

/* ═══ Риски и проверки ═══ */
function Risk({ ctx, setPanel }) {
  const avg = Math.round(RISKS.reduce((a, r) => a + r[1], 0) / RISKS.length)
  return (
    <div>
      <Head t="Риски и проверки" s="Оценка операций по 7 критериям, предупреждения о блокировке и календарь проверок" />
      <div className="bz-grid21" style={{ marginTop: 0 }}>
        <div className="card"><div className="bz-ct">Индикатор риска по операциям</div>
          {RISKS.map((r) => (
            <div key={r[0]} className="tx-risk big">
              <span className="nm">{r[0]}<em>{r[2]}</em></span>
              <span className="sc"><i style={{ width: `${r[1]}%`, background: r[1] > 75 ? 'var(--pos)' : r[1] > 55 ? '#f0862a' : 'var(--neg)' }} /></span>
              <span className="vl">{r[1]} из 100</span>
            </div>
          ))}
        </div>
        <div className="card"><div className="bz-ct">Общий уровень</div>
          <div className="tx-gauge"><b style={{ color: avg > 75 ? 'var(--pos)' : avg > 55 ? '#f0862a' : 'var(--neg)' }}>{avg}</b>
            <span>из 100 · {avg > 75 ? 'низкий риск' : avg > 55 ? 'средний риск' : 'повышенный риск'}</span></div>
          <div className="tx-note" style={{ marginTop: 12 }}>Самый слабый критерий — работа с самозанятыми. Разнесите выплаты по датам и суммам, соберите чеки и акты.</div>
          <KV k="Предупреждений за 2026 год" v="3" />
          <KV k="Блокировок счёта" v={<b style={{ color: 'var(--pos)' }}>не было</b>} last />
          <button className="btn-gray" style={{ width: '100%', marginTop: 12 }} onClick={() => ctx.ping('План снижения риска отправлен на почту')}>Получить план снижения риска</button>
        </div>
      </div>
      <div className="bz-grid2">
        <div className="card"><div className="bz-ct">Предупреждения</div>
          {[['Доля снятий наличных выросла до 22%', '#f0862a', 'Держите ниже 30% оборота, оформляйте назначение платежа'],
            ['Платёж без детализации назначения', '#f0862a', '3 операции на 74 000 ₽ за август'],
            ['Контрагент с признаками риска', 'var(--neg)', 'Поставщик косметики — массовый адрес регистрации']]
            .map(([t, c, d]) => (
              <div key={t} className="alert-row"><i style={{ background: c }} /><div><b>{t}</b><span>{d}</span></div></div>
            ))}
        </div>
        <div className="card"><div className="bz-ct">Проверки надзорных органов</div>
          {[['Роспотребнадзор', 'плановая, 2 квартал 2027', 'Санитарные требования к салонам: стерилизация, журналы, договор на отходы'],
            ['Налоговая', 'камеральная по декларации УСН', 'После подачи декларации за 2026 год'],
            ['Трудовая инспекция', 'риск-ориентированный подход', 'Проверяют оформление мастеров и самозанятых']]
            .map(([t, w, d]) => (
              <div key={t} className="bz-visit"><b>{t}</b><span>{w}<br />{d}</span></div>
            ))}
          <button className="btn-gray" style={{ width: '100%', marginTop: 12 }} onClick={() => setPanel({
            title: 'Чек-лист к проверке Роспотребнадзора', sub: 'Для салонов красоты и студий',
            body: ['Журнал учёта дезинфекции и стерилизации инструмента', 'Договор на вывоз отходов класса Б (для косметологии)', 'Медицинские книжки мастеров, актуальные осмотры', 'Уголок потребителя: правила оказания услуг, прейскурант', 'Сертификаты и декларации на косметику и расходники', 'Информированные согласия клиентов на процедуры', 'Программа производственного контроля', 'Договоры на стирку белья и дезинсекцию']
              .map((t) => <div key={t} className="tx-check"><span />{t}</div>),
          })}>Чек-лист подготовки к проверке</button>
        </div>
      </div>
    </div>
  )
}

/* ═══ Консультация бухгалтера ═══ */
function Consult({ ctx }) {
  return (
    <div>
      <Head t="Консультация бухгалтера" s="Точечная помощь в сложных ситуациях — одна консультация в месяц по подписке" />
      <div className="bz-grid21" style={{ marginTop: 0 }}>
        <div className="card"><div className="bz-ct">Диалог с бухгалтером</div>
          <div style={{ maxHeight: 360, overflow: 'auto', padding: '4px 2px' }}>
            <div className="tx-chat me">Здравствуйте! Продали сертификатов на 120 000 ₽, клиенты придут позже. Когда возникает доход?</div>
            <div className="tx-chat op">Добрый день! На УСН «Доходы» доход признаётся в момент получения денег — то есть в день продажи сертификата, а не в день оказания услуги. Суммы уже включили в базу за август.</div>
            <div className="tx-chat me">А если сертификат не используют и срок выйдет?</div>
            <div className="tx-chat op">Повторно доход не признаётся — он уже учтён при продаже. Если будете возвращать деньги клиенту, уменьшите доход того периода, в котором вернули.</div>
            <div className="tx-chat me">Поняла, спасибо. И ещё: аренда кресла мастеру — это доход салона?</div>
            <div className="tx-chat op">Да, арендная плата — ваш доход. Если аренда не входит в патент, она облагается по УСН. Проверьте перечень видов деятельности в патенте — я приложила выписку.</div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <div className="field" style={{ flex: 1, margin: 0 }}><input placeholder="Опишите ситуацию" id="tx-cq" /></div>
            <button className="btn-red" style={{ marginTop: 0, width: 'auto' }} onClick={() => {
              const i = document.getElementById('tx-cq')
              ctx.ping(i && i.value ? 'Вопрос отправлен, ответ придёт в течение 30 минут' : 'Опишите ситуацию в поле ввода')
            }}>Отправить</button>
          </div>
        </div>
        <div className="card"><div className="bz-ct">Лимит консультаций</div>
          <KV k="Доступно в августе" v="1 из 1" />
          <KV k="Использовано за год" v="6" />
          <KV k="Среднее время ответа" v="28 минут" />
          <KV k="Режим" v="рабочие дни, 9:00–19:00" last />
          <div className="bz-ct" style={{ margin: '18px 0 8px' }}>Частые темы в бьюти</div>
          {['Сертификаты и абонементы: когда доход', 'Самозанятые мастера и риск переквалификации', 'Патент на услуги и УСН на розницу одновременно', 'Косметология: лицензия и налоги', 'Аренда кресла: доход или посредничество']
            .map((t) => <div key={t} className="tx-doct sm" onClick={() => ctx.ping('Разбор темы откроется в новом окне (демо)')}><b>{t}</b></div>)}
        </div>
      </div>
    </div>
  )
}

/* ═══ Настройки и подписка ═══ */
function TaxSettings({ ctx }) {
  const [tab, setTab] = useState('req')
  const [subOn, setSubOn] = useState(true)
  return (
    <div>
      <Head t="Настройки и подписка" s="Реквизиты, счета, тариф и доступ к данным налоговой" />
      <div className="chips-row">
        {[['req', 'Реквизиты и режим'], ['bank', 'Мультибанк'], ['sub', 'Подписка'], ['fns', 'Данные в ФНС']].map(([id, t]) => (
          <button key={id} className={`filter-chip${tab === id ? ' active' : ''}`} onClick={() => setTab(id)}>{t}</button>
        ))}
      </div>
      {tab === 'req' && (
        <div className="bz-grid2" style={{ marginTop: 0 }}>
          <div className="card"><div className="bz-ct">Реквизиты</div>
            <KV k="Наименование" v="ИП Сиванев Виталий Александрович" />
            <KV k="ИНН" v="7724••••••12" />
            <KV k="ОГРНИП" v="3217••••••••345" />
            <KV k="Основной ОКВЭД" v="96.02 — услуги парикмахерских и салонов красоты" />
            <KV k="Дополнительные ОКВЭД" v="96.04, 86.90.4, 47.75" />
            <KV k="Адрес салона" v="Москва, Цветной бульвар, 24" last />
          </div>
          <div className="card"><div className="bz-ct">Налоговый режим</div>
            <KV k="Основной режим" v="УСН «Доходы» 6%" />
            <KV k="Патент" v="парикмахерские и косметические услуги" />
            <KV k="Сотрудники" v="2 в штате, 2 самозанятых" />
            <KV k="Онлайн-касса" v="подключена" />
            <KV k="Подходит ли АУСН" v={<b style={{ color: 'var(--pos)' }}>да, доход в пределах 20 млн ₽</b>} last />
            <button className="btn-gray" style={{ width: '100%', marginTop: 12 }} onClick={() => ctx.ping('Сравнение УСН и АУСН по фактическим доходам салона')}>Сравнить с АУСН</button>
          </div>
        </div>
      )}
      {tab === 'bank' && (
        <div className="card" style={{ marginTop: 0 }}>
          <div className="bz-ct">Подключённые счета — доходы загружаются автоматически</div>
          <table className="tbl">
            <thead><tr><th>Счёт</th><th>Назначение</th><th>Обновление</th><th>Операций за месяц</th><th>Статус</th></tr></thead>
            <tbody>{[['Расчётный счёт · основной', 'эквайринг, переводы', 'автоматически, раз в час', 214, 'Подключён'], ['Расчётный счёт · второй банк', 'маркетплейсы', 'автоматически, раз в сутки', 38, 'Подключён'], ['Счёт в третьем банке', 'аренда помещения', 'вручную, выпиской', 6, 'Импорт файлом'], ['Личная карта', 'не используется в бизнесе', '—', 0, 'Не подключён']]
              .map((r, i) => (
                <tr key={i} style={{ cursor: 'default' }}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3] || '—'}</td>
                  <td>{chip(r[4], r[4] === 'Подключён' ? 'green' : r[4] === 'Не подключён' ? 'blue' : 'orange')}</td></tr>
              ))}</tbody>
          </table>
          <div className="tx-note" style={{ marginTop: 12 }}>Мультибанк собирает поступления из разных банков в один налоговый расчёт. Если счёт не подключается автоматически, доходы можно добавить вручную или загрузить выпиской.</div>
          <button className="btn-red" style={{ marginTop: 12, width: 'auto' }} onClick={() => ctx.ping('Выберите банк для подключения по API или загрузите выписку')}>Подключить ещё счёт</button>
        </div>
      )}
      {tab === 'sub' && (
        <div className="bz-grid2" style={{ marginTop: 0 }}>
          <div className="card"><div className="bz-ct">Текущая подписка</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={subOn} onChange={() => { setSubOn(!subOn); ctx.ping(!subOn ? 'Подписка включена' : 'Подписка отключена — часть возможностей станет недоступна') }} />
              Расширенная подписка
            </label>
            <KV k="Стоимость" v="1 220 ₽ в месяц" />
            <KV k="Годовая оплата" v="12 200 ₽ — два месяца в подарок" />
            <KV k="Оплачено до" v="18.09.2026" />
            <KV k="Пробный период" v="использован" last />
          </div>
          <div className="card"><div className="bz-ct">Что входит</div>
            <table className="tbl">
              <thead><tr><th>Возможность</th><th>Без подписки</th><th>С подпиской</th></tr></thead>
              <tbody>{[['Расчёт налогов и взносов', 1, 1], ['Учёт комиссии эквайринга и маркетплейсов', 1, 1], ['Доходы из других банков', 0, 1], ['Корректировка доходов', 0, 1], ['Налоговая копилка', 0, 1], ['Ведение патента', 0, 1], ['Формирование декларации, КУДиР, уведомлений', 0, 1], ['Онлайн-подача декларации и уведомлений', 0, 1], ['Сверка с налоговой и баланс ЕНС', 1, 1], ['Консультация бухгалтера, 1 в месяц', 0, 1], ['Смена данных в ФНС', 0, 1], ['Уведомления о блокировке и проверках', 0, 1]]
                .map((r, i) => (
                  <tr key={i} style={{ cursor: 'default' }}><td>{r[0]}</td>
                    <td>{r[1] ? <b style={{ color: 'var(--pos)' }}>есть</b> : <span style={{ color: 'var(--gray-light)' }}>—</span>}</td>
                    <td>{r[2] ? <b style={{ color: 'var(--pos)' }}>есть</b> : <span style={{ color: 'var(--gray-light)' }}>—</span>}</td></tr>
                ))}</tbody>
            </table>
          </div>
        </div>
      )}
      {tab === 'fns' && (
        <div className="bz-grid2" style={{ marginTop: 0 }}>
          <div className="card"><div className="bz-ct">Смена данных в ЕГРИП</div>
            <div className="bz-note" style={{ marginBottom: 12, lineHeight: '21px' }}>Подготовим комплект документов для изменения сведений — подать их можно онлайн с УКЭП или лично в налоговой.</div>
            {['Добавить ОКВЭД (например, 96.04 — физкультурно-оздоровительная деятельность)', 'Изменить адрес салона', 'Сменить контактные данные', 'Изменить состав видов деятельности в патенте']
              .map((t) => <div key={t} className="tx-doct" onClick={() => ctx.ping('Комплект документов будет подготовлен (демо)')}><b>{t}</b></div>)}
          </div>
          <div className="card"><div className="bz-ct">Доступ к данным налоговой</div>
            <KV k="Личный кабинет налогоплательщика" v={<b style={{ color: 'var(--pos)' }}>подключён</b>} />
            <KV k="Обновление данных" v="ежедневно в 06:40" />
            <KV k="Электронная подпись" v="УКЭП до 14.03.2027" />
            <KV k="Оператор ЭДО" v="подключён" last />
          </div>
        </div>
      )}
      <div className="tx-note" style={{ marginTop: 14 }}>Прототип демонстрационный: все суммы, ставки и сроки — вымышленные данные для показа интерфейса, а не расчёт по действующему законодательству.</div>
    </div>
  )
}
