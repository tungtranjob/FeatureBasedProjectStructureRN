/**
 * Entry point của app.
 *
 * File này cố tình mỏng: nó chỉ đăng ký component gốc.
 * Mọi thứ khác (provider, navigation, bootstrap) nằm trong src/app/.
 */
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import {App} from '@app/App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
