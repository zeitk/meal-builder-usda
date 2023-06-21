import React from 'react'

import { useEffect, useState, useRef } from "react";
import {  View, StyleSheet, SafeAreaView, ScrollView, Text } from "react-native";
import { Portal } from "react-native-paper";

import FoodCard from "./FoodCard";
import FoodModal from "./FoodModal";
import { SearchBar } from './SearchBar';
import { useCriteria } from '../context/CriteriaContext';
import { IFood } from '../interfaces/Interfaces';

export default function Search(props : any) {

    // search related states
    const [items, setItems] = useState<any>([]);
    const [lastSearch,setLastSearch] = useState<string>("")
    const [totalItems, setTotalItems] = useState<number>(-1);
    const scrollRef = useRef<ScrollView | null>(null);
    const { searchCriteria } = useCriteria();

    // modal and table related states
    const [errorBanner, setErrorBanner] = useState<string>("")
    const [nutrition, setNutrition] = useState<any>({})
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [currentCategory, setCurrentCategory] = useState<IFood>({name: "", id: 0, foodCategory: "", nutrients: {}});
    const [currentId, setCurrentId] = useState<string>("");
    const [currentName, setCurrentName] = useState<string>("");
    const [currentUnit, setCurrentUnit] =  useState<string>("");
    const [currentServing, setCurrentServing] =  useState<number>(1);
    const [currentBrand, setCurrentBrand] = useState<string>("")

    useEffect(() => {
        //reset total items
        setTotalItems(-1)

        // begin search if coming from settings
        if (lastSearch !== "")  beginSearch(lastSearch)

        // close modal if it's open
        if (props.navigation.getState().type === "tab") {
            props.navigation.addListener('tabPress', () => {
                setModalVisible(false)
        })}
    },[props])

    const beginSearch = (input: string) => {
        // don't search if there's nothing to search for, or if we just pressed cancel
        if (input==="") return

        // get rid of example banner and begin search
        setErrorBanner("Loading...")
        searchItems(input)
    }

    const searchItems = ((input: any) => {
        
        const dataTypeString: string = (searchCriteria?.dataType === "" ? 'Foundation,SR Legacy': searchCriteria!.dataType)
        const pageSizeString: string = (searchCriteria?.pageSize === "" ? '10': searchCriteria!.pageSize)

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
            return sortHelper(a,b)
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

    function moreInfo(id: number, name: string, nutrition: any) {
        setNutrition(nutrition)
        setCurrentId(id.toString())
        for (const item of items) {
            if (item["fdcId"] === id) {
                if (item["dataType"] === "Branded") {
                    setCurrentServing(item["servingSize"].toFixed(1))
                    setCurrentUnit(item["servingSizeUnit"])
                    item["brandName"]===null 
                        ? 
                        setCurrentBrand(item["brandName"])
                        :
                        setCurrentBrand(item["brandOwner"])
                }
                else {
                    setCurrentServing(100)
                    setCurrentUnit("g")
                    setCurrentBrand("Unbranded")
                }
                setCurrentCategory(item["foodCategory"]);
            }
        };
        setCurrentName(name);
        setModalVisible(true);
    }

    function toggleModal() {
        if (!modalVisible) setModalVisible(true)
        else setModalVisible(false)
    }

    return <>
        <SafeAreaView style={styles.safeView}>
            <SearchBar callback={beginSearch} placeholderTextColor={"#646569"} navigation={props.navigation} mode={"search"}></SearchBar>
            { (totalItems<1) &&
                <View style={styles.messageTextView}>
                    { (errorBanner!=="") 
                        ?
                        <Text style={styles.exampleBannerText}>{errorBanner}</Text>
                        :
                        <Text style={styles.exampleBannerText}>Enter a search above</Text>
                    }
                </View>
            }
            <ScrollView ref={scrollRef} style={styles.scrollView}> 
                {
                    items.map((item: any, i: number) => {
                        let brand = (item.dataType === "Branded") ? item.brandName : "Unbranded"
                        if (brand === undefined) brand = item.brandOwner
                        if (i === 0 || (i > 0 && items[i-1]["foodCategory"]!==items[i]["foodCategory"])) {
                            return(
                                <View key={i} >
                                    <View style={styles.exampleBanner}>
                                        <Text style={styles.foodCateogoryText}>{item["foodCategory"]}</Text>
                                    </View>
                                    <FoodCard id={item.fdcId} name={item.description} nutrients={item.foodNutrients} 
                                        brand={brand} callback={moreInfo} food={item} mode={0}>
                                    </FoodCard>
                                </View>
                            )
                        }
                        else return( 
                            <FoodCard key={i} id={item.fdcId} name={item.description} nutrients={item.foodNutrients} 
                                brand={brand} callback={moreInfo} mode={0}>
                            </FoodCard>
                        )
                    })
                }
            </ScrollView>

            <Portal.Host>
                <FoodModal nutrition={nutrition} name={currentName} id={currentId} toggle={toggleModal} modalVisible={modalVisible} 
                servingSize={currentServing} brand={currentBrand} unit={currentUnit} category={currentCategory} context={"Search"}>
                </FoodModal>
            </Portal.Host>

        </SafeAreaView>
    </>
}

const styles = StyleSheet.create({
    safeView: {
        flex: 1,
        backgroundColor: '#f9f9f9'
    },
    scrollView: {
        backgroundColor: '#dadfe1',
        height: '100%',
        paddingTop: 5
    },
    container: {
        margin: 15,
        width: '90%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
        height: 60
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
        backgroundColor: "#dadfe1"
    },
    searchbar_unpressed: {
        padding: 10,
        flexDirection: 'row',
        borderRadius: 15,
        width: '95%',
        backgroundColor: '#dadfe1',
        alignItems: 'center',
    }
})