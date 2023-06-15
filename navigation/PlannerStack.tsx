import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react'

import Planner from '../components/Planner/Planner';
import PlanBuilder from '../components/Planner/PlanBuilder';
import PlanInfo from '../components/Planner/PlanInfo';
import MealBuilder from '../components/Meals/MealBuilder';

const PlannerStackNavigator = createNativeStackNavigator();

export default function PlannerStack() {
    return (
        <PlannerStackNavigator.Navigator>
          <PlannerStackNavigator.Group>
            <PlannerStackNavigator.Screen name="Home" component={Planner} options={{headerShown: false}}/>
          </PlannerStackNavigator.Group>
          <PlannerStackNavigator.Group screenOptions={{ presentation: 'modal', headerShown: false }}>
            <PlannerStackNavigator.Screen options={{title:'New Plan'}} name="PlanBuilder" component={PlanBuilder} />
            <PlannerStackNavigator.Screen options={{title:'Plan Info'}} name="PlanInfo" component={PlanInfo} />
            <PlannerStackNavigator.Screen options={{title:'Meal Builder'}} name="MealBuilder" component={MealBuilder} />
          </PlannerStackNavigator.Group>
        </PlannerStackNavigator.Navigator>
      );
}