import { createApp, watch } from 'vue'
import './style.css'
import App from './App.vue'
import { reminderSettings, checkTodayTasksCompleted } from './stores/taskStore'

let reminderTimer = null

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

function scheduleReminder() {
  if (reminderTimer) {
    clearInterval(reminderTimer)
  }

  if (!reminderSettings.enabled) {
    return
  }

  reminderTimer = setInterval(() => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    if (currentHour === reminderSettings.hour && currentMinute === reminderSettings.minute) {
      if (!checkTodayTasksCompleted()) {
        showReminderNotification()
      }
    }
  }, 60000)
}

function showReminderNotification() {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification('打卡提醒', {
      body: '还有任务未完成，快来mogul打卡吧',
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233b82f6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
      badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ef4444"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  }
}

watch(reminderSettings, () => {
  scheduleReminder()
}, { deep: true })

const app = createApp(App)
app.mount('#app')

requestNotificationPermission()
scheduleReminder()
