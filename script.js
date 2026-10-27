/* ---------- Data ---------- */
const products = [
  { id: 1, brand: 'ASICS', name: 'Tiger Runner',        type: 'Running',   price: 6999,  tone: '#ffe1d6', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwlrtrbIVfSf3bLrA9qx8bKBE5wxqI3J51uSrCI8gajQ&s=10', note: 'Retro runner energy. Light, comfy and easy to style.' },
  { id: 2, brand: 'ASICS', name: 'Unisex Tiger Runner', type: 'Running',   price: 7999,  tone: '#dbe9ff', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQi_WzKjRue02ozIasOTH5goQxZf4xSnPzdd5YNLFkkzQ&s=10', note: 'Same retro vibe in a unisex fit. Goes with everything.' },
  { id: 3, brand: 'Park',  name: 'Lifestyle Sneaker',   type: 'Lifestyle', price: 2999,  tone: '#d9f2e6', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNUqhyqN5hqO7Hj39Ey_vUO_03dfAvMOwGUE_nfrQwhQ&s', note: 'Clean everyday kicks that match every fit without the big price.' },
  { id: 4, brand: 'Nike',  name: 'Air Max Dn8',         type: 'Lifestyle', price: 17995, tone: '#e4dcff', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjsB64uH-29__67u6M6qG11ttou5xHdSC2gGFAVhfpWQ&s=10', note: 'Bold look with Air cushioning. The main character of your shoe rack.' },
  { id: 5, brand: 'Puma',  name: 'Palermo',             type: 'Lifestyle', price: 9499,  tone: '#fff1b8', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSr7xshUBTQw0Zsk03E-xLGXWpc1tRuPl42VfSWlIe9CQ&s=10', note: 'Slim, low and super clean. A street classic that never gets old.' },
  { id: 6, brand: 'Nike',  name: 'SB Alleyoop',         type: 'Skate',     price: 7495,  tone: '#ffd9e8', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6A1dENWdp1-wEw5DmX1IuNRdUNMj0wUxDoH4yQW5xOgiPrZsi7GYHBRA&s=10', note: 'Skate-ready and built to take a beating. Grip for days.' }
];
const brands = ['All', ...new Set(products.map(p => p.brand))].sort((a, b) => (a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b)));
const priceRanges = { all: [0, Infinity], u5: [0, 5000], m: [5000, 10000], o: [10000, Infinity] };
const COUPONS = {
  STEP10:   { type: 'percent', value: 10, label: '10% off' },
  FLAT500:  { type: 'flat', value: 500, min: 8000, label: '₹500 off' },
  FREESHIP: { type: 'ship', label: 'free delivery' }
};
const SHIPPING_FEE = 99, FREE_SHIPPING_ABOVE = 5000;
const DEFAULT_MSG = 'Try: STEP10, FLAT500, FREESHIP';

/* ---------- State ---------- */
const state = { brand: 'All', type: 'all', price: 'all', sort: 'featured', coupon: null };
let cart = [];
try { cart = JSON.parse(localStorage.getItem('firststep_cart')) || []; } catch (e) { cart = []; }

/* ---------- Helpers ---------- */
const $ = s => document.querySelector(s);
const byId = id => products.find(p => p.id === id);
const fmt = n => '₹' + n.toLocaleString('en-IN');
const saveCart = () => { try { localStorage.setItem('firststep_cart', JSON.stringify(cart)); } catch (e) {} };
const row = (label, value, cls = '') => `<div class="${cls}"><dt>${label}</dt><dd>${value}</dd></div>`;
/* Drawn shoe shows if a photo fails to load */
const shoe = () => `<svg viewBox="0 0 160 100" aria-hidden="true"><path d="M12 68V52q0-5 6-7l32-8 12-16q4-5 10-1l12 12 48 10q20 5 20 20v8q0 5-6 5H18q-6 0-6-8z" fill="#222"/><rect x="8" y="74" width="148" height="12" rx="6" fill="#fff" stroke="#bbb"/></svg>`;
const photo = p => `<img src="${p.img}" alt="${p.brand} ${p.name}" referrerpolicy="no-referrer" onload="this.parentNode.classList.add('has-img')" onerror="this.remove()">`;

/* ---------- Filtering and sorting ---------- */
function visibleProducts() {
  const [lo, hi] = priceRanges[state.price];
  const list = products.filter(p =>
    (state.brand === 'All' || p.brand === state.brand) &&
    (state.type === 'all' || p.type === state.type) &&
    p.price >= lo && p.price < hi
  );
  const sorters = {
    low: (a, b) => a.price - b.price,
    high: (a, b) => b.price - a.price,
    brand: (a, b) => a.brand.localeCompare(b.brand) || a.price - b.price,
    name: (a, b) => a.name.localeCompare(b.name)
  };
  if (sorters[state.sort]) list.sort(sorters[state.sort]);
  return list;
}

function renderPills() {
  $('#brandPills').innerHTML = brands.map(b =>
    `<button data-brand="${b}" class="${b === state.brand ? 'active' : ''}">${b}</button>`).join('');
}

function renderProducts() {
  const list = visibleProducts();
  $('#resultCount').textContent = `${list.length} ${list.length === 1 ? 'pair' : 'pairs'}`;
  $('#productGrid').innerHTML = list.length ? list.map(p => `
    <article class="card">
      <div class="thumb" style="--tone:${p.tone}">${shoe()}${photo(p)}
        <span class="origin">${p.type}</span>
      </div>
      <div class="card-body">
        <p class="brand-name">${p.brand}</p>
        <h3>${p.name}</h3>
        <p class="note">${p.note}</p>
        <div class="price-row"><span>UK 6 to 11</span><span>${fmt(p.price)}</span></div>
      </div>
      <button class="btn" data-add="${p.id}">Add to Cart</button>
    </article>`).join('')
    : '<p class="empty">Nothing here yet. Try different filters.</p>';
}

/* ---------- Cart logic ---------- */
function addToCart(id) {
  const item = cart.find(i => i.id === id);
  item ? item.qty++ : cart.push({ id, qty: 1 });
  renderCart();
}
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  renderCart();
}
function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
}

/* ---------- Price calculation ---------- */
function totals() {
  const subtotal = cart.reduce((sum, i) => sum + byId(i.id).price * i.qty, 0);
  const c = COUPONS[state.coupon];
  let discount = 0, freeShip = false;
  if (c) {
    if (c.type === 'percent') discount = Math.round(subtotal * c.value / 100);
    if (c.type === 'flat') discount = c.value;
    if (c.type === 'ship') freeShip = true;
  }
  const afterDiscount = subtotal - discount;
  const shipping = subtotal === 0 || freeShip || afterDiscount >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
  return { subtotal, discount, shipping, total: afterDiscount + shipping };
}

function summaryHTML() {
  const t = totals();
  return row('Subtotal', fmt(t.subtotal))
    + (t.discount ? row(`Discount (${state.coupon})`, '- ' + fmt(t.discount), 'discount') : '')
    + row('Delivery', t.shipping ? fmt(t.shipping) : 'Free')
    + row('Total', fmt(t.total), 'total');
}

/* ---------- Coupons ---------- */
function setMsg(text, type = '') {
  const el = $('#couponMsg');
  el.textContent = text;
  el.className = 'coupon-msg ' + type;
}
function applyCoupon(code) {
  const c = COUPONS[code];
  if (!c) return setMsg('That code does not work. Check the spelling.', 'err');
  if (c.min && totals().subtotal < c.min) return setMsg(`${code} needs a minimum order of ${fmt(c.min)}.`, 'err');
  state.coupon = code;
  setMsg(`${code} applied: ${c.label}.`, 'ok');
  renderCart();
}
function revalidateCoupon() {
  const c = COUPONS[state.coupon];
  if (c && c.min && totals().subtotal < c.min) {
    setMsg(`${state.coupon} was removed. Minimum order is ${fmt(c.min)}.`, 'err');
    state.coupon = null;
  }
}

/* ---------- Cart rendering ---------- */
function renderCart() {
  revalidateCoupon();
  $('#cartCount').textContent = cart.reduce((s, i) => s + i.qty, 0);
  $('#cartItems').innerHTML = cart.length ? cart.map(i => {
    const p = byId(i.id);
    return `
      <div class="line">
        <div class="mini" style="--tone:${p.tone}">${shoe()}${photo(p)}</div>
        <div class="line-info">
          <h4>${p.name}</h4>
          <p>${p.brand}</p>
          <div class="qty">
            <button data-dec="${p.id}" aria-label="Decrease quantity">-</button>
            <span>${i.qty}</span>
            <button data-inc="${p.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div class="line-end">
          <strong>${fmt(p.price * i.qty)}</strong>
          <button class="remove" data-remove="${p.id}">Remove</button>
        </div>
      </div>`;
  }).join('') : '<p class="empty">Your cart is empty. Go find some heat.</p>';
  $('#cartFoot').hidden = !cart.length;
  $('#summary').innerHTML = summaryHTML();
  saveCart();
}

/* ---------- Drawer and checkout ---------- */
const openCart = () => document.body.classList.add('cart-open');
const closeCart = () => document.body.classList.remove('cart-open');

function openCheckout() {
  closeCart();
  $('#checkoutItems').innerHTML = cart.map(i => {
    const p = byId(i.id);
    return `<div class="co-line"><span>${p.brand} ${p.name} x ${i.qty}</span><span>${fmt(p.price * i.qty)}</span></div>`;
  }).join('');
  $('#checkoutTotals').innerHTML = summaryHTML();
  $('#checkoutForm').hidden = false;
  document.querySelector('.checkout-summary').hidden = false;
  $('#success').hidden = true;
  document.body.classList.add('modal-open');
}
function closeCheckout() { document.body.classList.remove('modal-open'); }

function placeOrder(e) {
  e.preventDefault();
  const total = fmt(totals().total);
  const email = new FormData(e.target).get('email');
  const orderNo = 'FS' + Math.floor(100000 + Math.random() * 900000);
  $('#successText').textContent = `Order ${orderNo} for ${total} is confirmed. Your receipt is on its way to ${email}.`;
  $('#checkoutForm').hidden = true;
  document.querySelector('.checkout-summary').hidden = true;
  $('#success').hidden = false;
  cart = [];
  state.coupon = null;
  e.target.reset();
  setMsg(DEFAULT_MSG);
  renderCart();
}

/* ---------- Events ---------- */
document.addEventListener('click', e => {
  const t = e.target;
  if (t.dataset.brand) { state.brand = t.dataset.brand; renderPills(); renderProducts(); }
  if (t.dataset.add) {
    addToCart(+t.dataset.add);
    t.textContent = 'Added';
    setTimeout(() => { t.textContent = 'Add to Cart'; }, 900);
  }
  if (t.dataset.inc) changeQty(+t.dataset.inc, 1);
  if (t.dataset.dec) changeQty(+t.dataset.dec, -1);
  if (t.dataset.remove) removeItem(+t.dataset.remove);
});

$('#typeFilter').addEventListener('change', e => { state.type = e.target.value; renderProducts(); });
$('#priceFilter').addEventListener('change', e => { state.price = e.target.value; renderProducts(); });
$('#sort').addEventListener('change', e => { state.sort = e.target.value; renderProducts(); });

$('#openCart').addEventListener('click', openCart);
$('#closeCart').addEventListener('click', closeCart);
$('#overlay').addEventListener('click', () => { closeCart(); closeCheckout(); });
$('#checkoutBtn').addEventListener('click', openCheckout);
$('#closeModal').addEventListener('click', () => { closeCheckout(); openCart(); });
$('#doneBtn').addEventListener('click', closeCheckout);
$('#checkoutForm').addEventListener('submit', placeOrder);
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeCart(); closeCheckout(); } });

$('#couponForm').addEventListener('submit', e => {
  e.preventDefault();
  const code = $('#couponInput').value.trim().toUpperCase();
  if (code) applyCoupon(code);
});

/* ---------- Init ---------- */
renderPills();
renderProducts();
renderCart();
