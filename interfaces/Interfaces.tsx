export interface IMeal {
    id: number
    name: string,
    foods: IFood[],
    data: any
}

export interface IMealListContext {
    mealList: IMeal[] | null,
    setMealList: (Meals: IMeal[]) => void
}

export interface IFood {
    [key: string]: any,
    id: number,
    image: string,
    name: string,
    possibleUnits?: Array<string>
    aisle?: string,
}