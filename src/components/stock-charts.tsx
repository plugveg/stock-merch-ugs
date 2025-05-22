import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useScreenSize } from "@/hooks/useMobile";
import { Doc } from "convex/_generated/dataModel";
import { formatPieLabel, formatDollar } from "@/lib/chart-utils";
import { useMemo } from "react";
interface StockChartsProps {
  stock: Doc<"products">[];
}

export function StockCharts({ stock }: StockChartsProps) {
  // Prepare data for category distribution
  const categoryQuantityMap = useMemo(() => {
    return stock.reduce(
      (acc: Record<string, number>, item) => {
        item.productType.forEach((type) => {
          if (!acc[type]) {
            acc[type] = 0;
          }
          acc[type] += item.quantity;
        });
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [stock]);

  const pieChartData = useMemo(() => {
    return Object.entries(categoryQuantityMap).map(([name, value]) => ({
      name,
      value,
    }));
  }, [categoryQuantityMap]);

  // Prepare data for top items by value
  const topItemsByValue = useMemo(() => {
    return [...stock]
      .sort((a, b) => b.purchasePrice * b.quantity - a.purchasePrice * a.quantity)
      .slice(0, 5)
      .map((item) => ({
        name: item.productName,
        value: item.purchasePrice * item.quantity,
      }));
  }, [stock]);

  // Colors for the charts
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"];

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Inventory by Category</CardTitle>
          <CardDescription>
            Distribution of items across categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={formatPieLabel}
                >
                  {pieChartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {useScreenSize().windowWidth > 768 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Items by Value</CardTitle>
            <CardDescription>
              Items with highest inventory value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <ChartContainer
                config={{
                  value: {
                    label: "Value ($)",
                    color: "hsl(var(--chart-1))",
                  },
                }}
              >
                <BarChart
                  data={topItemsByValue}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis
                    tickFormatter={formatDollar}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill={"#4f39f6"} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
