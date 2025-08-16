# 🔧 Configuración Técnica - HydroFlow Monitor

**Guía completa de instalación y configuración del sistema**

---

## 📋 **REQUISITOS DEL SISTEMA**

### **Hardware Mínimo**
- **CPU**: Intel i5 / AMD Ryzen 5 o superior
- **RAM**: 8 GB mínimo, 16 GB recomendado
- **Almacenamiento**: 50 GB SSD disponible
- **Red**: Conexión estable 10 Mbps mínimo
- **Audio**: Tarjeta de sonido con altavoces externos

### **Software Requerido**
- **OS**: Windows 10+, macOS 10.15+, Ubuntu 20.04+
- **Node.js**: v18.0.0 o superior
- **npm**: v8.0.0 o superior
- **Navegador**: Chrome 90+, Firefox 88+, Safari 14+

### **Permisos Necesarios**
- **Audio**: Reproducción de sonidos de alarma
- **Notificaciones**: Alertas del sistema
- **Almacenamiento local**: Configuraciones y cache
- **Red**: Acceso a APIs externas

---

## 📦 **INSTALACIÓN**

### **1. Preparación del Entorno**

```bash
# Verificar versión de Node.js
node --version  # Debe ser v18.0.0+

# Verificar npm
npm --version   # Debe ser v8.0.0+

# Crear directorio del proyecto
mkdir /opt/hydroflow-monitor
cd /opt/hydroflow-monitor
```

### **2. Descarga e Instalación**

```bash
# Clonar repositorio
git clone https://github.com/your-org/hydroflow-monitor.git .

# Instalar dependencias
npm install

# Verificar instalación
npm run build
```

### **3. Configuración de Variables de Entorno**

```bash
# Copiar archivo de configuración
cp .env.example .env.local

# Editar configuración
nano .env.local
```

**Archivo `.env.local`:**
```env
# === CONFIGURACIÓN CRÍTICA ===

# URLs de API
VITE_API_BASE_URL=https://api.hidroflow.cl
VITE_WEBSOCKET_URL=wss://ws.hidroflow.cl

# Configuración de alarmas
VITE_ALARM_VOLUME_DEFAULT=0.8
VITE_ALARM_AUTO_MUTE_MINUTES=30
VITE_VIBRATION_ENABLED=true
VITE_ALARM_SOUNDS_PATH=/sounds/

# Intervalos de actualización (milisegundos)
VITE_DATA_UPDATE_INTERVAL=30000
VITE_ALARM_CHECK_INTERVAL=5000
VITE_CONNECTION_TIMEOUT=10000

# Umbrales críticos - Río Claro
VITE_CRITICAL_WATER_LEVEL=3.0
VITE_EMERGENCY_WATER_LEVEL=3.5
VITE_CRITICAL_FLOW_RATE=30.0
VITE_EMERGENCY_FLOW_RATE=40.0
VITE_TEMPERATURE_SPIKE_THRESHOLD=5.0
VITE_CRITICAL_TEMPERATURE=20.0

# Configuración de estaciones
VITE_STATION_NACIMIENTO_ID=EST-001
VITE_STATION_PUENTE_ID=EST-002
VITE_PROPAGATION_DISTANCE=8000
VITE_AVERAGE_VELOCITY=1.5

# Configuración de temas
VITE_DEFAULT_THEME=system
VITE_THEME_TRANSITION_DURATION=300

# Configuración de logging
VITE_LOG_LEVEL=info
VITE_ENABLE_CONSOLE_LOGS=true

# Configuración de emergencia
VITE_EMERGENCY_CONTACTS_ENABLED=true
VITE_AUTO_ESCALATION_ENABLED=true
```

---

## 🔊 **CONFIGURACIÓN DE AUDIO**

### **1. Archivos de Sonido**

Crear directorio y descargar sonidos:
```bash
mkdir -p public/sounds/
```

**Archivos requeridos:**
- `beep-warning.mp3` - Advertencia (3-5 segundos)
- `alarm-critical.mp3` - Crítico (5-10 segundos, loop)
- `evacuation.mp3` - Emergencia (continuo, loop)
- `attention.mp3` - Anomalía (2-3 segundos)
- `test-beep.mp3` - Prueba del sistema (1-2 segundos)

### **2. Configuración de Volumen**

```typescript
// Configuración en src/constants/alarmConfig.ts
export const ALARM_CONFIG = {
  warning: {
    volume: 0.6,
    loop: false,
    fadeIn: true
  },
  critical: {
    volume: 0.8,
    loop: true,
    fadeIn: true
  },
  emergency: {
    volume: 1.0,
    loop: true,
    fadeIn: false
  }
};
```

### **3. Permisos de Audio**

**Chrome/Edge:**
```
Configuración → Privacidad y seguridad → Configuración del sitio → Sonido
→ Permitir que los sitios reproduzcan sonido
```

**Firefox:**
```
about:preferences#privacy → Permisos → Reproducción automática
→ Permitir audio y video
```

---

## 🎨 **CONFIGURACIÓN DE TEMAS**

### **1. Variables CSS Personalizadas**

```css
/* src/index.css - Personalización de colores */
:root {
  /* Colores específicos para DGA */
  --primary-dga: #1e40af;
  --secondary-dga: #0891b2;
  --warning-dga: #f59e0b;
  --critical-dga: #ef4444;
  --emergency-dga: #7c2d12;
}

.dark {
  /* Colores optimizados para operación nocturna */
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

### **2. Configuración de Transiciones**

```typescript
// src/hooks/useTheme.ts
const THEME_CONFIG = {
  transitionDuration: 300, // ms
  autoSwitchEnabled: true,
  dayThemeStart: 6,        // 6:00 AM
  nightThemeStart: 20,     // 8:00 PM
  persistPreference: true
};
```

---

## 📡 **CONFIGURACIÓN DE CONECTIVIDAD**

### **1. Configuración de Red**

```typescript
// src/constants/networkConfig.ts
export const NETWORK_CONFIG = {
  apiTimeout: 10000,
  retryAttempts: 3,
  retryDelay: 2000,
  heartbeatInterval: 30000,
  reconnectDelay: 5000
};
```

### **2. Configuración de WebSocket**

```typescript
// WebSocket para datos en tiempo real
const WS_CONFIG = {
  url: process.env.VITE_WEBSOCKET_URL,
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
  pingInterval: 30000
};
```

### **3. Configuración de Proxy (Desarrollo)**

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://api.hidroflow.cl',
        changeOrigin: true,
        secure: true
      }
    }
  }
});
```

---

## 🚀 **DESPLIEGUE EN PRODUCCIÓN**

### **1. Build de Producción**

```bash
# Limpiar cache
npm run clean

# Build optimizado
npm run build

# Verificar build
npm run preview
```

### **2. Configuración del Servidor Web**

**Nginx:**
```nginx
server {
    listen 443 ssl;
    server_name monitor.hidroflow.cl;
    
    root /var/www/hydroflow-monitor/dist;
    index index.html;
    
    # Configuración SSL
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Headers de seguridad
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Configuración para SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache para assets estáticos
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Configuración para archivos de audio
    location /sounds/ {
        expires 1d;
        add_header Cache-Control "public";
    }
}
```

**Apache:**
```apache
<VirtualHost *:443>
    ServerName monitor.hidroflow.cl
    DocumentRoot /var/www/hydroflow-monitor/dist
    
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    
    # Configuración para SPA
    <Directory "/var/www/hydroflow-monitor/dist">
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Headers de seguridad
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
</VirtualHost>
```

### **3. Configuración de Monitoreo**

```bash
# Instalar PM2 para monitoreo
npm install -g pm2

# Configuración PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'hydroflow-monitor',
    script: 'serve',
    args: '-s dist -l 3000',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

# Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🔒 **CONFIGURACIÓN DE SEGURIDAD**

### **1. HTTPS Obligatorio**

```typescript
// src/main.tsx - Forzar HTTPS en producción
if (import.meta.env.PROD && location.protocol !== 'https:') {
  location.replace(`https:${location.href.substring(location.protocol.length)}`);
}
```

### **2. Content Security Policy**

```html
<!-- public/index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  media-src 'self';
  connect-src 'self' wss: https:;
  font-src 'self';
">
```

### **3. Variables de Entorno Seguras**

```bash
# Nunca incluir en .env.local (solo ejemplo)
# API_SECRET_KEY=your-secret-key
# DATABASE_PASSWORD=your-password

# Usar variables del sistema en producción
export VITE_API_BASE_URL="https://api.hidroflow.cl"
export VITE_WEBSOCKET_URL="wss://ws.hidroflow.cl"
```

---

## 📊 **CONFIGURACIÓN DE LOGGING**

### **1. Configuración de Logs**

```typescript
// src/utils/logger.ts
export const logger = {
  level: import.meta.env.VITE_LOG_LEVEL || 'info',
  
  info: (message: string, data?: any) => {
    if (import.meta.env.VITE_ENABLE_CONSOLE_LOGS === 'true') {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data);
    }
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data);
  },
  
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
  }
};
```

### **2. Monitoreo de Errores**

```typescript
// src/utils/errorTracking.ts
window.addEventListener('error', (event) => {
  logger.error('JavaScript Error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled Promise Rejection', {
    reason: event.reason
  });
});
```

---

## 🧪 **CONFIGURACIÓN DE TESTING**

### **1. Tests Unitarios**

```bash
# Instalar dependencias de testing
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Ejecutar tests
npm run test

# Coverage
npm run test:coverage
```

### **2. Tests de Integración**

```bash
# Instalar Playwright
npm install --save-dev @playwright/test

# Ejecutar tests E2E
npm run test:e2e
```

### **3. Tests de Alarmas**

```typescript
// tests/alarms.test.ts
describe('Sistema de Alarmas', () => {
  test('debe reproducir alarma crítica', async () => {
    const { playAlarm } = useAlarmSystem();
    await playAlarm('critical', 'Test message');
    // Verificar que el audio se reproduce
  });
});
```

---

## 📱 **CONFIGURACIÓN MÓVIL**

### **1. PWA (Progressive Web App)**

```json
// public/manifest.json
{
  "name": "HydroFlow Monitor",
  "short_name": "HydroFlow",
  "description": "Sistema de monitoreo hidrológico crítico",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#1e40af",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### **2. Service Worker**

```typescript
// public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('hydroflow-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/sounds/alarm-critical.mp3'
      ]);
    })
  );
});
```

---

**Versión**: 2.0  
**Última actualización**: Diciembre 2024  
**Soporte técnico**: soporte@hidroflow.cl
