import {DeepPartial} from './deep-partial';

export function deepDelete<T>(target: T, patch: DeepPartial<T>): T {
  const out: any = Array.isArray(target) ? [...target] : { ...target };

  for (const k in patch) {
    const pv: any = (patch as any)[k];

    if (pv && typeof pv === 'object' && !Array.isArray(pv)) {
      if (out[k]) out[k] = deepDelete(out[k], pv);
    } else {
      delete out[k];
    }
  }
  return out;
}
