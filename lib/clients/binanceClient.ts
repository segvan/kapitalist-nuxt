import {Spot} from "@binance/connector-typescript";

const createClient = (isTestnet = true) =>
  isTestnet
    ? new Spot(process.env.TEST_BNB_API_KEY, process.env.TEST_BNB_SECRET_KEY, {
      baseURL: "https://testnet.binance.vision",
    })
    : new Spot(process.env.BNB_API_KEY, process.env.BNB_SECRET_KEY, {
      baseURL: "https://api.binance.com",
      timeout: 10000,
    });

const binanceClient = createClient(false);
const binanceTestClient = createClient(true);

export {binanceClient, binanceTestClient};
