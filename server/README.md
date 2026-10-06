# Sword AI Content Fastify Server

Fastify бэкенд и стриминг-прокси для Sword AI Reels Intelligence.

## 🚀 Возможности
- **Прямой стриминг медиапотоков**: `/api/proxy/video` и `/api/proxy/audio` с поддержкой Range-запросов (HTTP 206 Partial Content), подстановкой заголовков `Referer` и `User-Agent` для платформ TikTok и Instagram.
- **Предотвращение 403 Forbidden**: браузер получает чистый поток со всеми CORS-заголовками (`Access-Control-Allow-Origin: *`, `Cross-Origin-Resource-Policy: cross-origin`).
- **Тренды рилсов**: `/api/reels/trends` с пагинацией (infinite scroll) и фильтрацией по платформам (TikTok/Instagram), нишам, странам и континентам.
- **Динамический резолвер**: `/api/reels/resolve` для получения оригинального видео и аудио с платформ без моковых файлов.
- **Поиск музыки**: `/api/music/search` для сопоставления аудиодорожек с превью.
- **Отсутствие локальных медиа**: в репозитории не хранится ни одного видео/аудио файла.

---

## 🛠 Локальный запуск (Development)

```bash
cd server
npm install
npm run dev
```

Сервер запустится на `http://localhost:3001`.
Проверка работоспособности: `http://localhost:3001/api/health`

---

## 🌐 Бесплатный деплой в облако (Production)

### Вариант 1: Render.com (Бесплатно)
1. Зарегистрируйтесь на [Render.com](https://render.com/).
2. Нажмите **New +** -> **Web Service**.
3. Подключите ваш репозиторий GitHub: `https://github.com/IFraimG/sword-ai-content`.
4. Укажите параметры:
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Instance Type**: `Free`
5. Нажмите **Create Web Service**.
6. Скопируйте полученный URL (например `https://sword-ai-content-api.onrender.com`) и укажите его в `.env.production` фронтенда:
   ```bash
   VITE_API_URL="https://sword-ai-content-api.onrender.com"
   ```

---

### Вариант 2: Railway.app (Бесплатно)
1. Зарегистрируйтесь на [Railway.app](https://railway.app/).
2. Нажмите **New Project** -> **Deploy from GitHub repo**.
3. Выберите репозиторий `sword-ai-content`.
4. В настройках сервиса в поле **Root Directory** укажите `server`.
5. Нажмите **Generate Domain** для получения публичного HTTPS URL.

---

### Вариант 3: Docker (Самостоятельный хостинг / VPS)
```bash
docker build -t sword-ai-server ./server
docker run -d -p 3001:3001 --name sword-server sword-ai-server
```
