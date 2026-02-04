# Persistence Configuration Component Architecture

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    persistence-edit.vue                          │
│                    (Main Component)                              │
│                                                                   │
│  State:                                                          │
│  - persistence (from store, writable)                           │
│  - ready, currentTab                                            │
│  - configurationPopupOpen, definitionsPopupOpen                 │
└────────────────────────────────────────────────────────────────┬┘
         │
         ├─────────────────────┬──────────────────────────────────┐
         │                     │                                  │
         ▼                     ▼                                  ▼
    ┌─────────────┐   ┌──────────────────┐        ┌────────────────────┐
    │configuration│   │ definitions-popup│        │ other components   │
    │   -popup    │   │                  │        │ (config pickers)   │
    └──────┬──────┘   └────────┬─────────┘        └────────────────────┘
           │                    │
           │ @configuration     │ @definitions
           │ -update            │ -update
           │                    │
           │ :persistence       │ :persistence (direct ref)
           │ (direct ref)       │ :persistenceLocal (cloned copy)
           │ :persistenceLocal  │
           │ (cloned copy)      │
           │                    │
           │                    └────────────────────┬──────────────────┐
           │                                         │                  │
           │                                         ▼                  ▼
           ├────────────────┬──────────────     ┌──────────────┐  ┌────────────┐
           │                │                   │cron-strategy │  │ filter-    │
           ▼                ▼                   │   -popup     │  │   popup    │
    ┌─────────────┐  ┌─────────────┐           │ (definitions)│  │ (definitions)│
    │strategy-    │  │filter-      │           └──────────────┘  └────────────┘
    │  picker     │  │  picker     │                MUTATES            MUTATES
    └──────┬──────┘  └──────┬──────┘           persistenceLocal   persistenceLocal
           │                │
           │ :persistence   │ :persistence
           │ (direct ref)   │ (direct ref)
           │                │
           ├────────────────┼────────────────┐
           │                │                │
           ▼                ▼                │
    ┌──────────────┐  ┌────────────┐        │
    │cron-strategy │  │ filter-    │        │
    │   -popup     │  │   popup    │        │
    │ (picker)     │  │ (picker)   │        │
    └──────────────┘  └────────────┘        │
         MUTATES           MUTATES           │
        persistence       persistence        │
     (ROOT OBJECT)     (ROOT OBJECT)         │
                                             │
           │                │                │
           │ @cron-strategy │ @filter        │
           │ -config-update │ -config-update │
           │                │                │
           └────────┬───────┴────────────────┘
                    │
                    └─> Updates picker's local state
                        Then emits to parent
```

## Data Flow Details

### 1. **persistence-edit.vue** (Root/Main Component)

- **Owns**: `persistence` (ref from Pinia store)
- **Creates**: All child popup components
- **Role**: Orchestrates the main UI and popups

### 2. **configuration-popup.vue** (Child of persistence-edit)

- **Props Received**:
  - `:persistence` - **Direct reference** to root's persistence object
  - `:configurationIndex` - which config to edit
  - `:suggestedStrategies` - read-only

- **Data Flow**:
  - Creates **LOCAL CLONE**: `persistenceLocal` in data() **for `persistence.configs` editing**
  - Watches prop `persistence` to update local copy
  - Passes `persistence` (root) to pickers for **definitions** (strategies/filters)
  - **DOES NOT mutate** `persistence.configs` directly
  - **EMITS** `@configuration-update` event with modified `persistenceLocal` (configs only)
  - Parent handler: `saveConfiguration($event)` merges configs back into root persistence

- **Impact**: Changes are emitted only, parent merges back

### 3. **strategy-picker.vue** (Child of configuration-popup)

- **Props Received**:
  - `:persistence` - **Direct reference** to root's persistence object (NOT the clone!)
  - `:strategies` - available strategy names (computed from persistenceLocal)
  - `:value` - currently selected strategies

- **Data Flow**:
  - Creates local copy: `localValue` (selected strategies)
  - Creates local copy: `localStrategies` (available strategies)
  - Has nested `cron-strategy-popup`
  - **EMITS** `@strategies-selected` when Done clicked
  - Parent (configuration-popup) handles via `onStrategiesSelected()`

- **Impact**: Does NOT mutate persistence directly at this level

### 4. **filter-picker.vue** (Child of configuration-popup)

- **Props Received**:
  - `:persistence` - **Direct reference** to root's persistence object (NOT the clone!)
  - `:filters` - available filter names (computed from persistenceLocal)
  - `:value` - currently selected filters

- **Data Flow**:
  - Creates local copy: `localValue` (selected filters)
  - Creates local copy: `localFilters` (available filters)
  - Has nested `filter-popup`
  - **EMITS** `@filters-selected` when Done clicked
  - Parent (configuration-popup) handles via `onFiltersSelected()`

- **Impact**: Does NOT mutate persistence directly at this level

### 5. **cron-strategy-popup.vue** (Called from strategy-picker)

- **Props Received**:
  - `:persistence` - **Direct reference** to root's persistence object
  - `:cronStrategy` - strategy being edited (or undefined for new)

- **Data Flow**:
  - Creates local `currentCronStrategy` from prop
  - Watches prop to sync changes
  - On updateCronStrategy():
    - **MUTATES** `persistence.cronStrategies` array directly
    - **EMITS** `@cronStrategyConfigUpdate` event with strategy
    - Parent (strategy-picker) handles via `handleCronStrategyUpdate($event)`
    - Updates picker's local state to show new strategy

- **Direct Mutations**: ✅ YES - mutates ROOT persistence object (intended)
- **Impact**: Changes are IMMEDIATE to root persistence object
- **Why emit?** Picker maintains its own `localValue`/`localStrategies` and does not auto-sync from root; the event updates the open picker UI.

### 6. **filter-popup.vue** (Called from filter-picker)

- **Props Received**:
  - `:persistence` - **Direct reference** to root's persistence object
  - `:filter` - filter being edited (or undefined for new)
  - `:filterType` - what type of filter

- **Data Flow**:
  - Similar pattern to cron-strategy-popup from strategy-picker
  - **MUTATES** `persistence[filterType.name]` array directly
  - **EMITS** `@filter-config-update` event with filter
  - Parent (filter-picker) handles via `handleFilterUpdate($event)`
  - Updates picker's local state to show new filter

- **Direct Mutations**: ✅ YES - mutates ROOT persistence object (intended)
- **Impact**: Changes are IMMEDIATE to root persistence object
- **Why emit?** Picker maintains its own `localValue`/`localFilters` and does not auto-sync from root; the event updates the open picker UI.

### 7. **definitions-popup.vue** (Child of persistence-edit)

- **Props Received**:
  - `:persistence` - **Direct reference** to root's persistence object
  - `:editable` - read-only boolean

- **Data Flow**:
  - Creates **LOCAL CLONE**: `persistenceLocal` in data()
  - Watches prop `persistence` to update local copy
  - Passes `persistenceLocal` to nested popups (cron-strategy, filter)
  - On back/close: reverts `persistenceLocal` back to original
  - On Done: **EMITS** `@definitions-update` with modified copy
  - Parent handler: `saveDefinitions($event)` merges changes back

- **Impact**: Changes are NOT immediate; only applied on "Done"

### 8. **cron-strategy-popup.vue** (Called from definitions-popup)

- **Props Received**:
  - `:persistence` - **Direct reference** to `persistenceLocal` (the clone)
  - `:cronStrategy` - current strategy being edited

- **Data Flow**:
  - Creates local `currentCronStrategy` from prop
  - Watches prop to sync changes
  - On updateCronStrategy():
    - **MUTATES** `persistence.cronStrategies` array directly
    - **EMITS** `@cronStrategyConfigUpdate` event
    - Parent (definitions-popup) handles via `handleCronStrategyUpdate()`

- **Direct Mutations**: ✅ YES - but safe
  - Since persistence is actually `persistenceLocal` (a clone), mutations don't affect root

### 9. **filter-popup.vue** (Called from definitions-popup)

- **Props Received**:
  - `:persistence` - **Direct reference** to `persistenceLocal` (the clone)
  - `:filter` - current filter being edited
  - `:filterType` - what type of filter

- **Data Flow**:
  - Similar pattern to cron-strategy-popup from definitions-popup
  - **MUTATES** `persistence[filterType.name]` array directly
  - **EMITS** `@filter-config-update` event
  - Parent (definitions-popup) handles via `handleFilterUpdate()`

- **Direct Mutations**: ✅ YES - but safe
  - Since persistence is actually `persistenceLocal` (a clone), mutations don't affect root

---

## Key Data Flow Patterns

### Pattern A: Picker-Nested Popup (Intended direct ROOT mutations)

```
persistence-edit.persistence (ROOT OBJECT)
    ↓
configuration-popup :persistence (direct ref, also has persistenceLocal clone)
    ├─→ persistenceLocal (clone for display purposes)
    │
    ├─→ strategy-picker :persistence (DIRECT REF TO ROOT, not the clone!)
    │   └─→ cron-strategy-popup :persistence (DIRECT REF TO ROOT)
    │       └─→ MUTATES persistence.cronStrategies IMMEDIATELY
    │           Changes appear INSTANTLY in ROOT object
    │
    └─→ filter-picker :persistence (DIRECT REF TO ROOT, not the clone!)
        └─→ filter-popup :persistence (DIRECT REF TO ROOT)
            └─→ MUTATES persistence[filterType] IMMEDIATELY
                Changes appear INSTANTLY in ROOT object

✅ Intended: Mutations bypass configuration-popup's local copy
Result: Changes to strategies/filters are IMMEDIATE, even if user cancels config dialog
Note: This is by design so strategy/filter definitions persist globally.
```

### Pattern B: Definitions-Nested Popup (SAFE - Clone Mutations)

```
persistence-edit.persistence (ROOT OBJECT)
    ↓
definitions-popup :persistence (creates persistenceLocal clone)
    ├─→ persistenceLocal != persistence (separate copy)
    ├─→ Passes persistenceLocal to children
    │
    ├─→ cron-strategy-popup :persistence (reference to CLONE)
    │   ├─→ MUTATES persistenceLocal.cronStrategies
    │   └─→ Changes stay in clone
    │
    └─→ filter-popup :persistence (reference to CLONE)
        ├─→ MUTATES persistenceLocal[type]
        └─→ Changes stay in clone

    On "Done":
        EMITS @definitions-update with persistenceLocal
        Parent merges back into ROOT persistence

✅ SAFE: Changes isolated until user confirms
Result: Changes are DELAYED until "Done" is clicked
```

---

## Direct Mutation Impact Matrix

| Component                              | Mutates                         | Target          | Reference Type     | Immediate? | Impact Radius          | Risk Level      |
| -------------------------------------- | ------------------------------- | --------------- | ------------------ | ---------- | ---------------------- | --------------- |
| configuration-popup                    | NO                              | N/A             | Has both           | N/A        | Emits only             | ✅ Safe         |
| strategy-picker                        | NO                              | N/A             | Direct to root     | N/A        | Emits only             | ✅ Safe         |
| filter-picker                          | NO                              | N/A             | Direct to root     | N/A        | Emits only             | ✅ Safe         |
| **cron-strategy-popup** (from picker)  | **persistence.cronStrategies**  | **ROOT object** | **Direct to root** | **YES**    | **ROOT persistence**   | ✅ **INTENDED** |
| **filter-popup** (from picker)         | **persistence[type]**           | **ROOT object** | **Direct to root** | **YES**    | **ROOT persistence**   | ✅ **INTENDED** |
| definitions-popup                      | NO                              | N/A             | Direct + clone     | N/A        | Emits only             | ✅ Safe         |
| cron-strategy-popup (from definitions) | persistenceLocal.cronStrategies | LOCAL clone     | Via definitions    | NO         | definitions-popup only | ✅ Safe         |
| filter-popup (from definitions)        | persistenceLocal[type]          | LOCAL clone     | Via definitions    | NO         | definitions-popup only | ✅ Safe         |

---

## Design Notes

### ✅ Intended: Definitions are separate from configurations

The configuration popup’s local clone exists to isolate edits to `persistence.configs`. Strategy/filter **definitions** created from the pickers should bypass the config clone and update root persistence immediately, because definitions are global and not tied to saving a single configuration.

### ✅ Events are intentional (not redundant)

The nested popups mutate root persistence, but the pickers keep their own local state (`localValue`, `localStrategies`, `localFilters`). Emitted events are required to update the picker UI while the picker popup is still open.

---

## Store Involvement

- **usePersistenceEditStore.ts** provides:
  - `persistence` (ref) - the main data object
  - `savePersistence()` - called by root to persist to API
  - `loadPersistence()` - called by root to load from API
- **Components use store data** but handle updates locally via refs and props

---

## Recommendations

### Keep the current hybrid design (intended)

The current behavior is intentional:

- `persistenceLocal` in configuration-popup is scoped to `persistence.configs`
- Strategy/filter definitions created from pickers update root persistence immediately
- Events from nested popups are required to refresh picker-local state

### Alternative designs (not intended here)

If future requirements change, consider one of these broader patterns:

- **All immediate mutations**: remove clones entirely and accept global, immediate changes
- **All clone + emit**: isolate all edits behind explicit confirmation and merge

---

## Summary

**Current State**: Hybrid approach with two different patterns (intended)

- **definitions-popup path**: Uses clones for definition edits until "Done"
- **configuration-popup path**: Uses a clone for `persistence.configs`, while definition creation (strategies/filters) updates root immediately

**Intent**: Strategy/filter definitions are global and should persist even if the configuration popup is canceled, while configuration edits remain local until saved.
