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
        if (props.mode==="meal") updateImages("", props["foods"])
        else if (props.mode==="food") updateImages(props["image"],"")
    },[mealList])

    function updateImages(image?: any, foods?: any) {

        if (foods !=="") { 
            let newImages:String[] = [];
            foods.forEach((food: any) => {
                newImages.push(food["image"])
            })
            setImages(newImages)
        }
        else if (image !== "") {
            setImages([image])
        }
    }

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

                        <View style={styles.imageView}>
                            { (images !== undefined && images.length>1)
                            ?
                            <View>
                                <View style={styles.imageViewRow}>
                                {
                                    images.map((image: any, i: number) => {
                                        if (i < 2) return<Image key={i} source={{uri: imageUrl + imageSize + "/" + image}} style={styles.mealImage}></Image>
                                    })
                                }
                                </View>
                                <View style={styles.imageViewRow}>
                                    {
                                        images.map((image: any, i: number) => {
                                            if (i > 1 && i < 4) return<Image key={i} source={{uri: imageUrl + imageSize + "/" + image}} style={styles.mealImage}></Image>
                                        })
                                    }
                                </View>
                            </View>
                            :
                            <View style={styles.imageViewFood}>
                                {
                                    images.map((image: any, i: number) => {
                                        return<Image key={i} source={{uri: imageUrl + imageSize + "/" + image}} style={styles.foodImage}></Image>
                                    })
                                }
                            </View>
                            }

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