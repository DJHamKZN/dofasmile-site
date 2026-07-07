# Cloud Functions (Yandex Cloud) — копии боевого кода

Деплой — вручную через консоль YC (каталог cloud-xamartur). Секреты в переменных окружения функций, в коде их нет.

- **lead-intake.py** — функция `d4eu57fg7pu1qticc1el`: приём заявок с сайта → Telegram + почта (Яндекс SMTP, включается переменной MAIL_PASSWORD) + журнал `leads/` в Object Storage. Env: TG_TOKEN, TG_CHATS, LEADS_BUCKET, MAIL_PASSWORD, MAIL_LOGIN, MAIL_TO.
- **crm-admin.py** — функция `d4ege0ishfegipqah4u2`: CRM-админка (PWA) — список заявок из бакета, статусы, комментарии, вход по паролю. Env: ADMIN_PASSWORD, LEADS_BUCKET.

При изменении кода в консоли — обновить копии здесь.
