import React from 'react'

import { BarChart } from "react-native-chart-kit";
import { Dimensions, StyleSheet, Text } from "react-native";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
    backgroundGradientFrom: "#f7f7f7",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#f7f7f7",
    backgroundGradientToOpacity: 0,
    color: () => `black`,
    strokeWidth: 3, // optional, default 3W
    barPercentage: 1.5,
    useShadowColorFromDataset: false, // optional,
    propsForBackgroundLines: {
        x1: screenWidth * 0.175,
        x2: screenWidth * 0.91
    }
};

export default function Bar(props: any) {


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
        if (calsFound && fatFound && carbsFound && proteinFound) break;

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
            fats = Math.round(nutrient["value"] * multiplier)
        }

        else if (!carbsFound && nutrient["nutrientName"].includes("Carbohydrate")) {
            carbsFound = true
            carbs = Math.round(nutrient["value"] * multiplier)
        }

        else if (!proteinFound && nutrient["nutrientName"].includes("Protein")) {
            proteinFound = true
            protein = Math.round(nutrient["value"] * multiplier)
        }

        else if (!alcFound && nutrient["nutrientName"].includes("Alcohol")) {
            alcFound = true
            alc = Math.round(nutrient["value"] * multiplier)
        }
    }

    if (cals === 0) {
        cals = Math.round(( fats * 9 + carbs * 4 + protein * 4 + alc * 7) * multiplier)
    }

    const data = {
        labels: ["Fats", "Carbs", "Protein"],
        datasets: [
            {
            data: [fats, carbs, protein]
            }
        ]
    };


    return(
       <>
        <BarChart
            data={data}
            yAxisSuffix=' g'
            width={screenWidth * 0.95}
            height={props.context === "food" ? 300 : 400}
            yAxisLabel=""
            yLabelsOffset={5}
            chartConfig={chartConfig}
            verticalLabelRotation={0}
            showValuesOnTopOfBars={true}
            fromZero={true}
            withHorizontalLabels={true}
            withInnerLines={true}
        />
        <Text style={props.context === "food" ? styles.bottomFood : styles.bottomMeal}>Total Calories: {cals}</Text>
       </>
    )
}


const styles = StyleSheet.create({
    bottomMeal: {
        paddingTop: 0, 
        fontSize: 15, 
        fontWeight: '400'
    },
    bottomFood: {
        paddingTop: 0, 
        fontSize: 15, 
        fontWeight: '400'
    },
})