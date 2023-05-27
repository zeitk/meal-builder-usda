import React, { useRef } from 'react'

import { useEffect } from "react";
import {  View, SafeAreaView, Text, StyleSheet, TextInput } from "react-native";
import SearchCheckbox from './SearchCheckbox';
import { useCriteria } from '../context/CriteriaContext';
import { Button } from 'react-native-paper';

export default function SearchSettings({ navigation }: any) {

    const { searchCriteria, setSearchCriteria } = useCriteria();
    const ref = useRef<any>(null)

    useEffect(() => {
        const unsubscribe = navigation.addListener('transitionEnd', (e: any) => {
            // Do something
            if (e.data.closing) {
            }
        });
      
        return unsubscribe;
    }, [navigation]);

    function updateCriteria(text: string, checked: boolean) {

        if (text === "Unbranded") { 

            if (checked) {
                searchCriteria.dataType.includes("Branded") ? 
                    setSearchCriteria({
                        ...searchCriteria,
                        dataType: "Branded"
                    })
                    : 
                    setSearchCriteria({
                        ...searchCriteria,
                        dataType: ""
                    })
            }

            else {
                searchCriteria.dataType.includes("Branded") ? 
                    setSearchCriteria({
                        ...searchCriteria,
                        dataType: "Foundation,SR Legacy,Branded" 
                    })
                    : 
                    setSearchCriteria({
                        ...searchCriteria,
                        dataType: "Foundation,SR Legacy" 
                    })
            }
        }
        else if (text === "Branded") {

            if (checked) {
                searchCriteria?.dataType.includes("Foundation,SR Legacy") ? 
                setSearchCriteria({
                    ...searchCriteria,
                    dataType: "Foundation,SR Legacy" 
                })
                : 
                setSearchCriteria({
                    ...searchCriteria,
                    dataType: "" 
                })
            }
            else {
                searchCriteria?.dataType.includes("Foundation,SR Legacy") ? 
                    setSearchCriteria({
                        ...searchCriteria,
                        dataType: "Foundation,SR Legacy,Branded" 
                    })
                    : 
                    setSearchCriteria({
                        ...searchCriteria,
                        dataType: "Branded" 
                    })
            }
        }
    }

    function updatePageSize(value: string) {

        if (Number(value) > 50) value = "50"
        else if (Number(value) < 1) value = "1"

        setSearchCriteria({
            ...searchCriteria,
            pageSize: value
        })
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
