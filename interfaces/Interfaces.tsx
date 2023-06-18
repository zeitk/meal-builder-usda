export interface IMeal {
    id: number
    name: string,
    foods: IFood[],
    data: any,
    quantity?: number
}

export interface IMealContext {
    currentMeal: IMeal | null,
    setCurrentMeal: (Meal: IMeal) => void
}

export interface IMealListContext {
    mealList: IMeal[] | null,
    setMealList: (Meals: IMeal[]) => void
}

export interface IPlan {
    id: number
    name: string,
    foods: IFood[],
    meals: IMeal[],
    data: any
}

export interface IPlanContext {
    currentPlan: IPlan | null,
    setCurrentPlan: (Plan: IPlan) => void
}

export interface IPlanListContext {
    planList: IPlan[] | null,
    setPlanList: (Plans: IPlan[]) => void
}

export interface IFood {
    [key: string]: any,
    id: number,
    name: string,
    foodCategory?: string,
}

export interface INutrient {
    [key: string]: any,
    value: number,
    nutrientName: string,
    unitName: string,
}

export interface ISearchCriteria {
    [key: string]: any,
    dataType: string,
    pageSize: string
}

export interface ICriteriaContext {
    searchCriteria: ISearchCriteria,
    setSearchCriteria: (Criteria: ISearchCriteria) => void
}

export interface IButtonContext {
    hideButtons: boolean,
    setHideButtons: (hide: boolean) => void
}

export interface ISearchBarProps {
    callback: (input: string) => void,
    placeholderTextColor: string,
    navigation?: any, 
    mode?: string
}