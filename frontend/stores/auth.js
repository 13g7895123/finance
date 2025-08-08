export const useAuthStore = defineStore('auth', () => {
  // 用戶狀態
  const user = ref(null)
  const isLoggedIn = computed(() => !!user.value)
  
  // 權限檢查
  const isDealer = computed(() => user.value?.role === roles.DEALER_EXECUTIVE)
  const isAdmin = computed(() => user.value?.role === roles.ADMIN_MANAGER)
  const isSales = computed(() => user.value?.role === roles.SALES_STAFF)
  
  // 檢查特定權限
  const hasPermission = (permission) => {
    if (!user.value) return false
    return user.value.permissions?.includes('all_access') || user.value.permissions?.includes(permission)
  }
  
  // 權限角色定義
  const roles = {
    DEALER_EXECUTIVE: 'dealer_executive', // 經銷商/公司高層
    ADMIN_MANAGER: 'admin_manager', // 行政人員/主管
    SALES_STAFF: 'sales_staff' // 業務人員
  }

  // 模擬用戶數據
  const mockUsers = ref([
    {
      id: 1,
      username: 'dealer01',
      email: 'dealer@example.com',
      password: 'dealer123',
      name: '經銷商王總',
      role: roles.DEALER_EXECUTIVE,
      avatar: 'https://ui-avatars.com/api/?name=王總&background=6366f1&color=fff',
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date(),
      status: 'active',
      permissions: ['all_access']
    },
    {
      id: 2,
      username: 'admin01',
      email: 'admin@example.com',
      password: 'admin123',
      name: '行政主管張經理',
      role: roles.ADMIN_MANAGER,
      avatar: 'https://ui-avatars.com/api/?name=張經理&background=22c55e&color=fff',
      createdAt: new Date('2024-01-15'),
      lastLogin: new Date(Date.now() - 86400000), // 1 day ago
      status: 'active',
      permissions: ['dashboard', 'customer_management', 'reports', 'chat', 'settings', 'user_management']
    },
    {
      id: 3,
      username: 'sales01',
      email: 'sales1@example.com',
      password: 'sales123',
      name: '業務員李小姐',
      role: roles.SALES_STAFF,
      avatar: 'https://ui-avatars.com/api/?name=李小姐&background=f97316&color=fff',
      createdAt: new Date('2024-02-01'),
      lastLogin: new Date(Date.now() - 172800000), // 2 days ago
      status: 'active',
      permissions: ['personal_customers', 'chat']
    },
    {
      id: 4,
      username: 'sales02',
      email: 'sales2@example.com',
      password: 'sales123',
      name: '業務員陳先生',
      role: roles.SALES_STAFF,
      avatar: 'https://ui-avatars.com/api/?name=陳先生&background=8b5cf6&color=fff',
      createdAt: new Date('2024-02-10'),
      lastLogin: new Date(Date.now() - 3600000), // 1 hour ago
      status: 'active',
      permissions: ['personal_customers', 'chat']
    }
  ])

  // 登入功能
  const login = async (credentials) => {
    try {
      // 模擬 API 延遲
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 查找用戶
      const foundUser = mockUsers.value.find(u => 
        (u.username === credentials.username || u.email === credentials.username) &&
        u.password === credentials.password
      )
      
      if (!foundUser) {
        throw new Error('用戶名或密碼錯誤')
      }
      
      if (foundUser.status === 'inactive') {
        throw new Error('帳戶已被停用')
      }
      
      // 更新最後登入時間
      foundUser.lastLogin = new Date()
      
      // 設定用戶資料 (不包含密碼)
      const { password, ...userWithoutPassword } = foundUser
      user.value = userWithoutPassword
      
      // 儲存到 localStorage
      if (process.client) {
        localStorage.setItem('admin-template-user', JSON.stringify(userWithoutPassword))
      }
      
      return { success: true, user: userWithoutPassword }
    } catch (error) {
      throw error
    }
  }

  // 註冊功能
  const register = async (userData) => {
    try {
      // 模擬 API 延遲
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 檢查用戶名和郵箱是否已存在
      const existingUser = mockUsers.value.find(u => 
        u.username === userData.username || u.email === userData.email
      )
      
      if (existingUser) {
        throw new Error('用戶名或郵箱已存在')
      }
      
      // 創建新用戶
      const newUser = {
        id: Math.max(...mockUsers.value.map(u => u.id)) + 1,
        username: userData.username,
        email: userData.email,
        password: userData.password,
        name: userData.name || userData.username,
        role: 'user',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || userData.username)}&background=6366f1&color=fff`,
        createdAt: new Date(),
        lastLogin: new Date(),
        status: 'active'
      }
      
      mockUsers.value.push(newUser)
      
      // 自動登入
      const { password, ...userWithoutPassword } = newUser
      user.value = userWithoutPassword
      
      // 儲存到 localStorage
      if (process.client) {
        localStorage.setItem('admin-template-user', JSON.stringify(userWithoutPassword))
      }
      
      return { success: true, user: userWithoutPassword }
    } catch (error) {
      throw error
    }
  }

  // 登出功能
  const logout = () => {
    user.value = null
    
    // 清除 localStorage
    if (process.client) {
      localStorage.removeItem('admin-template-user')
    }
    
    // 重定向到登入頁面
    navigateTo('/auth/login')
  }

  // 初始化用戶狀態
  const initializeAuth = () => {
    if (process.client) {
      const savedUser = localStorage.getItem('admin-template-user')
      if (savedUser) {
        try {
          user.value = JSON.parse(savedUser)
        } catch (error) {
          console.error('Failed to parse saved user data:', error)
          localStorage.removeItem('admin-template-user')
        }
      } else {
        // 開發環境自動登入 - 使用經銷商帳號以便檢視所有功能
        const devUser = mockUsers.value[0] // 經銷商王總
        user.value = { ...devUser }
        localStorage.setItem('admin-template-user', JSON.stringify(devUser))
        console.log('開發環境自動登入:', devUser.name)
      }
    }
  }

  // 用戶管理功能 (僅管理員)
  const getAllUsers = () => {
    if (!hasPermission('user_management')) {
      throw new Error('權限不足')
    }
    return mockUsers.value.map(({ password, ...user }) => user)
  }

  const updateUser = (userId, updates) => {
    if (!hasPermission('user_management') && user.value?.id !== userId) {
      throw new Error('權限不足')
    }
    
    const userIndex = mockUsers.value.findIndex(u => u.id === userId)
    if (userIndex === -1) {
      throw new Error('用戶不存在')
    }
    
    // 更新用戶資料
    Object.assign(mockUsers.value[userIndex], updates)
    
    // 如果更新的是當前用戶，同步更新 user 狀態
    if (user.value?.id === userId) {
      const { password, ...updatedUser } = mockUsers.value[userIndex]
      user.value = updatedUser
      
      if (process.client) {
        localStorage.setItem('admin-template-user', JSON.stringify(updatedUser))
      }
    }
    
    return mockUsers.value[userIndex]
  }

  const deleteUser = (userId) => {
    if (!hasPermission('user_management')) {
      throw new Error('權限不足')
    }
    
    if (user.value?.id === userId) {
      throw new Error('無法刪除自己的帳戶')
    }
    
    const userIndex = mockUsers.value.findIndex(u => u.id === userId)
    if (userIndex === -1) {
      throw new Error('用戶不存在')
    }
    
    mockUsers.value.splice(userIndex, 1)
    return true
  }

  const toggleUserStatus = (userId) => {
    if (!hasPermission('user_management')) {
      throw new Error('權限不足')
    }
    
    const userToUpdate = mockUsers.value.find(u => u.id === userId)
    if (!userToUpdate) {
      throw new Error('用戶不存在')
    }
    
    userToUpdate.status = userToUpdate.status === 'active' ? 'inactive' : 'active'
    return userToUpdate
  }

  return {
    // 狀態
    user: readonly(user),
    isLoggedIn,
    isAdmin,
    isDealer,
    isSales,
    mockUsers: readonly(mockUsers),
    roles,
    
    // 方法
    login,
    register,
    logout,
    initializeAuth,
    hasPermission,
    
    // 用戶管理
    getAllUsers,
    updateUser,
    deleteUser,
    toggleUserStatus
  }
})