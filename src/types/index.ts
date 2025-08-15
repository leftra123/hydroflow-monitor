// src/types/index.ts
export interface EstacionMonitoreo {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  estado: 'normal' | 'alerta' | 'critico';
  caudal: number;
  nivel: number;
  velocidad: number;
  presion: number;
  temperatura: number;
  ph: number;
  oxigeno: number;
  turbidez: number;
}

export interface DatosHistoricos {
  time: string;
  fecha: Date;
  caudal: number;
  nivel: number;
  velocidad: number;
  presion: number;
  temperatura: number;
  ph: number;
  oxigeno: number;
  turbidez: number;
  precipitacion: number;
}

export interface AlertaSistema {
  id: string;
  nivel: 'verde' | 'amarillo' | 'naranja' | 'rojo';
  mensaje: string;
  timestamp: Date;
  tipo: 'caudal' | 'nivel' | 'meteorologico' | 'calidad';
  estacionId: string;
}