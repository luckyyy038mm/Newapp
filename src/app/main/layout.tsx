'use client';

import TradingPlatform from '@/components/TradingPlatform';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TradingPlatform />;
}