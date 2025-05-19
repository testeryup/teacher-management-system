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
    { department: "CNTT", employees: 12 },
    { department: "Kinh tế", employees: 18 },
    { department: "Ngôn ngữ", employees: 9 },
    { department: "Dược", employees: 15 },
    { department: "Cơ khí", employees: 7 },
    { department: "Hóa học", employees: 11 },
]

const chartConfig = {
    employees: {
        label: "Giáo viên",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

interface DepartmentData {
    department: string;
    employees: number;
}

interface BarChartProps {
    data?: DepartmentData[];
}
export default function BarChartComponent({data = defaultData}: BarChartProps) {
    return (
        <Card className="w-full h-full">
            <CardHeader >
                <CardTitle>Số lượng giảng viên theo khoa</CardTitle>
                {/* <CardDescription>January - June 2024</CardDescription> */}
            </CardHeader>
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
                            dataKey="department"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 10)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="employees" fill="var(--chart-1)" radius={8}>
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
