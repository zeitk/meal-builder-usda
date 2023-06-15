import { createContext, useContext } from "react";
import { IPlanListContext } from '../interfaces/Interfaces'

export const PlanListContext = createContext<IPlanListContext>({
    planList: null,
    setPlanList: () => undefined
});

// Code Attribution: https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/context/
export const usePlanList = () => {
    const currentPlanList = useContext(PlanListContext);
  
    if (!PlanListContext) {
      throw new Error(
        "usePlanList has to be used within <CurrentPlanContext.Provider>"
      );
    }
  
    return currentPlanList;
  };
