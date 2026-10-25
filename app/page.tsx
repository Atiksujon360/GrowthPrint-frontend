import { AppProviders } from './providers';
import HomePageContent from './(public)/page';

export default function HomePage() {
  return (
    <AppProviders>
      <HomePageContent />
    </AppProviders>
  );
}
