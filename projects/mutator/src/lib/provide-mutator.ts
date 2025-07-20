import {InjectionToken, Provider} from '@angular/core';

export interface MutatorConfig {
  limit?: number;
}

export const MUTATOR_CONFIG = new InjectionToken<MutatorConfig>('F_MUTATOR_CONFIG');

export function provideMutator(config: MutatorConfig = {}): Provider[] {
  return [
    {
      provide: MUTATOR_CONFIG,
      useValue: config,
    }
  ];
}
