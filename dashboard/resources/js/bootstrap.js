import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

import Echo from 'laravel-echo';
window.Pusher = require('pusher-js');

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: process.env.MIX_PUSHER_APP_KEY,
    cluster: process.env.MIX_PUSHER_APP_CLUSTER,
    forceTLS: true
});

// مثال: استمع لإشعارات المستخدم الحالي (تأكد من تمرير userId من Blade)
// window.Echo.private('App.Models.User.' + userId)
//     .notification((notification) => {
//         // حدث جديد: حدث تحديث للأيقونة أو أضف الإشعار للقائمة
//         updateNotificationIcon(notification);
//     });
