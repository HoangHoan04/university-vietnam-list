# Hướng dẫn Deploy University List API

## Yêu cầu

**Option A - Cloudflare Workers (khuyến nghị, free):**
- Tài khoản Cloudflare
- Domain `hoanpineapple.com` dùng Cloudflare DNS
- Node.js trên máy local để deploy

**Option B - VPS (Docker):**
- Server VPS (Ubuntu 22.04+)
- Domain `hoanpineapple.com` trỏ về IP server
- Docker & Docker Compose

---

## 1. Cài đặt Docker & Docker Compose (nếu chưa có)

```bash
# Cài Docker
curl -fsSL https://get.docker.com | bash

# Cài Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

---

## 2. Upload code lên server

```bash
# Cách 1: Dùng git clone
git clone <your-repo-url> /home/university-list
cd /home/university-list

# Cách 2: Dùng SCP từ máy local
scp -r F:\Project\university-list user@hoanpineapple.com:/home/university-list
```

---

## 3. Cấu hình domain & SSL

### Bước 1: Trỏ DNS
Vào DNS của `hoanpineapple.com` thêm bản ghi:
| Loại | Tên | Giá trị |
|------|-----|---------|
| A    | @   | <IP_VPS> |
| A    | www | <IP_VPS> |

### Bước 2: Tạo SSL Certificate

```bash
cd /home/university-list

# Tạo folder cho certbot
mkdir -p certbot/www certbot/conf

# Lấy SSL (chạy lần đầu)
docker-compose run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  --email your-email@gmail.com \
  --agree-tos \
  --no-eff-email \
  -d hoanpineapple.com -d www.hoanpineapple.com
```

---

## 4. Chạy API

```bash
cd /home/university-list
docker-compose up -d
```

API sẽ chạy tại: `https://hoanpineapple.com`

---

## 5. Các endpoint API

| Endpoint | Mô tả | Ví dụ |
|----------|-------|-------|
| `GET /` | Thông tin API & danh sách endpoint | `https://hoanpineapple.com/` |
| `GET /api/v1/universities` | Lấy tất cả trường | `https://hoanpineapple.com/api/v1/universities` |
| `GET /api/v1/universities/{id}` | Lấy chi tiết 1 trường theo ID | `https://hoanpineapple.com/api/v1/universities/543` |
| `GET /api/v1/universities/search?q=...` | Tìm kiếm trường | `https://hoanpineapple.com/api/v1/universities/search?q=Bách%20Khoa` |
| `GET /docs` | Swagger UI (tài liệu API) | `https://hoanpineapple.com/docs` |
| `GET /redoc` | ReDoc UI | `https://hoanpineapple.com/redoc` |

### Ví dụ gọi API

```bash
# Lấy tất cả
curl https://hoanpineapple.com/api/v1/universities

# Tìm kiếm
curl "https://hoanpineapple.com/api/v1/universities/search?q=Bách%20Khoa"

# Lấy theo ID
curl https://hoanpineapple.com/api/v1/universities/543
```

---

## 6. Quản lý container

```bash
# Xem logs
docker-compose logs -f

# Dừng API
docker-compose down

# Khởi động lại
docker-compose restart

# Update code mới
git pull
docker-compose up -d --build
```

---

## 7. Cấu hình tường lửa

```bash
# Cho phép HTTP/HTTPS
ufw allow 80
ufw allow 443
ufw enable
```

---

## 8. Deploy thủ công (không Docker - dành cho VPS nhẹ)

Nếu không muốn dùng Docker, cài Python + Uvicorn + Nginx thủ công:

```bash
# Cài Python & pip
sudo apt update
sudo apt install python3 python3-pip nginx -y

# Copy code & cài dependencies
cd /home/university-list/api
pip3 install -r requirements.txt

# Chạy API (test)
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Cấu hình systemd để chạy tự động** (`/etc/systemd/system/university-api.service`):

```ini
[Unit]
Description=University List API
After=network.target

[Service]
User=root
Group=root
WorkingDirectory=/home/university-list
ExecStart=/usr/bin/python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable --now university-api
```

**Cấu hình Nginx** (`/etc/nginx/sites-available/hoanpineapple.com`):

```nginx
server {
    listen 80;
    server_name hoanpineapple.com www.hoanpineapple.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/hoanpineapple.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 9. Deploy lên Railway / Render (miễn phí, không cần VPS)

### Railway (railway.app)
1. Đẩy code lên GitHub
2. Vào [Railway](https://railway.app) -> New Project -> Deploy from GitHub repo
3. Cấu hình:
   - **Root Directory**: để trống
   - **Start Command**: `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
4. Railway tự cấp domain dạng `*.railway.app`
5. (Optional) Thêm domain tùy chỉnh `hoanpineapple.com` trong Settings

### Render (render.com)
1. Đẩy code lên GitHub
2. Vào [Render](https://render.com) -> New Web Service
3. Chọn repo, **Root Directory**: để trống
4. **Start Command**: `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
5. Render tự cấp domain dạng `*.onrender.com`
6. (Optional) Thêm domain tùy chỉnh trong Settings

---

## 10. Deploy lên Cloudflare Workers (miễn phí, không cần VPS)

### Ưu điểm
- **Miễn phí**: 100k request/ngày, 10MB script
- **Không cần VPS**: chạy trên edge network của Cloudflare
- **HTTPS mặc định**: tự động có SSL
- **Domain tùy chỉnh**: support `hoanpineapple.com`

### Cấu trúc thư mục Workers

```
workers/
├── src/
│   ├── handler.js          # Logic xử lý request (có thể edit)
│   └── index.js            # File build (tự sinh - có data) -> deploy
├── scripts/
│   └── build.mjs           # Script build: gộp JSON + handler
├── wrangler.toml           # Cấu hình Cloudflare Workers
├── package.json
└── .gitignore
```

### Cách deploy

```bash
# 1. Cài Node.js (nếu chưa có)
# Tải từ: https://nodejs.org (bản LTS)

# 2. Cài wrangler CLI
npm install -g wrangler

# 3. Đăng nhập Cloudflare
wrangler login
# Trình duyệt sẽ mở -> đăng nhập Cloudflare -> Authorize

# 4. Build & Deploy
cd workers
npm install
npm run deploy
```

Sau khi deploy, Worker sẽ chạy tại: `https://university-list-api.<your-subdomain>.workers.dev`

### Gắn domain hoanpineapple.com

**Cách 1: Dùng Cloudflare DNS (khuyến nghị)**
1. Domain `hoanpineapple.com` phải dùng **Cloudflare Nameservers** (quan trọng)
2. Vào Cloudflare Dashboard -> Workers & Pages -> chọn `university-list-api`
3. **Triggers** -> **Custom Domain** -> nhập `api.hoanpineapple.com` hoặc `hoanpineapple.com`
4. Cloudflare tự động cấp SSL và route

**Cách 2: Dùng route trong wrangler.toml** (nếu domain đã dùng Cloudflare DNS)
```toml
routes = [{ pattern = "hoanpineapple.com/*", custom_domain = true }]
```

### Endpoints (giống hệt VPS)

| Endpoint | Ví dụ |
|----------|-------|
| `GET /` | `https://hoanpineapple.com/` |
| `GET /api/v1/universities` | `https://hoanpineapple.com/api/v1/universities` |
| `GET /api/v1/universities/543` | `https://hoanpineapple.com/api/v1/universities/543` |
| `GET /api/v1/universities/search?q=Bách Khoa` | `https://hoanpineapple.com/api/v1/universities/search?q=B%C3%A1ch%20Khoa` |

### Local dev
```bash
cd workers
npm run dev
# Mở http://localhost:8787
```

### Update code mới
```bash
cd workers
npm run deploy
```

---

## Cấu trúc thư mục sau khi deploy

### Nếu dùng Docker/VPS:
```
/home/university-list/
├── api/
│   ├── main.py              # FastAPI server
│   └── requirements.txt
├── nginx/
│   └── default.conf
├── certbot/
│   ├── conf/                # SSL certificates
│   └── www/
├── Dockerfile
├── docker-compose.yml
├── university.json
└── DEPLOY.md
```

### Nếu dùng Cloudflare Workers:
```
/home/university-list/
├── workers/
│   ├── src/
│   │   ├── handler.js       # Logic API
│   │   └── index.js         # Build output (có data)
│   ├── scripts/
│   │   └── build.mjs        # Build script
│   ├── wrangler.toml
│   └── package.json
├── university.json           # Data gốc
└── DEPLOY.md
```
