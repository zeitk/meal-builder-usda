import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from "react-native";
import { DataTable } from "react-native-paper";

export default function CostTable(props: any) {
    
    const [multiplier, setMultiplier] = useState<number>(1)
    const [cost, setCost] = useState<any>(1)
    const [units, setUnits] = useState<String>("")
 
    useEffect(() => {
        setCost("N/A");
        setUnits("N/A")
        for (const i in props.cost) {
            if (i==="value") {  setCost(props.cost[i]) }
            else if (i==="unit") { setUnits(props.cost[i])}          
        }
        setMultiplier(props.multiplier)
    }, [props])

    return<>
        <View style={styles.overallView}>
            <DataTable>
                <DataTable.Header>
                    <DataTable.Title textStyle={styles.text}>Cost</DataTable.Title>
                    <DataTable.Title textStyle={styles.text}>Unit</DataTable.Title>
                </DataTable.Header>

                <DataTable.Row>
                    <DataTable.Cell textStyle={styles.text}>{((cost*multiplier>100 && units==="US Cents")) ? (cost*multiplier/100).toFixed(2):(cost*multiplier).toFixed(2)}</DataTable.Cell>
                    <DataTable.Cell textStyle={styles.text}>{((cost*multiplier>100 && units==="US Cents")) ? "US Dollars":units}</DataTable.Cell>
                </DataTable.Row>
            </DataTable>
        </View>

    </>
}

const styles = StyleSheet.create({
    text: {
        fontSize: 12
    },
    overallView: {
        height: '100%',
        width: '100%',
        alignItems: 'center',
    }
})