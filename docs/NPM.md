# NPM (Nginx Proxy Manager) 本地環境配置

## 概述

本文檔說明如何正確配置 Nginx Proxy Manager (NPM) 來實現本地域名 `npm.local` 的訪問。

## 重要說明

**Point 58 的錯誤修正：**
原先錯誤地將應用程式內部的 localhost 配置改為 npm.local，這是不正確的做法。正確的方式是：
- 應用程式內部配置仍使用 localhost 
- NPM 負責將外部域名代理到內部 localhost 端口

## 正確的配置方法

### 1. 系統 Hosts 配置
首先確保 `/etc/hosts` 文件已正確配置：
```
127.0.0.1 npm.local
```

### 2. Docker 網路配置
確認 docker-compose.yml 中的網路設定：
```yaml
networks:
  crm-network:
    driver: bridge
  npm_network:
    external: true
```

### 3. NPM 代理設定

在 Nginx Proxy Manager 的管理界面中配置代理主機：

#### 前端代理設定
- **域名：** `npm.local`
- **方案：** `http`
- **轉發主機/IP：** `frontend` (Docker 服務名稱)
- **轉發端口：** `3000`

#### API 代理設定  
- **域名：** `npm.local`
- **方案：** `http` 
- **路徑：** `/api/*`
- **轉發主機/IP：** `backend` (Docker 服務名稱)
- **轉發端口：** `8000`

### 4. 應用程式配置保持不變

重要：應用程式內部配置應保持 localhost，不需要修改：

#### .env 檔案
```env
APP_URL=http://localhost:8000
NUXT_API_BASE_URL=http://localhost:8000/api
```

#### nuxt.config.ts
```typescript
runtimeConfig: {
  public: {
    apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api'
  }
}
```

#### composables 中的 API 配置
所有 composable 檔案中的 baseURL 都保持使用 localhost：
```javascript
baseURL: config.public.apiBase || 'http://localhost:8000/api'
```

## 工作原理

1. 用戶訪問 `npm.local` 
2. DNS/hosts 將 `npm.local` 解析到 `127.0.0.1`
3. NPM 接收請求並根據路徑代理：
   - `/api/*` → backend:8000
   - `/*` → frontend:3000  
4. 容器間通過 Docker 網路進行內部通訊

## 驗證設定

### 確認 NPM 容器運行
```bash
docker ps | grep nginx-proxy-manager
```

### 測試連通性
```bash
# 測試前端
curl -I http://npm.local

# 測試 API
curl -I http://npm.local/api
```

### 檢查容器網路
```bash
docker network inspect npm_network
```

## 故障排除

### 常見問題
1. **503 錯誤：** 檢查目標容器是否運行
2. **域名無法解析：** 確認 hosts 檔案設定
3. **API 請求失敗：** 檢查代理路徑設定

### 日誌查看
```bash
# NPM 容器日誌
docker logs nginx-proxy-manager

# 專案容器日誌  
docker-compose logs frontend
docker-compose logs backend
```

## 總結

正確的 NPM 配置方式是讓 NPM 作為反向代理，將外部域名映射到內部服務，而不是修改應用程式的內部配置。這樣可以保持程式碼的可移植性，同時實現本地域名訪問的需求。