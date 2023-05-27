export interface IMeal {
    id: number
    name: string,
    foods: IFood[],
    data: any
}

export interface IMealContext {
    currentMeal: IMeal | null,
    setCurrentMeal: (Meal: IMeal) => void
}

export interface IMealListContext {
    mealList: IMeal[] | null,
    setMealList: (Meals: IMeal[]) => void
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