// resources/js/pages/Teacher/Salary.tsx

import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    Filter,
    RotateCcw,
    TrendingUp,
    BookOpen,
    Calculator
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Bảng lương của tôi',
        href: '/teacher/salary',
    },
];

interface Teacher {
    id: number;
    fullName: string;
    department: {
        name: string;
        abbrName: string;
    };
    degree: {
        name: string;
        baseSalaryFactor: number;
    };
}

interface AcademicYear {
    id: number;
    name: string;
    semesters: Array<{
        id: number;
        name: string;
    }>;
}

interface Semester {
    id: number;
    name: string;
    academicYear: {
        id: number;
        name: string;
    };
}

interface SalaryRecord {
    id: number;
    total_salary: number;
    converted_lessons: number;
    actual_lessons: number;
    class_coefficient: number;
    course_coefficient: number;
    classroom: {
        name: string;
        course: {
            name: string;
            code: string;
        };
    };
    salaryConfig: {
        semester: {
            name: string;
        };
    };
}

interface SalaryData {
    [semesterName: string]: SalaryRecord[];
}

interface Props {
    teacher: Teacher;
    academicYears: AcademicYear[];
    semesters: Semester[];
    salaryData: SalaryData;
    summary: {
        totalSalary: number;
        totalClasses: number;
        totalLessons: number;
        averageSalaryPerClass: number;
    };
    filters: {
        academic_year_id?: string;
        semester_id?: string;
    };
}

export default function TeacherSalary({
    teacher,
    academicYears,
    semesters,
    salaryData,
    summary,
    filters
}: Props) {
    // FIX: Sử dụng 'all' thay vì empty string
    const [localFilters, setLocalFilters] = useState({
        academic_year_id: filters.academic_year_id || 'all',
        semester_id: filters.semester_id || 'all',
    });

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

    const formatCurrency = (amount: any) => {
        const safeAmount = safeNumber(amount);
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(safeAmount);
    };

    const formatNumber = (num: any) => {
        const safeNum = safeNumber(num);
        return new Intl.NumberFormat('vi-VN').format(safeNum);
    };

    // FIX: Safe calculation functions
    const calculateTotalSalary = (records: any[]): number => {
        if (!Array.isArray(records)) return 0;
        return records.reduce((sum, record) => {
            return sum + safeNumber(record?.total_salary);
        }, 0);
    };

    const calculateTotalLessons = (records: any[]): number => {
        if (!Array.isArray(records)) return 0;
        return records.reduce((sum, record) => {
            return sum + safeNumber(record?.converted_lessons);
        }, 0);
    };

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...localFilters, [key]: value };

        // Reset semester khi thay đổi academic year
        if (key === 'academic_year_id') {
            newFilters.semester_id = 'all';
        }

        setLocalFilters(newFilters);
    };

    const applyFilters = () => {
        // FIX: Convert 'all' back to empty string for backend
        const backendFilters = Object.fromEntries(
            Object.entries(localFilters).map(([key, value]) => [
                key,
                value === 'all' ? '' : value
            ])
        );

        router.get('/teacher/salary', backendFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        setLocalFilters({
            academic_year_id: 'all',
            semester_id: 'all',
        });
        router.get('/teacher/salary', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Filter semesters based on selected academic year
    const filteredSemesters = localFilters.academic_year_id && localFilters.academic_year_id !== 'all'
        ? semesters.filter(s => s.academicYear.id.toString() === localFilters.academic_year_id)
        : semesters;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bảng lương của tôi" />

            <div className="space-y-6 p-4">
                {/* Header */}
                {/* <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Bảng lương của tôi</h1>
                        <p className="text-muted-foreground">
                            Theo dõi lương giảng dạy của bạn theo từng học kỳ
                        </p>
                    </div>
                </div> */}

                {/* Teacher Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Thông tin giảng viên
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Họ tên:</span>
                                <span>{teacher?.fullName || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Khoa:</span>
                                <Badge variant="outline">{teacher?.department?.abbrName || 'N/A'}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Bằng cấp:</span>
                                <span>{teacher?.degree?.name || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Hệ số lương:</span>
                                <Badge variant="secondary">{safeNumber(teacher?.degree?.baseSalaryFactor)}</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Bộ lọc
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Năm học</Label>
                                <Select
                                    value={localFilters.academic_year_id}
                                    onValueChange={(value) => handleFilterChange('academic_year_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn năm học" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả năm học</SelectItem>
                                        {academicYears.map(year => (
                                            <SelectItem key={year.id} value={year.id.toString()}>
                                                {year.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Học kỳ</Label>
                                <Select
                                    value={localFilters.semester_id}
                                    onValueChange={(value) => handleFilterChange('semester_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn học kỳ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả học kỳ</SelectItem>
                                        {filteredSemesters.map(semester => (
                                            <SelectItem key={semester.id} value={semester.id.toString()}>
                                                {semester.name} ({semester.academicYear.name})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="invisible">Actions</Label>
                                <div className="flex gap-2">
                                    <Button onClick={applyFilters} className="flex-1">
                                        <Filter className="w-4 h-4 mr-2" />
                                        Lọc
                                    </Button>
                                    <Button variant="outline" onClick={resetFilters}>
                                        <RotateCcw className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Stats */}
                {(localFilters.academic_year_id !== 'all' || localFilters.semester_id !== 'all') && (
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Tổng lương
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-900">
                                    {formatCurrency(summary?.totalSalary)}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    Số lớp dạy
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-900">
                                    {formatNumber(summary?.totalClasses)}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                                    <Calculator className="h-4 w-4" />
                                    Tiết quy đổi
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-900">
                                    {safeToFixed(summary?.totalLessons)}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Lương TB/lớp
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-900">
                                    {formatCurrency(summary?.averageSalaryPerClass)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Salary Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Chi tiết lương theo học kỳ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {salaryData && Object.keys(salaryData).length > 0 ? (
                            <div className="space-y-6">
                                {Object.entries(salaryData).map(([semesterName, records]) => {
                                    // FIX: Safe calculations cho từng học kỳ
                                    const semesterTotalSalary = calculateTotalSalary(records);
                                    const semesterTotalLessons = calculateTotalLessons(records);

                                    return (
                                        <div key={semesterName} className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-semibold">{semesterName || 'N/A'}</h3>
                                                <div className="flex gap-4 text-sm text-muted-foreground">
                                                    <span>
                                                        {Array.isArray(records) ? records.length : 0} lớp •
                                                        {formatCurrency(semesterTotalSalary)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="rounded-md border">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Lớp học</TableHead>
                                                            <TableHead>Môn học</TableHead>
                                                            <TableHead className="text-center">Số tiết</TableHead>
                                                            <TableHead className="text-center">Hệ số lớp</TableHead>
                                                            <TableHead className="text-center">Hệ số môn</TableHead>
                                                            <TableHead className="text-center">Tiết quy đổi</TableHead>
                                                            <TableHead className="text-right">Lương</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {Array.isArray(records) && records.map((record) => (
                                                            <TableRow key={record?.id || Math.random()}>
                                                                <TableCell className="font-medium">
                                                                    {record?.classroom?.name || 'N/A'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div>
                                                                        <div className="font-medium">
                                                                            {record?.classroom?.course?.name || 'N/A'}
                                                                        </div>
                                                                        <div className="text-sm text-muted-foreground">
                                                                            {record?.classroom?.course?.code || 'N/A'}
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    {safeNumber(record?.actual_lessons)}
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <Badge variant={safeNumber(record?.class_coefficient) >= 0 ? "default" : "destructive"}>
                                                                        {safeNumber(record?.class_coefficient) >= 0 ? '+' : ''}{safeNumber(record?.class_coefficient)}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    {safeNumber(record?.course_coefficient)}
                                                                </TableCell>
                                                                <TableCell className="text-center font-medium">
                                                                    {safeToFixed(record?.converted_lessons)}
                                                                </TableCell>
                                                                <TableCell className="text-right font-bold text-green-600">
                                                                    {formatCurrency(record?.total_salary)}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                        <TableRow className="bg-muted/50">
                                                            <TableCell colSpan={5} className="font-bold">
                                                                Tổng {semesterName || 'N/A'}
                                                            </TableCell>
                                                            <TableCell className="text-center font-bold">
                                                                {safeToFixed(semesterTotalLessons)}
                                                            </TableCell>
                                                            <TableCell className="text-right font-bold text-green-600">
                                                                {formatCurrency(semesterTotalSalary)}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                                    Chưa có dữ liệu lương
                                </h3>
                                <p className="text-muted-foreground">
                                    {(localFilters.academic_year_id !== 'all' || localFilters.semester_id !== 'all')
                                        ? 'Không có dữ liệu lương cho kỳ học đã chọn.'
                                        : 'Vui lòng chọn năm học hoặc học kỳ để xem dữ liệu lương.'
                                    }
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}