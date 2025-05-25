"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts"

import {
    Card,
    CardContent,
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
    title?: string;
    color?: string;
}
export default function BarChartComponent({
    data = defaultData, 
    title = "Số lượng giảng viên theo khoa", 
    color = "#4e73df"
}: BarChartProps) {
    
    if (!data || data.length === 0) {
        return (
            <Card className="w-full h-full">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                            <div className="text-sm font-medium">Không có dữ liệu</div>
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Chưa có thông tin để hiển thị
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full h-full">
            <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-200">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <BarChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            top: 30,
                            right: 20,
                            bottom: 20,
                            left: 20
                        }}
                    >
                        <CartesianGrid 
                            vertical={false} 
                            strokeDasharray="3 3"
                            stroke="#e0e7ff"
                            opacity={0.7}
                        />
                        <XAxis
                            dataKey="department"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            tickFormatter={(value) => value.length > 8 ? value.slice(0, 8) + '...' : value}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            tickMargin={10}
                        />
                        <ChartTooltip
                            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                                            <div className="font-medium text-sm mb-1">
                                                {label}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Số lượng: <span className="font-medium text-foreground">{payload[0].value}</span> giáo viên
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar 
                            dataKey="employees" 
                            fill={color} 
                            radius={[4, 4, 0, 0]}
                            stroke={color}
                            strokeWidth={0}
                        >
                            <LabelList
                                position="top"
                                offset={8}
                                className="fill-gray-600 dark:fill-gray-300"
                                fontSize={11}
                                fontWeight={500}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
