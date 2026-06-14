import { reactive, watch, computed } from 'vue'
import { loginWithPhone as supabaseLogin, updateUserProfile, getVerificationCode as supabaseGetCode, resetPassword as supabaseResetPassword } from '../supabase/userService'

const USER_KEY = 'daily-goal-user'
const EXPIRATION_DAYS = 15

// 直接检查localStorage是否包含有效的登录数据
function getStoredUserData() {
  try {
    const data = localStorage.getItem(USER_KEY)
    if (!data) {
      console.log('localStorage中没有用户数据')
      return null
    }
    
    const parsed = JSON.parse(data)
    if (!parsed || !parsed.isLoggedIn || !parsed.lastLoginTime) {
      console.log('localStorage中没有有效的登录状态')
      return null
    }
    
    const now = Date.now()
    const lastLogin = new Date(parsed.lastLoginTime).getTime()
    const diffDays = (now - lastLogin) / (1000 * 60 * 60 * 24)
    
    if (diffDays > EXPIRATION_DAYS) {
      console.log('登录状态已过期，需要重新登录')
      return null
    }
    
    console.log('从localStorage恢复登录状态:', parsed.userName)
    return parsed
  } catch (e) {
    console.error('加载登录状态失败:', e)
    return null
  }
}

// 保存登录状态
function persistUserData(userData) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    console.log('登录状态已保存到localStorage')
  } catch (e) {
    console.error('保存登录状态失败:', e)
  }
}

// 创建响应式用户对象
const defaultUser = {
  isLoggedIn: false,
  userId: null,
  userName: '',
  avatar: '',
  loginType: '',
  createdAt: '',
  lastLoginTime: null
}

// 初始化用户数据
const storedData = getStoredUserData()
const initialData = storedData || defaultUser

export const user = reactive(initialData)

// 创建一个计算属性来确保响应式更新
export const isLoggedIn = computed(() => user.isLoggedIn)

// 监听用户状态变化并保存
watch(user, (newVal) => {
  persistUserData(newVal)
}, { deep: true })

// 监听其他标签页的存储变化
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === USER_KEY && e.newValue) {
      try {
        const newData = JSON.parse(e.newValue)
        if (newData) {
          Object.assign(user, newData)
          console.log('从其他标签页同步登录状态:', newData.userName)
        }
      } catch (err) {
        console.error('同步登录状态失败:', err)
      }
    }
  })
}

// 调试：输出初始化状态
console.log('userStore初始化完成', user.isLoggedIn ? `已登录: ${user.userName}` : '未登录')

export async function loginWithPhone(phone, code) {
  try {
    if (!phone || phone.length !== 11) {
      throw new Error('请输入正确的手机号')
    }
    if (!code || code.length === 0) {
      throw new Error('请输入密码')
    }

    const result = await supabaseLogin(phone, code)
    
    user.isLoggedIn = true
    user.userId = result.userId
    user.userName = result.userName
    user.avatar = result.avatarUrl || 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=user%20avatar%20icon%20orange%20simple&image_size=square'
    user.loginType = 'phone'
    user.createdAt = result.createdAt || ''
    user.lastLoginTime = new Date().toISOString()
    
    return true
  } catch (error) {
    throw error
  }
}

export function logout() {
  user.isLoggedIn = false
  user.userId = null
  user.userName = ''
  user.avatar = ''
  user.loginType = ''
  user.createdAt = ''
  user.lastLoginTime = null
}

export function isSessionValid() {
  if (!user.isLoggedIn || !user.lastLoginTime) {
    return false
  }
  const now = Date.now()
  const lastLogin = new Date(user.lastLoginTime).getTime()
  const diffDays = (now - lastLogin) / (1000 * 60 * 60 * 24)
  return diffDays <= EXPIRATION_DAYS
}

export function checkAndRefreshSession() {
  if (user.isLoggedIn && !isSessionValid()) {
    logout()
    return false
  }
  return user.isLoggedIn
}

// 手动重新初始化登录状态（用于确保状态正确）
export function reinitializeUserState() {
  const storedData = getStoredUserData()
  if (storedData) {
    Object.assign(user, storedData)
    console.log('手动重新初始化登录状态成功:', user.userName)
    return true
  }
  console.log('手动重新初始化登录状态失败')
  return false
}

export async function updateAvatar(avatarUrl) {
  if (user.isLoggedIn && user.userId) {
    try {
      await updateUserProfile(user.userId, { avatar_url: avatarUrl })
    } catch (error) {
      console.error('Failed to update avatar:', error)
    }
  }
  user.avatar = avatarUrl
}

export async function updateUsername(username) {
  if (user.isLoggedIn && user.userId) {
    try {
      await updateUserProfile(user.userId, { name: username })
    } catch (error) {
      console.error('Failed to update username:', error)
    }
  }
  user.userName = username
}

export function getVerificationCode(phone) {
  return supabaseGetCode(phone)
}

export function getUserInfo() {
  return { ...user }
}

export async function resetPassword(username, newPassword) {
  try {
    if (!username || username.length !== 11) {
      throw new Error('请输入正确的手机号')
    }
    if (!newPassword || newPassword.length === 0) {
      throw new Error('请输入新密码')
    }

    await supabaseResetPassword(username, newPassword)
    return true
  } catch (error) {
    throw error
  }
}
