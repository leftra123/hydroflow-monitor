# 📖 Manual del Operador - HydroFlow Monitor

**Guía completa para operadores del sistema de monitoreo hidrológico del Río Claro, Pucón**

---

## 🎯 **INTRODUCCIÓN**

Este manual está diseñado para operadores que trabajan en el monitoreo 24/7 del Río Claro. El sistema es **CRÍTICO** para la seguridad de la población y debe operarse con la máxima responsabilidad.

### **Responsabilidades del Operador**
- Monitorear continuamente los niveles del río
- Activar protocolos de emergencia cuando sea necesario
- Mantener comunicación con autoridades locales
- Documentar todos los eventos significativos

---

## 🖥️ **INTERFAZ PRINCIPAL**

### **Panel de Control Superior**
```
[🌊 HydroFlow] [📊 Estaciones] [🎨 Tema] [🔊 Alarmas] [🔄 Comparar]
```

- **🎨 Botón de Tema**: Cambia entre Claro/Oscuro/Sistema
- **🔊 Controles de Alarma**: Volumen, silenciar, probar
- **🔄 Comparar**: Activa/desactiva vista de comparación

### **Métricas Principales**
Cada métrica muestra:
- **Valor actual** con unidades
- **Tendencia** (subiendo ↗️, bajando ↘️, estable ➡️)
- **Estado** (Normal 🟢, Precaución 🟡, Crítico 🔴)

---

## 📊 **INTERPRETACIÓN DE DATOS**

### **🌊 Nivel del Agua**
- **Normal**: 1.5 - 2.5 metros
- **Precaución**: 2.5 - 3.0 metros
- **Crítico**: >3.0 metros
- **Emergencia**: >3.5 metros

**¿Qué hacer?**
- **>2.5m**: Monitorear cada 15 minutos
- **>3.0m**: Alertar a Bomberos (132)
- **>3.5m**: Activar evacuación inmediata

### **💧 Caudal**
- **Normal**: 8 - 20 m³/s
- **Precaución**: 20 - 30 m³/s
- **Crítico**: >30 m³/s

**¿Qué hacer?**
- **>20 m³/s**: Verificar estación aguas arriba
- **>30 m³/s**: Alertar ONEMI (+56 45 2348200)

### **🌡️ Temperatura del Agua**
- **Normal**: 8 - 18°C
- **Anomalía**: Cambio >5°C en 2 horas
- **Crítico**: >20°C

**¿Qué hacer?**
- **Cambio brusco**: Contactar SERNAGEOMIN
- **>20°C**: Posible actividad volcánica

---

## 🚨 **SISTEMA DE ALARMAS**

### **Tipos de Alarma**
1. **🟡 Advertencia** (Beep suave)
   - Cambios menores que requieren atención
   - Volumen: 60%

2. **🔴 Crítico** (Sirena intermitente)
   - Situaciones de riesgo inmediato
   - Volumen: 80%

3. **🚨 Emergencia** (Sirena continua)
   - Evacuación inmediata requerida
   - Volumen: 100%

4. **🟣 Anomalía** (Campana)
   - Posible falla de sensor
   - Volumen: 50%

### **Controles de Alarma**
- **🔊 Control de Volumen**: Ajustar entre 0-100%
- **🔇 Silenciar**: Silencia por 10 minutos
- **🧪 Probar Sistema**: Verifica funcionamiento
- **✅ Reconocer**: Marca alarma como vista

---

## 🔄 **COMPARACIÓN DE ESTACIONES**

### **Vista Dividida**
El sistema muestra ambas estaciones simultáneamente:
- **Izquierda**: Estación Nacimiento (aguas arriba)
- **Derecha**: Estación Puente (aguas abajo)

### **Indicadores de Diferencia**
- **🟢 Normal**: Diferencia <15%
- **🟡 Advertencia**: Diferencia 15-30%
- **🔴 Crítico**: Diferencia >30%

### **Tiempo de Propagación**
- **Distancia**: 8 km entre estaciones
- **Tiempo promedio**: 3.5 horas
- **Velocidad**: Calculada dinámicamente

---

## 🎨 **SISTEMA DE TEMAS**

### **Cuándo Usar Cada Tema**
- **☀️ Claro**: Operación diurna (6:00 - 20:00)
- **🌙 Oscuro**: Operación nocturna (20:00 - 6:00)
- **💻 Sistema**: Automático según horario del sistema

### **Cambio de Tema**
1. Hacer clic en el botón de tema (esquina superior derecha)
2. El sistema cicla: Claro → Oscuro → Sistema
3. El cambio es inmediato y se guarda automáticamente

---

## 📋 **PROCEDIMIENTOS OPERACIONALES**

### **Inicio de Turno**
1. **Verificar alarmas**: Botón "Probar Sistema"
2. **Revisar historial**: Últimas 4 horas de eventos
3. **Confirmar comunicación**: Ambas estaciones operativas
4. **Ajustar volumen**: Según horario (día/noche)
5. **Documentar**: Hora de inicio y estado general

### **Durante el Turno**
1. **Monitoreo continuo**: Revisar métricas cada 15 minutos
2. **Documentar cambios**: Anotar eventos significativos
3. **Verificar tendencias**: Usar tooltips para contexto
4. **Mantener comunicación**: Radio con autoridades

### **Fin de Turno**
1. **Resumen de eventos**: Documentar en bitácora
2. **Estado del sistema**: Confirmar operación normal
3. **Transferencia**: Briefing al siguiente operador
4. **Backup**: Guardar configuraciones si hubo cambios

---

## ⚡ **PROCEDIMIENTOS DE EMERGENCIA**

### **Crecida Súbita**
```
🚨 NIVEL >3.0m EN MENOS DE 1 HORA
```
1. **Confirmar datos**: Verificar ambas estaciones
2. **Alertar autoridades**: Bomberos (132) y ONEMI
3. **Activar protocolo**: Evacuación de camping y zonas bajas
4. **Documentar**: Hora, nivel máximo, acciones tomadas
5. **Seguimiento**: Monitorear hasta normalización

### **Falla de Sensor**
```
🔧 DIVERGENCIA >30% ENTRE ESTACIONES
```
1. **Verificar conexiones**: Revisar estado de comunicación
2. **Comparar datos**: Usar estación de respaldo
3. **Contactar técnico**: Programar inspección
4. **Protocolo manual**: Activar medición de respaldo
5. **Documentar**: Tipo de falla y acciones tomadas

### **Actividad Volcánica**
```
🌋 TEMPERATURA >20°C O CAMBIO >8°C
```
1. **Contactar SERNAGEOMIN**: +56 2 2482 7800
2. **Verificar Villarrica**: Consultar estado volcánico
3. **Alertar autoridades**: ONEMI y Municipalidad
4. **Preparar evacuación**: Según protocolo volcánico
5. **Monitoreo intensivo**: Cada 5 minutos

---

## 📞 **CONTACTOS DE EMERGENCIA**

### **Autoridades Locales**
- **Bomberos Pucón**: 132
- **Carabineros**: 133
- **Municipalidad Pucón**: +56 45 2441675

### **Autoridades Regionales**
- **ONEMI Araucanía**: +56 45 2348200
- **DGA Temuco**: +56 45 2297300
- **SERNAGEOMIN**: +56 2 2482 7800

### **Soporte Técnico**
- **Mesa de Ayuda**: soporte@hidroflow.cl
- **Emergencias 24/7**: +56 9 8765 4321
- **Técnico en Terreno**: +56 9 1234 5678

---

## 📝 **DOCUMENTACIÓN REQUERIDA**

### **Bitácora de Turno**
```
Fecha: ___________  Turno: ___________  Operador: ___________

Inicio de Turno:
- Hora: _____  Estado general: _________________
- Alarmas probadas: ☐ Sí ☐ No
- Comunicación OK: ☐ Sí ☐ No

Eventos del Turno:
- Hora: _____ Evento: _________________________
- Acción tomada: _____________________________

Fin de Turno:
- Hora: _____  Estado final: __________________
- Observaciones: _____________________________
```

### **Reporte de Emergencia**
```
REPORTE DE EMERGENCIA - RÍO CLARO

Fecha/Hora: ________________
Operador: __________________
Tipo de Emergencia: ________

Datos al momento del evento:
- Nivel: _______ m
- Caudal: ______ m³/s
- Temperatura: __ °C

Acciones tomadas:
☐ Bomberos alertados
☐ ONEMI contactado
☐ Evacuación activada
☐ Autoridades notificadas

Observaciones:
_________________________________
```

---

## 🔧 **SOLUCIÓN DE PROBLEMAS**

### **Alarmas No Suenan**
1. Verificar volumen del sistema
2. Comprobar permisos de audio del navegador
3. Probar con botón "Test"
4. Reiniciar navegador si es necesario

### **Datos No Actualizan**
1. Verificar conexión a internet
2. Revisar estado de estaciones
3. Refrescar página (F5)
4. Contactar soporte técnico

### **Tema No Cambia**
1. Hacer clic múltiples veces en botón
2. Verificar que no hay errores en consola
3. Limpiar caché del navegador
4. Reiniciar aplicación

---

**Versión del Manual**: 2.0  
**Última actualización**: Diciembre 2024  
**Próxima revisión**: Marzo 2025
