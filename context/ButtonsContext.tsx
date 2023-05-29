import { createContext } from "react";
import { IButtonContext } from "../interfaces/Interfaces";

const ButtonsContext = createContext<IButtonContext>({
    hideButtons: false,
    setHideButtons: () => {}
})

export default ButtonsContext