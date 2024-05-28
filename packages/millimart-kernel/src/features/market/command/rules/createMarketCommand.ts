import {
  MarketCommandMap,
  MarketCommandTypeName,
  MarketCommandTypePrefix,
} from "../MarketCommandSchema";

export const createMarketCommand = <TypeName extends MarketCommandTypeName>(
  typeName: TypeName,
  data: MarketCommandMap[TypeName]["data"],
) => {
  const type = `${MarketCommandTypePrefix}${typeName}`;
  return { type, data } as MarketCommandMap[TypeName];
};
