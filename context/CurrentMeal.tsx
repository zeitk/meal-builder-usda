import { createContext } from "react";
import { IMealContext } from "../interfaces/Interfaces";

const CurrentMealContext = createContext<IMealContext>({
    currentMeal: null,
    setCurrentMeal: () => undefined
})

export default CurrentMealContext