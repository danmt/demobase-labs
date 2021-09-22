import { InjectionToken, Provider } from '@angular/core';
import { DemobaseService } from '@demobase-labs/demobase-sdk';

export const DEMOBASE_SERVICE = new InjectionToken<DemobaseService>(
  'DEMOBASE_SERVICE'
);

export const demobaseServiceProvider: Provider = {
  provide: DemobaseService,
  useClass: DemobaseService,
};
