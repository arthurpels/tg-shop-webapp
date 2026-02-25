const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// ── Theme ──────────────────────────────────────────────
function applyTheme() {
  const tp = tg.themeParams;
  const bg     = tp.bg_color           || '#ffffff';
  const text   = tp.text_color         || '#000000';
  const hint   = tp.hint_color         || '#999999';
  const button = tp.button_color       || '#3b82f6';
  const btnTxt = tp.button_text_color  || '#ffffff';
  const sec_bg = tp.secondary_bg_color || '#f4f4f5';

  document.body.style.backgroundColor = bg;
  document.body.style.color = text;

  document.documentElement.style.setProperty('--bg', bg);
  document.documentElement.style.setProperty('--text', text);
  document.documentElement.style.setProperty('--hint', hint);
  document.documentElement.style.setProperty('--btn', button);
  document.documentElement.style.setProperty('--btn-text', btnTxt);
  document.documentElement.style.setProperty('--sec-bg', sec_bg);

  const header = document.querySelector('header');
  header.style.backgroundColor = bg + 'cc';
  header.style.borderColor = hint + '33';
}

applyTheme();
tg.onEvent('themeChanged', applyTheme);

// ── Products ───────────────────────────────────────────
const products = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: 49,
    image: 'https://cdn-icons-png.flaticon.com/512/3474/3474360.png',
  },
  {
    id: 2,
    name: 'Smart Watch',
    price: 129,
    image: 'https://cdn-icons-png.flaticon.com/512/2972/2972531.png',
  },
  {
    id: 3,
    name: 'Portable Speaker',
    price: 35,
    image: 'https://cdn-icons-png.flaticon.com/512/4341/4341025.png',
  },
  {
    id: 4,
    name: 'Phone Stand',
    price: 19,
    image: 'https://cdn-icons-png.flaticon.com/512/2933/2933245.png',
  },
];

// ── Cart state ─────────────────────────────────────────
const cart = {};

function getTotal() {
  return Object.values(cart).reduce((s, i) => s + i.price * i.qty, 0);
}

function getTotalItems() {
  return Object.values(cart).reduce((s, i) => s + i.qty, 0);
}

function updateMainButton() {
  const total = getTotal();
  if (total > 0) {
    tg.MainButton.setParams({ text: `Оформить заказ: ${total} $` });
    tg.MainButton.show();
  } else {
    tg.MainButton.hide();
  }
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  const count = document.getElementById('cart-count');
  const total = getTotalItems();

  if (total > 0) {
    badge.style.display = 'flex';
    badge.style.backgroundColor = 'var(--btn)';
    badge.style.color = 'var(--btn-text)';
    count.textContent = total;
    badge.classList.add('pop');
    setTimeout(() => badge.classList.remove('pop'), 250);
  } else {
    badge.style.display = 'none';
  }
}

// ── Render controls for a single product ───────────────
function renderControls(product) {
  const wrapper = document.getElementById(`controls-${product.id}`);
  const qty = cart[product.id]?.qty || 0;

  if (qty === 0) {
    wrapper.innerHTML = `
      <button class="btn-add" onclick="addToCart(${product.id})"
              style="background:var(--btn);color:var(--btn-text)">
        Добавить
      </button>`;
  } else {
    wrapper.innerHTML = `
      <div class="qty-controls" style="background:var(--sec-bg)">
        <button class="qty-btn" onclick="changeQty(${product.id},-1)"
                style="background:transparent;color:var(--btn)">−</button>
        <span class="qty-value" style="color:var(--text)">${qty}</span>
        <button class="qty-btn" onclick="changeQty(${product.id},1)"
                style="background:transparent;color:var(--btn)">+</button>
      </div>`;
  }
}

// ── Cart actions ───────────────────────────────────────
window.addToCart = function (id) {
  const product = products.find((p) => p.id === id);
  cart[id] = { id: product.id, name: product.name, price: product.price, qty: 1 };
  tg.HapticFeedback.impactOccurred('light');
  renderControls(product);
  updateMainButton();
  updateCartBadge();
};

window.changeQty = function (id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  tg.HapticFeedback.impactOccurred('light');
  renderControls(products.find((p) => p.id === id));
  updateMainButton();
  updateCartBadge();
};

// ── Render product grid ────────────────────────────────
function renderProducts() {
  const grid = document.getElementById('product-grid');
  grid.innerHTML = products
    .map(
      (p) => `
    <div class="product-card" style="background:var(--sec-bg)">
      <div style="background:var(--sec-bg);display:flex;align-items:center;justify-content:center;padding:16px">
        <img src="${p.image}" alt="${p.name}" loading="lazy"
             style="width:80%;aspect-ratio:1/1;object-fit:contain">
      </div>
      <div class="product-info">
        <div class="product-name" style="color:var(--text)">${p.name}</div>
        <div class="product-price" style="color:var(--btn)">${p.price} $</div>
        <div id="controls-${p.id}">
          <button class="btn-add" onclick="addToCart(${p.id})"
                  style="background:var(--btn);color:var(--btn-text)">
            Добавить
          </button>
        </div>
      </div>
    </div>`,
    )
    .join('');
}

renderProducts();

// ── MainButton handler ─────────────────────────────────
tg.onEvent('mainButtonClicked', () => {
  const items = Object.values(cart).map((i) => ({
    id: i.id,
    name: i.name,
    price: i.price,
    qty: i.qty,
  }));
  tg.sendData(JSON.stringify(items));
  tg.close();
});
