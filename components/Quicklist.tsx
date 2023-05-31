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
    const [viewedFoodNutrition, setViewedFoodNutrition] = useState<any>({});
    const [viewedFoodUnit, setViewedFoodUnit] =  useState<string>("");
    const [viewedFoodServings, setViewedFoodServings] = useState<number>(1)
    const [viewedFoodBrand, setViewedFoodBrand] = useState<string>("")
    const [foodModalVisible, setFoodModalVisible] = useState<Boolean>(false);

    useEffect(() => {
        setFoodModalVisible(false);
    },[])

    function moreInfo(id: number, name: string, image: string) {

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
                    quicklist.map((food: any, i: number) => {
                        return <FoodCard key={i} id={food.id} name={food.name} nutrients={food.nutrition} brand={food.brand} callback={moreInfo} mode={0}></FoodCard>
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
    }
})