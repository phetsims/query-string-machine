// Copyright 2024, University of Colorado Boulder

/**
 * ESLint configuration for query-string-machine.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import strictBooleanExpressionsConfig from '../perennial-alias/js/eslint/config/util/strictBooleanExpressionsConfig.mjs';
import phetLibraryEslintConfig from '../perennial-alias/js/eslint/config/phet-library.eslint.config.mjs';

export default [
  ...phetLibraryEslintConfig,
  ...strictBooleanExpressionsConfig
];
