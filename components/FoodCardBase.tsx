import React from 'react'

import { StyleSheet, Text, View } from "react-native";

export default function FoodCardBase(props: any) {

    const quantity = props.quantity===undefined ? 1 : Number(props.quantity)/100

    function getCalories() {
        if (props.nutrition === undefined) return("")
        for (const nutrient of props.nutrition) {
            // calories
            if (nutrient.nutrientName.includes("Energy")) {
                if (nutrient.unitName.toUpperCase() === "KJ") {
                    return((nutrient.value * 0.239006 * quantity).toFixed(1));
                }
                else return(((nutrient.value)*quantity).toFixed(1))
            }
            
        }
        return("")
    }

    function getFats() {
        if (props.nutrition === undefined) return("")
        for (const nutrient of props.nutrition) {
            if (nutrient.nutrientName.includes("Total lipid")) {
                return(((nutrient.value)*quantity).toFixed(1)+"g") 
            }
        }
        return("")
    }

    function getCarbs() {
        if (props.nutrition === undefined) return("")
        for (const nutrient of props.nutrition) {
            if (nutrient.nutrientName.includes("Carbohydrate")) {
                return(((nutrient.value)*quantity).toFixed(1)+"g")
            }
        }
        return("")
    }

    function getProtein() {
        if (props.nutrition === undefined) return("")
        for (const nutrient of props.nutrition) {
            if (nutrient.nutrientName.includes("Protein")) {
                return(((nutrient.value)*quantity).toFixed(1)+"g")
            }
        }
        return("")
    }

    return (
        <View style={styles.container}>
            <View style={styles.column}>
                <Text style={styles.title}>Calories</Text>
                <Text style={styles.body}>{getCalories()}</Text>
            </View>
            <View style={styles.column}>
                <Text style={styles.title}>Fats</Text>
                <Text style={styles.body}>{getFats()}</Text>
            </View>
            <View style={styles.column}>
                <Text style={styles.title}>Carbs</Text>
                <Text style={styles.body}>{getCarbs()}</Text>
            </View>
            <View style={styles.column}>
                <Text style={styles.title}>Protein</Text>
                <Text style={styles.body}>{getProtein()}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
      marginTop: 10,
    },
    column: {
      flex: 1,
      alignItems: 'center',
    },
    title: {
      fontSize: 14,
      fontWeight: '300',
      marginBottom: 5,
      textAlign: 'left',
    },
    body: {
      fontSize: 16,
      fontWeight: '300',
      textAlign: 'left',
    },
  });