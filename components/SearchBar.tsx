import React from 'react'

import { useEffect, useState } from "react";
import {  View, TextInput, StyleSheet, Keyboard } from "react-native";
import { Button } from "react-native-paper";
import { Feather, Entypo, AntDesign } from "@expo/vector-icons";

const slogans: string[] = [
    "Watcha feeling?",
    "Ex: Potato",
    "Search for anything!"
]

interface ISearchBarProps {
    callback: (input: string) => void,
    placeholderTextColor: string,
    navigation?: any, 
    mode?: string
}

export function SearchBar(props: ISearchBarProps) {

    const [searchString, setSearchString] = useState("");
    const [pressed, setPressed] = useState(false);
    const [slogan, setSlogan] = useState("")

    useEffect(() => {
        setSlogan(slogans[(Math.floor(Math.random()*slogans.length))])
    }, [])

    function beginSearch() {
        props.callback(searchString);
        setSearchString("");
        setPressed(false);
        setSlogan(slogans[(Math.floor(Math.random()*slogans.length))])
    }

    return(
        <View style={styles.container}>
        <View style={
            pressed
                ? styles.searchbar_pressed
                : styles.searchbar_unpressed
        }>
            <Feather
                name="search"
                size={20}
                color="black"
                style={styles.feather}
            ></Feather>
            <TextInput
                placeholderTextColor={props.placeholderTextColor}
                style={styles.input}
                value={searchString}
                onChangeText={setSearchString}
                placeholder={slogan}
                returnKeyType="search"
                onEndEditing={beginSearch}
                onFocus={() => { setPressed(true) }} >
            </TextInput>

            {pressed && (
                <Entypo
                    name="cross" size={20} color="black" style={styles.entypo}
                    onPress={() => { setSearchString("") }}>
                </Entypo>
            )}
        </View>
        {/* show cancel button if searchbar is pressed */}
        { !pressed && (
            <View style={styles.toggle}>
                <AntDesign 
                    name="menu-unfold" size={24} color="black"  
                    onPress={() => props.navigation.navigate('Settings')}/>
            </View>
        )}
        {pressed && (
            <View style={styles.toggle}>
                <Button children="Cancel" textColor="#c5050c" onPress={() => {
                    setSearchString("")
                    Keyboard.dismiss();
                    setPressed(false);
                }}></Button>
            </View>
        )}
    </View>
    )
}

const styles = StyleSheet.create({
    container: {
        margin: 15,
        width: '90%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
        height: 60
    },
    input: {
        fontSize: 20,
        fontWeight: '300',
        width: '90%',
        marginLeft: 10,
    },
    feather: {
        marginLeft: 1
    },
    toggle: {
        padding: 10
    },
    entypo: {
        padding: 1,
        marginLeft: -25
    },
    searchbar_pressed: {
        padding: 10,
        flexDirection: 'row',
        borderRadius: 15,
        width: '80%',
        alignItems: 'center',
        backgroundColor: "#dadfe1"
    },
    searchbar_unpressed: {
        padding: 10,
        flexDirection: 'row',
        borderRadius: 15,
        width: '92.5%',
        backgroundColor: '#dadfe1',
        alignItems: 'center',
    }
})