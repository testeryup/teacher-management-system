"use client"

import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts"
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartConfig,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

interface PieChartData {
    name: string;
    value: number;
}

interface PieChartComponentProps {
    data: PieChartData[];
    showLegend?: boolean;
    showTooltip?: boolean;
    title?: string;
}

const COLORS = [
    "#3b82f6", // CNTT: xanh dương
    "#10b981", // Ngôn ngữ Anh: xanh lá
    "#f97316", // Ngôn ngữ Nhật: cam
    "#8b5cf6", // Cơ khí: tím
    "#ef4444", // Đỏ
    "#f59e0b", // Vàng
    "#6366f1", // Indigo
    "#ec4899", // Hồng
];

const chartConfig = {
    value: {
        label: "Số lượng",
    },
} satisfies ChartConfig

export function PieChartComponent({ 
    data = [], 
    showLegend = true, 
    showTooltip = true,
    title = "Biểu đồ phân bố"
}: PieChartComponentProps) {
    // Thêm màu sắc cho từng mục dữ liệu
    const chartData = data.map((item, index) => ({
        ...item,
        fill: COLORS[index % COLORS.length],
    }));

    if (data.length === 0) {
        return (
            <div className="w-full h-full p-4">
                <div className="border-b pb-2 mb-4">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                        {title}
                    </h3>
                </div>
                <div className="flex items-center justify-center h-[250px] text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                        <div className="text-sm font-medium">Không có dữ liệu</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Chưa có thông tin để hiển thị
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full p-4">
            <div className="border-b pb-2 mb-4">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                    {title}
                </h3>
            </div>
            <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[250px] w-full"
            >
                <PieChart>
                    <Pie 
                        data={chartData} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={70}
                        innerRadius={0}
                        paddingAngle={2}
                        stroke="#fff"
                        strokeWidth={1}
                    >
                        {chartData.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={entry.fill}
                            />
                        ))}
                    </Pie>
                    {showTooltip && (
                        <ChartTooltip
                            content={<ChartTooltipContent />}
                        />
                    )}
                    {showLegend && (
                        <ChartLegend
                            content={<ChartLegendContent nameKey="name" />}
                            className="flex flex-wrap justify-center gap-2 pt-4"
                        />
                    )}
                </PieChart>
            </ChartContainer>
        </div>
    )
}
