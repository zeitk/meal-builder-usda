import React from 'react'

import { StyleSheet, Text } from "react-native";

export default function FoodCardHead(props: any) {

    function nameMain() {
        if (props.name === undefined) return
        return (props.name.split(","))[0]
    }

    function nameSub() {
        if (props.name === undefined) return
        let index = props.name.search(",")
        if (index === -1) return(-1) 
        let sub;
        if (props.name.at(index + 1) === ' ') sub = props.name.slice(index + 2)
        else sub = props.name.slice(index + 1)
        if (sub === "" || sub === undefined) return(-1);
        sub = sub[0].toUpperCase() + sub.slice(1)
        return sub;
    }

    return (
        <>
            { (props.brand !== "Unbranded") && 
                <Text numberOfLines={1} style={styles.titleText}>{props.brand}</Text>
            }
            <Text numberOfLines={1} style={(props.brand === "Unbranded") ? styles.titleText : styles.subText}>{nameMain()}</Text>
            { (nameSub() !== -1 && props.brand === "Unbranded") &&
                <Text numberOfLines={2} style={styles.subText}>{nameSub()}</Text>
            }
        </>
    );
};

const styles = StyleSheet.create({
    titleText: {
        textTransform: 'capitalize',
        fontWeight: '300',
        textAlign: 'left',
        fontSize: 21,
    },
    subText: {
        textTransform: 'capitalize',
        fontWeight: '300',
        textAlign: 'left',
        fontSize: 17,
    }
  });