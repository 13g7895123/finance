1. 專案進階說明
    - 前端為nuxt，後端laravel
    - 前端在frontend資料夾已有一個後台的樣板
    - 請ux-design-reviewer agent依據https://finance-dashboard.zeabur.app這個網站的功能，把它的功能，包含側邊欄等等，移植到當前frontend的樣板中
    - 側邊欄幫我多一個聊天室的項目，功能為如下
        * 有一個聊天頁面，左側為各使用者，需有權限區分，右側有系統與該使用者的每次對話內容，請參考/source/chat.jpg的中間與左側
        * 賴的部分為有一支機器人，使用者會與他對話，機器人需要記錄每一次使用者的對話，並存入資料庫中，最後顯示在後台的中
        * 簡單來說，就是系統與客人的對話透過LINE BOT機器人
2. 開發訴求
    - 先把前端頁面切出來(從網址移植到樣版的部分)
    - 前台的login並沒有，幫我補上，請ux-design-reviewer agent設計，frontend-ui-specialist agent實作功能
    - 後端的部分請先處理權限與使用者管理，請backend-architecture-revewer agent完成後，由frontend-ui-specialist agent串上前台
3. 請ux-design-reviewer agent與frontend-ui-specialist agent完成前端的功能
4. 幫我針對這個前後端的架構，於根目錄撰寫docker-compose項目，與github的持續部屬功能，docker-compose需留意把PORT全部寫入.env，並把對外的PORT統一放到最上面統一館臉，且不要有version那一行
5. 請完整移植其側邊欄的功能與dashboard的功能，並加入PROMT.md文件中第一點的第四個項目
6. 完成以下功能
    - 幫我隱藏footer
    - 右側的底色請與參考的範例一樣改為亮色系
    - 幫我接上這個git，"https://github.com/13g7895123/finance.git"
    - 完成後執行add commit push，記得不要加上「Generated with Claude Code」的標記
7. docker 建置過程出現這個錯誤，"target frontend: failed to solve: target stage "development" could not be found"
8. 請參考 1.3的網站，右側為亮色系，請ux-design-reviewer agent調整設計並由frontend-ui-specialist agent執行，另外收折後會跑版，請兩位agent配合修復
9. 後端的部分請先處理權限與使用者管理，請backend-architecture-revewer agent完成後，由frontend-ui-specialist agent串上前台
10. 剛剛的TODO到這裡"參考網站設計連合運用ux-design-reviewer agent 調整並由 frontend-ui-specialist agent實作，修復收折跃版問題
11. 我發現你越修越大洞了，現在主要內容也跑版了，幫我復原原先的code，並隱藏 Collapse Toggle 的按鈕
12. 確認側邊欄的功能列與https://finance-dashboard.zeabur.app這個網站的側邊欄列表一樣
13. 右側的內容底色請參照https://finance-dashboard.zeabur.app這個網站的右側配色
14. 側邊欄要有儀表板、案件管理、業務管理、網站設定、統計報表這幾個項目，你TMD到底行不行
15. 右側內容目前底色可以了，但是文字請幫我用對比色高一點的深色顯示
16. 實作以下功能
    - 幫我為這個網站做一個404的頁面
    - 側邊欄的登出幫我用高對比度的顏色
    - 側邊欄還是沒有東西，請幫我完整檢查一遍
17. 登入頁面幫我用亮色系，另外修復登入按鈕會出現這個錯誤，"Uncaught (in promise) TypeError: can't access property "toString", value is undefined"
18. 完成以下功能
    - 移除亮暗色的功能，右側請用亮色，左側請保持灰底與亮色字體的內容
    - Dashboard移除歡迎回來的部分
    - 執行add commit push，記得不要加上「Generated with Claude Code」的標記