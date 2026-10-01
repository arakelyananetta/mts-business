'use client'

import { useEffect, useState } from 'react'
import { icons } from './ui'

/* ═══════════════════════════════════════════════════════════
   «Мои дела» → недельный календарь встреч
   со встроенным МТС Линк, резюме, комментариями и отбивкой
   Демо-неделя: 17–23 августа 2026, сегодня — пятница 21.08
   ═══════════════════════════════════════════════════════════ */

const DAYS = [
  { d: 'Пн', n: 17 }, { d: 'Вт', n: 18 }, { d: 'Ср', n: 19 }, { d: 'Чт', n: 20 },
  { d: 'Пт', n: 21, today: true }, { d: 'Сб', n: 22 }, { d: 'Вс', n: 23 },
]

const MEETINGS_INIT = [
  {
    id: 'm1', day: 0, time: '10:00', title: 'Планёрка с мастерами', online: false,
    place: 'Салон «Viron», Зал 1 · Цветной бульвар, 24', who: 'Вся команда · 6 человек',
    note: 'Прайс на осень и график отпусков', past: true,
    summary: ['Загрузка недели — 78%, суббота переполнена: добавить смену мастера', 'Запускаем ламинирование ресниц с 24 августа, цена 2 700 ₽', 'График отпусков согласован: Марина — с 7 сентября'],
    deal: 'Ирина обновляет прайс в онлайн-записи до 20.08',
    comments: [['Ирина (администратор)', 'Прайс обновила, ламинирование уже в форме записи']],
  },
  {
    id: 'm2', day: 1, time: '15:00', title: 'Продление аренды — ТЦ «Радуга»', online: true,
    place: 'Видеовстреча в МТС Линк', who: 'Анна Ершова, менеджер арендаторов',
    note: 'Условия индексации и парковка для клиентов', past: true,
    summary: ['Аренда продлена до августа 2027 года', 'Индексация 5% вместо 9% — скидка за долгосрочный договор', 'Парковка: 2 места для клиентов салона с сентября'],
    deal: 'Подписать допсоглашение в «Документообороте» до 25.08',
    comments: [['Виталий', 'Допсоглашение пришло, отправил бухгалтеру на проверку']],
  },
  {
    id: 'm3', day: 2, time: '12:30', title: 'Собеседование: мастер маникюра', online: false,
    place: 'Салон «Viron» · Цветной бульвар, 24', who: 'Алёна Ракова, кандидат',
    note: 'Портфолио и санитарные сертификаты', past: true,
    summary: ['Опыт 4 года, сильное покрытие и дизайн — уровень Grade B', 'Ждёт 30% с услуг + ставка, совпадает с нашей схемой', 'Пробный день назначен на 24 августа'],
    deal: 'Подготовить рабочее место и расходники к пробному дню',
    comments: [],
  },
  {
    id: 'm4', day: 3, time: '17:00', title: 'Созвон с бухгалтером', online: true,
    place: 'Видеовстреча в МТС Линк', who: 'Ольга Николаевна, бухгалтер',
    note: 'Аванс УСН и чеки самозанятых', past: true,
    summary: ['Аванс по УСН за 9 месяцев — 94 600 ₽, оплатить до 28.10', 'Артём не прислал чек НПД за июль — запросить повторно', 'Процент копилки оставить 8% — на платёж хватает'],
    deal: 'Запросить чек у Артёма и подать уведомление из «Налогов и бухгалтерии»',
    comments: [['Ольга Николаевна', 'Уведомление сформировала, можно подавать онлайн']],
  },
  {
    id: 'm5', day: 4, time: '13:00', title: 'Встреча с поставщиком «Космопрофф»', online: false, soon: true,
    place: 'Москва, ул. Складочная, 1, стр. 18 · офис 412', who: 'Дмитрий Коваль, менеджер по работе с салонами',
    note: 'Возьмите акт сверки и список 4 позиций ниже минимума со склада',
    comments: [['Ирина (администратор)', 'Список критических остатков выгрузила, он в чате']],
  },
  {
    id: 'm6', day: 4, time: '16:00', title: 'Демо сервиса «Масштабирование»', online: true,
    place: 'Видеовстреча в МТС Линк', who: 'Сергей Ильин, менеджер сервиса',
    note: 'Подготовить вопросы по отчёту о второй локации',
    comments: [],
  },
  {
    id: 'm7', day: 5, time: '11:00', title: 'Фотосъёмка интерьера', online: false,
    place: 'Салон «Viron» · Цветной бульвар, 24', who: 'Студия «Кадр», 2 фотографа',
    note: 'Освободить Зал 2 с 10:30, свежие цветы на ресепшен',
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
  const [open, setOpen] = useState(null) // meeting id
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
    const time = g('wk-f-time') || '18:00'
    const online = g('wk-f-fmt') === 'МТС Линк (видеовстреча)'
    setMeetings((ms) => [...ms, {
      id: 'new' + Date.now(), day, time, title, online,
      place: online ? 'Видеовстреча в МТС Линк' : (g('wk-f-place') || 'Салон «Viron» · Цветной бульвар, 24'),
      who: g('wk-f-who') || 'Участники не указаны',
      note: g('wk-f-note') || '—', comments: [],
    }])
    setForm(false)
    ctx.ping(`Встреча «${title}» добавлена — ${DAYS[day].d} ${DAYS[day].n}.08 в ${time}${online ? ', ссылка МТС Линк создана' : ''}`)
  }

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

      <div className="wk-grid">
        {DAYS.map((d, di) => (
          <div key={d.d} className={`wk-day${d.today ? ' today' : ''}`}>
            <div className="wk-day-h"><b>{d.d}</b><span>{d.n}.08</span>{d.today && <i>сегодня</i>}</div>
            {meetings.filter((x) => x.day === di).sort((a, b) => a.time.localeCompare(b.time)).map((x) => (
              <button key={x.id} className={`wk-ev${x.past ? ' past' : ''}${x.soon ? ' soon' : ''}`} onClick={() => openMeeting(x.id)}>
                <b>{x.time}</b>
                <span>{x.title}</span>
                <i>{x.online ? '🎥 МТС Линк' : '📍 ' + x.place.split('·')[0].trim()}</i>
                {x.past && <em>✓ резюме готово</em>}
                {x.soon && <em className="hot">через час</em>}
              </button>
            ))}
            {meetings.filter((x) => x.day === di).length === 0 && <div className="wk-free">нет встреч</div>}
          </div>
        ))}
      </div>
      <p className="wk-legend">🎥 — видеовстреча во встроенном МТС Линк · ✓ — по прошедшим встречам готово резюме из записи</p>

      {/* ── карточка встречи ── */}
      {m && (
        <div className="wk-ov" onClick={close}>
          <div className="wk-modal" onClick={(e) => e.stopPropagation()}>
            <button className="bz-panel-x" onClick={close} aria-label="Закрыть">{icons.close}</button>
            <h3>{m.title}</h3>
            <p className="wk-sub">{DAYS[m.day].d}, {DAYS[m.day].n} августа · {m.time} · {m.past ? 'встреча прошла' : 'предстоит'}</p>

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

                {m.past && (
                  <div className="wk-sum">
                    <div className="wk-sum-h"><b>Резюме встречи</b><span>✨ сформировано из записи МТС Линк</span></div>
                    <ul>{m.summary.map((s) => <li key={s}>{s}</li>)}</ul>
                    <div className="wk-deal">
                      <span>Договорённость: <b>{m.deal}</b></span>
                      <button className="link-inline" onClick={() => { ctx.addTask(m.deal); ctx.ping('Договорённость добавлена в задачи') }}>В задачи</button>
                    </div>
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
