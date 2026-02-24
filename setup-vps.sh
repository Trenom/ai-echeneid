#!/bin/bash
# ============================================================
# setup-vps.sh â€” ConfiguraciÃ³n de ai.echeneid.com en el VPS
# Ejecutar como root en el servidor: bash setup-vps.sh
# ============================================================
set -e

DOMAIN="ai.echeneid.com"
WEBROOT="/var/www/$DOMAIN"
GITHUB_REPO="Trenom/ai-echeneid"   # <-- completar: usuario/repo (ej: wenceslao/ai-echeneid)

echo ""
echo "â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—"
echo "â•‘   Setup ai.echeneid.com â€” iniciando...   â•‘"
echo "â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•"
echo ""

# â”€â”€ 1. Crear directorio web â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo "â–¸ Creando directorio web..."
mkdir -p "$WEBROOT"
echo ""

# â”€â”€ 2. Clonar el repo de GitHub â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
if [ -z "$GITHUB_REPO" ]; then
  echo "âš   GITHUB_REPO no definido. Saltando clone."
  echo "   Acordate de hacer git clone o git init manualmente en $WEBROOT"
else
  echo "â–¸ Clonando repositorio desde GitHub..."
  git clone "https://github.com/$GITHUB_REPO" "$WEBROOT" || true
fi

# â”€â”€ 3. Generar SSH key para GitHub Actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo ""
echo "â–¸ Generando SSH key para GitHub Actions..."
SSH_KEY_PATH="/root/.ssh/github_actions_deploy"
if [ ! -f "$SSH_KEY_PATH" ]; then
  ssh-keygen -t ed25519 -C "github-actions-deploy@$DOMAIN" -f "$SSH_KEY_PATH" -N ""
  # Agregar la clave pÃºblica a authorized_keys
  cat "${SSH_KEY_PATH}.pub" >> /root/.ssh/authorized_keys
  chmod 600 /root/.ssh/authorized_keys
  echo ""
  echo "âœ… SSH key generada. Clave PÃšBLICA (ya agregada a authorized_keys):"
  cat "${SSH_KEY_PATH}.pub"
  echo ""
  echo "â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—"
  echo "â•‘  COPIA ESTA CLAVE PRIVADA y pegala en GitHub Secrets    â•‘"
  echo "â•‘  Settings â†’ Secrets â†’ Actions â†’ VPS_SSH_KEY             â•‘"
  echo "â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•"
  cat "$SSH_KEY_PATH"
  echo ""
else
  echo "   Ya existe SSH key en $SSH_KEY_PATH"
fi

# â”€â”€ 4. Configurar Nginx â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo "â–¸ Creando config de Nginx para $DOMAIN..."
cat > "/etc/nginx/sites-available/$DOMAIN" << NGINXCONF
server {
    listen 80;
    server_name $DOMAIN;

    root $WEBROOT;
    index index.html;

    location / {
        try_files \$uri \$uri/ =404;
    }

    # Cache para assets estÃ¡ticos
    location ~* \.(css|js|png|jpg|jpeg|gif|svg|ico|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
NGINXCONF

# Activar el sitio
ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"

# Probar config
echo ""
nginx -t && echo "âœ… Nginx config OK"

# Recargar Nginx
systemctl reload nginx
echo "âœ… Nginx recargado"

# â”€â”€ 5. SSL con Certbot â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo ""
echo "â–¸ Obteniendo certificado SSL para $DOMAIN..."
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m wenceslao.maislin@gmail.com
echo "âœ… SSL configurado"

# â”€â”€ 6. Resumen final â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo ""
echo "â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—"
echo "â•‘              âœ… SETUP COMPLETO                   â•‘"
echo "â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•£"
echo "â•‘  Sitio web:   https://$DOMAIN      â•‘"
echo "â•‘  Directorio:  $WEBROOT  â•‘"
echo "â•‘  Nginx:       /etc/nginx/sites-available/$DOMAIN â•‘"
echo "â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•£"
echo "â•‘  PRÃ“XIMOS PASOS:                                 â•‘"
echo "â•‘  1. Copiar clave privada SSH a GitHub Secrets    â•‘"
echo "â•‘     â†’ VPS_SSH_KEY = (la clave de arriba)         â•‘"
echo "â•‘     â†’ VPS_HOST    = 72.60.142.250                â•‘"
echo "â•‘     â†’ VPS_USER    = root                         â•‘"
echo "â•‘  2. git clone tu repo en $WEBROOT    â•‘"
echo "â•‘  3. Hacer un push a main y ver el deploy auto    â•‘"
echo "â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•"
echo ""
