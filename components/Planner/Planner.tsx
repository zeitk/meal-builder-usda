import React from 'react'

import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from 'react-native-paper';
import { usePlanList } from '../../context/PlanList';
import PlanCard from './PlanCard';

export default function Planner({ navigation }: any) {

    const { planList } = usePlanList()

    return<>
        <SafeAreaView style={styles.safeView}>
            <View style={styles.uppperView}>

            { (planList !== null && planList.length>0) ?
                <ScrollView style={styles.scrollView}>
                    { 
                        planList.map((plan: any, i: number) => {
                            return<PlanCard key={i} id={plan["id"]} name={plan["name"]} foods={plan["foods"]} data={plan["data"]} navigation={navigation}></PlanCard>
                        })
                    }
                </ScrollView>
                :
                <View style={styles.noPlansBannerView}>
                    <Text style={styles.noPlansBannerText}>No saved plans</Text>
                </View>
            }
            </View>
            <View style={styles.buttonView}>
                    <Button mode="text" children="Add Plan" textColor="#2774AE" contentStyle={{height:50}}  labelStyle={styles.buttonText} style={styles.button} onPress={()=>{ navigation.navigate('PlanBuilder')}}></Button>
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
    noPlansBannerView: {
        height: '100%',
        backgroundColor:'white',
        justifyContent: 'center',
        alignItems: 'center'
    },
    noPlansBannerText: {
        fontSize: 17,
        fontWeight: '300'
    }
})