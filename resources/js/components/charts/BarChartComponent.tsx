"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
const defaultData = [
    { abbrName: "CNTT", teachers_count: 12 },
    { abbrName: "Kinh tế", teachers_count: 18 },
    { abbrName: "Ngôn ngữ", teachers_count: 9 },
    { abbrName: "Dược", teachers_count: 15 },
    { abbrName: "Cơ khí", teachers_count: 7 },
    { abbrName: "Hóa học", teachers_count: 11 },
]

const chartConfig = {
    teachers_count: {
        label: "Giáo viên",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

interface Department {
    abbrName: string;
    teachers_count: number;
}

interface BarChartProps {
    data?: Department[];
}
export default function BarChartComponent({data = defaultData}: BarChartProps) {
    return (
        <Card className="w-full h-full p-0 border-none shadow-none">
            {/* <CardHeader >
                <CardTitle>Phân bố giáo viên theo khoa</CardTitle>
            </CardHeader> */}
            <CardContent >
                <ChartContainer config={chartConfig} className="h-[480px] md:h-[500px] w-full">
                    <BarChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            top: 20,
                            right: 20,
                            bottom: 20,
                            left: 20
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="abbrName"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 10)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="teachers_count" fill="var(--chart-1)" radius={8}>
                            <LabelList
                                position="top"
                                offset={12}
                                className="fill-foreground"
                                fontSize={12}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
            {/* <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Showing total visitors for the last 6 months
                </div>
            </CardFooter> */}
        </Card>
    )
}
