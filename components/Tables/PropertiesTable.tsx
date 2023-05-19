import React from 'react'
import { DataTable } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";

export default function PropertiesTable(propertiesProps: any) {

    // states
    const [properties, setProperties] = useState<any>([]);
    const [headers, setHeaders] = useState<string[]>([]);

    useEffect(() => {

        let paramHeaders: string[] = [];
        let index = "";
        
        if (propertiesProps===undefined) return
        
        for (const i in propertiesProps) {

            index = i;

            // save header titles
            for (let header in propertiesProps[i][0]) {
                paramHeaders.push(header);
            }

        }
        if (index!=="") {

            // sort by name of property
            propertiesProps[index].sort((a: any, b: any) => a.name.localeCompare(b.name));
            setProperties(propertiesProps[index]);
            setHeaders(paramHeaders);
        }

    }, [properties])

    return <>

        <View style={styles.overallView}>

            <DataTable>
                <DataTable.Header>
                    {
                        headers.map((header: string, i) => {
                            return <DataTable.Title textStyle={styles.header} key={i} numeric={ header==="name" ? false : true }>{ header==="name" ? "Property": header}</DataTable.Title>
                        })
                    }
                </DataTable.Header>
                
                {/* the rows should scroll*/}
                <View>
                {
                    // go through the array of nutrients, headers used as indexes to find values
                    properties.map((property: any, i: number) => {
                        return(
                            <DataTable.Row key={i}>
                                {
                                    // have non-name items populate right side of cell to give more space to name
                                    headers.map((header: string, j: number) => {
                                        return <DataTable.Cell key={j} textStyle={styles.text} numeric={ header==="name" ? false : true }>{ header==="amount" ? Number(property[header]).toFixed(2) : property[header]}</DataTable.Cell>
                                    })
                                }
                            </DataTable.Row>
                        )
                    })
                }
                </View>
            </DataTable>
        </View>

    </>
}

const styles = StyleSheet.create({
    header: {
        fontSize: 12,
        textTransform: 'capitalize'
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