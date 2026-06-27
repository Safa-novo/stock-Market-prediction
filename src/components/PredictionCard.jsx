import {
  Badge,
  Card,
  Divider,
  Group,
  Progress,
  SimpleGrid,
  Text,
  Title,
} from "@mantine/core";

const trendColors = {
  Bullish: "green",
  Bearish: "red",
  Sideways: "yellow",
};

export default function PredictionCard({ prediction }) {
  if (!prediction) {
    return null;
  }

  return (
    <Card withBorder radius="sm" p="lg">
      <Group justify="space-between" align="flex-start" mb="md">
        <div>
          <Text size="sm" c="dimmed">
            Prediction
          </Text>
          <Title order={2}>{prediction.symbol}</Title>
        </div>
        <Badge color={trendColors[prediction.trend]} size="lg">
          {prediction.trend}
        </Badge>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        <div>
          <Text size="xs" c="dimmed">
            Current
          </Text>
          <Text fw={700}>${prediction.currentPrice}</Text>
        </div>
        <div>
          <Text size="xs" c="dimmed">
            Projected
          </Text>
          <Text fw={700}>${prediction.projectedPrice}</Text>
        </div>
        <div>
          <Text size="xs" c="dimmed">
            Momentum
          </Text>
          <Text fw={700}>{prediction.momentum}%</Text>
        </div>
        <div>
          <Text size="xs" c="dimmed">
            Volatility
          </Text>
          <Text fw={700}>{prediction.volatility}</Text>
        </div>
      </SimpleGrid>

      <Text size="sm" mt="lg" mb={6}>
        Confidence
      </Text>
      <Progress
        value={prediction.confidence}
        color={trendColors[prediction.trend]}
      />
      <Text size="xs" c="dimmed" mt={4}>
        {prediction.confidence}% model confidence
      </Text>

      <Divider my="lg" />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        <div>
          <Text size="xs" c="dimmed">
            Interpolation
          </Text>
          <Text fw={700}>
            {prediction.interpolation?.missingPointsFilled ?? 0} gaps filled
          </Text>
          <Text size="xs" c="dimmed">
            {prediction.interpolation?.method}
          </Text>
        </div>
        <div>
          <Text size="xs" c="dimmed">
            Regression
          </Text>
          <Text fw={700}>{prediction.regression?.direction}</Text>
          <Text size="xs" c="dimmed">
            R² {prediction.regression?.rSquared} | slope{" "}
            {prediction.regression?.slope}
          </Text>
        </div>
        <div>
          <Text size="xs" c="dimmed">
            Moving Average
          </Text>
          <Text fw={700}>{prediction.movingAverage?.signal}</Text>
          <Text size="xs" c="dimmed">
            MA{prediction.movingAverage?.shortWindow}: $
            {prediction.movingAverage?.shortLatest} | MA
            {prediction.movingAverage?.longWindow}: $
            {prediction.movingAverage?.longLatest}
          </Text>
        </div>
      </SimpleGrid>
    </Card>
  );
}
