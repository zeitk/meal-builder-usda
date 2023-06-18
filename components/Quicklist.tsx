import React, { useState, useContext } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Portal } from "react-native-paper";
import QuicklistContext from "../context/QuicklistContext";
import FoodCard from "./FoodCard";
import FoodModal from "./FoodModal";
import { IFood } from "../interfaces/Interfaces";

export default function Quicklist({ navigation }: any) {

    const [quicklist ] = useContext(QuicklistContext)
    const [viewedFoodId, setViewedFoodId] = useState<number>()
    const [viewedFoodName, setViewedFoodName] = useState<String>()
    const [viewedFoodNutrition, setViewedFoodNutrition] = useState<any>({});
    const [viewedFoodUnit, setViewedFoodUnit] =  useState<string>("");
    const [viewedFoodServings, setViewedFoodServings] = useState<number>(1)
    const [viewedFoodBrand, setViewedFoodBrand] = useState<string>("")
    const [foodModalVisible, setFoodModalVisible] = useState<Boolean>(false);

    function moreInfo(id: number) {
        quicklist.forEach((food: any) => {
            if (id===food["id"]) {
                setViewedFoodId(food["id"])
                setViewedFoodName(food["name"])
                setViewedFoodNutrition(food["nutrition"])
                setViewedFoodServings(food["servingSize"])
                setViewedFoodUnit(food["unit"])
                setViewedFoodBrand(food["brand"])
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
                    quicklist.map((food: IFood, i: number) => {
                        if (i === 0 || (i > 0 && quicklist[i-1]["foodCategory"]!==quicklist[i]["foodCategory"])) {
                            return(
                                <View key={i} >
                                    <View style={styles.exampleBanner}>
                                        <Text style={styles.foodCateogoryText}>{food["foodCategory"]}</Text>
                                    </View>
                                    <FoodCard key={i} id={food.id} name={food.name} nutrients={food.nutrition} brand={food.brand} callback={moreInfo} mode={0}/>
                                </View>
                            )
                        }
                        else return <FoodCard key={i} id={food.id} name={food.name} nutrients={food.nutrition} brand={food.brand} callback={moreInfo} mode={0}/>
                    })
                }
                </ScrollView>
                :
                <View style={styles.emptyQuicklist}>
                    <Text style={styles.text}>Add items to your Quicklist in Search</Text>
                    <Button children="Search" textColor="#2774AE" labelStyle={styles.buttonText} style={styles.buttonView} onPress={()=>{navigation.navigate('SearchDrawer')}}></Button>
                </View>
            }
            
            <Portal.Host>
                    <FoodModal 
                        nutrition={viewedFoodNutrition} name={viewedFoodName}  id={viewedFoodId} brand={viewedFoodBrand}
                        servingSize={viewedFoodServings} unit={viewedFoodUnit} toggle={toggleFoodModal} 
                        context={"Quicklist"} modalVisible={foodModalVisible} ></FoodModal>
            </Portal.Host>
        </SafeAreaView>
    </>
}

const styles = StyleSheet.create({
    scrollview: {
        height: '100%',
        backgroundColor: 'white'
    },
    text: {
        fontSize: 20,
        fontWeight: '300'
    },
    emptyQuicklist: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    buttonView: {
        paddingTop: 15,
        width: 300
    },
    buttonText: {
        fontSize: 20,
        fontWeight: '300'
    },
    exampleBanner: {
        padding: 12
    },
    foodCateogoryText: {
        fontSize: 16,
        fontWeight: '300'
    },
})