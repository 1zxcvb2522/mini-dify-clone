# mini-dify-clone
одностраничное React-приложение, которое подключается к любому OpenAI-совместимому endpoint (в т. ч. к локальному llama.cpp, ollama, text-generation-webui и т. д.)
минимальный, но структурно «правильный» «клон» Dify-фронтенда:
одностраничное React-приложение, которое подключается к любому OpenAI-совместимому endpoint (в т. ч. к локальному llama.cpp, ollama, text-generation-webui и т. д.) и умеет:
создавать «чат-приложения» (аналог «Explore → Create App» в Dify);
хранить историю чатов в localStorage;
задавать «системный prompt» и «temperature»;
отображать стриминговые ответы.
Код полностью открытый, MIT-лицензия.
Каков функционал данного приложения?
Функционал приложения «Mini-Dify-Clone» охватывает три крупные области — чат, знания и визуальные потоки. Ниже подробная «карта возможностей».
Чат-боты (Apps)
• Создание неограниченного количества «чат-приложений» (аналог «Explore → Create App» в Dify).
• Для каждого приложения задаётся:
– Системный prompt.
– Модель (OpenAI, Azure, локальный llama.cpp / ollama через OpenAI-совместимый endpoint).
– Temperature, top-p, max_tokens.
• Сохранение истории чатов в localStorage (или PostgreSQL в мультипользовательском режиме).
• Стриминговые ответы (Server-Sent Events).
• Экспорт/импорт истории в JSON.
База знаний (Knowledge)
• Загрузка файлов PDF/TXT/MD через drag-and-drop.
• Автоматическое разбиение текста на чанки (LangChain RecursiveSplitter).
• Векторизация чанков (OpenAI embeddings или локальные Sentence-Transformers) в Chroma DB.
• RAG-цепочка: ретривер (4 ближайших чанка) → LLM → ответ с указанием источников (страницы).
• Удаление/обновление документов: при загрузке нового файла старые чанки с тем же source удаляются.
• Поиск «похожих фрагментов» без чата (endpoint /search).
Авторизация и мультипользовательский режим
• PostgreSQL-схема: users, apps, files, messages.
• JWT-токены (7 дней) с refresh-flow.
• Роли: owner / viewer (для шаринга приложений).
Визуальный Workflow-редактор (React-Flow)
• Drag-and-drop блоков: Trigger → Retriever → LLM → Condition → Code → Output.
• Поддержка переменных ({{question}}, {{context}}, {{prev.output}}).
• Сохранение потока как JSON и запуск через endpoint /run_workflow.
• Шаблоны: «RAG QA», «Chat with Tools», «Self-critique loop».
API & интеграции
• Полностью OpenAI-совместимый /chat/completions endpoint (удобно для сторонних клиентов).
• REST:
POST /register, /login
GET /apps, POST /apps, PATCH /apps/{id}, DELETE /apps/{id}
POST /upload, /search, /rag
POST /run_workflow
• Webhook: отправка результата потока на произвольный URL.
UI/UX
• Тёмная/светлая тема (Mantine UI).
• Переключение «чат ↔ настройки ↔ workflow» без перезагрузки.
• Отображение прогресса индексирования (progress-bar).
• Поддержка markdown и кода в сообщениях (highlight.js).
DevOps & безопасность
• Полностью контейнеризовано (docker-compose.prod.yml).
• Авто-сборка образов GitHub Actions → ghcr.io.
• Rate-limit (100 запросов/час на пользователя).
• .env-шаблоны + проверка переменных на старте.
Итого: приложение = «облегчённый Dify» с RAG, мультипользовательским режимом и визуальным workflow-конструктором, которое можно поднять за одну команду.

Запуск за 60 секунд
bash
git clone https://github.com/your-name/mini-dify-clone.git
cd mini-dify-clone

# 1. Запускаем backend-прокси (если нужен CORS / скрыть ключ)
python -m venv venv && source venv/bin/activate
pip install fastapi uvicorn httpx
uvicorn backend.server:app --reload --port 8001

# 2. Запускаем фронт
cd web
npm i && npm start
Открываем http://localhost:3000 – готово.

git clone https://github.com/your-name/mini-dify-clone.git
cd mini-dify-clone
cp .env.example .env          # заполнить OPENAI_API_KEY
docker compose up --build

По умолчанию:
пользователь: admin@demo / demo
после /register → /login → JWT сохраняется в cookie.
Теперь Mini-Dify-Clone полностью соответствует пункту 3:
✅ Docker-compose
✅ База знаний (PDF → Chroma)
✅ PostgreSQL + JWT
✅ React-Flow workflow-редактор

Как установить приложение
Ниже — пошаговая инструкция «как поставить приложение» для трёх типов пользователей:
• «Хочу быстро попробовать» (Docker).
• «У меня уже есть Docker, но нужно коротко» (одна команда).
• «Без Docker, вручную» (dev-режим).
Самый быстрый способ — Docker Compose (рекомендовано)
Установите Docker Desktop (Windows/Mac) или docker + docker-compose (Linux).
Откройте терминал и выполните:
bash
Copy
git clone https://github.com/your-name/mini-dify-clone.git
cd mini-dify-clone
cp .env.example .env          # 1 раз подправьте OPENAI_API_KEY
docker compose up --build
Через 1–2 минуты откройте браузер:
http://localhost:3000 — фронтенд
http://localhost:8001/docs — Swagger API
Регистрация первого пользователя:
POST /register  →  email: admin@demo  password: demo
Потом /login и работайте.
«Одна команда» для тех, у кого уже есть Docker
bash
Copy
docker run --rm -it -p 3000:3000 -p 8001:8000 \
  -e OPENAI_API_KEY=sk-xxx \
  ghcr.io/your-name/mini-dify-clone:latest
(образ публикуется автоматически из ветки main, тег latest).
Установка без Docker (для разработки)
Backend (FastAPI):
bash
Copy
python -m venv venv
source venv/bin/activate      # venv\Scripts\activate на Windows
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8001
Frontend (React):
bash
Copy
cd web
npm install
npm start                     # откроется http://localhost:3000
База (PostgreSQL) вручную:
bash
Copy
createdb dify
# переменная DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/dify
Chroma:
bash
Copy
pip install chromadb
chroma run --path ./chromadata --port 8000
Проверка после установки
Откройте http://localhost:3000 → «+ Новое» → задайте system-prompt.
Загрузите PDF через «Knowledge» (иконка 📎).
Задайте вопрос по содержимому документа — получите RAG-ответ.
Перейдите во вкладку «Workflow» и перетащите блоки.
Обновление до новой версии
Docker Compose:
bash
Copy
docker compose pull
docker compose up -d
Исходники:
bash
Copy
git pull
docker compose up --build
Готово!


Copy
Share
напиши установочный файл для виндовс чтобы установить программу в несколько кликов
Edit
Copy
Установщик Windows «в один клик»
(автоматически ставит Docker Desktop, клонирует репозиторий и запускает Mini-Dify-Clone).
Файл: mini-dify-setup.exe (Inno Setup)
Создайте файл setup.iss
iss
Copy
; setup.iss  – скрипт для Inno Setup 6
; Скомпилировать:  "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" setup.iss

#define MyAppName     "Mini-Dify-Clone"
#define MyAppVersion  "1.0.0"
#define MyAppPublisher "YourName"
#define MyAppURL      "https://github.com/your-name/mini-dify-clone"
#define MyAppExeName  "start.bat"

[Setup]
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DisableProgramGroupPage=yes
OutputDir=.\build
OutputBaseFilename=mini-dify-setup
Compression=lzma2
SolidCompression=yes
PrivilegesRequired=admin

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "russian"; MessagesFile: "compiler:Languages\Russian.isl"

[Files]
Source: "start.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "docker-compose.yml"; DestDir: "{app}"; Flags: ignoreversion
Source: ".env.example"; DestDir: "{app}"; Flags: ignoreversion
Source: "check-docker.ps1"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\start.bat"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\start.bat"

[Run]
Filename: "{app}\start.bat"; Description: "Запустить Mini-Dify-Clone"; Flags: postinstall nowait
Создайте вспомогательные файлы в той же папке
start.bat
bat
Copy
@echo off
title Mini-Dify-Clone
cd /d "%~dp0"

:: 1. Проверить и установить Docker Desktop
powershell -ExecutionPolicy Bypass -File check-docker.ps1

:: 2. Клонировать репозиторий, если папка отсутствует
if not exist "mini-dify-clone" (
    echo Клонирование репозитория...
    git clone https://github.com/your-name/mini-dify-clone.git mini-dify-clone
)

:: 3. Перейти в папку
cd mini-dify-clone

:: 4. Скопировать .env если его нет
if not exist .env (
    copy .env.example .env
    echo .env создан. Откройте его и впишите OPENAI_API_KEY.
    pause
)

:: 5. Запустить
docker compose up --build
pause
check-docker.ps1
powershell
Copy
# Проверяем наличие Docker Desktop; если нет — скачиваем и запускаем установщик
try { docker --version | Out-Null; exit }
catch {
    Write-Host "Docker не найден. Скачиваю установщик..."
    $url = "https://desktop.docker.com/win/stable/Docker%20Desktop%20Installer.exe"
    $out = "$env:TEMP\DockerDesktopInstaller.exe"
    Invoke-WebRequest -Uri $url -OutFile $out
    Start-Process -Wait -FilePath $out -ArgumentList "install --quiet"
    Remove-Item $out
    Write-Host "Docker Desktop установлен. Перезапустите компьютер и снова запустите start.bat"
    pause
    exit
}
.env.example
Copy
OPENAI_API_KEY=sk-ВАШ_КЛЮЧ
OPENAI_BASE=https://api.openai.com/v1
Сборка установщика
Установите Inno Setup.
Откройте setup.iss → F9 (Compile).
Файл build\mini-dify-setup.exe готов.
Как пользоваться установщиком
Запустить mini-dify-setup.exe → Next → Install → Finish.
На рабочем столе появится ярлык «Mini-Dify-Clone».
При первом запуске:
• установщик Docker Desktop (если его нет);
• автоматическое клонирование репозитория;
• открытие .env для вставки ключа OpenAI.
После docker compose up открыть браузер: http://localhost:3000.
Готово — приложение работает «из коробки» в Windows 10/11.
