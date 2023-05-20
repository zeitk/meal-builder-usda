import { createContext } from "react";

const headerMap: Map<string, string> = new Map<string, string>([
    ["Name", "nutrientName"],
    ["Amount", "value"],
    ["Unit","unitName"]
]);

const HeadersContext = createContext<Map<string,string>>(headerMap);

export default HeadersContext