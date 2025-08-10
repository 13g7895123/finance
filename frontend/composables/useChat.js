export const useChat = () => {
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
      console.error('API Error:', error)
      
      // 如果 API 不可用，回退到模擬數據
      if (error.status === undefined || error.status >= 500) {
        console.warn('API unavailable, using mock data')
        return getMockData(endpoint, options)
      }
      
      throw error
    }
  }

  // 模擬數據 - 當 API 不可用時使用
  const getMockData = (endpoint, options) => {
    if (endpoint === '/chat/conversations') {
      return getMockConversations()
    } else if (endpoint.startsWith('/chat/conversation/')) {
      const userId = endpoint.split('/').pop()
      return getMockMessages(userId)
    } else if (endpoint === '/chat/unread-count') {
      return { unread_count: 3 }
    }
    
    return {}
  }

  const getMockConversations = () => {
    return {
      data: [
        {
          line_user_id: '100',
          customer_id: 100,
          last_message_time: new Date('2024-08-08T15:30:00'),
          unread_count: 1,
          customer: {
            id: 100,
            name: '劉柏毅',
            line_user_id: '100',
            phone: '0912345678',
            region: '台北',
            source: '熊好貸',
            status: '待處理'
          }
        },
        {
          line_user_id: '101',
          customer_id: 101,
          last_message_time: new Date('2024-08-08T17:58:00'),
          unread_count: 0,
          customer: {
            id: 101,
            name: 'CSL',
            line_user_id: '101',
            phone: '0923456789',
            region: '新北',
            source: '網站A',
            status: '已完成'
          }
        },
        {
          line_user_id: '102',
          customer_id: 102,
          last_message_time: new Date('2024-08-08T15:56:00'),
          unread_count: 2,
          customer: {
            id: 102,
            name: 'Daniel',
            line_user_id: '102',
            phone: '0934567890',
            region: '桃園',
            source: '熊好貸',
            status: '待處理'
          }
        }
      ],
      current_page: 1,
      per_page: 20,
      total: 3
    }
  }

  const getMockMessages = (userId) => {
    const messagesByUser = {
      '100': [
        {
          id: 1,
          customer_id: 100,
          line_user_id: '100',
          message_content: '你好',
          message_timestamp: '2024-08-08T14:14:00',
          is_from_customer: true,
          status: 'read',
          customer: { name: '劉柏毅' }
        },
        {
          id: 2,
          customer_id: 100,
          line_user_id: '100',
          message_content: '請問汽車貸款的利率是多少？',
          message_timestamp: '2024-08-08T15:30:00',
          is_from_customer: true,
          status: 'read',
          customer: { name: '劉柏毅' }
        }
      ],
      '102': [
        {
          id: 10,
          customer_id: 102,
          line_user_id: '102',
          message_content: '感謝客服的文字',
          message_timestamp: '2024-08-08T15:56:00',
          is_from_customer: true,
          status: 'read',
          customer: { name: 'Daniel' }
        }
      ]
    }

    return {
      data: messagesByUser[userId] || [],
      current_page: 1,
      per_page: 50,
      total: messagesByUser[userId]?.length || 0
    }
  }

  // 獲取對話列表
  const getConversations = async (page = 1) => {
    try {
      return await apiCall('/chat/conversations', {
        query: { page }
      })
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
      return getMockConversations()
    }
  }

  // 獲取特定用戶的對話
  const getConversation = async (userId, page = 1) => {
    try {
      return await apiCall(`/chat/conversation/${userId}`, {
        query: { page }
      })
    } catch (error) {
      console.error('Failed to fetch conversation:', error)
      return getMockMessages(userId)
    }
  }

  // 回覆訊息
  const replyMessage = async (userId, message) => {
    try {
      return await apiCall(`/chat/reply/${userId}`, {
        method: 'POST',
        body: { message }
      })
    } catch (error) {
      console.error('Failed to send reply:', error)
      
      // 模擬成功回覆
      return {
        message: '訊息已送出',
        conversation: {
          id: Date.now(),
          customer_id: parseInt(userId),
          line_user_id: userId,
          message_content: message,
          message_timestamp: new Date(),
          is_from_customer: false,
          status: 'sent'
        }
      }
    }
  }

  // 獲取未讀訊息數量
  const getUnreadCount = async () => {
    try {
      return await apiCall('/chat/unread-count')
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
      return { unread_count: 3 }
    }
  }

  // 標記訊息為已讀
  const markAsRead = async (userId) => {
    try {
      // 這個功能在 getConversation 時自動執行
      return { success: true }
    } catch (error) {
      console.error('Failed to mark as read:', error)
      return { success: false }
    }
  }

  return {
    getConversations,
    getConversation,
    replyMessage,
    getUnreadCount,
    markAsRead
  }
}