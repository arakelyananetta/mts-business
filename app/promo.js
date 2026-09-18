'use client'

import { useState } from 'react'
import { icons } from './ui'
import { CampaignLauncher } from './sections'
import { SEGMENTS, GOAL_CARDS, PROMO_CASES, PROMO_HELP, PROMO_TOOLS_OK } from './data'

/* ═══════════════════════════════════════════════════════════
   Кабинет «Продвижение» — полный личный кабинет запуска
   кампаний, перенесённый по референсу и адаптированный
   под визуальный язык прототипа (интеграция по API)
   ═══════════════════════════════════════════════════════════ */

const chip = ([label, cls], key) => <span key={key || label} className={`chip ${cls}`}>{label}</span>

/* ── продуктовые страницы ── */
const PRODUCTS = {
  scale: {
    t: 'Таргетированные SMS и MMS рассылки', e: '💬',
    g: 'linear-gradient(115deg, #3f76bd 0%, #5b8fcb 40%, #a9c8e4 80%, #dfe7f2 100%)',
    d: 'А также push-уведомления и email по абонентам МТС',
    ctas: [['Создать кампанию', ['sms']]],
    task: [
      'Находите клиентов среди 65+ млн активных абонентов МТС с таргетингами на базе Big Data. Социально-демографические фильтры, геолокация и сегменты по интересам помогут сделать потенциальным клиентам персональное предложение.',
      'Для дополнительного охвата используйте push-уведомления и email-рассылку по абонентам МТС.',
    ],
    feats: [
      ['Кликабельность (CTR)', 'Точные таргетинги и выгодное предложение — аудитория активно откликается на призыв к действию'],
      ['Без спама', 'Сообщения получают только абоненты, давшие согласие на рассылки партнёров'],
      ['Кастомные сегменты', 'Собирайте узкие сегменты самостоятельно прямо в кабинете'],
      ['Модерация за 4 часа', 'Быстро проверяем кампании на требования платформы и ФЗ «О рекламе»'],
      ['Доступно всем', 'Запуск для юрлиц, ИП и самозанятых — на любой бюджет'],
      ['Бесплатное имя отправителя', 'Отправляйте от общего Promo или согласуйте имя вашего салона'],
    ],
    prices: [['SMS и MMS', 'от 5,1 ₽'], ['Email', 'от 2 ₽'], ['Push', 'от 3 ₽']],
    faq: [
      ['В чём разница между SMS и MMS?', 'SMS до 70 символов стоит от 5,1 ₽, дальше цена растёт по длине текста. В MMS можно добавить картинку и больше текста.'],
      ['Как найти аудиторию для рассылки?', 'Настройте таргетинг в кабинете: пол, возраст, гео, доход — и добавьте готовые сегменты по интересам.'],
      ['Нужно ли согласие пользователей?', 'Для таргетированных рассылок — нет: сообщения получают только абоненты, согласившиеся на рекламу партнёров.'],
      ['От кого придёт рассылка?', 'На выбор: стандартное имя Promo или согласованное индивидуальное имя, например «Viron».'],
      ['Как пройти модерацию?', 'Есть гайд по текстам: ключевые требования платформы, ФЗ «О рекламе» и операторов — смотрите в «Помощи».'],
    ],
  },
  a2ppro: {
    t: 'Рассылки по своей базе PRO', e: '📇',
    g: 'linear-gradient(115deg, #5d4bbf 0%, #7f6ad6 40%, #bdb2ea 80%, #e9e5f7 100%)',
    d: 'Отправляйте сообщения абонентам любых операторов прямо из кабинета',
    ctas: [['Начать работу', ['own']]],
    task: [
      'Отправляйте сообщения текущим клиентам и сотрудникам: обрабатывайте входящие обращения, настраивайте напоминания о записи, отправляйте одноразовые пароли.',
    ],
    feats: [
      ['Персонализация', 'Обращайтесь к клиенту по имени и используйте данные о визитах для персональных предложений'],
      ['Разные виды интеграций', 'Готовые решения для 1С и почты, интеграции с любой системой по API, SMPP и SMTP'],
      ['Шаблонирование', 'Согласуйте шаблоны сервисных SMS и платите за них меньше'],
      ['Адресная книга', 'Храните контакты в кабинете и быстро собирайте группы получателей'],
      ['Планирование', 'Запускайте рассылку сразу или к нужной дате и времени'],
      ['Рассылки из Excel-файла', 'Планируйте отправку сообщений с разным текстом и датами'],
    ],
    prices: [
      ['Подписка «Шаблонные SMS на МТС»', 'от 7,32 ₽/мес за получателя*'],
      ['Подписка «Шаблонные SMS на операторов РФ»', 'от 11 ₽/мес за получателя*'],
      ['Пакет «Обычные SMS на МТС»', 'от 7,54 ₽'],
      ['Пакет «Обычные SMS на всех операторов РФ»', 'от 7 ₽'],
    ],
    pnote: '*При подписке шаблоны оплачиваются отдельно — 1 200 ₽/мес за каждый. Цены указаны с учётом НДС',
    faq: [
      ['Где взять базу для рассылки?', 'Собирайте контакты клиентов через анкеты, программу лояльности и лид-формы. Важно, чтобы клиенты согласились получать от вас сообщения.'],
      ['Можно ли автоматизировать рассылки?', 'Да: настройте в своей системе триггеры, по которым будут автоматически уходить SMS с нужным текстом.'],
      ['От кого будет уходить рассылка?', 'Согласуйте одно или несколько имён отправителя. Первое имя для рассылок по абонентам МТС — бесплатно.'],
      ['Как оплачивать рассылки?', 'Подключите тариф: пакет SMS, подписку или оплату по факту. Тарифы действуют до конца календарного месяца.'],
    ],
  },
  a2p: {
    t: 'Простые рассылки', e: '✉️',
    g: 'linear-gradient(115deg, #1f7ec4 0%, #4aa3dd 40%, #a5d3ee 80%, #e6f2fa 100%)',
    d: 'Простой сервис для отправки сообщений по своей базе — только номера МТС',
    ctas: [['Создать рассылку', ['own']]],
    task: ['Базовый функционал для рассылок абонентам МТС. Подходит бизнесу с небольшой клиентской базой и тем, кто отправляет сообщения нерегулярно.'],
    feats: [
      ['Общая статистика', 'В дашборде видно, сколько сообщений вы отправили'],
      ['Без ограничений по количеству', 'Отправляйте сколько нужно — платите за каждое SMS'],
      ['Имя отправителя бесплатно', 'Укажите, от кого клиенты будут получать сообщения'],
    ],
    prices: [['SMS на номера МТС', 'от 7,54 ₽']],
    faq: [
      ['Где взять базу для рассылки?', 'Контакты клиентов с их согласием: анкеты, программа лояльности, лид-формы. Рассылать SMS без согласия нельзя по закону.'],
      ['Есть ли расширенный функционал?', 'Да, в версии PRO: шаблонирование, несколько имён отправителя, адресная книга, входящие сообщения и ролевая модель.'],
    ],
  },
  calling: {
    t: 'Таргетированный обзвон', e: '📞',
    g: 'linear-gradient(115deg, #12836f 0%, #2aa78c 40%, #9ad9c9 80%, #e4f4ef 100%)',
    d: 'Совершайте холодные звонки по целевой аудитории',
    ctas: [['Создать базу для обзвона', ['call']]],
    task: ['Сформируйте сегмент целевой аудитории и получите обезличенную базу контактов. Она состоит из уникальных идентификаторов, по которым ваш администратор или отдел продаж сможет звонить.'],
    feats: [
      ['Идентификатор действует 30 дней', 'Если абонент не взял трубку — сможете перезвонить позже'],
      ['Процент дозвона — до 80%', 'Исключаем абонентов, у которых с большой вероятностью стоят блокировщики незнакомых номеров'],
      ['Разные сценарии работы', 'Совершайте звонки из своей CRM или прямо из кабинета'],
    ],
    prices: [['Стоимость контакта', 'от 12 ₽']],
    faq: [
      ['Кто может пользоваться обзвоном?', 'Юрлица и ИП. Перед первым запуском нужно создать профиль с реквизитами организации и пополнить счёт.'],
      ['Можно ли звонить повторно по одному идентификатору?', 'Да. Повторные успешные звонки не оплачиваются — засчитывается только первый.'],
      ['Как собрать сегмент для прозвона?', 'Таргеты в кабинете: пол, возраст, гео, доход. Плюс готовые и кастомные сегменты по интересам.'],
      ['Можно ли фиксировать статусы звонков?', 'Да: поле для комментариев и статус «Перезвонить» для каждого контакта.'],
    ],
  },
  telegram: {
    t: 'Реклама в Telegram Ads', e: '✈️',
    g: 'linear-gradient(115deg, #4B3CC4 0%, #7B6CE8 45%, #B48AE8 80%, #efe9fa 100%)',
    d: 'Инструмент для привлечения клиентов и работы с собственной базой',
    ctas: [['Создать кампанию', ['tg']]],
    task: ['Запускайте рекламу в Telegram Ads по существующим таргетингам, сегментам на базе Big Data МТС или своим аудиториям. Расширяйте знание о салоне за счёт широких охватов или точечно работайте с целевой аудиторией.'],
    feats: [
      ['Premium-формат', 'Объявления с изображением или видео — выше эффективность рекламы'],
      ['Низкий порог входа', 'Настраивайте любое количество показов'],
      ['Оплата по модели CPM', 'Минимальный CPM — 75 ₽ без НДС'],
      ['Модерация за 4–6 часов', 'Собственные специалисты проверяют кампании за несколько часов'],
      ['Интеграция с ОРД', 'Автоматическая маркировка рекламы и передача данных в ЕРИР'],
      ['Расширенная аналитика', 'Показы, клики, стоимость за клик и действие, цена нового подписчика'],
    ],
    prices: [
      ['CPM при бюджете менее 5 000 ₽', '400 ₽'],
      ['CPM при бюджете от 5 000 ₽', 'от 75 ₽ до 99 999 ₽'],
      ['Показы по своей аудитории', '0,49 ₽'],
      ['SMS на номера МТС', 'от 7,54 ₽'],
    ],
    pnote: 'Бюджет рекламы всегда включает НДС, CPM указан без НДС',
    faq: [
      ['Какое целевое действие можно добавить в кнопку?', 'Ведите аудиторию в Telegram-канал или на конкретный пост, в бота или на внешний ресурс; можно продвигать приложения.'],
      ['Как отслеживать эффективность кампаний?', 'В кабинете доступны метрики: показы, клики, CPC, CTR, количество новых подписчиков и стоимость подписчика (CPF).'],
      ['Можно ли управлять частотой показа?', 'Да — установите, сколько раз пользователю будет показана ваша реклама.'],
      ['Нужно ли самостоятельно маркировать рекламу?', 'Нет: креатив автоматически получает токен, данные передаются в ЕРИР.'],
      ['Есть ли порог входа для Premium-формата?', 'Нет — такую рекламу можно запустить с любым бюджетом, меняется только минимальный CPM.'],
    ],
  },
  chatbot: {
    t: 'Конструктор чат-ботов Telegram', e: '🤖',
    g: 'linear-gradient(115deg, #2f7d3f 0%, #4aa45c 40%, #a9dcb4 80%, #e9f5ec 100%)',
    d: 'Создавайте чат-боты без навыков программирования: сценарии, триггеры, сегментация аудитории и воронки продаж',
    ctas: [['Создать сценарий', ['bot']], ['Посмотреть шаблоны', null]],
    task: ['Чат-бот автоматизирует рутину и разгружает администратора: отвечает клиентам, записывает и напоминает о визитах, повышает конверсию персональными сценариями.'],
    feats: [
      ['Разные форматы контента', 'Изображения, аудио, видео и вложения внутри сценариев'],
      ['Функционал любой сложности', 'Разветвлённые сценарии с условиями, отложенными сообщениями и персонализацией'],
      ['Удобное тестирование', 'Добавляйте и обновляйте сценарии в любой момент — без перезапуска бота'],
    ],
    tbl: [
      ['Сообщений', 'Стоимость', 'Период действия'],
      ['1 000', 'Бесплатно', '14 дней с даты подключения'],
      ['50 000', '1 000 ₽', 'Месяц с даты подключения'],
      ['100 000', '1 800 ₽', 'Месяц с даты подключения'],
      ['250 000', '3 750 ₽', 'Месяц с даты подключения'],
      ['500 000', '5 500 ₽', 'Месяц с даты подключения'],
    ],
    prices: [['Доппакет 10 000 сообщений', '250 ₽'], ['Доппакет 30 000 сообщений', '650 ₽'], ['Доппакет 50 000 сообщений', '1 000 ₽']],
    faq: [
      ['Сколько чат-ботов можно создать?', 'Сколько угодно — вы платите только за количество отправленных сообщений.'],
      ['Что такое сценарий чат-бота?', 'Настраиваемая последовательность сообщений: клиент получает разные ответы в зависимости от своих действий в боте.'],
      ['В каких мессенджерах работает?', 'Сейчас — Telegram. Другие мессенджеры добавим позже.'],
      ['Как создать бота в Telegram?', 'Получите токен у @BotFather, соберите сценарий в конструкторе и укажите токен в кабинете.'],
    ],
  },
}

/* ── выпадающие меню топбара ── */
const MENUS = {
  mail: [
    ['scale', 'Таргетированные рассылки', 'SMS, MMS, RCS, email и push по аудитории Big Data МТС'],
    ['a2ppro', 'Рассылки по своей базе PRO', 'Персонализированные SMS по вашему списку, API'],
    ['a2p', 'Рассылки по своей базе', 'SMS по вашей базе — только номера МТС'],
    ['calling', 'Обзвон', 'Звонки из кабинета по аудитории Big Data МТС'],
  ],
  net: [
    ['telegram', 'Реклама в Telegram', 'Объявления в каналах, чат-ботах и поиске. Premium-формат'],
    ['chatbot', 'Конструктор чат-ботов', 'Чат-боты в Telegram без навыков программирования'],
  ],
  set: [
    ['profile', 'Профиль', 'Данные профиля и подтверждение'],
    ['users', 'Доступы', 'Сотрудники и их роли в кабинете'],
    ['balance', 'Баланс', 'Пополнение, история операций и баллы'],
    ['namings', 'Имена отправителя', 'От кого клиенты получают SMS'],
    ['psegments', 'Сегменты', 'Аудитории для рассылок и рекламы'],
  ],
}

const OWNER = {
  scale: 'mail', a2ppro: 'mail', a2p: 'mail', calling: 'mail',
  telegram: 'net', chatbot: 'net', stats: 'stats',
  profile: 'set', users: 'set', balance: 'set', namings: 'set', psegments: 'set', help: 'help',
}

export function PromoCabinet({ ctx }) {
  const [view, setView] = useState('main')
  const [menu, setMenu] = useState(null)
  const [form, setForm] = useState(null)
  const nav = (v) => { setView(v); setMenu(null); window.scrollTo({ top: 0 }) }
  const launch = (chans, tab) => { setForm({ chans: chans || ['sms'], tab: tab || 'channels' }); setMenu(null) }
  const owner = OWNER[view]

  return (
    <div className="pm-cab">
      {/* топбар кабинета */}
      <div className="pm-bar">
        <button className={`pm-item${view === 'main' ? ' on' : ''}`} onClick={() => nav('main')}>Кабинет</button>
        <button className={`pm-item${owner === 'mail' || menu === 'mail' ? ' on' : ''}`} onClick={() => setMenu(menu === 'mail' ? null : 'mail')}>Рассылки и звонки</button>
        <button className={`pm-item${owner === 'net' || menu === 'net' ? ' on' : ''}`} onClick={() => setMenu(menu === 'net' ? null : 'net')}>Реклама в интернете</button>
        <button className={`pm-item${view === 'stats' ? ' on' : ''}`} onClick={() => nav('stats')}>Статистика</button>
        <button className={`pm-item${owner === 'set' || menu === 'set' ? ' on' : ''}`} onClick={() => setMenu(menu === 'set' ? null : 'set')}>Настройки</button>
        <button className={`pm-item${view === 'help' ? ' on' : ''}`} onClick={() => nav('help')}>Помощь</button>
        <span className="pm-sep" />
        <button className="pm-create" onClick={() => launch()}>+ Создать</button>
        <button className="pm-ai-mini" title="Создать с ИИ" onClick={() => { launch(['sms', 'tg']); ctx.ping('ИИ соберёт кампанию по вашему описанию') }}>{icons.spark}</button>
        <button className="pm-balance" onClick={() => nav('balance')}>
          <span className="s-label">Баланс</span> 24 600 ₽
        </button>
        {menu && (
          <>
            <span className="pm-backdrop" onClick={() => setMenu(null)} />
            <div className="pm-dd">
              {MENUS[menu].map(([id, t, d]) => (
                <button key={id} className="pm-dd-i" onClick={() => nav(id)}>
                  <b>{t}</b><span>{d}</span>
                </button>
              ))}
              {menu !== 'set' && (
                <button className="pm-dd-i" onClick={() => nav('stats')}><b style={{ color: 'var(--gray)' }}>Статистика →</b></button>
              )}
            </div>
          </>
        )}
      </div>

      {view === 'main' && <MainView ctx={ctx} nav={nav} launch={launch} />}
      {PRODUCTS[view] && <ProductPage p={PRODUCTS[view]} ctx={ctx} launch={launch} onBack={() => nav('main')} />}
      {view === 'stats' && <StatsView ctx={ctx} launch={launch} />}
      {view === 'profile' && <ProfileView ctx={ctx} />}
      {view === 'users' && <UsersView ctx={ctx} />}
      {view === 'balance' && <BalanceView ctx={ctx} />}
      {view === 'namings' && <NamingsView ctx={ctx} />}
      {view === 'psegments' && <SegmentsView ctx={ctx} launch={launch} />}
      {view === 'help' && <HelpView ctx={ctx} />}

      {form && <CampaignLauncher ctx={ctx} onClose={() => setForm(null)} initChans={form.chans} initTab={form.tab} />}
    </div>
  )
}

/* ── главная кабинета ── */
function MainView({ ctx, nav, launch }) {
  const [toolTab, setToolTab] = useState('channels')
  const [aiText, setAiText] = useState('')
  const aiGo = () => { launch(['sms', 'tg']); if (aiText.trim()) ctx.ping('ИИ собрал черновик кампании по вашему описанию') }
  const TOOLS = [
    ['scale', 'Таргетированные рассылки', 'от 5,1 ₽ / сообщение', 'Рекламные SMS, MMS и RCS абонентам МТС', 'comms'],
    ['a2ppro', 'Рассылки по своей базе PRO', 'оплата по тарифу на месяц', 'SMS вашему списку контактов, интеграции по API и другое', 'clients'],
    ['telegram', 'Реклама в Telegram', 'от 91,5 ₽ / 1 000 показов', 'Объявления в каналах, чат-ботах и поиске. Premium-формат с медиа', 'send'],
    ['a2p', 'Другие рассылки', 'только номера МТС', 'Простые SMS-рассылки по вашей базе контактов', 'bell'],
    ['chatbot', 'Конструктор чат-ботов', 'без кода', 'Создание чат-ботов в Telegram без навыков программирования', 'crm'],
    ['calling', 'Таргетированный обзвон', 'от 12 ₽ / контакт', 'Звонки из кабинета по аудитории Big Data МТС', 'phone'],
  ]
  return (
    <div>
      <div className="pc-ai" style={{ marginTop: 16 }}>
        {icons.spark}
        <input value={aiText} onChange={(e) => setAiText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && aiGo()}
          placeholder="Например: маникюр в будни со скидкой 15%" />
        <button className="pc-ai-btn" onClick={aiGo}>Создать с ИИ</button>
      </div>

      <div className="pc-grid">
        <div className="col">
          <section className="card">
            <h2 className="block-title" style={{ fontSize: 17 }}>Инструменты</h2>
            <div className="seg-tabs" style={{ marginTop: 12, maxWidth: 420 }}>
              <button className={toolTab === 'channels' ? 'active' : ''} onClick={() => setToolTab('channels')}>По каналам</button>
              <button className={toolTab === 'goals' ? 'active' : ''} onClick={() => setToolTab('goals')}>По целям</button>
            </div>
            <div className="pc-tools">
              {toolTab === 'channels'
                ? TOOLS.map(([id, t, price, hint, ic]) => (
                  <button key={id} className="pc-tool" onClick={() => nav(id)}>
                    <b>{t}</b>
                    <span className="pc-price">{price}</span>
                    <i>{hint}</i>
                    <span className="pc-tool-ico">{icons[ic]}</span>
                    <span className="pc-arrow">→</span>
                  </button>
                ))
                : GOAL_CARDS.map(([g, hint]) => (
                  <button key={g} className="pc-tool" onClick={() => launch(['sms'], 'goals')}>
                    <b>{g}</b><i>{hint}</i><span className="pc-arrow">→</span>
                  </button>
                ))}
            </div>
          </section>

          <section className="card">
            <div className="list-head">
              <h2 className="block-title" style={{ fontSize: 17 }}>Успешные кейсы</h2>
              <span className="chip green">медиа</span>
            </div>
            <div className="pc-cases">
              {PROMO_CASES.map(([title, date]) => (
                <div key={title} className="pc-case">
                  <b onClick={() => ctx.ping('Кейс откроется в новом окне (демо)')}>{title}</b>
                  <span>{date}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="col">
          <section className="pc-banner">
            <span className="tag">🎙 Лёгкий старт</span>
            <h3>Обзор возможностей кабинета</h3>
            <p>Рассказываем, как запускать рекламу и рассылки прямо из МТС Бизнеса</p>
            <button className="pc-banner-btn" onClick={() => ctx.ping('Видео-обзор откроется в новом окне (демо)')} aria-label="Смотреть обзор">→</button>
          </section>

          <section className="card">
            <div className="list-head">
              <h3 className="block-title" style={{ fontSize: 16 }}>Профиль подтверждён</h3>
              <span className="chip green">ИП</span>
            </div>
            <p className="block-sub">Салон красоты «Viron» · ИП Сиванев В.А. — можно запускать рекламу</p>
            <p className="block-sub" style={{ marginTop: 10, fontWeight: 700, color: 'var(--text)' }}>Доступны 8 сервисов и инструментов:</p>
            <ul className="promo-list" style={{ maxWidth: 'none', marginTop: 10 }}>
              {PROMO_TOOLS_OK.map((t) => <li key={t}><span className="check">✓</span>{t}</li>)}
            </ul>
          </section>

          <section className="card">
            <h3 className="block-title" style={{ fontSize: 16 }}>Помощь</h3>
            {PROMO_HELP.map((h) => (
              <button key={h} className="pc-help-row" onClick={() => ctx.ping(`«${h}» — справка откроется в новом окне (демо)`)}>{h}</button>
            ))}
            <div className="modal-actions" style={{ marginTop: 14 }}>
              <button className="btn-gray" style={{ width: 'auto' }} onClick={() => ctx.ping('Справочный центр — в разработке (демо)')}>Справка</button>
              <button className="btn-gray" style={{ width: 'auto' }} onClick={() => ctx.ping('Напишите в чат в сайдбаре — поможем с запуском')}>Поддержка</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

/* ── страница продукта ── */
function ProductPage({ p, ctx, launch, onBack }) {
  const [open, setOpen] = useState(null)
  return (
    <div>
      <a className="back-link" style={{ marginTop: 14, display: 'inline-block' }} onClick={onBack}>← Кабинет</a>
      <div className="pm-hero" style={{ background: p.g }}>
        <div>
          <h1>{p.t}</h1>
          <p>{p.d}</p>
          <div className="pm-hero-btns">
            {p.ctas.map(([l, ch]) => (
              <button key={l} className={ch ? 'btn-red' : 'btn-gray'} style={{ marginTop: 0, width: 'auto' }}
                onClick={() => (ch ? launch(ch) : ctx.ping('Шаблоны сценариев — в разработке (демо)'))}>{l}</button>
            ))}
          </div>
        </div>
        <span className="pm-hero-emoji" aria-hidden="true">{p.e}</span>
      </div>
      <div className="card pm-block">
        <h3>Какую задачу решает</h3>
        {p.task.map((t) => <p key={t.slice(0, 18)} className="svc-para">{t}</p>)}
      </div>
      <div className="card pm-block">
        <h3>Ключевые возможности</h3>
        <div className="pm-feats">
          {p.feats.map(([t, x]) => (
            <div key={t} className="pm-feat"><span className="pm-feat-t">{t}</span><p>{x}</p></div>
          ))}
        </div>
      </div>
      <div className="card pm-block">
        <h3>Стоимость</h3>
        {p.tbl && (
          <div className="tbl-wrap" style={{ marginTop: 12 }}>
            <table className="tbl">
              <thead><tr>{p.tbl[0].map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>{p.tbl.slice(1).map((r, i) => <tr key={i} style={{ cursor: 'default' }}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        )}
        {p.prices && p.prices.map(([l, v]) => (
          <div key={l} className="pm-price"><span>{l}</span><b>{v}</b></div>
        ))}
        <p className="pm-note">{p.pnote || 'Цены указаны с учётом НДС'}</p>
      </div>
      <div className="card pm-block">
        <h3>Вопросы и ответы</h3>
        <div className="pm-acc">
          {p.faq.map(([q, a], i) => (
            <div key={q} className={`pm-acc-i${open === i ? ' on' : ''}`}>
              <button onClick={() => setOpen(open === i ? null : i)}>{q}<span>⌄</span></button>
              {open === i && <p>{a}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── статистика ── */
function StatsView({ ctx, launch }) {
  const [src, setSrc] = useState('Все инструменты')
  const [q, setQ] = useState('')
  const ROWS = [
    ['«Красота рядом» · гео-баннеры', 'Таргетированные рассылки', '112 400', '5 830', '5,2%', '96', '15 200 ₽', ['Активна', 'green']],
    ['«Окрашивание AirTouch» · поиск', 'Реклама в Telegram', '48 700', '2 610', '5,4%', '52', '7 100 ₽', ['Активна', 'green']],
    ['«Маникюр у дома» · соцсети', 'Рассылки по своей базе PRO', '23 200', '775', '3,3%', '20', '2 300 ₽', ['Пауза', 'orange']],
  ]
  const rows = ROWS.filter((r) => (src === 'Все инструменты' || r[1] === src) && r[0].toLowerCase().includes(q.toLowerCase()))
  return (
    <div>
      <div className="pc-head" style={{ marginTop: 16 }}>
        <h1 className="pc-title" style={{ fontSize: 22 }}>Статистика</h1>
        <button className="btn-gray" style={{ width: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}
          onClick={() => ctx.ping('Отчёт выгружен в XLSX (демо)')}>{icons.download} Скачать отчёт</button>
      </div>
      <div className="card" style={{ marginTop: 14, padding: 14 }}>
        <div className="pm-filters">
          <select className="select" value={src} onChange={(e) => setSrc(e.target.value)}>
            <option>Все инструменты</option>
            <option>Таргетированные рассылки</option>
            <option>Рассылки по своей базе PRO</option>
            <option>Реклама в Telegram</option>
          </select>
          <div className="input-search" style={{ flex: 1 }}>
            {icons.search}
            <input placeholder="Название кампании или текст SMS" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <span className="filter-chip" style={{ cursor: 'default' }}>📅 Период: 01.08 – 21.08.2026</span>
        </div>
      </div>
      <div className="stat-row" style={{ marginTop: 14 }}>
        {[['Показы', '184 300', '+42% к июню'], ['Клики', '9 215', 'CTR 5,0%'], ['Записи', '168', 'конверсия 1,8%'], ['Расход', '24 600 ₽', 'цена записи 146 ₽']].map(([l, v, s]) => (
          <div key={l} className="stat"><div className="s-label">{l}</div><div className="s-val">{v}</div><div className="s-sub" style={{ color: 'var(--gray)' }}>{s}</div></div>
        ))}
      </div>
      <div className="tbl-wrap" style={{ marginTop: 14 }}>
        <table className="tbl">
          <thead><tr><th>Кампания</th><th>Инструмент</th><th>Показы</th><th>Клики</th><th>CTR</th><th>Записи</th><th>Расход</th><th>Статус</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} onClick={() => ctx.ping('Детальная статистика кампании — в разработке')}>
                <td><b>{r[0]}</b></td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td><td>{r[5]}</td><td>{r[6]}</td><td>{chip(r[7])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <div className="pm-empty">
          <b>Таких кампаний нет</b>
          <button className="btn-gray" style={{ width: 'auto' }} onClick={() => { setQ(''); setSrc('Все инструменты') }}>Сбросить фильтры</button>
        </div>
      )}
      <div className="offer-banner" style={{ marginTop: 16 }}>
        <div><b>Запустите новую кампанию</b><p>ИИ соберёт черновик по описанию за минуту</p></div>
        <button className="btn-red" style={{ marginTop: 0 }} onClick={() => launch()}>Создать кампанию</button>
      </div>
    </div>
  )
}

/* ── настройки: профиль ── */
function ProfileView({ ctx }) {
  const [seg, setSeg] = useState('ip')
  return (
    <div className="pm-narrow">
      <h1 className="pc-title" style={{ fontSize: 22, marginTop: 16 }}>Данные профиля</h1>
      <div className="card pm-block">
        <div className="list-head">
          <span className="chip green">Профиль подтверждён</span>
          <span className="block-sub">Лицевой счёт создан</span>
        </div>
        <h2 className="block-title" style={{ marginTop: 10 }}>+7 977 945-88-90</h2>
        <div className="seg-tabs" style={{ marginTop: 16, maxWidth: 420 }}>
          <button className={seg === 'ul' ? 'active' : ''} onClick={() => setSeg('ul')}>Юрлицо</button>
          <button className={seg === 'ip' ? 'active' : ''} onClick={() => setSeg('ip')}>ИП</button>
          <button className={seg === 'fl' ? 'active' : ''} onClick={() => setSeg('fl')}>Физлицо</button>
        </div>
        <div className="two-col" style={{ marginTop: 6 }}>
          <div className="field"><label>ИНН</label><input defaultValue="772456789012" readOnly /></div>
          <div className="field"><label>Наименование</label><input defaultValue="ИП Сиванев Виталий Александрович" readOnly /></div>
        </div>
        <p className="pm-note">Реквизиты заполнены автоматически из профиля МТС Бизнеса — после сохранения их нельзя менять</p>
      </div>
      <div className="card pm-block">
        <h3>Контакты для связи</h3>
        <p className="block-sub">Напишем или позвоним, если будет что-то срочное — например, по договору или оплате</p>
        <div className="two-col" style={{ marginTop: 6 }}>
          <div className="field"><label>Телефон</label><input defaultValue="+7 (977) 945-88-90" /></div>
          <div className="field"><label>Почта</label><input defaultValue="sivanev@viron.beauty" /></div>
        </div>
        <button className="btn-red" style={{ marginTop: 8 }} onClick={() => ctx.ping('Контакты сохранены (демо)')}>Сохранить</button>
      </div>
    </div>
  )
}

/* ── настройки: доступы ── */
function UsersView({ ctx }) {
  return (
    <div className="pm-narrow">
      <div className="pc-head" style={{ marginTop: 16 }}>
        <h1 className="pc-title" style={{ fontSize: 22 }}>Пользователи</h1>
        <button className="btn-red" style={{ marginTop: 0 }} onClick={() => ctx.ping('Приглашение отправлено (демо)')}>+ Пригласить</button>
      </div>
      <div className="card pm-block">
        <div className="profile-grid" style={{ marginTop: 0, borderTop: 'none' }}>
          <div className="profile-row"><span className="k">Виталий Сиванев</span><span className="v">Владелец · полный доступ {chip(['Активен', 'green'])}</span></div>
          <div className="profile-row"><span className="k">Мария Орлова</span><span className="v">Маркетинг · кампании и рассылки {chip(['Активна', 'green'])}</span></div>
          <div className="profile-row"><span className="k">Ольга Николаевна</span><span className="v">Финансы · баланс и закрывающие документы {chip(['Приглашена', 'blue'])}</span></div>
        </div>
        <p className="pm-note">Делегируйте запуск кампаний сотрудникам — каждый видит только свой раздел</p>
      </div>
    </div>
  )
}

/* ── настройки: баланс и баллы ── */
function BalanceView({ ctx }) {
  const [tab, setTab] = useState('bal')
  const [sum, setSum] = useState('5 000 ₽')
  const [pay, setPay] = useState(0)
  const PAYS = [
    ['Со счёта МТС Бизнеса', 'Мгновенное зачисление'],
    ['Банковская карта или СБП', 'МИР, зачисление сразу'],
    ['Банковским переводом по счёту', 'Зачисление в течение 1–3 дней'],
  ]
  return (
    <div className="pm-narrow">
      <div className="seg-tabs" style={{ marginTop: 16, maxWidth: 320 }}>
        <button className={tab === 'bal' ? 'active' : ''} onClick={() => setTab('bal')}>Баланс</button>
        <button className={tab === 'pts' ? 'active' : ''} onClick={() => setTab('pts')}>Баллы</button>
      </div>
      {tab === 'bal' ? (
        <>
          <div className="card pm-block">
            <div className="pm-bal-cards">
              <div className="pm-bal"><div className="l">Доступно</div><div className="v">24 600 ₽</div></div>
              <div className="pm-bal"><div className="l">Зарезервировано под кампании</div><div className="v">3 400 ₽</div></div>
            </div>
          </div>
          <div className="card pm-block">
            <h3>Пополнение баланса</h3>
            <div className="field" style={{ marginTop: 12 }}><label>Сумма</label><input value={sum} onChange={(e) => setSum(e.target.value)} /></div>
            <div className="chips-row" style={{ marginTop: 10 }}>
              {['2 000 ₽', '5 000 ₽', '10 000 ₽', '15 000 ₽', '30 000 ₽'].map((s) => (
                <button key={s} className={`filter-chip${sum === s ? ' active' : ''}`} onClick={() => setSum(s)}>{s}</button>
              ))}
            </div>
            <h3 style={{ marginTop: 18 }}>Способ оплаты</h3>
            {PAYS.map(([t, d], i) => (
              <div key={t} className={`pm-pay${pay === i ? ' on' : ''}`} onClick={() => setPay(i)}>
                <span className="pm-radio" />
                <div><div className="tx-name">{t}</div><div className="tx-desc">{d}</div></div>
              </div>
            ))}
            <button className="btn-red" style={{ marginTop: 16 }} onClick={() => ctx.ping(`Баланс пополнен на ${sum} (демо)`)}>Пополнить</button>
            <p className="pm-note">Закрывающие документы приходят до 15 числа следующего месяца</p>
          </div>
          <div className="card pm-block">
            <h3>История операций</h3>
            <div className="profile-grid" style={{ marginTop: 10 }}>
              <div className="profile-row"><span className="k">Кампания «Красота рядом»</span><span className="v tx-sum minus">−15 200 ₽</span></div>
              <div className="profile-row"><span className="k">Пополнение со счёта МТС Бизнеса</span><span className="v tx-sum plus">+30 000 ₽</span></div>
              <div className="profile-row"><span className="k">Кешбэк баллами за август</span><span className="v tx-sum plus">+4 920 баллов</span></div>
            </div>
          </div>
        </>
      ) : (
        <div className="card pm-block">
          <div className="pm-bal-cards">
            <div className="pm-bal"><div className="l">Баллы кешбэка</div><div className="v">4 920</div></div>
            <div className="pm-bal"><div className="l">Кешбэк за кампании</div><div className="v">20%</div></div>
          </div>
          <p className="svc-para">Получайте баллы за каждую кампанию и тратьте их на новые запуски — можно покрыть до 100% стоимости следующей кампании.</p>
          <button className="btn-red" style={{ marginTop: 12 }} onClick={() => ctx.ping('Баллы будут списаны при следующем запуске (демо)')}>Потратить баллы</button>
        </div>
      )}
    </div>
  )
}

/* ── настройки: имена отправителя ── */
function NamingsView({ ctx }) {
  const [tab, setTab] = useState(0)
  const TABS = ['Таргетированные SMS', 'Таргетированные RCS', 'SMS по своей базе', 'SMS по своей базе PRO']
  return (
    <div className="pm-narrow">
      <div className="pc-head" style={{ marginTop: 16 }}>
        <h1 className="pc-title" style={{ fontSize: 22 }}>Имена отправителя</h1>
        <button className="btn-red" style={{ marginTop: 0 }} onClick={() => ctx.ping('Заявка на имя отправителя отправлена на согласование (демо)')}>+ Создать имя</button>
      </div>
      <div className="chips-row" style={{ marginTop: 12 }}>
        {TABS.map((t, i) => <button key={t} className={`filter-chip${tab === i ? ' active' : ''}`} onClick={() => setTab(i)}>{t}</button>)}
      </div>
      <div className="card pm-block">
        <p className="block-sub">Имя отправителя — название контакта, от которого аудитория получит SMS: например, название салона или домен сайта</p>
        {tab === 0 ? (
          <>
            <div className="pm-name-row"><span>Promo</span>{chip(['Подключено', 'green'])}</div>
            <div className="pm-name-row"><span>VIRON</span>{chip(['На согласовании', 'blue'])}</div>
          </>
        ) : (
          <p className="empty-note">Имён отправителя пока нет — создайте первое.</p>
        )}
      </div>
    </div>
  )
}

/* ── настройки: сегменты ── */
function SegmentsView({ ctx, launch }) {
  return (
    <div>
      <div className="pc-head" style={{ marginTop: 16 }}>
        <h1 className="pc-title" style={{ fontSize: 22 }}>Сегменты</h1>
        <button className="btn-red" style={{ marginTop: 0 }} onClick={() => ctx.go('segments')}>Открыть сегменты CRM</button>
      </div>
      <p className="block-sub" style={{ marginTop: 6 }}>Сегменты вашего салона подключены к кабинету автоматически — запускайте кампании сразу по ним</p>
      <div className="seg-grid" style={{ marginTop: 14 }}>
        {SEGMENTS.map((s) => (
          <div key={s.id} className="card seg-card">
            <div className="seg-top"><b>{s.name}</b><span className="seg-count">{s.count}</span></div>
            <p className="seg-desc">{s.desc}</p>
            <p className="seg-rev" style={{ flex: 1 }}>Выручка: <b>{s.revenue}</b></p>
            <button className="btn-purple" style={{ marginTop: 12, alignSelf: 'flex-start' }} onClick={() => launch(['sms'])}>Запустить кампанию</button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── помощь ── */
function HelpView({ ctx }) {
  return (
    <div className="pc-grid" style={{ marginTop: 16 }}>
      <section className="card">
        <h3 className="block-title" style={{ fontSize: 16 }}>Помощь</h3>
        {PROMO_HELP.map((h) => (
          <button key={h} className="pc-help-row" onClick={() => ctx.ping(`«${h}» — справка откроется в новом окне (демо)`)}>{h}</button>
        ))}
        <div className="modal-actions" style={{ marginTop: 14 }}>
          <button className="btn-gray" style={{ width: 'auto' }} onClick={() => ctx.ping('Справочный центр — в разработке (демо)')}>Справка</button>
          <button className="btn-gray" style={{ width: 'auto' }} onClick={() => ctx.ping('Напишите в чат в сайдбаре — поможем с запуском')}>Поддержка</button>
        </div>
      </section>
      <section className="card">
        <h3 className="block-title" style={{ fontSize: 16 }}>Контакты</h3>
        <div className="profile-grid" style={{ marginTop: 10 }}>
          <div className="profile-row"><span className="k">Телефон поддержки</span><span className="v"><b>8 800 250-11-11</b></span></div>
          <div className="profile-row"><span className="k">Режим работы</span><span className="v">Круглосуточно, без выходных</span></div>
        </div>
        <a className="link-inline" style={{ display: 'block', marginTop: 14, textAlign: 'center' }}
          onClick={() => ctx.ping('Спасибо! Отзыв об интерфейсе отправлен (демо)')}>Что думаете об интерфейсе?</a>
      </section>
    </div>
  )
}
