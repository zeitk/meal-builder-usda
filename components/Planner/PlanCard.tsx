import React, { useState } from 'react'

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, View, Pressable, Alert } from "react-native";
import { Card } from "react-native-paper";
import { Feather } from '@expo/vector-icons'; 
import { IMeal } from '../../interfaces/Interfaces'
import FoodCardBase from '../FoodCardBase';
import { usePlanList } from '../../context/PlanList';

export default function PlanCard(props: any) {

    const { planList, setPlanList } = usePlanList();

    function pressAction() {
         props.navigation.navigate('PlanInfo', { id: props["id"] })
    }

    // store updated planList to persistant memory
    function deletePlan() {
        if (!planList) return;
        const updatedPlanList = planList.filter((plan:any) => plan["id"] !== props["id"])
        updatePlanList(updatedPlanList)
        setPlanList(
            updatedPlanList
        );
    }

    async function updatePlanList(updatedPlanList: IMeal[]) {
        try {
            await AsyncStorage.setItem('@planlist', JSON.stringify(updatedPlanList))
        }
        catch(e) {
            console.error("Error 15", "Deletion failure in PlanCard.tsx")
        }
    }

    function deleteButton() {
        
        // give prompt before deleting plan
        Alert.alert(
            'Delete Meal',
            'Are you sure you want to delete this plan?',[
                { text: 'Cancel', onPress: () => {}, style: 'cancel'},
                { text: 'Yes', onPress: () => deletePlan() },
            ],
            { cancelable: false }
          );
    }

    function getMacros() {
        if (props.data === undefined) return({})
        return(props.data.macros)
    }

    return <>
        <View>
            <Pressable onPress={pressAction}>

            <Card style={styles.card}>
                    <Card.Content style={styles.content}>

                        <View style={styles.titleView}>
                            <Text numberOfLines={2} style={styles.title}>{props.name}</Text>
                            <FoodCardBase nutrition={getMacros()}></FoodCardBase>
                        </View>

                        <View style={styles.deleteButtonView}>
                            <Pressable hitSlop={{ bottom: 30, left: 30, right: 30, top: 30 }} onPress={deleteButton}>
                                <Feather style={styles.deleteButton} name="trash-2" size={18} color="#c5050c"/>
                            </Pressable>
                        </View>
                    
                    </Card.Content>
                </Card>

            </Pressable>
        </View>
    </>
}

const styles = StyleSheet.create({
    card: {
        borderColor: '#646569',
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: 'white',
        margin: 5,
        marginLeft: 15,
        marginRight: 15,
        width: '92.5%'
    },
    card_pressed: {
        borderColor: '#22a811',
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: 'white',
        margin: 5,
        marginLeft: 15,
        marginRight: 15,
        width: '92.5%'
    },
    titleView: {
        width: '85%',
        justifyContent: 'center',
        overflow: 'hidden'
    },
    title: {
        textTransform: 'capitalize',
        fontWeight: '300',
        textAlign: 'left',
        fontSize: 21,
        paddingLeft: 20,
        paddingBottom: 5
    },
    deleteButtonView: {
        width: '15%',
        alignItems: 'center'
    },
    deleteButton: {
        lineHeight: 100,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    }
})