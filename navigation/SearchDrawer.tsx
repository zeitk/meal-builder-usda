import 'react-native-gesture-handler';
import React from 'react'

import { createDrawerNavigator } from '@react-navigation/drawer';
import Search from '../components/Search';
import SearchSettings from '../components/SearchSettings';

const Drawer = createDrawerNavigator();

export default function SearchDrawer() {
    return (
      <Drawer.Navigator backBehavior={'history'} initialRouteName={'Search'} screenOptions={{drawerType: 'back', drawerPosition: 'right', headerShown: false}}>
        <Drawer.Screen name="Search" component={Search} />
        <Drawer.Screen name="Settings" component={SearchSettings} />
      </Drawer.Navigator>
    );
  }