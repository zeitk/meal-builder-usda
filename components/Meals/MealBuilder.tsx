import React, { useContext } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from "react";
import { Alert, ScrollView, TextInput } from 'react-native';
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import CurrentMealContext from '../../context/CurrentMeal';
import { useMealList }  from '../../context/MealList';
import QuicklistContext from '../../context/QuicklistContext';
import FoodCard from '../FoodCard';
import { IMeal } from '../../interfaces/Interfaces'
import SearchFromMeals from './SearchFromMeals';

export default function MealBuilder({ navigation, route }: any) {

    // states
    const [quicklist] = useContext(QuicklistContext);
    const [currentMeal, setCurrentMeal] = useState<IMeal>({ id: 0, name: "", foods: [], data: {}});
    const { mealList, setMealList } = useMealList();
    const [page, setPage] = useState<number>(1);
    const [hideButtons, setHideButtons] = useState<boolean>(false);
    const [inEditMode, setInEditMode] = useState<boolean>(false);
    
    useEffect(() =>{
        setPage(1);
        setHideButtons(false);

        if (route.params === undefined) newMeal();
        else existingMeal(route.params.meal);
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

    function existingMeal(meal: any) {
        // should never happen, sanity check
        if (meal===undefined) navigation.goBack();
        // load in current meal, and place in search mode
        setCurrentMeal({
            id: meal["id"],
            name: meal["name"],
            foods: meal["foods"],
            data: meal["data"]
        })
        setInEditMode(true);
        setPage(2);
    }

    function changePage() {
        (page===1) ? setPage(2):setPage(1)
    }

    function editMeal(mode: number, index: number, quantity: any) {
        
        // deep copy to prevent editing other meals
        const selectedFood = JSON.parse(JSON.stringify(quicklist[index]))

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
            selectedFood["quantity"]=selectedFood["weightPerServing"]["amount"]
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
                    const multiplier = quantity/selectedFood["weightPerServing"]["amount"]

                    foodItem["multiplier"]=multiplier;
                    foodItem["quantity"]=quantity
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

        let overallNutrients: any = {}, overallCost: any = {}, overallFlavonoids: any = {}
        let currentFoodNutrients, currentFoodCost;

        let multiplier: number;
        let amount: number;
        let percentOfDailyNeeds: number;
        let tempPercentOfDailyNeeds: number;
        let flavonoid: any;

        foods.forEach((foodItem: any, i: number) => {

            multiplier = foodItem["multiplier"]
            if (i == 0) {

                // use the first foods data as a template
                foodItem["nutrients"].forEach((nutrient: any) => {
                    overallNutrients[nutrient["name"]] = {
                        name: nutrient["name"],
                        amount: Number((nutrient["amount"]*multiplier).toFixed(2)),
                        percentOfDailyNeeds: Number((nutrient["percentOfDailyNeeds"]*multiplier).toFixed(2)),
                        unit: nutrient["unit"]
                    }
                })

                foodItem["flavonoids"].forEach((flavonoid: any) => {

                    tempPercentOfDailyNeeds = flavonoid["percentOfDailyNeeds"]*multiplier;
                    if (isNaN(percentOfDailyNeeds)) tempPercentOfDailyNeeds=0;

                    overallFlavonoids[flavonoid["name"]] = {
                        name: flavonoid["name"],
                        amount: flavonoid["amount"]*multiplier,
                        percentOfDailyNeeds: tempPercentOfDailyNeeds,
                        unit: flavonoid["unit"]
                    }
                })

                overallCost = JSON.parse(JSON.stringify(foodItem["cost"]))
            }

            else {

                currentFoodNutrients = foodItem["nutrients"];
                currentFoodCost = foodItem["cost"];

                // sum up cost
                if (overallCost["unit"]===currentFoodCost["unit"]) overallCost["value"] += Number((currentFoodCost["value"]*multiplier).toFixed(2))

                // remove this later
                else {
                    console.error("Mismatching cost units")
                }

                // sum up nutrients
                currentFoodNutrients.map((nutrient: any) => {

                    if (overallNutrients[nutrient["name"]]===undefined) {
                        overallNutrients[nutrient["name"]] = {
                            name: nutrient["name"],
                            amount: Number((nutrient["amount"]*multiplier).toFixed(2)),
                            percentOfDailyNeeds: Number((nutrient["percentOfDailyNeeds"]*multiplier).toFixed(2)),
                            unit: nutrient["unit"]
                        }
                    }
                    else {
                        amount = overallNutrients[nutrient["name"]]["amount"] +  Number((nutrient["amount"]*multiplier).toFixed(2))
                        percentOfDailyNeeds = overallNutrients[nutrient["name"]]["percentOfDailyNeeds"] + Number((nutrient["percentOfDailyNeeds"]*multiplier).toFixed(2))
                        overallNutrients[nutrient["name"]] = {
                            ...overallNutrients[nutrient["name"]],
                            amount: amount,
                            percentOfDailyNeeds: percentOfDailyNeeds 
                        }
                    }
                })
                
                // sum up flavonoids
                for (let index in overallFlavonoids) {

                    flavonoid = overallFlavonoids[index]

                    tempPercentOfDailyNeeds = flavonoid["percentOfDailyNeeds"]*multiplier;
                    if (isNaN(percentOfDailyNeeds)) tempPercentOfDailyNeeds=0;

                    if (overallFlavonoids[flavonoid["name"]]===undefined) {
                        overallFlavonoids[flavonoid["name"]] = {
                            name: flavonoid["name"],
                            amount: flavonoid["amount"]*multiplier,
                            percentOfDailyNeeds: tempPercentOfDailyNeeds,
                            unit: flavonoid["unit"]
                        }
                    }
                    else {
                        amount = overallFlavonoids[flavonoid["name"]]["amount"]
                        percentOfDailyNeeds = overallFlavonoids[flavonoid["name"]]["percentOfDailyNeeds"]
                        overallFlavonoids[flavonoid["name"]] = {
                            ...overallFlavonoids[flavonoid["name"]],
                            amount: amount + flavonoid["amount"]*multiplier,
                            percentOfDailyNeeds: percentOfDailyNeeds + tempPercentOfDailyNeeds
                        }
                    }
                }


            }
        })

        // convert to arrays so tables can parse data
        const overallNutrientsArray = Object.values(overallNutrients)
        const overallFlavonoidsArray = Object.values(overallFlavonoids)

        // return a modified meal with the new data to store in the meal list
        const tempMeal = {
            ...currentMeal,
            data: {
                nutrients: overallNutrientsArray,
                cost: overallCost,
                flavonoids: overallFlavonoidsArray
            }
        }

        return tempMeal;
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
            if (!mealList) {
                console.error("Error 3", "Meal list null while saving in Mealbuilder.tsx")
                return 
            }
            const updatedMealList = [
                ...mealList,
                newMeal
            ]
            saveMealList(updatedMealList)
            setMealList(updatedMealList)
            
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
    
    function newMealName(newName: any) {

        // only change name if String passed in
        if (typeof newName==="string") {
            // don't allow blank name
            if (newName==="") return

            setCurrentMeal({
                ...currentMeal,
                name: newName
            })
        }
    }

    function toggleButtons() {
        if (hideButtons) setHideButtons(false);
        else setHideButtons(true)
    }

    return (
        <CurrentMealContext.Provider  value={{currentMeal, setCurrentMeal}}>
        <View style={viewStyles.modal}>
            <View style={viewStyles.overall}>
                { (page===1) 
                ?
                // page 1 encompasses Meal Name selection and Quicklist
                <View style={viewStyles.inputScroll}>
                    <View style={viewStyles.textInput}>
                        <TextInput 
                                selectionColor="#f7f7f7" 
                                placeholderTextColor="#adadad"
                                style={textStyles.textInput} 
                                returnKeyType="done"  
                                placeholder={"New Meal"}
                                textAlign="center"
                                onEndEditing={(value) => newMealName(value.nativeEvent.text) }
                                onSubmitEditing={(value) => newMealName(value.nativeEvent.text) }>
                        </TextInput>
                    </View>
                    { (quicklist.length > 0) 
                        // show separate message if Quicklist is empty
                        ?
                        <ScrollView style={viewStyles.scroll}>
                            <View style={viewStyles.exampleBanner}>
                                <Text style={textStyles.exampleBanner}>My Quicklist</Text>
                            </View> 
                            {
                                quicklist.map((food: any, i: number) => {
                                    return <FoodCard key={i} arrayIndex={i} id={food["id"]} image={food["image"]} name={food["name"]} callback={editMeal} mode={1}></FoodCard>
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
                :
                // page 2 is entirely composed of the Search feature
                <View style={inEditMode ? viewStyles.editScroll:viewStyles.inputScroll}>
                    <View style={viewStyles.overall}>
                        <SearchFromMeals toggleButtons={toggleButtons}></SearchFromMeals>
                    </View>
                </View>
                }
                {/* Buttons on the bottom of screen */}
                { (inEditMode) 
                    ?
                    <View style={buttonStyles.editBottomButtonsView}>
                        <View style={buttonStyles.closeSaveButtons}>
                            <Button disabled={hideButtons} children="Close" textColor="#c5050c" labelStyle={textStyles.buttons} style={buttonStyles.twinButtons} onPress={()=> closeModal(1)}></Button>
                            <Button disabled={hideButtons} children="Save Meal" textColor="#22a811" labelStyle={textStyles.buttons} style={buttonStyles.twinButtons} onPress={()=> closeModal(3)}></Button>
                        </View>
                    </View>
                    :
                    <View style={buttonStyles.bottomButtonsView}>
                        <View style={buttonStyles.changeSearchButtonView}>
                            <Button disabled={hideButtons} children={(page===1) ? "Search all foods":"Quicklist"} textColor="#2774AE" labelStyle={textStyles.buttons} style={buttonStyles.singleButton} onPress={changePage}></Button>
                        </View>
                        <View style={buttonStyles.closeButtonsView}>
                            <View style={buttonStyles.closeSaveButtons}>
                                <Button disabled={hideButtons} children="Close" textColor="#c5050c" labelStyle={textStyles.buttons} style={buttonStyles.twinButtons} onPress={()=> closeModal(1)}></Button>
                                <Button disabled={hideButtons} children="Save Meal" textColor="#22a811" labelStyle={textStyles.buttons} style={buttonStyles.twinButtons} onPress={()=> closeModal(2)}></Button>
                            </View>
                        </View>
                    </View>
                }
            </View>
        </View>     
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
        height: '90%',
    },
    editScroll: {
        height: '85%',
    },
    modal: {
        alignItems: 'center',
        backgroundColor: 'white',
    },
    inputScroll:{
        height: '82.5%'
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
        height: '10%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    exampleBanner: {
        padding: 12,
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
    }
    
})