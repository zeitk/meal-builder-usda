import { DataTable } from "react-native-paper";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import React from "react";

export default function FlavonoidsTable(props: any) {

    // flavonoid states
    const [flavonoids, setFlavonoids] = useState<any>([]);
    const [headers, setHeaders] = useState<string[]>([]);

    useEffect(() => {

        let paramHeaders: string[] = [];
        let flavonoidsProps = props.flavonoidsProps

        if (flavonoidsProps===undefined) return
        
        // save header titles
        for (let header in flavonoidsProps[0]) {
            if (header==="percentOfDailyNeeds") header="Daily %"
            paramHeaders.push(header);
        }

        // sort by name of nutrient
        flavonoidsProps.sort((a: any, b: any) => a.name.localeCompare(b.name));
        setFlavonoids(flavonoidsProps);
        setHeaders(paramHeaders);

    }, [props])

    return <>

        <View style={styles.bodyView}>
            <DataTable>

                <View style={(props.isMealView) ? styles.mealColumnHeadersView:styles.columnHeadersView}>
                    <DataTable.Header>
                        {
                            headers.map((header: string, i) => {
                                return <DataTable.Title textStyle={styles.header} key={i} numeric={ header==="name" ? false : true }>{ header==="name" ? "Flavonoid": header}</DataTable.Title>
                            })
                        }
                    </DataTable.Header>
                </View>

                
                {/* the rows should scroll*/}
                <ScrollView style={(props.isMealView) ? styles.mealView:styles.scrollView}>
                {
                    // go through the array of nutrients, headers used as indexes to find values
                    flavonoids.map((flavonoid: any, i: number) => {
                        return(
                            <DataTable.Row key={i}>
                                {
                                    // have non-name items populate right side of cell to give more space to name
                                    headers.map((header: string, j: number) => {
                                        if (header==="amount") return <DataTable.Cell key={j} textStyle={styles.text} numeric={true}>{(flavonoid[header]*props.multiplier).toFixed(2)}</DataTable.Cell>
                                        else return <DataTable.Cell key={j} textStyle={styles.text} numeric={ header==="name" ? false : true }>{(header==="Daily %") ? flavonoid["percentOfDailyNeeds"]:flavonoid[header]}</DataTable.Cell>
                                    })
                                }
                            </DataTable.Row>
                        )
                    })
                }
                </ScrollView>
            </DataTable>
        </View>
    </>
}

const styles = StyleSheet.create({
    header: {
        fontSize: 12,
        textTransform: 'capitalize'
    },
    headerView: {
        height: '5%',
        width: '100%',
        alignItems: 'center',
    },
    bodyView: {
        height: '95%',
        width: '100%',
        alignItems: 'center'
    },
    columnHeadersView: {
        width: '100%',
        alignItems: 'center'
    },
    scrollView: {
        width: '100%'
    },
    text: {
        fontSize: 12
    },
    mealColumnHeadersView: {
        alignItems: 'center'
    },
    mealView: {
        height: '100%'
    }
})