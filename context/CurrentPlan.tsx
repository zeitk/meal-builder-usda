import { createContext } from "react";
import { IPlanContext } from "../interfaces/Interfaces";

const CurrentPlanContext = createContext<IPlanContext>({
    currentPlan: null,
    setCurrentPlan: () => undefined
})

export default CurrentPlanContext