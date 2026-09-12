import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {bootstrap} from './bootstrap';
import {AppProviders} from './providers/AppProviders';
import {RootNavigator} from './navigation/RootNavigator';

/**
 * The root component.
 *
 * It is deliberately short: everything complicated has been pushed into bootstrap/,
 * providers/ and navigation/. A long App.tsx is a sign the app has nowhere proper
 * to put those things.
 */
export function App() {
  useEffect(() => bootstrap(), []);

  return (
    <AppProviders>
      <StatusBar barStyle="dark-content" />
      <RootNavigator />
    </AppProviders>
  );
}
