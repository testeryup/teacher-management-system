import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { BreadcrumbItem } from '@/types';
import {
    FileText,
    Users,
    DollarSign,
    BookOpen,
    Calculator
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Eye, Download } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tính lương giáo viên',
        href: '/salary',
    },
    {
        title: 'Báo cáo lương',
        href: '#',
    },
];

interface Props {
    salaryConfig: {
        id: number;
        semester: {
            name: string;
            academicYear: {
                name: string;
            };
        };
        base_salary_per_lesson: number;
        status: string;
    };
    salaryReport: Record<string, {
        teacher: {
            id: number;
            fullName: string;
            department: {
                name: string;
                abbrName: string;
            };
        };
        classes: Array<{
            id: number;
            classroom: {
                name: string;
                course: {
                    name: string;
                    code: string;
                };
            };
            actual_lessons: number;
            class_coefficient: number;
            course_coefficient: number;
            teacher_coefficient: number;
            converted_lessons: number;
            total_salary: number;
        }>;
        total_salary: number;
        total_classes: number;
        total_lessons: number;
    }>;
}

// Helper functions
const safeToFixed = (value: any, decimals: number = 2): string => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
};

const safeCurrency = (value: any): string => {
    const num = parseFloat(value);
    return isNaN(num) ? '0 ₫' : new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(num);
};

const safeNumber = (value: any): number => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
};

export default function SalaryReport({ salaryConfig, salaryReport }: Props) {
    // Tính tổng thống kê
    const totalStats = Object.values(salaryReport).reduce((acc, teacherData) => {
        return {
            totalTeachers: acc.totalTeachers + 1,
            totalClasses: acc.totalClasses + teacherData.total_classes,
            totalLessons: acc.totalLessons + safeNumber(teacherData.total_lessons),
            totalSalary: acc.totalSalary + safeNumber(teacherData.total_salary)
        };
    }, { totalTeachers: 0, totalClasses: 0, totalLessons: 0, totalSalary: 0 });

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: { label: 'Bản nháp', className: 'bg-gray-100 text-gray-800' },
            active: { label: 'Đã tính', className: 'bg-green-100 text-green-800' },
            closed: { label: 'Đã đóng', className: 'bg-red-100 text-red-800' }
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        return (
            <Badge className={config.className}>
                {config.label}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Báo cáo lương - ${salaryConfig.semester.name}`} />

            <div className="container mx-auto px-6 py-8 space-y-8">
                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <FileText className="h-6 w-6 text-green-600" />
                                </div>
                                Báo cáo lương giảng viên
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                {salaryConfig.semester?.name || 'NA'} - {salaryConfig.semester?.academicYear.name || 'NA'}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <div className="text-right">
                                {getStatusBadge(salaryConfig.status)}
                                <p className="text-sm text-muted-foreground mt-1">
                                    Tiền/tiết: {safeCurrency(salaryConfig.base_salary_per_lesson)}
                                </p>
                            </div>

                            {/* Export buttons */}
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(route('salary.preview-pdf', salaryConfig.id), '_blank')}
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Xem trước PDF
                                </Button>
                                <Button
                                    onClick={() => window.location.href = route('salary.export-pdf', salaryConfig.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Tải PDF
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Tổng giảng viên</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalStats.totalTeachers}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Tổng lớp học</CardTitle>
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalStats.totalClasses}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Tổng tiết quy đổi</CardTitle>
                                <Calculator className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{safeToFixed(totalStats.totalLessons, 1)}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Tổng lương</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {safeCurrency(totalStats.totalSalary)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Teacher Reports */}
                <div className="space-y-6">
                    {Object.entries(salaryReport).map(([teacherId, teacherData]) => (
                        <Card key={teacherId}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl">
                                            {teacherData.teacher.fullName}
                                        </CardTitle>
                                        <CardDescription>
                                            {teacherData.teacher.department.name} ({teacherData.teacher.department.abbrName})
                                        </CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-green-600">
                                            {safeCurrency(teacherData.total_salary)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {teacherData.total_classes} lớp • {safeToFixed(teacherData.total_lessons, 1)} tiết
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Lớp học</TableHead>
                                                <TableHead>Môn học</TableHead>
                                                <TableHead className="text-center">Tiết TT</TableHead>
                                                <TableHead className="text-center">HS Lớp</TableHead>
                                                <TableHead className="text-center">HS Môn</TableHead>
                                                <TableHead className="text-center">HS GV</TableHead>
                                                <TableHead className="text-center">Tiết QĐ</TableHead>
                                                <TableHead className="text-right">Lương</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {teacherData.classes.map((classItem) => (
                                                <TableRow key={classItem.id}>
                                                    <TableCell className="font-medium">
                                                        {classItem.classroom?.name || 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">
                                                                {classItem.classroom?.course?.name || 'N/A'}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {classItem.classroom?.course?.code || ''}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {classItem.actual_lessons || 0}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className={`font-medium ${safeNumber(classItem.class_coefficient) >= 0
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                            }`}>
                                                            {safeToFixed(classItem.class_coefficient, 1)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {safeToFixed(classItem.course_coefficient, 1)}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {safeToFixed(classItem.teacher_coefficient, 1)}
                                                    </TableCell>
                                                    <TableCell className="text-center font-medium">
                                                        {safeToFixed(classItem.converted_lessons, 2)}
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono font-medium">
                                                        {safeCurrency(classItem.total_salary)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty state */}
                {Object.keys(salaryReport).length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground mb-2">
                                Chưa có dữ liệu lương
                            </h3>
                            <p className="text-muted-foreground text-center">
                                Chưa có lớp học nào được tính lương trong học kỳ này.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}