const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

tg.setHeaderColor('#050505');
tg.setBackgroundColor('#050505');

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
    tg.MainButton.setParams({
      text: `⟁ CHECKOUT: ${total} $ ⟁`,
      color: '#d4163c',
      text_color: '#ffffff',
    });
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
      <button class="btn-add" onclick="addToCart(${product.id})">
        ⟐ ADD ⟐
      </button>`;
  } else {
    wrapper.innerHTML = `
      <div class="qty-controls">
        <button class="qty-btn" onclick="changeQty(${product.id},-1)">−</button>
        <span class="qty-value">${qty}</span>
        <button class="qty-btn" onclick="changeQty(${product.id},1)">+</button>
      </div>`;
  }
}

// ── Cart actions ───────────────────────────────────────
window.addToCart = function (id) {
  const product = products.find((p) => p.id === id);
  cart[id] = { id: product.id, name: product.name, price: product.price, qty: 1 };
  try { tg.HapticFeedback.impactOccurred('heavy'); } catch (_) {}
  renderControls(product);
  updateMainButton();
  updateCartBadge();
};

window.changeQty = function (id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  try { tg.HapticFeedback.impactOccurred('light'); } catch (_) {}
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
    <div class="product-card">
      <div class="card-image-wrap">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-price">${p.price} $</div>
        <div id="controls-${p.id}">
          <button class="btn-add" onclick="addToCart(${p.id})">
            ⟐ ADD ⟐
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
