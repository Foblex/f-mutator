import {inject, Signal, signal} from '@angular/core';
import {deepMerge, deepDelete, DeepPartial} from './utils';
import {IMutatorChange} from './i-mutator-change';
import {MUTATOR_CONFIG} from './provide-mutator';

function deepClone<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

interface Changes<T> {
  value: DeepPartial<T>;
  action: 'create' | 'update' | 'delete';
}

export abstract class Mutator<T extends object> {
  private _base: T = {} as T;
  private readonly _undoStack: Changes<T>[] = [];
  private readonly _redoStack: Changes<T>[] = [];

  private readonly _config = inject(MUTATOR_CONFIG, {optional: true});

  private readonly _limit = this._config?.limit || 50;

  private readonly _change = signal<IMutatorChange>({
    version: 0,
    notifier: null
  });

  private readonly _canUndo = signal(false);
  private readonly _canRedo = signal(false);

  public get changes(): Signal<IMutatorChange> {
    return this._change.asReadonly();
  }

  public get canUndo(): Signal<boolean> {
    return this._canUndo.asReadonly();
  }

  public get canRedo(): Signal<boolean> {
    return this._canRedo.asReadonly();
  }

  public initialize(value: T): void {
    this._base = value;
    this._undoStack.length = 0;
    this._redoStack.length = 0;
    this._updateSignals();
    this._change.set({version: 0, notifier: null});
  }

  public create(patch: DeepPartial<T>, notifier?: string): void {
    this._addChanges({
      value: patch,
      action: 'create'
    }, notifier || null);
  }

  public update(patch: DeepPartial<T>, notifier?: string): void {
    this._addChanges({
      value: patch,
      action: 'update'
    }, notifier || null);
  }

  public delete(patch: DeepPartial<T>, notifier?: string): void {
    this._addChanges({
      value: patch,
      action: 'delete'
    }, notifier || null);
  }

  public _addChanges(changes: Changes<T>, notifier: string | null): void {
    this._undoStack.push(deepClone(changes));

    if (this._undoStack.length > this._limit) {
      const oldest = this._undoStack.shift()!;
      this._base = this._applyChange(this._base, oldest);
    }

    this._redoStack.length = 0;
    this._updateSignals();

    this._setChangeObject(notifier);
  }

  private _setChangeObject(notifier: string | null): void {
    this._change.set({version: this._change().version + 1, notifier});
  }

  public getSnapshot(): T {
    let result: T = deepClone(this._base);

    for (const change of this._undoStack) {
      result = this._applyChange(result, change);
    }

    return result;
  }

  private _applyChange(result: T, change: Changes<T>): T {
    switch (change.action) {
      case 'create':
      case 'update':
        return deepMerge(result, change.value);
      case 'delete':
        return deepDelete(result, change.value);
      default:
        throw new Error(`Unknown action: ${change.action}`);
    }
  }

  public undo(): void {
    const last = this._undoStack.pop();
    if (last) {
      this._redoStack.push(last);
      this._updateSignals();
      this._setChangeObject(null);
    }
  }

  public redo(): void {
    const restored = this._redoStack.pop();
    if (restored) {
      this._undoStack.push(restored);
      this._updateSignals();
      this._setChangeObject(null);
    }
  }

  private _updateSignals(): void {
    this._canUndo.set(this._undoStack.length > 0);
    this._canRedo.set(this._redoStack.length > 0);
  }
}
