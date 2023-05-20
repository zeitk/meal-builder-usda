import React, { useState } from 'react'

import { StyleSheet, Text, View, Image, Pressable, TextInput } from "react-native";
import { Card } from "react-native-paper";
import { Entypo } from '@expo/vector-icons'; 
import FoodCardBase from './FoodCardBase';

export default function FoodCard(props: any) {

    const [isPressed, setIsPressed] = useState<Boolean>(false)

    function nameMain() {
        nameSub();
        return (props.name.split(","))[0]
    }

    function nameSub() {
        if (props.name === undefined) return
        let index = props.name.search(",")
        let sub = props.name.slice(index + 2)
        if (sub === "" || sub === undefined) return;
        sub = sub[0].toUpperCase() + sub.slice(1)
        return sub;
    }

    function showMoreInfo(quantity: any) {

        // if food is being added to meal 
        if (props.mode===1) {
            // location in the quicklist
            const index = props.arrayIndex

            // if item is pressed we're either removing the item or updating its quantity
            if (isPressed) {
                if ((typeof quantity)==="string") props.callback(2, index, quantity)
                else {                
                    setIsPressed(false)
                    props.callback(1, index, -1)
                }
            }
            
            // if item is not pressed we are adding the item
            else {
                setIsPressed(true);
                props.callback(2, index, -1)
            }
        }

        // from 'Meals' tab
        else if (props.mode===2) {
           props.callback(props.id, props.name, props.image)
        }

        // if nutritional value is being viewed
        else {
            props.callback(props.id, props.name, props.nutrients);
        }
    }

    return <>
        <View style={{width: '100%'}}>
            <Pressable onPress={showMoreInfo}>

                <Card style={(isPressed) ? styles.card_pressed:styles.card_unpressed}>
                    <Card.Content style={styles.overallView}>
                        {/* Show different displays depending on our activity */}
                        {/* Viewing from Search or Quicklist */}
                        { (props.mode===0) &&
                            <View style={styles.unpressedTitleView}>
                                <Text numberOfLines={1} style={styles.titleText}>{nameMain()}</Text>
                                <Text numberOfLines={1} style={styles.subText}>{nameSub()}</Text>
                                <FoodCardBase name={props.name} nutrition={props.nutrients}></FoodCardBase>
                            </View>
                        }
                        {/* Viewing from Meal Builder */}
                        { (props.mode===1) &&
                            <View style={styles.infoTextView}>
                                <View style={(isPressed) ? styles.pressedTitleView:styles.unpressedTitleView}>
                                    <Text numberOfLines={2} style={styles.titleText}>{props.name}</Text>
                                </View>
                                { (isPressed) 
                                ? 
                                <View style={styles.quantityView}>
                                    <Text numberOfLines={2} style={styles.quantityText}>Quantity: </Text>

                                    <TextInput  
                                        style={styles.quantityTextInput}
                                        selectionColor="#f7f7f7"  
                                        placeholderTextColor="#adadad"
                                        keyboardType={"numeric"} 
                                        returnKeyType="done" 
                                        onSubmitEditing={(value) => showMoreInfo(value.nativeEvent.text) } 
                                        placeholder={"150g"}>
                                    </TextInput>
                                    
                                </View>
                                :
                                undefined
                                }
                            </View>
                        }
                        {/* Viewing from Meal Info */}
                        { (props.mode===2) &&
                            <View style={mealStyles.mealInfoOverall}>
                                <View style={mealStyles.mealInfoTextView}>
                                    <Text numberOfLines={2} style={mealStyles.mealInfoTitleText}>{props.name}</Text>
                                    <Text numberOfLines={1} style={mealStyles.quantityText}>Quantity: {(Number(props.quantity)).toFixed(0)}g</Text>
                                </View>
                                <View style={mealStyles.mealInfoIcon}>
                                    <Entypo name="edit" size={22} color="black" />
                                </View>
                            </View>
                        }
                    </Card.Content>
                </Card>

            </Pressable>
        </View>
    </>
}

const styles = StyleSheet.create({
    card_unpressed: {
        borderColor: '#646569',
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: 'white',
        margin: 5,
        marginLeft: 15,
        marginRight: 15,
        height: 130,
        width: '92.5%'
    },
    card_pressed: {
        borderColor: '#22a811',
        borderWidth: 2.5,
        borderRadius: 5,
        backgroundColor: 'white',
        margin: 5,
        marginLeft: 15,
        marginRight: 15,
        height: 125,
        width: '92.5%'
    },
    image: {
        height: 100,
        resizeMode: 'contain',
        marginLeft: 1,
    },
    imageView: {
        width: '27.5%',
        height: '100%',
        backgroundColor: 'white'
    },
    unpressedTitleView: {
        width: '100%'
    },
    pressedTitleView: {
        width: '65%'
    },
    titleText: {
        textTransform: 'capitalize',
        fontWeight: '300',
        textAlign: 'left',
        fontSize: 21,
    },
    subText: {
        textTransform: 'capitalize',
        fontWeight: '300',
        textAlign: 'left',
        fontSize: 17,
    },
    overallView: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        alignItems: 'center'
    },
    infoTextView: {
        width: '72,5%',
        flexDirection: 'row'
    },
    quantityView: {
        width: '35%',
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

const mealStyles = StyleSheet.create({
    mealInfoTextView: {
        width: '85%',
        paddingLeft: 12.5,
        alignItems: 'flex-start',
    },
    mealInfoTitleText: {
        textTransform: 'capitalize',
        fontWeight: '300',
        textAlign: 'left',
        fontSize: 21,
        paddingBottom: 10
    },
    mealInfoIcon: {
        width: '15%',
        justifyContent: 'center'
    },
    mealInfoOverall: {
        flexDirection: 'row',
        width: '72.5%'
    },
    quantityText: {
        paddingBottom: 5,
        fontSize: 16,
        fontWeight: '300'
    }
})