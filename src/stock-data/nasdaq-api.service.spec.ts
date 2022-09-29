import { Test, TestingModule } from '@nestjs/testing';
import { NasdaqApiService } from './nasdaq-api.service';

describe('NasdaqApiService', () => {
  let service: NasdaqApiService;
  const OLD_ENV = process.env;

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [NasdaqApiService],
    }).compile();

    service = testingModule.get<NasdaqApiService>(NasdaqApiService);

    process.env = {
      ...OLD_ENV,
      NASDAQ_API_KEY: 'NASDAQ_API_KEY',
    };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSimpleStockReturnPercentage', () => {
    describe('when there are no daily stock prices', () => {
      let getDailyPricesForStockSpy: jest.SpyInstance;

      beforeEach(() => {
        getDailyPricesForStockSpy = jest
          .spyOn(service, 'getDailyPricesForStock')
          .mockResolvedValueOnce([]);
      });

      it('returns 0', async () => {
        expect(
          await service.getSimpleStockReturnPercentage(
            'stock',
            '2021-01-02',
            '2021-01-01',
          ),
        ).toEqual(0);

        expect(getDailyPricesForStockSpy).toHaveBeenCalledWith(
          'stock',
          '2021-01-02',
          '2021-01-01',
        );
      });
    });

    describe('when there are daily stock prices', () => {
      let getDailyPricesForStockSpy: jest.SpyInstance;

      it('returns 100 when the stock doubled', async () => {
        getDailyPricesForStockSpy = jest
          .spyOn(service, 'getDailyPricesForStock')
          .mockResolvedValueOnce([
            ['2021-01-02', 2],
            ['2021-01-01', 1],
          ]);

        expect(
          await service.getSimpleStockReturnPercentage(
            'stock',
            '2021-01-01',
            '2021-01-02',
          ),
        ).toEqual(100);

        expect(getDailyPricesForStockSpy).toHaveBeenCalledWith(
          'stock',
          '2021-01-01',
          '2021-01-02',
        );
      });

      it('returns 200 when the stock tripled', async () => {
        getDailyPricesForStockSpy = jest
          .spyOn(service, 'getDailyPricesForStock')
          .mockResolvedValueOnce([
            ['2021-01-02', 6],
            ['2021-01-01', 2],
          ]);

        expect(
          await service.getSimpleStockReturnPercentage(
            'stock',
            '2021-01-01',
            '2021-01-02',
          ),
        ).toEqual(200);

        expect(getDailyPricesForStockSpy).toHaveBeenCalledWith(
          'stock',
          '2021-01-01',
          '2021-01-02',
        );
      });

      it('returns 0 when the stock did not fluctuate', async () => {
        getDailyPricesForStockSpy = jest
          .spyOn(service, 'getDailyPricesForStock')
          .mockResolvedValueOnce([
            ['2021-01-02', 6],
            ['2021-01-01', 6],
          ]);

        expect(
          await service.getSimpleStockReturnPercentage(
            'stock',
            '2021-01-01',
            '2021-01-02',
          ),
        ).toEqual(0);

        expect(getDailyPricesForStockSpy).toHaveBeenCalledWith(
          'stock',
          '2021-01-01',
          '2021-01-02',
        );
      });

      it('returns -100 when the stock dropped to 0', async () => {
        getDailyPricesForStockSpy = jest
          .spyOn(service, 'getDailyPricesForStock')
          .mockResolvedValueOnce([
            ['2021-01-02', 0],
            ['2021-01-01', 6],
          ]);

        expect(
          await service.getSimpleStockReturnPercentage(
            'stock',
            '2021-01-01',
            '2021-01-02',
          ),
        ).toEqual(-100);

        expect(getDailyPricesForStockSpy).toHaveBeenCalledWith(
          'stock',
          '2021-01-01',
          '2021-01-02',
        );
      });

      it('returns -50 when the stock dropped half of its price', async () => {
        getDailyPricesForStockSpy = jest
          .spyOn(service, 'getDailyPricesForStock')
          .mockResolvedValueOnce([
            ['2021-01-02', 3],
            ['2021-01-01', 6],
          ]);

        expect(
          await service.getSimpleStockReturnPercentage(
            'stock',
            '2021-01-01',
            '2021-01-02',
          ),
        ).toEqual(-50);

        expect(getDailyPricesForStockSpy).toHaveBeenCalledWith(
          'stock',
          '2021-01-01',
          '2021-01-02',
        );
      });
    });
  });

  describe('getMaximumDrawdownPercentage', () => {
    let calculateMaximumDrawdownPercentageSpy: jest.SpyInstance;

    beforeEach(() => {
      calculateMaximumDrawdownPercentageSpy = jest
        .spyOn(service, 'calculateMaximumDrawdownPercentage')
        .mockReturnValue(100);
    });

    describe('when there are no daily stock prices', () => {
      let getDailyPricesForStockSpy: jest.SpyInstance;

      beforeEach(() => {
        getDailyPricesForStockSpy = jest
          .spyOn(service, 'getDailyPricesForStock')
          .mockResolvedValueOnce([]);
      });

      it('returns 0', async () => {
        expect(
          await service.getMaximumDrawdownPercentage(
            'stock',
            '2021-01-01',
            '2021-01-02',
          ),
        ).toEqual(0);

        expect(getDailyPricesForStockSpy).toHaveBeenCalledWith(
          'stock',
          '2021-01-01',
          '2021-01-02',
        );
        expect(calculateMaximumDrawdownPercentageSpy).not.toHaveBeenCalled();
      });
    });

    describe('when there are daily stock prices', () => {
      let getDailyPricesForStockSpy: jest.SpyInstance;

      beforeEach(() => {
        getDailyPricesForStockSpy = jest
          .spyOn(service, 'getDailyPricesForStock')
          .mockResolvedValueOnce([
            ['2021-01-01', 2],
            ['2021-01-01', 0],
          ]);
      });

      it('calls calculateMaximumDrawdownPercentage with the right params', async () => {
        expect(
          await service.getMaximumDrawdownPercentage(
            'stock',
            '2021-01-01',
            '2021-01-02',
          ),
        ).toEqual(100);

        expect(getDailyPricesForStockSpy).toHaveBeenCalledWith(
          'stock',
          '2021-01-01',
          '2021-01-02',
        );
        expect(calculateMaximumDrawdownPercentageSpy).toHaveBeenCalledWith([
          ['2021-01-01', 2],
          ['2021-01-01', 0],
        ]);
      });
    });
  });

  describe('calculateMaximumDrawdownPercentage', () => {
    it('returns 0 when daily stock prices array is empty', () => {
      expect(service.calculateMaximumDrawdownPercentage([])).toEqual(0);
    });

    it('returns the correct maximum drawdown when prices are all integers', () => {
      // 12 is the Peak and 1 is the Trough
      expect(
        service.calculateMaximumDrawdownPercentage([
          ['2021-01-08', 7],
          ['2021-01-07', 4],
          ['2021-01-06', 12],
          ['2021-01-05', 1],
          ['2021-01-04', 6],
          ['2021-01-03', 4],
          ['2021-01-02', 8],
        ]),
      ).toEqual(-91.66666666666666);
    });

    it('returns the correct maximum drawdown when prices are floats', () => {
      // 15.12 is the Peak and 13.98 is the Trough
      expect(
        service.calculateMaximumDrawdownPercentage([
          ['2021-01-08', 14.12],
          ['2021-01-07', 14.87],
          ['2021-01-06', 14.2],
          ['2021-01-05', 13.76],
          ['2021-01-04', 15.12],
          ['2021-01-03', 14.98],
          ['2021-01-02', 13.98],
        ]),
      ).toEqual(-7.539682539682532);
    });

    it('returns correct drawdown when stock prices increased every single day', () => {
      expect(
        service.calculateMaximumDrawdownPercentage([
          ['2021-01-06', 5],
          ['2021-01-05', 4],
          ['2021-01-04', 3],
          ['2021-01-03', 2],
          ['2021-01-02', 1],
        ]),
      ).toEqual(-80);
    });

    it('returns -100 when stock prices decreased to 0', () => {
      expect(
        service.calculateMaximumDrawdownPercentage([
          ['2021-01-06', 0],
          ['2021-01-05', 1],
          ['2021-01-04', 3],
          ['2021-01-03', 4],
          ['2021-01-02', 5],
        ]),
      ).toEqual(-100);
    });

    it('returns 0 when stock prices were steady', () => {
      expect(
        service.calculateMaximumDrawdownPercentage([
          ['2021-01-06', 1],
          ['2021-01-05', 1],
          ['2021-01-04', 1],
          ['2021-01-03', 1],
          ['2021-01-02', 1],
        ]),
      ).toEqual(0);
    });
  });

  describe('buildEndpoint', () => {
    it('return the NASDAQ endpoint', () => {
      expect(service.buildEndpoint('FB')).toEqual(
        'https://data.nasdaq.com/api/v3/datasets/WIKI/FB.json?column_index=11&api_key=NASDAQ_API_KEY',
      );
    });
  });
});
