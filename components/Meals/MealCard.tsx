import React, { useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from "react";
import { StyleSheet, Text, View, Image, Pressable, Button, Alert } from "react-native";
import { Card } from "react-native-paper";
import { Feather } from '@expo/vector-icons'; 
import { useMealList } from '../../context/MealList';
import { IMeal } from '../../interfaces/Interfaces'

const imageSize = "100x100";
const imageUrl = "https://spoonacular.com/cdn/ingredients_"

export default function MealCard(props: any) {

    const [images, setImages] = useState<String[]>([])
    const  { mealList, setMealList } = useMealList();

    useEffect(() => {
        updateImages(props["foods"])
    },[mealList])

    function updateImages(foods: any) {

        let newImages:String[] = [];
        foods.forEach((food: any) => {
            newImages.push(food["image"])
        })
        setImages(newImages)

    }

    function showMoreInfo() {
        props.navigation.navigate('MealInfo', { id: props["id"] })
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

    return <>
        <View>
            <Pressable onPress={showMoreInfo}>

            <Card style={styles.card}>
                    <Card.Content style={styles.content}>

                        <View style={styles.imageView}>
                            <View style={styles.imageViewRow}>
                                {
                                    images.map((image: any, i: number) => {
                                        if (i < 2) return<Image key={i} source={{uri: imageUrl + imageSize + "/" + image}} style={styles.image}></Image>
                                    })
                                }
                            </View>
                            <View style={styles.imageViewRow}>
                                {
                                    images.map((image: any, i: number) => {
                                        if (i > 1 && i < 4) return<Image key={i} source={{uri: imageUrl + imageSize + "/" + image}} style={styles.image}></Image>
                                    })
                                }
                            </View>
                        </View>

                        <View style={styles.titleView}>
                            <Text numberOfLines={2} style={styles.title}>{props.name}</Text>
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
        height: 125,
        width: '92.5%'
    },
    image: {
        height: 45,
        width: 50,
        resizeMode: 'contain',
        marginLeft: 1,
    },
    imageView: {
        width: '33%',
        height: '100%',
        backgroundColor: 'white'
    },
    imageViewRow: {
        backgroundColor: 'white',
        flexDirection: 'row'
    },
    titleView: {
        width: '57%',
        justifyContent: 'center',
        overflow: 'hidden'
    },
    title: {
        textTransform: 'capitalize',
        fontWeight: '300',
        textAlign: 'left',
        fontSize: 21,
        paddingLeft: 20,
    },
    deleteButtonView: {
        width: '10%',
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