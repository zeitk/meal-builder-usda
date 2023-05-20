import React from 'react'
import { StyleSheet, Text, View, TextInput } from "react-native";
import { useEffect, useState, useContext } from "react";
import HeadersContext from '../../context/DataHeaders';

export default function ServingSizeTable(props: any) {

    // states
    const [baseServingSize, setBaseServingSize] = useState<any>([]);
    const [unit, setUnit] = useState<string>("");
    const [headers, setHeaders] = useState<string[]>([]);
    const headersMap = useContext(HeadersContext);

    function newServingSize(servingSize: any) {

        if (servingSize==="") servingSize=baseServingSize;
        const multiplier = servingSize/baseServingSize;
        props.newMultiplier(multiplier)
    }

    useEffect(() => {

        let paramHeaders:string[] = [];
        for (let header of headersMap.keys()) {
            paramHeaders.push(header);
        }
        setHeaders(paramHeaders)
        setBaseServingSize(props.baseServing)
        
    }, [props])

    return (
        <View style={styles.overallView}>
        <View style={styles.titleView}>
            <Text>
                Serving Size
            </Text>
        </View>

        <View style={styles.view}>
            <Text style={{fontSize: 12, color: '#757577', fontWeight: '500', paddingRight: 10}}>Amount: </Text>
            <TextInput  style={styles.textInput}
                        selectionColor="#f7f7f7"
                        placeholderTextColor="#adadad"  
                        keyboardType={"numeric"} 
                        returnKeyType="done" 
                        onEndEditing={(value) => {
                            (value.nativeEvent.text==="") 
                            ? 
                            newServingSize((baseServingSize*props.multiplier).toString())
                            :
                            newServingSize(value.nativeEvent.text)
                        }}
                        onSubmitEditing={(value) => newServingSize(value.nativeEvent.text) } 
                        placeholder={(baseServingSize*props.multiplier).toString()}></TextInput>
            <Text style={{paddingLeft: 3}}> {(unit==='g') ? "grams":unit}</Text>
            <Text style={styles.helpText}>454g = 1lb</Text>
        </View>
    </View> 
    )
}

const styles = StyleSheet.create({
    overallView: {
        height: '100%',
        width: '100%'
    },
    header: {
        fontSize: 12,
        textTransform: 'capitalize'
    },
    text: {
        fontSize: 12
    },
    textInput: {
        width: '15%',
        padding: 5,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#dadfe1'
    },
    view: {
        height: '75%',
        flexDirection: 'row',
        width: '98%',
        padding: '2%',
        paddingLeft: 12,
        marginTop: '1%',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#dadfe1',
        alignItems: 'center'
    },
    helpText: {
        fontSize: 10,
        paddingLeft: '33%',
        color: '#adadad'
    },
    titleView: {
        height: '25%',
        justifyContent: 'center',
        alignItems: 'center'
    }
})