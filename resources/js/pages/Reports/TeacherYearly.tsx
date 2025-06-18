// resources/js/pages/Reports/TeacherYearly.tsx

import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { 
    User, 
    Calendar, 
    DollarSign, 
    BookOpen, 
    Calculator,
    Download,
    Eye,
    Building2,
    GraduationCap,
    TrendingUp
} from 'lucide-react';

interface Classroom {
    id: number;
    name: string;
    course: {
        id: number;
        name: string;
        code: string;
        credits: number;
        lessons: number;
        course_coefficient: number;
    };
}

interface SalaryData {
    id: number;
    actual_lessons: number;
    class_coefficient: number;
    course_coefficient: number;
    teacher_coefficient: number;
    converted_lessons: number;
    total_salary: number;
    classroom: Classroom;
}

interface Teacher {
    id: number;
    fullName: string;
    email: string;
    phone: string;
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

interface TeacherYearlyProps {
    teacher: Teacher;
    academicYear: AcademicYear;
    salaryData: Record<string, SalaryData[]>;
    summary: {
        totalSalary: number;
        totalClasses: number;
        totalLessons: number;
        averageSalaryPerClass: number;
    };
}

export default function TeacherYearly({ 
    teacher, 
    academicYear, 
    salaryData, 
    summary 
}: TeacherYearlyProps) {
    
    const breadcrumbs = [
        { title: 'Tổng quan', href: '/dashboard' },
        { title: 'Báo cáo tiền dạy', href: '/reports' },
        { title: 'Báo cáo cá nhân', href: '#' }
    ];

    // FIX: Helper functions để xử lý số an toàn
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

    // FIX: Safe summary với fallback values
    const safeSummary = {
        totalSalary: safeNumber(summary?.totalSalary),
        totalClasses: safeNumber(summary?.totalClasses),
        totalLessons: safeNumber(summary?.totalLessons),
        averageSalaryPerClass: safeNumber(summary?.averageSalaryPerClass)
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Báo cáo cá nhân - ${teacher?.fullName || 'N/A'}`} />

            <div className="container mx-auto px-6 py-8 space-y-8">
                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <User className="h-6 w-6 text-blue-600" />
                                </div>
                                Báo cáo cá nhân giảng viên
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                {teacher?.fullName || 'N/A'} - Năm học {academicYear?.name || 'N/A'}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const url = `/reports/export-pdf?type=teacher&teacher_id=${teacher?.id}&academic_year_id=${academicYear?.id}`;
                                    window.open(url, '_blank');
                                }}
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                Xem trước PDF
                            </Button>
                            <Button
                                onClick={() => {
                                    const url = `/reports/export-pdf?type=teacher&teacher_id=${teacher?.id}&academic_year_id=${academicYear?.id}`;
                                    window.location.href = url;
                                }}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Tải PDF
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Teacher Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Thông tin giảng viên
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Họ tên</div>
                                <div className="text-lg font-semibold">{teacher?.fullName || 'N/A'}</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Khoa</div>
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <span>{teacher?.department?.name || 'N/A'}</span>
                                    <Badge variant="outline">{teacher?.department?.abbrName || 'N/A'}</Badge>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Bằng cấp</div>
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                    <span>{teacher?.degree?.name || 'N/A'}</span>
                                    <Badge variant="secondary">HS: {safeNumber(teacher?.degree?.baseSalaryFactor)}</Badge>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Liên hệ</div>
                                <div className="space-y-1 text-sm">
                                    <div>{teacher?.email || 'N/A'}</div>
                                    <div>{teacher?.phone || 'N/A'}</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tổng lương</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(safeSummary.totalSalary)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tổng lớp học</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{safeSummary.totalClasses}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tổng tiết quy đổi</CardTitle>
                            <Calculator className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{safeToFixed(safeSummary.totalLessons)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">TB lương/lớp</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(safeSummary.averageSalaryPerClass)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Semester Details */}
                <div className="space-y-6">
                    {Object.entries(salaryData || {}).map(([semesterName, semesterSalaries]) => {
                        // FIX: Tính toán an toàn cho từng học kỳ
                        const semesterTotal = (semesterSalaries || []).reduce((sum, salary) => {
                            return sum + safeNumber(salary?.total_salary);
                        }, 0);
                        
                        const semesterClasses = (semesterSalaries || []).length;
                        
                        // FIX: Tính toán semesterLessons an toàn
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
                                                {semesterClasses} lớp học • {safeToFixed(semesterLessons)} tiết quy đổi
                                            </CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-green-600">
                                                {formatCurrency(semesterTotal)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                TB: {semesterClasses > 0 ? formatCurrency(semesterTotal / semesterClasses) : formatCurrency(0)}
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
                                                {(semesterSalaries || []).map((salary) => (
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
                                                                    {salary?.classroom?.course?.code || 'N/A'} • {safeNumber(salary?.classroom?.course?.credits)} TC
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
                                                            <Badge variant="outline">
                                                                +{safeNumber(salary?.course_coefficient)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge variant="secondary">
                                                                +{safeNumber(salary?.teacher_coefficient)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center font-medium">
                                                            {safeToFixed(salary?.converted_lessons)}
                                                        </TableCell>
                                                        <TableCell className="text-right font-bold text-green-600">
                                                            {formatCurrency(salary?.total_salary)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* No Data */}
                {(!salaryData || Object.keys(salaryData).length === 0) && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <User className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground mb-2">
                                Chưa có dữ liệu lương
                            </h3>
                            <p className="text-muted-foreground text-center">
                                Giảng viên này chưa có lớp học nào được tính lương trong năm học {academicYear?.name || 'N/A'}.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}