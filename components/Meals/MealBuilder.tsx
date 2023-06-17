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
import { IFood, IMeal } from '../../interfaces/Interfaces'
import SearchDrawer from '../../navigation/SearchDrawer';
import ButtonsContext from '../../context/ButtonsContext';
import { usePlanList } from '../../context/PlanList';

export default function MealBuilder({ navigation, route }: any) {

    // states
    const [quicklist] = useContext(QuicklistContext);
    const [currentMeal, setCurrentMeal] = useState<IMeal>({ id: 0, name: "", foods: [], data: {}});
    const { mealList, setMealList } = useMealList();
    const { planList } = usePlanList();
    const [page, setPage] = useState<number>(1);
    const [hideButtons, setHideButtons] = useState<boolean>(false);
    const [isNameEditing, setIsNameEditing] = useState<boolean>(false);
    const ref = useRef<any>(null)
    const [inEditMode, setInEditMode] = useState<boolean>(false);
    const [fromPlan, setFromPlan] = useState<boolean>(false);
    
    useEffect(() =>{
        setPage(1);
        setHideButtons(false);
        route.params === undefined ? newMeal() : existingMeal(route.params);
    },[])

    function newMeal() {
        // if list is empty set Id to 1
        // else set id to the last id in array plus 1, in the case of deletion
        let mealId;
        (mealList !== null && mealList.length === 0) ? mealId=1:mealId = mealList![mealList!.length-1]["id"]+1;
        setCurrentMeal({
            id: mealId,
            name:"Meal "+mealId,
            foods: [],
            data: {}
        })
    }

    function existingMeal(params: any) {

        let meal: IMeal;
        if (params.plan !== undefined && planList !== null) {
            const plan = planList[params.plan]
            meal = plan["meals"][params.meal]
            setFromPlan(true)
        }

        else {
            meal = route.params.meal
        }

        // should never happen, sanity check
        if (meal===undefined) navigation.goBack();
        // load in current meal, and place in search mode
        setCurrentMeal(meal)
        setInEditMode(true);
    }

    async function editName() {
        if (isNameEditing) setIsNameEditing(false)
        else {
            // async to allow input to appear before we give it focus
            let x = await setIsNameEditing(true)
            ref.current?.focus();
        }
    }

    function editMeal(mode: number, index: number, quantity: any) {
        
        // deep copy to prevent editing other meals
        const selectedFood = JSON.parse(JSON.stringify(quicklist[index]))
        const baseQuantity = selectedFood["servingSize"]
        const unit = selectedFood["unit"]

        // removing a food
        if (mode === 1) {
            setCurrentMeal({
                ...currentMeal,
                foods: currentMeal["foods"].filter((food:any) => food["name"] !== selectedFood["name"])
            });
        }

        // adding a food
        else if (mode === 2 && quantity === -1) {
            selectedFood["multiplier"]=1
            selectedFood["quantity"]=baseQuantity
            selectedFood["unit"] = unit
            setCurrentMeal({
                ...currentMeal,
                foods: [
                ...currentMeal["foods"],
                selectedFood
            ]})
        }

        // update quantity
        else if (mode===2 && quantity >= 0) {
            currentMeal["foods"].map((foodItem: any) => {
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

    function saveMealData() {

        // this tag combines the nutritional data from each food into a single object
        let foods = currentMeal["foods"]

        let macros: any = {}
        let micros: any = {}
        let other: any = {}
        let currentFoodNutrients

        let multiplier: number;
        let amount: number;

        // used for energy to handle duplicate entries and mismatching units
        let value: number;
        let name: string;
        let unit: string;
        let energyFound: boolean;
        let carbsFound: boolean;

        foods.forEach((foodItem: IFood, i: number) => {

            multiplier = foodItem["multiplier"]
            if (i == 0) {
                // use the first foods data as a template
                energyFound = false;
                carbsFound = false;
                foodItem["nutrition"].forEach((nutrient: any) => {

                    // sort nutrients in their respective buckets
                    if (nutrient.nutrientNumber < 300 || nutrient.nutrientName.includes("Fatty") || nutrient.nutrientName.includes("Energy")) {
                        
                        // energy needs special handling 
                        if (nutrient.nutrientName.includes("Energy")) {
                            if (energyFound) return
                            if (nutrient["unitName"] === "kJ") {
                                value = Number((nutrient["value"] * 0.239006 * multiplier).toFixed(2))
                            }
                            else value =  Number((nutrient["value"]*multiplier).toFixed(2))
                            unit = "kcal"
                            name = "Energy"
                            energyFound = true;
                            macros[name] = {
                                nutrientName: name,
                                value: value,
                                unitName: unit
                            }
                        }
                        
                        else if (nutrient.nutrientName.includes("Carbohydrate")) {
                            if (carbsFound) return
                            name = "Carbohydrates"
                            carbsFound = true;
                            macros[name] = {
                                nutrientName: name,
                                value: Number((nutrient["value"]*multiplier).toFixed(2)),
                                unitName: nutrient["unitName"]
                            }
                        }

                        else {
                            macros[nutrient["nutrientName"]] = {
                                nutrientName: nutrient["nutrientName"],
                                value: Number((nutrient["value"]*multiplier).toFixed(2)),
                                unitName: nutrient["unitName"]
                            }
                        }

                    }
                    else if (nutrient.nutrientNumber < 605) {
                        micros[nutrient["nutrientName"]] = {
                            nutrientName: nutrient["nutrientName"],
                            value: Number((nutrient["value"]*multiplier).toFixed(2)),
                            unitName: nutrient["unitName"]
                        }
                    } 
                    else {
                        other[nutrient["nutrientName"]] = {
                            nutrientName: nutrient["nutrientName"],
                            value: Number((nutrient["value"]*multiplier).toFixed(2)),
                            unitName: nutrient["unitName"]
                        }
                    }
            })
                

            }
            

            else {

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
            }
        })

        // convert to arrays so tables can parse data
        const macrosData = Object.values(macros)
        const microsData = Object.values(micros)
        const otherData = Object.values(other)

        // sort the arrays
        sortNutrients(macrosData, microsData)

        // return a modified meal with the new data to store in the meal list
        const tempMeal = {
            ...currentMeal,
            data: {
                macros: macrosData,
                micros: microsData,
                other: otherData
            }
        }

        return tempMeal;
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
    async function saveMealList(updatedMealList: IMeal[]) { 
        try {
            await AsyncStorage.setItem('@meallist', JSON.stringify(updatedMealList))
        }
        catch {
            console.error("Error 2", "Save failure in MealBuilder.tsx")
        }
    }

    // handle modal closure with or without meal saving 
    function closeModal(mode: number) {

        if (mode===1) {

            if (currentMeal["foods"].length > 0) {
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

        // save meal if user pressed 'Save'
        else if (mode===2) {

            if (currentMeal["foods"].length === 0) {
                Alert.alert("Error", "Meals must contain 1 or more foods")
                return
            }

            const newMeal = saveMealData()

            // if from PlanInfo, return there with the updated meal
            if (fromPlan) {
                //replaceMeal(newMeal)
                navigation.navigate({
                    name: 'PlanInfo',
                    params: {
                        meal: newMeal
                    },
                    merge: true
                })
                return
            }

            if (!mealList) {
                console.error("Error 3", "Meal list null while saving in Mealbuilder.tsx")
                return 
            }

            if (inEditMode) {
                const updatedMealList = mealList.map((meal: IMeal) => {
                    if (meal["id"] === currentMeal["id"]) {
                        return newMeal
                    }
                    return meal
                })
                saveMealList(updatedMealList)
                setMealList(updatedMealList)
            }

            else  {
                const updatedMealList = [
                    ...mealList,
                    newMeal
                ]
                saveMealList(updatedMealList)
                setMealList(updatedMealList)
            }

            //close modal
            navigation.goBack()
        }  

        // if we're updating an existing meal
        else if (mode===3) {
            const updatedMeal = saveMealData();

            const updatedMealList = mealList!.map((meal: any) => {
                if (meal["id"] === updatedMeal["id"]) {
                    return updatedMeal
                }
                else return meal
            })
            saveMealList(updatedMealList)
            setMealList(updatedMealList)

            //close modal
            navigation.goBack()
        }
    }

    function removeFood(id: any) {
        Alert.alert(
            'Remove',
            'Remove from meal?',[
                { text: 'Cancel', onPress: () => {}, style: 'cancel'},
                { text: 'Yes', onPress: () => { 
                    setCurrentMeal({
                        ...currentMeal,
                        foods: currentMeal["foods"].filter((item:any) => item["id"] !== id)
                    });
                }},
            ],
            { cancelable: false }
        );
    }

    
    function newMealName(newName: any) {

        // only change name if String passed in
        if (typeof newName==="string") {
            // don't allow blank name
            if (newName==="") return
            setCurrentMeal({
                ...currentMeal,
                name: newName
            })
            setIsNameEditing(false)
        }
    }

    function isInMeal(id: any) {
        for (const food of currentMeal["foods"]) {
            if (food["id"] === id)  {
                return(true)
            }
        }
        return(false)
    }

    function foodQuantity(id: any) {
        for (const food of currentMeal["foods"]) {
            if (food["id"] === id)  return((food["multiplier"] * food["quantity"]).toFixed(1))
        }
    }

    return (
        <CurrentMealContext.Provider  value={{currentMeal, setCurrentMeal}}>
        <ButtonsContext.Provider value={{hideButtons,setHideButtons}}>

        <View style={viewStyles.modal}>
            <View style={viewStyles.overall}>
                { (page !== 3) &&
                <View style={viewStyles.textInput}>
                { (isNameEditing) ?
                    <View style={viewStyles.mealNameView}>
                        <TextInput
                            ref={ref}
                            style={textStyles.mealNameTextInput}
                            placeholder={currentMeal["name"]}
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
                    <View style={viewStyles.mealNameView}>
                        <Text numberOfLines={1} style={textStyles.mealName}>{currentMeal["name"]}</Text>
                        <Button children="Edit Name" textColor="#282728" onPress={editName} labelStyle={textStyles.editButton} style={buttonStyles.nameEditButton}></Button>
                    </View>
                }
                </View>
                }
                { (page === 1) &&
                // page 1 encompasses Meal Name selection and Quicklist
                <View style={viewStyles.inputScroll}>
                { (currentMeal["foods"].length > 0)
                    ?
                    <ScrollView style={viewStyles.scroll}>
                        <View style={viewStyles.exampleBanner}>
                            <Text style={textStyles.exampleBanner}>Current Meal</Text>
                        </View> 
                        { (currentMeal["foods"].length > 0) &&
                            currentMeal["foods"].map((food: IFood, i: number) => {
                                return (
                                    <FoodCard key={i} id={food["id"]} brand={food.brand} nutrients={food.nutrition} callback={removeFood}
                                        name={food["name"]} quantity={food["quantity"]} unit={food["unit"]} multiplier={food["multiplier"]} mode={4}> 
                                    </FoodCard>
                                )
                            })
                        }
                    </ScrollView>
                    :
                    <View style={viewStyles.noFoodsBannerView}>
                        <Text style={textStyles.noFoodsBannerText}>Nothing saved in meal</Text>
                    </View>
                }
                </View>
                }
                { (page === 2) &&
                // page 1 encompasses Meal Name selection and Quicklist
                <View style={viewStyles.inputScroll}>
                    { (quicklist.length > 0) 
                        // show separate message if Quicklist is empty
                        ?
                        <ScrollView style={viewStyles.scroll}>
                            <View style={viewStyles.exampleBanner}>
                                <Text style={textStyles.exampleBanner}>My Quicklist</Text>
                            </View> 
                            {
                                quicklist.map((food: IFood, i: number) => {
                                    const inMeal = isInMeal(food.id)
                                    const servingSize = inMeal ? foodQuantity(food.id) : food.servingSize
                                    return (
                                        <FoodCard key={i} arrayIndex={i} id={food.id} name={food.name} brand={food.brand} pressed={inMeal}
                                            nutrients={food.nutrition} servingSize={servingSize} unit={food.unit} callback={editMeal} mode={1}>
                                        </FoodCard>
                                    )
                                })
                            }
                        </ScrollView>
                        :
                        <View style={viewStyles.emptyQuicklist}>
                            <Text style={textStyles.bodyText}>Add items to your Quicklist in Search</Text>
                            <Button children="Search" style={buttonStyles.singleButton} textColor="#2774AE" labelStyle={textStyles.buttons} onPress={()=>{
                                        navigation.reset({
                                            index: 0,
                                            routes: [{ name: 'Search' }],
                                        });
                                    }}
                            ></Button>
                        </View>
                    }

                </View>
                }
                { (page === 3) &&
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
                        <Button disabled={hideButtons || page === 3} children="Next" textColor="#2774AE" labelStyle={textStyles.buttons} style={buttonStyles.twinButtons} onPress={() => setPage(page + 1)}></Button>
                    </View>
                    <View style={buttonStyles.closeButtonsView}>
                        <View style={buttonStyles.closeSaveButtons}>
                            <Button disabled={hideButtons} children="Close" textColor="#c5050c" labelStyle={textStyles.buttons} style={buttonStyles.twinButtons} onPress={()=> closeModal(1)}></Button>
                            <Button disabled={hideButtons} children="Save Meal" textColor="#22a811" labelStyle={textStyles.buttons} style={buttonStyles.twinButtons} onPress={()=> closeModal(2)}></Button>
                        </View>
                    </View>
                </View>
                
            </View>
        </View>     

        </ButtonsContext.Provider>
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
    mealNameView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    noFoodsBannerView: {
        height: '100%',
        backgroundColor:'white',
        justifyContent: 'center',
        alignItems: 'center'
    },
})

const textStyles = StyleSheet.create({
    buttons: {
        fontSize: 20,
        fontWeight: '300'
    },
    editButton: {
        fontSize: 12
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
    noFoodsBannerText: {
        fontSize: 17,
        fontWeight: '300'
    },
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
    changeSearchButtonView: {
        height: '40%',
        width: '100%',
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
    },
    pageButtonsView: {
        height: '40%',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f7f7f7'
    },
    
})