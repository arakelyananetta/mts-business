'use client'

import { useEffect, useState } from 'react'
import { icons } from './ui'

/* ═══════════════════════════════════════════════════════════
   «Мои дела» → календарь недели по времени (Пн–Вс, 09–20)
   со встроенным МТС Линк, резюме, комментариями и отбивкой
   Демо-неделя: 17–23 августа 2026, сегодня — пятница 21.08
   ═══════════════════════════════════════════════════════════ */

const DAYS = [
  { d: 'Пн', n: 17 }, { d: 'Вт', n: 18 }, { d: 'Ср', n: 19 }, { d: 'Чт', n: 20 },
  { d: 'Пт', n: 21, today: true }, { d: 'Сб', n: 22 }, { d: 'Вс', n: 23 },
]
const START = 9 * 60, END = 20 * 60, HOUR = 56 // px на час
const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
const endT = (t, dur) => { const e = toMin(t) + dur; return `${String(Math.floor(e / 60)).padStart(2, '0')}:${String(e % 60).padStart(2, '0')}` }

const MEETINGS_INIT = [
  /* ── Пн 17 ── */
  {
    id: 'm1', day: 0, time: '10:00', dur: 60, title: 'Планёрка с мастерами', online: false,
    place: 'Салон «Viron», Зал 1 · Цветной бульвар, 24', who: 'Вся команда · 6 человек',
    note: 'Прайс на осень и график отпусков', past: true,
    summary: ['Загрузка недели — 78%, суббота переполнена: добавить смену мастера', 'Запускаем ламинирование ресниц с 24 августа, цена 2 700 ₽', 'График отпусков согласован: Марина — с 7 сентября'],
    deal: 'Ирина обновляет прайс в онлайн-записи до 20.08',
    comments: [['Ирина (администратор)', 'Прайс обновила, ламинирование уже в форме записи']],
  },
  {
    id: 'm1b', day: 0, time: '13:30', dur: 30, title: 'Созвон с «БьютиОпт»', online: true,
    place: 'Видеовстреча в МТС Линк', who: 'Олег Крамаренко, менеджер',
    note: 'Сверить заказ расходников на сентябрь', past: true,
    summary: ['Заказ на сентябрь подтверждён — 42 100 ₽, скидка 5% за объём', 'Доставка 7 сентября, к открытию смены'],
    comments: [],
  },
  {
    id: 'm1c', day: 0, time: '17:00', dur: 60, title: 'Обучение администраторов', online: false,
    place: 'Салон «Viron» · ресепшен', who: 'Ирина и Юлия, администраторы',
    note: 'Скрипты записи и работа с листом ожидания', past: true,
    summary: ['Разобрали сценарий предложения свободных слотов из листа ожидания', 'Ввели правило: подтверждение визита звонком для новых клиентов'],
    comments: [],
  },
  /* ── Вт 18 ── */
  {
    id: 'm2a', day: 1, time: '09:30', dur: 60, title: 'Приёмка поставки «Космопрофф»', online: false,
    place: 'Салон «Viron» · склад', who: 'Ирина + курьер поставщика',
    note: 'Проверить сроки годности красителей', past: true,
    summary: ['Принято 14 позиций на 86 400 ₽, расхождений нет', 'Краситель 6.0 — остаток всё ещё ниже минимума, дозаказ на пятницу'],
    comments: [],
  },
  {
    id: 'm2', day: 1, time: '15:00', dur: 60, title: 'Продление аренды — ТЦ «Радуга»', online: true,
    place: 'Видеовстреча в МТС Линк', who: 'Анна Ершова, менеджер арендаторов',
    note: 'Условия индексации и парковка для клиентов', past: true,
    summary: ['Аренда продлена до августа 2027 года', 'Индексация 5% вместо 9% — скидка за долгосрочный договор', 'Парковка: 2 места для клиентов салона с сентября'],
    deal: 'Подписать допсоглашение в «Документообороте» до 25.08',
    comments: [['Виталий', 'Допсоглашение пришло, отправил бухгалтеру на проверку']],
  },
  {
    id: 'm2b', day: 1, time: '18:00', dur: 30, title: 'Разбор отзывов недели', online: false,
    place: 'Салон «Viron» · кабинет', who: 'Ирина, администратор',
    note: 'Два отзыва 3★ по ожиданию в субботу', past: true,
    summary: ['Причина ожидания — перегруз субботы, решается доп. сменой', 'Клиентам с 3★ отправили извинения и 500 бонусов — оба записались снова'],
    comments: [],
  },
  /* ── Ср 19 ── */
  {
    id: 'm3', day: 2, time: '12:30', dur: 60, title: 'Собеседование: мастер маникюра', online: false,
    place: 'Салон «Viron» · Цветной бульвар, 24', who: 'Алёна Ракова, кандидат',
    note: 'Портфолио и санитарные сертификаты', past: true,
    summary: ['Опыт 4 года, сильное покрытие и дизайн — уровень Grade B', 'Ждёт 30% с услуг + ставка, совпадает с нашей схемой', 'Пробный день назначен на 24 августа'],
    deal: 'Подготовить рабочее место и расходники к пробному дню',
    comments: [],
  },
  {
    id: 'm3b', day: 2, time: '16:00', dur: 45, title: 'Созвон по онлайн-записи', online: true,
    place: 'Видеовстреча в МТС Линк', who: 'Студия «Вебформа», подрядчик',
    note: 'Виджет на сайте и предоплата 30%', past: true,
    summary: ['Виджет онлайн-записи обновят до 23.08 — тёмная тема и предоплата', 'QR-код для зеркал в залах пришлют макетом'],
    comments: [],
  },
  {
    id: 'm3c', day: 2, time: '19:00', dur: 60, title: 'Встреча с дизайнером интерьера', online: false,
    place: 'Кофейня «Атмосфера» · Цветной бульвар, 15', who: 'Мария Литвин, дизайнер',
    note: 'Эскизы зоны ожидания и смета', past: true,
    summary: ['Выбрали эскиз №2 — зона ожидания с витриной косметики', 'Смета 340 000 ₽, работы — две ночи без остановки салона'],
    comments: [],
  },
  /* ── Чт 20 ── */
  {
    id: 'm4a', day: 3, time: '11:00', dur: 60, title: 'Сервис аппарата — «Лазер-Мед»', online: false,
    place: 'Салон «Viron» · кабинет косметолога', who: 'Инженер «Лазер-Мед Сервис»',
    note: 'Плановое ТО и калибровка', past: true,
    summary: ['ТО пройдено, аппарат допущен к работе до февраля 2027', 'Рекомендована замена фильтра в ноябре — внесли в план'],
    comments: [],
  },
  {
    id: 'm4', day: 3, time: '17:00', dur: 45, title: 'Созвон с бухгалтером', online: true,
    place: 'Видеовстреча в МТС Линк', who: 'Ольга Николаевна, бухгалтер',
    note: 'Аванс УСН и чеки самозанятых', past: true,
    summary: ['Аванс по УСН за 9 месяцев — 94 600 ₽, оплатить до 28.10', 'Артём не прислал чек НПД за июль — запросить повторно', 'Процент копилки оставить 8% — на платёж хватает'],
    deal: 'Запросить чек у Артёма и подать уведомление из «Налогов и бухгалтерии»',
    comments: [['Ольга Николаевна', 'Уведомление сформировала, можно подавать онлайн']],
  },
  /* ── Пт 21 · сегодня ── */
  {
    id: 'm5a', day: 4, time: '09:30', dur: 30, title: 'Летучка смены', online: false,
    place: 'Салон «Viron» · ресепшен', who: 'Мастера пятничной смены',
    note: 'Загрузка дня и VIP-визит в 15:00', past: true,
    summary: ['Сегодня 14 визитов, свободно 3 слота после 18:00', 'К VIP-визиту в 15:00 — зал 1 и парковка'],
    comments: [],
  },
  {
    id: 'm5', day: 4, time: '13:00', dur: 90, title: 'Встреча с поставщиком «Космопрофф»', online: false, soon: true,
    place: 'Москва, ул. Складочная, 1, стр. 18 · офис 412', who: 'Дмитрий Коваль, менеджер по работе с салонами',
    note: 'Возьмите акт сверки и список 4 позиций ниже минимума со склада',
    comments: [['Ирина (администратор)', 'Список критических остатков выгрузила, он в чате']],
  },
  {
    id: 'm6', day: 4, time: '16:00', dur: 60, title: 'Демо сервиса «Масштабирование»', online: true,
    place: 'Видеовстреча в МТС Линк', who: 'Сергей Ильин, менеджер сервиса',
    note: 'Подготовить вопросы по отчёту о второй локации',
    comments: [],
  },
  {
    id: 'm5b', day: 4, time: '18:30', dur: 45, title: 'Собеседование: администратор', online: true,
    place: 'Видеовстреча в МТС Линк', who: 'Дарья Клименко, кандидат',
    note: 'Опыт с CRM и графиком 2/2',
    comments: [],
  },
  /* ── Сб 22 ── */
  {
    id: 'm7', day: 5, time: '11:00', dur: 120, title: 'Фотосъёмка интерьера', online: false,
    place: 'Салон «Viron» · Цветной бульвар, 24', who: 'Студия «Кадр», 2 фотографа',
    note: 'Освободить Зал 2 с 10:30, свежие цветы на ресепшен',
    comments: [],
  },
  {
    id: 'm7b', day: 5, time: '15:00', dur: 90, title: 'Мастер-класс по колористике', online: false,
    place: 'Салон «Viron» · Зал 1', who: 'Ольга Ковалёва + 4 мастера',
    note: 'Модели записаны на 15:15, материалы — со склада',
    comments: [],
  },
  /* ── Вс 23 ── */
  {
    id: 'm8', day: 6, time: '12:00', dur: 90, title: 'Инвентаризация склада', online: false,
    place: 'Салон «Viron» · склад', who: 'Ирина, администратор',
    note: 'Сверить остатки с данными раздела «Склад»',
    comments: [],
  },
  {
    id: 'm8b', day: 6, time: '17:00', dur: 30, title: 'Планирование следующей недели', online: true,
    place: 'Видеовстреча в МТС Линк', who: 'Ирина + Ольга Ковалёва',
    note: 'Смены, пробный день Алёны и акция на уход',
    comments: [],
  },
]

const SOON = MEETINGS_INIT.find((m) => m.soon)

/* встроенный экран видеовстречи МТС Линк */
function LinkCall({ m, ctx, onLeave }) {
  const [mic, setMic] = useState(true)
  const [cam, setCam] = useState(true)
  const people = [['ВС', 'Виталий Сиванев', 'вы'], ...(m.id === 'm6'
    ? [['СИ', 'Сергей Ильин', 'говорит'], ['ИЛ', 'Ирина', ''], ['', 'Демонстрация экрана', 'screen']]
    : [['ОН', 'Ольга Николаевна', 'говорит'], ['ИЛ', 'Ирина', ''], ['АЕ', 'Анна Ершова', '']])]
  return (
    <div className="wk-call">
      <div className="wk-call-top">
        <b>МТС Линк</b>
        <span>{m.title} · 00:12:47</span>
        <i className="rec">● запись</i>
      </div>
      <div className="wk-call-grid">
        {people.map(([ini, name, st]) => (
          <div key={name} className={`wk-tile${st === 'говорит' ? ' talk' : ''}${st === 'screen' ? ' screen' : ''}`}>
            {st === 'screen'
              ? <span className="scr">▦<small>Презентация · отчёт по локации</small></span>
              : <span className="av">{ini}</span>}
            <b>{name}{st === 'вы' ? ' (вы)' : ''}</b>
          </div>
        ))}
      </div>
      <div className="wk-call-bar">
        <button className={mic ? '' : 'off'} onClick={() => { setMic(!mic); ctx.ping(mic ? 'Микрофон выключен' : 'Микрофон включён') }}>{mic ? '🎤' : '🔇'}</button>
        <button className={cam ? '' : 'off'} onClick={() => { setCam(!cam); ctx.ping(cam ? 'Камера выключена' : 'Камера включена') }}>{cam ? '🎥' : '📷'}</button>
        <button onClick={() => ctx.ping('Демонстрация экрана — доступна участникам (демо)')}>🖥</button>
        <button onClick={() => ctx.ping('Чат встречи открыт (демо)')}>💬</button>
        <button onClick={() => ctx.ping('ИИ-помощник МТС Линк готовит резюме по записи встречи')}>✨</button>
        <button className="leave" onClick={onLeave}>Выйти</button>
      </div>
    </div>
  )
}

export function WeekPlanner({ ctx }) {
  const [meetings, setMeetings] = useState(MEETINGS_INIT)
  const [open, setOpen] = useState(null)
  const [call, setCall] = useState(false)
  const [form, setForm] = useState(false)
  const [push, setPush] = useState(false)
  const [cmt, setCmt] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setPush(true), 7000)
    return () => clearTimeout(t)
  }, [])

  const m = meetings.find((x) => x.id === open)
  const openMeeting = (id) => { setOpen(id); setCall(false); setCmt('') }
  const close = () => { setOpen(null); setCall(false) }
  const addComment = () => {
    if (!cmt.trim()) return
    setMeetings((ms) => ms.map((x) => (x.id === m.id ? { ...x, comments: [...x.comments, ['Виталий', cmt.trim()]] } : x)))
    setCmt('')
    ctx.ping('Комментарий добавлен — его видит вся команда')
  }
  const addMeeting = () => {
    const g = (id) => document.getElementById(id)?.value
    const title = g('wk-f-title') || 'Новая встреча'
    const day = +(g('wk-f-day') ?? 4)
    const time = /^\d{1,2}:\d{2}$/.test(g('wk-f-time') || '') ? g('wk-f-time') : '18:00'
    const online = g('wk-f-fmt') === 'МТС Линк (видеовстреча)'
    setMeetings((ms) => [...ms, {
      id: 'new' + Date.now(), day, time, dur: 60, title, online,
      place: online ? 'Видеовстреча в МТС Линк' : (g('wk-f-place') || 'Салон «Viron» · Цветной бульвар, 24'),
      who: g('wk-f-who') || 'Участники не указаны',
      note: g('wk-f-note') || '—', comments: [],
    }])
    setForm(false)
    ctx.ping(`Встреча «${title}» добавлена — ${DAYS[day].d} ${DAYS[day].n}.08 в ${time}${online ? ', ссылка МТС Линк создана' : ''}`)
  }

  const hours = Array.from({ length: (END - START) / 60 }, (_, i) => START / 60 + i)
  const gridH = (END - START) / 60 * HOUR

  return (
    <div className="card" style={{ marginTop: 18 }}>
      <div className="list-head" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 className="block-title" style={{ fontSize: 16 }}>Календарь недели</h3>
          <p className="block-sub" style={{ margin: '2px 0 0' }}>17–23 августа · встречи, видеосвязь МТС Линк и резюме — в одном месте</p>
        </div>
        <button className="btn-red" style={{ marginTop: 0, width: 'auto' }} onClick={() => setForm(true)}>+ Добавить встречу</button>
      </div>

      {/* отбивка-напоминание о ближайшей встрече */}
      <div className="wk-remind" onClick={() => openMeeting(SOON.id)}>
        <span className="em" aria-hidden="true">⏰</span>
        <div>
          <b>Через час у вас встреча — 13:00, «Космопрофф»</b>
          <p>{SOON.place} · {SOON.who}</p>
          <p className="hint">💡 Не забыть: {SOON.note.toLowerCase()}</p>
        </div>
        <div className="wk-remind-btns">
          <button className="btn-gray" style={{ width: 'auto' }} onClick={(e) => { e.stopPropagation(); openMeeting(SOON.id) }}>Открыть</button>
          <button className="btn-gray" style={{ width: 'auto' }} onClick={(e) => { e.stopPropagation(); ctx.ping('Маршрут построен: 24 минуты на машине (демо)') }}>Маршрут</button>
        </div>
      </div>

      {/* ── временная сетка Пн–Вс ── */}
      <div className="wk-tg-wrap">
        <div className="wk-tg">
          <div className="wk-tg-head">
            <div />
            {DAYS.map((d) => (
              <div key={d.d} className={d.today ? 'today' : ''}>
                <b>{d.d}</b><span>{d.n}.08</span>{d.today && <i>сегодня</i>}
              </div>
            ))}
          </div>
          <div className="wk-tg-body" style={{ height: gridH }}>
            <div className="wk-tg-time">
              {hours.map((h) => <div key={h} style={{ height: HOUR }}>{String(h).padStart(2, '0')}:00</div>)}
            </div>
            {DAYS.map((d, di) => (
              <div key={d.d} className={`wk-tg-col${d.today ? ' today' : ''}`}>
                {hours.map((h) => <div key={h} className="wk-tg-line" style={{ top: (h - START / 60) * HOUR }} />)}
                {d.today && <div className="wk-tg-now" style={{ top: (12 * 60 - START) / 60 * HOUR }}><i>12:00</i></div>}
                {meetings.filter((x) => x.day === di).map((x) => {
                  const top = (toMin(x.time) - START) / 60 * HOUR + 1
                  const h = Math.max(26, x.dur / 60 * HOUR - 4)
                  return (
                    <button key={x.id} className={`wk-tg-ev${x.past ? ' past' : ''}${x.soon ? ' soon' : ''}${x.online ? ' online' : ''}`}
                      style={{ top, height: h }} onClick={() => openMeeting(x.id)}>
                      <b>{x.time}–{endT(x.time, x.dur)}{x.soon ? ' · через час' : ''}</b>
                      <span>{x.title}</span>
                      {h > 44 && <i>{x.online ? '🎥 МТС Линк' : '📍 ' + x.place.split('·')[0].trim()}</i>}
                      {x.past && h > 60 && <em>✓ резюме готово</em>}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="wk-legend">🎥 — видеовстреча во встроенном МТС Линк · ✓ — по прошедшим встречам готово резюме из записи · красная линия — текущее время</p>

      {/* ── карточка встречи ── */}
      {m && (
        <div className="wk-ov" onClick={close}>
          <div className="wk-modal" onClick={(e) => e.stopPropagation()}>
            <button className="bz-panel-x" onClick={close} aria-label="Закрыть">{icons.close}</button>
            <h3>{m.title}</h3>
            <p className="wk-sub">{DAYS[m.day].d}, {DAYS[m.day].n} августа · {m.time}–{endT(m.time, m.dur)} · {m.past ? 'встреча прошла' : 'предстоит'}</p>

            {call ? <LinkCall m={m} ctx={ctx} onLeave={() => { setCall(false); ctx.ping('Вы вышли из встречи — запись сохранится в резюме') }} /> : (
              <>
                <div className="kv-row"><span>{m.online ? 'Формат' : 'Адрес'}</span><b>{m.place}</b></div>
                <div className="kv-row"><span>Участники</span><b>{m.who}</b></div>
                <div className="kv-row" style={{ borderBottom: 'none' }}><span>Не забыть</span><b>💡 {m.note}</b></div>

                {m.online && !m.past && (
                  <button className="btn-red" style={{ width: '100%', marginTop: 12 }} onClick={() => setCall(true)}>🎥 Подключиться в МТС Линк</button>
                )}
                {!m.online && !m.past && (
                  <button className="btn-gray" style={{ width: '100%', marginTop: 12 }} onClick={() => ctx.ping('Маршрут построен: 24 минуты на машине (демо)')}>Построить маршрут</button>
                )}

                {m.past && m.summary && (
                  <div className="wk-sum">
                    <div className="wk-sum-h"><b>Резюме встречи</b><span>✨ сформировано из записи МТС Линк</span></div>
                    <ul>{m.summary.map((s) => <li key={s}>{s}</li>)}</ul>
                    {m.deal && (
                      <div className="wk-deal">
                        <span>Договорённость: <b>{m.deal}</b></span>
                        <button className="link-inline" onClick={() => { ctx.addTask(m.deal); ctx.ping('Договорённость добавлена в задачи') }}>В задачи</button>
                      </div>
                    )}
                  </div>
                )}

                <div className="bz-ct" style={{ margin: '16px 0 8px' }}>Комментарии {m.comments.length ? `· ${m.comments.length}` : ''}</div>
                {m.comments.map(([who, text], i) => (
                  <div key={i} className="wk-cmt"><b>{who}</b><span>{text}</span></div>
                ))}
                {m.comments.length === 0 && <p className="block-sub" style={{ margin: 0 }}>Пока нет комментариев — напишите первым, команда увидит.</p>}
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <div className="field" style={{ flex: 1, margin: 0 }}>
                    <input placeholder="Комментарий к встрече" value={cmt} onChange={(e) => setCmt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addComment()} />
                  </div>
                  <button className="btn-gray" style={{ width: 'auto' }} onClick={addComment}>Отправить</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── новая встреча ── */}
      {form && (
        <div className="wk-ov" onClick={() => setForm(false)}>
          <div className="wk-modal" onClick={(e) => e.stopPropagation()}>
            <button className="bz-panel-x" onClick={() => setForm(false)} aria-label="Закрыть">{icons.close}</button>
            <h3>Новая встреча</h3>
            <p className="wk-sub">Появится в календаре недели, участники получат приглашение</p>
            <div className="field"><label>Название</label><input id="wk-f-title" placeholder="Например: дегустация уходовой линейки" /></div>
            <div className="wk-form-row">
              <div className="field"><label>День</label>
                <select className="select" id="wk-f-day" defaultValue="4" style={{ width: '100%' }}>
                  {DAYS.map((d, i) => <option key={d.d} value={i}>{d.d}, {d.n} августа</option>)}
                </select></div>
              <div className="field"><label>Время</label><input id="wk-f-time" placeholder="18:00" /></div>
            </div>
            <div className="field"><label>Формат</label>
              <select className="select" id="wk-f-fmt" style={{ width: '100%' }}>
                <option>МТС Линк (видеовстреча)</option>
                <option>Офлайн — укажите адрес</option>
              </select></div>
            <div className="field"><label>Адрес (для офлайн)</label><input id="wk-f-place" placeholder="Салон «Viron» · Цветной бульвар, 24" /></div>
            <div className="field"><label>Участники</label><input id="wk-f-who" placeholder="Имена или телефоны через запятую" /></div>
            <div className="field"><label>Что не забыть (подсказка в отбивке)</label><input id="wk-f-note" placeholder="Например: взять договор и образцы" /></div>
            <button className="btn-red" style={{ width: '100%', marginTop: 6 }} onClick={addMeeting}>Добавить встречу</button>
          </div>
        </div>
      )}

      {/* ── push-отбивка «через час встреча» ── */}
      {push && (
        <div className="push-note" style={{ zIndex: 160 }} onClick={() => { setPush(false); openMeeting(SOON.id) }}>
          <span className="pn-emoji" aria-hidden="true">⏰</span>
          <div>
            <b>Через час у вас встреча — 13:00</b>
            <p>«Космопрофф» · {SOON.who.split(',')[0]}<br />{SOON.place}</p>
            <p style={{ marginTop: 6 }}>💡 Не забыть: {SOON.note.toLowerCase()}</p>
          </div>
          <button className="icon-btn pn-close" onClick={(e) => { e.stopPropagation(); setPush(false) }} aria-label="Закрыть">{icons.close}</button>
        </div>
      )}
    </div>
  )
}
