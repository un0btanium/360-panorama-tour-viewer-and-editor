import Main from './main';

// IE11 fix (should be done by babel transpiler by that does not work apparently)
import 'node_modules/core-js/es/promise';

// start application
Main.setup();