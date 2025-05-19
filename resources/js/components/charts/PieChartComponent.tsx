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
const chartData = [
    { browser: "chrome", visitors: 275, fill: "var(--chart-1)" },
    { browser: "safari", visitors: 200, fill: "var(--chart-2)" },
    { browser: "firefox", visitors: 187, fill: "var(--chart-3)" },
    { browser: "edge", visitors: 173, fill: "var(--chart-4)" },
    { browser: "other", visitors: 90, fill: "var(--chart-5)" },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export function PieChartComponent() {
    return (
        <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px]"
        >
            <PieChart>
                <Pie data={chartData} dataKey="visitors" nameKey="browser" label />
                <ChartLegend
                    content={<ChartLegendContent nameKey="browser" />}
                    className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
            </PieChart>
        </ChartContainer>
    )
}
