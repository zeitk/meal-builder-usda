import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import React,{ useState, useContext } from 'react'
import { StyleSheet } from "react-native";
import { Button, Portal } from "react-native-paper";
import { useMealList } from "../context/MealList";
import { Ionicons } from '@expo/vector-icons';
import QuicklistContext from "../context/QuicklistContext";
import HomeCard from "./HomeCard";
import FoodModal from "./FoodModal";

export default function Home({ navigation }:any) {

    // page states
    const [page, setPage] = useState<number>(1);
    const { mealList } = useMealList()
    const [quicklist] = useContext(QuicklistContext);
    const greeting: string = getTime();

    // food/meal states for modal
    const [modalContext, setModalContext] = useState<string>();
    const [viewedId, setViewedId] = useState<number>()
    const [viewedName, setViewedName] = useState<String>()
    const [viewedImage, setViewedImage] = useState<String>()
    const [viewedNutrition, setViewedNutrition] = useState<any>({});
    const [viewedCost, setViewedCost] = useState<any>({})
    const [modalVisible, setModalVisible] = useState<Boolean>(false);

    function getTime() {
        let now = new Date();
        let hour = now.getHours()
        if (hour < 12) return "Good morning"
        else if (hour < 17) return "Good afternoon"
        else return "Good evening"
    }

    function toggleFoodModal() {
        if (!modalVisible) setModalVisible(true)
        else setModalVisible(false)
    }

    function travelToMeals() {
        setModalVisible(false)
        navigation.navigate("Meals")
    }

    function moreInfo(id: number, context: string) {

        if (context==="food") {
            quicklist.forEach((food: any) => {
                if (id===food["id"]) {
                    setViewedId(food["id"])
                    setViewedName(food["name"])
                    setViewedImage(food["image"])
                    setViewedCost(food["cost"])
                    setViewedNutrition({
                        caloricBreakdown: food["caloricBreakdown"],
                        flavonoids: food["flavonoids"],
                        nutrients: food["nutrients"],
                        properties: food["properties"],
                        weightPerServing: food["weightPerServing"]
                    })
                    setModalContext("Quicklist")
                    setModalVisible(true)
                }
            })
        }
        else if (context==="meal") {
            mealList?.forEach((meal: any) => {
                if (id===meal["id"]) {
                    setViewedId(meal["id"])
                    setViewedName(meal["name"])
                    setViewedCost(meal["data"]["cost"]) 
                    setViewedNutrition({
                        flavonoids: meal["data"]["flavonoids"],
                        nutrients: meal["data"]["nutrients"], 
                        weightPerServing: 1,
                        properties: {},
                        caloricBreakdown: {}
                    })
                    setModalContext("Home")
                    setModalVisible(true)
                }
            })

        }
        
    }

    return(
        <View style={{height: '100%', width: '100%'}}>
        { (page===1) 
            ? 
            <View style={page1Styles.overall}>
                <ScrollView style={page1Styles.verticalScrollView}>
                <View style={page1Styles.greetingView}>
                        <Text style={page1Styles.greetingText}>{greeting}</Text>
                </View> 
                <View style={page1Styles.listView}>
                    <View style={page1Styles.exampleBanner}>
                        <Text style={page1Styles.exampleBannerText}>My Meals</Text>
                    </View> 
                    {(mealList !== null && mealList.length>0)
                    ?
                    <ScrollView style={page1Styles.horizontalScrollView} horizontal={true}>
                    {
                        mealList.map((meal: any, i: number) => {
                            return<HomeCard key={i} mode="meal" id={meal["id"]} name={meal["name"]} foods={meal["foods"]} callback={moreInfo} navigation={navigation}></HomeCard>
                        })
                    }
                    </ScrollView>
                    :
                    <View style={page1Styles.noSavedItemsView}>
                        <Text style={page1Styles.noSavedItemsText}>No saved meals</Text>
                        <Button mode="text" textColor="#2774AE" children={"Go to 'Meals'"} style={page2Styles.button} labelStyle={page2Styles.buttonText} onPress={()=>(navigation.navigate("Meals"))}></Button>
                    </View>
                    }       
                </View>
                <View style={page1Styles.listView}>
                    <View style={page1Styles.exampleBanner}>
                        <Text style={page1Styles.exampleBannerText}>My Quicklist</Text>
                    </View> 
                    { (quicklist !== null && quicklist.length>0)
                    ?
                    <ScrollView style={page1Styles.horizontalScrollView} horizontal={true}>
                    {
                        quicklist.map((food: any, i: number) => {
                            return <HomeCard key={i} mode="food" id={food["id"]} callback={moreInfo} name={food["name"]} ></HomeCard>
                        })
                    }
                    </ScrollView>
                    :
                    <View style={page1Styles.noSavedItemsView}>
                        <Text style={page1Styles.noSavedItemsText}>No saved foods</Text>
                        <Button mode="text" textColor="#2774AE" children={"Go to 'Search'"} style={page2Styles.button} labelStyle={page2Styles.buttonText} onPress={()=>(navigation.navigate("Search"))}></Button>
                    </View>
                    }
                </View>  
                <View style={page1Styles.buttonView}>
                    <Pressable  style={({pressed})=> pressed ? page1Styles.moreInfoButton_pressed:page1Styles.moreInfoButton_unpressed} onPress={() => setPage(2)}>
                        <Ionicons name="ios-information-circle-outline" size={20} color="black" />
                        <Text style={page1Styles.exampleBannerText}> About App</Text>
                    </Pressable>
                </View>     
                </ScrollView>
                



                <Portal.Host>
                    <FoodModal 
                        nutrition={viewedNutrition} name={viewedName} cost={viewedCost} id={viewedId} image={viewedImage}  
                        toggle={toggleFoodModal} goToMeals={travelToMeals}
                        context={modalContext} modalVisible={modalVisible} ></FoodModal>
                </Portal.Host>
            </View>
            :
            <View style={page1Styles.overall}>

            <ScrollView style={page2Styles.view}>

                <Text style={page2Styles.header}>Overview</Text>
                <Text style={page2Styles.bodyText}>Welcome to Meal Builder. This app uses the spooonacular API to access data on different foods. </Text>
                <Text style={page2Styles.linkText} onPress={() => Linking.openURL('https://spoonacular.com/food-api')}>Spoonacular API</Text>
                <Text style={page2Styles.bodyText}>This app allows you to search for foods, view their information, and combine foods into meals.</Text>

                <Text style={page2Styles.subHeader}>Search</Text>
                <Text style={page2Styles.bodyText}>In the 'Search' tab you can search for foods and view their nutritional information. When viewing a specific food, you can add that food to your Quicklist, which acts as a favorites list of foods</Text>
                <Text style={page2Styles.bodyText}>'Search' will automatically load with an example search to show what a typical query will return</Text>
                <Button mode="text" textColor="#2774AE" children={"Go to 'Search'"} style={page2Styles.button} labelStyle={page2Styles.buttonText} onPress={()=>(navigation.navigate("Search"))}></Button>
                <Text style={page2Styles.subHeader}>Quicklist</Text>
                <Text style={page2Styles.bodyText}>The 'Quicklist' tab shows your favorited items. From here, you can view their nutritional information or remove them from the Quicklist. The Quicklist allows you to more quickly add foods to meals in the 'Meals' tab</Text>
                <Button mode="text" textColor="#2774AE" children={"Go to 'Quicklist'"} style={page2Styles.button} labelStyle={page2Styles.buttonText} onPress={()=>(navigation.navigate("Quicklist"))}></Button>
                <Text style={page2Styles.subHeader}>Meals</Text>
                <Text style={page2Styles.bodyText}>In 'Meals' you can create new meals or view previously made ones. To create a new meal press the 'Add Meal' button. You may select a name for your meal near the top.</Text>
                <Text style={page2Styles.bodyText}>By default, foods in the Quicklist will show. Selected foods will be highlighted green. Once selected, you may enter in a custom quantity (in grams) for the food.</Text>
                <Text style={page2Styles.bodyText}>Press 'Search all foods', to search over the entire database. Here, selected foods will show a pop-up. You may use the 'Amount' textbox to enter in a custom quantity (in grams) for a food. Add the food by pressing 'Add to Meal'</Text>
                <Text style={page2Styles.bodyText}>Save the meal with the 'Save' button. The 'Close' button will close the builder without saving</Text>
                <Text style={page2Styles.bodyText}>Press on a Meal card to view a created meal. Here, you may view a meal's overall nutritional information and cost.</Text>
                <Text style={page2Styles.bodyText}>You may remove foods from the meal by selecting them and pressing 'Remove from Meal'. On the second page, you may specify the servings of the meal, which will update the nutritional info</Text>
                <Button mode="text" textColor="#2774AE" children={"Go to 'Meals'"} style={page2Styles.button} labelStyle={page2Styles.buttonText} onPress={()=>(navigation.navigate("Meals"))}></Button>
                <View style={{height: 25}}></View>
                
            </ScrollView>

            <View style={page1Styles.buttonView}>
                    <Pressable  style={({pressed})=> pressed ? page1Styles.moreInfoButton_pressed:page1Styles.moreInfoButton_unpressed} onPress={() => setPage(1)}>
                        <Ionicons name="ios-information-circle-outline" size={20} color="black" />
                        <Text style={page1Styles.exampleBannerText}> Return Home</Text>
                    </Pressable>
                </View>
            </View>
        }                        
        </View>    
    )
}

const page2Styles = StyleSheet.create({
    subHeader: {
        fontSize: 15,
        fontWeight: '500',
        paddingBottom: 10,
    },
    header: {
        fontSize: 18,
        fontWeight: '500',
        paddingBottom: 10,
    },
    view: {
        width: '100%',
        height: '92.5%',
        paddingTop: 20,
        paddingHorizontal: 10,
    },
    linkText: {
        fontSize: 15,
        paddingBottom: 10,
        fontWeight: '300',
        textAlign: 'center',
        textDecorationLine: 'underline',
        color: '#2774AE'
    },
    bodyText: {
        fontSize: 14,
        paddingBottom: 10,
        fontWeight: '300',
    },
    button: {
        width: 300,
        alignSelf: 'center',
        padding: 10,
    },
    returnButton: {
        width: 300,
        alignSelf: 'center',
    },
    buttonText: {
        fontSize: 15
    },
    returnButtonText: {
        fontSize: 18
    }
})

const page1Styles = StyleSheet.create({
    overall: {
        height: '100%',
        width: '100%'
    },
    listView: {
        width: '100%'
    },
    verticalScrollView: {
        height: '100%',
        width: '100%'
    },
    horizontalScrollView: {
        height: 250
    },
    noSavedItemsView: {
        height: 125,
        justifyContent: 'center',
        alignItems: 'center'
    },
    noSavedItemsText: {
        fontSize: 17,
        fontWeight: '300'
    },
    exampleBanner: {
        padding: 12
    },
    exampleBannerText: {
        fontSize: 20,
        fontWeight: '300'
    },
    greetingText: {
        fontSize: 24,
        fontWeight: 'bold'
    },
    greetingView: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10,
        paddingTop: 8,
        width: '100%',
    },
    moreInfoButton_unpressed: {
        flexDirection: 'row',
        height: '90%',
        margin: '1%',
        justifyContent: 'center',
        alignSelf: 'flex-end',
        alignItems: 'center',
        width: '40%',
    },
    moreInfoButton_pressed: {
        flexDirection: 'row',
        height: '90%',
        margin: '1%',
        justifyContent: 'center',
        alignSelf: 'flex-end',
        alignItems: 'center',
        width: '40%',
        borderRadius: 30,
        backgroundColor: 'white'
    },
    moreInfoButtonText: {
        fontSize : 16,
    },
    buttonView: {
        flexDirection: 'row',
        alignSelf: 'flex-end',
        height: 50,
    }
})