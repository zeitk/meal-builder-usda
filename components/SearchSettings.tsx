import React, { useRef } from 'react'

import {  View, SafeAreaView, Text, StyleSheet, TextInput } from "react-native";
import SearchCheckbox from './SearchCheckbox';
import { useCriteria } from '../context/CriteriaContext';
import { Button } from 'react-native-paper';
import { ISearchCriteria } from '../interfaces/Interfaces';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SearchSettings({ navigation }: any) {

    const { searchCriteria, setSearchCriteria } = useCriteria();
    const ref = useRef<any>(null)

    function updateCriteria(text: string, checked: boolean) {

        let newDataType: string = ""

        if (text === "Unbranded") { 
            if (checked) {
                if (searchCriteria.dataType.includes("Branded"))  newDataType = "Branded"
            }

            else {
                searchCriteria.dataType.includes("Branded") ? 
                    newDataType = "Foundation,SR Legacy,Branded" 
                    : 
                    newDataType = "Foundation,SR Legacy" 
            }
        }

        else if (text === "Branded") {
            if (checked) {
                if (searchCriteria?.dataType.includes("Foundation,SR Legacy")) newDataType = "Foundation,SR Legacy" 
            }
            else {
                searchCriteria?.dataType.includes("Foundation,SR Legacy") ? 
                    newDataType =  "Foundation,SR Legacy,Branded" 
                    : 
                    newDataType = "Branded" 
            }
        }

        const newCriteria = {
            ...searchCriteria,
            dataType: newDataType
        }
        saveCriteria(newCriteria)
        setSearchCriteria(newCriteria)
    }

       // store updated mealList to persistant memory
       async function saveCriteria(updatedCriteria: ISearchCriteria) { 
        try {
            await AsyncStorage.setItem('@search', JSON.stringify(updatedCriteria))
        }
        catch {
            console.error("Error 11", "Save failure in SearchSettings.tsx")
        }
    }

    function updatePageSize(value: string) {
        // no decimals allowed
        value = Number(value).toFixed(0)

        if (Number(value) > 50) value = "50"
        else if (Number(value) < 1) value = "1"

        const newCriteria = {
            ...searchCriteria,
            pageSize: value
        }
        saveCriteria(newCriteria)
        setSearchCriteria(newCriteria)
    }

    return(
        <SafeAreaView style={styles.overallView}>
            <View style={styles.upperView}>
                <Text style={styles.titleText}>Food Type</Text>
                <View style={styles.sectionView}>
                    <View >
                        <SearchCheckbox text={"Branded"} update={updateCriteria}></SearchCheckbox>
                        <SearchCheckbox text={"Unbranded"} update={updateCriteria}></SearchCheckbox>
                    </View>
                </View>
                <Text style={styles.titleText}>Results per search</Text>
                <View style={styles.sectionView}>
                    <View style={{marginVertical: 7.5}}>
                    <TextInput
                        ref={ref}
                        style={styles.inputText}
                        placeholder={searchCriteria.pageSize}
                        keyboardType={"numeric"} 
                        placeholderTextColor="#adadad"
                        returnKeyType="done" 
                        textAlign="center"
                        maxLength={20}
                        onEndEditing={(value) => {
                            (value.nativeEvent.text==="") 
                            ? 
                            {}
                            :
                            updatePageSize(value.nativeEvent.text)
                        }}
                        onSubmitEditing={(value) => {updatePageSize(value.nativeEvent.text)} } 
                    ></TextInput>
                    </View>
                </View>
            </View>
            <View style={styles.buttonView}>
                <Button onPress={() => navigation.goBack()} textColor="#22a811" children="Save" contentStyle={{height:75}} labelStyle={styles.buttonText} style={styles.button} />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    overallView: {
        height: '100%',
        width: '100%',
        alignItems:'flex-start',
        justifyContent: 'center',
    },
    sectionView: {
        width: '100%',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        padding: 5,
        marginLeft: 25,
    },
    upperView: {
        height: '60%', 
        justifyContent: 'flex-end', 
        marginLeft: 15
    },
    titleText: {
        fontWeight: '400',
        textAlign: 'left',
        fontSize: 21,
        marginLeft: 10
    },
    text: {
        fontWeight: '300',
        textAlign: 'left',
        fontSize: 21,
        marginLeft: 10
    },
    input: {
        fontSize: 20,
        fontWeight: '300',
        width: '50%',
        marginLeft: 10,
    },
    inputText: {
        fontSize: 24,
        fontWeight: '300',
        width: 75,
        padding: 7.5,
        borderWidth: 1,
        borderColor: '#646569',
    },
    button: {
        width: 350,
        paddingBottom: 25
    },
    buttonText: {
        fontWeight: '300',
        fontSize: 25,
        lineHeight: 50
    },
    buttonView: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '40%',
        width: '100%'
    }
})
