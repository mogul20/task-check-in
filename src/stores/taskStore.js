import { reactive, watch } from 'vue'
import { user } from './userStore'
import { addTask as supabaseAddTask, getTasks as supabaseGetTasks, updateTask as supabaseUpdateTask, deleteTask as supabaseDeleteTask, checkin as supabaseCheckin, getCheckinRecords as supabaseGetRecords } from '../supabase/taskService'

const REMINDER_KEY = 'daily-goal-reminder'

const defaultTasks = [
  {
    id: '1',
    name: '早起打卡',
    description: '每天早上7点前起床',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    color: '#3b82f6'
  },
  {
    id: '2',
    name: '运动健身',
    description: '每天运动30分钟',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    color: '#10b981'
  },
  {
    id: '3',
    name: '阅读学习',
    description: '每天阅读30页书籍',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    color: '#f59e0b'
  },
  {
    id: '4',
    name: '喝水提醒',
    description: '每天喝8杯水',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    color: '#06b6d4'
  }
]

export const appState = reactive({
  isLoading: false,
  isInitialized: false
})

function loadFromStorage(key, defaultValue) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch {
    return defaultValue
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export const tasks = reactive([])
export const records = reactive({})
export const commentUpdateTrigger = reactive({ value: 0 })

async function loadUserData() {
  if (!user.userId) {
    tasks.splice(0, tasks.length)
    Object.keys(records).forEach(key => delete records[key])
    return
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(user.userId)) {
    console.warn('Invalid UUID format, using local data')
    return
  }
  
  appState.isLoading = true
  
  try {
    const [tasksData, recordsData] = await Promise.all([
      supabaseGetTasks(user.userId),
      supabaseGetRecords(user.userId)
    ])
    
    const formattedTasks = tasksData.map(task => ({
      id: task.id,
      name: task.name,
      description: task.description,
      startDate: task.start_date,
      endDate: task.end_date,
      color: task.color,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    }))
    
    const formattedRecords = {}
    recordsData.forEach(record => {
      if (!formattedRecords[record.checkin_date]) {
        formattedRecords[record.checkin_date] = {}
      }
      formattedRecords[record.checkin_date][record.task_id] = {
        completed: record.completed,
        comments: record.comment ? [{
          id: record.id,
          text: record.comment,
          timestamp: new Date(record.created_at).getTime()
        }] : [],
        completedAt: record.completed ? new Date(record.created_at).getTime() : null
      }
    })
    
    tasks.splice(0, tasks.length, ...(formattedTasks.length > 0 ? formattedTasks : defaultTasks))
    
    Object.keys(records).forEach(key => delete records[key])
    Object.assign(records, formattedRecords)
    
  } catch (error) {
    console.error('Failed to load data from Supabase:', error)
    tasks.splice(0, tasks.length, ...defaultTasks)
    Object.keys(records).forEach(key => delete records[key])
  } finally {
    appState.isLoading = false
  }
}

watch(() => user.userId, async (newUserId) => {
  if (newUserId) {
    await loadUserData()
  } else {
    tasks.splice(0, tasks.length)
    Object.keys(records).forEach(key => delete records[key])
  }
})

export async function addTask(task) {
  const newTask = {
    name: task.name,
    description: task.description,
    startDate: task.startDate,
    endDate: task.endDate,
    color: task.color || getRandomColor()
  }
  
  if (user.userId) {
    try {
      const result = await supabaseAddTask(user.userId, newTask)
      const formattedTask = {
        id: result.id,
        name: result.name,
        description: result.description,
        startDate: result.start_date,
        endDate: result.end_date,
        color: result.color,
        createdAt: result.created_at,
        updatedAt: result.updated_at
      }
      tasks.push(formattedTask)
      return formattedTask
    } catch (error) {
      console.error('Failed to add task:', error)
    }
  }
  
  const localTask = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    ...newTask
  }
  tasks.push(localTask)
  return localTask
}

export async function updateTask(taskId, updates) {
  const index = tasks.findIndex(t => t.id === taskId)
  if (index !== -1) {
    const formattedUpdates = {}
    if (updates.name !== undefined) formattedUpdates.name = updates.name
    if (updates.description !== undefined) formattedUpdates.description = updates.description
    if (updates.startDate !== undefined) formattedUpdates.start_date = updates.startDate
    if (updates.endDate !== undefined) formattedUpdates.end_date = updates.endDate
    if (updates.color !== undefined) formattedUpdates.color = updates.color
    
    if (user.userId && Object.keys(formattedUpdates).length > 0) {
      try {
        await supabaseUpdateTask(user.userId, taskId, formattedUpdates)
      } catch (error) {
        console.error('Failed to update task:', error)
      }
    }
    
    tasks[index] = { ...tasks[index], ...updates }
  }
}

export async function deleteTask(taskId) {
  const index = tasks.findIndex(t => t.id === taskId)
  if (index !== -1) {
    if (user.userId) {
      try {
        await supabaseDeleteTask(user.userId, taskId)
      } catch (error) {
        console.error('Failed to delete task:', error)
      }
    }
    tasks.splice(index, 1)
  }
  for (const date in records) {
    if (records[date][taskId]) {
      delete records[date][taskId]
    }
  }
}

export function getTasksForDate(dateStr) {
  return tasks.filter(task => {
    return task.startDate <= dateStr && (!task.endDate || task.endDate >= dateStr)
  })
}

export async function checkIn(taskId, comment = '', dateStr = null) {
  const targetDate = dateStr || new Date().toISOString().split('T')[0]
  
  if (user.userId) {
    try {
      await supabaseCheckin(user.userId, taskId, comment, targetDate)
    } catch (error) {
      console.error('Failed to checkin:', error)
    }
  }
  
  if (!records[targetDate]) {
    records[targetDate] = {}
  }
  const existingRecord = records[targetDate][taskId]
  const comments = existingRecord?.comments || []
  if (comment) {
    comments.push({
      id: Date.now().toString(),
      text: comment,
      timestamp: Date.now()
    })
  }
  records[targetDate][taskId] = {
    completed: true,
    comments,
    completedAt: existingRecord?.completedAt || Date.now()
  }
}

export function isCompleted(taskId, dateStr = null) {
  const targetDate = dateStr || new Date().toISOString().split('T')[0]
  return records[targetDate]?.[taskId]?.completed || false
}

export function getComment(taskId, dateStr = null) {
  const targetDate = dateStr || new Date().toISOString().split('T')[0]
  const comments = records[targetDate]?.[taskId]?.comments || []
  return comments.length > 0 ? comments[comments.length - 1].text : ''
}

export function addComment(taskId, comment, dateStr = null) {
  const targetDate = dateStr || new Date().toISOString().split('T')[0]
  if (!records[targetDate]) {
    records[targetDate] = {}
  }
  if (!records[targetDate][taskId]) {
    records[targetDate][taskId] = {
      completed: false,
      comments: [],
      completedAt: null
    }
  }
  const newComment = {
    id: Date.now().toString(),
    text: comment,
    timestamp: Date.now()
  }
  const record = records[targetDate][taskId]
  let currentComments = record.comments
  if (!Array.isArray(currentComments)) {
    currentComments = []
    if (record.comment && typeof record.comment === 'string') {
      currentComments.push({
        id: record.timestamp ? record.timestamp.toString() : Date.now().toString(),
        text: record.comment,
        timestamp: record.timestamp || Date.now()
      })
      delete record.comment
    }
  }
  records[targetDate][taskId].comments = [...currentComments, newComment]
  commentUpdateTrigger.value++
}

export function updateComment(taskId, comment, dateStr = null) {
  const targetDate = dateStr || new Date().toISOString().split('T')[0]
  if (records[targetDate]?.[taskId]) {
    const comments = records[targetDate][taskId].comments || []
    if (comments.length > 0) {
      comments[comments.length - 1].text = comment
      comments[comments.length - 1].timestamp = Date.now()
    }
  }
}

export function deleteComment(taskId, commentId, dateStr = null) {
  const targetDate = dateStr || new Date().toISOString().split('T')[0]
  if (records[targetDate]?.[taskId]) {
    const comments = records[targetDate][taskId].comments || []
    records[targetDate][taskId].comments = comments.filter(c => c.id !== commentId)
  }
}

export function uncheckIn(taskId, dateStr = null) {
  const targetDate = dateStr || new Date().toISOString().split('T')[0]
  if (records[targetDate]?.[taskId]) {
    delete records[targetDate][taskId]
    if (Object.keys(records[targetDate]).length === 0) {
      delete records[targetDate]
    }
  }
}

export function getTodayTasks() {
  const today = new Date().toISOString().split('T')[0]
  return getTasksForDate(today)
}

export function getTaskStats(taskId, startDate, endDate) {
  let completedCount = 0
  let totalDays = 0
  let consecutiveCount = 0
  
  const task = tasks.find(t => t.id === taskId)
  const taskStartDate = task?.startDate || startDate
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  let streak = 0
  let maxStreak = 0
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    totalDays++
    if (records[dateStr]?.[taskId]?.completed) {
      completedCount++
      streak++
      maxStreak = Math.max(maxStreak, streak)
    } else {
      streak = 0
    }
  }
  
  const cumulativeStart = new Date(taskStartDate)
  const cumulativeEnd = new Date()
  let cumulativeCount = 0
  for (let d = new Date(cumulativeStart); d <= cumulativeEnd; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    if (records[dateStr]?.[taskId]?.completed) {
      cumulativeCount++
    }
  }
  
  return {
    totalDays,
    completedCount,
    cumulativeCount,
    consecutiveCount: maxStreak,
    completionRate: totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0
  }
}

export function getMonthlyStats(year, month) {
  const stats = {}
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  
  tasks.forEach(task => {
    stats[task.id] = getTaskStats(task.id, firstDay.toISOString().split('T')[0], lastDay.toISOString().split('T')[0])
  })
  
  return stats
}

export function getYearlyStats(year) {
  const stats = {}
  const firstDay = new Date(year, 0, 1)
  const lastDay = new Date(year, 11, 31)
  
  tasks.forEach(task => {
    stats[task.id] = getTaskStats(task.id, firstDay.toISOString().split('T')[0], lastDay.toISOString().split('T')[0])
  })
  
  return stats
}

export function getDailyStatsForMonth(year, month) {
  const result = []
  const daysInMonth = new Date(year, month, 0).getDate()
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    const dateStr = date.toISOString().split('T')[0]
    const dayRecords = records[dateStr] || {}
    const completedCount = Object.values(dayRecords).filter(r => r.completed).length
    const totalTasks = tasks.filter(t => t.startDate <= dateStr && (!t.endDate || t.endDate >= dateStr)).length
    
    result.push({
      date: dateStr,
      completedCount,
      totalTasks,
      rate: totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0,
      perfect: totalTasks > 0 && completedCount === totalTasks
    })
  }
  
  return result
}

export function getPerfectDaysForMonth(year, month) {
  const dailyStats = getDailyStatsForMonth(year, month)
  return dailyStats.filter(d => d.perfect)
}

export function getPerfectDaysForYear(year) {
  const perfectDays = []
  for (let month = 1; month <= 12; month++) {
    const dailyStats = getDailyStatsForMonth(year, month)
    perfectDays.push(...dailyStats.filter(d => d.perfect))
  }
  return perfectDays
}

export function getPerfectDaysCalendar(year, month) {
  const dailyStats = getDailyStatsForMonth(year, month)
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const daysInMonth = lastDay.getDate()
  const startPadding = firstDay.getDay()
  
  const result = []
  for (let i = 0; i < startPadding; i++) {
    result.push(null)
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    const dateStr = date.toISOString().split('T')[0]
    const dayStats = dailyStats.find(d => d.date === dateStr)
    result.push({
      day,
      dateStr,
      isPerfect: dayStats?.perfect || false
    })
  }
  
  return result
}

export function getTaskComments(taskId) {
  const comments = []
  for (const dateStr in records) {
    const dayRecords = records[dateStr]
    if (dayRecords[taskId]) {
      const record = dayRecords[taskId]
      if (record.comments && Array.isArray(record.comments) && record.comments.length > 0) {
        record.comments.forEach(comment => {
          comments.push({
            id: comment.id,
            date: dateStr,
            timestamp: comment.timestamp,
            comment: comment.text
          })
        })
      } else if (record.comment && typeof record.comment === 'string') {
        comments.push({
          id: record.timestamp ? record.timestamp.toString() : dateStr,
          date: dateStr,
          timestamp: record.timestamp || Date.now(),
          comment: record.comment
        })
      }
    }
  }
  return comments.sort((a, b) => b.timestamp - a.timestamp)
}

function getRandomColor() {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']
  return colors[Math.floor(Math.random() * colors.length)]
}

export const reminderSettings = reactive(loadFromStorage(REMINDER_KEY, {
  enabled: false,
  hour: 12,
  minute: 30
}))

watch(reminderSettings, (newVal) => {
  saveToStorage(REMINDER_KEY, newVal)
}, { deep: true })

export function setReminderSettings(settings) {
  Object.assign(reminderSettings, settings)
}

export function getReminderSettings() {
  return { ...reminderSettings }
}

export function checkTodayTasksCompleted() {
  const today = new Date().toISOString().split('T')[0]
  const todayTasks = getTasksForDate(today)
  
  if (todayTasks.length === 0) {
    return true
  }
  
  return todayTasks.every(task => isCompleted(task.id, today))
}

export function getUncompletedTasks() {
  const today = new Date().toISOString().split('T')[0]
  const todayTasks = getTasksForDate(today)
  return todayTasks.filter(task => !isCompleted(task.id, today))
}

loadUserData().then(() => {
  appState.isInitialized = true
})
