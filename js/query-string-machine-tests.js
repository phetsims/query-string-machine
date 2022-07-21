// Copyright 2017-2022, University of Colorado Boulder

/**
 * Unit tests for dot. Please run once in phet brand and once in brand=phet-io to cover all functionality.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import qunitStart from '../../chipper/js/sim-tests/qunitStart.js'; // Use local path because there is no path for query string machine, because it is a preload
import './QueryStringMachineTests.js'; // Use local path because there is no path for query string machine, because it is a preload

// Since our tests are loaded asynchronously, we must direct QUnit to begin the tests
qunitStart();