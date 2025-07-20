import {DeepPartial} from './deep-partial';

export function deepMerge<T>(target: T, patch: DeepPartial<T>): T {
  if (typeof target !== 'object' || target === null) return patch as T;
  if (typeof patch !== 'object' || patch === null) return target;

  const out: any = Array.isArray(target)
    ? [...target]
    : { ...target };

  for (const key in patch) {
    if (!Object.prototype.hasOwnProperty.call(patch, key)) continue;

    const patchValue = patch[key];
    const targetValue = (target as any)[key];

    if (isPlainObject(patchValue) && isPlainObject(targetValue)) {
      out[key] = deepMerge(targetValue, patchValue as any);
    } else {
      out[key] = patchValue;
    }
  }

  return out;
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
}
