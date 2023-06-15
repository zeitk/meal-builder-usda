import React, { useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button, Portal } from "react-native-paper";
import { StatusBar } from 'expo-status-bar';
import FoodCard from "../FoodCard";
import NutritionTable from "../Tables/NutritionTable";
import FoodModal from "../FoodModal";
import { IFood, IMeal, IPlan } from "../../interfaces/Interfaces";
import Pie from "../Tables/PieChart";
import { usePlanList } from "../../context/PlanList";
import MealCard from "../Meals/MealCard";
import Bar from "../Tables/BarChart";


export default function PlanInfo( props: any) {

    // states
    const [page, setPage] = useState<number>(1);
    const [maxPage, setMaxPage] = useState<number>(3);
    const [multiplier, setMultiplier] = useState<number>(1);
    const { planList, setPlanList } = usePlanList();

    // modal related states
    const [viewedFoodId, setViewedFoodId] = useState<number>()
    const [viewedFoodName, setViewedFoodName] = useState<string>()
    const [viewedFoodNutrition, setViewedFoodNutrition] = useState<any>({});
    const [viewedFoodUnit, setViewedFoodUnit] =  useState<string>("");
    const [viewedFoodBrand, setViewedFoodBrand] = useState<string>("")
    const [viewedFoodServings, setViewedFoodServings] = useState<any>({})
    const [viewedFoodMultiplier, setViewedFoodMultiplier] = useState<number>(1)
    const [foodModalVisible, setFoodModalVisible] = useState<boolean>(false);

    if (!planList) {
        throw new Error(
            "mealList must be accessed through MealListContext.Provider"
        );
    }

    // non-state constants
    var planIndex = 0;
    planList.forEach((plan: any, index: number) => {
        if (plan["id"]===props.route.params["id"]) {
            plan = index;
            return
        }
    })
    const macros = planList[planIndex]["data"]["macros"]
    const micros = planList[planIndex]["data"]["micros"]
    const other = planList[planIndex]["data"]["other"]
    const foods = planList[planIndex]["foods"]
    const meals = planList[planIndex]["meals"]
    const ref = useRef<any>(null)

    // set page and meal multiplier to 1
    useEffect(() => {
        setPage(1)
        getMaxPage()
        setMultiplier(1);
        setFoodModalVisible(false) 
        if (props.route.params !== undefined && props.route.params.meal !== undefined)  editPlanMeals(props.route.params.meal)
    }, [props.route])

    function closeModal() {
        //close modal
        props.navigation.goBack()
    }

    function toggleFoodModal() {
        if (!foodModalVisible) setFoodModalVisible(true)
        else setFoodModalVisible(false)
    }

    function nextPage() {
        if (page < maxPage) setPage(page + 1)
    }

    function prevPage() {
        if (page > 1) setPage(page - 1)
    }

    function getMaxPage() {
        let max = 4;
        if (micros.length > 0) max++;
        if (other.length > 0) max++
        setMaxPage(max);
    }

    function moreFoodInfo(foodId: number) {
        foods.forEach((food: any) => {
            if (food["id"]===foodId) {
                setViewedFoodId(food["id"])
                setViewedFoodName(food["name"])
                setViewedFoodMultiplier(food["multiplier"])
                setViewedFoodServings(food["quantity"])
                setViewedFoodBrand(food["brand"])
                setViewedFoodUnit(food["unit"])
                setViewedFoodNutrition(food["nutrition"])
                setFoodModalVisible(true)
            }
        })
    }

    function moreMealInfo(mealId: number) {
        if (planList === null) return
        let mealIndex: number = -1;
        planList[planIndex]["meals"].forEach((meal: IMeal, index: number) => {
            if (mealId === meal["id"]) {
                mealIndex = index;
            }
        }) 
        if (mealIndex === -1) return
        props.navigation.navigate({
            name: 'MealBuilder',
            params: {
                meal:mealIndex,
                plan:planIndex
            }
        })
    }

    // this tag is used to either remove a food or to update a quantity
    function editPlanFoods(newMultiplier: number) {

        // TODO: find a more graceful exit
        if (planList === null) return

        // have flag for if we remove only food in list
        let haveRemovedLast = false;
        const currentPlan = planList[planIndex]
        
        let updatedFoods;

        // if we're updating the quantity of the food, update only quantity and multiplier of the new food
        if (newMultiplier>=0) {
            updatedFoods = currentPlan["foods"].map((food: any) => {
                if (food["id"] === viewedFoodId) {
                    return({
                        ...food,
                        multiplier: newMultiplier
                    })
                }
                else return food 
            })
        }

        // if we're removing a food, filter it out from the meal
        else {
            setFoodModalVisible(false);
            updatedFoods = currentPlan["foods"].filter((food: any) => food["id"] != viewedFoodId )
            if (updatedFoods.length===0) {
                // return early to avoid updating all nutritional data
                haveRemovedLast = true
            }
        }

        const updatedData = updatePlanData(undefined, updatedFoods)

        const updatedPlan: IPlan = ({
            ...currentPlan,
            foods: updatedFoods,
            data: updatedData
        })

        const updatedPlanList = planList.map((plan: IPlan, index: number) => {
            if (index===planIndex) return updatedPlan
            else return plan
        })

        // delete plan if last item removed, update planList otherwise
        if (haveRemovedLast && currentPlan["meals"].length === 0) {
            const updatedPlanList_deletion = planList.filter((plan:any) => plan["id"] !== props.route.params["id"])
            savePlanList(updatedPlanList_deletion);
            setPlanList(updatedPlanList_deletion); 
            props.navigation.goBack();
        }
        else {
            savePlanList(updatedPlanList)
            setPlanList(updatedPlanList)
        }
    }

    // this tag is used to either remove a food or to update a quantity
    function editPlanMeals(newMeal: IMeal) {

        // TODO: find a more graceful exit
        if (planList === null) return
        // have flag for if we remove only food in list
        let haveRemovedLast = false;
        const currentPlan = planList[planIndex]
        const updatedPlanList = planList.map((plan: any, index: number) => {
            if (index===planIndex) {

                // replace the meal
                const updatedMeals = plan["meals"].map((meal: any) => {
                    if (meal["id"] === newMeal["id"]) return newMeal
                    else return meal 
                })

                // update the nutritional data of the plan
                const updatedData = updatePlanData(updatedMeals , undefined);

                return({
                    ...plan,
                    data: updatedData,
                    meals: updatedMeals
                })
            }
            else return plan
        })

        // delete plan if last item removed, update planList otherwise
        if (haveRemovedLast && currentPlan["foods"].length === 0) {
            const updatedPlanList_deletion = planList.filter((plan:any) => plan["id"] !== props.route.params["id"])
            savePlanList(updatedPlanList_deletion);
            setPlanList(updatedPlanList_deletion); 
            props.navigation.goBack();
        }
        else {
            savePlanList(updatedPlanList)
            setPlanList(updatedPlanList)
        }
    }

    function updatePlanData(updatedMeals: IMeal[] | undefined, updatedFoods: IFood[] | undefined) {

        if (planList === null) return 

        // this tag combines the nutritional data from each food into a single object
        const currentPlan = planList[planIndex]
        const foods = updatedFoods !== undefined ? updatedFoods : currentPlan["foods"]
        const meals = updatedMeals !== undefined ? updatedMeals : currentPlan["meals"]
        let mealFoods: any = {}

        let macros: any = {}
        let micros: any = {}
        let other: any = {}
        let currentFoodNutrients

        let multiplier: number;
        let mealMultiplier: number;
        let amount: number;

        // used for energy to handle duplicate entries and mismatching units
        let value: number;
        let name: string;
        let unit: string;
        let energyFound: boolean;
        let carbsFound: boolean;

        // start with meals
        meals.forEach((meal: IMeal) => {
            
            mealFoods = meal["foods"]
            mealMultiplier = meal["quantity"] === undefined ? 1 : meal["quantity"]

            mealFoods.forEach((foodItem: IFood) => {
                multiplier = foodItem["multiplier"] * mealMultiplier
                currentFoodNutrients = foodItem["nutrition"];
                energyFound = false;
                carbsFound = false;

                // sum up nutrients
                currentFoodNutrients.map((nutrient: any) => {

                    // sum macros
                    if (nutrient.nutrientNumber < 300 || nutrient.nutrientName.includes("Fatty") || nutrient.nutrientName.includes("Energy")) {

                        name = nutrient["nutrientName"]
                        if (name.includes("Energy")) name = "Energy"
                        if (name.includes("Carbohydrate")) name = "Carbohydrates"

                        if (macros[name]===undefined) {

                            // energy needs special handling 
                            if (name.includes("Energy")) {
                                if (energyFound) return
                                if (nutrient["unitName"] === "kJ") {
                                    value = Number((nutrient["value"] * 0.239006 * multiplier).toFixed(2))
                                }
                                else value =  Number((nutrient["value"]*multiplier).toFixed(2))
                                unit = "kcal"
                                energyFound = true;
                                macros[name] = {
                                    nutrientName: name,
                                    value: value,
                                    unitName: unit
                                }
                            }
                            
                            // carbs may be named differently
                            else if (name.includes("Carbohydrate")) {
                                if (carbsFound) return;
                                name = "Carbohydrates"
                                carbsFound = true;
                                macros[name] = {
                                    nutrientName: name,
                                    value: Number((nutrient["value"]*multiplier).toFixed(2)),
                                    unitName: nutrient["unitName"]
                                }
                            }

                            else {
                                macros[name] = {
                                    nutrientName: name,
                                    value: Number((nutrient["value"]*multiplier).toFixed(2)),
                                    unitName: nutrient["unitName"]
                                }
                            }

                        }
                        
                        else {

                            // energy needs special handling 
                            if (name.includes("Energy")) {
                                if (energyFound) return
                                if (nutrient["unitName"] === "kJ") {
                                    value = Number((nutrient["value"] * 0.239006 * multiplier).toFixed(2))
                                }
                                else value =  Number((nutrient["value"]*multiplier).toFixed(2))
                                name = "Energy"
                                energyFound = true;
                                amount = macros[name]["value"] + value;
                                macros[name] = {
                                    ...macros[name],
                                    value: amount,
                                }
                            }
                            
                            // carbs may be named differently
                            else if (name.includes("Carbohydrate")) {
                                if (carbsFound) return
                                name = "Carbohydrates"
                                carbsFound = true
                                amount = macros[name]["value"] +  Number((nutrient["value"]*multiplier).toFixed(2))
                                macros[name] = {
                                    ...macros[name],
                                    value: amount,
                                }
                            }

                            else {
                                amount = macros[name]["value"] +  Number((nutrient["value"]*multiplier).toFixed(2))
                                macros[name] = {
                                    ...macros[name],
                                    value: amount,
                                }
                            }
                        }
                    }

                    // sum micros
                    else if (nutrient.nutrientNumber < 605) {
                        if (micros[nutrient["nutrientName"]]===undefined) {
                            micros[nutrient["nutrientName"]] = {
                                nutrientName: nutrient["nutrientName"],
                                value: Number((nutrient["value"]*multiplier).toFixed(2)),
                                unitName: nutrient["unitName"]
                            }
                        }
                        else {
                            amount = micros[nutrient["nutrientName"]]["value"] +  Number((nutrient["value"]*multiplier).toFixed(2))
                            micros[nutrient["nutrientName"]] = {
                                ...micros[nutrient["nutrientName"]],
                                value: amount,
                            }
                        }
                    } 

                    // sum other
                    else {
                        if (other[nutrient["nutrientName"]]===undefined) {
                            other[nutrient["nutrientName"]] = {
                                nutrientName: nutrient["nutrientName"],
                                value: Number((nutrient["value"]*multiplier).toFixed(2)),
                                unitName: nutrient["unitName"]
                            }
                        }
                        else {
                            amount = other[nutrient["nutrientName"]]["value"] +  Number((nutrient["value"]*multiplier).toFixed(2))
                            other[nutrient["nutrientName"]] = {
                                ...other[nutrient["nutrientName"]],
                                value: amount,
                            }
                        }
                    }
                })
            })
        })

        // now do foods
        foods.forEach((foodItem: IFood) => {

            multiplier = foodItem["multiplier"]
            currentFoodNutrients = foodItem["nutrition"];
            energyFound = false;
            carbsFound = false;

            // sum up nutrients
            currentFoodNutrients.map((nutrient: any) => {

                // sum macros
                if (nutrient.nutrientNumber < 300 || nutrient.nutrientName.includes("Fatty") || nutrient.nutrientName.includes("Energy")) {

                    name = nutrient["nutrientName"]
                    if (name.includes("Energy")) name = "Energy"
                    if (name.includes("Carbohydrate")) name = "Carbohydrates"

                    if (macros[name]===undefined) {

                        // energy needs special handling 
                        if (name.includes("Energy")) {
                            if (energyFound) return
                            if (nutrient["unitName"] === "kJ") {
                                value = Number((nutrient["value"] * 0.239006 * multiplier).toFixed(2))
                            }
                            else value =  Number((nutrient["value"]*multiplier).toFixed(2))
                            unit = "kcal"
                            energyFound = true;
                            macros[name] = {
                                nutrientName: name,
                                value: value,
                                unitName: unit
                            }
                        }
                        
                        // carbs may be named differently
                        else if (name.includes("Carbohydrate")) {
                            if (carbsFound) return;
                            name = "Carbohydrates"
                            carbsFound = true;
                            macros[name] = {
                                nutrientName: name,
                                value: Number((nutrient["value"]*multiplier).toFixed(2)),
                                unitName: nutrient["unitName"]
                            }
                        }

                        else {
                            macros[name] = {
                                nutrientName: name,
                                value: Number((nutrient["value"]*multiplier).toFixed(2)),
                                unitName: nutrient["unitName"]
                            }
                        }

                    }
                    
                    else {

                        // energy needs special handling 
                        if (name.includes("Energy")) {
                            if (energyFound) return
                            if (nutrient["unitName"] === "kJ") {
                                value = Number((nutrient["value"] * 0.239006 * multiplier).toFixed(2))
                            }
                            else value =  Number((nutrient["value"]*multiplier).toFixed(2))
                            name = "Energy"
                            energyFound = true;
                            amount = macros[name]["value"] + value;
                            macros[name] = {
                                ...macros[name],
                                value: amount,
                            }
                        }
                        
                        // carbs may be named differently
                        else if (name.includes("Carbohydrate")) {
                            if (carbsFound) return
                            name = "Carbohydrates"
                            carbsFound = true
                            amount = macros[name]["value"] +  Number((nutrient["value"]*multiplier).toFixed(2))
                            macros[name] = {
                                ...macros[name],
                                value: amount,
                            }
                        }

                        else {
                            amount = macros[name]["value"] +  Number((nutrient["value"]*multiplier).toFixed(2))
                            macros[name] = {
                                ...macros[name],
                                value: amount,
                            }
                        }
                    }
                }

                // sum micros
                else if (nutrient.nutrientNumber < 605) {
                    if (micros[nutrient["nutrientName"]]===undefined) {
                        micros[nutrient["nutrientName"]] = {
                            nutrientName: nutrient["nutrientName"],
                            value: Number((nutrient["value"]*multiplier).toFixed(2)),
                            unitName: nutrient["unitName"]
                        }
                    }
                    else {
                        amount = micros[nutrient["nutrientName"]]["value"] +  Number((nutrient["value"]*multiplier).toFixed(2))
                        micros[nutrient["nutrientName"]] = {
                            ...micros[nutrient["nutrientName"]],
                            value: amount,
                        }
                    }
                } 

                // sum other
                else {
                    if (other[nutrient["nutrientName"]]===undefined) {
                        other[nutrient["nutrientName"]] = {
                            nutrientName: nutrient["nutrientName"],
                            value: Number((nutrient["value"]*multiplier).toFixed(2)),
                            unitName: nutrient["unitName"]
                        }
                    }
                    else {
                        amount = other[nutrient["nutrientName"]]["value"] +  Number((nutrient["value"]*multiplier).toFixed(2))
                        other[nutrient["nutrientName"]] = {
                            ...other[nutrient["nutrientName"]],
                            value: amount,
                        }
                    }
                }
            })
            
        })

        // convert to arrays so tables can parse data
        const macrosData = Object.values(macros)
        const microsData = Object.values(micros)
        const otherData = Object.values(other)

        // sort the arrays
        sortNutrients(macrosData, microsData)

        // return a modified meal with the new data to store in the meal list
        const updatedData = {
            macros: macrosData,
            micros: microsData,
            other: otherData
        }

        return updatedData;
    }

    function sortNutrients(macros: any, micros: any) {

        // sort by id of macronutrient
        macros.sort((a: any, b: any) => {

            // have major macros go first
            if (a.nutrientName.includes("Energy")) {
                if (b.nutrientName.includes("Energy")) {
                    if (b.unitName==="KCAL") return(1)
                }
                return(-1)
            }
            else if (b.nutrientName.includes("Energy")) return(1)
            
            else if (a.nutrientName==="Total lipid (fat)") return(-1)
            else if (b.nutrientName==="Total lipid (fat)") return(1)

            else if (a.nutrientName.includes("Carbohydrate")) return(-1)
            else if (b.nutrientName.includes("Carbohydrate")) return(1)

            else if (a.nutrientName==="Protein") return(-1)
            else if (b.nutrientName==="Protein") return(1)

            else if (a.nutrientName.includes("Fatty")) return(-1)
            else if (b.nutrientName.includes("Fatty")) return(1)

            else if (a.nutrientNumber<b.nutrientNumber) return(-1)
            return(1)
        });

        // sort by id of micronutrient
        micros.sort((a: any, b: any) => {
             // have vitamins go first
            if (a.nutrientName.includes("Vitamin")) {
                if (b.nutrientName.includes("Vitamin")) {
                    if (a.nutrientName>b.nutrientName) return(1)
                }
                return(-1)
            }
            else if (b.nutrientName.includes("Vitamin")) return(1)

            else if (a.nutrientNumber<b.nutrientNumber) return(-1)
            return(1)
        });
    }

    // store updated mealList to persistant memory
    async function savePlanList(updatedPlanList: IMeal[]) { 
        try {
            await AsyncStorage.setItem('@planlist', JSON.stringify(updatedPlanList))
        }
        catch {
            console.error("Error 16", "Save failure in PlanInfo.tsx")
        }
    }

    function navigateToPlanBuilder() {
        if (!planList) return
        props.navigation.navigate('PlanBuilder', { plan: planList[planIndex], context: 'PlanInfo'})
    }

    return (
        <View >
            <StatusBar style="light"></StatusBar>
            <View style={viewStyles.top}>
                <View style={viewStyles.header}>
                    <Text numberOfLines={1} style={textStyles.mealName}>{planList[planIndex]["name"]}</Text>
                </View>
            </View>
            { (page === 1) &&
                <View style={viewStyles.middle}>
                    <View style={viewStyles.foodsLabel}>
                        <Text style={textStyles.foodsLabel}>Items : </Text>
                        <Button children="Edit Plan" textColor="#282728" labelStyle={textStyles.editButton} style={buttonStyles.addFood} onPress={navigateToPlanBuilder}></Button>
                    </View>
                    <ScrollView style={viewStyles.scroll}>
                    { 
                        meals.map((meal: any, i: number) => {
                                return (
                                    <MealCard key={i} arrayIndex={i} id={meal["id"]} name={meal["name"]}  
                                        data={meal["data"]} quantity={meal["quantity"]} callback={moreMealInfo} mode={4}> 
                                    </MealCard>
                                )
                            })
                        }
                    {
                        foods.map((food: any, i: number) => {
                            return (
                                <FoodCard 
                                    key={i} id={food["id"]} brand={food.brand} nutrients={food.nutrition} callback={moreFoodInfo} 
                                    name={food["name"]} quantity={food["quantity"]} unit={food["unit"]} multiplier={food["multiplier"]} mode={2}>
                                </FoodCard>
                            )
                        })
                    }
                    </ScrollView>
                </View>

            }
            {
                (page === 2) &&
                (
                    <View style={viewStyles.middle}>
                        <View style={viewStyles.nutrition}>
                            <NutritionTable nutrition={macros} isMealView={true} multiplier={multiplier}></NutritionTable>
                        </View>
                    </View>
                )
            }
            {
                (page === 3) && 
                (
                    <View style={viewStyles.pieChart}>
                        <Bar nutrition={macros}></Bar>
                        {/* <Pie nutrition={macros} multiplier={multiplier}></Pie> */}
                    </View>
                )
            }
            {  
                (page === 4) &&
                (
                    <View style={viewStyles.pieChart}>
                        <Pie nutrition={macros} multiplier={multiplier}></Pie>
                    </View>
                )

            }
            {
                (page === 5) &&
                (
                    <View style={viewStyles.middle}>
                        <View style={viewStyles.nutrition}>
                            <NutritionTable nutrition={micros} isMealView={true} multiplier={multiplier}></NutritionTable>
                        </View>
                    </View>
                )
            }
            {
                (page === 6) &&
                (
                    <View style={viewStyles.middle}>
                        <View style={viewStyles.nutrition}>
                            <NutritionTable nutrition={other} isMealView={true} multiplier={multiplier}></NutritionTable>
                        </View>
                    </View>
                )
            }

            <View style={viewStyles.lower}>      
                <Button children={"Prev"} textColor="#2774AE" labelStyle={textStyles.button} style={buttonStyles.leftButton} onPress={()=> prevPage()} disabled={(page<2)}></Button>
                <Text style={textStyles.pageText}>{page} of {maxPage}</Text>
                <Button children={"Next"} textColor="#2774AE" labelStyle={textStyles.button} style={buttonStyles.rightButton} onPress={()=> nextPage()} disabled={(page>=maxPage)}></Button>          
                <Button children={"Close"} textColor="#c5050c" labelStyle={textStyles.button} style={buttonStyles.closeButton} onPress={()=> closeModal()}></Button>
            </View>

            <Portal.Host>
                <FoodModal 
                    nutrition={viewedFoodNutrition} name={viewedFoodName} id={viewedFoodId} multiplier={viewedFoodMultiplier} servingSize={viewedFoodServings} unit={viewedFoodUnit}
                    brand={viewedFoodBrand} toggle={toggleFoodModal} removeFromMeal={editPlanFoods} editMealFoods={editPlanFoods} context={"MealInfo"} modalVisible={foodModalVisible}
                ></FoodModal>
            </Portal.Host>

        </View>
    )
}

const viewStyles = StyleSheet.create({

    // views
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    top: {
        height: '10%',
        justifyContent: 'center',
    },
    middle: {
        height: '75%',
    },
    pieChart: {
        height: '75%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    lower: {
        height: '12%',
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#dadfe1'
    },
    scroll: {
        height: '100%'
    },
    textInput: {
        height: '10%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10,
        marginHorizontal: 10,
        padding: 10,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#dadfe1',
        width: '95%'
    },
    foodsLabel: {
        height: 65,
        padding: 5,
        marginBottom: 5,
        borderTopWidth: 1,
        borderColor: '#dadfe1',
        flexDirection: 'row',
        alignItems: 'center'
    },
    nutrition: {
        height: '100%',
        padding: 7.5,
        overflow: 'hidden'
    },
    cost: {
        height: '20%',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#dadfe1',
    },
    flavonoids: {
        height: '80%',
        alignItems: 'center',
        overflow: 'hidden'
    },
})

const textStyles = StyleSheet.create({
    button: {
        fontSize: 20,
        fontWeight: '300'
    },
    foodsLabel: {
        fontSize: 20,
        fontWeight: '300',
        paddingLeft: 20
    },
    mealName: {
        fontSize: 24,
        fontWeight: '300',
        padding: 7.5,
    },
    mealNameTextInput: {
        fontSize: 24,
        fontWeight: '300',
        width: 200,
        padding: 7.5,
        borderWidth: 1,
        borderColor: '#646569',
    },
    editButton: {
        fontSize: 12
    },
    pageText: {
        position: 'absolute',
        left: '30%'
    },
    servingTextInput: {
        width: '12.5%',
        height: '100%',
        padding: 5,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#dadfe1'
    }
})

const buttonStyles = StyleSheet.create({
    closeSaveButtons: {
        flexDirection: 'row',
    },
    leftButton: {
        position: 'absolute',
        left: '7.5%',
    },
    rightButton: {
        position: 'absolute',
        left: '47.5%',
    },
    closeButton: {
        position: 'absolute',
        left: '72.5%'
    },
    nameEditButton: {
        position: 'absolute',
        right: '5%',
        alignSelf: 'center'
    },
    addFood: {
        position: 'absolute',
        right: '5%'
    }
})