import React from 'react'

import { DataTable } from "react-native-paper";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useEffect, useState, useContext } from "react";
import HeadersContext from '../../context/DataHeaders';

export default function NutritionTable(props: any) {

    // nutrition states
    const [nutrients, setNutrients] = useState<any>([]);
    const [multiplier, setMultiplier] = useState<number>(1)
    const [headers, setHeaders] = useState<string[]>([]);
    const headersMap = useContext(HeadersContext)

    useEffect(() => {
        let nutrition = props.nutrition;
        if (nutrition===undefined) return

        setNutrients(nutrition);
        getHeaders();
        setMultiplier(props.multiplier);
        
    }, [props])

    function getHeaders() {
        let paramHeaders:string[] = [];
        for (let header of headersMap.keys()) {
            paramHeaders.push(header);
        }
        setHeaders(paramHeaders);
    }

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
                                    return <DataTable.Title textStyle={styles.header} key={i} numeric={ header==="Name" ? false : true} style={ header==="Name" ? {flex: 3} : {}}>{header}</DataTable.Title>
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

                                            let index = headersMap.get(header)
                                            if (index===undefined) return

                                            if (header==="Amount") {
                                                return <DataTable.Cell key={j} textStyle={styles.text} numeric={true} >{(nutrient[index]*multiplier).toFixed(2)}</DataTable.Cell>
                                            }

                                            else if (header === "Unit") {

                                                let displayUnit:string; 

                                                // keep kJ casing
                                                if (nutrient[index] === "kJ") {
                                                    displayUnit = nutrient[index];
                                                }
                                                else {
                                                    displayUnit = nutrient[index].toLowerCase();
                                                }

                                                return <DataTable.Cell key={j} textStyle={styles.text} numeric={true} >{displayUnit}</DataTable.Cell>
                                            }
                                            
                                            else if (header === "Name") {

                                                let displayName:string = nutrient[index];

                                               
                                                if (nutrient[index].includes("Total lipid")) displayName = "Total fat"
                                                else if (nutrient[index].includes("Carbohydrates")) displayName = "Carbohydrates";
                                                return <DataTable.Cell key={j} textStyle={styles.text} numeric={false} style={{flex: 3}}>{displayName} </DataTable.Cell>
                                            }

                                            else return <DataTable.Cell key={j} textStyle={styles.text} numeric={ header==="Name" ? false : true}>{nutrient[index]}</DataTable.Cell>
                                        })
                                    }
                                </DataTable.Row>
                            )
                        })
                    }
                    <DataTable.Row>{}</DataTable.Row>
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
        flex: 1,
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