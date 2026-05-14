# Hướng dẫn Deploy & Update University List API

## API đã live tại:
```
https://university-list-api.hoanghoanpineapple04.workers.dev
```

---

## Các endpoints

| Endpoint | Ví dụ |
|----------|-------|
| `GET /` | `https://university-list-api.hoanghoanpineapple04.workers.dev/` |
| `GET /api/v1/universities` | `https://university-list-api.hoanghoanpineapple04.workers.dev/api/v1/universities` |
| `GET /api/v1/universities/{id}` | `https://university-list-api.hoanghoanpineapple04.workers.dev/api/v1/universities/543` |
| `GET /api/v1/universities?q=từ_khóa` | `https://university-list-api.hoanghoanpineapple04.workers.dev/api/v1/universities?q=B%C3%A1ch%20Khoa` |

---

## Update code (khi sửa dữ liệu trong university.json)

### Cách 1: Dùng API token (nhanh nhất)

Mở **Terminal** (CMD hoặc PowerShell), gõ:

```bash
cd "F:\Project\university-list\workers"
set CLOUDFLARE_API_TOKEN=<token-của-bạn>
npm run deploy
```

### Cách 2: Dùng Wrangler login (1 lần duy nhất)

```bash
cd "F:\Project\university-list\workers"
npx wrangler login
# Trình duyệt mở ra -> đăng nhập Cloudflare -> Allow

npm run deploy
```

Lần sau chỉ cần chạy `npm run deploy` (không cần token).

---

## Tạo API token mới (nếu cần)

1. Vào https://dash.cloudflare.com/profile/api-tokens
2. Bấm **Create Token** -> **Edit Cloudflare Workers**
3. Chọn tài khoản của bạn
4. Bấm **Create Token**, copy token và dùng ở trên

---

## Cấu trúc project

```
F:\Project\university-list\
├── university.json       # Dữ liệu gốc (sửa ở đây)
├── workers/
│   ├── src/
│   │   ├── handler.js    # Logic API
│   │   └── index.js      # Build output (tự sinh, có thể xóa)
│   ├── scripts/
│   │   └── build.mjs     # Script gộp JSON vào code
│   ├── wrangler.toml     # Cấu hình Cloudflare
│   └── package.json
├── api/                  # FastAPI (dùng cho VPS)
├── Dockerfile            # Docker (dùng cho VPS)
└── DEPLOY.md             # File này
```
