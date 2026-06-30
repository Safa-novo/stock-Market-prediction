import {
  ActionIcon,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useStocks } from "../state/StockContext.jsx";

export default function Watchlist() {
  const { watchlist, addToWatchlist, removeFromWatchlist } = useStocks();
  const form = useForm({
    initialValues: { symbol: "", companyName: "", note: "" },
    validate: {
      symbol: (value) =>
        value.trim().length < 1 ? "Ticker is required." : null,
    },
  });

  async function handleSubmit(values) {
    await addToWatchlist(values);
    form.reset();
  }

  return (
    <Stack gap="lg">
      <div>
        <Title>Watchlist</Title>
      </div>

      <Card withBorder radius="sm" p="lg">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <SimpleGrid cols={{ base: 1, md: 3 }}>
            <TextInput
              label="Ticker"
              placeholder="MSFT"
              {...form.getInputProps("symbol")}
            />
            <TextInput
              label="Company"
              placeholder="Microsoft"
              {...form.getInputProps("companyName")}
            />
            <Textarea
              label="Note"
              placeholder="Earnings momentum"
              minRows={1}
              {...form.getInputProps("note")}
            />
          </SimpleGrid>
          <Group justify="flex-end" mt="md">
            <Button type="submit" leftSection={<IconPlus size={16} />}>
              Add Symbol
            </Button>
          </Group>
        </form>
      </Card>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        {watchlist.map((item) => (
          <Card key={item.id} withBorder radius="sm" p="lg">
            <Group justify="space-between" align="flex-start">
              <div>
                <Title order={3}>{item.symbol}</Title>
                <Text c="dimmed">{item.companyName || "No company name"}</Text>
              </div>
              <ActionIcon
                variant="subtle"
                color="red"
                aria-label={`Remove ${item.symbol}`}
                onClick={() => removeFromWatchlist(item.id)}
              >
                <IconTrash size={18} />
              </ActionIcon>
            </Group>
            {item.note ? <Text mt="md">{item.note}</Text> : null}
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
