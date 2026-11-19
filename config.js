/* Настройки сайта NJ Podology. Меняйте только тексты в кавычках. */
window.NJ = {
  phone: '+7 775 771 43 43',
  phoneDigits: '77757714343', /* номер для WhatsApp, только цифры */
  address: 'Улица Алихан Бокейхан, 48',
  instagram: '', /* ссылка, например 'https://instagram.com/ваш_логин'; пусто = значок скрыт */
  telegram: '',

  /* Время приёма: мастер работает с 10:00 до 20:00, последняя запись на 20:00 */
  times: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
  daysAhead: 14, /* на сколько дней вперёд открыта запись */

  /* FIREBASE: заполните по инструкции из файла НАСТРОЙКА.md.
     Пока apiKey пустой, сайт работает в демо-режиме: данные хранятся только в этом браузере
     и мастер не увидит заявки. Для настоящих клиентов обязательно заполните. */
  firebase: {
    apiKey: 'AIzaSyAU7APg1cAG_b8MM8qmPXjEc8QoUfiYmDw',
    authDomain: 'nj-podology-site.firebaseapp.com',
    projectId: 'nj-podology-site',
    storageBucket: 'nj-podology-site.firebasestorage.app',
    messagingSenderId: '362285731795',
    appId: '1:362285731795:web:2d7ff31a9c36dee66c2926'
  }
};
