/**
 * Entry point of the app.
 *
 * This file is deliberately thin: it only registers the root component.
 * Everything else (providers, navigation, bootstrap) lives in src/app/.
 */
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import {App} from '@app/App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
