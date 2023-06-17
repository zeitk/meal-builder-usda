import React from 'react'

import { PieChart } from "react-native-chart-kit";
import { Dimensions, StyleSheet, Text } from "react-native";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional,
};

export default function Pie(props: any) {

    const nutrition = props.nutrition;
    const multiplier = (props.multiplier === undefined) ? 1 : props.multiplier

    let calsFound: boolean = false;
    let fatFound: boolean = false;
    let carbsFound: boolean = false;
    let proteinFound: boolean = false;
    let alcFound: boolean = false;

    let cals: number = 0;
    let protein: number = 0;
    let carbs: number = 0;
    let fats: number = 0;
    let alc: number = 0;

    for (const nutrient of nutrition) {
        // break early if we found everything
        if (calsFound && fatFound && carbsFound && proteinFound && alcFound) break;

        // this is the preferred calorie metric
        if (nutrient["nutrientNumber"] === 208) {
            calsFound = true;
            cals = Math.round(nutrient["value"] * multiplier)
        }

        if (!calsFound && nutrient["nutrientName"].includes("Energy")) {
            calsFound = true
            cals = Math.round(nutrient["value"] * multiplier)
        }

        else if (!fatFound && (nutrient["nutrientName"].includes("Total lipid") || nutrient["nutrientName"].includes("Total fat"))) {
            fatFound = true
            fats = nutrient["value"] * 9
        }

        else if (!carbsFound && nutrient["nutrientName"].includes("Carbohydrate")) {
            carbsFound = true
            carbs = nutrient["value"] * 4
        }

        else if (!proteinFound && nutrient["nutrientName"].includes("Protein")) {
            proteinFound = true
            protein = nutrient["value"] * 4
        }

        else if (!alcFound && nutrient["nutrientName"].includes("Alcohol")) {
            alcFound = true
            alc = nutrient["value"] * 7
        }
    }

    if (cals === 0) {
        cals = Math.round(( fats * 9 + carbs * 4 + protein * 4 + alc * 7) * multiplier)
    }

    const data = [
        {
            name: "Fats",
            population: fats,                
            color: "#F00",
            legendFontColor: "#7F7F7F",
            legendFontSize: 15
        },
        {                
            name: "Carbs",
            population: carbs,                
            color: "#398f29",
            legendFontColor: "#7F7F7F",
            legendFontSize: 15
        },
        {
            name: "Protein",
            population: protein,                
            color: "rgb(0, 0, 255)",
            legendFontColor: "#7F7F7F",
            legendFontSize: 15,
        }
    ]

    if (alc > 0) {
        data.push({
            name: "Alcohol",
            population: alc,                
            color: "#ffc73b",
            legendFontColor: "#7F7F7F",
            legendFontSize: 15,
        })
    }

    return(
       <>
        <Text style={props.context === "food" ? styles.topFood : styles.topMeal}>Caloric Breakdown</Text>
        <PieChart
            data={data}
            width={screenWidth}
            height={225}
            chartConfig={chartConfig}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"25"}
            center={[0, 0]}
            absolute={false}
            />
        <Text style={props.context === "food" ? styles.bottomFood : styles.bottomMeal}>Total Calories: {cals}</Text>
       </>
    )
}

const styles = StyleSheet.create({
    bottomMeal: {
        paddingTop: 83, 
        fontSize: 15, 
        fontWeight: '400'
    },
    bottomFood: {
        paddingTop: 20, 
        fontSize: 15, 
        fontWeight: '400'
    },
   topMeal: {
        paddingBottom: 70, 
        fontSize: 18, 
        fontWeight: '400'
    },
    topFood: {
        paddingBottom: 34, 
        fontSize: 18, 
        fontWeight: '400'
    }
})