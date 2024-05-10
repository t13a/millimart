import { MarketCommand, MarketCommandTypePrefix } from "../MarketCommandSchema";

export type MarketCommandTypeName =
  MarketCommand["type"] extends `${typeof MarketCommandTypePrefix}${infer TypeName}`
    ? TypeName
    : never;

export type MarketCommandByTypeName<TypeName extends MarketCommandTypeName> =
  MarketCommand & { type: `${typeof MarketCommandTypePrefix}${TypeName}` };

export const createMarketCommand = <TypeName extends MarketCommandTypeName>(
  typeName: TypeName,
  data: MarketCommandByTypeName<TypeName>["data"],
): MarketCommandByTypeName<TypeName> => {
  const type = `${MarketCommandTypePrefix}${typeName}`;
  return { type, data } as any; // FIXME
};
