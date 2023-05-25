import React from 'react'

import { useEffect, useState } from "react";
import {  View, Button, SafeAreaView, ScrollView, Text, StyleSheet } from "react-native";
import SearchCheckbox from './SearchCheckbox';

export default function SearchSettings({ navigation }: any) {
    return(
        <SafeAreaView style={styles.overallView}>
            <Text style={styles.text}>Search Criteria</Text>
            <View style={styles.sectionView}>
                <View style={styles.checkboxColumn}>
                    <SearchCheckbox text={"Test Parameter"}></SearchCheckbox>
                </View>
                <View style={styles.checkboxColumn}>
                    <SearchCheckbox text={"Test Parameter"}></SearchCheckbox>
                </View>
            </View>
            <Button onPress={() => navigation.goBack()} title="Go back home" />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    overallView: {
        height: '100%',
        width: '100%',
        alignItems:'center',
        justifyContent: 'center',
    },
    sectionView: {
        width: '100%',
        alignItems:'center',
        justifyContent: 'center',
        flexDirection: 'row',
        padding: 5
    },
    checkboxColumn: {
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    text: {
        textTransform: 'capitalize',
        fontWeight: '300',
        textAlign: 'left',
        fontSize: 21,
        marginLeft: 10
    }
})
