import prisma from "~/lib/prisma";
import type {SymbolModel} from "~/lib/apiModels";

const getSymbols = async (onlyDefault = true): Promise<SymbolModel[]> => {
  const stables = onlyDefault
    ? await prisma.stable.findMany({where: {isDefault: true}})
    : await prisma.stable.findMany();

  const assets = await prisma.asset.findMany();

  return assets.map(asset => stables.map(stable => {
    return {Id: asset.id, Stable: stable.id, Code: `${asset.id}${stable.id}`};
  })).flat();
};

export default getSymbols;