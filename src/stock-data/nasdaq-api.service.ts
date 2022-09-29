import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios from 'axios';

const ADJUSTED_CLOSE_PRICE_INDEX = 11;
interface DailyPrices extends Array<string | number> {
  0: string;
  1: number;
}

@Injectable()
export class NasdaqApiService implements OnModuleInit {
  private readonly logger = new Logger(NasdaqApiService.name);

  async onModuleInit() {
    const nasdaqApiKey = process.env.NASDAQ_API_KEY;

    if (!nasdaqApiKey) {
      this.logger.error('==> NASDAQ_API_KEY missing');

      return;
    }
  }

  /**
   * Makes an API call to retrieve NASDAQ stock's data.
   * It returns an array like: [["2014-12-31",78.02],["2014-12-30",79.22]] with the date and closing stock price for each day
   * @param stockSymbol The stock Symbol for each to gather data
   * @param startDate The start date from which to gather the stock data. Format: '2014-11-31'
   * @param endDate The end date until which to gather the stock data. Format: '2014-12-31'
   */
  async getDailyPricesForStock(
    stockSymbol: string,
    startDate: string,
    endDate: string,
  ): Promise<DailyPrices[]> {
    const nasdaqEndpoint = this.buildEndpoint(stockSymbol);

    const data = (
      await axios.get(
        `${nasdaqEndpoint}&start_date=${startDate}&end_date=${endDate}`,
      )
    )?.data;

    const stockPrices: DailyPrices[] = data?.dataset?.data as DailyPrices[];
    return stockPrices;
  }

  /**
   * Calculates the simple return percentage the stock had during the specified period.
   * @param stockSymbol The stock Symbol for each to gather data
   * @param startDate The start date from which to gather the stock data. Format: '2014-11-31'
   * @param endDate The end date until which to gather the stock data. Format: '2014-12-31'
   */
  async getSimpleStockReturnPercentage(
    stockSymbol: string,
    startDate: string,
    endDate: string,
  ): Promise<number> {
    const stockPrices: number[] = (
      await this.getDailyPricesForStock(stockSymbol, startDate, endDate)
    )?.map((stockPrice) => stockPrice[1]);

    if (!stockPrices?.length) return 0;

    const oldestPrice = stockPrices[stockPrices.length - 1];
    const newestPrice = stockPrices[0];

    return ((newestPrice - oldestPrice) / oldestPrice) * 100;
  }

  /**
   * Gets the maximum drawdown a stock had during the specified period.
   * @param stockSymbol The stock Symbol for each to gather data
   * @param startDate The start date from which to gather the stock data. Format: '2014-11-31'
   * @param endDate The end date until which to gather the stock data. Format: '2014-12-31'
   */
  async getMaximumDrawdownPercentage(
    stockSymbol: string,
    startDate: string,
    endDate: string,
  ): Promise<number> {
    const dailyStockPrices: DailyPrices[] = await this.getDailyPricesForStock(
      stockSymbol,
      startDate,
      endDate,
    );
    if (!dailyStockPrices?.length) return 0;

    return this.calculateMaximumDrawdownPercentage(dailyStockPrices);
  }

  /**
   * Calculates the maximum drawdown.
   * The maximum drawdown is calculated as it is explained here: https://www.investopedia.com/terms/m/maximum-drawdown-mdd.asp
   * @param dailyStockPrices The array of stock market data containing the date and the price for each day
   */
  calculateMaximumDrawdownPercentage(dailyStockPrices: DailyPrices[]): number {
    if (!dailyStockPrices?.length) return 0;

    let maxStockValue = 0;
    let maxDifference = 0;
    let minStockValue = dailyStockPrices[0][1];

    dailyStockPrices
      .map((stockPrice) => stockPrice[1])
      .forEach((stockPrice) => {
        if (stockPrice > maxStockValue) {
          maxStockValue = stockPrice;
        } else if (maxStockValue - stockPrice > maxDifference) {
          maxDifference = maxStockValue - stockPrice;
          minStockValue = stockPrice;
        }
      });

    return ((minStockValue - maxStockValue) / maxStockValue) * 100;
  }

  /**
   * Builds the endpoint which is used to retrieve the stock market data.
   * @param stockSymbol The stock Symbol for each to gather data
   */
  buildEndpoint(stockSymbol: string): string {
    const nasdaqApiKey = process.env.NASDAQ_API_KEY;

    return `https://data.nasdaq.com/api/v3/datasets/WIKI/${stockSymbol}.json?column_index=${ADJUSTED_CLOSE_PRICE_INDEX}&api_key=${nasdaqApiKey}`;
  }
}
