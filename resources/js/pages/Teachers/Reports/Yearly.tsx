// resources/js/pages/Teacher/Reports/Yearly.tsx

import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { 
    DollarSign, 
    Users, 
    Building2,
    GraduationCap,
    BookOpen,
    Calculator,
    TrendingUp,
    Calendar,
    Download,
    Eye,
    ArrowLeft
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Báo cáo lương',
        href: '/teacher/reports',
    },
    {
        title: 'Báo cáo năm học',
        href: '#',
    },
];

interface Teacher {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    DOB: string;
    department: {
        id: number;
        name: string;
        abbrName: string;
    };
    degree: {
        id: number;
        name: string;
        baseSalaryFactor: number;
    };
}

interface AcademicYear {
    id: number;
    name: string;
}

interface SalaryRecord {
    id: number;
    total_salary: number;
    converted_lessons: number;
    actual_lessons: number;
    class_coefficient: number;
    course_coefficient: number;
    teacher_coefficient: number;
    classroom: {
        name: string;
        course: {
            name: string;
            code: string;
        };
    };
}

interface SalaryData {
    [semesterName: string]: SalaryRecord[];
}

interface Props {
    teacher: Teacher;
    academicYear: AcademicYear;
    salaryData: SalaryData;
    summary: {
        totalSalary: number;
        totalClasses: number;
        totalLessons: number;
        averageSalaryPerClass: number;
    };
}

export default function TeacherYearlyReport({ teacher, academicYear, salaryData, summary }: Props) {
    // Helper functions
    const safeNumber = (value: any): number => {
        if (value === null || value === undefined) return 0;
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    };

    const safeToFixed = (value: any, decimals: number = 1): string => {
        const num = safeNumber(value);
        return num.toFixed(decimals);
    };

    const formatCurrency = (amount: any): string => {
        const num = safeNumber(amount);
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(num);
    };

    const formatNumber = (num: any): string => {
        const number = safeNumber(num);
        return new Intl.NumberFormat('vi-VN').format(number);
    };

    // Safe summary
    const safeSummary = {
        totalSalary: safeNumber(summary?.totalSalary),
        totalClasses: safeNumber(summary?.totalClasses),
        totalLessons: safeNumber(summary?.totalLessons),
        averageSalaryPerClass: safeNumber(summary?.averageSalaryPerClass)
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Báo cáo lương ${academicYear?.name || 'N/A'} - ${teacher?.fullName || 'N/A'}`} />
            
            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Button asChild variant="outline" size="sm">
                                <Link href="/teacher/reports">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Quay lại
                                </Link>
                            </Button>
                            {/* <h1 className="text-3xl font-bold tracking-tight">
                                Báo cáo lương {academicYear?.name || 'N/A'}
                            </h1> */}
                        </div>
                        <p className="font-medium text-lg">
                            Báo cáo lương {academicYear?.name || 'N/A'}
                        </p>
                    </div>
                    
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                const url = `/teacher/reports/${academicYear?.id}/pdf`;
                                window.open(url, '_blank');
                            }}
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            Xem trước PDF
                        </Button>
                        <Button
                            onClick={() => {
                                const url = `/teacher/reports/${academicYear?.id}/pdf`;
                                window.location.href = url;
                            }}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Tải PDF
                        </Button>
                    </div>
                </div>

                {/* Teacher Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Thông tin giảng viên
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground">Thông tin cơ bản</div>
                                    <div className="space-y-1">
                                        <div><strong>Họ tên:</strong> {teacher?.fullName || 'N/A'}</div>
                                        <div><strong>Email:</strong> {teacher?.email || 'N/A'}</div>
                                        <div><strong>Điện thoại:</strong> {teacher?.phone || 'N/A'}</div>
                                        <div><strong>Ngày sinh:</strong> {teacher?.DOB ? new Date(teacher.DOB).toLocaleDateString('vi-VN') : 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground">Khoa và bằng cấp</div>
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <span><strong>Khoa:</strong> {teacher?.department?.name || 'N/A'}</span>
                                        <Badge variant="outline">{teacher?.department?.abbrName || 'N/A'}</Badge>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                        <span><strong>Bằng cấp:</strong> {teacher?.degree?.name || 'N/A'}</span>
                                        <Badge variant="secondary">HS: {safeNumber(teacher?.degree?.baseSalaryFactor)}</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-700">Tổng lương</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">
                                {formatCurrency(safeSummary.totalSalary)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-700">Tổng lớp học</CardTitle>
                            <BookOpen className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900">{formatNumber(safeSummary.totalClasses)}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-purple-700">Tổng tiết quy đổi</CardTitle>
                            <Calculator className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900">{safeToFixed(safeSummary.totalLessons)}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-orange-700">TB lương/lớp</CardTitle>
                            <TrendingUp className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-900">
                                {formatCurrency(safeSummary.averageSalaryPerClass)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Semester Details */}
                <div className="space-y-6">
                    {Object.entries(salaryData || {}).map(([semesterName, semesterSalaries]) => {
                        const semesterTotal = (semesterSalaries || []).reduce((sum, salary) => {
                            return sum + safeNumber(salary?.total_salary);
                        }, 0);
                        
                        const semesterClasses = (semesterSalaries || []).length;
                        const semesterLessons = (semesterSalaries || []).reduce((sum, salary) => {
                            return sum + safeNumber(salary?.converted_lessons);
                        }, 0);

                        return (
                            <Card key={semesterName}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xl flex items-center gap-2">
                                                <Calendar className="h-5 w-5" />
                                                {semesterName || 'N/A'}
                                            </CardTitle>
                                            <CardDescription>
                                                {semesterClasses} lớp học • {safeToFixed(semesterLessons)} tiết quy đổi • {formatCurrency(semesterTotal)}
                                            </CardDescription>
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
                                                    <TableHead className="text-center">Số tiết</TableHead>
                                                    <TableHead className="text-center">HS Lớp</TableHead>
                                                    <TableHead className="text-center">HS Môn</TableHead>
                                                    <TableHead className="text-center">HS GV</TableHead>
                                                    <TableHead className="text-center">Tiết QĐ</TableHead>
                                                    <TableHead className="text-right">Lương</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {Array.isArray(semesterSalaries) && semesterSalaries.map((salary) => (
                                                    <TableRow key={salary?.id || Math.random()}>
                                                        <TableCell className="font-medium">
                                                            {salary?.classroom?.name || 'N/A'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium">
                                                                    {salary?.classroom?.course?.name || 'N/A'}
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {salary?.classroom?.course?.code || 'N/A'}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {safeNumber(salary?.actual_lessons)}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge variant={safeNumber(salary?.class_coefficient) >= 0 ? "default" : "destructive"}>
                                                                {safeNumber(salary?.class_coefficient) >= 0 ? '+' : ''}{safeNumber(salary?.class_coefficient)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            +{safeNumber(salary?.course_coefficient)}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            +{safeNumber(salary?.teacher_coefficient)}
                                                        </TableCell>
                                                        <TableCell className="text-center font-medium">
                                                            {safeToFixed(salary?.converted_lessons)}
                                                        </TableCell>
                                                        <TableCell className="text-right font-bold text-green-600">
                                                            {formatCurrency(salary?.total_salary)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow className="bg-muted/50">
                                                    <TableCell colSpan={6} className="font-bold">
                                                        Tổng {semesterName || 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="text-center font-bold">
                                                        {safeToFixed(semesterLessons)}
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-green-600">
                                                        {formatCurrency(semesterTotal)}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* No Data State */}
                {(!salaryData || Object.keys(salaryData).length === 0) && (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                                    Chưa có dữ liệu lương
                                </h3>
                                <p className="text-muted-foreground text-center">
                                    Giảng viên này chưa có lớp học nào được tính lương trong năm học {academicYear?.name || 'N/A'}.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}