import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useContext } from 'react'
import { useEffect, useState } from "react";
import { Alert, SafeAreaView } from 'react-native';
import { StyleSheet, Text, View } from "react-native";
import { Button, Modal, Portal } from "react-native-paper";
import QuicklistContext from '../context/QuicklistContext';
import { IFood } from '../interfaces/Interfaces';
import MealServingInput from './Meals/MealServingInput';
import NutritionTable from "./Tables/NutritionTable";
import ServingSizeTable from "./Tables/ServingSizeTable";

const headerMap: Map<string, string> = new Map<string, string>([
    ["Name", "nutrientName"],
    ["Amount", "value"],
    ["Unit","unitName"]
]);

let paramHeaders:string[] = [];
for (let header of headerMap.keys()) {
    paramHeaders.push(header);
}

export default function FoodModal(props: any) {

    // states
    const [page, setPage] = useState<number>(1);
    const [maxPage, setMaxPage] = useState<number>(3);
    const [quicklist, setQuicklist] = useContext(QuicklistContext);
    const [multiplier, setMultiplier] = useState<number>(1);
    const [isInQuicklist, setIsInQuicklist] = useState<Boolean>(false);
    const [macros, setMacros] = useState<any>({});
    const [micros, setMicros] = useState<any>({});
    const [other, setOther] = useState<any>({});

    // re-render when new food is selected
    useEffect(() => {
        isFoodInQuicklist(props.id);
        setPage(1);
        (props.context==="MealInfo") ? setMultiplier(props.servings["multiplier"]):setMultiplier(1);
        sortNutrients()
    }, [props])

    // callback to hide modal
    function toggleModal() {
        props.toggle();
    }

    function nextPage() {
        if (page < 3) setPage(page + 1)
    }

    function prevPage() {
        if (page > 1) setPage(page - 1)
    }

    function sortNutrients() {

        let nutrients = props.nutrition

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

        setMaxPage(max);
        setMacros(core);
        setMicros(trace)
        setOther(other);
    }

    function nameMain() {
        let name = props.name;
        if (name === undefined) return
        return (name.split(","))[0]
    }

    function nameSub() {
        let name = props.name;
        if (name === undefined) return;
        let index = name.search(",")
        let sub = name.slice(index + 2)
        if (sub === "") return;
        sub = sub[0].toUpperCase() + sub.slice(1)
        return sub;
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

        // don't store the same item twice
        quicklist.forEach((foodItem: any) => {
            if (foodItem["id"]===foodObject["id"])  {
                return
            }
        });
        
        const updatedQuicklist = [
            ...quicklist,
            foodObject
        ]
        setQuicklist(updatedQuicklist)
        saveQuicklist(updatedQuicklist)
        setIsInQuicklist(true);

        Alert.alert("Added", capitalize(props.name)+" has been added to your Quicklist")
    }

    function removeFromQuicklist() {
        const updatedQuicklist = quicklist.filter((food: any) => food["id"] !== props.id)
        setQuicklist(updatedQuicklist)
        saveQuicklist(updatedQuicklist)

        // in Search the buttons should switch, in Quicklist the modal should close
        if (props.context==="Search") {
            Alert.alert("Removed", capitalize(props.name)+" has been removed from your Quicklist")
            setIsInQuicklist(false)
        }
        if (props.context==="Quicklist") toggleModal()
    }

    function removeFromMeal() {   
        Alert.alert("Removed", capitalize(props.name)+" has been removed from the current meal")
        props.editMealFoods(-1)
    }

    function addToMeal() {
        props.editMealFoods(multiplier);
        Alert.alert("Added", capitalize(props.name)+" has been added to the current meal")
    }

    function capitalize(input: string) {
        let editedString = input;
        const stringLength = input.length;
        editedString=editedString.slice(0,1).toUpperCase()+editedString.slice(1,stringLength);

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
                            <Text numberOfLines={1} style={styles.header}>{nameMain()}</Text>
                            <Text numberOfLines={1} style={styles.headerSub}>{nameSub()}</Text>
                        </View>
                        <View style={styles.servingSizeView}>
                            { (props.context==="Home") ?
                                <MealServingInput headers={paramHeaders} newServingQuantity={newMultiplier} multiplier={100} context="Home"></MealServingInput>
                                :
                                <ServingSizeTable headers={paramHeaders} baseServing={100} newMultiplier={newMultiplier} multiplier={multiplier}></ServingSizeTable>
                            }
                        </View>
                    </View>
                    {
                        (page === 1) &&
                        (
                            <View style={styles.nutritionView}>
                                <NutritionTable headers={paramHeaders} nutrition={macros} multiplier={multiplier} type={"macros"}></NutritionTable>
                            </View>
                        ) 
                    }
                    {
                        (page == 2 && micros.length > 0) &&
                        (
                            <View style={styles.nutritionView}>
                                <NutritionTable headers={paramHeaders} nutrition={micros} multiplier={multiplier}></NutritionTable>
                            </View>
                        )
                    }
                    {
                        (page == 3 && other.length > 0) &&
                        (
                            <View style={styles.nutritionView}>
                                <NutritionTable headers={paramHeaders} nutrition={other} multiplier={multiplier}></NutritionTable>
                            </View>                     
                        )
                    }

                    { (props.context !== "Home") 
                        ?
                        <View style={styles.pageButtonsView}>
                            <Button textColor="#2774AE" children="Prev" onPress={prevPage} disabled={page===1} labelStyle={styles.pageButtonText}></Button>
                            <View style={styles.pageText}>
                                <Text style={styles.text}>{page} of {maxPage}</Text>
                            </View>
                            <Button textColor="#2774AE" children="Next" onPress={nextPage} disabled={page===maxPage} labelStyle={styles.pageButtonText}></Button>
                        </View>
                        :
                        null
                    }

                    <View style={(props.context==="Home" ? styles.buttonsInHomeView:styles.bottomButtonsView)}>
                        <View style={styles.multipurposeButton}>
                        { (props.context==="Search" && isInQuicklist) &&
                            <Button textColor="#c5050c" children="Remove from Quicklist" onPress={removeFromQuicklist} labelStyle={styles.buttonText}></Button>
                        }
                        { (props.context==="Search" && !isInQuicklist) &&
                            <Button textColor="#2774AE" children="Add to Quicklist" onPress={addToQuicklist} labelStyle={styles.buttonText} disabled={Object.keys(props.nutrition).length === 0}></Button>
                        }
                        { (props.context==="MealInfo") &&
                            <Button textColor="#c5050c" children="Remove from Meal" onPress={removeFromMeal} labelStyle={styles.buttonText}></Button>
                        }
                        { (props.context==="Quicklist") &&
                            <Button textColor="#c5050c" children="Remove from Quicklist" onPress={removeFromQuicklist} labelStyle={styles.buttonText}></Button>
                        } 
                        { (props.context==="MealBuilder" && !props.isInMeal) &&
                            <Button textColor="#2774AE" children="Add to Meal" onPress={addToMeal} labelStyle={styles.buttonText} disabled={Object.keys(props.nutrition).length === 0}></Button>
                        } 
                        { (props.context==="MealBuilder" && props.isInMeal) &&
                            <Button textColor="#c5050c" children="Remove from Meal" onPress={removeFromMeal} labelStyle={styles.buttonText}></Button>
                        }      
                        { (props.context==="Home") &&
                            <Button textColor="#2774AE" children="See more in Meals" onPress={props.goToMeals} labelStyle={styles.buttonText}></Button>
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
    buttonsInHomeView: {
        flexDirection: 'row',
        height: '20%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#dadfe1',
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
        width: 40
    }
})