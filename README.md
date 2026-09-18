# Данил Александровский

Разработчик автоматизации · Санкт-Петербург · удалённо

Собираю инструменты, которые убирают ручную рутину: Telegram-боты, парсеры, интеграции,
n8n-конвейеры, LLM-агенты. Разработку веду с ИИ-ассистентами (Claude Code, Cursor) и
довожу результат до продакшена: тесты, Docker, деплой на VPS.

## Проекты

| Проект | Что делает | Стек |
|---|---|---|
| [hh-vacancy-monitor](https://github.com/aleksandrovskijdanil-sketch/hh-vacancy-monitor) | Монитор вакансий hh.ru: сбор по запросам, фильтры и пометка подозрительных, SQLite, Excel-отчёт со сводкой, Telegram-дайджест новых, сопроводительные письма через LLM | Python, requests, openpyxl, SQLite, Telegram Bot API |
| [tg-ai-support-bot](https://github.com/aleksandrovskijdanil-sketch/tg-ai-support-bot) | Бот первой линии поддержки: отвечает по базе знаний компании (markdown → BM25 → промпт), помнит диалог, передаёт оператору, антиспам, статистика | Python, aiogram 3, httpx, любой OpenAI-совместимый API, Docker |
| [n8n-lead-pipeline](https://github.com/aleksandrovskijdanil-sketch/n8n-lead-pipeline) | Конвейер заявок с сайта: вебхук → классификация LLM → Google Sheets → Telegram менеджеру → автоответ; устойчив к сбоям модели | n8n, JavaScript, Google Sheets, Telegram |

## Стек

**Python** · aiogram · requests / BeautifulSoup / Playwright · pandas / openpyxl · FastAPI · SQLite / SQL
**JavaScript / TypeScript** · Node.js · React / Next.js
**Автоматизация** · n8n · Make · Google Sheets API / Apps Script · Bitrix24
**LLM** · OpenAI API · Claude · промптинг, JSON-режим, RAG-lite
**Инфраструктура** · Git · Linux / VPS · Docker · systemd

## Контакты

Telegram: [@aledani1](https://t.me/aledani1) · Email: aleksandrovskijdanil@gmail.com
