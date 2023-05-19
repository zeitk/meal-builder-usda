import React from 'react'
import { DataTable } from "react-native-paper";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";

const paramHeaders = [
    "Name",
    "Amount",
    "Unit"
]

export default function NutritionTable(props: any) {

    // nutrition states
    const [nutrients, setNutrients] = useState<any>([]);
    const [multiplier, setMultiplier] = useState<number>(1)
    const [headers, setHeaders] = useState<string[]>([]);

    useEffect(() => {

        let nutrition = props.nutrition;

        if (nutrition===undefined) return

        // sort by name of nutrient
        nutrition.sort((a: any, b: any) => {

                // have major macros go first
                if (a.nutrientName==="Energy") return(-1)
                else if (b.nutrientName==="Energy") return(1)
                else if (a.nutrientName==="Protein") return(-1)
                else if (b.nutrientName==="Protein") return(1)
                else if (a.nutrientName==="Total lipid (fat)") return(-1)
                else if (b.nutrientName==="Total lipid (fat)") return(1)
                else if (a.nutrientName.includes("Carbohydrates")) return(-1)
                else if (b.nutrientName.includes("Carbohydrates")) return(1)
                
                else return(a.nutrientId.localeCompare(b.nutrientId))
        });

        setNutrients(nutrition);
        setHeaders(paramHeaders);
        setMultiplier(props.multiplier)
        
    }, [props])

    return <>
        {
        // show 'Loading' text until state is set
        (nutrients.length) ? 
        
            <View style={styles.overallView}>
                <DataTable>

                    <View>
                        <DataTable.Header>
                            {
                                headers.map((header: string, i) => {
                                    return <DataTable.Title textStyle={styles.header} key={i} numeric={ header==="Name" ? false : true}>{header}</DataTable.Title>
                                })
                            }
                        </DataTable.Header>
                    </View>

                    {/* the rows should scroll*/}
                    <ScrollView style={(props.isMealView) ? styles.mealView:styles.view}>
                    {
                        // go through the array of nutrients, headers used as indexes to find values
                        nutrients.map((nutrient: any, i: number) => {
                            return(
                                <DataTable.Row key={i}>
                                    {
                                        // have non-name items populate right side of cell to give more space to name
                                        headers.map((header: string, j: number) => {
                                            if (header==="amount" || header==="percentOfDailyNeeds") return <DataTable.Cell key={j} textStyle={styles.text} numeric={true}>{(nutrient[header]*multiplier).toFixed(2)}</DataTable.Cell>
                                            else return <DataTable.Cell key={j} textStyle={styles.text} numeric={ header==="name" ? false : true}>{nutrient[header]}</DataTable.Cell>
                                        })
                                    }
                                </DataTable.Row>
                            )
                        })
                    }
                    </ScrollView>
                </DataTable>
            </View>
        :
        <View style={styles.loadingView}>
            <Text style={styles.loadingText}>Loading...</Text>
        </View>
        }
    </>
}

const styles = StyleSheet.create({
    header: {
        fontSize: 12,
        textTransform: 'capitalize'
    },
    overallView: {
        height: '100%',
        width: '100%'
    },
    view: {
        width: '100%'
    },
    mealView: {
        height: '100%'
    },
    text: {
        fontSize: 12
    },
    loadingView: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        fontSize: 17,
        lineHeight: 300,
        fontWeight: '300'
    }
})