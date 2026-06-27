import { AppShell, Burger, Group, NavLink, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChartLine, IconHome, IconListDetails } from '@tabler/icons-react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Predictor from './pages/Predictor.jsx';
import Watchlist from './pages/Watchlist.jsx';

const links = [
  { label: 'Dashboard', icon: IconHome, to: '/' },
  { label: 'Predictor', icon: IconChartLine, to: '/predictor' },
  { label: 'Watchlist', icon: IconListDetails, to: '/watchlist' }
];

export default function App() {
  const [opened, { toggle, close }] = useDisclosure();
  const location = useLocation();

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <div>
              <Title order={3}>TrendScope</Title>
              <Text size="xs" c="dimmed">Stock market trend predictor</Text>
            </div>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {links.map((item) => (
          <NavLink
            key={item.to}
            component={Link}
            to={item.to}
            label={item.label}
            leftSection={<item.icon size={18} />}
            active={location.pathname === item.to}
            onClick={close}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/predictor" element={<Predictor />} />
          <Route path="/watchlist" element={<Watchlist />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}
