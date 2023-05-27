import React, { useEffect } from 'react'

import Search from '../components/Search';
import SearchSettings from '../components/SearchSettings';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SearchFromMeals from '../components/Meals/SearchFromMeals';

const SearchStack = createNativeStackNavigator();

export default function SearchDrawer(props: any) {

    useEffect(() => {
      console.log(props)
    },[])

    return (
      <SearchStack.Navigator>
        <SearchStack.Group>
          { (props.name === "Meals") &&
            <SearchStack.Screen name="Search" component={SearchFromMeals} options={{headerShown: false}} ></SearchStack.Screen>
          }
          { (props.route !== undefined && props.route.params.name === "Tabs") &&
            <SearchStack.Screen name="Search" component={Search} options={{headerShown: false}}></SearchStack.Screen>
          }
        </SearchStack.Group>
        <SearchStack.Group screenOptions={{  presentation: 'modal',headerShown: false,  }}>
            <SearchStack.Screen name="Settings" component={SearchSettings} ></SearchStack.Screen>
        </SearchStack.Group>
      </SearchStack.Navigator>
    );
  }