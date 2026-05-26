<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="visible" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="handleConfirm"
      >
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="handleConfirm"></div>
        
        <Transition name="scale-in">
          <div 
            v-if="visible"
            class="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div class="bg-gradient-to-br from-blue-500 to-purple-500 py-6 px-4">
              <div class="flex items-center justify-around">
                <div class="flex flex-col items-center">
                  <span class="text-xs text-white/70 mb-2">年份</span>
                  <div 
                    ref="yearScrollRef"
                    class="scroll-container h-24 w-16 overflow-y-auto scrollbar-hide select-none"
                    @wheel="onYearWheel"
                    @touchstart="startYearTouch"
                    @touchmove="onYearTouchMove"
                    @touchend="endYearTouch"
                  >
                    <div 
                      v-for="year in availableYears" 
                      :key="year"
                      class="scroll-item h-10 flex items-center justify-center font-bold"
                      :class="selectedYear === year ? 'text-white text-2xl' : 'text-white/40 text-xl'"
                      @click="selectYear(year)"
                    >
                      {{ year }}
                    </div>
                  </div>
                </div>
                
                <div class="w-px h-16 bg-white/30"></div>
                
                <div class="flex flex-col items-center">
                  <span class="text-xs text-white/70 mb-2">月份</span>
                  <div 
                    ref="monthScrollRef"
                    class="scroll-container h-24 w-16 overflow-y-auto scrollbar-hide select-none"
                    @wheel="onMonthWheel"
                    @touchstart="startMonthTouch"
                    @touchmove="onMonthTouchMove"
                    @touchend="endMonthTouch"
                  >
                    <div 
                      v-for="month in months" 
                      :key="month.value"
                      class="scroll-item h-10 flex items-center justify-center font-bold"
                      :class="selectedMonth === month.value ? 'text-white text-2xl' : 'text-white/40 text-xl'"
                      @click="selectMonth(month.value)"
                    >
                      {{ month.value }}月
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: Date,
    default: () => new Date()
  },
  mode: {
    type: String,
    default: 'month',
    validator: (value) => ['date', 'month', 'year'].includes(value)
  },
  title: {
    type: String,
    default: '选择年月'
  }
})

const emit = defineEmits(['update:visible', 'update:modelValue', 'confirm'])

const yearScrollRef = ref(null)
const monthScrollRef = ref(null)
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth() + 1)

const yearTouchStartY = ref(0)
const yearTouchCurrentY = ref(0)
const monthTouchStartY = ref(0)
const monthTouchCurrentY = ref(0)

const availableYears = computed(() => {
  const current = new Date().getFullYear()
  const years = []
  for (let year = 2016; year <= current + 10; year++) {
    years.push(year)
  }
  return years
})

const months = [
  { value: 1, label: '一月' },
  { value: 2, label: '二月' },
  { value: 3, label: '三月' },
  { value: 4, label: '四月' },
  { value: 5, label: '五月' },
  { value: 6, label: '六月' },
  { value: 7, label: '七月' },
  { value: 8, label: '八月' },
  { value: 9, label: '九月' },
  { value: 10, label: '十月' },
  { value: 11, label: '十一月' },
  { value: 12, label: '十二月' }
]

function selectYear(year) {
  selectedYear.value = year
}

function selectMonth(month) {
  selectedMonth.value = month
}

function handleConfirm() {
  const selectedDate = new Date(selectedYear.value, selectedMonth.value - 1, 1)
  emit('update:modelValue', selectedDate)
  emit('confirm', selectedDate)
  emit('update:visible', false)
}

function onYearWheel(e) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? 1 : -1
  const currentIndex = availableYears.value.indexOf(selectedYear.value)
  const newIndex = Math.max(0, Math.min(availableYears.value.length - 1, currentIndex + delta))
  selectedYear.value = availableYears.value[newIndex]
  scrollToSelected(yearScrollRef.value, newIndex)
}

function onMonthWheel(e) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? 1 : -1
  let currentIndex = selectedMonth.value - 1
  let newIndex = currentIndex + delta
  if (newIndex < 0) {
    newIndex = 11
  } else if (newIndex > 11) {
    newIndex = 0
  }
  selectedMonth.value = newIndex + 1
  scrollToSelected(monthScrollRef.value, newIndex)
}

function startYearTouch(e) {
  yearTouchStartY.value = e.touches[0].clientY
}

function onYearTouchMove(e) {
  yearTouchCurrentY.value = e.touches[0].clientY
  const delta = yearTouchStartY.value - yearTouchCurrentY.value
  if (Math.abs(delta) > 20) {
    const direction = delta > 0 ? 1 : -1
    const currentIndex = availableYears.value.indexOf(selectedYear.value)
    const newIndex = Math.max(0, Math.min(availableYears.value.length - 1, currentIndex + direction))
    if (newIndex !== currentIndex) {
      selectedYear.value = availableYears.value[newIndex]
      scrollToSelected(yearScrollRef.value, newIndex)
      yearTouchStartY.value = yearTouchCurrentY.value
    }
  }
}

function endYearTouch() {
  yearTouchStartY.value = 0
  yearTouchCurrentY.value = 0
}

function startMonthTouch(e) {
  monthTouchStartY.value = e.touches[0].clientY
}

function onMonthTouchMove(e) {
  monthTouchCurrentY.value = e.touches[0].clientY
  const delta = monthTouchStartY.value - monthTouchCurrentY.value
  if (Math.abs(delta) > 20) {
    const direction = delta > 0 ? 1 : -1
    let currentIndex = selectedMonth.value - 1
    let newIndex = currentIndex + direction
    if (newIndex < 0) {
      newIndex = 11
    } else if (newIndex > 11) {
      newIndex = 0
    }
    if (newIndex !== currentIndex) {
      selectedMonth.value = newIndex + 1
      scrollToSelected(monthScrollRef.value, newIndex)
      monthTouchStartY.value = monthTouchCurrentY.value
    }
  }
}

function endMonthTouch() {
  monthTouchStartY.value = 0
  monthTouchCurrentY.value = 0
}

function scrollToSelected(container, index) {
  if (!container) return
  const itemHeight = 40
  const containerHeight = container.clientHeight
  const scrollTop = index * itemHeight - (containerHeight / 2) + (itemHeight / 2)
  container.scrollTop = Math.max(0, scrollTop)
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    const date = props.modelValue || new Date()
    selectedYear.value = date.getFullYear()
    selectedMonth.value = date.getMonth() + 1
    setTimeout(() => {
      const yearIndex = availableYears.value.indexOf(selectedYear.value)
      const monthIndex = selectedMonth.value - 1
      scrollToSelected(yearScrollRef.value, yearIndex)
      scrollToSelected(monthScrollRef.value, monthIndex)
    }, 100)
  }
})

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    selectedYear.value = newVal.getFullYear()
    selectedMonth.value = newVal.getMonth() + 1
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-in-enter-active,
.scale-in-leave-active {
  transition: all 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}

.scale-in-enter-from,
.scale-in-leave-to {
  transform: scale(0.85);
  opacity: 0;
}

.scroll-container {
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.scroll-item {
  scroll-snap-align: center;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>