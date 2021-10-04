export * from './lib/demobase.service';
export * from './lib/types';
export * from './lib/utils';

import { Idl } from '@project-serum/anchor';
import * as idlJson from './lib/idl.json';

export const idl = idlJson as Idl;
