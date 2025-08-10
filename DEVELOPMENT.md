# Finance CRM - 開發指南

## 本地開發環境設置

本專案支援兩種運行模式：開發模式和生產模式。

### 開發模式 (推薦用於本地開發)

開發模式提供熱重載、即時更新和調試功能，適合本地開發使用。

```bash
# 啟動開發環境
./dev.sh

# 或者手動執行
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

**開發模式特色：**
- 前端：使用 `npm run dev` 啟動，支援熱重載
- 後端：Laravel 開啟 debug 模式
- 檔案監控：代碼變更即時反映
- 快速重建：只需重建變更的部分

### 生產模式

生產模式用於部署或測試最終產品。

```bash
# 啟動生產環境
./prod.sh

# 或者手動執行
docker-compose up --build -d
```

**生產模式特色：**
- 前端：編譯後的靜態檔案
- 後端：Laravel 優化設定
- 效能優化：最佳化載入速度
- 背景執行：使用 -d 參數

## 端口配置

| 服務 | 開發模式端口 | 生產模式端口 | 說明 |
|------|-------------|-------------|------|
| 前端 | 3000 | 3000 | Nuxt.js 應用程式 |
| 後端 | 9219 | 9219 | Laravel API |
| 資料庫 | 3306 | 3306 | MySQL |
| Redis | 6379 | 6379 | 快取服務 |
| phpMyAdmin | 8080 | 8080 | 資料庫管理 |
| HMR | 24678 | - | 熱模組替換 (僅開發模式) |

## 檔案結構

```
finance/
├── dev.sh                    # 開發環境啟動腳本
├── prod.sh                   # 生產環境啟動腳本  
├── docker-compose.yml        # 基礎 Docker 配置
├── docker-compose.dev.yml    # 開發環境覆蓋配置
├── frontend/                 # Nuxt.js 前端
│   ├── nuxt.config.ts       # Nuxt 配置（含開發設定）
│   └── Dockerfile           # 多階段建構 Dockerfile
└── backend/                  # Laravel 後端
    └── Dockerfile           # Laravel Dockerfile
```

## 開發流程

1. **啟動開發環境**
   ```bash
   ./dev.sh
   ```

2. **訪問應用程式**
   - 前端：http://localhost:3000
   - 後端 API：http://localhost:9219/api
   - phpMyAdmin：http://localhost:8080

3. **開發過程**
   - 修改前端代碼：自動熱重載
   - 修改後端代碼：容器內即時更新
   - 資料庫操作：使用 phpMyAdmin

4. **停止環境**
   ```bash
   Ctrl+C  # 停止並返回終端
   ```

## 環境變數

開發環境會自動設定以下環境變數：

- `NODE_ENV=development` - Node.js 開發模式
- `APP_ENV=local` - Laravel 本地環境
- `APP_DEBUG=true` - 開啟 Laravel 調試
- `NUXT_PUBLIC_API_BASE` - API 基礎 URL

## 故障排除

### 前端無法連接後端
檢查 `nuxt.config.ts` 中的 `apiBase` 設定是否正確：
```typescript
apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:9219/api'
```

### 熱重載不工作
1. 確認使用開發模式啟動：`./dev.sh`
2. 檢查 HMR 端口 (24678) 是否被佔用
3. 重建容器：`docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build`

### 端口衝突
修改 `.env` 檔案中的端口配置：
```env
FRONTEND_PORT=3000
BACKEND_PORT=9219
DATABASE_PORT=3306
```

## 建議開發工具

- **IDE**: VS Code 或 PhpStorm
- **瀏覽器**: Chrome DevTools 或 Firefox Developer Tools  
- **API 測試**: Postman 或 Insomnia
- **資料庫**: phpMyAdmin (已整合) 或 MySQL Workbench

## 注意事項

- 開發模式會掛載本地檔案，變更會即時反映
- 生產模式會複製檔案到容器內，需重建才能看到變更
- 使用 `.gitignore` 排除開發相關檔案的提交
- 資料庫檔案會持久化儲存在 Docker volumes 中