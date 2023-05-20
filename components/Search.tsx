import React from 'react'

import { useEffect, useState, useRef } from "react";
import {  View, StyleSheet, SafeAreaView, ScrollView, Text } from "react-native";
import { Portal } from "react-native-paper";
import { IFood } from '../interfaces/Interfaces';

import FoodCard from "./FoodCard";
import FoodModal from "./FoodModal";
import { SearchBar } from './SearchBar';

const examples: string[] = [
    "Potato",
    "Bean",
    "Bread",
    "Egg"
]

export default function Search({ navigation } : any) {

    // search related states
    const [items, setItems] = useState<any>([]);
    const [totalItems, setTotalItems] = useState<number>(-1);
    const scrollRef = useRef<ScrollView | null>(null);

    // modal and table related states
    const [exampleBanner, setExampleBanner] = useState<String>("")
    const [nutrition, setNutrition] = useState<any>({})
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [cost, setCost] = useState<any>([]);
    const [currentId, setCurrentId] = useState<string>("");
    const [currentName, setCurrentName] = useState<string>("");
    const [currentImage, setCurrentImage] = useState<string>("");

    useEffect(() => {
        
        //reset total items
        setTotalItems(-1)

        // have example search 
        const searchExample = examples[Math.floor(Math.random()*examples.length)]
        searchItems(searchExample)
        setExampleBanner(searchExample)

        // close modal if it's open
        if (navigation.getState().type === "tab") {
            navigation.addListener('tabPress', () => {
                setModalVisible(false)
            });
        }

    },[navigation])

    const beginSearch = (input: string) => {
        // don't search if there's nothing to search for, or if we just pressed cancel
        if (input==="") return

        // get rid of example banner and begin search
        setExampleBanner("")
        searchItems(input)
    }

    const searchItems = ((input: any) => {

        const params = {
            query: input,
            addChildre: 'true',
            dataType: 'Foundation,SR Legacy',
            sortBy: 'dataType.keyword',
            sortDirection: 'asc',
            pageSize: '10',
            api_key: 'DNItjU0i2C3igYQ0on5Gg28ES7YKTcKhY6ldRNtM'
        };

        //let url = "https://api.spoonacular.com/food/ingredients/search?";
        let url = "https://api.nal.usda.gov/fdc/v1/foods/search?";
        url += (new URLSearchParams(params)).toString()

        fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => res.json())
            .then(json => {
                if (json.totalHits === 0) return;
                sortItems(json.foods)
                setTotalItems(json.totalHits);
            })
        scrollRef.current?.scrollTo({
            y: 0,
            animated: false
        });
    })

    function sortItems(items: any) {
        // sort foods by category before storing
        items.sort((a: any, b: any) => {
            if (a["foodCategory"]===null) return b
            else if (b["foodCategory"]===null) return a
            else return a["foodCategory"].localeCompare(b["foodCategory"])
        })
        console.log(items[1].foodNutrients);
        setItems(items)
    }

    function moreInfo(id: number, name: string, nutrition: any) {

        setNutrition(nutrition)
        setCurrentId(id.toString())
        setCurrentName(name);
        setModalVisible(true);
    }

    function toggleModal() {
        if (!modalVisible) setModalVisible(true)
        else setModalVisible(false)
    }

    return <>
        <SafeAreaView style={styles.safeView}>
            <SearchBar callback={beginSearch} placeholderTextColor={"#646569"}></SearchBar>
            { (totalItems<1) &&
                <View style={styles.messageTextView}>
                    { (totalItems===0) ?
                        <Text style={styles.exampleBannerText}>Your search returned no items</Text>:
                        <Text style={styles.exampleBannerText}>Loading...</Text>
                    }
                   
                </View>
            }
            <ScrollView ref={scrollRef} style={styles.scrollView}> 
                {exampleBanner!=="" && (
                    <View style={styles.exampleBanner}>
                        <Text style={styles.exampleBannerText}>Example Search - {exampleBanner}</Text>
                    </View> 
                )}
                {
                    items.map((item: any, i: number) => {
                        if (i === 0 || (i > 0 && items[i-1]["aisle"]!==items[i]["aisle"])) {
                            return(
                                <View key={i} >
                                    <View style={styles.exampleBanner}>
                                        <Text style={styles.foodCateogoryText}>{item["aisle"]}</Text>
                                    </View>
                                    <FoodCard id={item.fdcId} name={item.description} nutrients={item.foodNutrients} callback={moreInfo} mode={0}></FoodCard>
                                </View>
                            )
                        }
                        else return <FoodCard key={i} id={item.fdcId} name={item.description} nutrients={item.foodNutrients} callback={moreInfo} mode={0}></FoodCard>
                    })
                }
            </ScrollView>

            <Portal.Host>
                <FoodModal nutrition={nutrition} name={currentName} cost={cost} id={currentId} image={currentImage} toggle={toggleModal} modalVisible={modalVisible} context={"Search"}></FoodModal>
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