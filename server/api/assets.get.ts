import {PrismaClient} from '@prisma/client'
import type {AssetModel} from "~/lib/apiModels";

export default defineEventHandler(async () => {
  const db = new PrismaClient()
  const assets = await db.asset.findMany();

  return assets.map(asset => asset as AssetModel);
})