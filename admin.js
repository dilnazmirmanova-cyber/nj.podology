/* Панель мастера: закрыть время, заявки, отзывы */
(function () {
  'use strict';
  var NJ = window.NJ, TIMES = NJ.times, pad = function (n) { return String(n).padStart(2, '0'); };
  var $ = function (s) { return document.querySelector(s); };
  function h(tag, props) {
    var e = document.createElement(tag); props = props || {};
    Object.keys(props).forEach(function (k) {
      if (k === 'class') e.className = props[k]; else if (k === 'text') e.textContent = props[k];
      else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), props[k]); else e.setAttribute(k, props[k]);
    });
    for (var i = 2; i < arguments.length; i++) { var c = arguments[i]; if (c == null) continue; e.append(c.nodeType ? c : document.createTextNode(c)); }
    return e;
  }

  var days = DB.nextDays(NJ.daysAhead || 14);
  var selDate = DB.ymd(days[0]);
  var loggedIn = false, slots = [], bookings = [], reviews = [], unsubs = [];

  /* ----- сообщения ----- */
  var banner = $('#banner');
  function showBanner(t) { banner.textContent = t; banner.hidden = !t; }
  if (DB.sdkMissing) showBanner('Не загрузилась библиотека Firebase. Проверьте интернет и обновите страницу.');
  else if (DB.mode === 'local') showBanner('Демо-режим: данные хранятся только в этом браузере. Чтобы заявки доходили до мастера с телефонов клиентов, заполните Firebase в config.js (см. НАСТРОЙКА.md).');
  function dataErr(e) { if (e) showBanner('Нет доступа к данным. Проверьте правила Firestore и что вы вошли под почтой мастера.'); }

  /* ----- вход ----- */
  $('#loginForm').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var err = $('#lgErr'); err.textContent = '';
    var email = $('#lgEmail').value.trim(), pass = $('#lgPass').value;
    if (DB.mode === 'firebase' && (!email || !pass)) { err.textContent = 'Введите почту и пароль.'; return; }
    DB.login(email, pass).catch(function () { err.textContent = 'Неверная почта или пароль.'; });
  });
  $('#logout').addEventListener('click', function () { if (loggedIn) { DB.logout(); } else { location.href = 'index.html'; } });
  if (!DB.onAuth) { showBanner('Для входа нужна библиотека Firebase Auth. Обновите страницу.'); } else
  DB.onAuth(function (u) {
    unsubs.forEach(function (f) { f && f(); }); unsubs = [];
    loggedIn = !!u; $('#login').hidden = !!u; $('#app').hidden = !u; $('#logout').textContent = u ? 'Выйти' : 'На сайт';
    if (!u) return;
    var today = DB.ymd(new Date());
    unsubs.push(DB.watchSlotsFrom(today, function (s, e) { slots = s; dataErr(e); renderTime(); }));
    unsubs.push(DB.watchBookings(function (b, e) { bookings = b; dataErr(e); renderBookings(); renderTime(); }));
    unsubs.push(DB.watchReviews(function (r, e) { reviews = r; dataErr(e); renderReviews(); }, true));
  });

  /* ----- вкладки ----- */
  document.querySelectorAll('.tabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.tabs button').forEach(function (x) { x.setAttribute('aria-selected', x === b); });
      ['time', 'bk', 'rv'].forEach(function (t) { $('#tab-' + t).hidden = t !== b.dataset.tab; });
    });
  });

  /* ----- время ----- */
  function slotAt(date, time) { return slots.find(function (s) { return s.date === date && s.time === time; }); }
  function bookingOf(slot) {
    return slot && bookings.find(function (b) { return b.id === slot.bookingId && b.status !== 'cancelled'; })
      || bookings.find(function (b) { return slot && b.date === slot.date && b.time === slot.time && b.status !== 'cancelled'; });
  }
  function renderDays() {
    var box = $('#admDays'); box.textContent = '';
    days.forEach(function (d, i) {
      var key = DB.ymd(d);
      var cnt = slots.filter(function (s) { return s.date === key; }).length;
      var b = h('button', { type: 'button', class: 'chip', 'aria-pressed': String(key === selDate) },
        i === 0 ? 'Сегодня' : DB.WD[d.getDay()], h('small', { text: pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + (cnt ? ' · ' + cnt : '') }));
      b.addEventListener('click', function () { selDate = key; renderTime(); });
      box.appendChild(b);
    });
  }
  function renderTime() {
    renderDays();
    var box = $('#admTimes'); box.textContent = '';
    TIMES.forEach(function (t) {
      var s = slotAt(selDate, t), cls = 'free', label = 'Свободно';
      if (s && s.type === 'closed') { cls = 'closed'; label = 'Закрыто'; }
      if (s && s.type === 'booked') { cls = 'booked'; var bk = bookingOf(s); label = bk ? bk.name : 'Записан'; }
      var b = h('button', { type: 'button', class: 'tm ' + cls }, h('b', { text: t }), h('span', { text: label }));
      b.addEventListener('click', function () {
        if (cls === 'booked') { var bk2 = bookingOf(s); if (bk2) openModal(bk2); return; }
        b.disabled = true;
        DB.setClosed(selDate, t, cls === 'free').then(function () { b.disabled = false; }, function () { b.disabled = false; showBanner('Не удалось сохранить. Проверьте интернет.'); });
      });
      box.appendChild(b);
    });
  }
  $('#closeDay').addEventListener('click', function () {
    var free = TIMES.filter(function (t) { return !slotAt(selDate, t); });
    if (free.length) DB.setMany(selDate, free, true);
  });
  $('#openDay').addEventListener('click', function () {
    var closed = TIMES.filter(function (t) { var s = slotAt(selDate, t); return s && s.type === 'closed'; });
    if (closed.length) DB.setMany(selDate, closed, false);
  });

  /* ----- заявки ----- */
  var STATUS = { 'new': 'Новая', confirmed: 'Подтверждена', cancelled: 'Отменена' };
  function dayLabel(date) { var p = date.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]); return DB.WD[d.getDay()] + ' ' + p[2] + '.' + p[1]; }
  function digits(s) { return (s || '').replace(/\D/g, ''); }
  function contactLinks(b) {
    var d = digits(b.phone); if (d.length === 11 && d[0] === '8') d = '7' + d.slice(1);
    return [h('a', { class: 'lnk', href: 'tel:+' + d, text: 'Позвонить' }), h('a', { class: 'lnk', href: 'https://wa.me/' + d, target: '_blank', rel: 'noopener', text: 'WhatsApp' })];
  }
  function twoStep(label, sure, fn, cls) {
    var b = h('button', { type: 'button', class: 'btn small ' + (cls || 'ghost'), text: label }), t;
    b.addEventListener('click', function () {
      if (b.dataset.armed) { clearTimeout(t); fn(); return; }
      b.dataset.armed = '1'; b.textContent = sure; t = setTimeout(function () { delete b.dataset.armed; b.textContent = label; }, 3000);
    });
    return b;
  }
  function renderBookings() {
    var box = $('#bkList'); box.textContent = '';
    var today = DB.ymd(new Date());
    var list = bookings.filter(function (b) { return b.status !== 'cancelled' && b.date >= today; })
      .sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); });
    var nw = list.filter(function (b) { return b.status === 'new'; }).length;
    var bd = $('#bkBadge'); bd.textContent = nw; bd.hidden = !nw;
    if (!list.length) { box.appendChild(h('p', { class: 'empty', text: 'Заявок пока нет.' })); return; }
    list.forEach(function (b) {
      var acts = h('div', { class: 'row-actions' });
      contactLinks(b).forEach(function (a) { acts.appendChild(a); });
      if (b.status === 'new') acts.appendChild(h('button', { type: 'button', class: 'btn small', text: 'Подтвердить', onclick: function () { DB.setBookingStatus(b.id, 'confirmed'); } }));
      acts.appendChild(twoStep('Отменить запись', 'Точно отменить?', function () { DB.cancelBooking(b); }));
      box.appendChild(h('article', { class: 'item ' + b.status },
        h('div', { class: 'item-top' }, h('b', { text: dayLabel(b.date) + ', ' + b.time }), h('span', { class: 'pill ' + b.status, text: STATUS[b.status] || b.status })),
        h('div', { class: 'item-main', text: b.name + ', ' + b.phone }),
        h('div', { class: 'item-sub', text: b.serviceName || '' }), acts));
    });
  }

  /* ----- отзывы ----- */
  function renderReviews() {
    var p = $('#rvPending'), d = $('#rvDone'); p.textContent = ''; d.textContent = '';
    var pend = reviews.filter(function (r) { return !r.approved; });
    var bd = $('#rvBadge'); bd.textContent = pend.length; bd.hidden = !pend.length;
    function card(r) {
      var acts = h('div', { class: 'row-actions' });
      if (!r.approved) acts.appendChild(h('button', { type: 'button', class: 'btn small', text: 'Опубликовать', onclick: function () { DB.setReviewApproved(r.id, true); } }));
      else acts.appendChild(h('button', { type: 'button', class: 'btn ghost small', text: 'Скрыть', onclick: function () { DB.setReviewApproved(r.id, false); } }));
      acts.appendChild(twoStep('Удалить', 'Точно удалить?', function () { DB.deleteReview(r.id); }));
      return h('article', { class: 'item' },
        h('div', { class: 'item-top' }, h('b', { text: r.name }), h('span', { class: 'stars', text: '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating) })),
        h('div', { class: 'item-main', text: r.text }),
        h('div', { class: 'item-sub', text: new Date(r.createdAt).toLocaleDateString('ru-RU') }), acts);
    }
    if (!pend.length) p.appendChild(h('p', { class: 'empty', text: 'Новых отзывов нет.' }));
    pend.forEach(function (r) { p.appendChild(card(r)); });
    var ok = reviews.filter(function (r) { return r.approved; });
    if (!ok.length) d.appendChild(h('p', { class: 'empty', text: 'Опубликованных отзывов пока нет.' }));
    ok.forEach(function (r) { d.appendChild(card(r)); });
  }

  /* ----- карточка записи ----- */
  var modal = $('#modal');
  function closeModal() { modal.hidden = true; }
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  function openModal(b) {
    $('#mdTitle').textContent = dayLabel(b.date) + ', ' + b.time;
    var body = $('#mdBody'); body.textContent = '';
    body.append(h('p', { class: 'item-main', text: b.name + ', ' + b.phone }), h('p', { class: 'item-sub', text: (b.serviceName || '') + ' · ' + (STATUS[b.status] || '') }));
    var acts = $('#mdActions'); acts.textContent = '';
    contactLinks(b).forEach(function (a) { acts.appendChild(a); });
    if (b.status === 'new') acts.appendChild(h('button', { type: 'button', class: 'btn small', text: 'Подтвердить', onclick: function () { DB.setBookingStatus(b.id, 'confirmed'); closeModal(); } }));
    acts.appendChild(twoStep('Отменить запись', 'Точно отменить?', function () { DB.cancelBooking(b); closeModal(); }));
    acts.appendChild(h('button', { type: 'button', class: 'btn ghost small', text: 'Закрыть', onclick: closeModal }));
    modal.hidden = false;
  }
})();
