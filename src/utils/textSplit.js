export function splitHeading(el) {
  if (!el) return;
  const originalHtml = el.dataset.originalHtml ?? el.innerHTML;
  if (!el.dataset.originalHtml) {
    el.dataset.originalHtml = originalHtml;
  }

  const html = originalHtml;
  const rawLines = html.split(/<br\s*\/?>(?![^<]*>)/i);
  el.innerHTML = '';

  rawLines.forEach((raw) => {
    const text = raw.replace(/<[^>]+>/g, '').trim();
    if (!text) return;

    const clip = document.createElement('div');
    clip.className = 'line-clip';

    [...text].forEach((ch) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      clip.appendChild(span);
    });

    el.appendChild(clip);
  });
}

export function splitBodyLines(el) {
  if (!el) return [];
  const originalText = el.dataset.originalText ?? el.textContent;
  if (!el.dataset.originalText) {
    el.dataset.originalText = originalText;
  }

  const text = originalText.trim();
  const words = text.split(/\s+/);
  el.innerHTML = '';

  words.forEach((word, index) => {
    const span = document.createElement('span');
    span.textContent = word + (index < words.length - 1 ? ' ' : '');
    span.style.display = 'inline';
    el.appendChild(span);
  });

  const spans = Array.from(el.querySelectorAll('span'));
  const lines = [];
  let lastTop = null;
  let currentLine = [];

  spans.forEach((span) => {
    const top = Math.round(span.getBoundingClientRect().top);
    if (lastTop === null || Math.abs(top - lastTop) > 3) {
      if (currentLine.length) lines.push(currentLine);
      currentLine = [span];
      lastTop = top;
    } else {
      currentLine.push(span);
    }
  });

  if (currentLine.length) lines.push(currentLine);

  el.innerHTML = '';
  lines.forEach((lineSpans) => {
    const clip = document.createElement('div');
    clip.className = 'line-clip';
    const inner = document.createElement('span');
    inner.className = 'line-inner';
    lineSpans.forEach((span) => inner.appendChild(span));
    clip.appendChild(inner);
    el.appendChild(clip);
  });

  return Array.from(el.querySelectorAll('.line-inner'));
}
