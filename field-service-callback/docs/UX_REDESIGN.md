# Rediseño UX/UI — Visión de plataforma de clase mundial

> Documento de visión para transformar la plataforma de gestión de avisos en un producto
> profesional comparable a Zendesk / Jira / ServiceNow, **adaptado a servicio de campo**
> (field service) y a este sistema concreto: roles **cliente / supervisor / técnico** y
> ciclo de 6 fases `Intake → Triage → Dispatch → On the way → On site → Close`.
>
> Principio rector: **una herramienta de campo, no un Jira genérico.** El técnico trabaja
> desde el móvil en casa del cliente; el cliente quiere tranquilidad y seguimiento en vivo
> (estilo Uber/Glovo); el supervisor necesita una torre de control. Cada rol es un producto
> distinto sobre los mismos datos.

---

## 1. Diagnóstico: problemas críticos actuales

Ordenados por impacto en la percepción de "poco profesional".

| # | Problema | Por qué duele | Síntoma actual |
|---|----------|---------------|----------------|
| P1 | **Sin identidad visual** (sin design system) | Todo se ve "casero": tipografías, espaciados y colores improvisados | Páginas planas, sin jerarquía clara |
| P2 | **Login por "clave de rol" pegada a mano** | Inseguro y poco creíble para un usuario real; nadie entiende "X-FSC-Role-Key" | Caja de texto pidiendo una clave larga |
| P3 | **Trazabilidad invisible** | El historial (quién hizo qué y cuándo) existe en datos pero no se muestra | No hay línea de tiempo del ticket |
| P4 | **Sin paneles ni KPIs** | El supervisor no tiene visión de carga, urgencias ni SLA | Solo una tabla; cero métricas |
| P5 | **Estados como texto, sin semántica visual** | Cuesta escanear; no se distingue lo urgente de lo rutinario | Badges básicos, sin prioridad ni "tiempo en estado" |
| P6 | **Flujos sin guía** | El usuario no sabe "qué toca ahora"; acciones poco evidentes | Botones sueltos, sin acción primaria clara |
| P7 | **Técnico no es móvil-first** | El técnico trabaja en el móvil y la UI no está pensada para ello | Misma vista de escritorio encogida |
| P8 | **Cliente sin experiencia de seguimiento** | Pierde la oportunidad de generar confianza | Solo ve estado en texto, sin progreso visual |
| P9 | **Estados de carga/vacío/error pobres** | Da sensación de fragilidad | Pantallas en blanco mientras carga; errores crudos |
| P10 | **Sin búsqueda/filtros potentes ni notificaciones in-app** | No escala a decenas de tickets | Filtros básicos, sin orden por urgencia |

---

## 2. Arquitectura de información por rol

Cada rol responde a una pregunta distinta. Diseñamos "de arriba abajo" según esa pregunta.

### 2.1 Cliente — *"¿Qué pasa con mi avería?"*
Experiencia tipo **seguimiento de pedido**. Sin login (enlace con token) o login social ligero.

- **Lo primero (above the fold):** estado actual como **stepper de progreso** (6 pasos) + ETA grande + foto/nombre del técnico cuando aplica.
- **Después:** datos del aviso (equipo, descripción, dirección), botón de contacto, y un **timeline** legible ("Recibido 10:02 · Técnico asignado 10:40 · En camino 13:10…").
- **Acción prioritaria:** ninguna obligatoria; secundarias = *contactar*, *reprogramar* (futuro), *valorar* al cerrar.
- **Tono:** tranquilizador, mínimo texto, mucha señal visual.

### 2.2 Técnico — *"¿Cuál es mi próximo trabajo y qué hago ahora?"*
**Móvil-first**, manos ocupadas, poca atención. Una pantalla = un trabajo.

- **Lo primero:** "Mis trabajos de hoy" como **lista de tarjetas** ordenadas por ETA/urgencia, con la **acción primaria gigante** del estado actual (un solo botón: *Voy en camino* / *He llegado* / *Cerrar*).
- **Dentro del ticket:** dirección con **botón "Abrir en Maps"** y **"Llamar al cliente"**, descripción del problema, y al cerrar: nota de resolución + (futuro) foto y firma.
- **Acción prioritaria:** avanzar el estado. Todo lo demás, secundario.
- **Navegación:** **barra inferior** (tab bar) tipo app: *Hoy · Agenda · Perfil*.

### 2.3 Supervisor — *"¿Está todo bajo control y bien repartido?"*
**Torre de control** en escritorio (tablet/desktop), denso pero ordenado.

- **Lo primero:** fila de **KPIs** (abiertos, sin asignar, en SLA/vencidos, cerrados hoy) + alertas (avisos atascados, notificación fallida).
- **Vista principal:** **tablero Kanban** con columnas = las 6 fases (arrastrar para asignar/mover) **y** vista alternativa de **tabla** con filtros potentes.
- **Acciones prioritarias:** triar, **asignar técnico** (panel lateral, no modal diminuto), reabrir, repriorizar.
- **Extra de valor:** **carga por técnico** (cuántos avisos lleva cada uno) y, a futuro, mapa.

| | Cliente | Técnico | Supervisor |
|---|---|---|---|
| Dispositivo | Móvil (enlace) | **Móvil** | Escritorio/tablet |
| Pregunta clave | ¿Cuándo llega? | ¿Qué hago ahora? | ¿Todo controlado? |
| Patrón UI | Stepper + tracker | Lista de tarjetas + 1 acción | Kanban + KPIs |
| Densidad | Mínima | Media, botones grandes | Alta |
| Navegación | Single page | Tab bar inferior | Top bar + nav lateral |

---

## 3. Propuesta de interfaz visual

### 3.1 Sistema de diseño (la base de todo)
- **Tokens de color:** una primaria (azul/índigo de marca), neutros para fondo/superficie/borde, y **semánticos** por estado del ticket y por urgencia. Tema **claro y oscuro**.
  - Estados (color por fase): Intake (azul), Triage (violeta), Dispatch (ámbar), On the way (amarillo), On site (teal), Close (gris).
  - Urgencia: baja (gris), normal (azul), alta (naranja), **crítica (rojo)**.
- **Tipografía:** una sola familia (Inter / system-ui), escala de 6 tamaños, jerarquía clara (título/seccion/cuerpo/etiqueta).
- **Espaciado:** escala de 4px (4/8/12/16/24/32). Consistencia = profesionalidad.
- **Radios y sombras:** radios suaves (8–12px), sombras sutiles solo para elementos elevados (modales, menús).

### 3.2 Navegación
- **Supervisor:** barra superior (logo, buscador global, notificaciones, avatar) + **nav lateral** (Tablero, Tickets, Técnicos, Informes, Ajustes).
- **Técnico:** **tab bar inferior** fija (Hoy, Agenda, Perfil) — pulgar-friendly.
- **Cliente:** sin navegación; una sola pantalla de seguimiento.

### 3.3 Trazabilidad (el corazón de la confianza)
Componente estrella: **Activity Timeline** vertical, presente en todas las vistas de detalle.
- Cada evento = ícono + actor + acción + hora relativa ("hace 2 h") y absoluta al pasar el ratón.
- Diferencia **cambios de estado** (hito grande) de **notas/avisos** (entradas menores).
- Para el cliente: versión simplificada (solo hitos). Para staff: completa (incluye quién asignó, notas internas, avisos enviados/fallidos).
- Alimentado por tu `audit_log` + eventos `fsc.v1.ticket.*`, que **ya existen**.

### 3.4 Indicadores clave (chips/badges escaneables)
- **Estado** (color por fase) · **Prioridad** (con ícono de llama para crítica) · **SLA**: "tiempo en estado" y **semáforo de vencimiento** (verde/ámbar/rojo) según umbrales (p. ej. sin asignar > 2 h = rojo).
- En tarjetas y filas: avatar del técnico asignado, ETA, y un **punto de color** de salud del ticket.

### 3.5 Paneles de control
- **Supervisor – Dashboard:** tarjetas KPI arriba; debajo, "Necesitan atención" (sin asignar / vencidos / aviso fallido) + gráfico simple (avisos por día, tiempo medio de cierre) + carga por técnico.
- **Técnico – Hoy:** contador "3 trabajos · 1 en curso", lista priorizada, progreso del día.
- **Cliente – Tracker:** progreso visual + ETA + "tu técnico" + contacto.

### 3.6 Formularios y workflows
- **Crear aviso (cliente):** formulario por pasos cortos (datos → problema → confirmación), validación en vivo amable, y pantalla de éxito con número de ticket + enlace de seguimiento + (futuro) selección de franja horaria.
- **Asignar (supervisor):** **panel lateral (drawer)** —no modal pequeño— con buscador de técnico, su carga actual, ETA sugerida y nota. (Esto sustituye el modal que daba problemas.)
- **Cerrar (técnico):** hoja inferior (bottom sheet) con resolución, (futuro) foto y firma del cliente.

---

## 4. Flujos de usuario mejorados

### 4.1 Crear ticket (cliente)
1. Abre enlace/QR → formulario corto, 1 dato por foco, validación suave.
2. Envía → pantalla de éxito con **número + stepper en "Recibido"** + enlace guardable.
3. Recibe WhatsApp de confirmación → el enlace abre el **tracker en vivo**.
*Mejora clave: confirmación visual inmediata y seguimiento, no solo "enviado".*

### 4.2 Asignar ticket (supervisor)
1. En el Kanban, el aviso entra en la columna **Triage** (badge "nuevo", animación sutil).
2. Triar = fijar prioridad (chips) → pasa a **Dispatch**.
3. Asignar = abre **drawer**: busca técnico → ve su carga → confirma (ETA opcional).
*Mejora clave: arrastrar/soltar entre columnas + drawer con contexto, sin modales diminutos.*

### 4.3 Actualizar estado (técnico)
1. "Hoy" lista sus trabajos; toca uno.
2. **Un botón primario grande** según fase: *Voy en camino* (pide ETA con presets: +15/+30/+60 min) → *He llegado* → *Cerrar*.
3. Cada toque dispara el WhatsApp al cliente automáticamente.
*Mejora clave: cero ambigüedad — siempre hay UNA acción evidente.*

### 4.4 Ver historial (todos)
- Vista de detalle con **timeline** siempre visible a la derecha (desktop) o como pestaña (móvil). Cliente ve hitos; staff ve todo.

### 4.5 Cerrar ticket (técnico/supervisor)
1. Desde *On site* → *Cerrar*: bottom sheet con resolución (obligatoria), (futuro) foto/firma.
2. Estado → **Close**, WhatsApp final + (futuro) petición de **valoración** al cliente.
3. En el Kanban pasa a la columna Cerrados (colapsable) con resumen.

---

## 5. Componentes y patrones UI recomendados

**Componentes base (design system):**
- Botones (primario/secundario/fantasma/peligro), inputs con label flotante y ayuda, **select con búsqueda**, date/time picker con presets, textarea con contador.
- **Badges/Chips** de estado y prioridad, **Avatar** (iniciales con color), **Tooltip**.
- **Card**, **Tabla** con orden y selección, **Kanban column/card**, **Drawer** lateral, **Bottom sheet** (móvil), **Modal** solo para confirmaciones.
- **Toasts** (ya los tienes), **Banner** de alerta, **Empty states** ilustrados con CTA, **Skeleton loaders** mientras carga.
- **Timeline/Activity feed**, **Stepper de progreso**, **Stat card (KPI)**, **Search global (cmd+K)**.

**Patrones:**
- **Optimistic UI** (la acción se refleja al instante, se confirma al guardar).
- **Acción primaria única** por pantalla; secundarias en menú "···".
- **Estados explícitos:** cargando / vacío / error / éxito en cada vista.
- **Accesibilidad:** contraste AA, foco visible, navegable por teclado, objetivos táctiles ≥ 44px.
- **Microinteracciones** sutiles (transición de estado, "nuevo" pulsante) — sin exagerar.
- **Responsive real:** móvil-first para técnico/cliente; densidad alta solo en supervisor.

---

## 6. Prioridades de implementación (mayor impacto primero)

### 🥇 Fase 1 — "Se ve profesional ya" (rápido, altísimo impacto)
1. **Design system** (tokens de color/tipografía/espaciado en `shared/styles.css`) → todo mejora de golpe.
2. **Stepper de progreso + tracker del cliente** (la cara visible para tus clientes).
3. **Activity Timeline** reutilizable (usa el `audit_log` existente) en las 3 vistas.
4. **Login decente** (pantalla cuidada; ocultar "X-FSC-Role-Key" tras "Acceder como supervisor/técnico").
5. **Estados de carga/vacío/error** + skeletons.

### 🥈 Fase 2 — "Funciona como un SaaS"
6. **Técnico móvil-first** (tab bar, tarjetas, botón primario gigante, Maps/Llamar).
7. **Supervisor: KPIs + Kanban** (arrastrar entre fases) y **drawer de asignación** (sustituye el modal).
8. **Indicadores SLA** (tiempo en estado, semáforo de vencimiento, prioridad con semántica).

### 🥉 Fase 3 — "Diferencial competitivo"
9. **Búsqueda global (cmd+K)** + filtros guardados.
10. **Dashboard con gráficos** (avisos/día, tiempo medio de cierre, carga por técnico).
11. **Centro de notificaciones** in-app + **valoración** del cliente al cerrar.
12. **Adjuntos**: foto del equipo (cliente) y foto/firma de resolución (técnico).

### Nota de arquitectura
Se puede hacer **incrementalmente sobre el stack actual** (HTML/CSS/JS + backend Python): empieza por los tokens y componentes en `shared/`. Si más adelante crece, migrar a un framework de componentes (p. ej. React/Vue + una librería como shadcn/ui o Material) con el mismo design system ya definido aquí — sin rehacer la visión.

---

## Resumen en una frase
Tres productos sobre un dato común: **cliente = tracker tranquilizador**, **técnico = app móvil de una acción**, **supervisor = torre de control con Kanban y KPIs** — todos unidos por un **design system** consistente y un **timeline de trazabilidad** visible.
