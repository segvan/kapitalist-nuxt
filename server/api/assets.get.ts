import type {AssetModel} from "~/lib/apiModels";
import prisma from "~/lib/prisma";

export default defineEventHandler(async () => {
  const assets = await prisma.asset.findMany();
  return assets.map(asset => asset as AssetModel);
})