<template>
  <div>
    <div v-if="appState.isLoading" class="flex items-center justify-center py-16">
      <div class="flex flex-col items-center">
        <Loader2 class="w-8 h-8 text-blue-500 animate-spin" />
        <p class="text-gray-500 mt-3">加载中...</p>
      </div>
    </div>
    
    <div v-else>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-800">统计分析</h2>
    </div>
    
    <div class="flex gap-2 mb-4">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="currentTab = tab.id"
        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="currentTab === tab.id ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'"
      >
        {{ tab.name }}
      </button>
    </div>
    
    <div v-if="currentTab === 'monthly'" class="mb-4">
      <div class="flex items-center justify-center gap-4 bg-white rounded-lg p-3 mb-4">
        <select 
          v-model="currentYear"
          class="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option v-for="year in availableYears" :key="year" :value="year">{{ year }}年</option>
        </select>
        <select 
          v-model="currentMonth"
          class="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option v-for="month in months" :key="month.value" :value="month.value">{{ month.label }}</option>
        </select>
      </div>
      
      <div class="task-card mb-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-medium text-gray-800">月度打卡趋势</h3>
          <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button 
              @click="monthlyChartType = 'line'"
              class="px-3 py-1 rounded text-xs font-medium transition-all"
              :class="monthlyChartType === 'line' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            >
              折线图
            </button>
            <button 
              @click="monthlyChartType = 'bar'"
              class="px-3 py-1 rounded text-xs font-medium transition-all"
              :class="monthlyChartType === 'bar' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            >
              柱状图
            </button>
          </div>
        </div>
        <div class="h-48">
          <Line v-if="monthlyChartType === 'line'" :data="monthlyChartData" :options="lineOptions" />
          <Bar v-else :data="monthlyChartData" :options="barOptions" />
        </div>
      </div>
      
      <div class="task-card">
        <h3 class="font-medium text-gray-800 mb-3">任务完成情况</h3>
        <div v-if="monthlyStats.length === 0" class="text-center py-8 text-gray-400">
          暂无数据
        </div>
        <div v-else class="space-y-3">
          <div v-for="stat in monthlyStats" :key="stat.task.id" class="flex items-center justify-between">
            <div class="flex items-center">
              <div 
                class="w-3 h-3 rounded-full mr-2"
                :style="{ backgroundColor: stat.task.color }"
              ></div>
              <span class="text-gray-700">{{ stat.task.name }}</span>
            </div>
            <div class="text-right">
              <div class="font-medium text-gray-800">{{ stat.completedCount }}/{{ stat.totalDays }}</div>
              <div class="text-xs text-gray-400">{{ stat.completionRate }}%</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="task-card">
        <h3 class="font-medium text-gray-800 mb-3">完美打卡</h3>
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
          <div class="flex items-center justify-center gap-8">
            <div class="text-center">
              <div class="text-3xl font-bold text-purple-600">{{ monthlyPerfectDays.length }}</div>
              <div class="text-xs text-gray-500 mt-1">完美打卡天数</div>
            </div>
            <div class="w-px h-10 bg-gray-300"></div>
            <div class="text-center">
              <div class="text-3xl font-bold text-pink-500">{{ monthlyPerfectRate }}%</div>
              <div class="text-xs text-gray-500 mt-1">完美打卡率</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else-if="currentTab === 'yearly'" class="mb-4">
      <div class="flex items-center justify-center gap-4 bg-white rounded-lg p-3 mb-4">
        <select 
          v-model="currentYear"
          class="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option v-for="year in availableYears" :key="year" :value="year">{{ year }}年</option>
        </select>
      </div>
      
      <div class="task-card mb-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-medium text-gray-800">年度打卡趋势</h3>
          <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button 
              @click="yearlyChartType = 'line'"
              class="px-3 py-1 rounded text-xs font-medium transition-all"
              :class="yearlyChartType === 'line' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            >
              折线图
            </button>
            <button 
              @click="yearlyChartType = 'bar'"
              class="px-3 py-1 rounded text-xs font-medium transition-all"
              :class="yearlyChartType === 'bar' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            >
              柱状图
            </button>
          </div>
        </div>
        <div class="h-48">
          <Line v-if="yearlyChartType === 'line'" :data="yearlyChartData" :options="lineOptions" />
          <Bar v-else :data="yearlyChartData" :options="barOptions" />
        </div>
      </div>
      
      <div class="task-card">
        <h3 class="font-medium text-gray-800 mb-3">任务完成情况</h3>
        <div v-if="yearlyStats.length === 0" class="text-center py-8 text-gray-400">
          暂无数据
        </div>
        <div v-else class="space-y-3">
          <div v-for="stat in yearlyStats" :key="stat.task.id" class="flex items-center justify-between">
            <div class="flex items-center">
              <div 
                class="w-3 h-3 rounded-full mr-2"
                :style="{ backgroundColor: stat.task.color }"
              ></div>
              <span class="text-gray-700">{{ stat.task.name }}</span>
            </div>
            <div class="text-right">
              <div class="font-medium text-gray-800">{{ stat.completedCount }}/{{ stat.totalDays }}</div>
              <div class="text-xs text-gray-400">{{ stat.completionRate }}%</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="task-card">
        <h3 class="font-medium text-gray-800 mb-3">完美打卡</h3>
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
          <div class="flex items-center justify-center gap-8">
            <div class="text-center">
              <div class="text-3xl font-bold text-purple-600">{{ yearlyPerfectDays.length }}</div>
              <div class="text-xs text-gray-500 mt-1">完美打卡天数</div>
            </div>
            <div class="w-px h-10 bg-gray-300"></div>
            <div class="text-center">
              <div class="text-3xl font-bold text-pink-500">{{ yearlyPerfectRate }}%</div>
              <div class="text-xs text-gray-500 mt-1">完美打卡率</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="mb-4">
      <div class="task-card mb-4">
        <h3 class="font-medium text-gray-800 mb-3">选择任务</h3>
        <div class="flex flex-wrap gap-2">
          <button 
            v-for="task in tasks" 
            :key="task.id"
            @click="selectedTaskId = task.id; viewPerfectMode = false"
            class="px-3 py-1.5 rounded-full text-sm transition-all"
            :class="selectedTaskId === task.id && !viewPerfectMode ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            :style="selectedTaskId === task.id && !viewPerfectMode ? { backgroundColor: task.color } : {}"
          >
            {{ task.name }}
          </button>
          <button 
            @click="viewPerfectMode = true; selectedTaskId = null"
            class="px-3 py-1.5 rounded-full text-sm transition-all"
            :class="viewPerfectMode ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          >
            ✨ 完美打卡
          </button>
        </div>
      </div>
      
      <div v-if="selectedTask && !viewPerfectMode" class="task-card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-medium text-gray-800">{{ selectedTask.name }} - 打卡日历</h3>
          <div class="flex items-center gap-2">
            <select 
              v-model="taskYear"
              class="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}年</option>
            </select>
            <select 
              v-model="taskMonth"
              class="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option v-for="month in months" :key="month.value" :value="month.value">{{ month.label }}</option>
            </select>
          </div>
        </div>
        
        <div 
          class="rounded-lg p-4"
          :style="getCalendarContainerStyle()"
        >
          <div class="grid grid-cols-7 gap-1 mb-2">
            <div 
              v-for="day in weekDays" 
              :key="day"
              class="text-center text-xs font-medium text-gray-500 py-1"
            >
              {{ day }}
            </div>
          </div>
          
          <div class="grid grid-cols-7 gap-1">
            <div 
              v-for="(day, index) in calendarDays" 
              :key="index"
              class="aspect-square flex items-center justify-center rounded-full text-xs font-medium transition-colors relative"
              :class="getCalendarDayClass(day)"
              :style="getCalendarDayStyle(day)"
              :title="day ? getDayTitle(day) : ''"
            >
              <span v-if="day">{{ day.day }}</span>
              <span 
                v-if="day && day.isCompleted" 
                class="absolute bottom-1 w-1.5 h-1.5 rounded-full" 
                :style="{ backgroundColor: selectedTask?.color || '#10b981' }"
              ></span>
            </div>
          </div>
        </div>
        
        <div class="mt-4 pt-4 border-t">
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold" :style="{ color: selectedTask.color }">{{ taskStats.completedCount }}</div>
              <div class="text-xs text-gray-500">完成天数</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-rose-300">{{ taskStats.consecutiveCount }}</div>
              <div class="text-xs text-gray-500">连续打卡</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-blue-700">{{ taskStats.cumulativeCount }}</div>
              <div class="text-xs text-gray-500">累计打卡</div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else-if="viewPerfectMode" class="task-card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-medium text-gray-800">✨ 完美打卡日历</h3>
          <div class="flex items-center gap-2">
            <select 
              v-model="taskYear"
              class="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}年</option>
            </select>
            <select 
              v-model="taskMonth"
              class="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option v-for="month in months" :key="month.value" :value="month.value">{{ month.label }}</option>
            </select>
          </div>
        </div>
        
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
          <div class="grid grid-cols-7 gap-1 mb-2">
            <div 
              v-for="day in weekDays" 
              :key="day"
              class="text-center text-xs font-medium text-gray-500 py-1"
            >
              {{ day }}
            </div>
          </div>
          
          <div class="grid grid-cols-7 gap-1">
            <div 
              v-for="(day, index) in perfectDaysCalendar" 
              :key="index"
              class="aspect-square flex items-center justify-center rounded-full text-xs font-medium transition-colors relative"
              :class="getPerfectDayClass(day)"
              :style="getPerfectDayStyle(day)"
              :title="day ? getPerfectDayTitle(day) : ''"
            >
              <span v-if="day">{{ day.day }}</span>
              <span v-if="day && day.isPerfect" class="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            </div>
          </div>
        </div>
        
        <div class="mt-4 pt-4 border-t">
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-purple-600">{{ perfectDaysCount }}</div>
              <div class="text-xs text-gray-500">完成天数</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-rose-300">{{ perfectConsecutiveCount }}</div>
              <div class="text-xs text-gray-500">连续打卡</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-blue-700">{{ perfectCumulativeCount }}</div>
              <div class="text-xs text-gray-500">累计打卡</div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="task-card">
        <div class="text-center py-8 text-gray-400">
          <Calendar class="w-12 h-12 mx-auto mb-2 opacity-50" />
          <div>请选择一个任务查看统计</div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Calendar, Loader2, Plus } from 'lucide-vue-next'
import { appState, tasks, records, getMonthlyStats, getYearlyStats, getDailyStatsForMonth, getTaskStats, getPerfectDaysForMonth, getPerfectDaysForYear, getPerfectDaysCalendar } from '../stores/taskStore'
import { user } from '../stores/userStore'
import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  Filler
)

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const currentTab = ref('monthly')
const selectedTaskId = ref(tasks[0]?.id || null)
const taskYear = ref(new Date().getFullYear())
const taskMonth = ref(new Date().getMonth() + 1)
const viewPerfectMode = ref(false)
const monthlyChartType = ref('line')
const yearlyChartType = ref('line')

const currentYearNum = computed(() => Number(currentYear.value))
const currentMonthNum = computed(() => Number(currentMonth.value))
const taskYearNum = computed(() => Number(taskYear.value))
const taskMonthNum = computed(() => Number(taskMonth.value))

const months = [
  { value: 1, label: '1月' },
  { value: 2, label: '2月' },
  { value: 3, label: '3月' },
  { value: 4, label: '4月' },
  { value: 5, label: '5月' },
  { value: 6, label: '6月' },
  { value: 7, label: '7月' },
  { value: 8, label: '8月' },
  { value: 9, label: '9月' },
  { value: 10, label: '10月' },
  { value: 11, label: '11月' },
  { value: 12, label: '12月' }
]

const availableYears = computed(() => {
  const current = new Date().getFullYear()
  const years = []
  for (let year = current - 5; year <= current + 5; year++) {
    years.push(year)
  }
  return years
})

const tabs = [
  { id: 'monthly', name: '月度统计' },
  { id: 'yearly', name: '年度统计' },
  { id: 'task', name: '任务日历' }
]

const monthlyStats = computed(() => {
  const stats = getMonthlyStats(currentYearNum.value, currentMonthNum.value)
  return tasks.map(task => ({
    task,
    ...stats[task.id]
  }))
})

const yearlyStats = computed(() => {
  const stats = getYearlyStats(currentYearNum.value)
  return tasks.map(task => ({
    task,
    ...stats[task.id]
  }))
})

const selectedTask = computed(() => {
  return tasks.find(t => t.id === selectedTaskId.value)
})

const taskStats = computed(() => {
  if (!selectedTask.value) {
    return { totalDays: 0, completedCount: 0, completionRate: 0 }
  }
  const firstDay = new Date(taskYearNum.value, taskMonthNum.value - 1, 1)
  const lastDay = new Date(taskYearNum.value, taskMonthNum.value, 0)
  return getTaskStats(selectedTask.value.id, firstDay.toISOString().split('T')[0], lastDay.toISOString().split('T')[0])
})

const calendarDays = computed(() => {
  if (!selectedTask.value) return []
  
  const firstDay = new Date(taskYearNum.value, taskMonthNum.value - 1, 1)
  const lastDay = new Date(taskYearNum.value, taskMonthNum.value, 0)
  const daysInMonth = lastDay.getDate()
  const startPadding = firstDay.getDay()
  
  const result = []
  
  for (let i = 0; i < startPadding; i++) {
    result.push(null)
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(taskYear.value, taskMonth.value - 1, day)
    const dateStr = date.toISOString().split('T')[0]
    const task = selectedTask.value
    const isInTaskPeriod = dateStr >= task.startDate && (!task.endDate || dateStr <= task.endDate)
    const isCompleted = records[dateStr]?.[task.id]?.completed
    
    result.push({
      day,
      dateStr,
      isInTaskPeriod,
      isCompleted
    })
  }
  
  return result
})

function getCalendarDayClass(day) {
  if (!day) return ''
  if (!day.isInTaskPeriod) return 'bg-gray-300 text-gray-500 cursor-not-allowed'
  if (day.isCompleted) {
    return 'font-medium'
  }
  return 'text-gray-700'
}

function getCalendarDayStyle(day) {
  if (!day) return {}
  if (!day.isInTaskPeriod) return {}
  const color = selectedTask.value?.color || '#10b981'
  if (day.isCompleted) {
    return {
      backgroundColor: `${color}1a`,
      color: color
    }
  }
  return {}
}

function getCalendarContainerStyle() {
  const color = selectedTask.value?.color || '#10b981'
  const lighterColor = `${color}1a`
  return {
    background: `linear-gradient(135deg, ${lighterColor} 0%, ${lighterColor} 100%)`
  }
}

function getDayTitle(day) {
  if (!day) return ''
  if (!day.isInTaskPeriod) return '该日期不在任务周期内'
  if (day.isCompleted) return `${day.dateStr} - 已打卡`
  return `${day.dateStr} - 未打卡`
}

const monthlyPerfectDays = computed(() => {
  return getPerfectDaysForMonth(currentYearNum.value, currentMonthNum.value)
})

const monthlyPerfectRate = computed(() => {
  const dailyStats = getDailyStatsForMonth(currentYearNum.value, currentMonthNum.value)
  const daysWithTasks = dailyStats.filter(d => d.totalTasks > 0)
  return daysWithTasks.length > 0 ? Math.round((monthlyPerfectDays.value.length / daysWithTasks.length) * 100) : 0
})

const yearlyPerfectDays = computed(() => {
  return getPerfectDaysForYear(currentYearNum.value)
})

const yearlyPerfectRate = computed(() => {
  let totalDaysWithTasks = 0
  for (let month = 1; month <= 12; month++) {
    const dailyStats = getDailyStatsForMonth(currentYearNum.value, month)
    totalDaysWithTasks += dailyStats.filter(d => d.totalTasks > 0).length
  }
  return totalDaysWithTasks > 0 ? Math.round((yearlyPerfectDays.value.length / totalDaysWithTasks) * 100) : 0
})

const perfectDaysCalendar = computed(() => {
  return getPerfectDaysCalendar(taskYearNum.value, taskMonthNum.value)
})

const perfectDaysCount = computed(() => {
  return perfectDaysCalendar.value.filter(d => d && d.isPerfect).length
})

const perfectDaysIncompleteCount = computed(() => {
  const dailyStats = getDailyStatsForMonth(taskYearNum.value, taskMonthNum.value)
  const daysWithTasks = dailyStats.filter(d => d.totalTasks > 0)
  const perfectDays = daysWithTasks.filter(d => d.perfect)
  return daysWithTasks.length - perfectDays.length
})

const perfectConsecutiveCount = computed(() => {
  let streak = 0
  let maxStreak = 0
  const dailyStats = getDailyStatsForMonth(taskYearNum.value, taskMonthNum.value)
  for (const day of dailyStats) {
    if (day.perfect) {
      streak++
      maxStreak = Math.max(maxStreak, streak)
    } else {
      streak = 0
    }
  }
  return maxStreak
})

const perfectCumulativeCount = computed(() => {
  const allDailyStats = getDailyStatsForMonth(taskYear.value, 1)
  let cumulative = 0
  for (let month = 1; month <= 12; month++) {
    const monthlyStats = getDailyStatsForMonth(taskYear.value, month)
    cumulative += monthlyStats.filter(d => d.perfect).length
  }
  return cumulative
})

function getPerfectDayClass(day) {
  if (!day) return ''
  if (!day.isPerfect) return 'text-gray-700'
  return 'font-medium'
}

function getPerfectDayStyle(day) {
  if (!day) return {}
  if (day.isPerfect) {
    return {
      backgroundColor: 'rgba(168, 85, 247, 0.1)',
      color: '#a855f7'
    }
  }
  return {}
}

function getPerfectDayTitle(day) {
  if (!day) return ''
  if (day.isPerfect) return `${day.dateStr} - 完美打卡 ✨`
  return `${day.dateStr} - 未完美`
}

const monthlyChartData = computed(() => {
  const dailyStats = getDailyStatsForMonth(currentYearNum.value, currentMonthNum.value)
  return {
    labels: dailyStats.map(d => d.date.slice(8)),
    datasets: [
      {
        label: '完成率',
        data: dailyStats.map(d => d.rate),
        borderColor: '#3b82f6',
        backgroundColor: monthlyChartType.value === 'bar' ? 'rgba(59, 130, 246, 0.7)' : 'rgba(59, 130, 246, 0.1)',
        fill: monthlyChartType.value !== 'bar',
        tension: 0.4,
        pointRadius: monthlyChartType.value === 'bar' ? 0 : 4,
        pointHoverRadius: 6
      }
    ]
  }
})

const yearlyChartData = computed(() => {
  const monthlyRates = []
  for (let month = 1; month <= 12; month++) {
    const dailyStats = getDailyStatsForMonth(currentYearNum.value, month)
    const totalRate = dailyStats.reduce((sum, d) => sum + d.rate, 0)
    monthlyRates.push(dailyStats.length > 0 ? Math.round(totalRate / dailyStats.length) : 0)
  }
  
  return {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    datasets: [
      {
        label: '月平均完成率',
        data: monthlyRates,
        borderColor: '#3b82f6',
        backgroundColor: yearlyChartType.value === 'bar' ? 'rgba(59, 130, 246, 0.7)' : 'rgba(59, 130, 246, 0.1)',
        fill: yearlyChartType.value !== 'bar',
        tension: 0.4,
        pointRadius: yearlyChartType.value === 'bar' ? 0 : 4,
        pointHoverRadius: 6
      }
    ]
  }
})

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: {
        callback: (value) => value + '%'
      }
    }
  }
}

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: {
        callback: (value) => value + '%'
      }
    }
  }
}

</script>
