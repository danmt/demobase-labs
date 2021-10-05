import { Idl } from '@project-serum/anchor';
import * as idlJson from './lib/idl.json';

export * from './lib/types';
export * from './lib/utils';
export const idl = idlJson as Idl;
