# Yandex Cloud Function d4eu57fg7pu1qticc1el — приёмник заявок с сайта
# POST name/phone/form/page → Telegram (TG_TOKEN, TG_CHATS), почта (MAIL_PASSWORD,
# MAIL_LOGIN, MAIL_TO — включается при наличии MAIL_PASSWORD), журнал в Object Storage (LEADS_BUCKET).
# Копия боевого кода из консоли YC, 2026-07-07.
import json, os, urllib.parse, urllib.request, datetime

TG_TOKEN = os.environ["TG_TOKEN"]
TG_CHATS = [c.strip() for c in os.environ.get("TG_CHATS", "").split(",") if c.strip()]

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

def handler(event, context):
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}
    body = event.get("body") or ""
    if event.get("isBase64Encoded"):
        import base64
        body = base64.b64decode(body).decode("utf-8", "replace")
    p = {k: v[0] for k, v in urllib.parse.parse_qs(body).items()}
    name  = p.get("name", "")[:200].strip()
    phone = p.get("phone", "")[:50].strip()
    form  = p.get("form", "")[:200].strip()
    page  = p.get("page", "")[:300].strip()
    digits = "".join(ch for ch in phone if ch.isdigit())
    if not name or len(digits) < 10:
        return {"statusCode": 400, "headers": CORS, "body": "bad request"}
    now = datetime.datetime.utcnow() + datetime.timedelta(hours=3)
    ts = now.strftime("%d.%m.%Y %H:%M")
    text = (f"\U0001F9B7 Новая заявка с сайта ДОФА СМАЙЛ\n\n"
            f"Имя: {name}\nТелефон: {phone}\nФорма: {form}\n"
            f"Страница: {page}\nВремя (МСК): {ts}")
    ok = 0
    for chat in TG_CHATS:
        for attempt in range(3):
            try:
                req = urllib.request.Request(
                    f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage",
                    data=json.dumps({"chat_id": chat, "text": text}).encode(),
                    headers={"Content-Type": "application/json"})
                urllib.request.urlopen(req, timeout=10)
                ok += 1
                break
            except Exception as ex:
                print(f"TG send failed (chat {chat}, attempt {attempt+1}): {ex}")
    # дубль на почту (Яндекс SMTP), включается при наличии MAIL_PASSWORD
    try:
        mp = os.environ.get("MAIL_PASSWORD")
        if mp:
            import smtplib
            from email.mime.text import MIMEText
            from email.header import Header
            login = os.environ.get("MAIL_LOGIN", "Dofasmile@yandex.ru")
            msg = MIMEText(text, "plain", "utf-8")
            msg["Subject"] = Header(f"Заявка с сайта: {name}, {phone}", "utf-8")
            msg["From"] = login
            msg["To"] = os.environ.get("MAIL_TO", login)
            sm = smtplib.SMTP_SSL("smtp.yandex.ru", 465, timeout=10)
            sm.login(login, mp)
            sm.send_message(msg)
            sm.quit()
    except Exception:
        pass
    # журнал заявок в Object Storage (первичная запись в РФ)
    try:
        import boto3
        s3 = boto3.client("s3", endpoint_url="https://storage.yandexcloud.net")
        key = f"leads/{now.strftime('%Y/%m')}/{now.strftime('%Y%m%d-%H%M%S')}-{digits[-4:]}.json"
        s3.put_object(Bucket=os.environ["LEADS_BUCKET"], Key=key,
                      Body=json.dumps({"ts": ts, "name": name, "phone": phone,
                                       "form": form, "page": page}, ensure_ascii=False).encode())
    except Exception:
        pass
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True, "tg": ok})}
