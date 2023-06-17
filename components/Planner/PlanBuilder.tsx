import React, { useContext } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useRef } from "react";
import { Alert, ScrollView, TextInput } from 'react-native';
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import CurrentMealContext from '../../context/CurrentMeal';
import { useMealList }  from '../../context/MealList';
import QuicklistContext from '../../context/QuicklistContext';
import FoodCard from '../FoodCard';
import { IMeal, IPlan, IFood } from '../../interfaces/Interfaces'
import SearchDrawer from '../../navigation/SearchDrawer';
import ButtonsContext from '../../context/ButtonsContext';
import { usePlanList } from '../../context/PlanList';
import CurrentPlanContext from '../../context/CurrentPlan';
import MealCard from '../Meals/MealCard';

export default function PlanBuilder({ navigation, route }: any) {

    // states
    const [quicklist] = useContext(QuicklistContext);
    const [currentMeal, setCurrentMeal] = useState<IMeal>({ id: 0, name: "", foods: [], data: {}});
    const [currentPlan, setCurrentPlan] = useState<IPlan>({id: 0, name: "", meals: [],foods: [], data: {}})
    const { mealList, setMealList } = useMealList();
    const { planList, setPlanList } = usePlanList();
    const [page, setPage] = useState<number>(1);
    const [hideButtons, setHideButtons] = useState<boolean>(false);
    const [inEditMode, setInEditMode] = useState<boolean>(false);
    const [isNameEditing, setIsNameEditing] = useState<boolean>(false);
    const ref = useRef<any>(null)
    
    useEffect(() =>{
        setPage(1);
        setHideButtons(false);
        route.params === undefined ? newPlan() : existingPlan(route.params.plan);
    },[])

    function newPlan() {
        // if list is empty set Id to 1
        // else set id to the last id in array plus 1, in the case of deletion
        const planId = (planList !== null && planList.length === 0) ? 1 : planList![planList!.length-1]["id"]+1;
        setCurrentPlan({
            id: planId,
            name:"Plan "+planId,
            foods: [],
            meals: [],
            data: {}
        })
    }

    function existingPlan(plan: any) {
        // should never happen, sanity check
        if (plan===undefined) navigation.goBack();
        // load in current plan
        setCurrentPlan({
            id: plan["id"],
            name: plan["name"],
            foods: plan["foods"],
            meals: plan["meals"],
            data: plan["data"]
        })
        setInEditMode(true);
    }

    function editPlanFood(mode: number, index: number, quantity: any) {
        
        // deep copy to prevent editing other meals
        const selectedFood = JSON.parse(JSON.stringify(quicklist[index]))
        const baseQuantity = selectedFood["servingSize"]
        const unit = selectedFood["unit"]

        // removing a food
        if (mode === 1) {
            setCurrentPlan({
                ...currentPlan,
                foods: currentPlan["foods"].filter((food:any) => food["name"] !== selectedFood["name"])
            });
        }

        // adding a food
        else if (mode === 2 && quantity === -1) {
            selectedFood["multiplier"]=1
            selectedFood["quantity"]=baseQuantity
            selectedFood["unit"] = unit
            setCurrentPlan({
                ...currentPlan,
                foods: [
                ...currentPlan["foods"],
                selectedFood
            ]})
        }

        // update quantity
        else if (mode===2 && quantity >= 0) {
            currentPlan["foods"].map((foodItem: any) => {
                if (selectedFood["name"]===foodItem["name"]) {
                    // set new quantity and multiplier 
                    const multiplier = quantity/baseQuantity
                    foodItem["multiplier"]=multiplier;
                    return foodItem
                    } else {
                    // Other foods haven't changed
                    return foodItem;
                }
            })
        }
    }

    function editPlanMeal(mode: number, index: number, quantity: any) {
        if (mealList === null) return

        // deep copy to prevent editing other meals
        const selectedMeal = JSON.parse(JSON.stringify(mealList[index]))

        // removing a meal
        if (mode === 1) {
            setCurrentPlan({
                ...currentPlan,
                meals: currentPlan["meals"].filter((meal:any) => meal["name"] !== selectedMeal["name"])
            });
        }

        // adding a meal
        else if (mode === 2 && quantity === -1) {
            selectedMeal["quantity"] = 1
            setCurrentPlan({
                ...currentPlan,
                meals: [
                ...currentPlan["meals"],
                selectedMeal
            ]})
        }

        // update quantity
        else if (mode === 2) {
            currentPlan["meals"].map((meal: any) => {
                if (selectedMeal["id"]===meal["id"]) {
                    // set new quantity and multiplier 
                    meal["quantity"]=quantity;
                    return meal
                    } else {
                    // Other meals haven't changed
                    return meal;
                }
            })
        }
    }

    function savePlanData() {

        // this tag combines the nutritional data from each food into a single object
        let foods = currentPlan["foods"]
        let meals = currentPlan["meals"]
        let mealFoods: any = {}

        let macros: any = {}
        let micros: any = {}
        let other: any = {}
        let currentFoodNutrients

        let foodMultiplier: number;
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
                foodMultiplier = foodItem["multiplier"] * mealMultiplier;
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
                                    value = Number((nutrient["value"] * 0.239006 * foodMultiplier).toFixed(2))
                                }
                                else value =  Number((nutrient["value"]*foodMultiplier).toFixed(2))
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
                                    value: Number((nutrient["value"]*foodMultiplier).toFixed(2)),
                                    unitName: nutrient["unitName"]
                                }
                            }

                            else {
                                macros[name] = {
                                    nutrientName: name,
                                    value: Number((nutrient["value"]*foodMultiplier).toFixed(2)),
                                    unitName: nutrient["unitName"]
                                }
                            }

                        }
                        
                        else {

                            // energy needs special handling 
                            if (name.includes("Energy")) {
                                if (energyFound) return
                                if (nutrient["unitName"] === "kJ") {
                                    value = Number((nutrient["value"] * 0.239006 * foodMultiplier).toFixed(2))
                                }
                                else value =  Number((nutrient["value"]*foodMultiplier).toFixed(2))
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
                                amount = macros[name]["value"] +  Number((nutrient["value"]*foodMultiplier).toFixed(2))
                                macros[name] = {
                                    ...macros[name],
                                    value: amount,
                                }
                            }

                            else {
                                amount = macros[name]["value"] +  Number((nutrient["value"]*foodMultiplier).toFixed(2))
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
                                value: Number((nutrient["value"]*foodMultiplier).toFixed(2)),
                                unitName: nutrient["unitName"]
                            }
                        }
                        else {
                            amount = micros[nutrient["nutrientName"]]["value"] +  Number((nutrient["value"]*foodMultiplier).toFixed(2))
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
                                value: Number((nutrient["value"]*foodMultiplier).toFixed(2)),
                                unitName: nutrient["unitName"]
                            }
                        }
                        else {
                            amount = other[nutrient["nutrientName"]]["value"] +  Number((nutrient["value"]*foodMultiplier).toFixed(2))
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

            foodMultiplier = foodItem["multiplier"]
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
                                value = Number((nutrient["value"] * 0.239006 * foodMultiplier).toFixed(2))
                            }
                            else value =  Number((nutrient["value"]*foodMultiplier).toFixed(2))
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
                                value: Number((nutrient["value"]*foodMultiplier).toFixed(2)),
                                unitName: nutrient["unitName"]
                            }
                        }

                        else {
                            macros[name] = {
                                nutrientName: name,
                                value: Number((nutrient["value"]*foodMultiplier).toFixed(2)),
                                unitName: nutrient["unitName"]
                            }
                        }

                    }
                    
                    else {

                        // energy needs special handling 
                        if (name.includes("Energy")) {
                            if (energyFound) return
                            if (nutrient["unitName"] === "kJ") {
                                value = Number((nutrient["value"] * 0.239006 * foodMultiplier).toFixed(2))
                            }
                            else value =  Number((nutrient["value"]*foodMultiplier).toFixed(2))
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
                            amount = macros[name]["value"] +  Number((nutrient["value"]*foodMultiplier).toFixed(2))
                            macros[name] = {
                                ...macros[name],
                                value: amount,
                            }
                        }

                        else {
                            amount = macros[name]["value"] +  Number((nutrient["value"]*foodMultiplier).toFixed(2))
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
                            value: Number((nutrient["value"]*foodMultiplier).toFixed(2)),
                            unitName: nutrient["unitName"]
                        }
                    }
                    else {
                        amount = micros[nutrient["nutrientName"]]["value"] +  Number((nutrient["value"]*foodMultiplier).toFixed(2))
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
                            value: Number((nutrient["value"]*foodMultiplier).toFixed(2)),
                            unitName: nutrient["unitName"]
                        }
                    }
                    else {
                        amount = other[nutrient["nutrientName"]]["value"] +  Number((nutrient["value"]*foodMultiplier).toFixed(2))
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
        const tempPlan = {
            ...currentPlan,
            data: {
                macros: macrosData,
                micros: microsData,
                other: otherData
            }
        }

        return tempPlan;
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
            console.error("Error 12", "Save failure in PlanBuilder.tsx")
        }
    }

    // handle modal closure with or without plan saving 
    function closeModal(mode: number) {

        if (mode===1) {

            if (currentPlan["foods"].length > 0 || currentPlan["meals"].length > 0) {
                Alert.alert(
                    'Unsaved changes',
                    'Are you sure you want to close?',[
                        { text: 'Cancel', onPress: () => {}, style: 'cancel'},
                        { text: 'Yes', onPress: () => { navigation.goBack() } },
                    ],
                    { cancelable: false }
                  );
            }

            else navigation.goBack()
        }

        // save plan if user pressed 'Save'
        else if (mode===2) {

            if (currentPlan["foods"].length === 0 && currentPlan["meals"].length === 0) {
                Alert.alert("Error", "Plans must contain 1 or more foods or meals")
                return
            }

            const newPlan = savePlanData()
            if (!planList) {
                console.error("Error 13", "Plan list null while saving in PlanBuilder.tsx")
                return 
            }

            if (inEditMode) {
                const updatedPlanList = planList.map((plan: IPlan) => {
                    if (plan["id"] === currentPlan["id"]) {
                        return newPlan
                    }
                    return plan
                })
                savePlanList(updatedPlanList)
                setPlanList(updatedPlanList)
            }
            
            else {
                const updatedPlanList = [
                    ...planList,
                    newPlan
                ]
                savePlanList(updatedPlanList)
                setPlanList(updatedPlanList)
            }

            //close modal
            navigation.goBack()
        }  

        // if we're updating an existing plan
        else if (mode===3) {
            const updatedMeal = savePlanData();

            const updatedMealList = mealList!.map((meal: any) => {
                if (meal["id"] === updatedMeal["id"]) {
                    return updatedMeal
                }
                else return meal
            })
            savePlanList(updatedMealList)
            setMealList(updatedMealList)

            //close modal
            navigation.goBack()
        }
    }
    
    function newPlanName(newName: any) {

        // only change name if String passed in
        if (typeof newName==="string") {
            // don't allow blank name
            if (newName==="") return

            setCurrentPlan({
                ...currentPlan,
                name: newName
            })
            setIsNameEditing(false)
        }
    }

    async function editName() {
        if (isNameEditing) setIsNameEditing(false)
        else {
            // async to allow input to appear before we give it focus
            let x = await setIsNameEditing(true)
            ref.current?.focus();
        }
    }

    function isMealInPlan(curMeal: IMeal) {
        for (const meal of currentPlan["meals"]) {
            // not perfect, but should be good enough
            if (meal["id"] === curMeal["id"] && 
                meal["name"] === curMeal["name"] && 
                meal["foods"][0].id === curMeal["foods"][0].id) return(true)
        }
        return(false)
    }

    function isFoodInPlan(id: any) {
        for (const food of currentPlan["foods"]) {
            if (food["id"] === id)  return(true)
        }
        return(false)
    }

    function foodQuantity(id: any) {
        for (const food of currentPlan["foods"]) {
            if (food["id"] === id)  return((food["multiplier"] * food["quantity"]).toFixed(1))
        }
    }

    function mealQuantity(id: any) {
        for (const meal of currentPlan["meals"]) {
            if (meal["id"] === id) return(meal["quantity"])
        }
    }

    function removeFood(id: any) {
        Alert.alert(
            'Remove',
            'Remove from plan?',[
                { text: 'Cancel', onPress: () => {}, style: 'cancel'},
                { text: 'Yes', onPress: () => { 
                    setCurrentPlan({
                        ...currentPlan,
                        foods: currentPlan["foods"].filter((item:any) => item["id"] !== id)
                    });
                }},
            ],
            { cancelable: false }
        );
    }

    function removeMeal(id: any, name: any) {
        Alert.alert(
            'Remove',
            'Remove from plan?',[
                { text: 'Cancel', onPress: () => {}, style: 'cancel'},
                { text: 'Yes', onPress: () => { 
                    setCurrentPlan({
                        ...currentPlan,
                        meals: currentPlan["meals"].filter((item:any) => 
                            item["id"] !== id || item["name"] !== name
                        )
                    });
                }},
            ],
            { cancelable: false }
        );
    }

    return (
        <CurrentMealContext.Provider  value={{currentMeal: currentMeal, setCurrentMeal}}>
        <CurrentPlanContext.Provider  value={{currentPlan: currentPlan, setCurrentPlan}}>
        <ButtonsContext.Provider value={{hideButtons,setHideButtons}}>

        <View style={viewStyles.modal}>
            <View style={viewStyles.overall}>
                { (page !== 4) &&
                    <View style={viewStyles.textInput}>
                    { (isNameEditing) ?
                        <View style={viewStyles.planNameView}>
                            <TextInput
                                ref={ref}
                                style={textStyles.planNameTextInput}
                                placeholder={currentPlan["name"]}
                                placeholderTextColor="#adadad"
                                returnKeyType="done" 
                                textAlign="center"
                                maxLength={20}
                                onEndEditing={(value) => newPlanName(value.nativeEvent.text) }
                                onSubmitEditing={(value) => newPlanName(value.nativeEvent.text) } 
                            ></TextInput>
                            <Button children="Cancel" textColor="#c5050c" onPress={editName} labelStyle={textStyles.editButton} style={buttonStyles.nameEditButton}></Button>
                        </View>
                        :
                        <View style={viewStyles.planNameView}>
                            <Text numberOfLines={1} style={textStyles.planName}>{currentPlan["name"]}</Text>
                            <Button children="Edit Name" textColor="#282728" onPress={editName} labelStyle={textStyles.editButton} style={buttonStyles.nameEditButton}></Button>
                        </View>
                    }
                    </View>
                }
                { (page===1) &&   
                // page 1 encompasses Meal Name selection and Quicklist
                <View style={viewStyles.inputScroll}>
                    { (currentPlan["foods"].length > 0 || currentPlan["meals"].length > 0)
                        ?
                        <ScrollView style={viewStyles.scroll}>
                            <View style={viewStyles.exampleBanner}>
                                <Text style={textStyles.exampleBanner}>Current Plan</Text>
                            </View> 
                            
                            { (currentPlan["meals"].length > 0) &&
                                currentPlan["meals"].map((meal: any, i: number) => {
                                    return (
                                        <MealCard key={i} arrayIndex={i} id={meal["id"]} name={meal["name"]}  
                                            data={meal["data"]} quantity={meal["quantity"]} callback={removeMeal} mode={2}> 
                                        </MealCard>
                                    )
                                })
                            }
                            { (currentPlan["foods"].length > 0) &&
                                currentPlan["foods"].map((food: any, i: number) => {
                                    return (
                                        <FoodCard key={i} id={food["id"]} brand={food.brand} nutrients={food.nutrition} callback={removeFood}
                                            name={food["name"]} quantity={food["quantity"]} unit={food["unit"]} multiplier={food["multiplier"]} mode={4}> 
                                        </FoodCard>
                                    )
                                })
                            }
                            
                        </ScrollView>
                        :
                        <View style={viewStyles.noPlansBannerView}>
                            <Text style={textStyles.noPlansBannerText}>Nothing saved in plan</Text>
                        </View>
                    }
                </View>
                }
                { (page===2) &&   
                // page 1 encompasses Meal Name selection and Quicklist
                <View style={viewStyles.inputScroll}>
                    { (mealList !== null && mealList.length > 0)
                        ?
                        <ScrollView style={viewStyles.scroll}>
                            <View style={viewStyles.exampleBanner}>
                                <Text style={textStyles.exampleBanner}>My Meals</Text>
                            </View> 
                            {
                                mealList.map((meal: IMeal, i: number) => {
                                    const inPlan = isMealInPlan(meal)
                                    const quantity = inPlan ? mealQuantity(meal.id) : 1
                                    return (
                                        <MealCard key={i} arrayIndex={i} id={meal["id"]} name={meal["name"]} quantity={quantity}
                                            data={meal["data"]} pressed={inPlan} callback={editPlanMeal} mode={3}> 
                                        </MealCard>
                                    )
                                })
                            }
                        </ScrollView>
                        :
                        undefined
                    }
                </View>
                }
                { (page === 3) &&
                <View style={viewStyles.inputScroll}>
                    { (quicklist.length > 0) 
                        ?
                        <ScrollView style={viewStyles.scroll}>
                            <View style={viewStyles.exampleBanner}>
                                <Text style={textStyles.exampleBanner}>My Quicklist</Text>
                            </View> 
                            {
                                quicklist.map((food: any, i: number) => {
                                    const inPlan = isFoodInPlan(food.id)
                                    const servingSize = inPlan ? foodQuantity(food.id) : food.servingSize
                                    return (
                                        <FoodCard key={i} arrayIndex={i} id={food.id} name={food.name} brand={food.brand} pressed={inPlan}
                                            nutrients={food.nutrition} servingSize={servingSize} unit={food.unit} callback={editPlanFood} mode={1}>
                                        </FoodCard>
                                    )
                                })
                            }
                        </ScrollView>
                        :
                        undefined
                    }
                </View>
                }
                { (page === 4) &&
                    // page 2 is entirely composed of the Search feature
                    <View style={viewStyles.editScroll}>
                        <View style={viewStyles.overall}>
                            <SearchDrawer name="Meals"></SearchDrawer>
                        </View>
                    </View>
                }

                {/* Buttons on the bottom of screen */}
                <View style={buttonStyles.bottomButtonsView}>
                    <View style={buttonStyles.pageButtonsView}>
                        <Button disabled={hideButtons || page === 1} children="Prev" textColor="#2774AE" labelStyle={textStyles.buttons}  style={buttonStyles.twinButtons} onPress={() => setPage(page - 1)}></Button>
                        <View style={{width: 25, justifyContent: 'center', flexDirection: 'row'}}>
                            <Text>{page}</Text>
                        </View>
                        <Button disabled={hideButtons || page === 4} children="Next" textColor="#2774AE" labelStyle={textStyles.buttons} style={buttonStyles.twinButtons} onPress={() => setPage(page + 1)}></Button>
                    </View>
                    <View style={buttonStyles.closeButtonsView}>
                        <View style={buttonStyles.closeSaveButtons}>
                            <Button disabled={hideButtons} children="Close" textColor="#c5050c" labelStyle={textStyles.buttons} style={buttonStyles.twinButtons} onPress={()=> closeModal(1)}></Button>
                            <Button disabled={hideButtons} children="Save Plan" textColor="#22a811" labelStyle={textStyles.buttons} style={buttonStyles.twinButtons} onPress={()=> closeModal(2)}></Button>
                        </View>
                    </View>
                </View>
                
            </View>
        </View>     

        </ButtonsContext.Provider>
        </CurrentPlanContext.Provider>
        </CurrentMealContext.Provider>
    )
}

const viewStyles = StyleSheet.create({
    overall: {
        height: '100%',
        width: '100%',
    },
    centered: {
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    scroll: {
        height: '100%',
    },
    editScroll: {
        height: '82.5%',
    },
    modal: {
        alignItems: 'center',
        backgroundColor: 'white',
    },
    inputScroll:{
        height: '74.25%'
    },
    header: {
        textTransform: 'capitalize',
        fontSize: 24
    },
    emptyQuicklist: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    textInput: {
        height: '8.25%',
        justifyContent: 'center',
    },
    exampleBanner: {
        padding: 12,
    },
    noPlansBannerView: {
        height: '100%',
        backgroundColor:'white',
        justifyContent: 'center',
        alignItems: 'center'
    },
    planNameView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
})

const textStyles = StyleSheet.create({
    buttons: {
        fontSize: 20,
        fontWeight: '300'
    },
    exampleBanner: {
        fontSize: 20,
        fontWeight: '300',
        paddingLeft: 10
    },
    bodyText: {
        fontSize: 20,
        fontWeight: '300',
        paddingBottom: 10
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#646569',
        width: '50%',
        height: 40,
        padding: 7.5,
        fontSize: 18,
        fontWeight: '300'
    },
    noPlansBannerText: {
        fontSize: 17,
        fontWeight: '300'
    },
    title: {
        fontSize: 25,
        fontWeight: '300'
    },
    planName: {
        fontSize: 24,
        fontWeight: '300',
        padding: 7.5,
    },
    planNameTextInput: {
        fontSize: 24,
        fontWeight: '300',
        width: 200,
        padding: 7.5,
        borderWidth: 1,
        borderColor: '#646569',
    },
    editButton: {
        fontSize: 12
    }
})

const buttonStyles = StyleSheet.create({
    editBottomButtonsView: {
        height: '15%',
        width: '100%',
        justifyContent: 'flex-start',
        paddingTop: 17.5,
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#dadfe1'
    },
    bottomButtonsView: {
        height: '17.5%',
        width: '100%'
    },
    closeSaveButtons: {
        flexDirection: 'row',
        paddingTop: 7.5
    },
    pageButtonsView: {
        height: '40%',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f7f7f7'
    },
    closeButtonsView: {
        height: '60%',
        width: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    singleButton: {
        width: 300,
    },
    twinButtons: {
        width: 170
    },
    nameEditButton: {
        position: 'absolute',
        right: '5%',
        alignSelf: 'center'
    }
    
})