import React from 'react'
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function MealServingInput(props: any) {

    function newServingQuantity(input: string) {
        props.newServingQuantity(input)
    }

    return(
        <View style={styles.textInput}>
            <Text style={{fontSize: 12, color: '#757577', fontWeight: '500', paddingRight: 10}}>Number of servings: </Text>
            <TextInput  style={styles.servingTextInput}
                        selectionColor="#f7f7f7"  
                        keyboardType={"numeric"} 
                        returnKeyType="done" 
                        onSubmitEditing={(value) => newServingQuantity(value.nativeEvent.text) } 
                        placeholder={props.multiplier.toString()}
                        placeholderTextColor="#adadad"></TextInput>
        </View>
    )
}

const styles = StyleSheet.create({
    textInput: {
        height: '10%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10,
        marginHorizontal: 10,
        padding: 10,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#dadfe1',
        width: '95%'
    },
    servingTextInput: {
        width: '12.5%',
        height: '100%',
        padding: 5,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#dadfe1'
    }
})