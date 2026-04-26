# Forward Proxy

Dịch vụ forward proxy server sử dụng **Fastify** + **Prisma** + **proxy-chain**. Hỗ trợ quản lý và tự động xoay proxy từ nhiều nhà cung cấp: **tinsoftproxy**, **tmproxy**, **proxyxoay**, **netproxy**, **kiotproxy**.

## Yêu cầu

- Node.js >= 18
- Yarn

## Cấu hình

Copy file `.env.default` thành `.env` và chỉnh sửa:

```bash
cp .env.default .env
```

| Biến | Mô tả | Mặc định |
|------|--------|----------|
| `PORT` | Port API server | `5000` |
| `DATABASE_URL` | Đường dẫn database SQLite | `file:./db.sqlite3` |
| `AUTH_PROXYXOAY` | Thông tin xác thực cho proxyxoay | |
| `SITE_URL` | URL/IP của server (dùng khi export proxy) | `localhost` |
| `CRONTAB` | Lịch cron tự động xoay proxy | `*/50 * * * *` |
| `COUNTRY` | Quốc gia lọc proxy | `United+States` |
| `PORT_MIN` | Port bắt đầu cho proxy worker | `10000` |
| `PORT_MAX` | Port kết thúc cho proxy worker | `11000` |

## Chạy trực tiếp (Development)

```bash
# Cài đặt dependencies
yarn install

# Generate Prisma client
yarn prisma:generate

# Chạy migration database
yarn prisma:migrate

# Chạy dev mode
yarn dev
```

## Chạy trực tiếp (Production)

```bash
yarn install
yarn prisma:generate
npx prisma migrate deploy
yarn build
yarn start
```

## Chạy bằng Docker

```bash
docker compose up -d --build
```

Container sẽ expose:
- Port `5000` - API server
- Port `10000-10045` - Proxy worker ports (chỉnh trong `docker-compose.yml` nếu cần mở rộng)

## API Endpoints

### `GET /`
Health check.

### `GET /proxy`
Lấy danh sách tất cả proxy đã thêm.

### `PUT /proxy`
Thêm proxy mới.

```json
{
  "apiKey": "your-api-key",
  "type": "tinsoftproxy | tmproxy | proxyxoay | netproxy | kiotproxy",
  "destination": "ip:port (optional)"
}
```

### `DELETE /proxy`
Xóa proxy.

```json
{
  "apiKey": "your-api-key"
}
```

### `GET /proxy/export`
Export danh sách proxy dạng text (mỗi dòng một proxy).

## Cách hoạt động

1. Thêm proxy qua API `PUT /proxy` với API key từ nhà cung cấp
2. Server tự động tạo một proxy worker trên port ngẫu nhiên (trong khoảng `PORT_MIN` - `PORT_MAX`)
3. Cronjob chạy theo lịch `CRONTAB` để tự động xoay (rotate) IP proxy từ nhà cung cấp
4. Truy cập proxy qua `SITE_URL:<port>` được gán cho từng proxy
