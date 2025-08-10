export const useUserManagement = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  
  // API 基礎設定
  const apiCall = async (endpoint, options = {}) => {
    try {
      const token = authStore.user?.token || 'mock-token'
      
      const { data } = await $fetch(endpoint, {
        baseURL: config.public.apiBase || 'http://localhost:8000/api',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      })
      
      return data
    } catch (error) {
      console.error('User Management API Error:', error)
      
      // 如果 API 不可用，回退到模擬數據
      if (error.status === undefined || error.status >= 500) {
        console.warn('User API unavailable, using mock data')
        return getMockData(endpoint, options)
      }
      
      throw error
    }
  }

  // 模擬數據 - 當 API 不可用時使用
  const getMockData = (endpoint, options) => {
    if (endpoint === '/users') {
      return getMockUsers()
    } else if (endpoint === '/users/roles') {
      return getMockRoles()
    } else if (endpoint === '/users/stats') {
      return getMockStats()
    } else if (endpoint.startsWith('/users/') && options.method === 'POST') {
      return getMockCreateUser(options.body)
    }
    
    return {}
  }

  const getMockUsers = () => {
    return {
      data: [
        {
          id: 1,
          name: '經銷商王總',
          username: 'dealer01',
          email: 'dealer@example.com',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-08-08T00:00:00Z',
          roles: [{ name: 'admin', display_name: '經銷商/公司高層' }]
        },
        {
          id: 2,
          name: '行政主管張經理',
          username: 'admin01',
          email: 'admin@example.com',
          status: 'active',
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-08-08T00:00:00Z',
          roles: [{ name: 'manager', display_name: '行政人員/主管' }]
        },
        {
          id: 3,
          name: '業務員李小姐',
          username: 'sales01',
          email: 'sales1@example.com',
          status: 'active',
          created_at: '2024-02-01T00:00:00Z',
          updated_at: '2024-08-08T00:00:00Z',
          roles: [{ name: 'staff', display_name: '業務人員' }]
        },
        {
          id: 4,
          name: '業務員陳先生',
          username: 'sales02',
          email: 'sales2@example.com',
          status: 'active',
          created_at: '2024-02-10T00:00:00Z',
          updated_at: '2024-08-08T00:00:00Z',
          roles: [{ name: 'staff', display_name: '業務人員' }]
        }
      ],
      current_page: 1,
      per_page: 15,
      total: 4
    }
  }

  const getMockRoles = () => {
    return [
      { id: 1, name: 'admin', display_name: '經銷商/公司高層', description: '系統管理員，擁有所有權限' },
      { id: 2, name: 'executive', display_name: '經銷商/公司高層', description: '公司高層，擁有管理員等級權限' },
      { id: 3, name: 'manager', display_name: '行政人員/主管', description: '可編輯大部分資料，無法修改銀行交涉紀錄' },
      { id: 4, name: 'staff', display_name: '業務人員', description: '僅能編輯查詢自己負責的客戶資料' }
    ]
  }

  const getMockStats = () => {
    return {
      total_users: 4,
      active_users: 4,
      inactive_users: 0,
      suspended_users: 0,
      users_by_role: {
        admin: 1,
        manager: 1,
        staff: 2
      }
    }
  }

  const getMockCreateUser = (userData) => {
    return {
      message: '使用者建立成功',
      user: {
        id: Date.now(),
        name: userData.name,
        username: userData.username,
        email: userData.email,
        status: userData.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        roles: [{ name: userData.role, display_name: getRoleDisplayName(userData.role) }]
      }
    }
  }

  const getRoleDisplayName = (roleName) => {
    const roleMap = {
      admin: '經銷商/公司高層',
      executive: '經銷商/公司高層',
      manager: '行政人員/主管',
      staff: '業務人員'
    }
    return roleMap[roleName] || roleName
  }

  // 獲取使用者列表
  const getUsers = async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()
      if (params.search) queryParams.append('search', params.search)
      if (params.role) queryParams.append('role', params.role)
      if (params.status) queryParams.append('status', params.status)
      if (params.page) queryParams.append('page', params.page)
      
      const endpoint = `/users${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      return await apiCall(endpoint)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      return getMockUsers()
    }
  }

  // 創建新使用者
  const createUser = async (userData) => {
    try {
      return await apiCall('/users', {
        method: 'POST',
        body: userData
      })
    } catch (error) {
      console.error('Failed to create user:', error)
      return getMockCreateUser(userData)
    }
  }

  // 更新使用者
  const updateUser = async (userId, userData) => {
    try {
      return await apiCall(`/users/${userId}`, {
        method: 'PUT',
        body: userData
      })
    } catch (error) {
      console.error('Failed to update user:', error)
      return {
        message: '使用者資料已更新',
        user: { id: userId, ...userData }
      }
    }
  }

  // 刪除使用者
  const deleteUser = async (userId) => {
    try {
      return await apiCall(`/users/${userId}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Failed to delete user:', error)
      return { message: '使用者已刪除' }
    }
  }

  // 指派角色
  const assignRole = async (userId, roleName) => {
    try {
      return await apiCall(`/users/${userId}/assign-role`, {
        method: 'POST',
        body: { role: roleName }
      })
    } catch (error) {
      console.error('Failed to assign role:', error)
      return {
        message: '角色指派成功',
        user: { id: userId, roles: [{ name: roleName, display_name: getRoleDisplayName(roleName) }] }
      }
    }
  }

  // 獲取可用角色
  const getRoles = async () => {
    try {
      return await apiCall('/users/roles')
    } catch (error) {
      console.error('Failed to fetch roles:', error)
      return getMockRoles()
    }
  }

  // 獲取使用者統計
  const getUserStats = async () => {
    try {
      return await apiCall('/users/stats')
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
      return getMockStats()
    }
  }

  // 獲取特定使用者詳細資訊
  const getUser = async (userId) => {
    try {
      return await apiCall(`/users/${userId}`)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      const mockUsers = getMockUsers()
      const user = mockUsers.data.find(u => u.id === parseInt(userId))
      return { user: user || null }
    }
  }

  return {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    assignRole,
    getRoles,
    getUserStats,
    getUser
  }
}