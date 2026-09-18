'use client'

import { useEffect, useState } from 'react'

/* ── вход в приложение: заставка → логин/пароль → восстановление по SMS ──
   Демо-доступ: логин business, пароль 999999, SMS-код 999999 */
const DEMO_LOGIN = 'business'
const DEMO_PASS = '999999'
const DEMO_CODE = '999999'

export function Login({ onSuccess }) {
  const [phase, setPhase] = useState('splash')
  const [view, setView] = useState('login')
  const [loginVal, setLoginVal] = useState('')
  const [passVal, setPassVal] = useState('')
  const [remember, setRemember] = useState(false)
  const [err, setErr] = useState(null)
  const [shake, setShake] = useState(false)
  const [phone, setPhone] = useState('+7 ')
  const [code, setCode] = useState('')
  const [timer, setTimer] = useState(0)

  /* заставка держится 2 секунды, затем форма */
  useEffect(() => {
    const t = setTimeout(() => setPhase('form'), 2000)
    return () => clearTimeout(t)
  }, [])

  /* обратный отсчёт повторной отправки кода */
  useEffect(() => {
    if (timer <= 0) return
    const t = setTimeout(() => setTimer((v) => v - 1), 1000)
    return () => clearTimeout(t)
  }, [timer])

  const fail = (msg) => {
    setErr(msg)
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const submit = () => {
    if (loginVal.trim().toLowerCase() === DEMO_LOGIN && passVal === DEMO_PASS) {
      setErr(null)
      onSuccess(remember)
    } else {
      fail('Неверный логин или пароль. Проверьте данные и попробуйте ещё раз.')
    }
  }

  const sendCode = () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 11) {
      fail('Введите номер полностью — 11 цифр, начиная с +7')
      return
    }
    setErr(null)
    setCode('')
    setTimer(30)
    setView('code')
  }

  const checkCode = (v = code) => {
    if (v === DEMO_CODE) {
      setErr(null)
      setView('done')
      setTimeout(() => onSuccess(remember), 1400)
    } else {
      fail('Код не подошёл. Проверьте SMS и введите 6 цифр ещё раз.')
    }
  }

  const onCodeChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(v)
    if (v.length === 6) checkCode(v)
  }

  const goto = (v) => { setView(v); setErr(null) }

  return (
    <div className="login-screen">
      <span className="splash-glow g1" aria-hidden="true" />
      <span className="splash-glow g2" aria-hidden="true" />

      {phase === 'splash' ? (
        <div className="splash">
          <div className="splash-logo"><span className="mts">МТС</span><span className="biz">БИЗНЕС</span></div>
          <div className="splash-sub">Личный кабинет для вашего бизнеса</div>
        </div>
      ) : (
        <div className={`login-card${shake ? ' shake' : ''}`}>
          <div className="login-logo"><span className="mts">МТС</span><span className="biz">БИЗНЕС</span></div>

          {view === 'login' && (
            <>
              <h1>Вход в личный кабинет</h1>
              <p className="login-sub">Введите логин и пароль от МТС Бизнес</p>
              <div className="field">
                <label>Логин</label>
                <input value={loginVal} onChange={(e) => setLoginVal(e.target.value)} placeholder="business"
                  autoComplete="username" onKeyDown={(e) => e.key === 'Enter' && submit()} />
              </div>
              <div className="field">
                <label>Пароль</label>
                <input type="password" value={passVal} onChange={(e) => setPassVal(e.target.value)} placeholder="••••••"
                  autoComplete="current-password" onKeyDown={(e) => e.key === 'Enter' && submit()} />
              </div>
              <label className="login-check" onClick={(e) => { e.preventDefault(); setRemember((v) => !v) }}>
                <span className={`cbx${remember ? ' on' : ''}`}>✓</span>
                Запомнить пароль
              </label>
              {err && <div className="login-err">{err}</div>}
              <button className="btn-red login-btn" onClick={submit}>Войти</button>
              <a className="login-link" onClick={() => goto('phone')}>Не могу войти</a>
              <div className="login-hint">Демо-доступ: логин <b>business</b> · пароль <b>999999</b></div>
            </>
          )}

          {view === 'phone' && (
            <>
              <a className="back-link" onClick={() => goto('login')}>← Назад ко входу</a>
              <h1>Восстановление входа</h1>
              <p className="login-sub">Укажите номер телефона, привязанный к бизнесу, — отправим SMS с кодом для входа</p>
              <div className="field">
                <label>Номер телефона</label>
                <input inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (900) 000-00-00" onKeyDown={(e) => e.key === 'Enter' && sendCode()} />
              </div>
              {err && <div className="login-err">{err}</div>}
              <button className="btn-red login-btn" onClick={sendCode}>Отправить код</button>
            </>
          )}

          {view === 'code' && (
            <>
              <a className="back-link" onClick={() => goto('phone')}>← Изменить номер</a>
              <h1>Введите код из SMS</h1>
              <p className="login-sub">Отправили 6-значный код на {phone}</p>
              <div className="field">
                <label>Код из SMS</label>
                <input className="code-input" inputMode="numeric" value={code} onChange={onCodeChange}
                  placeholder="••••••" onKeyDown={(e) => e.key === 'Enter' && checkCode()} />
              </div>
              {err && <div className="login-err">{err}</div>}
              <button className="btn-red login-btn" onClick={() => checkCode()}>Подтвердить</button>
              {timer > 0
                ? <div className="login-resend">Отправить код повторно можно через {timer} с</div>
                : <a className="login-link" onClick={() => { setTimer(30); setCode(''); setErr(null) }}>Отправить код ещё раз</a>}
              <div className="login-hint">Демо-код: <b>999999</b></div>
            </>
          )}

          {view === 'done' && (
            <div className="form-success">
              <div className="big">✓</div>
              <h3>Вход подтверждён</h3>
              <p>Код принят — открываем личный кабинет…</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
