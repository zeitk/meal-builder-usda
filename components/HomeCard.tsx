import React, { useEffect } from 'react'
import { useState } from "react";
import { StyleSheet, Text, View, Image, Pressable } from "react-native";
import { Card } from "react-native-paper";
import { useMealList } from '../context/MealList';

const imageSize = "100x100";
const imageUrl = "https://spoonacular.com/cdn/ingredients_"

export default function HomeCard(props: any) {

    const [images, setImages] = useState<String[]>([])
    const  { mealList } = useMealList();

    useEffect(() => {
    },[mealList])


    function showMoreInfo() { 
        if (props.mode==="food") props.callback(props.id, props.mode)
        else props.navigation.navigate('MealInfoHome', { id: props["id"], mode: "Home" })
    }

    return <>
        <View>
            <Pressable onPress={showMoreInfo}>

            <Card style={styles.card}>
                    <Card.Content style={styles.content}>

                        <View style={styles.titleView}>
                            <Text numberOfLines={3} style={styles.title}>{props.name}</Text>
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
        height: 225,
        width: 125
    },
    mealImage: {
        height: 45,
        width: 50,
        resizeMode: 'contain',
    },
    foodImage: {
        height: 70,
        width: 70,
        resizeMode: 'contain'
    },
    imageViewFood: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    imageView: {
        height: '50%',
        width: '100%',
        backgroundColor: 'white'
    },
    imageViewRow: {
        backgroundColor: 'white',
        flexDirection: 'row'
    },
    titleView: {
        height: '50%',
        width: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    title: {
        textTransform: 'capitalize',
        fontWeight: '300',
        //textAlign: 'left',
        fontSize: 21,
        textAlign: 'center'
    },
    deleteButtonView: {
        width: '10%',
        alignItems: 'center'
    },
    deleteButton: {
        lineHeight: 100,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center'
    }
})