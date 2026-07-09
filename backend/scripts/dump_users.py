import sqlite3, json, os
p = os.path.join(os.path.dirname(__file__), '..', 'instance', 'database.db')
print('DB PATH:', p)
if not os.path.exists(p):
    print('DB not found')
    raise SystemExit(1)
conn = sqlite3.connect(p)
cur = conn.cursor()
try:
    cur.execute("SELECT id, email, is_verified, otp_code, otp_expires FROM users ORDER BY id DESC LIMIT 20")
    rows = cur.fetchall()
    out = []
    for r in rows:
        out.append({'id': r[0], 'email': r[1], 'is_verified': r[2], 'otp_code': r[3], 'otp_expires': r[4]})
    print(json.dumps(out, indent=2))
finally:
    conn.close()
