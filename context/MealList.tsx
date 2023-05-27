import { createContext, useContext } from "react";
import { IMealListContext } from '../interfaces/Interfaces'

export const MealListContext = createContext<IMealListContext>({
    mealList: null,
    setMealList: () => undefined
});

// Code Attribution: https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/context/
export const useMealList = () => {
    const currentMealListContext = useContext(MealListContext);
  
    if (!currentMealListContext) {
      throw new Error(
        "useCurrentMeal has to be used within <CurrentMealContext.Provider>"
      );
    }
  
    return currentMealListContext;
  };
