<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-800 rounded-lg-custom shadow-sm p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('nav.user_management') }}
        </h2>
        <div class="flex items-center space-x-4">
          <!-- Search -->
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('common.search') + '...'"
              class="w-64 px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <MagnifyingGlassIcon class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      <!-- Access Denied for Non-Admin -->
      <div v-if="!authStore.isAdmin" class="text-center py-12">
        <ShieldExclamationIcon class="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">{{ t('auth.access_denied') }}</h3>
        <p class="text-gray-600 dark:text-gray-400">{{ t('auth.admin_only_feature') }}</p>
      </div>

      <!-- Users Table -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {{ t('auth.user') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {{ t('auth.role') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {{ t('auth.status') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {{ t('auth.last_login') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {{ t('auth.actions') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <!-- User Info -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img :src="user.avatar" :alt="user.name" class="w-10 h-10 rounded-full" />
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user.name }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</div>
                  </div>
                </div>
              </td>

              <!-- Role -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="{
                    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400': user.role === 'admin',
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400': user.role === 'user'
                  }"
                >
                  {{ t(`auth.role_${user.role}`) }}
                </span>
              </td>

              <!-- Status -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="{
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': user.status === 'active',
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400': user.status === 'inactive'
                  }"
                >
                  {{ t(`auth.status_${user.status}`) }}
                </span>
              </td>

              <!-- Last Login -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ formatDate(user.lastLogin) }}
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <!-- Toggle Status -->
                  <button
                    v-if="user.id !== authStore.user?.id"
                    @click="toggleStatus(user)"
                    class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors duration-200"
                  >
                    {{ user.status === 'active' ? t('auth.deactivate') : t('auth.activate') }}
                  </button>
                  
                  <!-- Edit -->
                  <button
                    @click="editUser(user)"
                    class="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors duration-200"
                  >
                    {{ t('common.edit') }}
                  </button>
                  
                  <!-- Delete -->
                  <button
                    v-if="user.id !== authStore.user?.id"
                    @click="deleteUser(user)"
                    class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors duration-200"
                  >
                    {{ t('common.delete') }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- No Users Found -->
        <div v-if="filteredUsers.length === 0" class="text-center py-12">
          <UsersIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 dark:text-gray-400">{{ t('auth.no_users_found') }}</p>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg-custom shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {{ t('auth.edit_user') }}
        </h3>
        
        <div class="space-y-4">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('auth.full_name') }}
            </label>
            <input
              v-model="editForm.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('auth.email') }}
            </label>
            <input
              v-model="editForm.email"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Role -->
          <div v-if="editForm.id !== authStore.user?.id">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('auth.role') }}
            </label>
            <select
              v-model="editForm.role"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="user">{{ t('auth.role_user') }}</option>
              <option value="admin">{{ t('auth.role_admin') }}</option>
            </select>
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="flex justify-end space-x-3 mt-6">
          <button
            @click="showEditModal = false"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            @click="saveUser"
            class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
          >
            {{ t('common.save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  MagnifyingGlassIcon,
  ShieldExclamationIcon,
  UsersIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  middleware: 'auth'
})

const { t } = useI18n()
const authStore = useAuthStore()

const searchQuery = ref('')
const showEditModal = ref(false)
const editForm = ref({})

// Get all users (only for admins)
const users = computed(() => {
  try {
    return authStore.isAdmin ? authStore.getAllUsers() : []
  } catch {
    return []
  }
})

// Filter users based on search query
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    user.username.toLowerCase().includes(query)
  )
})

// Format date for display
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Toggle user status
const toggleStatus = (user) => {
  try {
    authStore.toggleUserStatus(user.id)
  } catch (error) {
    console.error('Failed to toggle user status:', error)
  }
}

// Edit user
const editUser = (user) => {
  editForm.value = { ...user }
  showEditModal.value = true
}

// Save user changes
const saveUser = () => {
  try {
    authStore.updateUser(editForm.value.id, {
      name: editForm.value.name,
      email: editForm.value.email,
      role: editForm.value.role
    })
    showEditModal.value = false
  } catch (error) {
    console.error('Failed to update user:', error)
  }
}

// Delete user
const deleteUser = (user) => {
  if (confirm(t('auth.confirm_delete_user'))) {
    try {
      authStore.deleteUser(user.id)
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }
}
</script>