interface StatisticCardProps {
  value: string;
  label: string;
}

export function StatisticCard({ value, label }: StatisticCardProps) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold mb-2">{value}</div>
      <p className="text-white/80">{label}</p>
    </div>
  );
}
