// Copyright 2025, University of Colorado Boulder
/**
 * For use of QSM as a module
 * @author Michael Kauzmann (PhET Interactive Simulations)`
 */

import QueryStringMachineModule from './QueryStringMachineModule.js';

// @ts-expect-error - QueryStringMachineModule has more correct types, but I don't want to expose that to the whole codebase on a friday afternoon, https://github.com/phetsims/query-string-machine/issues/45
self.QueryStringMachine = QueryStringMachineModule;