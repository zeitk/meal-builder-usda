import React from 'react'
import { StyleSheet, Text, View, TextInput } from "react-native";

export default function ServingSizeTable(props: any) {

    function newServingSize(servingSize: any) {
        if (servingSize==="") servingSize=props.baseServing;
        const multiplier = servingSize/props.baseServing;
        props.newMultiplier(multiplier)
    }

    return (
            <View style={styles.view}>
                <Text style={{fontSize: 12, color: '#757577', fontWeight: '500', paddingRight: 10}}>Amount: </Text>
                <TextInput  style={styles.textInput}
                            selectionColor="#f7f7f7"
                            placeholderTextColor="black"  
                            keyboardType={"numeric"} 
                            returnKeyType="done" 
                            onEndEditing={(value) => {
                                (value.nativeEvent.text==="") 
                                ? 
                                newServingSize((props.baseServing*props.multiplier).toString())
                                :
                                newServingSize(value.nativeEvent.text)
                            }}
                            onSubmitEditing={(value) => newServingSize(value.nativeEvent.text) } 
                            placeholder={(props.baseServing*props.multiplier).toString()}></TextInput>
                <Text style={{paddingLeft: 3}}>{" "+props.unit}</Text>
                <Text style={styles.helpText}>454g = 1lb</Text>
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
        height: '100%',
        flexDirection: 'row',
        width: '98%',
        padding: 5,
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