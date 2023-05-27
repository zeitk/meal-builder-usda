import { createContext, useContext } from "react";
import { ICriteriaContext } from "../interfaces/Interfaces";

export const CriteriaContext = createContext<ICriteriaContext>({
    searchCriteria: {dataType: "", pageSize: ""},
    setSearchCriteria: () => undefined
})

// Code Attribution: https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/context/
export const useCriteria = () => {
    const currentCriteriaContext = useContext(CriteriaContext);
  
    if (!currentCriteriaContext) {
      throw new Error(
        "useCriteria has to be used within <CriteriaContext.Provider>"
      );
    }
  
    return currentCriteriaContext;
};