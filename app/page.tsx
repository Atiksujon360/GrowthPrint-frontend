import { AppProviders } from './providers';
import { ApplicationShell } from '../components/shell/ApplicationShell';

export default function HomePage() {
  return (
    <AppProviders>
      <ApplicationShell />
    </AppProviders>
  );
}
