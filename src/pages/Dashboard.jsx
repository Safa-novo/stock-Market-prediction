import {
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconArrowRight,
  IconChartLine,
  IconListDetails,
  IconServer,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import PredictionCard from "../components/PredictionCard.jsx";
import PriceChart from "../components/PriceChart.jsx";
import { useStocks } from "../state/StockContext.jsx";

export default function Dashboard() {
  const { watchlist, latestPrediction } = useStocks();

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title>Market Dashboard</Title>
        </div>
        <Button
          component={Link}
          to="/predictor"
          rightSection={<IconArrowRight size={16} />}
        >
          New Prediction
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <Card withBorder radius="sm" p="lg">
          <IconChartLine size={26} color="#1971c2" />
          <Text size="xs" c="dimmed" mt="md">
            Predictions
          </Text>
          <Title order={2}>
            {latestPrediction ? latestPrediction.symbol : "Ready"}
          </Title>
        </Card>
        <Card withBorder radius="sm" p="lg">
          <IconListDetails size={26} color="#2f9e44" />
          <Text size="xs" c="dimmed" mt="md">
            Watchlist Items
          </Text>
          <Title order={2}>{watchlist.length}</Title>
        </Card>
      </SimpleGrid>

      {latestPrediction ? (
        <>
          <PredictionCard prediction={latestPrediction} />
          <PriceChart series={latestPrediction.series} />
        </>
      ) : (
        <Card withBorder radius="sm" p="xl">
          <Title order={3}>No prediction yet</Title>
        </Card>
      )}
    </Stack>
  );
}
