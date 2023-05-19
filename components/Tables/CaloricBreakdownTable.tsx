import  React  from 'react'
import { DataTable } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";

export default function CaloricBreakdownTable(caloricBreakdownProps: any) {

    // states
    const [caloricBreakdown, setCaloricBreakdown] = useState<any>([]);
    const [headers, setHeaders] = useState<string[]>([]);

    useEffect(() => {

        let paramHeaders: string[] = [];
        let index = "";
        for (const i in caloricBreakdownProps) {

            index = i;

            // save header titles
            for (let header in caloricBreakdownProps[i]) {
                paramHeaders.push(header);
            }

        }
        if (index !== "") {
            setCaloricBreakdown(caloricBreakdownProps[index]);
            setHeaders(paramHeaders);
        }

    }, [caloricBreakdown])

    return <>
        <View style={styles.overallView}>
            <DataTable>
                <DataTable.Header>
                    {
                        headers.map((header: string, i) => {
                            return <DataTable.Title textStyle={styles.header} key={i} numeric={false}>{"% " + header.slice(7,99)}</DataTable.Title>
                        })
                    }
                </DataTable.Header>

                <DataTable.Row>
                    {
                        headers.map((header: string, j: number) => {
                            return <DataTable.Cell key={j} textStyle={styles.text} numeric={false}>{caloricBreakdown[header]}</DataTable.Cell>
                        })
                    }
                </DataTable.Row>

            </DataTable>
        </View>

    </>
}

const styles = StyleSheet.create({
    header: {
        fontSize: 12
    },
    text: {
        fontSize: 12
    },
    overallView: {
        height: '100%',
        width: '100%',
        alignItems: 'center'
    }
})