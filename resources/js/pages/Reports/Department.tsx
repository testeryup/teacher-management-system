import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
    Building2,
    Calendar,
    DollarSign,
    Users,
    BookOpen,
    Calculator,
    Download,
    Eye,
    TrendingUp,
    Award
} from 'lucide-react';

interface Teacher {
    id: number;
    fullName: string;
    degree: {
        id: number;
        name: string;
        baseSalaryFactor: number;
    };
}

interface TeacherData {
    teacher: Teacher;
    totalSalary: number;
    totalClasses: number;
    totalLessons: number;
    salaryBySemester: Record<string, {
        totalSalary: number;
        totalClasses: number;
        totalLessons: number;
    }>;
}

interface Department {
    id: number;
    name: string;
    abbrName: string;
}

interface AcademicYear {
    id: number;
    name: string;
}

interface DepartmentReportProps {
    department: Department;
    academicYear: AcademicYear;
    teachersData: TeacherData[];
    departmentTotals: {
        totalTeachers: number;
        totalSalary: number;
        totalClasses: number;
        totalLessons: number;
        averageSalaryPerTeacher: number;
    };
}

export default function DepartmentReport({
    department,
    academicYear,
    teachersData,
    departmentTotals
}: DepartmentReportProps) {

    const breadcrumbs = [
        { title: 'Tổng quan', href: '/dashboard' },
        { title: 'Báo cáo tiền dạy', href: '/reports' },
        { title: 'Báo cáo theo khoa', href: '#' }
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('vi-VN').format(num);
    };

    // Prepare chart data
    const chartData = teachersData.slice(0, 10).map(item => ({
        name: item.teacher.fullName.split(' ').slice(-2).join(' '), // Last 2 words of name
        salary: item.totalSalary,
        classes: item.totalClasses
    }));

    // Top performers
    const topTeachers = teachersData.slice(0, 5);
    const maxSalary = teachersData.length > 0 ? Math.max(...teachersData.map(t => t.totalSalary)) : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Báo cáo khoa - ${department.name}`} />

            <div className="container mx-auto px-6 py-8 space-y-8">
                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Building2 className="h-6 w-6 text-green-600" />
                                </div>
                                Báo cáo theo khoa
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Khoa {department.name} ({department.abbrName}) - Năm học {academicYear.name}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const url = `/reports/export-pdf?type=department&department_id=${department.id}&academic_year_id=${academicYear.id}`;
                                    window.open(url, '_blank');
                                }}
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                Xem trước PDF
                            </Button>
                            <Button
                                onClick={() => {
                                    const url = `/reports/export-pdf?type=department&department_id=${department.id}&academic_year_id=${academicYear.id}`;
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

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tổng giảng viên</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{departmentTotals.totalTeachers}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tổng lương</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(departmentTotals.totalSalary)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tổng lớp học</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{departmentTotals.totalClasses}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tổng tiết QĐ</CardTitle>
                            <Calculator className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{departmentTotals.totalLessons.toFixed(1)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">TB lương/GV</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(departmentTotals.averageSalaryPerTeacher)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts & Top Performers */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Salary Chart */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Top 10 giảng viên theo lương</CardTitle>
                            <CardDescription>
                                So sánh lương của các giảng viên trong khoa
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 12 }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis
                                        tickFormatter={(value) => (value / 1000000).toFixed(1) + 'M'}
                                    />
                                    <Tooltip
                                        formatter={(value: any) => [formatCurrency(value), 'Lương']}
                                    />
                                    <Bar
                                        dataKey="salary"
                                        fill="#10B981"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Top Performers */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5" />
                                Top 5 giảng viên
                            </CardTitle>
                            <CardDescription>
                                Xếp hạng theo tổng lương
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {topTeachers.map((item, index) => (
                                <div key={item.teacher.id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                    index === 1 ? 'bg-gray-100 text-gray-800' :
                                                        index === 2 ? 'bg-orange-100 text-orange-800' :
                                                            'bg-blue-100 text-blue-800'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">{item.teacher.fullName}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {item.teacher.degree.name} • {item.totalClasses} lớp
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-green-600 text-sm">
                                                {formatCurrency(item.totalSalary)}
                                            </div>
                                        </div>
                                    </div>
                                    <Progress
                                        value={(item.totalSalary / maxSalary) * 100}
                                        className="h-2"
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Teachers Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Chi tiết lương giảng viên</CardTitle>
                        <CardDescription>
                            Danh sách tất cả giảng viên có dữ liệu lương trong năm học
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>STT</TableHead>
                                        <TableHead>Giảng viên</TableHead>
                                        <TableHead>Bằng cấp</TableHead>
                                        <TableHead className="text-center">Lớp học</TableHead>
                                        <TableHead className="text-center">Tiết QĐ</TableHead>
                                        <TableHead className="text-right">Tổng lương</TableHead>
                                        <TableHead className="text-right">TB/lớp</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {teachersData.map((item, index) => (
                                        <TableRow key={item.teacher.id}>
                                            <TableCell className="font-medium">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{item.teacher.fullName}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {item.teacher.degree.name}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.totalClasses}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.totalLessons.toFixed(1)}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-green-600">
                                                {formatCurrency(item.totalSalary)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(item.totalSalary / item.totalClasses)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* No Data */}
                {teachersData.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground mb-2">
                                Chưa có dữ liệu lương
                            </h3>
                            <p className="text-muted-foreground text-center">
                                Khoa {department.name} chưa có giảng viên nào được tính lương trong năm học {academicYear.name}.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}