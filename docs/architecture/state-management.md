# 🎭 Gestión de Estado - Arquitectura Reactiva Pura

## Filosofía de Diseño

La gestión de estado en HydroFlow Monitor sigue principios de **pureza funcional** y **inmutabilidad**, garantizando que cada transición de estado sea predecible, auditable y reversible.

## Arquitectura del Estado

### Reducer Puro
```typescript
export const applicationReducer = (
  state: ApplicationState,
  action: AppAction
): ApplicationState
```

**Características**:
- **Determinístico**: Misma entrada produce misma salida
- **Sin efectos secundarios**: No modifica estado externo
- **Inmutable**: Retorna nuevo estado, nunca modifica el existente
- **Auditable**: Cada acción es registrable y reversible

### Estado de la Aplicación
```typescript
interface ApplicationState {
  readonly theme: 'light' | 'dark';
  readonly selectedStation: StationId | null;
  readonly timeRange: TimeRangeType;
  readonly isRealTimeMode: boolean;
  readonly lastUpdate: Timestamp;
}
```

## Acciones del Sistema

### Toggle de Tema
```typescript
case ActionType.TOGGLE_THEME:
  return {
    ...state,
    theme: state.theme === 'light' ? 'dark' : 'light',
    lastUpdate: createTimestamp(new Date())
  };
```

**Efectos**:
- Actualiza clase CSS del documento
- Recalcula colores de gráficos
- Persiste preferencia del usuario

### Selección de Estación
```typescript
case ActionType.SELECT_STATION:
  return {
    ...state,
    selectedStation: action.payload as StationId,
    lastUpdate: createTimestamp(new Date())
  };
```

**Efectos**:
- Regenera datos históricos
- Actualiza cálculos hidráulicos
- Refresca visualizaciones

### Cambio de Rango Temporal
```typescript
case ActionType.SET_TIME_RANGE:
  return {
    ...state,
    timeRange: action.payload as TimeRangeType,
    lastUpdate: createTimestamp(new Date())
  };
```

**Efectos**:
- Recalcula serie temporal
- Ajusta granularidad de datos
- Actualiza estadísticas

## Hooks de Estado

### useApplicationState
```typescript
const { state, actions, selectors } = useApplicationState();
```

**Retorna**:
- `state`: Estado inmutable actual
- `actions`: Funciones de dispatch memoizadas
- `selectors`: Valores computados derivados

### Selectores Computados
```typescript
const selectors = useMemo(() => ({
  isDarkMode: state.theme === 'dark',
  hasSelectedStation: state.selectedStation !== null,
  isLongTermAnalysis: ['30d', '1y'].includes(state.timeRange),
  themeClasses: state.theme === 'dark' ? 'dark' : '',
  chartTheme: {
    backgroundColor: state.theme === 'dark' ? '#0f172a' : '#ffffff',
    textColor: state.theme === 'dark' ? '#e2e8f0' : '#1e293b',
    // ...
  }
}), [state]);
```

## Gestión de Datos Hidrológicos

### useHydrologicalData
```typescript
const { generateHistoricalData, calculateTimeSeriesStats } = useHydrologicalData();
```

**Funciones Puras**:
- `generateHistoricalData`: Crea series temporales realistas
- `calculateTimeSeriesStats`: Calcula estadísticas agregadas

### Generación de Datos Realistas
```typescript
const generateHistoricalData = useCallback((
  timeRange: TimeRangeType,
  stationId: StationId
) => {
  // Patrones estacionales
  const seasonalFactor = 1 + 0.3 * Math.sin((i / timeConfig.points) * 2 * Math.PI);
  
  // Variaciones diarias
  const dailyFactor = 1 + 0.1 * Math.sin((i / 24) * 2 * Math.PI);
  
  // Ruido aleatorio
  const noiseFactor = 1 + (Math.random() - 0.5) * 0.1;
  
  // Eventos de precipitación
  const precipitationEvent = Math.random() < 0.05 ? Math.random() * 15 : 0;
  
  return dataPoints;
}, []);
```

## Configuración de Tema Dinámico

### useThemeConfiguration
```typescript
const theme = useThemeConfiguration(isDarkMode);
```

**Configuración Reactiva**:
```typescript
const themeConfig = useMemo(() => ({
  colors: {
    primary: darkMode ? '#0ea5e9' : '#0284c7',
    secondary: darkMode ? '#06b6d4' : '#0891b2',
    // ...
  },
  charts: {
    backgroundColor: darkMode ? '#1e293b' : '#ffffff',
    gridColor: darkMode ? '#334155' : '#e2e8f0',
    // ...
  }
}), [darkMode]);
```

## Optimizaciones de Rendimiento

### Memoización de Acciones
```typescript
const actions = useMemo(() => ({
  toggleTheme: () => dispatch({ type: ActionType.TOGGLE_THEME }),
  selectStation: (stationId: StationId) => 
    dispatch({ type: ActionType.SELECT_STATION, payload: stationId }),
  // ...
}), []); // Sin dependencias - funciones estables
```

### Prevención de Re-renders
- **useCallback**: Para funciones que se pasan como props
- **useMemo**: Para cálculos costosos y objetos complejos
- **React.memo**: Para componentes que dependen solo de props

### Batching de Actualizaciones
```typescript
// React 18 automáticamente agrupa estas actualizaciones
actions.selectStation(newStation);
actions.setTimeRange('24h');
actions.updateTimestamp();
```

## Persistencia de Estado

### LocalStorage Integration
```typescript
// Guardar preferencias del usuario
useEffect(() => {
  localStorage.setItem('hydroflow-theme', state.theme);
  localStorage.setItem('hydroflow-station', state.selectedStation || '');
}, [state.theme, state.selectedStation]);

// Restaurar al inicializar
const INITIAL_STATE: ApplicationState = {
  theme: (localStorage.getItem('hydroflow-theme') as 'light' | 'dark') || 'dark',
  selectedStation: localStorage.getItem('hydroflow-station') as StationId || null,
  // ...
};
```

## Debugging y DevTools

### Estado Serializable
Todo el estado es completamente serializable para debugging:
```typescript
console.log('Estado actual:', JSON.stringify(state, null, 2));
```

### Time Travel Debugging
El reducer puro permite implementar fácilmente:
- Undo/Redo
- State snapshots
- Action replay
- Hot reloading

## Patrones Avanzados

### Middleware Pattern
```typescript
const withLogging = (reducer: Reducer) => (state: State, action: Action) => {
  console.log('Acción:', action.type, action.payload);
  const newState = reducer(state, action);
  console.log('Nuevo estado:', newState);
  return newState;
};
```

### Computed Properties
```typescript
const useComputedState = () => {
  const { state } = useApplicationState();
  
  return useMemo(() => ({
    ...state,
    isNightMode: state.theme === 'dark',
    stationCount: STATIONS.length,
    dataPointsCount: getDataPointsForRange(state.timeRange)
  }), [state]);
};
```

## Testing del Estado

### Unit Tests para Reducer
```typescript
describe('applicationReducer', () => {
  it('should toggle theme', () => {
    const initialState = { theme: 'light', /* ... */ };
    const action = { type: ActionType.TOGGLE_THEME };
    const newState = applicationReducer(initialState, action);
    
    expect(newState.theme).toBe('dark');
    expect(newState).not.toBe(initialState); // Inmutabilidad
  });
});
```

### Integration Tests
```typescript
describe('useApplicationState', () => {
  it('should update theme and trigger re-render', () => {
    const { result } = renderHook(() => useApplicationState());
    
    act(() => {
      result.current.actions.toggleTheme();
    });
    
    expect(result.current.selectors.isDarkMode).toBe(true);
  });
});
```

## Limitaciones y Consideraciones

### Escalabilidad
- Para aplicaciones más grandes, considerar Redux Toolkit
- Para estado complejo, evaluar Zustand o Jotai
- Para estado del servidor, usar React Query (ya implementado)

### Performance
- El estado global causa re-renders en todos los consumidores
- Considerar Context splitting para optimización
- Usar React.memo juiciosamente

### Complejidad
- El patrón reducer puede ser excesivo para estado simple
- Balance entre pureza y pragmatismo
- Documentación clara de flujos de datos
