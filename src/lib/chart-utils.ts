export const formatPieLabel = ({
  name,
  percent,
}: {
  name: string;
  percent: number;
}) => `${name} ${(percent * 100).toFixed(0)}%`;

export const formatDollar = (value: number) => `$${value}`;
