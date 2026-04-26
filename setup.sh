#!/bin/bash
set -e

# ============================================================
# Forward Proxy - Auto Setup Script for Ubuntu
# ============================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERROR]${NC} $1"; }

REPO_URL="${REPO_URL:-https://github.com/tuwibu/forward-proxy.git}"
INSTALL_DIR="${INSTALL_DIR:-$HOME/forward-proxy}"
PORT_API="${PORT_API:-5000}"
PORT_MIN="${PORT_MIN:-10000}"
PORT_MAX="${PORT_MAX:-11000}"
SITE_URL="${SITE_URL:-}"
COUNTRY="${COUNTRY:-United+States}"
CRONTAB_VAL="${CRONTAB_VAL:-*/50 * * * *}"
AUTH_PROXYXOAY="${AUTH_PROXYXOAY:-}"

if [ "$EUID" -eq 0 ]; then
  err "Không chạy script này bằng root. Hãy chạy bằng user thường (script sẽ tự dùng sudo khi cần)."
  exit 1
fi

if ! command -v sudo &>/dev/null; then
  err "Thiếu lệnh sudo. Cài đặt: apt install sudo"
  exit 1
fi

# ============================================================
# 1. Cài đặt dependencies cơ bản
# ============================================================
log "Cập nhật apt và cài đặt package cơ bản..."
sudo apt update
sudo apt install -y ca-certificates curl gnupg git ufw

# ============================================================
# 2. Cài đặt Docker
# ============================================================
if command -v docker &>/dev/null; then
  log "Docker đã được cài đặt: $(docker --version)"
else
  log "Cài đặt Docker..."
  sudo install -m 0755 -d /etc/apt/keyrings
  if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
  fi

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

  sudo apt update
  sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

  sudo usermod -aG docker "$USER"
  warn "Đã thêm user $USER vào nhóm docker. Cần logout/login lại để áp dụng (hoặc script sẽ dùng sudo docker)."
fi

# Chọn lệnh docker phù hợp (không cần sudo nếu user đã trong group docker)
if docker info &>/dev/null; then
  DOCKER="docker"
else
  DOCKER="sudo docker"
fi

# ============================================================
# 3. Cấu hình firewall
# ============================================================
if command -v ufw &>/dev/null; then
  log "Cấu hình firewall (UFW)..."
  sudo ufw allow 22/tcp || true
  sudo ufw allow "${PORT_API}/tcp" || true
  sudo ufw allow "${PORT_MIN}:${PORT_MAX}/tcp" || true
  if ! sudo ufw status | grep -q "Status: active"; then
    warn "UFW đang tắt. Bỏ qua bước enable để tránh khóa SSH. Bạn có thể tự bật bằng: sudo ufw enable"
  fi
fi

# ============================================================
# 4. Clone hoặc update repo
# ============================================================
if [ -d "$INSTALL_DIR/.git" ]; then
  log "Repo đã tồn tại tại $INSTALL_DIR. Đang pull bản mới nhất..."
  git -C "$INSTALL_DIR" pull
else
  log "Clone repo từ $REPO_URL về $INSTALL_DIR..."
  git clone "$REPO_URL" "$INSTALL_DIR"
fi

cd "$INSTALL_DIR"

# ============================================================
# 5. Tạo file .env
# ============================================================
if [ -z "$SITE_URL" ]; then
  SITE_URL=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "localhost")
  log "Tự động lấy IP public: $SITE_URL"
fi

if [ ! -f .env ]; then
  log "Tạo file .env..."
  cat > .env <<EOF
PORT=${PORT_API}
DATABASE_URL="file:./db.sqlite3"
AUTH_PROXYXOAY="${AUTH_PROXYXOAY}"
SITE_URL="${SITE_URL}"
CRONTAB="${CRONTAB_VAL}"
COUNTRY="${COUNTRY}"
PORT_MIN=${PORT_MIN}
PORT_MAX=${PORT_MAX}
EOF
else
  warn "File .env đã tồn tại — giữ nguyên không ghi đè."
fi

# ============================================================
# 6. Cập nhật port range trong docker-compose.yml
# ============================================================
COMPOSE_PORT_RANGE="${PORT_MIN}-${PORT_MAX}"
if [ -f docker-compose.yml ]; then
  log "Cập nhật port range trong docker-compose.yml thành ${COMPOSE_PORT_RANGE}..."
  sed -i -E "s|\"[0-9]+-[0-9]+:[0-9]+-[0-9]+\"|\"${COMPOSE_PORT_RANGE}:${COMPOSE_PORT_RANGE}\"|g" docker-compose.yml
fi

# ============================================================
# 7. Build và start container
# ============================================================
log "Build và khởi động container..."
$DOCKER compose up -d --build

sleep 5

# ============================================================
# 8. Kiểm tra
# ============================================================
log "Kiểm tra trạng thái container..."
$DOCKER ps --filter "name=forward-proxy"

log "Test API..."
if curl -sf "http://localhost:${PORT_API}/" >/dev/null; then
  log "API đang chạy: http://${SITE_URL}:${PORT_API}/"
else
  err "API không phản hồi. Xem log: $DOCKER logs forward-proxy"
fi

# ============================================================
# Tổng kết
# ============================================================
echo ""
echo "============================================================"
echo -e "${GREEN}HOÀN TẤT!${NC}"
echo "============================================================"
echo "Thư mục cài đặt : $INSTALL_DIR"
echo "API URL         : http://${SITE_URL}:${PORT_API}"
echo "Proxy port range: ${PORT_MIN}-${PORT_MAX}"
echo ""
echo "Lệnh hữu ích:"
echo "  Xem log     : cd $INSTALL_DIR && $DOCKER compose logs -f"
echo "  Restart     : cd $INSTALL_DIR && $DOCKER compose restart"
echo "  Stop        : cd $INSTALL_DIR && $DOCKER compose down"
echo "  Update code : cd $INSTALL_DIR && git pull && $DOCKER compose up -d --build"
echo "============================================================"
