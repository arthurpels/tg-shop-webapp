var tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

tg.setHeaderColor('#050505');
tg.setBackgroundColor('#050505');

// ── Products ───────────────────────────────────────────
var products = [
  {
    id: 1,
    name: 'Black Waxed Aviator Bomber',
    price: 310,
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Reworked edition of the bomber jacket in black, crafted from waxed cotton with a split faux fur hood.Our most elevated outerwear piece, crafted with premium materials and refined detailing',
    images: [
      'https://www.racerworldwide.net/cdn/shop/files/Black_Aviator_Bomber_FL_Front_FF_w2_m2.jpg?v=1759741358&width=3840',
      'https://www.racerworldwide.net/cdn/shop/files/Black_Aviator_Bomber_FL_Back_FF.jpg?v=1759428614&width=3840',
      'https://www.racerworldwide.net/cdn/shop/files/Black_Aviator_Bomber_LB_Men_3_FF_m1.jpg?v=1759505081&width=3840',
    ],
  },
  {
    id: 2,
    name: 'Washed Flag Hoodie',
    price: 140,
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Heavyweight washed zip hoodie with all over distressed denim stripes.',
    images: [
      'https://www.racerworldwide.net/cdn/shop/files/hoodiefront_white.jpg?v=1723730837&width=3840',
      'https://www.racerworldwide.net/cdn/shop/files/hoodieback_white.jpg?v=1723730841&width=3840',
      'https://www.racerworldwide.net/cdn/shop/files/17.jpg?v=1723725982&width=1200',
    ],
  },
  {
    id: 3,
    name: 'Waxed Slim Gloss Denim',
    price: 150,
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Fall/Winter 2025 waxed slim denim jeans.',
    images: [
      'https://www.racerworldwide.net/cdn/shop/files/Waxed_Slim_Jeans_FL_3_FF_w2_m1.jpg?v=1771417009&width=1200',
      'https://www.racerworldwide.net/cdn/shop/files/Waxed_Slim_Jeans_LB_6_FF_m2.jpg?v=1771488771&width=1200',
      'https://www.racerworldwide.net/cdn/shop/files/Waxed_Slim_Jeans_LB_5_FF_m3.jpg?v=1771417147&width=1200',
    ],
  },
  {
    id: 4,
    name: 'K Mugshot Long Sleeve',
    price: 80,
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'K x Racer Capsule Mugshot Long Sleeve.',
    images: [
      'https://www.racerworldwide.net/cdn/shop/files/K_Mugshot_Sweatshirt_Front_FF.jpg?v=1744968613&width=1200',
      'https://www.racerworldwide.net/cdn/shop/files/K_Mugshot_Sweatshirt_Back_FF.jpg?v=1737483513&width=1200',
      'https://www.racerworldwide.net/cdn/shop/files/K_Mugshot_Longsleeve_Kris_LB_FF_m1.jpg?v=1757253783&width=1200',
    ],
  },
];

// ── State ──────────────────────────────────────────────
var selectedSizes = {};
var cart = [];
var detailProductId = null;
var detailSelectedSize = null;
var detailCarouselIdx = 0;

// ── localStorage ───────────────────────────────────────
var CART_KEY = 'mankind_cart';

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (_) {}
}

function loadCart() {
  try {
    var data = localStorage.getItem(CART_KEY);
    if (data) {
      var parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        for (var i = 0; i < parsed.length; i++) {
          cart.push(parsed[i]);
        }
      }
    }
  } catch (_) {}
}

// ── Helpers ────────────────────────────────────────────
function cartKey(id, size) {
  return id + '_' + size;
}

function findProduct(id) {
  for (var i = 0; i < products.length; i++) {
    if (products[i].id === id) return products[i];
  }
  return null;
}

function getTotal() {
  var s = 0;
  for (var i = 0; i < cart.length; i++) s += cart[i].price * cart[i].qty;
  return s;
}

function getTotalItems() {
  var s = 0;
  for (var i = 0; i < cart.length; i++) s += cart[i].qty;
  return s;
}

// ── Telegram MainButton ────────────────────────────────
function updateMainButton() {
  var total = getTotal();
  if (total > 0) {
    tg.MainButton.setParams({
      text: '\u27C1 CHECKOUT: ' + total + ' $ \u27C1',
      color: '#d4163c',
      text_color: '#ffffff',
    });
    tg.MainButton.show();
  } else {
    tg.MainButton.hide();
  }
}

tg.onEvent('mainButtonClicked', function () {
  var items = [];
  for (var i = 0; i < cart.length; i++) {
    var c = cart[i];
    items.push({ id: c.id, name: c.name, size: c.size, price: c.price, qty: c.qty });
  }
  tg.sendData(JSON.stringify(items));
  tg.close();
});

// ── Header counter ─────────────────────────────────────
function updateHeaderCount() {
  var el = document.getElementById('header-cart-count');
  var n = getTotalItems();
  el.textContent = n;
  el.className = n > 0 ? 'header-cart-count visible' : 'header-cart-count';
}

// ── Sync all UI after cart change ──────────────────────
function onCartChanged() {
  saveCart();
  updateMainButton();
  updateHeaderCount();
}

// ── Size selection (grid cards) ────────────────────────
window.selectSize = function (productId, size, e) {
  if (e) e.stopPropagation();
  selectedSizes[productId] = size;

  var hint = document.getElementById('hint-' + productId);
  if (hint) hint.className = 'size-hint';

  var btns = document.querySelectorAll('.size-btn[data-product="' + productId + '"]');
  for (var i = 0; i < btns.length; i++) {
    btns[i].className = btns[i].getAttribute('data-size') === size ? 'size-btn active' : 'size-btn';
  }

  try { tg.HapticFeedback.selectionChanged(); } catch (_) {}
};

// ── Add to cart (from grid) ────────────────────────────
window.addToCart = function (id, e) {
  if (e) e.stopPropagation();
  var size = selectedSizes[id];

  if (!size) {
    var hint = document.getElementById('hint-' + id);
    if (hint) hint.className = 'size-hint visible';
    var btn = document.getElementById('addbtn-' + id);
    if (btn) {
      btn.classList.remove('shake');
      void btn.offsetWidth;
      btn.classList.add('shake');
    }
    try { tg.HapticFeedback.notificationOccurred('error'); } catch (_) {}
    return;
  }

  pushToCart(id, size);

  var btn = document.getElementById('addbtn-' + id);
  if (btn) {
    btn.className = 'btn-add added';
    btn.textContent = '\u27D0 ADDED \u27D0';
    setTimeout(function () {
      btn.className = 'btn-add';
      btn.textContent = '\u27D0 ADD \u27D0';
    }, 800);
  }

  try { tg.HapticFeedback.impactOccurred('heavy'); } catch (_) {}
};

function pushToCart(id, size) {
  var key = cartKey(id, size);
  var existing = null;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].key === key) { existing = cart[i]; break; }
  }
  if (existing) {
    existing.qty++;
  } else {
    var p = findProduct(id);
    cart.push({ key: key, id: p.id, name: p.name, size: size, price: p.price, qty: 1 });
  }
  onCartChanged();
}

// ── Remove from cart ───────────────────────────────────
window.removeFromCart = function (key) {
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].key === key) { cart.splice(i, 1); break; }
  }
  try { tg.HapticFeedback.impactOccurred('light'); } catch (_) {}
  onCartChanged();
  renderCartModal();
};

// ── Carousel (grid cards) ──────────────────────────────
var carouselState = {};

window.slideCarousel = function (productId, dir, e) {
  if (e) e.stopPropagation();
  var el = document.querySelector('[data-carousel="' + productId + '"]');
  if (!el) return;

  var track = el.querySelector('.carousel-track');
  var dots = el.querySelectorAll('.carousel-dot');
  var total = dots.length;
  if (total <= 1) return;

  var cur = carouselState[productId] || 0;
  cur += dir;
  if (cur < 0) cur = total - 1;
  if (cur >= total) cur = 0;
  carouselState[productId] = cur;

  track.style.transform = 'translateX(-' + (cur * 100) + '%)';
  for (var d = 0; d < dots.length; d++) {
    dots[d].className = d === cur ? 'carousel-dot active' : 'carousel-dot';
  }
};

// ═══════════════════════════════════════════════════════
//  PRODUCT DETAIL MODAL
// ═══════════════════════════════════════════════════════
window.openProduct = function (id) {
  var p = findProduct(id);
  if (!p) return;

  detailProductId = id;
  detailSelectedSize = null;
  detailCarouselIdx = 0;

  document.getElementById('detail-name').textContent = p.name;
  document.getElementById('detail-price').textContent = p.price + ' $';
  document.getElementById('detail-desc').textContent = p.description;

  var imgArea = document.getElementById('detail-image');
  var slides = '';
  var dots = '';
  for (var k = 0; k < p.images.length; k++) {
    slides += '<div class="detail-carousel-slide">' +
      '<img src="' + p.images[k] + '" alt="' + p.name + '">' +
    '</div>';
    dots += '<span class="detail-carousel-dot' + (k === 0 ? ' active' : '') + '"></span>';
  }
  imgArea.innerHTML =
    '<button class="detail-arrow left" onclick="slideDetail(-1)">\u2039</button>' +
    '<div class="detail-carousel-track">' + slides + '</div>' +
    '<button class="detail-arrow right" onclick="slideDetail(1)">\u203A</button>' +
    '<div class="detail-carousel-dots">' + dots + '</div>';

  var sizesEl = document.getElementById('detail-sizes');
  var sizesHtml = '';
  for (var j = 0; j < p.sizes.length; j++) {
    sizesHtml += '<button class="detail-size-btn" data-dsize="' + p.sizes[j] +
      '" onclick="selectDetailSize(\'' + p.sizes[j] + '\')">' + p.sizes[j] + '</button>';
  }
  sizesEl.innerHTML = sizesHtml;

  var hint = document.getElementById('detail-hint');
  hint.className = 'size-hint';

  var addBtn = document.getElementById('detail-add-btn');
  addBtn.className = 'detail-add-btn visible';
  addBtn.textContent = '\u27D0 ADD TO CART \u27D0';
  addBtn.onclick = function () { addFromDetail(); };

  document.getElementById('detail-overlay').className = 'detail-overlay open';
  try { tg.HapticFeedback.impactOccurred('light'); } catch (_) {}
};

window.closeProduct = function () {
  document.getElementById('detail-overlay').className = 'detail-overlay';
  detailProductId = null;
};

window.slideDetail = function (dir) {
  var p = findProduct(detailProductId);
  if (!p) return;
  var total = p.images.length;
  if (total <= 1) return;

  detailCarouselIdx += dir;
  if (detailCarouselIdx < 0) detailCarouselIdx = total - 1;
  if (detailCarouselIdx >= total) detailCarouselIdx = 0;

  var track = document.querySelector('.detail-carousel-track');
  if (track) track.style.transform = 'translateX(-' + (detailCarouselIdx * 100) + '%)';

  var dots = document.querySelectorAll('.detail-carousel-dot');
  for (var d = 0; d < dots.length; d++) {
    dots[d].className = d === detailCarouselIdx ? 'detail-carousel-dot active' : 'detail-carousel-dot';
  }
};

window.selectDetailSize = function (size) {
  detailSelectedSize = size;

  var hint = document.getElementById('detail-hint');
  if (hint) hint.className = 'size-hint';

  var btns = document.querySelectorAll('.detail-size-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].className = btns[i].getAttribute('data-dsize') === size ? 'detail-size-btn active' : 'detail-size-btn';
  }
  try { tg.HapticFeedback.selectionChanged(); } catch (_) {}
};

function addFromDetail() {
  if (!detailProductId) return;

  if (!detailSelectedSize) {
    var hint = document.getElementById('detail-hint');
    if (hint) hint.className = 'size-hint visible';
    var btn = document.getElementById('detail-add-btn');
    if (btn) {
      btn.classList.remove('shake');
      void btn.offsetWidth;
      btn.classList.add('shake');
    }
    try { tg.HapticFeedback.notificationOccurred('error'); } catch (_) {}
    return;
  }

  pushToCart(detailProductId, detailSelectedSize);

  var btn = document.getElementById('detail-add-btn');
  if (btn) {
    btn.className = 'detail-add-btn visible added';
    btn.textContent = '\u27D0 ADDED \u27D0';
    setTimeout(function () {
      btn.className = 'detail-add-btn visible';
      btn.textContent = '\u27D0 ADD TO CART \u27D0';
    }, 900);
  }

  try { tg.HapticFeedback.impactOccurred('heavy'); } catch (_) {}
}

// ═══════════════════════════════════════════════════════
//  RENDER PRODUCT GRID
// ═══════════════════════════════════════════════════════
function renderProducts() {
  var grid = document.getElementById('product-grid');
  var html = '';

  for (var i = 0; i < products.length; i++) {
    var p = products[i];

    var slides = '';
    var dots = '';
    for (var k = 0; k < p.images.length; k++) {
      slides += '<div class="carousel-slide">' +
        '<img src="' + p.images[k] + '" alt="' + p.name + '" loading="lazy">' +
      '</div>';
      dots += '<span class="carousel-dot' + (k === 0 ? ' active' : '') + '"></span>';
    }

    var sizeBtns = '';
    for (var j = 0; j < p.sizes.length; j++) {
      sizeBtns += '<button class="size-btn" data-product="' + p.id +
        '" data-size="' + p.sizes[j] +
        '" onclick="selectSize(' + p.id + ',\'' + p.sizes[j] + '\',event)">' +
        p.sizes[j] + '</button>';
    }

    html += '<div class="product-card" onclick="openProduct(' + p.id + ')">' +
      '<div class="card-carousel" data-carousel="' + p.id + '">' +
        '<button class="carousel-arrow left" onclick="slideCarousel(' + p.id + ',-1,event)">\u2039</button>' +
        '<div class="carousel-track">' + slides + '</div>' +
        '<button class="carousel-arrow right" onclick="slideCarousel(' + p.id + ',1,event)">\u203A</button>' +
        '<div class="carousel-dots">' + dots + '</div>' +
      '</div>' +
      '<div class="product-info">' +
        '<div class="product-name">' + p.name + '</div>' +
        '<div class="product-price">' + p.price + ' $</div>' +
        '<div class="size-row">' + sizeBtns + '</div>' +
        '<div class="size-hint" id="hint-' + p.id + '">SELECT SIZE</div>' +
        '<button class="btn-add" id="addbtn-' + p.id +
          '" onclick="addToCart(' + p.id + ',event)">\u27D0 ADD \u27D0</button>' +
      '</div>' +
    '</div>';
  }

  grid.innerHTML = html;
}

// ═══════════════════════════════════════════════════════
//  CART MODAL
// ═══════════════════════════════════════════════════════
window.openCart = function () {
  renderCartModal();
  document.getElementById('cart-overlay').className = 'cart-overlay open';
  try { tg.HapticFeedback.impactOccurred('light'); } catch (_) {}
};

window.closeCart = function () {
  document.getElementById('cart-overlay').className = 'cart-overlay';
};

function renderCartModal() {
  var body = document.getElementById('cart-body');
  var footer = document.getElementById('cart-footer');
  var totalEl = document.getElementById('cart-total-value');

  if (cart.length === 0) {
    body.innerHTML =
      '<div class="cart-empty">' +
        '<span class="cart-empty-icon">\u25C7</span>' +
        '<span>EMPTY VESSEL</span>' +
      '</div>';
    footer.className = 'cart-footer';
    return;
  }

  var html = '';
  for (var i = 0; i < cart.length; i++) {
    var item = cart[i];
    html += '<div class="cart-item">' +
      '<div class="cart-item-info">' +
        '<div class="cart-item-name">' + item.name + '</div>' +
        '<div class="cart-item-meta">SIZE: ' + item.size +
          (item.qty > 1 ? ' \u00D7 ' + item.qty : '') + '</div>' +
      '</div>' +
      '<div class="cart-item-price">' + (item.price * item.qty) + ' $</div>' +
      '<button class="cart-item-remove" onclick="removeFromCart(\'' + item.key + '\')">\u2715</button>' +
    '</div>';
  }

  body.innerHTML = html;
  footer.className = 'cart-footer visible';
  totalEl.textContent = getTotal() + ' $';
}

// ═══════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════
loadCart();
renderProducts();
onCartChanged();
