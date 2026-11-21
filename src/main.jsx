import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

// Use the original numbered photos; the narrative text is laid out over them below.
const slideExtensions = {
  1: 'png', 2: 'jpg', 3: 'jpg', 4: 'jpg', 5: 'jpg', 6: 'jpg', 7: 'jpg',
  8: 'jpg', 9: 'jpg', 10: 'jpg', 11: 'JPG', 12: 'jpg', 13: 'jpg',
  14: 'png', 15: 'jpg', 16: 'jpg', 17: 'jpg', 18: 'jpg', 19: 'jpg',
  20: 'JPG', 21: 'jpg',
};
const slides = Object.entries(slideExtensions).map(([number, extension]) => ({
  number: Number(number),
  src: `/images/${number}.${extension}`,
}));

const slideCopy = {
  1: 'Một miền ký ức\nMột khoảng lặng\nMột phút hiểu lòng',
  2: 'Tên của Gió là gì?',
  3: 'Điều gì đã làm cho Gió\nthổi qua từng ấy năm?',
  4: 'Trên mỗi hành trình của Gió,\nvẫn luôn có những điều khiến\nchúng ta muốn đi xa hơn',
  5: 'Có lẽ là những\nnụ cười trong veo',
  6: 'Những ánh mắt\nhồn nhiên',
  7: 'Hay đôi khi chỉ là một câu chuyện ngây ngô\nđược kể bằng tất cả sự chân thành của các bạn nhỏ',
  8: 'Chính những điều giản dị ấy\nđã trở thành lý do để chúng ta tiếp tục',
  9: '“Gió đi vì những nụ cười\nvà Gió đi xa nhờ những người bạn”',
  10: 'Liệu Gió còn thổi...?',
  11: 'Chúng ta đã cùng nhau đi qua những mùa gió...',
  12: 'Gặp gỡ những con người xa lạ\nrồi trở thành thân quen',
  13: 'Cùng tạo nên những câu chuyện\nmà có lẽ sau này khi nhớ lại\nai cũng sẽ mỉm cười',
  14: 'Nhưng liệu những mùa gió ấy\nđã thực sự khép lại?',
  15: 'Liệu sẽ còn những cuộc gặp gỡ,\nnhững chuyến đi và những câu chuyện\nchưa được viết nên?',
  16: 'Hay đâu đó, trong mỗi chúng ta,\nvẫn còn một chút mong chờ về những ngày tháng\nđược cùng nhau đi tiếp?',
  17: 'Nếu Gió lại thổi...',
  18: 'Một mùa gió mới\nsẽ chẳng thể bắt đầu\nnếu thiếu đi những người\ncùng nhau tạo nên nó',
  19: 'Bốn Mùa Gió vẫn còn\nnhững điều muốn làm, những câu chuyện muốn kể\nvà những hành trình đang chờ được viết tiếp.',
  20: 'Nhưng lần này, chúng mình muốn biết bạn sẽ\nđồng hành cùng câu chuyện ấy theo cách nào.',
  21: 'Nếu Gió cần bạn, bạn có sẵn lòng...?',
};

const freeResponseSlides = [2, 3, 16];
const yesNoSlides = [10, 14, 15, 21];
const submitUrl = 'https://script.google.com/macros/s/AKfycby6wyvL4X5CqKHhdziV2W4Ktex_VSdj1hpDbb4cfvU_mtRWQiOjBCC0Bhebxwo-iZkp/exec';

function App() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bmg-story-answers') || '{}'); }
    catch { return {}; }
  });
  const [validationError, setValidationError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const current = slides[step];
  const isLast = step === slides.length - 1;

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'ArrowRight' && step < slides.length - 1) setStep((n) => n + 1);
      if (event.key === 'ArrowLeft' && step > 0) setStep((n) => n - 1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [step]);

  async function next() {
    if ((freeResponseSlides.includes(current.number) || yesNoSlides.includes(current.number)) && !answers[current.number]?.trim()) {
      setValidationError(freeResponseSlides.includes(current.number)
        ? 'Gió đang lắng nghe, bạn chia sẻ một chút nhé.'
        : 'Bạn chọn giúp Gió một câu trả lời nhé.');
      return;
    }
    setValidationError('');
    if (!isLast) setStep((n) => n + 1);
    else {
      const missingSlide = [...freeResponseSlides, ...yesNoSlides].find((slide) => !answers[slide]?.trim());
      if (missingSlide) {
        setStep(slides.findIndex((slide) => slide.number === missingSlide));
        setValidationError(freeResponseSlides.includes(missingSlide)
          ? 'Gió đang lắng nghe, bạn chia sẻ một chút nhé.'
          : 'Bạn chọn giúp Gió một câu trả lời nhé.');
        return;
      }

      setSubmitting(true);
      try {
        await fetch(submitUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'submit', answers }),
        });
        localStorage.removeItem('bmg-story-answers');
        setSubmitted(true);
      } catch {
        setValidationError('Gió chưa gửi được câu trả lời. Bạn kiểm tra kết nối rồi thử lại nhé.');
      } finally {
        setSubmitting(false);
      }
    }
  }

  function changeAnswer(value) {
    const nextAnswers = { ...answers, [current.number]: value };
    setAnswers(nextAnswers);
    localStorage.setItem('bmg-story-answers', JSON.stringify(nextAnswers));
    setValidationError('');
  }

  function restart() {
    localStorage.removeItem('bmg-story-answers');
    setAnswers({});
    setStep(0);
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <main className="thank-you">
        <span className="eyebrow">BỐN MÙA GIÓ · MỘT MIỀN KÝ ỨC</span>
        <h1>Cảm ơn bạn<br />đã cùng Gió đi qua.</h1>
        <p>Câu trả lời của bạn đã được gửi đến Gió.</p>
        <button className="text-button" onClick={restart}>Bắt đầu lại <span>↗</span></button>
      </main>
    );
  }

  return (
    <main className="experience">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Bốn Mùa Gió — về đầu trang"><span className="brand-mark" aria-hidden="true">✳</span><span>Bốn Mùa Gió</span></a>
        <div className="story-label">MỘT MIỀN KÝ ỨC <span>—</span> MỘT PHÚT HIỂU LÒNG</div>
        <div className="counter">{String(step + 1).padStart(2, '0')} <span>/ {slides.length}</span></div>
      </header>

      <section className="stage" id="top" aria-label={`Trang ${step + 1} trên ${slides.length}`}>
        <img key={`image-${current.number}`} className={`slide-image slide-image-${current.number} image-morph`} src={current.src} alt={`Ảnh kể chuyện BMG, trang ${current.number}`} />
        <div className="image-shade" />
        <section key={`copy-${current.number}`} className={`story-overlay story-slide-${current.number} copy-morph`} aria-label={`Nội dung trang ${current.number}`}>
          <p className="story-copy">
            {current.number === 1
              ? slideCopy[1].split('\n').map((line, index) => <span key={line} className={`intro-line intro-line-${index + 1}`}>{line}</span>)
              : slideCopy[current.number]}
          </p>
        </section>
        {(freeResponseSlides.includes(current.number) || yesNoSlides.includes(current.number)) && (
          <section className={`response-overlay response-slide-${current.number}`}>
          {freeResponseSlides.includes(current.number) && (
            <label className="response-field">
              <span>Câu trả lời của bạn</span>
              <textarea id={`answer-${current.number}`} maxLength={5000} rows="2" placeholder="Chia sẻ với Gió nhé…" value={answers[current.number] || ''} onChange={(event) => changeAnswer(event.target.value)} />
            </label>
          )}
          {yesNoSlides.includes(current.number) && (
            <fieldset className="yes-no-field" required>
              <legend>Bạn chọn giúp Gió nhé</legend>
              {['Có', 'Không'].map((choice) => (
                <label className={`choice-option ${answers[current.number] === choice ? 'selected' : ''}`} key={choice}>
                  <input type="radio" name={`answer-${current.number}`} value={choice} checked={answers[current.number] === choice} onChange={() => changeAnswer(choice)} />
                  <span>{choice}</span>
                </label>
              ))}
            </fieldset>
          )}
          {validationError && <p className="validation-hint" role="status">{validationError}</p>}
          </section>
        )}
      </section>

      <footer className="controls">
        <div className="progress-wrap"><div className="progress-track"><span style={{ width: `${((step + 1) / slides.length) * 100}%` }} /></div><small>{Math.round(((step + 1) / slides.length) * 100)}% ĐÃ ĐI QUA</small></div>
        <div className="navigation">
          <button className="prev-button" onClick={() => setStep((n) => Math.max(0, n - 1))} disabled={step === 0}><span>←</span> TRỞ LẠI</button>
          <button className="next-button" onClick={next} disabled={submitting}>{submitting ? 'ĐANG GỬI…' : isLast ? 'GỬI CÂU TRẢ LỜI' : 'TIẾP TỤC'} <span>↗</span></button>
        </div>
        <div className="keyboard-hint">DÙNG PHÍM <kbd>←</kbd> <kbd>→</kbd></div>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
