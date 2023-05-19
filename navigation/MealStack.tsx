import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react'

import MealBuilder from '../components/Meals/MealBuilder';
import MealInfo from '../components/Meals/MealInfo';
import Meals from '../components/Meals/Meals';

const MealStackNavigator = createNativeStackNavigator();

export default function MealStack() {

    return (
        <MealStackNavigator.Navigator>
          <MealStackNavigator.Group>
            <MealStackNavigator.Screen name="Home" component={Meals} options={{headerShown: false}}/>
          </MealStackNavigator.Group>
          <MealStackNavigator.Group screenOptions={{ presentation: 'modal', headerShown: false }}>
            <MealStackNavigator.Screen options={{title:'New Meal'}} name="MealBuilder" component={MealBuilder} />
            <MealStackNavigator.Screen options={{title: 'Meal Info'}} name="MealInfo" component={MealInfo} />
          </MealStackNavigator.Group>
        </MealStackNavigator.Navigator>
      );
}