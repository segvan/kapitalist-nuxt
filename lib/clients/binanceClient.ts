import {Spot, SPOT_REST_API_TESTNET_URL} from "@binance/spot";
import {SimpleEarn} from "@binance/simple-earn";

const createClient = (isTestnet = true) =>
  isTestnet
    ? new Spot({
        configurationRestAPI: {
          apiKey: process.env.TEST_BNB_API_KEY ?? '',
          apiSecret: process.env.TEST_BNB_SECRET_KEY ?? '',
          basePath: SPOT_REST_API_TESTNET_URL,
        }
      })
    : new Spot({
        configurationRestAPI: {
          apiKey: process.env.BNB_API_KEY ?? '',
          apiSecret: process.env.BNB_SECRET_KEY ?? '',
          timeout: 10000,
        }
      });

const binanceClient = createClient(false);
const binanceTestClient = createClient(true);

const simpleEarnClient = new SimpleEarn({
  configurationRestAPI: {
    apiKey: process.env.BNB_API_KEY ?? '',
    apiSecret: process.env.BNB_SECRET_KEY ?? '',
    timeout: 10000,
  }
});

export {binanceClient, binanceTestClient, simpleEarnClient};
