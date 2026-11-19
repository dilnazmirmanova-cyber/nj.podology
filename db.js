/* Слой данных. Работает с Firebase (если заполнен config.js) или в демо-режиме (localStorage).
   Состав: занятые/закрытые часы (slots), заявки (bookings), отзывы (reviews), вход мастера. */
(function () {
  'use strict';
  var NJ = window.NJ || {};
  var cfg = NJ.firebase || {};
  var wantFb = !!cfg.apiKey;
  var hasSdk = typeof firebase !== 'undefined';
  var useFb = wantFb && hasSdk;
  var DB = { mode: useFb ? 'firebase' : 'local', sdkMissing: wantFb && !hasSdk };
  var slotId = function (d, t) { return d + '_' + t.replace(':', ''); };
  DB.slotId = slotId;

  var byNewest = function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); };

  if (useFb) {
    firebase.initializeApp(cfg);
    var fs = firebase.firestore();
    var auth = firebase.auth ? firebase.auth() : null;
    var stamp = function () { return firebase.firestore.FieldValue.serverTimestamp(); };
    var ms = function (v) { return v && v.toMillis ? v.toMillis() : (v || Date.now()); };
    var withId = function (d) { var x = d.data(); x.id = d.id; x.createdAt = ms(x.createdAt); return x; };

    /* публичное чтение: какие часы заняты в этот день -> { '11:00': 'closed' | 'booked' } */
    DB.watchSlots = function (date, cb) {
      return fs.collection('slots').where('date', '==', date).onSnapshot(function (s) {
        var m = {}; s.forEach(function (d) { var x = d.data(); m[x.time] = x.type; }); cb(m);
      }, function (e) { console.warn(e); cb({}, e); });
    };
    /* для мастера: все часы начиная с даты */
    DB.watchSlotsFrom = function (from, cb) {
      return fs.collection('slots').where('date', '>=', from).onSnapshot(function (s) {
        cb(s.docs.map(function (d) { return d.data(); }));
      }, function (e) { console.warn(e); cb([], e); });
    };
    DB.setClosed = function (date, time, closed) {
      var ref = fs.collection('slots').doc(slotId(date, time));
      return closed ? ref.set({ date: date, time: time, type: 'closed' }) : ref.delete();
    };
    DB.setMany = function (date, times, closed) {
      var b = fs.batch();
      times.forEach(function (t) {
        var ref = fs.collection('slots').doc(slotId(date, t));
        if (closed) b.set(ref, { date: date, time: t, type: 'closed' }); else b.delete(ref);
      });
      return b.commit();
    };
    DB.createBooking = function (x) {
      var bref = fs.collection('bookings').doc();
      var sref = fs.collection('slots').doc(slotId(x.date, x.time));
      var b = fs.batch();
      b.set(bref, { name: x.name, phone: x.phone, service: x.service, serviceName: x.serviceName,
        date: x.date, time: x.time, status: 'new', createdAt: stamp() });
      b.set(sref, { date: x.date, time: x.time, type: 'booked', bookingId: bref.id });
      return b.commit().then(function () { return bref.id; }, function () {
        var e = new Error('taken'); throw e;
      });
    };
    DB.watchBookings = function (cb) {
      return fs.collection('bookings').onSnapshot(function (s) { cb(s.docs.map(withId)); },
        function (e) { console.warn(e); cb([], e); });
    };
    DB.setBookingStatus = function (id, status) { return fs.collection('bookings').doc(id).update({ status: status }); };
    DB.cancelBooking = function (bk) {
      var b = fs.batch();
      b.update(fs.collection('bookings').doc(bk.id), { status: 'cancelled' });
      b.delete(fs.collection('slots').doc(slotId(bk.date, bk.time)));
      return b.commit();
    };
    DB.addReview = function (r) {
      return fs.collection('reviews').add({ name: r.name, rating: r.rating, text: r.text, approved: false, createdAt: stamp() });
    };
    DB.watchReviews = function (cb, all) {
      var q = all ? fs.collection('reviews') : fs.collection('reviews').where('approved', '==', true);
      return q.onSnapshot(function (s) { cb(s.docs.map(withId).sort(byNewest)); },
        function (e) { console.warn(e); cb([], e); });
    };
    DB.setReviewApproved = function (id, v) { return fs.collection('reviews').doc(id).update({ approved: v }); };
    DB.deleteReview = function (id) { return fs.collection('reviews').doc(id).delete(); };

    if (auth) {
      DB.login = function (email, pw) { return auth.signInWithEmailAndPassword(email, pw); };
      DB.logout = function () { return auth.signOut(); };
      DB.onAuth = function (cb) { return auth.onAuthStateChanged(function (u) { cb(u ? { email: u.email } : null); }); };
    }
  } else {
    /* ---------- демо-режим: всё в localStorage этого браузера ---------- */
    var KEY = 'nj_demo_v1';
    var mem = { slots: {}, bookings: [], reviews: [], auth: false };
    var load = function () { try { var s = localStorage.getItem(KEY); if (s) mem = Object.assign({ slots: {}, bookings: [], reviews: [], auth: false }, JSON.parse(s)); } catch (e) {} };
    var subs = [];
    var fire = function () { subs.slice().forEach(function (f) { f(); }); };
    var save = function () { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) {} fire(); };
    var sub = function (fn) { subs.push(fn); setTimeout(fn, 0); return function () { subs = subs.filter(function (f) { return f !== fn; }); }; };
    load();
    window.addEventListener('storage', function (e) { if (e.key === KEY) { load(); fire(); } });
    var ok = function (v) { return Promise.resolve(v); };

    DB.watchSlots = function (date, cb) {
      return sub(function () {
        var m = {}; Object.keys(mem.slots).forEach(function (k) { var x = mem.slots[k]; if (x.date === date) m[x.time] = x.type; }); cb(m);
      });
    };
    DB.watchSlotsFrom = function (from, cb) {
      return sub(function () { cb(Object.keys(mem.slots).map(function (k) { return mem.slots[k]; }).filter(function (x) { return x.date >= from; })); });
    };
    DB.setClosed = function (date, time, closed) {
      if (closed) mem.slots[slotId(date, time)] = { date: date, time: time, type: 'closed' }; else delete mem.slots[slotId(date, time)];
      save(); return ok();
    };
    DB.setMany = function (date, times, closed) {
      times.forEach(function (t) { if (closed) mem.slots[slotId(date, t)] = { date: date, time: t, type: 'closed' }; else delete mem.slots[slotId(date, t)]; });
      save(); return ok();
    };
    DB.createBooking = function (x) {
      var id = slotId(x.date, x.time);
      if (mem.slots[id]) return Promise.reject(new Error('taken'));
      var bid = 'b' + Date.now();
      mem.bookings.push({ id: bid, name: x.name, phone: x.phone, service: x.service, serviceName: x.serviceName, date: x.date, time: x.time, status: 'new', createdAt: Date.now() });
      mem.slots[id] = { date: x.date, time: x.time, type: 'booked', bookingId: bid };
      save(); return ok(bid);
    };
    DB.watchBookings = function (cb) { return sub(function () { cb(mem.bookings.slice()); }); };
    DB.setBookingStatus = function (id, status) {
      mem.bookings.forEach(function (b) { if (b.id === id) b.status = status; }); save(); return ok();
    };
    DB.cancelBooking = function (bk) {
      mem.bookings.forEach(function (b) { if (b.id === bk.id) b.status = 'cancelled'; });
      delete mem.slots[slotId(bk.date, bk.time)]; save(); return ok();
    };
    DB.addReview = function (r) {
      mem.reviews.push({ id: 'r' + Date.now(), name: r.name, rating: r.rating, text: r.text, approved: false, createdAt: Date.now() });
      save(); return ok();
    };
    DB.watchReviews = function (cb, all) {
      return sub(function () { cb(mem.reviews.filter(function (r) { return all || r.approved; }).sort(byNewest)); });
    };
    DB.setReviewApproved = function (id, v) { mem.reviews.forEach(function (r) { if (r.id === id) r.approved = v; }); save(); return ok(); };
    DB.deleteReview = function (id) { mem.reviews = mem.reviews.filter(function (r) { return r.id !== id; }); save(); return ok(); };

    DB.login = function () { mem.auth = true; save(); return ok(); };
    DB.logout = function () { mem.auth = false; save(); return ok(); };
    DB.onAuth = function (cb) { return sub(function () { cb(mem.auth ? { email: 'демо' } : null); }); };
  }

  /* общие помощники */
  DB.ymd = function (d) { var p = function (n) { return String(n).padStart(2, '0'); }; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); };
  DB.nextDays = function (n) {
    var out = []; for (var i = 0; i < n; i++) { var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + i); out.push(d); } return out;
  };
  DB.WD = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  window.DB = DB;
})();
