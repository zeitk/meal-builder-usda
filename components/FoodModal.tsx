import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useContext } from 'react'

import { useEffect, useState } from "react";
import { Alert, SafeAreaView } from 'react-native';
import { StyleSheet, Text, View } from "react-native";
import { Button, Modal, Portal } from "react-native-paper";
import QuicklistContext from '../context/QuicklistContext';
import { IFood } from '../interfaces/Interfaces';
import NutritionTable from "./Tables/NutritionTable";
import ServingSizeTable from "./Tables/ServingSizeTable";
import HeadersContext from '../context/DataHeaders';
import FoodCardHead from './FoodCardHead';
import Pie from './Tables/PieChart';
import Bar from './Tables/BarChart';

export default function FoodModal(props: any) {

    // states
    const [page, setPage] = useState<number>(1);
    const [maxPage, setMaxPage] = useState<number>(3)
    const [quicklist, setQuicklist] = useContext(QuicklistContext);
    const [multiplier, setMultiplier] = useState<number>(1);
    const [isInQuicklist, setIsInQuicklist] = useState<Boolean>(false);
    const [macros, setMacros] = useState<any>({});
    const [micros, setMicros] = useState<any>({});
    const [other, setOther] = useState<any>({});
    const [headers, setHeaders] = useState<string[]>([]);
    const headersMap = useContext(HeadersContext)

    // re-render when new food is selected
    useEffect(() => {
        isFoodInQuicklist(props.id);
        setPage(1);
        (props.context==="MealInfo") ? setMultiplier(props.multiplier):setMultiplier(1);
        sortNutrients()
        getHeaders();
    }, [props.nutrition, props.multiplier])

    // callback to hide modal
    function toggleModal() {
        props.toggle();
    }

    function nextPage() {
        if (page < maxPage) setPage(page + 1)
    }

    function prevPage() {
        if (page > 1) setPage(page - 1)
    }

    function getHeaders() {
        let paramHeaders:string[] = [];
        for (let header of headersMap.keys()) {
            paramHeaders.push(header);
        }
        setHeaders(paramHeaders)
    }

    function sortNutrients() {

        const nutrients = props.nutrition

        // check for undefined or empty object
        if (nutrients===undefined || Object.keys(nutrients).length === 0) return

        let core:any[] = [];
        let trace:any[] = [];
        let other:any[] = [];

        for (let nutrient of nutrients) {
            if (nutrient.nutrientNumber < 300 || nutrient.nutrientName.includes("Fatty") || nutrient.nutrientName.includes("Energy")) core.push(nutrient)
            else if (nutrient.nutrientNumber < 605) trace.push(nutrient)
            else other.push(nutrient);
        }

        // sort by id of macronutrient
        core.sort((a: any, b: any) => {
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
        trace.sort((a: any, b: any) => {
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
        
        let max = 1;
        if (trace.length > 0) max++;
        if (other.length > 0) max++;

        setMaxPage(max + 2);
        setMacros(core);
        setMicros(trace)
        setOther(other);
    }
    
    function isFoodInQuicklist(foodId: number) {
        let found = false;
        quicklist.forEach((food: any) => {
            if (food["id"]===foodId) {
                setIsInQuicklist(true)
                found = true;
                return
            }
        })
        if (!found) setIsInQuicklist(false);
    }

    async function saveQuicklist(updatedQuicklist: IFood[]) {
        try {
            await AsyncStorage.setItem('@quicklist', JSON.stringify(updatedQuicklist))
        }
        catch(e) {
            console.error("Error 7", "Save error in FoodModal.tsx")
        }
    }

    // add this item to the quicklist
    function addToQuicklist() {
        
        if (Object.keys(props.nutrition).length === 0) return

        // deep copy current food to prevent pointer issues
        let foodObject = JSON.parse(JSON.stringify(props))
        foodObject["servingSize"] = props.servingSize;
        foodObject["unit"] = props.unit;
        foodObject["brand"] = props.brand;
        foodObject["foodCategory"] = props.category;

        // sort and don't store the same item twice
        let dontSave: boolean = false;
        let index: number = -1;
        quicklist.forEach((foodItem: IFood, i: number) => {
            if (foodItem["id"]===foodObject["id"])  {
                dontSave = true
                return
            }

            if (foodItem["foodCategory"]===foodObject["foodCategory"]) index = i
        });

        if (dontSave) return

        // either categorize the item or add it at the end
        const updatedQuicklist = (index !== -1) ? quicklist.toSpliced(index, 0, foodObject) : [...quicklist, foodObject]

        setQuicklist(updatedQuicklist)
        saveQuicklist(updatedQuicklist)
        setIsInQuicklist(true);

        Alert.alert("Added", displayString()+" has been added to your Quicklist")
    }

    function removeFromQuicklist() {
        const updatedQuicklist = quicklist.filter((food: any) => food["id"] !== props.id)
        setQuicklist(updatedQuicklist)
        saveQuicklist(updatedQuicklist)

        // in Search the buttons should switch, in Quicklist the modal should close
        if (props.context==="Search") {
            Alert.alert("Removed", displayString()+" has been removed from your Quicklist")
            setIsInQuicklist(false)
        }
        if (props.context==="Quicklist") toggleModal()
    }

    function removeFromCart() {   
        props.removeFromMeal(props)
        const loc = props.context === "MealBuilder" ? "meal" : "plan"
        Alert.alert("Removed", displayString()+" has been removed from the current "+loc)
    }

    function addToCart() {
        props.editMealFoods(multiplier, props);
        const loc = props.context === "MealBuilder" ? "meal" : "plan"
        Alert.alert("Added", displayString()+" has been added to the current "+loc)
    }

    function displayString() {
        const display: string = (props.brand === "Unbranded") ? props.name : props.brand + " " + props.name
        return capitalize(display);
    }

    function capitalize(input: string) {
        let editedString = input.toLowerCase();
        const stringLength = input.length;
        editedString = editedString.slice(0,1).toUpperCase() + editedString.slice(1,stringLength);

        for (let i=1; i < editedString.length; i++) {
             if (editedString[i-1]===' ') editedString=editedString.slice(0,i)+editedString.slice(i,i+1).toUpperCase()+editedString.slice(i+1,stringLength)
        }
        
        return(editedString)
    }

    // set new serving size
    function newMultiplier(multiplier: number) {

        setMultiplier(multiplier);

        // MealInfo needs to send to callback function to update the meal, otherwise only update locally
        if (props.context==="MealInfo") {
            props.editMealFoods(multiplier)
        }
    }

    return (
        <SafeAreaView>
        <Portal>
            <Modal visible={props.modalVisible} style={styles.modal} onDismiss={toggleModal}>
                <View style={styles.containerView}>
                    <View style={styles.upperView}>
                        <View style={styles.headerView}>
                            <FoodCardHead name={props.name} brand={props.brand}></FoodCardHead>
                        </View>
                        <View style={styles.servingSizeView}>
                            <ServingSizeTable headers={headers} baseServing={props.servingSize} unit={props.unit} 
                                newMultiplier={newMultiplier} multiplier={multiplier}>
                            </ServingSizeTable>
                        </View>
                    </View>

                    {
                        (page === 1) &&
                        (
                            <View style={styles.nutritionView}>
                                <NutritionTable headers={headers} nutrition={macros} multiplier={multiplier} type={"macros"}></NutritionTable>
                            </View>
                        ) 
                    }
                    {
                        (page === 2) &&
                        (
                            <View style={styles.pieChartView}>
                                <Bar nutrition={macros} multiplier={multiplier} context={"food"}></Bar>
                            </View>

                        )
                    }
                    { 
                        (page === 3) &&
                        (
                            <View style={styles.pieChartView}>
                                <Pie nutrition={macros} multiplier={multiplier} context={"food"}></Pie>
                            </View>

                        )
                    }
                    {
                        (page === 4 && micros.length > 0) &&
                        (
                            <View style={styles.nutritionView}>
                                <NutritionTable headers={headers} nutrition={micros} multiplier={multiplier}></NutritionTable>
                            </View>
                        )
                    }
                    {
                        (page === 5 && other.length > 0) &&
                        (
                            <View style={styles.nutritionView}>
                                <NutritionTable headers={headers} nutrition={other} multiplier={multiplier}></NutritionTable>
                            </View>                     
                        )
                    }

                    <View style={styles.pageButtonsView}>
                        <Button textColor="#2774AE" children="Prev" onPress={prevPage} disabled={page===1} style={styles.pageButtons} labelStyle={styles.pageButtonText}></Button>
                        <View style={styles.pageText}>
                            <Text style={styles.text}>{page} of {maxPage}</Text>
                        </View>
                        <Button textColor="#2774AE" children="Next" onPress={nextPage} disabled={page===maxPage} style={styles.pageButtons}  labelStyle={styles.pageButtonText}></Button>
                    </View>

                    <View style={styles.bottomButtonsView}>
                        <View style={styles.multipurposeButton}>
                        { (props.context==="Search" && isInQuicklist) &&
                            <Button textColor="#c5050c" children="Remove from Quicklist" onPress={removeFromQuicklist} labelStyle={styles.buttonText}></Button>
                        }
                        { (props.context==="Search" && !isInQuicklist) &&
                            <Button textColor="#2774AE" children="Add to Quicklist" onPress={addToQuicklist} labelStyle={styles.buttonText} disabled={Object.keys(props.nutrition).length === 0}></Button>
                        }
                        { (props.context==="MealInfo") &&
                            <Button textColor="#c5050c" children="Remove from Meal" onPress={removeFromCart} labelStyle={styles.buttonText}></Button>
                        }
                        { (props.context==="Quicklist") &&
                            <Button textColor="#c5050c" children="Remove from Quicklist" onPress={removeFromQuicklist} labelStyle={styles.buttonText}></Button>
                        } 
                        { (props.context==="MealBuilder" && !props.isInMeal) &&
                            <Button textColor="#2774AE" children="Add to Meal" onPress={addToCart} labelStyle={styles.buttonText} disabled={Object.keys(props.nutrition).length === 0}></Button>
                        } 
                        { (props.context==="MealBuilder" && props.isInMeal) &&
                            <Button textColor="#c5050c" children="Remove from Meal" onPress={removeFromCart} labelStyle={styles.buttonText}></Button>
                        }      
                        { (props.context==="PlanBuilder" && !props.isInPlan) &&
                            <Button textColor="#2774AE" children="Add to Plan" onPress={addToCart} labelStyle={styles.buttonText} disabled={Object.keys(props.nutrition).length === 0}></Button>
                        } 
                        { (props.context==="PlanBuilder" && props.isInPlan) &&
                            <Button textColor="#c5050c" children="Remove from Plan" onPress={removeFromCart} labelStyle={styles.buttonText}></Button>
                        }              
                        </View>
                        <View style={styles.closeButton}>
                            <Button textColor='#c5050c'  children="Close" onPress={toggleModal} labelStyle={styles.buttonText}></Button>
                        </View>
                    </View>
                </View>
            </Modal>      
        </Portal>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({

    // view styles
    modal: {
        margin: '3%',
        height: '90%',
    },
    containerView: {
        alignItems: 'center',
        height: '100%',
        paddingHorizontal: 10,
        paddingBottom: 10,
        backgroundColor: '#f7f7f7',
        borderColor: '#282728',
        borderWidth: 2,
        borderRadius: 15
    },
    upperView: {
        height: '20%',
        width: '100%',
        alignItems: 'center'
    },
    headerView: {
        height: '60%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    servingSizeView: {
        height: '40%',
        width: '100%',
        alignItems: 'center'
    },
    nutritionView: {
        height: '65%',
        width: '100%',
        overflow: 'hidden'
    },
    pieChartView: {
        height: '65%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    caloricBreakdownView: {
        height: '20%',
        width: '100%',
    },
    propertiesView: {
        height: '52.5%',
        width: '100%',
        alignItems: 'flex-start'
    },
    costView: {
        height: '20%',
        width: '100%',
    },
    flavonoidsView: {
        height: '92.5%',
        width: '100%',
        overflow: 'hidden'
    },
    pageButtonsView: {
        height: '9%',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#dadfe1',
    },
    bottomButtonsView: {
        height: '11%',
        flexDirection: 'row',
    },
    closeButton: {
        width: '40%',
    },
    multipurposeButton: {
        width: '60%'
    },

    // text styles
    buttonText: {
        fontSize: 16
    }, 
    pageButtonText: {
        fontSize: 16
    },   
    header: {
        textTransform: 'capitalize',
        fontWeight: '300',
        fontSize: 24
    },
    headerSub: {
        textTransform: 'capitalize',
        fontSize: 20,
        fontWeight: '300',
    },
    text: {
        lineHeight: 38
    },
    pageText: {
        width: 40,
        marginHorizontal: 7.5
    },

    // button styles
    pageButtons: {
        width: 125
    }
})