"use client"

import { Pie, PieChart, Cell } from "recharts"
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartConfig,
} from "@/components/ui/chart"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface PieChartData {
    name: string;
    value: number;
}

interface PieChartComponentProps {
    data: PieChartData[];
}

const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
];

const chartConfig = {
    value: {
        label: "Số lượng",
    },
} satisfies ChartConfig

export function PieChartComponent({ data = [] }: PieChartComponentProps) {
    // Thêm màu sắc cho từng mục dữ liệu
    const chartData = data.map((item, index) => ({
        ...item,
        fill: COLORS[index % COLORS.length],
    }));

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                Không có dữ liệu
            </div>
        );
    }

    return (
        <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px]"
        >
            <PieChart>
                <Pie 
                    data={chartData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80} 
                    label={({ name, value }) => `${name}: ${value}`}
                />
                <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                    className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
            </PieChart>
        </ChartContainer>
    )
}
