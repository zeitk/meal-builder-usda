import React, { useState } from 'react'

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, View, Pressable, Alert, TextInput } from "react-native";
import { Card } from "react-native-paper";
import { Feather } from '@expo/vector-icons'; 
import { useMealList } from '../../context/MealList';
import { IMeal } from '../../interfaces/Interfaces'
import FoodCardBase from '../FoodCardBase';

export default function MealCard(props: any) {

    const  { mealList, setMealList } = useMealList();
    const [isPressed, setIsPressed] = useState<boolean>(props.pressed !== undefined ? props.pressed : false)

    function pressAction(quantity: any) {

        // from PlanBuilder cart
        if (props.mode === 2 || props.mode === 4) {
            props.callback(props.id)    
        }

        // from PlanBuilder meal list
        else if (props.mode === 3) {
            // if pressed we're removing, if not we're adding
            if (quantity === -1) {
                props.callback(isPressed ? 1 : 2, props.arrayIndex, quantity)
                setIsPressed(!isPressed)
            }
            else {
                props.callback(2, props.arrayIndex, quantity)
            }
        }
        
        // from Meals
        else props.navigation.navigate('MealInfo', { id: props["id"] })
    }

    // store updated mealList to persistant memory
    function deleteMeal() {
        if (!mealList) return;
        const updatedMealList = mealList.filter((meal:any) => meal["id"] !== props["id"])
        updateMealList(updatedMealList)
        setMealList(
            updatedMealList
        );
    }

    async function updateMealList(updatedMealList: IMeal[]) {
        try {
            await AsyncStorage.setItem('@meallist', JSON.stringify(updatedMealList))
        }
        catch(e) {
            console.error("Error 5", "Deletion failure in MealCard.tsx")
        }
    }

    function deleteButton() {
        
        // give prompt before deleting meal
        Alert.alert(
            'Delete Meal',
            'Are you sure you want to delete this meal?',[
                { text: 'Cancel', onPress: () => {}, style: 'cancel'},
                { text: 'Yes', onPress: () => deleteMeal() },
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
            <Pressable onPress={() => pressAction(-1)}>

            <Card style={isPressed ? styles.card_pressed : styles.card}>
                    <Card.Content style={styles.content}>
                        { (props.mode === 1) &&
                        <>
                            <View style={styles.titleView}>
                                <Text numberOfLines={2} style={styles.title}>{props.name}</Text>
                                <FoodCardBase nutrition={getMacros()}></FoodCardBase>
                            </View>

                            <View style={styles.deleteButtonView}>
                                <Pressable hitSlop={{ bottom: 30, left: 30, right: 30, top: 30 }} onPress={deleteButton}>
                                    <Feather style={styles.deleteButton} name="trash-2" size={18} color="#c5050c"/>
                                </Pressable>
                            </View>
                        </>
                        }
                        { (props.mode === 2) &&
                        <>
                            <View style={styles.planTitleView}>
                                <Text numberOfLines={2} style={styles.planTitle}>{props.name}</Text>
                                <FoodCardBase nutrition={getMacros()}></FoodCardBase>
                            </View>
                            <View style={styles.quantityView}>
                                    <Text numberOfLines={2} style={styles.quantityText}>Servings: </Text>
                                    <Text>{props.quantity}</Text>
                            </View>
                        </> 
                        }
                        { (props.mode === 3) &&
                        <>
                            <View style={styles.planTitleView}>
                                <Text numberOfLines={2} style={styles.planTitle}>{props.name}</Text>
                                <FoodCardBase nutrition={getMacros()}></FoodCardBase>
                            </View>
                            { (isPressed) 
                                ?
                                <View style={styles.quantityView}>
                                    <Text numberOfLines={2} style={styles.quantityText}>Servings: </Text>

                                    <TextInput  
                                        style={styles.quantityTextInput}
                                        selectionColor="#f7f7f7"  
                                        placeholderTextColor="black"
                                        keyboardType={"numeric"} 
                                        returnKeyType="done" 
                                        onSubmitEditing={(value) => pressAction(value.nativeEvent.text) } 
                                        placeholder={(props.quantity).toString()}>
                                    </TextInput>
                                    
                                </View>
                                :
                                undefined
                            }
                        </>
                        }
                        { (props.mode === 4) &&
                            <>
                            <View style={styles.titleView}>
                                <Text numberOfLines={2} style={styles.planTitle}>{props.name}</Text>
                                <Text numberOfLines={1} style={styles.quantityText}>Servings: {props.quantity}</Text>
                                <FoodCardBase nutrition={getMacros()} multiplier={props.quantity}></FoodCardBase>
                            </View>
                            </>
                        }
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
    planTitleView: {
        width: '80%'
    },
    title: {
        textTransform: 'capitalize',
        fontWeight: '300',
        textAlign: 'left',
        fontSize: 21,
        paddingLeft: 20,
        paddingBottom: 5
    },
    planTitle:{
        textTransform: 'capitalize',
        fontWeight: '300',
        textAlign: 'left',
        fontSize: 21,
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
    },
    quantityView: {
        width: '20%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    quantityText: {
        paddingBottom: 5,
        fontSize: 16,
        fontWeight: '300'
    },
    quantityTextInput: {
        width: '90%',
        padding: 5,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#dadfe1'
    }
})