import React from 'react'

import { PieChart } from "react-native-chart-kit";
import { Dimensions, View } from "react-native";
import { useEffect, useState } from "react";
import { Text } from 'react-native';

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
    propsForLabels: {
        fontSize: 17,
        fontWeight: '300'
    }
};

export default function Pie(props: any) {

    const [data, setData] = useState<any>([])
    const [calories, setCalories] = useState<number>(0)
    
    useEffect(() => {
        getData();
    }, [props])

    function getData() {
        const nutrition = props.nutrition;
        const multiplier = (props.multiplier === undefined) ? 1 : props.multiplier

        let calsFound: boolean = false;
        let fatFound: boolean = false;
        let carbsFound: boolean = false;
        let proteinFound: boolean = false;
        let cals: number = 0;
        let protein: number = 0;
        let carbs: number = 0;
        let fats: number = 0;

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
                fats = nutrient["value"]
            }

            else if (!carbsFound && nutrient["nutrientName"].includes("Carbohydrate")) {
                carbsFound = true
                carbs = nutrient["value"] 
            }

            else if (!proteinFound && nutrient["nutrientName"].includes("Protein")) {
                proteinFound = true
                protein = nutrient["value"] 
            }
        }

        if (cals === 0) {
            cals = Math.round(( fats * 9 + carbs * 4 + protein * 4 ) * multiplier)
        }

        const tempData = [
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
                color: "rgba(131, 167, 234, 1)",
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

        setCalories(cals)
        setData(tempData)
    }

    return(
       <>
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
        <Text style={{paddingTop: 15, fontSize: 15, fontWeight: '400'}}>Total Calories: {calories}</Text>
       </>
    )
}