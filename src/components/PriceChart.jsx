import { Card, Title } from '@mantine/core';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

export default function PriceChart({ series = [] }) {
  return (
    <Card withBorder radius="sm" p="lg" className="chartCard">
      <Title order={3} mb="md">Price, Interpolation, Moving Average and Regression</Title>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={series}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8ecef" />
          <XAxis dataKey="day" tickLine={false} />
          <YAxis domain={['dataMin - 5', 'dataMax + 5']} tickLine={false} width={56} />
          <Tooltip formatter={(value, name) => [`$${value}`, name]} />
          <Line name="Interpolated price" type="monotone" dataKey="price" stroke="#1971c2" strokeWidth={3} dot={false} />
          <Line name="Observed price" type="monotone" dataKey="observedPrice" stroke="#2f9e44" strokeWidth={2} dot={{ r: 2 }} connectNulls={false} />
          <Line name="MA 5" type="monotone" dataKey="movingAverage5" stroke="#f08c00" strokeWidth={2} dot={false} />
          <Line name="MA 10" type="monotone" dataKey="movingAverage10" stroke="#9c36b5" strokeWidth={2} dot={false} />
          <Line name="Regression" type="monotone" dataKey="regressionPrice" stroke="#495057" strokeDasharray="5 5" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
