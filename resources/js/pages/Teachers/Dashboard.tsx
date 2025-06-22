// resources/js/pages/Teacher/Dashboard.tsx

import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    BookOpen, 
    DollarSign, 
    Users, 
    Calendar,
    GraduationCap,
    Building2,
    FileText,
    TrendingUp
} from 'lucide-react';
import { Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
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

interface Classroom {
    id: number;
    name: string;
    students: number;
    course: {
        id: number;
        name: string;
        code: string;
    };
    semester: {
        id: number;
        name: string;
        academicYear: {
            id: number;
            name: string;
        };
    };
}

interface SalaryData {
    [semesterName: string]: Array<{
        id: number;
        total_salary: number;
        converted_lessons: number;
        classroom: {
            name: string;
            course: {
                name: string;
            };
        };
    }>;
}

interface Props {
    teacher: Teacher;
    stats: {
        totalClasses: number;
        currentClasses: number;
        totalEarnings: number;
        currentSemester: {
            id: number;
            name: string;
            academicYear: {
                name: string;
            };
        } | null;
    };
    recentClasses: Classroom[];
    recentSalaries: SalaryData;
}

export default function TeacherDashboard({ teacher, stats, recentClasses, recentSalaries }: Props) {
    // FIX: Helper functions để xử lý số an toàn
    const safeNumber = (value: any): number => {
        if (value === null || value === undefined) return 0;
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    };

    const formatCurrency = (amount: number) => {
        const safeAmount = safeNumber(amount);
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(safeAmount);
    };

    const formatNumber = (num: number) => {
        const safeNum = safeNumber(num);
        return new Intl.NumberFormat('vi-VN').format(safeNum);
    };

    // FIX: Safe calculation functions
    const calculateTotalSalary = (salaries: any[]): number => {
        if (!Array.isArray(salaries)) return 0;
        return salaries.reduce((sum, salary) => {
            return sum + safeNumber(salary?.total_salary);
        }, 0);
    };

    const calculateTotalLessons = (salaries: any[]): number => {
        if (!Array.isArray(salaries)) return 0;
        return salaries.reduce((sum, salary) => {
            return sum + safeNumber(salary?.converted_lessons);
        }, 0);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - Giảng viên" />
            
            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Chào mừng, {teacher?.fullName || 'N/A'}
                        </h1>
                        <p className="text-muted-foreground">
                            {teacher?.department?.name || 'N/A'} • {teacher?.degree?.name || 'N/A'}
                        </p>
                    </div>
                    
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href="/teacher/classrooms">
                                <BookOpen className="w-4 h-4 mr-2" />
                                Lớp học của tôi
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/teacher/salary">
                                <DollarSign className="w-4 h-4 mr-2" />
                                Xem lương
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-700">
                                Tổng lớp đã dạy
                            </CardTitle>
                            <BookOpen className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900">
                                {formatNumber(stats?.totalClasses || 0)}
                            </div>
                            <p className="text-xs text-blue-600 mt-1">
                                Tất cả các lớp học
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-700">
                                Lớp hiện tại
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">
                                {formatNumber(stats?.currentClasses || 0)}
                            </div>
                            <p className="text-xs text-green-600 mt-1">
                                {stats?.currentSemester?.name || 'Chưa có học kỳ'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-purple-700">
                                Tổng thu nhập
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900">
                                {formatCurrency(stats?.totalEarnings || 0)}
                            </div>
                            <p className="text-xs text-purple-600 mt-1">
                                Tổng lương đã nhận
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-orange-700">
                                Hệ số lương
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-900">
                                {safeNumber(teacher?.degree?.baseSalaryFactor)}
                            </div>
                            <p className="text-xs text-orange-600 mt-1">
                                Theo bằng cấp
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Teacher Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Thông tin cá nhân
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Khoa:</span>
                                    <Badge variant="outline">{teacher?.department?.abbrName || 'N/A'}</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Bằng cấp:</span>
                                    <span>{teacher?.degree?.name || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Email:</span>
                                    <span className="text-blue-600">{teacher?.email || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Ngày sinh:</span>
                                    <span>
                                        {teacher?.DOB 
                                            ? new Date(teacher.DOB).toLocaleDateString('vi-VN')
                                            : 'N/A'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Recent Classes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Lớp học gần đây
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentClasses && recentClasses.length > 0 ? (
                                <div className="space-y-3">
                                    {recentClasses.map((classroom) => (
                                        <div key={classroom?.id || Math.random()} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{classroom?.name || 'N/A'}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {classroom?.course?.name || 'N/A'} • {classroom?.students || 0} sinh viên
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {classroom?.semester?.name || 'N/A'} - {classroom?.semester?.academicYear?.name || 'N/A'}
                                                </p>
                                            </div>
                                            <Badge variant="secondary">
                                                {classroom?.course?.code || 'N/A'}
                                            </Badge>
                                        </div>
                                    ))}
                                    <div className="pt-3">
                                        <Button asChild variant="outline" className="w-full">
                                            <Link href="/teacher/classrooms">
                                                Xem tất cả lớp học
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                    <p>Chưa có lớp học nào</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Salaries */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Lương gần đây
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentSalaries && Object.keys(recentSalaries).length > 0 ? (
                                <div className="space-y-4">
                                    {Object.entries(recentSalaries).slice(0, 3).map(([semesterName, salaries]) => {
                                        // FIX: Safe calculations
                                        const totalSalary = calculateTotalSalary(salaries);
                                        const totalLessons = calculateTotalLessons(salaries);
                                        const classCount = Array.isArray(salaries) ? salaries.length : 0;

                                        return (
                                            <div key={semesterName} className="border rounded-lg p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium">{semesterName || 'N/A'}</h4>
                                                    <Badge variant="outline">
                                                        {classCount} lớp
                                                    </Badge>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span>Tổng lương:</span>
                                                        <span className="font-medium text-green-600">
                                                            {formatCurrency(totalSalary)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm text-muted-foreground">
                                                        <span>Tiết quy đổi:</span>
                                                        <span>
                                                            {totalLessons.toFixed(1)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div className="pt-3">
                                        <Button asChild variant="outline" className="w-full">
                                            <Link href="/teacher/salary">
                                                Xem chi tiết lương
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                    <p>Chưa có dữ liệu lương</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}