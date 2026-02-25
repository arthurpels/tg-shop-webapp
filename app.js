const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

tg.setHeaderColor('#050505');
tg.setBackgroundColor('#050505');

// ── Products ───────────────────────────────────────────
var products = [
  {
    id: 1,
    name: 'Hellfire Hoodie',
    price: 89,
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://cdn-icons-png.flaticon.com/512/2503/2503380.png',
      'https://cdn-icons-png.flaticon.com/512/892/892458.png',
      'https://cdn-icons-png.flaticon.com/512/2503/2503196.png',
    ],
  },
  {
    id: 2,
    name: 'Chrome Jacket',
    price: 145,
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://cdn-icons-png.flaticon.com/512/2503/2503279.png',
      'https://cdn-icons-png.flaticon.com/512/2503/2503254.png',
      'https://cdn-icons-png.flaticon.com/512/2503/2503207.png',
    ],
  },
  {
    id: 3,
    name: 'Void Cargo Pants',
    price: 110,
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://cdn-icons-png.flaticon.com/512/2503/2503267.png',
      'https://cdn-icons-png.flaticon.com/512/2503/2503244.png',
      'https://cdn-icons-png.flaticon.com/512/2503/2503218.png',
    ],
  },
  {
    id: 4,
    name: 'Skull Oversized Tee',
    price: 65,
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://cdn-icons-png.flaticon.com/512/2503/2503232.png',
      'https://cdn-icons-png.flaticon.com/512/2503/2503196.png',
      'https://cdn-icons-png.flaticon.com/512/892/892458.png',
    ],
  },
];

// ── State ──────────────────────────────────────────────
const selectedSizes = {};
const cart = [];

function cartKey(id, size) {
  return id + '_' + size;
}

function getTotal() {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

function getTotalItems() {
  return cart.reduce((s, i) => s + i.qty, 0);
}

// ── Telegram MainButton ────────────────────────────────
function updateMainButton() {
  const total = getTotal();
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
  var items = cart.map(function (i) {
    return { id: i.id, name: i.name, size: i.size, price: i.price, qty: i.qty };
  });
  tg.sendData(JSON.stringify(items));
  tg.close();
});

// ── Header counter ─────────────────────────────────────
function updateHeaderCount() {
  var el = document.getElementById('header-cart-count');
  var n = getTotalItems();
  el.textContent = n;
  if (n > 0) {
    el.className = 'header-cart-count visible';
  } else {
    el.className = 'header-cart-count';
  }
}

// ── Size selection ─────────────────────────────────────
window.selectSize = function (productId, size) {
  selectedSizes[productId] = size;

  var hint = document.getElementById('hint-' + productId);
  if (hint) {
    hint.className = 'size-hint';
  }

  var btns = document.querySelectorAll('.size-btn[data-product="' + productId + '"]');
  for (var i = 0; i < btns.length; i++) {
    if (btns[i].getAttribute('data-size') === size) {
      btns[i].className = 'size-btn active';
    } else {
      btns[i].className = 'size-btn';
    }
  }

  try { tg.HapticFeedback.selectionChanged(); } catch (_) {}
};

// ── Add to cart ────────────────────────────────────────
window.addToCart = function (id) {
  var size = selectedSizes[id];

  if (!size) {
    var hint = document.getElementById('hint-' + id);
    if (hint) {
      hint.className = 'size-hint visible';
    }
    var btn = document.getElementById('addbtn-' + id);
    if (btn) {
      btn.classList.remove('shake');
      void btn.offsetWidth;
      btn.classList.add('shake');
    }
    try { tg.HapticFeedback.notificationOccurred('error'); } catch (_) {}
    return;
  }

  var key = cartKey(id, size);
  var existing = null;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].key === key) { existing = cart[i]; break; }
  }

  if (existing) {
    existing.qty++;
  } else {
    var product = null;
    for (var j = 0; j < products.length; j++) {
      if (products[j].id === id) { product = products[j]; break; }
    }
    cart.push({
      key: key,
      id: product.id,
      name: product.name,
      size: size,
      price: product.price,
      qty: 1,
    });
  }

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
  updateMainButton();
  updateHeaderCount();
};

// ── Remove from cart ───────────────────────────────────
window.removeFromCart = function (key) {
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].key === key) {
      cart.splice(i, 1);
      break;
    }
  }
  try { tg.HapticFeedback.impactOccurred('light'); } catch (_) {}
  updateMainButton();
  updateHeaderCount();
  renderCartModal();
};

// ── Render product grid ────────────────────────────────
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
      dots += '<span class="carousel-dot' + (k === 0 ? ' active' : '') + '" data-idx="' + k + '"></span>';
    }

    var sizeBtns = '';
    for (var j = 0; j < p.sizes.length; j++) {
      sizeBtns += '<button class="size-btn" data-product="' + p.id +
        '" data-size="' + p.sizes[j] +
        '" onclick="selectSize(' + p.id + ',\'' + p.sizes[j] + '\')">' +
        p.sizes[j] + '</button>';
    }

    html += '<div class="product-card">' +
      '<div class="card-carousel" data-carousel="' + p.id + '">' +
        '<button class="carousel-arrow left" onclick="slideCarousel(' + p.id + ',-1)">\u2039</button>' +
        '<div class="carousel-track">' + slides + '</div>' +
        '<button class="carousel-arrow right" onclick="slideCarousel(' + p.id + ',1)">\u203A</button>' +
        '<div class="carousel-dots">' + dots + '</div>' +
      '</div>' +
      '<div class="product-info">' +
        '<div class="product-name">' + p.name + '</div>' +
        '<div class="product-price">' + p.price + ' $</div>' +
        '<div class="size-row">' + sizeBtns + '</div>' +
        '<div class="size-hint" id="hint-' + p.id + '">SELECT SIZE</div>' +
        '<button class="btn-add" id="addbtn-' + p.id +
          '" onclick="addToCart(' + p.id + ')">\u27D0 ADD \u27D0</button>' +
      '</div>' +
    '</div>';
  }

  grid.innerHTML = html;
}

// ── Carousel arrow navigation ──────────────────────────
var carouselState = {};

window.slideCarousel = function (productId, dir) {
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

// ── Cart modal ─────────────────────────────────────────
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

// ── Init ───────────────────────────────────────────────
renderProducts();
