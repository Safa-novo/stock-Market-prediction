import {
  Alert,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle, IconChartLine } from "@tabler/icons-react";
import { useState } from "react";
import PredictionCard from "../components/PredictionCard.jsx";
import PriceChart from "../components/PriceChart.jsx";
import { useStocks } from "../state/StockContext.jsx";

export default function Predictor() {
  const { predict, addToWatchlist, loading, error } = useStocks();
  const [prediction, setPrediction] = useState(null);
  const form = useForm({
    initialValues: { symbol: "AAPL" },
    validate: {
      symbol: (value) =>
        value.trim().length < 1 ? "Enter a ticker symbol." : null,
    },
  });

  async function handleSubmit(values) {
    const result = await predict(values.symbol.trim());
    setPrediction(result);
  }

  async function handleSave() {
    if (!prediction) return;
    await addToWatchlist({
      symbol: prediction.symbol,
      companyName: `${prediction.symbol} Holdings`,
      note: `${prediction.trend} with ${prediction.confidence}% confidence`,
    });
  }

  return (
    <Stack gap="lg">
      <div>
        <Title>Trend Predictor</Title>
      </div>

      <Paper withBorder radius="sm" p="lg">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Group align="flex-end">
            <TextInput
              label="Ticker symbol"
              placeholder="NVDA"
              style={{ flex: 1 }}
              {...form.getInputProps("symbol")}
            />
            <Button
              type="submit"
              loading={loading}
              leftSection={<IconChartLine size={16} />}
            >
              Predict
            </Button>
          </Group>
        </form>
      </Paper>

      {error ? (
        <Alert color="red" icon={<IconAlertCircle size={16} />}>
          {error}
        </Alert>
      ) : null}

      {prediction ? (
        <>
          <PredictionCard prediction={prediction} />
          <Group justify="flex-end">
            <Button variant="light" onClick={handleSave}>
              Save to Watchlist
            </Button>
          </Group>
          <PriceChart series={prediction.series} />
        </>
      ) : null}
    </Stack>
  );
}
