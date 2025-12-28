function openLightbox(src) {
  const lb = document.querySelector('.lightbox');
  const img = lb.querySelector('img');
  img.src = src;
  lb.style.display = 'flex';
}

// Click any swatch → show hex + copy button
document.querySelectorAll('.swatch').forEach(swatch => {
  swatch.addEventListener('click', e => {
    e.stopPropagation();
    document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));

    const hex = swatch.dataset.hex;
    swatch.innerHTML = `
      <div class="hexcode">${hex}</div>
      <button class="copybtn" title="Copy hex">
        <i class="fa-solid fa-copy"></i>
      </button>
    `;
    swatch.classList.add('active');

    swatch.querySelector('.copybtn').addEventListener('click', ev => {
      ev.stopPropagation();
      navigator.clipboard.writeText(hex);
      swatch.querySelector('i').classList.replace('fa-copy', 'fa-check');
      setTimeout(() => swatch.querySelector('i').classList.replace('fa-check', 'fa-copy'), 1200);
    });
  });
});

document.addEventListener('click', () => {
  document.querySelectorAll('.swatch.active').forEach(s => {
    s.innerHTML = '<div class="info">Click for hex</div>';
    s.classList.remove('active');
  });
});
