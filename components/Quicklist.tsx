import React, { useState, useContext, useEffect } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Portal } from "react-native-paper";
import QuicklistContext from "../context/QuicklistContext";
import FoodCard from "./FoodCard";
import FoodModal from "./FoodModal";

export default function Quicklist({ navigation }: any) {

    const [quicklist] = useContext(QuicklistContext)
    const [viewedFoodId, setViewedFoodId] = useState<number>()
    const [viewedFoodName, setViewedFoodName] = useState<String>()
    const [viewedFoodImage, setViewedFoodImage] = useState<String>()
    const [viewedFoodNutrition, setViewedFoodNutrition] = useState<any>({});
    const [viewedFoodCost, setViewedFoodCost] = useState<any>({})
    const [foodModalVisible, setFoodModalVisible] = useState<Boolean>(false);

    useEffect(() => {

    },[])

    function moreInfo(id: number, name: string, image: string) {

        quicklist.forEach((food: any) => {
            if (id===food["id"]) {
                setViewedFoodId(food["id"])
                setViewedFoodName(food["name"])
                setViewedFoodImage(food["image"])
                setViewedFoodCost(food["cost"])
                setViewedFoodNutrition({
                    caloricBreakdown: food["caloricBreakdown"],
                    flavonoids: food["flavonoids"],
                    nutrients: food["nutrients"],
                    properties: food["properties"],
                    weightPerServing: food["weightPerServing"]
                })
                setFoodModalVisible(true)
            }
        })
        
    }

    function toggleFoodModal() {
        if (!foodModalVisible) setFoodModalVisible(true)
        else setFoodModalVisible(false)
    }

    return<>
        <SafeAreaView>
            { (quicklist.length>0) ?
                <ScrollView style={styles.scrollview}>
                {
                    quicklist.map((food: any, i: number) => {
                        return <FoodCard key={i} id={food["id"]} image={food["image"]} callback={moreInfo} name={food["name"]} mode={0}></FoodCard>
                    })
                }
                </ScrollView>
                :
                <View style={styles.emptyQuicklist}>
                    <Text style={styles.text}>Add items to your Quicklist in Search</Text>
                    <Button children="Search" textColor="#2774AE" labelStyle={styles.buttonText} style={styles.buttonView} onPress={()=>{navigation.navigate('Search')}}></Button>
                </View>
            }
            
            <Portal.Host>
                    <FoodModal 
                        nutrition={viewedFoodNutrition} name={viewedFoodName} cost={viewedFoodCost} id={viewedFoodId} image={viewedFoodImage}  
                        toggle={toggleFoodModal} 
                        context={"Quicklist"} modalVisible={foodModalVisible} ></FoodModal>
            </Portal.Host>
        </SafeAreaView>
    </>
}

const styles = StyleSheet.create({
    scrollview: {
        height: '100%'
    },
    text: {
        fontSize: 20,
        fontWeight: '300'
    },
    emptyQuicklist: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonView: {
        paddingTop: 15,
        width: 300
    },
    buttonText: {
        fontSize: 20,
        fontWeight: '300'
    }
})