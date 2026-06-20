# CLAUDE.md — UI Framework (Angular, styled mode)

Este archivo es el **blueprint** del proyecto: la fuente de verdad de cómo se
construye y qué significa que un componente esté "terminado". Los loops
(`/goal`) referencian este documento como su criterio de aceptación. Si algo no
está aquí, no es una convención del proyecto.

---

## 1. Qué es esto

Librería de componentes Angular en **styled mode**, dirigida por **design
tokens**, pensada para reutilizarse entre proyectos de cliente. La feature
central NO es la cantidad de componentes, sino el **motor de temas**: un cliente
= un preset. Re-skinear toda la librería para un cliente nuevo debe lograrse
cambiando únicamente tokens semánticos, sin tocar un solo componente.

Regla mental: **si para personalizar un cliente tienes que editar un componente,
algo está mal en la arquitectura de tokens.**

---

## 2. Stack y convenciones

- **Angular 19+**, componentes **standalone** (sin NgModules).
- **Signals** para todo el estado: `signal()`, `computed()`, `effect()`.
- **Signal inputs/outputs**: `input()`, `input.required()`, `output()`,
  `model()` para two-way binding. Nada de `@Input()`/`@Output()` decoradores.
- **`inject()`** en lugar de inyección por constructor.
- **`ChangeDetectionStrategy.OnPush`** obligatorio en todos los componentes.
- **Nuevo control flow** (`@if`, `@for`, `@switch`), nunca `*ngIf`/`*ngFor`.
- Prefijo de selector: **`ui-`** (ej. `ui-button`, `ui-dialog`).
- Las primitivas de comportamiento (overlay, focus trap, posicionamiento)
  **envuelven `@angular/cdk`**. No se reimplementan a mano.
- Monorepo **Nx**. Límites de módulo respetados (un componente no importa de
  otro saltándose la API pública).

### Estructura del monorepo

```
libs/ui/
  tokens/       Fuente de tokens (Style Dictionary) -> emite CSS variables
  primitives/   overlay / focus / a11y (envuelven Angular CDK)
  components/   button, input, dialog, table, ...
  themes/       presets (un archivo de preset por cliente)
apps/docs/      Sitio de documentación Angular propio (demos + API vivas)
```

---

## 3. Sistema de design tokens (3 niveles)

Los tokens viven en `libs/ui/tokens` y compilan a variables CSS con Style
Dictionary. Tres niveles, con reglas estrictas de qué puede referenciar qué:

| Nivel          | Ejemplo                                                                                         | Contexto           | Quién lo usa                                                  |
| -------------- | ----------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------- |
| **Primitivo**  | `--ui-blue-500`, `--ui-space-3`, `--ui-radius-md`                                               | Sin significado    | Solo lo referencian los semánticos                            |
| **Semántico**  | `--ui-color-primary`, `--ui-color-surface`, `--ui-color-text`, `--ui-focus-ring`, `--ui-radius` | Rol de diseño      | **Esta es la capa que el preset de cada cliente sobrescribe** |
| **Componente** | `--ui-button-bg`, `--ui-button-text`, `--ui-button-padding-x`                                   | Una pieza concreta | Solo cuando un componente necesita control fino               |

### Reglas duras de tokens (verificables por lint)

- El SCSS de un componente referencia **solo tokens semánticos o de componente**.
  Nunca un primitivo directamente. Nunca un valor crudo (`#fff`, `12px`, `rgb()`).
- Un token de componente mapea a un semántico:
  `--ui-button-bg: var(--ui-color-primary);`
- El modo oscuro se logra **re-mapeando tokens semánticos** bajo una clase
  (`.app-dark`), nunca con condicionales en el componente.

---

## 4. Anatomía de un componente

Cada componente vive en su carpeta con exactamente estos archivos:

```
components/button/
  button.component.ts       Lógica + API (signal inputs/outputs)
  button.component.html     Plantilla (nuevo control flow)
  button.component.scss     Estilos (solo tokens semánticos/componente)
  button.component.spec.ts  Tests de interacción + a11y (jest-axe)
  button.docs.ts            Metadata de doc (descripción + tabla de API)
  button.demos.ts           Demos vivos (una demo por variante/estado)
  index.ts                  API pública (barrel)
```

### Convenciones de API

- Variantes y estados como **signal inputs tipados** con union types:
  `variant = input<'primary' | 'secondary' | 'text'>('primary');`
- Estados estándar cubiertos donde apliquen: `disabled`, `loading`, `size`.
- Eventos como `output()`. Un componente deshabilitado **no** emite eventos.
- Las clases del host se derivan de la variante (host bindings), no se pasan
  manualmente desde fuera.
- Componentes de formulario implementan **`ControlValueAccessor`** (funcionan
  con `ngModel` y `formControl`).

---

## 5. Definition of Done (lo que el `/goal` comprueba)

Un componente está "done" cuando **todo** lo siguiente se cumple:

- [ ] **API**: signal inputs/outputs tipados; variantes y estados expuestos y
      documentados.
- [ ] **Estilo**: usa solo tokens semánticos/de componente; cero valores
      hardcodeados; soporta claro/oscuro vía tokens.
- [ ] **A11y**: roles/ARIA correctos, navegación por teclado completa, foco
      visible, **cero violaciones de axe-core**.
- [ ] **Tests**: tests de interacción que cubren todos los estados (incl. que
      `disabled` no dispara eventos) + test de a11y con jest-axe.
- [ ] **Docs**: `<name>.docs.ts` (API + descripción) y `<name>.demos.ts` (una demo por variante/estado), registrados en el sitio de docs.
- [ ] **Calidad**: `typecheck` limpio, `lint` limpio, `OnPush`, sin `::ng-deep`.

---

## 6. Accesibilidad (no negociable)

- Todo lo interactivo es alcanzable y operable por teclado.
- Foco siempre visible usando `--ui-focus-ring` (nunca `outline: none` sin
  reemplazo).
- Overlays: focus trap + restauración del foco al cerrar + cierre con `Esc`
  (vía el primitive de overlay sobre CDK).
- `aria-*` y roles correctos; estados (`aria-disabled`, `aria-expanded`, etc.)
  reflejan el estado real del signal.
- El test de a11y (jest-axe) es parte del spec y debe dar 0 violaciones.

---

## 7. Temas y presets (modelo de cliente)

- Un **preset** es un archivo en `libs/ui/themes/` que mapea los tokens
  semánticos a valores primitivos (colores de marca, radio, tipografía).
- **Un cliente = un preset.** Cambiar de cliente = cambiar el preset activo.
- Activación por clase en la raíz (`.ui-theme-acme`) o cargando el CSS del
  preset correspondiente.
- Modo oscuro: clase `.app-dark` que re-mapea los semánticos.
- Crear un preset nuevo **no** debe requerir tocar ningún componente.

---

## 8. Comandos (los checks mecánicos del loop)

Estos son los comandos que el evaluador del `/goal` ejecuta cada turno:

```bash
nx build ui-tokens                  # compila tokens -> CSS vars
nx test ui-components --watch=false # tests de interacción + a11y (jest-axe)
nx lint ui-components               # ESLint + Stylelint (incl. regla de tokens)
nx run ui-components:typecheck      # tsc --noEmit
nx build docs                       # el sitio de documentación compila
```

La **regla de lint de tokens** (Stylelint) prohíbe en el SCSS de componentes:
valores de color crudos (`#`, `rgb`, `hsl`), unidades de tamaño hardcodeadas, y
el uso directo de tokens primitivos. Es lo que hace verificable la sección 3.

---

## 9. Anti-patrones (rechazar siempre)

- `::ng-deep` o selectores que perforen la encapsulación.
- Cualquier color, espaciado o radio hardcodeado en un componente.
- Referenciar tokens primitivos desde un componente.
- Reimplementar overlay/focus/posicionamiento en vez de envolver `@angular/cdk`.
- Condicionales de tema dentro del componente (`@if (dark) ...`).
- Estilos globales que se filtren fuera del componente o del `@layer`.
- NgModules, decoradores `@Input/@Output`, `*ngIf/*ngFor`, DI por constructor.

---

## 10. Cómo usan los loops este archivo

- El **setup inicial** (scaffold Nx + Style Dictionary + harness de tests/axe/
  lint + Storybook) es una tarea one-shot, **no** un loop.
- El **primer loop** es el del `Button`, que valida toda la tubería y se
  convierte en la plantilla de referencia.
- Los demás componentes reusan el mismo `/goal` cambiando el nombre; los de
  layout (poca lógica) son candidatos a `/batch` en paralelo.
- El `DataTable` se construye aparte: es un mini-proyecto (orden, paginación,
  selección, virtual scroll), no entra en un loop genérico.
