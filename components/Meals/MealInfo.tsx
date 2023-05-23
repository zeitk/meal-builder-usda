import React, { useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button, Portal } from "react-native-paper";
import { StatusBar } from 'expo-status-bar';
import { useMealList } from "../../context/MealList";
import FoodCard from "../FoodCard";
import NutritionTable from "../Tables/NutritionTable";
import FoodModal from "../FoodModal";
import { IMeal } from "../../interfaces/Interfaces";
import MealServingInput from "./MealServingInput";


export default function MealInfo({ navigation, route }: any) {

    // states
    const [page, setPage] = useState<number>(1);
    const [maxPage, setMaxPage] = useState<number>(3);
    const [multiplier, setMultiplier] = useState<number>(1);
    const [isNameEditing, setIsNameEditing] = useState<boolean>(false)
    const {mealList, setMealList} = useMealList();
    const [name, setName] = useState<string>("")

    // modal related states
    const [viewedFoodId, setViewedFoodId] = useState<number>()
    const [viewedFoodName, setViewedFoodName] = useState<string>()
    const [viewedFoodNutrition, setViewedFoodNutrition] = useState<any>({});
    const [foodModalVisible, setFoodModalVisible] = useState<boolean>(false);
    const [viewedFoodServings, setViewedFoodServings] = useState<any>({})

    if (!mealList) {
        throw new Error(
            "mealList must be accessed through MealListContext.Provider"
        );
    }

    // non-state constants
    var mealIndex = 0;
    mealList.forEach((meal: any, index: number) => {
        if (meal["id"]===route.params["id"]) {
            mealIndex = index;
            return
        }
    })
    const macros = mealList[mealIndex]["data"]["macros"]
    const micros = mealList[mealIndex]["data"]["micros"]
    const other = mealList[mealIndex]["data"]["other"]
    const foods = mealList[mealIndex]["foods"]
    const ref = useRef<any>(null)

    // set page and meal multiplier to 1
    useEffect(() => {
        setPage(1)
        getMaxPage()
        setMultiplier(1);
        setIsNameEditing(false)
        setName(mealList[mealIndex]["name"])
        setFoodModalVisible(false)
    }, [])

    function closeModal() {
        //close modal
        navigation.goBack()
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
        let max = 2;
        if (micros.length > 0) max++;
        if (other.length > 0) max++
        setMaxPage(max);
    }

    // set new serving size
    function newServingQuantity(multiplier: string) {
            setMultiplier(Number(multiplier))
    }

    async function editName() {
        if (isNameEditing) setIsNameEditing(false)
        else {
            // async to allow input to appear before we give it focus
            let x = await setIsNameEditing(true)
            ref.current?.focus();
        }
    }

    function newMealName(newName: string) {

        // TODO: find a more graceful exit
        if (mealList === null) return

        if (newName==="") {
            setIsNameEditing(false)
            return
        }

        setName(newName)
        setIsNameEditing(false)

        // transform only the meal of interest in mealList
        const updatedMealList = mealList.map((meal: any, index: number) => {
            if (index===mealIndex) {
                return({
                    ...meal,
                    name: newName
                })
            }
            else return meal
        })
        saveMealList(updatedMealList)
        setMealList(updatedMealList)
    }

    function moreFoodInfo(foodId: number, foodName: String, foodImage: String) {
        foods.forEach((food: any) => {
            if (food["id"]===foodId) {
                setViewedFoodId(food["id"])
                setViewedFoodName(food["name"])
                setViewedFoodServings({
                    quantity: food["quantity"],
                    multiplier: food["multiplier"]
                })
                setViewedFoodNutrition(food["nutrition"])
                setFoodModalVisible(true)
            }
        })
    }

    // this tag is used to either remove a food or to update a quantity
    function editMealFoods(newMultiplier: number) {
        
        // TODO: find a more graceful exit
        if (mealList === null) return
        // have flag for if we remove only food in list
        let haveRemovedLast = false;
        const updatedMealList = mealList.map((meal: any, index: number) => {
            if (index===mealIndex) {

                let updatedFoods;

                // if we're updating the quantity of the food, update only quantity and multiplier of the new food
                if (newMultiplier>=0) {
                    updatedFoods = meal["foods"].map((food: any) => {
                        if (food["id"] === viewedFoodId) {
                            const newQuantity = (food["quantity"]*newMultiplier).toFixed(2);
                            return({
                                ...food,
                                quantity: newQuantity,
                                multiplier: newMultiplier
                            })
                        }
                        else return food 
                    })
                }

                // if we're removing a food, filter it out from the meal
                else {
                    setFoodModalVisible(false);
                    updatedFoods = meal["foods"].filter((food: any) => food["id"] != viewedFoodId )
                    if (updatedFoods.length===0) {
                        // return early to avoid updating all nutritional data
                        haveRemovedLast = true
                        return {}
                    }
                }

                // update the nutritional data of the meal
                const updatedData = updateMealData(updatedFoods);

                return({
                    ...meal,
                    data: updatedData,
                    foods: updatedFoods
                })
            }
            else return meal
        })

        // delete meal if last food removed, update mealList otherwise
        if (haveRemovedLast) {
            const updatedMealList_deletion = mealList.filter((meal:any) => meal["id"] !== route.params["id"])
            saveMealList(updatedMealList_deletion);
            setMealList(updatedMealList_deletion); 
            navigation.goBack();
        }
        else {
            saveMealList(updatedMealList)
            setMealList(updatedMealList)
        }
    }

    function updateMealData(updatedFoods: any) {
        // this tag combines the nutritional data from each food into a single object

        let foods = updatedFoods

        let overallNutrients: any = {}
        let currentFoodNutrients;

        let multiplier: number;
        let amount: number;

        foods.forEach((foodItem: any, i: number) => {

            multiplier = foodItem["multiplier"]

            // use the first foods data as a template
            if (i == 0) {
                foodItem["nutrition"].forEach((nutrient: any) => {
                    overallNutrients[nutrient["name"]] = {
                        name: nutrient["name"],
                        amount: Number((nutrient["value"]*multiplier).toFixed(2)),
                        unit: nutrient["unitName"]
                    }
                })
            }

            // for subsequent foods either modify an existing value, or create a new one
            else {

                currentFoodNutrients = foodItem["nutrients"];

                // sum up nutrients
                currentFoodNutrients.map((nutrient: any) => {

                    if (overallNutrients[nutrient["name"]]===undefined) {
                        overallNutrients[nutrient["nutrientName"]] = {
                            name: nutrient["name"],
                            amount: Number((nutrient["value"]*multiplier).toFixed(2)),
                            unit: nutrient["unitName"]
                        }
                    }
                    else {
                        amount = overallNutrients[nutrient["name"]]["value"] +  Number((nutrient["value"]*multiplier).toFixed(2))
                        overallNutrients[nutrient["nutrientName"]] = {
                            ...overallNutrients[nutrient["name"]],
                            amount: amount,
                        }
                    }
                })
            }
        })

        // convert to arrays since our tables parse arrays
        const overallNutrientsArray = Object.values(overallNutrients)

        // return updated data to replace old data in meal
        const newData = {
            nutrients: overallNutrientsArray,
        }

        return newData;
    }

    // store updated mealList to persistant memory
    async function saveMealList(updatedMealList: IMeal[]) { 
        try {
            await AsyncStorage.setItem('@meallist', JSON.stringify(updatedMealList))
        }
        catch {
            console.error("Error 6", "Save failure in MealInfo.tsx")
        }
    }

    function navigateToMealBuilder() {
        if (!mealList) return
        if (route.params["mode"]==='Home')  navigation.navigate('MealBuilderHome', { meal: mealList[mealIndex]})
        else navigation.navigate('MealBuilder', { meal: mealList[mealIndex]})
    }

    return (
        <View >
            <StatusBar style="light"></StatusBar>
            <View style={viewStyles.top}>
                { (isNameEditing) ?
                    <View style={viewStyles.header}>
                        <TextInput
                            ref={ref}
                            style={textStyles.mealNameTextInput}
                            placeholder={name}
                            placeholderTextColor="#adadad"
                            returnKeyType="done" 
                            textAlign="center"
                            maxLength={20}
                            onEndEditing={(value) => newMealName(value.nativeEvent.text) }
                            onSubmitEditing={(value) => newMealName(value.nativeEvent.text) } 
                        ></TextInput>
                        <Button children="Cancel" textColor="#c5050c" onPress={editName} labelStyle={textStyles.editButton} style={buttonStyles.nameEditButton}></Button>
                    </View>
                    :
                    <View style={viewStyles.header}>
                        <Text numberOfLines={1} style={textStyles.mealName}>{name}</Text>
                        <Button children="Edit Name" textColor="#282728" onPress={editName} labelStyle={textStyles.editButton} style={buttonStyles.nameEditButton}></Button>
                    </View>
                }
            </View>
            { (page === 1) &&
                <View style={viewStyles.middle}>
                    <View style={viewStyles.foodsLabel}>
                        <Text style={textStyles.foodsLabel}>Items : </Text>
                        <Button children="Add Items" textColor="#282728" labelStyle={textStyles.editButton} style={buttonStyles.addFood} onPress={navigateToMealBuilder}></Button>
                    </View>
                    <ScrollView style={viewStyles.scroll}>
                    {
                        foods.map((food: any, i: number) => {
                            return <FoodCard key={i} id={food["id"]} nutrients={food.nutrition} callback={moreFoodInfo} name={food["name"]} quantity={food["quantity"]} mode={2}></FoodCard>
                        })
                    }
                    </ScrollView>
                </View>

            }
            {
                (page === 2) &&
                (
                    <View style={viewStyles.middle}>
                        <MealServingInput multiplier={multiplier} newServingQuantity={newServingQuantity}></MealServingInput>
                        <View style={viewStyles.nutrition}>
                            <NutritionTable nutrition={macros} isMealView={true} multiplier={multiplier}></NutritionTable>
                        </View>
                    </View>
                )
            }
            {
                (page == 3) &&
                (
                    <View style={viewStyles.middle}>
                        <MealServingInput multiplier={multiplier} newServingQuantity={newServingQuantity}></MealServingInput>
                        <View style={viewStyles.nutrition}>
                            <NutritionTable nutrition={micros} isMealView={true} multiplier={multiplier}></NutritionTable>
                        </View>
                    </View>
                )
            }
            {
                (page == 4) &&
                (
                    <View style={viewStyles.middle}>
                        <MealServingInput multiplier={multiplier} newServingQuantity={newServingQuantity}></MealServingInput>
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
                    nutrition={viewedFoodNutrition} name={viewedFoodName} id={viewedFoodId} servings={viewedFoodServings} 
                    toggle={toggleFoodModal} editMealFoods={editMealFoods} context={"MealInfo"} modalVisible={foodModalVisible}
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
    lower: {
        height: '12%',
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#dadfe1'
    },
    scroll: {
        height: '85%'
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
        height: '90%',
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