import React, { useEffect } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from 'react-native-paper';
import { useMealList } from '../../context/MealList';
import MealCard from './MealCard';

export default function Meals({ navigation }: any) {

    const { mealList } = useMealList();

    useEffect(() => {
        
    },[])

    return<>
        <SafeAreaView style={styles.safeView}>
            <View style={styles.uppperView}>

            { (mealList !== null && mealList.length>0) ?
                <ScrollView style={styles.scrollView}>
                    {
                        mealList.map((meal: any, i: number) => {
                            return<MealCard key={i} id={meal["id"]} name={meal["name"]} foods={meal["foods"]} navigation={navigation}></MealCard>
                        })
                    }
                </ScrollView>
                :
                <View style={styles.noMealsBannerView}>
                    <Text style={styles.noMealsBannerText}>No saved meals currently</Text>
                </View>
            }
            </View>
            <View style={styles.buttonView}>
                    <Button mode="text" children="Add Meal" textColor="#2774AE" labelStyle={styles.buttonText} style={styles.button} onPress={()=>{ navigation.navigate('MealBuilder')}}></Button>
            </View>
        </SafeAreaView>
    </>
}

const styles = StyleSheet.create({
    safeView: {
        flex: 1,
        backgroundColor: '#f7f7f7'
    },
    uppperView: {
        height: '90%',
        width: '100%'
    },
    scrollView: {
        height: '100%',
        backgroundColor:'white'
    },
    button: {
        width: 300,
        alignSelf: 'center'
    },
    buttonText: {
        fontSize: 20,
        fontWeight: '300'
    },
    buttonView: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        height: '10%',
        borderColor: '#dadfe1',
        borderTopWidth: 1,
    },
    noMealsBannerView: {
        height: '100%',
        backgroundColor:'white',
        justifyContent: 'center',
        alignItems: 'center'
    },
    noMealsBannerText: {
        fontSize: 17,
        fontWeight: '300'
    }
})