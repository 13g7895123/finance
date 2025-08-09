<template>
  <div class="flex h-full bg-gray-50">
    <!-- 左側用戶列表 -->
    <div class="w-80 bg-white border-r border-gray-300 flex flex-col">
      <!-- 標題和篩選 -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 ">聊天室</h2>
          <button class="p-2 text-gray-500 hover:bg-gray-100  rounded-lg">
            <PlusIcon class="w-5 h-5" />
          </button>
        </div>
        
        <!-- 搜尋框 -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜尋用戶..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300  rounded-lg bg-white  text-gray-900  placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        <!-- 篩選按鈕 -->
        <div class="flex gap-2 mt-3">
          <button
            v-for="filter in filters"
            :key="filter.key"
            @click="activeFilter = filter.key"
            class="px-3 py-1 text-sm rounded-full transition-colors duration-200"
            :class="activeFilter === filter.key 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100  text-gray-700  hover:bg-gray-200 '"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <!-- 用戶列表 -->
      <div class="flex-1 overflow-y-auto">
        <ChatUserList
          :users="filteredUsers"
          :activeUserId="activeUserId"
          @userSelect="selectUser"
        />
      </div>
    </div>

    <!-- 右側聊天區域 -->
    <div class="flex-1 flex flex-col">
      <ChatMessageArea
        v-if="selectedUser"
        :user="selectedUser"
        :messages="currentMessages"
        @sendMessage="sendMessage"
      />
      
      <!-- 未選擇用戶時的預設畫面 -->
      <div v-else class="flex-1 flex items-center justify-center bg-gray-50">
        <div class="text-center">
          <ChatBubbleLeftRightIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-xl font-medium text-gray-900 mb-2">選擇聊天對象</h3>
          <p class="text-gray-500">從左側列表選擇要聊天的用戶開始對話</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon 
} from '@heroicons/vue/24/outline'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()

// 搜尋查詢
const searchQuery = ref('')

// 篩選選項
const filters = ref([
  { key: 'all', label: '所有訊息' },
  { key: 'unread', label: '未讀' },
  { key: 'favorites', label: '重要' },
  { key: 'archived', label: '封存' }
])

const activeFilter = ref('all')

// 選中的用戶
const activeUserId = ref(null)
const selectedUser = ref(null)

// 模擬用戶數據 - 根據權限過濾，包含更多 LINE BOT 對話記錄
const allUsers = ref([
  {
    id: 1,
    name: '經銷商王總',
    role: 'dealer_executive',
    avatar: 'https://ui-avatars.com/api/?name=王總&background=6366f1&color=fff',
    lastMessage: '請盡快處理這個案子',
    timestamp: new Date('2024-08-08T14:30:00'),
    unreadCount: 2,
    online: true,
    permissions: ['all_access']
  },
  {
    id: 2,
    name: '行政主管張經理',
    role: 'admin_manager',
    avatar: 'https://ui-avatars.com/api/?name=張經理&background=22c55e&color=fff',
    lastMessage: '今天的報表已經完成了',
    timestamp: new Date('2024-08-08T13:45:00'),
    unreadCount: 0,
    online: true,
    permissions: ['dashboard', 'customer_management', 'reports', 'chat', 'settings']
  },
  {
    id: 3,
    name: '業務員李小姐',
    role: 'sales_staff',
    avatar: 'https://ui-avatars.com/api/?name=李小姐&background=f97316&color=fff',
    lastMessage: '客戶已經確認合約內容',
    timestamp: new Date('2024-08-08T12:20:00'),
    unreadCount: 1,
    online: false,
    permissions: ['personal_customers', 'chat']
  },
  {
    id: 4,
    name: '業務員陳先生',
    role: 'sales_staff',
    avatar: 'https://ui-avatars.com/api/?name=陳先生&background=8b5cf6&color=fff',
    lastMessage: '明天可以安排會議嗎？',
    timestamp: new Date('2024-08-08T11:15:00'),
    unreadCount: 0,
    online: true,
    permissions: ['personal_customers', 'chat']
  },
  // LINE BOT 客戶對話記錄
  {
    id: 100,
    name: '劉柏毅',
    role: 'line_customer',
    avatar: 'https://ui-avatars.com/api/?name=劉&background=00C300&color=fff',
    lastMessage: '請問汽車貸款的利率是多少？',
    timestamp: new Date('2024-08-08T15:30:00'),
    unreadCount: 1,
    online: true,
    isBot: true,
    lineUserId: 'U123456789',
    customerInfo: {
      phone: '0912345678',
      region: '台北',
      source: '熊好貸',
      status: '待處理'
    }
  },
  {
    id: 101,
    name: 'CSL',
    role: 'line_customer',
    avatar: 'https://ui-avatars.com/api/?name=CSL&background=FF5722&color=fff',
    lastMessage: 'https://stickershop.line-scdn...',
    timestamp: new Date('2024-08-08T17:58:00'),
    unreadCount: 0,
    online: false,
    isBot: true,
    lineUserId: 'U987654321',
    customerInfo: {
      phone: '0923456789',
      region: '新北',
      source: '網站A',
      status: '已完成'
    }
  },
  {
    id: 102,
    name: 'Daniel',
    role: 'line_customer',
    avatar: 'https://ui-avatars.com/api/?name=Daniel&background=4CAF50&color=fff',
    lastMessage: '感謝客服的文字',
    timestamp: new Date('2024-08-08T15:56:00'),
    unreadCount: 2,
    online: true,
    isBot: true,
    lineUserId: 'U555666777',
    customerInfo: {
      phone: '0934567890',
      region: '桃園',
      source: '熊好貸',
      status: '待處理'
    }
  },
  {
    id: 103,
    name: '暴色水母',
    role: 'line_customer',
    avatar: 'https://ui-avatars.com/api/?name=暴&background=9C27B0&color=fff',
    lastMessage: 'ooo',
    timestamp: new Date('2024-08-08T15:27:00'),
    unreadCount: 0,
    online: false,
    isBot: true,
    lineUserId: 'U111222333',
    customerInfo: {
      phone: '0945678901',
      region: '台中',
      source: '網站B',
      status: '進行中'
    }
  },
  {
    id: 104,
    name: 'Miranda · 米...',
    role: 'line_customer',
    avatar: 'https://ui-avatars.com/api/?name=M&background=FF9800&color=fff',
    lastMessage: '',
    timestamp: new Date('2024-08-08T05:59:00'),
    unreadCount: 0,
    online: false,
    isBot: true,
    lineUserId: 'U444555666',
    customerInfo: {
      phone: '0956789012',
      region: '高雄',
      source: '網站A',
      status: '已完成'
    }
  },
  {
    id: 105,
    name: '晞晞',
    role: 'line_customer',
    avatar: 'https://ui-avatars.com/api/?name=晞&background=E91E63&color=fff',
    lastMessage: 'https://storage.googleapis.co...',
    timestamp: new Date('2024-07-08T05:59:00'),
    unreadCount: 0,
    online: false,
    isBot: true,
    lineUserId: 'U777888999',
    customerInfo: {
      phone: '0967890123',
      region: '台南',
      source: '熊好貸',
      status: '已完成'
    }
  }
])

// 根據權限過濾用戶列表
const filteredUsers = computed(() => {
  let users = allUsers.value

  // 權限過濾 - 業務人員只能看到自己相關的對話和BOT
  if (authStore.isSales && !authStore.hasPermission('all_access')) {
    users = users.filter(user => 
      user.id === authStore.user?.id || 
      user.isBot || 
      user.role === 'dealer_executive' ||
      user.role === 'admin_manager'
    )
  }

  // 搜尋過濾
  if (searchQuery.value.trim()) {
    users = users.filter(user =>
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // 狀態過濾
  switch (activeFilter.value) {
    case 'unread':
      users = users.filter(user => user.unreadCount > 0)
      break
    case 'favorites':
      users = users.filter(user => user.isFavorite)
      break
    case 'archived':
      users = users.filter(user => user.isArchived)
      break
  }

  return users.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
})

// 模擬訊息數據 - 包含豐富的 LINE BOT 對話記錄
const messages = ref({
  1: [
    {
      id: 1,
      senderId: 1,
      content: '請盡快處理這個案子',
      timestamp: new Date('2024-08-08T14:30:00'),
      type: 'text'
    },
    {
      id: 2,
      senderId: authStore.user?.id,
      content: '好的，我馬上處理',
      timestamp: new Date('2024-08-08T14:32:00'),
      type: 'text'
    }
  ],
  2: [
    {
      id: 3,
      senderId: 2,
      content: '今天的報表已經完成了',
      timestamp: new Date('2024-08-08T13:45:00'),
      type: 'text'
    }
  ],
  // 劉柏毅的 LINE BOT 對話
  100: [
    {
      id: 100,
      senderId: 100,
      content: '你好',
      timestamp: new Date('2024-08-08T14:14:00'),
      type: 'text',
      isBot: true,
      isCustomer: true
    },
    {
      id: 101,
      senderId: 'bot',
      content: '您好！歡迎來到熊好貸，我是您的專屬服務助手。請問您需要什麼貸款服務呢？',
      timestamp: new Date('2024-08-08T14:14:30'),
      type: 'text',
      isBot: true,
      isAutoReply: true
    },
    {
      id: 102,
      senderId: 100,
      content: '請問汽車貸款的利率是多少？',
      timestamp: new Date('2024-08-08T15:30:00'),
      type: 'text',
      isBot: true,
      isCustomer: true
    },
    {
      id: 103,
      senderId: 'bot',
      content: '汽車貸款利率依據您的信用狀況和車輛條件而定，一般在2.88%-15.75%之間。我們提供免費評估服務，請提供您的聯絡方式，專員將為您詳細說明。',
      timestamp: new Date('2024-08-08T15:30:15'),
      type: 'text',
      isBot: true,
      isAutoReply: true
    }
  ],
  // CSL 的 LINE BOT 對話
  101: [
    {
      id: 201,
      senderId: 101,
      content: 'https://stickershop.line-scdn.net/stickershop/v1/sticker/52002734/android/sticker.png',
      timestamp: new Date('2024-08-08T17:58:00'),
      type: 'sticker',
      isBot: true,
      isCustomer: true
    },
    {
      id: 202,
      senderId: 'bot',
      content: '感謝您的訊息！如有任何貸款需求或問題，歡迎隨時聯繫我們。',
      timestamp: new Date('2024-08-08T17:58:30'),
      type: 'text',
      isBot: true,
      isAutoReply: true
    }
  ],
  // Daniel 的 LINE BOT 對話
  102: [
    {
      id: 301,
      senderId: 102,
      content: '感謝客服的文字',
      timestamp: new Date('2024-08-08T15:56:00'),
      type: 'text',
      isBot: true,
      isCustomer: true
    },
    {
      id: 302,
      senderId: 'bot',
      content: '不客氣！很高興能為您服務。如果您有任何其他問題，請隨時告訴我們。',
      timestamp: new Date('2024-08-08T15:56:15'),
      type: 'text',
      isBot: true,
      isAutoReply: true
    },
    {
      id: 303,
      senderId: 102,
      content: 'ccc',
      timestamp: new Date('2024-08-08T14:15:00'),
      type: 'text',
      isBot: true,
      isCustomer: true
    },
    {
      id: 304,
      senderId: 102,
      content: 'ccc',
      timestamp: new Date('2024-08-08T14:16:00'),
      type: 'text',
      isBot: true,
      isCustomer: true
    },
    {
      id: 305,
      senderId: 102,
      content: 'vvv',
      timestamp: new Date('2024-08-08T14:18:00'),
      type: 'text',
      isBot: true,
      isCustomer: true
    },
    {
      id: 306,
      senderId: 102,
      content: 'vvv',
      timestamp: new Date('2024-08-08T14:26:00'),
      type: 'text',
      isBot: true,
      isCustomer: true
    }
  ],
  // 暴色水母的 LINE BOT 對話
  103: [
    {
      id: 401,
      senderId: 103,
      content: 'ooo',
      timestamp: new Date('2024-08-08T15:27:00'),
      type: 'text',
      isBot: true,
      isCustomer: true
    },
    {
      id: 402,
      senderId: 'bot',
      content: '您好！請問有什麼我可以協助您的嗎？我們提供汽車、機車、手機貸款等服務。',
      timestamp: new Date('2024-08-08T15:27:30'),
      type: 'text',
      isBot: true,
      isAutoReply: true
    }
  ],
  // 晞晞的 LINE BOT 對話
  105: [
    {
      id: 501,
      senderId: 105,
      content: 'https://storage.googleapis.com/line-bot/26VFC1752485624',
      timestamp: new Date('2024-07-08T05:59:00'),
      type: 'link',
      isBot: true,
      isCustomer: true
    },
    {
      id: 502,
      senderId: 'bot',
      content: '感謝您提供的資訊。我已經收到您的訊息，專員會盡快與您聯繫。',
      timestamp: new Date('2024-07-08T06:00:00'),
      type: 'text',
      isBot: true,
      isAutoReply: true
    }
  ]
})

// 當前聊天訊息
const currentMessages = computed(() => {
  if (!selectedUser.value) return []
  return messages.value[selectedUser.value.id] || []
})

// 選擇用戶
const selectUser = (user) => {
  selectedUser.value = user
  activeUserId.value = user.id
  
  // 標記為已讀
  if (user.unreadCount > 0) {
    user.unreadCount = 0
  }
}

// 發送訊息
const sendMessage = (content) => {
  if (!selectedUser.value || !content.trim()) return
  
  const newMessage = {
    id: Date.now(),
    senderId: authStore.user?.id,
    content: content.trim(),
    timestamp: new Date(),
    type: 'text'
  }
  
  if (!messages.value[selectedUser.value.id]) {
    messages.value[selectedUser.value.id] = []
  }
  
  messages.value[selectedUser.value.id].push(newMessage)
  
  // 更新最後訊息
  const userIndex = allUsers.value.findIndex(u => u.id === selectedUser.value.id)
  if (userIndex !== -1) {
    allUsers.value[userIndex].lastMessage = content.trim()
    allUsers.value[userIndex].timestamp = new Date()
  }
}

// 頁面標題
useHead({
  title: '聊天室 - 金融管理系統'
})
</script>

<style scoped>
/* 自定義滾動條 */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>