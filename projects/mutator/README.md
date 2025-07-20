# @foblex/mutator

> Lightweight Angular Signals state engine with deep patching, undo/redo, and semantic notifier.

`@foblex/mutator` is a small TypeScript library built on top of `signal()` from `@angular/core`.  
It allows you to mutate state (`create / update / delete`), supports undo/redo with history limits, and emits semantic updates via a notifier string.

|                     |                                   |
|---------------------|-----------------------------------|
| **Framework**       | Angular 20 + (Signals)            |
| **Size**            | < 2 KB min+gzip                   |
| **Undo limit**      | 50 (customizable via constructor) |
| **License**         | MIT                               |

---

## 🚀 Quick Start

```bash
npm i @foblex/mutator
```

```ts
import { effect, inject, Injectable } from '@angular/core';
import { Mutator } from '@foblex/mutator';

// 1. Define your state shape
interface FlowState {
  nodes: Record<string, { x: number; y: number }>;
}

// 2. Create a store class extending Mutator
@Injectable({ providedIn: 'root' })
class FlowStore extends Mutator<FlowState> {}

// 3. Inject and initialize the store
const flow = inject(FlowStore);
flow.initialize({ nodes: {} });

// 4. React to changes with `effect()`
effect(() => {
  const { version, notifier } = flow.changes();
  console.log('Changed (v' + version + ') by', notifier);
  console.table(flow.getSnapshot().nodes);
});

// 5. Perform operations
flow.create({ nodes: { n1: { x: 0, y: 0 } } }, 'init');
flow.update({ nodes: { n1: { x: 100, y: 100 } } }, 'move');
flow.update({ nodes: { n1: { y: 200 } } }, 'drag');
flow.undo(); // ⬅️ back to y: 100
flow.redo(); // ➡️ forward to y: 200
```

---
## 🔧 API Reference

| Method                                   | Description                                              |
|------------------------------------------|----------------------------------------------------------|
| `initialize(base)`                       | Set initial state and clears history                     |
| `create(patch, notifier?)`               | Adds new data                                            |
| `update(patch, notifier?)`               | Updates existing fields (deep merge)                     |
| `delete(patch, notifier?)`               | Removes keys deeply                                      |
| `undo() / redo()`                        | Undo / redo one step                                     |
| `getSnapshot()`                          | Current state (base + stack)                             |
| `changes: Signal<{ version; notifier }>` | Version + source of change                               |
| `canUndo / canRedo: Signal<boolean>`     | Live flags for UI buttons                                |

### Types

```ts
interface MutatorChange {
  version: number;
  notifier: string | null;
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
```

---

## ⚙️ Undo Limit

```ts
provideMutator({
  limit: 100, // Default is 50
})
```

---

## 📄 License

MIT © Foblex
