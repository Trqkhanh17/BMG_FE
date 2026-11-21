import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const slides = Array.from({ length: 22 }, (_, index) => ({
  number: index + 1,
  src: `/images/${index + 1}.png`,
}));

// These are open-ended prompts already present in the supplied slides.
const prompts = {
  2: 'Tên của Gió là gì?',
  21: 'Vậy nếu Gió lại thổi, bạn có muốn cùng đi với chúng mình không?',
  22: 'Nếu Gió cần bạn, bạn có sẵn lòng…?',
};

const emptyForm = { answers: {} };

function App() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => {
    try { return { ...emptyForm, ...JSON.parse(localStorage.getItem('bmg-survey-draft') || '{}') }; }
    catch { return emptyForm; }
  });
  const [submitted, setSubmitted] = useState(false);
  const current = slides[step];
  const isLast = step === slides.length - 1;

  useEffect(() => {
    localStorage.setItem('bmg-survey-draft', JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'ArrowRight' && step < slides.length - 1) setStep((n) => n + 1);
      if (event.key === 'ArrowLeft' && step > 0) setStep((n) => n - 1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [step]);

  function changeAnswer(number, value) {
    setForm((old) => ({ ...old, answers: { ...old.answers, [number]: value } }));
  }

  function next() {
    if (prompts[current.number] && !form.answers[current.number]?.trim()) {
      document.querySelector('#answer')?.reportValidity();
      return;
    }
    if (!isLast) setStep((n) => n + 1);
    else {
      const saved = { ...form, submittedAt: new Date().toISOString() };
      localStorage.setItem('bmg-survey-response', JSON.stringify(saved));
      localStorage.removeItem('bmg-survey-draft');
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <main className="thank-you">
        <span className="eyebrow">BỐN MÙA GIÓ · MỘT MIỀN KÝ ỨC</span>
        <h1>Cảm ơn bạn<br />đã cùng Gió đi qua.</h1>
        <p>Câu trả lời của bạn đã được ghi nhận trên thiết bị này.</p>
        <button className="text-button" onClick={() => { setForm(emptyForm); setStep(0); setSubmitted(false); }}>Bắt đầu lại <span>↗</span></button>
      </main>
    );
  }

  return (
    <main className="experience">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Bốn Mùa Gió — về đầu trang"><span className="brand-mark" aria-hidden="true">✳</span><span>Bốn Mùa Gió</span></a>
        <div className="story-label">MỘT MIỀN KÝ ỨC <span>—</span> MỘT PHÚT HIỂU LÒNG</div>
        <div className="counter">{String(step + 1).padStart(2, '0')} <span>/ 22</span></div>
      </header>

      <section className="stage" id="top" aria-label={`Trang ${step + 1} trên 22`}>
        <img className="slide-image" src={current.src} alt={`Ảnh kể chuyện BMG, trang ${current.number}`} />
        <div className="image-shade" />
        <div className="slide-caption"><span>CHUYỆN CỦA BỐN MÙA GIÓ</span><b>{String(current.number).padStart(2, '0')}</b></div>
        {prompts[current.number] && (
          <section className="answer-card question-card">
            <div className="card-kicker">GÓC NHỎ CỦA BẠN <span>·</span> TRANG {String(current.number).padStart(2, '0')}</div>
            <p className="prompt-hint">Câu hỏi trên ảnh dành cho bạn</p>
            <label className="sr-only" htmlFor="answer">Câu trả lời của bạn</label>
            <textarea id="answer" required rows="2" placeholder="Viết điều bạn đang nghĩ…" value={form.answers[current.number] || ''} onChange={(e) => changeAnswer(current.number, e.target.value)} />
          </section>
        )}
      </section>

      <footer className="controls">
        <div className="progress-wrap"><div className="progress-track"><span style={{ width: `${((step + 1) / slides.length) * 100}%` }} /></div><small>{Math.round(((step + 1) / slides.length) * 100)}% ĐÃ ĐI QUA</small></div>
        <div className="navigation">
          <button className="prev-button" onClick={() => setStep((n) => Math.max(0, n - 1))} disabled={step === 0}><span>←</span> TRỞ LẠI</button>
          <button className="next-button" onClick={next}>{isLast ? 'GỬI CÂU TRẢ LỜI' : 'TIẾP TỤC'} <span>↗</span></button>
        </div>
        <div className="keyboard-hint">DÙNG PHÍM <kbd>←</kbd> <kbd>→</kbd></div>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
