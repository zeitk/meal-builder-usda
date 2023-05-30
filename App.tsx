import 'react-native-gesture-handler';
import React from 'react'

import { NavigationContainer } from '@react-navigation/native'
import Tabs from './navigation/Tabs';
import { StatusBar } from 'expo-status-bar';


export default function App() {
  return (
    
    // base navigation for app - Tabs will do the heavy lifting
    <NavigationContainer>
      <StatusBar style='auto'/>
       <Tabs></Tabs>
    </NavigationContainer>

  );
}