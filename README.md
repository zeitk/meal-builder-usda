# meal-builder
This is an app that lets you search for foods, view their quantitative data, and build meals out of them. 
Quantitative data on the foods/meals such nutritional content (calories, protein, carbohydrates, fats, vitamins, etc.) and cost will scale based on the quantity selected. 

# Search, Quicklist
![](https://github.com/zeitk/meal-builder/blob/master/search_and_quicklist_example.gif)

The Search feature shows a list of food cards related to the user's inputted search. Each food card can be pressed to view the nutritional info, cost, properties, 
and flavanoids in the food. When viewing a food, the user has an option to change the serving size and to add to their Quicklist. 

The Quicklist feature is a list of favorite foods that the user has chosen. This allows quick referencing and can streamline the meal 
building process.

# Meals
![](https://github.com/zeitk/meal-builder/blob/master/meal_builder_example.gif)

Meals allows the user to view and edit existing meals and build out new meals from foods in the database. To add a new meal, the user may press 
'Add Meal' which opens the meal builder. By default, the Quicklist is shown and the listed foods can be pressed to be added to the meal. The user also has the option to specify the quantity of the food. 
The user may also query the entire database by pressing 'Search all foods'. On the top of the page, 
the user can name the meal. On the bottom of the page, pressing 'Close' will close the meal builder without saving, prompting the user if there 
are unsaved changes. Pressing 'Save Meal' will save the meal to the meal list. 

The list of user made meals will be shown in the form of meal cards. Meal cards may be pressed, allowing the user to view the foods 
and see the quantitative data of the meal. The servings of the meal can be changed and the quantitative data will adjust to the new value. The user may
edit the meal in a variety of ways, including by changing the name, the quantity of any of the foods, or adding or removing foods. Pressing 'Add item'
will allow the user to query the entire database to add another food. The meal may be deleted by pressing the trash bin icon on the meal card. 
