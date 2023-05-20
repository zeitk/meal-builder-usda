import React from 'react'

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Quicklist from '../components/Quicklist';
import Home from '../components/Home';
import Search from "../components/Search";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { useState, useEffect } from 'react';
import QuicklistContext from '../context/QuicklistContext';
import { MealListContext } from '../context/MealList';
import MealStack from './MealStack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IMeal } from '../interfaces/Interfaces';
import HomeStack from './HomeStack';

const TabNavigator = createBottomTabNavigator();

export default function Tabs() {
    
    const [quicklist, setQuicklist] = useState<any[]>([])
    const [mealList, setMealList] = useState<IMeal[]>([])

    useEffect(() => {
        clearMemory();
        getQuicklist();
        getMealList(); 
    }, [])

    // utility function in case memory needs to be wiped
    async function clearMemory() {
        try {
            await AsyncStorage.clear()
        } catch(e) {
            console.error("Error 0", "Memory clear failure")
        }
    }

    // grab the user's quicklist if it exists
    async function getQuicklist() {
        try {
            const priorQuicklist = await AsyncStorage.getItem('@quicklist')
            if (priorQuicklist !== null) {
                setQuicklist( JSON.parse(priorQuicklist) )
            }
        }
        catch(e) {
            console.error("Error 8", "Retrieval failure in Tabs.tsx")
        }
    }

    // grab the user's meal list if it exists
    async function getMealList() {
        try {
            const priorMealList = await AsyncStorage.getItem("@meallist") 
            if (priorMealList !== null)  {
                setMealList(JSON.parse(priorMealList))
            }
        }
        catch(e) {
            console.error("Error 2", "Error retrieving meals in Tabs.tsx") 
        }
    }

    return<>
        <MealListContext.Provider value={{mealList,setMealList}}>
        <QuicklistContext.Provider value={[quicklist,setQuicklist]}>

        <TabNavigator.Navigator>
            <TabNavigator.Screen name="HomeStack" component={HomeStack} options={{title: "Home", headerShown: true, tabBarIcon() {
                return<>
                    <Feather name="home" size={20} color="black"></Feather>
                    </>
                },}}></TabNavigator.Screen>
            <TabNavigator.Screen name="Search" component={Search}  options={{headerShown: true, tabBarIcon() {
                return<> 
                    <Feather name="search" size={20} color="black"> </Feather>
                </>
                },}}></TabNavigator.Screen>
            <TabNavigator.Screen name="Quicklist" component={Quicklist} options={{tabBarIcon() {
                return<>
                    <Feather name="list" size={24} color="black" />
                </>
                }}}></TabNavigator.Screen>
            <TabNavigator.Screen name="Meals" component={MealStack} options={{headerShown: true, tabBarIcon() {
                return<>
                    <MaterialCommunityIcons name="silverware" size={20} color="black"></MaterialCommunityIcons>
                </>
                },}}></TabNavigator.Screen>
        </TabNavigator.Navigator>

        </QuicklistContext.Provider>
        </MealListContext.Provider>
    </>
}