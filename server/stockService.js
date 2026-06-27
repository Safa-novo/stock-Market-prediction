import axios from "axios";

const API_KEY = process.env.ALPHA_VANTAGE_KEY;

export async function getStockPrice(symbol) {
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;

    const response = await axios.get(url);

    console.log(response.data);

    const data = response.data;

    if (data.Note || data.Information) {
      throw new Error(
        "API request limit reached. Please wait a minute and try again.",
      );
    }

    const quote = data["Global Quote"];

    if (!quote || !quote["05. price"]) {
      throw new Error("Invalid stock symbol.");
    }
    return Number(quote["05. price"]);
  } catch (error) {
    console.error(error);
    throw error;
  }
}
