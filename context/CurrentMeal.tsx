import { createContext } from "react";
import { IMeal } from "../interfaces/Interfaces";

export interface IMealContext {
    currentMeal: IMeal | null,
    setCurrentMeal: (Meal: IMeal) => void
}

const CurrentMealContext = createContext<IMealContext>({
    currentMeal: null,
    setCurrentMeal: () => undefined
})

export default CurrentMealContext