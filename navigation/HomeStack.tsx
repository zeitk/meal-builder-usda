import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react'

import Home from '../components/Home';
import MealBuilder from '../components/Meals/MealBuilder';
import MealInfo from '../components/Meals/MealInfo';

const MealStackNavigator = createNativeStackNavigator();

export default function HomeStack() {

    return (
        <MealStackNavigator.Navigator>
          <MealStackNavigator.Group>
            <MealStackNavigator.Screen name="Home" component={Home} options={{headerShown: false}}/>
          </MealStackNavigator.Group>
          <MealStackNavigator.Group screenOptions={{ presentation: 'modal', headerShown: false }}>
            <MealStackNavigator.Screen options={{title:'New Meal'}} name="MealBuilderHome" component={MealBuilder} />
            <MealStackNavigator.Screen options={{title: 'Meal Info'}} name="MealInfoHome" component={MealInfo} />
          </MealStackNavigator.Group>
        </MealStackNavigator.Navigator>
      );
}