# Checklist de Implementación - Sistema de Juego FNFO

## 1️⃣ VERIFICACIÓN DEL FRONTEND

### ✅ Componentes Base (ya creados)
- [x] `lib/types/game.ts` - Tipos e interfaces
- [x] `hooks/use-score-calculator.ts` - Lógica de score
- [x] `components/game-hud.tsx` - HUD visual
- [x] `lib/game-service.ts` - Funciones API
- [x] `src/app/login/page.tsx` - Login con identifier + password

### ❌ Componentes Faltantes

#### 1. Página Game/Player (`src/app/game/page.tsx`)
**Responsabilidades:**
- Cargar el chart desde el backend (`fetchChart()`)
- Crear elemento `<audio>` y sincronizar `currentTime`
- Detectar presión de teclas (listeners en document)
- Comparar currentTime vs noteTime para cada nota
- Registrar hits usando `useScoreCalculator`
- Mostrar `<GameHUD />`
- Enviar resultado final al backend cuando termine

**Teclas esperadas:**
- Left: tecla A o Flecha Izquierda
- Down: tecla S o Flecha Abajo
- Up: tecla W o Flecha Arriba
- Right: tecla D o Flecha Derecha

#### 2. Componente Visual de Notas (`components/game-note.tsx`)
**Responsabilidades:**
- Renderizar notas que caen desde arriba
- Mostrar hit feedback (Perfect/Good/Miss)
- Animar notas según su timing
- Mostrar zona de detección (hit window)

#### 3. Componente Game Chart Renderer (`components/game-chart-display.tsx`)
**Responsabilidades:**
- Renderizar 4 carriles (left, down, up, right)
- Posicionar notas dinámicamente según tiempo actual
- Mostrar hit effects cuando se detecta un hit
- Indicar visual que una nota fue misseada

#### 4. Página de Resultados (`src/app/game/results/page.tsx`)
**Responsabilidades:**
- Recibir stats finales desde la sesión anterior
- Mostrar score, accuracy, combo máximo
- Gráfico de hits en tiempo (Perfect/Good/Miss)
- Botón para volver a jugar o al lobby
- Link a leaderboard

#### 5. Página de Selección de Canciones (`src/app/game/select/page.tsx`)
**Responsabilidades:**
- Listar charts disponibles (`fetchCharts()`)
- Filtrar por dificultad
- Mostrar preview de canción
- Navegación a `/game` con `chartId`

#### 6. Componente Leaderboard (`components/leaderboard.tsx`)
**Responsabilidades:**
- Mostrar top 10/50 players de una canción
- Incluir rank, nombre, score, accuracy
- Highlight del usuario actual

---

## 2️⃣ REQUISITOS DEL BACKEND (qué espera el frontend)

### Endpoints Requeridos

#### `POST /auth/login`
```json
REQUEST:
{
  "identifier": "usuario_o_email",
  "password": "contraseña"
}

RESPONSE:
{
  "token": "jwt_token",
  "user": {
    "username": "nombre",
    "email": "correo@example.com",
    "id": "user_id"
  }
}
```

#### `GET /game/charts` (con query opcional `?difficulty=hard`)
```json
RESPONSE:
[
  {
    "id": "chart_1",
    "title": "Bopeebo",
    "artist": "Kawai Sprite",
    "difficulty": "easy",
    "bpm": 100,
    "duration": 120000,
    "previewUrl": "http://...",
    "audioUrl": "http://..."
  }
]
```

#### `GET /game/charts/{chartId}`
```json
RESPONSE:
{
  "id": "chart_1",
  "title": "Bopeebo",
  "artist": "Kawai Sprite",
  "difficulty": "easy",
  "bpm": 100,
  "duration": 120000,
  "audioUrl": "http://...",
  "notes": [
    {
      "id": "note_1",
      "time": 1000,
      "key": "left",
      "type": "normal",
      "duration": null
    },
    {
      "id": "note_2",
      "time": 1500,
      "key": "down",
      "type": "normal"
    }
  ]
}
```

#### `POST /game/results`
```json
REQUEST:
{
  "chartId": "chart_1",
  "difficulty": "easy",
  "score": 9500,
  "combo": 100,
  "maxCombo": 100,
  "accuracy": 98.3,
  "perfect": 95,
  "good": 5,
  "miss": 0,
  "totalNotes": 100,
  "duration": 120000,
  "timestamp": "2025-12-15T10:30:00Z"
}

RESPONSE:
{
  "success": true,
  "message": "Resultado guardado",
  "resultId": "result_xyz"
}
```

#### `GET /game/leaderboard/{chartId}`
```json
RESPONSE:
[
  {
    "rank": 1,
    "username": "Player1",
    "score": 10000,
    "accuracy": 100,
    "timestamp": "2025-12-15T10:00:00Z"
  }
]
```

---

## 3️⃣ TESTING MANUAL

### Test 1: Login Funcional
```
1. Navega a http://localhost:3000/login
2. Ingresa usuario/email y contraseña
3. Verifica que se guarde token en localStorage
4. Verifica que se redirija a /
```

### Test 2: Carga de Charts
```
1. Crea una pagina temporal en /test-charts
2. Usa fetchCharts() para obtener lista
3. Verifica que retorna datos correctos
4. Logs en consola (NEXT_PUBLIC_ENABLE_DEBUG_LOGS=true)
```

### Test 3: Detección de Hits
```
1. Crea una página /test-game con:
   - useScoreCalculator(10)
   - Botones de prueba para simular teclas
   - Llamadas a registerHit/registerMiss
2. Verifica que el score se actualiza
3. Verifica que combo se resetea en miss
4. Verifica que accuracy se calcula correctamente
```

### Test 4: Sincronización de Audio
```
1. En página de juego:
   - Crear elemento <audio>
   - Cada frame (requestAnimationFrame): actualizar currentTime
   - Detectar si currentTime alcanzó una nota
   - Registrar el hit
2. Escuchar audio y presionar teclas a tiempo
3. Verificar que hits se registran correctamente
```

### Test 5: Envío de Resultados
```
1. Completar una canción
2. Capturar getFinalStats()
3. Enviar con submitGameResult()
4. Verificar que el backend recibe los datos
```

---

## 4️⃣ ARQUITECTURA DE LA PÁGINA DE JUEGO

```
<GamePage>
  ├── useScoreCalculator(chart.notes.length)
  ├── useEffect: cargar chart
  ├── useEffect: listener de teclado
  ├── <audio ref={audioRef} src={chart.audioUrl} />
  ├── <GameChartDisplay>
  │   ├── 4 carriles (left, down, up, right)
  │   └── <GameNote /> x N (notas que caen)
  ├── <GameHUD />
  └── onGameEnd(): submitGameResult(getFinalStats())
```

---

## 5️⃣ CHECKLIST DE VALIDACIÓN

### Timing y Detección
- [ ] Las notas se detectan dentro de ±50ms para Perfect
- [ ] Las notas se detectan dentro de ±100ms para Good
- [ ] Las notas fuera de ±150ms son Miss
- [ ] No hay hits duplicados para la misma nota
- [ ] Las notas no presionadas son registradas como Miss

### Score y Combo
- [ ] Perfect suma 100 puntos
- [ ] Good suma 50 puntos
- [ ] Miss suma 0 puntos
- [ ] Combo incrementa en hit, se resetea en miss
- [ ] MaxCombo se actualiza correctamente
- [ ] Accuracy = (perfect×100 + good×50) / (totalHits×100) × 100

### Audio y Sincronización
- [ ] El audio comienza cuando el usuario presiona play
- [ ] currentTime se sincroniza con el elemento <audio>
- [ ] No hay lag significativo entre audio y detección
- [ ] Las teclas se detectan sin lag

### API
- [ ] Login guarda token y redirige
- [ ] Charts se cargan y parsean correctamente
- [ ] Resultado se envía sin errores
- [ ] Backend valida coherencia de datos

---

## 6️⃣ PROXIMOS PASOS RECOMENDADOS

1. **Crear página /test-game** para validar lógica de score sin UI compleja
2. **Implementar GameChartDisplay** con animación simple de notas
3. **Crear página de selección de canciones** (`/game/select`)
4. **Implementar detección de teclado** con debounce para evitar múltiples hits
5. **Crear página de resultados** con visualización de stats
6. **Implementar leaderboard** para mostrar top players
7. **Testing en producción** con gateway Nginx real
8. **Optimización**: memoizar componentes, usar requestAnimationFrame para timing
