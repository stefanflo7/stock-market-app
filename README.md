# Stock Market App

## Description

Small app that calculates simple return rate and maximum drawback for a specific stock symbol for a specific time frame. It logs the calculated values, but it also send them as SMS and WhatsApp messages.

## Installation

```bash
yarn
source .env
```

### Environment variables

| Variable               | Description                                                                                                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TWILIO_ACCOUNT_SID `  | The Twilio account SID that can be found [here](https://console.twilio.com/?frameUrl=%2Fconsole%3Fx-target-region%3Dus1) .                                             |
| `TWILIO_AUTH_TOKEN`    | The Twilio authentication token that can be found [here](https://console.twilio.com/?frameUrl=%2Fconsole%3Fx-target-region%3Dus1) .                                    |
| `NASDAQ_API_KEY`       | The NASDAQ API Key that can be found [here](https://data.nasdaq.com/account/profile).                                                                                  |
| `PHONE_FROM_NUMBER`    | The phone number that TWILIO will use to send SMS messages. It needs to be set [here](https://console.twilio.com/?frameUrl=%2Fconsole%3Fx-target-region%3Dus1)         |
| `PHONE_TO_NUMBER`      | The phone number that TWILIO will send SMS messages to. For Free Twilio account, it needs to be set under TWILIO's settings                                            |
| `WHATSAPP_FROM_NUMBER` | The phone number that TWILIO will use to send WhatsApps messages. It needs to be set [here](https://console.twilio.com/?frameUrl=%2Fconsole%3Fx-target-region%3Dus1) . |
|                        |

## Running the app

| Command                                             | Description                                                                                                                                                                                                                                                                  |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yarn app:task <stockSymbol> <startDate> <endDate>` | Run the task that retrieves stock market data. It should be called with these three parameters where `stockSymbol` is the stockSymbol, example: 'FB', and the `startDate` and `endDate` are the dates between which to get stock prices. Their format is like: '2022-02-31'. |

## Example of running the app

```
yarn
// populate env variables
source .env
yarn app:task 'FB' '2014-01-01' '2014-12-31'
```

## Running the tests

| Command     | Description                      |
| ----------- | -------------------------------- |
| `yarn test` | Run all the existing unit tests. |

## Notes

- Be aware that NASDAQ's API only supports historical data for the free tier

## Things to be developed in the future

- Create guard to check that the `startDate` and `endDate` formats are correct
- Create guard to check that the `stockSymbol` is an existing one
