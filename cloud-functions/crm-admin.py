# Yandex Cloud Function d4ege0ishfegipqah4u2 — CRM-админка заявок (PWA)
# GET → HTML-оболочка; POST action=login/list/update. Заявки — leads/*.json в LEADS_BUCKET.
# Env: ADMIN_PASSWORD, LEADS_BUCKET. Копия боевого кода из консоли YC, 2026-07-07.
import json, os, hashlib, urllib.parse, base64, html, datetime

STATUSES = ["новый", "позвонили", "записан", "пришёл", "отказ", "спам"]

def s3():
    import boto3
    return boto3.client("s3", endpoint_url="https://storage.yandexcloud.net")

def token(pw):
    return hashlib.sha256(("dofa-crm-2026|" + pw).encode()).hexdigest()

def hdr(event, name):
    h = event.get("headers") or {}
    for k, v in h.items():
        if k.lower() == name.lower(): return v
    return ""

def resp(code, body, ctype="application/json"):
    return {"statusCode": code, "headers": {"Content-Type": ctype + "; charset=utf-8", "Cache-Control": "no-store"}, "body": body}

def rows_html(c, bucket):
    keys = []
    kw = {"Bucket": bucket, "Prefix": "leads/"}
    while True:
        r = c.list_objects_v2(**kw)
        keys += [o["Key"] for o in r.get("Contents", [])]
        if not r.get("IsTruncated"): break
        kw["ContinuationToken"] = r["NextContinuationToken"]
    keys.sort(reverse=True)
    rows = []
    for k in keys[:300]:
        try:
            rec = json.loads(c.get_object(Bucket=bucket, Key=k)["Body"].read())
        except Exception:
            continue
        st = rec.get("status", "новый")
        opts = "".join(f'<option value="{s}" {"selected" if s==st else ""}>{s}</option>' for s in STATUSES)
        digits = "".join(ch for ch in rec.get("phone", "") if ch.isdigit())
        rows.append(f"""<tr>
<td style="white-space:nowrap">{html.escape(rec.get('ts',''))}</td>
<td>{html.escape(rec.get('name',''))}</td>
<td style="white-space:nowrap"><a class="tel" href="tel:+{digits}">{html.escape(rec.get('phone',''))}</a></td>
<td>{html.escape(rec.get('form',''))}</td>
<td><select class="s-{st}" onchange="upd(this,'{k}','status',this.value)">{opts}</select><span class="saved">&#10003;</span></td>
<td><input type="text" value="{html.escape(rec.get('comment',''))}" placeholder="комментарий"
 onchange="upd(this,'{k}','comment',this.value)"><span class="saved">&#10003;</span></td>
</tr>""")
    body = "".join(rows) or '<tr><td colspan="6">Заявок пока нет</td></tr>'
    return len(keys), body

SHELL = """<!doctype html><html lang="ru"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<link rel="manifest" href="?asset=manifest">
<meta name="theme-color" content="#0b0b0d">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="ДОФА CRM">
<link rel="apple-touch-icon" href="https://dofa-site.website.yandexcloud.net/crm-icon-192.png">
<title>Заявки ДОФА СМАЙЛ</title>
<style>
body{background:#0b0b0d;color:#e8e8ea;font:14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;margin:0;padding:24px}
h1{font-size:18px;margin:0 0 16px}
table{border-collapse:collapse;width:100%;font-size:13px}
th,td{padding:8px 10px;border-bottom:1px solid #26262b;text-align:left;vertical-align:top}
th{color:#8a8a92;font-weight:600;text-transform:uppercase;font-size:10px;letter-spacing:.06em}
tr:hover td{background:#141419}
select,input[type=text],input[type=password]{background:#141419;color:#e8e8ea;border:1px solid #333;border-radius:8px;padding:7px 10px;font:inherit}
input[type=text]{width:200px}
.s-новый{color:#4d8dff}.s-позвонили{color:#e8b93c}.s-записан{color:#3ccf6e}.s-пришёл{color:#3ccf6e;font-weight:700}.s-отказ{color:#e05555}.s-спам{color:#6a6a72;text-decoration:line-through}
button{background:#0047AB;color:#fff;border:0;border-radius:8px;padding:9px 18px;font:inherit;cursor:pointer}
.saved{color:#3ccf6e;font-size:11px;margin-left:6px;opacity:0;transition:opacity .3s}
.badge{display:inline-block;background:#141419;border:1px solid #26262b;border-radius:20px;padding:2px 10px;font-size:11px;color:#8a8a92;margin-left:8px}
.login{max-width:320px;margin:80px auto;text-align:center}.login input{width:100%;box-sizing:border-box;margin:0 0 12px}
a.tel{color:#e8e8ea;text-decoration:none;font-weight:600}
.err{color:#e05555;font-size:12px;min-height:16px}
.logout{float:right;font-size:12px;color:#8a8a92;cursor:pointer;background:none;border:1px solid #333;padding:6px 12px}
</style></head><body>
<div id="app"><div class="login"><h1>Заявки ДОФА СМАЙЛ</h1>
<form onsubmit="return login(event)"><input id="pw" type="password" placeholder="Пароль" autofocus>
<div class="err" id="err"></div><button style="width:100%">Войти</button></form></div></div>
<script>
var T=localStorage.getItem('dfauth')||'';
function api(params,body){return fetch('?'+params,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','X-Auth':T},body:body||''})}
function login(e){e.preventDefault();
  fetch('?action=login',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'password='+encodeURIComponent(document.getElementById('pw').value)})
  .then(r=>r.json()).then(d=>{if(d.token){T=d.token;localStorage.setItem('dfauth',T);load()}else{document.getElementById('err').textContent='Неверный пароль'}});
  return false}
function logout(){localStorage.removeItem('dfauth');location.reload()}
function load(){api('action=list').then(r=>{if(r.status===401){logout();return}return r.json()}).then(d=>{if(!d)return;
  document.getElementById('app').innerHTML='<h1>Заявки с сайта ДОФА СМАЙЛ <span class="badge">'+d.n+' всего</span>'+
  '<button class="logout" onclick="logout()">Выйти</button></h1>'+
  '<table><tr><th>Дата (МСК)</th><th>Имя</th><th>Телефон</th><th>Форма</th><th>Статус</th><th>Комментарий</th></tr>'+d.rows+'</table>'})}
function upd(el,key,field,value){var b=new URLSearchParams();b.set('key',key);b.set(field,value);
  api('action=update',b.toString()).then(r=>r.json()).then(()=>{var s=el.nextElementSibling;s.style.opacity=1;
  setTimeout(function(){s.style.opacity=0},1200);if(field==='status')el.className='s-'+value;});}
document.addEventListener('visibilitychange',function(){if(!document.hidden&&T)load()});window.addEventListener('pageshow',function(){if(T)load()});if(T)load();setInterval(function(){if(!T)return;var a=document.activeElement;if(a&&(a.tagName==='INPUT'||a.tagName==='SELECT')&&a.type!=='password')return;load()},30000);if('serviceWorker' in navigator){navigator.serviceWorker.register('?asset=sw').catch(function(){})}
</script></body></html>"""

def handler(event, context):
    pw = os.environ.get("ADMIN_PASSWORD", "")
    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")

    if method == "GET":
        if params.get("asset") == "manifest":
            path = "/d4ege0ishfegipqah4u2"
            man = {"name": "Заявки ДОФА СМАЙЛ", "short_name": "ДОФА CRM",
                   "start_url": path, "scope": path, "display": "standalone",
                   "background_color": "#0b0b0d", "theme_color": "#0b0b0d",
                   "icons": [{"src": "https://dofa-site.website.yandexcloud.net/crm-icon-192.png", "sizes": "192x192", "type": "image/png"},
                             {"src": "https://dofa-site.website.yandexcloud.net/crm-icon-512.png", "sizes": "512x512", "type": "image/png"}]}
            return resp(200, json.dumps(man, ensure_ascii=False), "application/manifest+json")
        if params.get("asset") == "sw":
            sw = "self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>self.clients.claim());self.addEventListener('fetch',e=>{});"
            return resp(200, sw, "application/javascript")
        return resp(200, SHELL, "text/html")
    if not pw:
        return resp(503, '{"error":"ADMIN_PASSWORD not set"}')

    body = event.get("body") or ""
    if event.get("isBase64Encoded"):
        body = base64.b64decode(body).decode("utf-8", "replace")
    p = {k: v[0] for k, v in urllib.parse.parse_qs(body).items()}

    if action == "login":
        if p.get("password") == pw:
            return resp(200, json.dumps({"token": token(pw)}))
        return resp(200, '{"error":"wrong"}')

    if hdr(event, "X-Auth") != token(pw):
        return resp(401, '{"error":"unauthorized"}')

    c = s3(); bucket = os.environ["LEADS_BUCKET"]

    if action == "list":
        n, rows = rows_html(c, bucket)
        return resp(200, json.dumps({"n": n, "rows": rows}, ensure_ascii=False))

    if action == "update":
        key = p.get("key", "")
        if not key.startswith("leads/") or ".." in key:
            return resp(400, '{"error":"bad key"}')
        try:
            rec = json.loads(c.get_object(Bucket=bucket, Key=key)["Body"].read())
        except Exception:
            return resp(404, '{"error":"not found"}')
        if "status" in p and p["status"] in STATUSES: rec["status"] = p["status"]
        if "comment" in p: rec["comment"] = p["comment"][:500]
        rec["updated"] = (datetime.datetime.utcnow() + datetime.timedelta(hours=3)).strftime("%d.%m.%Y %H:%M")
        c.put_object(Bucket=bucket, Key=key, Body=json.dumps(rec, ensure_ascii=False).encode())
        return resp(200, '{"ok":true}')

    return resp(400, '{"error":"unknown action"}')
