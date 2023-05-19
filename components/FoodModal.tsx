import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useContext } from 'react'
import { useEffect, useState } from "react";
import { Alert, SafeAreaView } from 'react-native';
import { StyleSheet, Text, View } from "react-native";
import { Button, Modal, Portal } from "react-native-paper";
import QuicklistContext from '../context/QuicklistContext';
import { IFood } from '../interfaces/Interfaces';
import MealServingInput from './Meals/MealServingInput';
import CaloricBreakdownTable from "./Tables/CaloricBreakdownTable";
import CostTable from "./Tables/CostTable";
import FlavonoidsTable from "./Tables/FlavonoidsTable";
import NutritionTable from "./Tables/NutritionTable";
import PropertiesTable from "./Tables/PropertiesTable";
import ServingSizeTable from "./Tables/ServingSizeTable";


export default function FoodModal(props: any) {

    // states
    const [page, setPage] = useState<number>(1);
    const [quicklist, setQuicklist] = useContext(QuicklistContext);
    const [multiplier, setMultiplier] = useState<number>(1);
    const [isInQuicklist, setIsInQuicklist] = useState<Boolean>(false);

    // re-render when new food is selected
    useEffect(() => {
        isFoodInQuicklist(props.id);
        setPage(1);
        (props.context==="MealInfo") ? setMultiplier(props.servings["multiplier"]):setMultiplier(1);
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
        let foodObject = JSON.parse(JSON.stringify(props.nutrition))
        foodObject["cost"] = props.cost;
        foodObject["name"] = props.name;
        foodObject["image"] = props.image
        foodObject["id"] = props.id;

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
                    {
                        (page === 1) &&
                        (
                            <View style={styles.upperView}>
                                <View style={styles.headerView}>
                                    <Text style={styles.header}>{props.name}</Text>
                                </View>
                                <View style={styles.servingSizeView}>
                                    { (props.context==="Home") ?
                                        <MealServingInput newServingQuantity={newMultiplier} multiplier={100} context="Home"></MealServingInput>
                                        :
                                        <ServingSizeTable servingSizeProps={100} newMultiplier={newMultiplier} multiplier={multiplier}></ServingSizeTable>
                                    }
                                    
                                </View>
                                <View style={styles.nutritionView}>
                                    <NutritionTable nutrition={props.nutrition} multiplier={multiplier}></NutritionTable>
                                </View>
                            </View>
                        ) 
                    }
                    {/* {
                        (page == 2) &&
                        (
                            <View style={styles.upperView}>
                                <View style={styles.headerView}>
                                    <Text style={styles.header}>{props.name}</Text>
                                </View>
                                <View style={styles.costView}>
                                    <CostTable cost={props.cost} multiplier={multiplier}></CostTable>
                                </View>
                                <View style={styles.caloricBreakdownView}>
                                    <CaloricBreakdownTable caloricBreakdownProps={props.nutrition["caloricBreakdown"]}></CaloricBreakdownTable>
                                </View>
                                <View style={styles.propertiesView}>
                                    <PropertiesTable propertiesProps={props.nutrition["properties"]}></PropertiesTable>
                                </View>
                            </View>
                            
                        )
                    }
                    {
                        (page == 3) &&
                        (
                            <View style={styles.upperView}>
                                <View style={styles.headerView}>
                                    <Text style={styles.header}>{props.name}</Text>
                                </View>
                                <View style={styles.flavonoidsView}>
                                    <FlavonoidsTable flavonoidsProps={props.nutrition["flavonoids"]} multiplier={multiplier}></FlavonoidsTable>
                                </View>
                            </View>
                           
                        )
                    } */}

                    { (props.context !== "Home") 
                        ?
                        <View style={styles.pageButtonsView}>
                            <Button textColor="#2774AE" children="Prev" onPress={prevPage} disabled={page===1} labelStyle={styles.pageButtonText}></Button>
                            <View style={styles.pageText}>
                                <Text style={styles.text}>{page} of 3</Text>
                            </View>
                            <Button textColor="#2774AE" children="Next" onPress={nextPage} disabled={page===3} labelStyle={styles.pageButtonText}></Button>
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
        height: '85%',
        width: '100%',
        alignItems: 'center'
    },
    headerView: {
        height: '7.5%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    servingSizeView: {
        height: '15%',
        width: '100%',
        alignItems: 'center'
    },
    nutritionView: {
        height: '77.5%',
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
        fontSize: 24
    },
    text: {
        lineHeight: 38
    },
    pageText: {
        width: 40
    }
})