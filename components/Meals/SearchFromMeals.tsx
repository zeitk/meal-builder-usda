import React, { useContext, useRef } from 'react'

import { useEffect, useState } from "react";
import {  View, StyleSheet, SafeAreaView, ScrollView, Text } from "react-native";
import { Portal } from "react-native-paper";

import FoodCard from "../FoodCard";
import FoodModal from "../FoodModal";
import CurrentMealContext from '../../context/CurrentMeal';
import { SearchBar } from '../SearchBar';
import { IFood } from '../../interfaces/Interfaces';
import { useCriteria } from '../../context/CriteriaContext';
import ButtonsContext from '../../context/ButtonsContext';
import CurrentPlanContext from '../../context/CurrentPlan';

export default function SearchFromMeals(props: any) {

    // search related states
    const [items, setItems] = useState<any>([]);
    const [lastSearch, setLastSearch]  = useState<string>("")
    const [totalItems, setTotalItems] = useState<number>(-1)
    const scrollRef = useRef<ScrollView | null>(null)
    const { searchCriteria } = useCriteria();

    // modal and table related states
    const [errorBanner, setErrorBanner] = useState<string>("")
    const [nutrition, setNutrition] = useState<any>({})
    const [modalVisible, setModalVisible] = useState<boolean>(false)
    const [currentId, setCurrentId] = useState<string>("")
    const [currentName, setCurrentName] = useState<string>("")
    const [currentUnit, setCurrentUnit] =  useState<string>("")
    const [currentServing, setCurrentServing] =  useState<number>(1)
    const [currentBrand, setCurrentBrand] = useState<string>("")
    const { hideButtons, setHideButtons } = useContext(ButtonsContext)

    // meal and plan related 
    const { currentMeal, setCurrentMeal} = useContext(CurrentMealContext)
    const { currentPlan, setCurrentPlan} = useContext(CurrentPlanContext)
    const [currentIsInMeal, setCurrentIsInMeal] = useState<boolean>(false)
    const [currentIsInPlan, setCurrentIsInPlan] = useState<boolean>(false)

    useEffect(() => {
        //reset total items
        setTotalItems(-1)

        // perform a search if we're returning from settings
        if (lastSearch !== "") beginSearch(lastSearch)
    },[props])

    function editMealFoods(multiplier: number, food: IFood) {
        
        // if we're in meal builder
        if (currentMeal!==null) {
            if (Object.keys(food.nutrition).length === 0 ) return

            // deep copy to prevent pointer issues
            let selectedFood = JSON.parse(JSON.stringify(food))

            if (multiplier > 0) {
                selectedFood["quantity"] =  selectedFood["servingSize"] 
                selectedFood["multiplier"] = multiplier;
                setCurrentMeal({
                    ...currentMeal,
                    foods: [
                    ...currentMeal["foods"],
                    selectedFood
                ]})
                setCurrentIsInMeal(true)
            }
        }

        // if we're in plan builder
        if (currentPlan!==null) {
            if (Object.keys(food.nutrition).length === 0 ) return

            // deep copy to prevent pointer issues
            let selectedFood = JSON.parse(JSON.stringify(food))

            if (multiplier > 0) {
                selectedFood["quantity"] =  selectedFood["servingSize"] 
                selectedFood["multiplier"] = multiplier;
                setCurrentPlan({
                    ...currentPlan,
                    foods: [
                    ...currentPlan["foods"],
                    selectedFood
                ]})
                setCurrentIsInPlan(true)
            }
        }
    }

    function removeFromMeal(food: IFood) {
        if (currentMeal !== null) {
            setCurrentMeal({
                ...currentMeal,
                foods: currentMeal["foods"].filter((item:any) => item["name"] !== food["name"])
            });
            setCurrentIsInMeal(false)
        }

        if (currentPlan !== null) {
            setCurrentPlan({
                ...currentPlan,
                foods: currentPlan["foods"].filter((item:any) => item["name"] !== food["name"])
            });
            setCurrentIsInPlan(false)
        }
    }

    // helper function searching foods
    const beginSearch = (input: string) => {
        // don't search if there's nothing to search for, or if we just pressed cancel
        if (input==="") return

        // get rid of example banner and begin search
        setErrorBanner("Loading...")
        searchItems(input)
    }

    // search for foods and update state
    const searchItems = ((input: any) => {

        const dataTypeString: string = searchCriteria?.dataType === "" ? 'Foundation,SR Legacy': searchCriteria!.dataType
        const pageSizeString: string = searchCriteria?.pageSize === "" ? '10': searchCriteria!.pageSize

        const params = {
            query: input,
            addChildre: 'true',
            dataType: dataTypeString,
            sortBy: 'dataType.keyword',
            sortDirection: 'asc',
            pageSize: pageSizeString,
            api_key: 'DNItjU0i2C3igYQ0on5Gg28ES7YKTcKhY6ldRNtM'
        };

        let url = "https://api.nal.usda.gov/fdc/v1/foods/search?";
        url += (new URLSearchParams(params)).toString()

        fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then((res) => {
                if (res.ok) {
                    // HTTP response was successful
                    return res.json();
                } 
                else {
                    // Handle non-successful response
                    setErrorBanner("Error " + (res.status).toString())
                }
            })
            .then(json => {
                setTotalItems(json.totalHits);
                if (json.totalHits === 0) {
                    setErrorBanner("Your search returned no items")
                    return
                }
                setLastSearch(input)
                sortItems(json.foods)
            })
        scrollRef.current?.scrollTo({
            y: 0,
            animated: false
        });
    })

    function sortItems(items: any) {
        // sort foods by category before storing
        items.sort((a: any, b: any) => {
            if (a["foodCategory"]===undefined || a["foodCategory"]===null) return b
            else if (b["foodCategory"]===undefined || b["foodCategory"]===null) return a
            else return sortHelper(a,b)
        })
        setItems(items)
    }

    function sortHelper(a: any, b: any) {
        if (a["foodCategory"]!=="Baby Foods" && b["foodCategory"]!=="Baby Foods") {
            return a["foodCategory"].localeCompare(b["foodCategory"])
        }
        else {
            if (a["foodCategory"]==="Baby Foods") return b
            else  return a
        }
    }

    function moreInfo(id: number, name: string, nutrients: any) {
        isCurrentInMeal(id.toString())
        setNutrition(nutrients)
        setCurrentId(id.toString())
        for (const item of items) {
            if (item["fdcId"] === id) {
                if (item["dataType"] === "Branded") {
                    setCurrentServing(item["servingSize"].toFixed(1))
                    setCurrentUnit(item["servingSizeUnit"])
                    setCurrentBrand(item["brandName"])
                }
                else {
                    setCurrentServing(100)
                    setCurrentUnit("g")
                    setCurrentBrand("Unbranded")
                }
            }
        };
        setCurrentName(name);
        setModalVisible(true); 
        setHideButtons(!hideButtons); 
    }

    function isCurrentInMeal(id: String) {
        if (currentMeal!==null) {
            let found: boolean = false;
            currentMeal["foods"].forEach((food: any) => {
                if (food["id"] === id)  {
                    setCurrentIsInMeal(true)
                    found = true;
                }
            })
            if (!found) setCurrentIsInMeal(false);
        }

        if (currentPlan!==null) {
            let found: boolean = false;
            currentPlan["foods"].forEach((food: any) => {
                if (food["id"] === id)  {
                    setCurrentIsInPlan(true)
                    found = true;
                }
            })
            if (!found) setCurrentIsInPlan(false);
        }
    }

    function toggleModal() {
        if (!modalVisible) {
            setModalVisible(true)
        }
        else {
            setModalVisible(false)
        }
        setHideButtons(!hideButtons);
    }

    return <>
        <SafeAreaView style={styles.safeView}>
            <SearchBar callback={beginSearch} placeholderTextColor={"#646569"} mode={"Meals"} navigation={props.navigation}></SearchBar>
            { (totalItems<1) &&
                <View style={styles.messageTextView}>
                    { (errorBanner!=="") ?
                        <Text style={styles.exampleBannerText}>{errorBanner}</Text>:
                        <Text style={styles.exampleBannerText}>Enter a search above</Text>
                    }
                </View>
            }
            <ScrollView ref={scrollRef} style={styles.scrollView}>
                {
                    items.map((item: IFood, i: number) => {

                        let brand = (item.dataType === "Branded") ? item.brandName : "Unbranded"
                        if (brand === undefined) brand = item.brandOwner

                        if (i === 0 || (i > 0 && items[i-1]["foodCategory"]!==items[i]["foodCategory"])) {
                            return(
                                <View key={i} >
                                    <View style={styles.exampleBanner}>
                                        <Text style={styles.foodCateogoryText}>{item["foodCategory"]}</Text>
                                    </View>
                                    <FoodCard id={item.fdcId} name={item.description} nutrients={item.foodNutrients} 
                                        brand={brand} callback={moreInfo} mode={0}>
                                    </FoodCard>
                                </View>
                            )
                        }
                        else return (
                            <FoodCard key={i} id={item.fdcId} name={item.description} nutrients={item.foodNutrients} 
                                brand={brand} callback={moreInfo} mode={0}>
                            </FoodCard>
                        )
                    })
                }
            </ScrollView>

            <Portal.Host>
                <FoodModal nutrition={nutrition} brand={currentBrand} name={currentName} id={currentId} servingSize={currentServing} unit={currentUnit}
                    editMealFoods={editMealFoods} toggle={toggleModal} removeFromMeal={removeFromMeal} modalVisible={modalVisible} isInMeal={currentIsInMeal} isInPlan={currentIsInPlan}
                    context={currentPlan === null ?  "MealBuilder" : "PlanBuilder"}>
                </FoodModal>
            </Portal.Host>

        </SafeAreaView>
    </>
}

const styles = StyleSheet.create({
    safeView: {
        flex: 1,
        backgroundColor: '#f7f7f7'
    },
    scrollView: {
        backgroundColor: 'white',
        height: '100%',
        paddingTop: 5
    },
    container: {
        margin: 15,
        width: '90%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
        height: 60,
    },
    input: {
        fontSize: 20,
        fontWeight: '300',
        width: '90%',
        marginLeft: 10,
    },
    exampleBanner: {
        padding: 12
    },
    exampleBannerText: {
        fontSize: 20,
        fontWeight: '300'
    },
    messageTextView: {
        backgroundColor: '#dadfe1',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    foodCateogoryText: {
        fontSize: 16,
        fontWeight: '300'
    },
    feather: {
        marginLeft: 1
    },
    entypo: {
        padding: 1,
        marginLeft: -25
    },
    searchbar_pressed: {
        padding: 10,
        flexDirection: 'row',
        borderRadius: 15,
        width: '80%',
        alignItems: 'center',
        backgroundColor: "#dadfe1",
        borderColor: '#646569',
        borderWidth: 1
    },
    searchbar_unpressed: {
        padding: 10,
        flexDirection: 'row',
        borderRadius: 15,
        width: '95%',
        backgroundColor: '#dadfe1',
        alignItems: 'center',
        borderColor: '#646569',
        borderWidth: 1
    }
})