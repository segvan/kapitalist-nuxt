import type {AssetModel} from "~/lib/apiModels";
import prisma from "~/lib/prisma";
import protectRoute from "~/server/protectRoute";

export default defineEventHandler(async (event) => {
  await protectRoute(event);

  const assets = await prisma.asset.findMany();
  return assets.map(asset => asset as AssetModel);
})