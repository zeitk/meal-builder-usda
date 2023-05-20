import React, { useEffect, useState } from 'react'

import { StyleSheet, Text, View } from "react-native";

export default function FoodCardBase(props: any) {


    function getCalories() {
        for (let nutrient of props.nutrition) {
            // calories
            if (nutrient.nutrientName.includes("Energy")) {
                if (nutrient.unitName.toUpperCase() === "KJ") {
                    return((nutrient.value * 0.239006).toFixed(1));
                }
                else return(nutrient.value.toFixed(1))
            }
            
        }
        return("")
    }

    function getFats() {
        for (let nutrient of props.nutrition) {
            // fats
            if (nutrient.nutrientName.includes("Total lipid")) {
                return((nutrient.value).toFixed(1)+"g") 
            }
        }
        return("")
    }

    function getCarbs() {
        for (let nutrient of props.nutrition) {
            // carbs
            if (nutrient.nutrientName.includes("Carbohydrate")) {
                return((nutrient.value).toFixed(1)+"g")
            }
        }
        return("")
    }

    function getProtein() {
        for (let nutrient of props.nutrition) {
            // protein
            if (nutrient.nutrientName.includes("Protein")) {
                return((nutrient.value).toFixed(1)+"g")
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