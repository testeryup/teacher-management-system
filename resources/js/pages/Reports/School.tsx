import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { 
    School, 
    Calendar, 
    DollarSign, 
    Users,
    Building2,
    BookOpen,
    Calculator,
    Download,
    Eye,
    TrendingUp,
    Award,
    Target
} from 'lucide-react';

interface Teacher {
    id: number;
    fullName: string;
}

interface Department {
    id: number;
    name: string;
    abbrName: string;
}

interface DepartmentData {
    department: Department;
    teachersCount: number;
    totalSalary: number;
    totalClasses: number;
    totalLessons: number;
    teachers: Array<{
        teacher: Teacher;
        totalSalary: number;
        totalClasses: number;
        totalLessons: number;
    }>;
}

interface AcademicYear {
    id: number;
    name: string;
}

interface SchoolReportProps {
    academicYear: AcademicYear;
    departmentsData: DepartmentData[];
    schoolTotals: {
        totalDepartments: number;
        totalTeachers: number;
        totalSalary: number;
        totalClasses: number;
        totalLessons: number;
        averageSalaryPerTeacher: number;
        averageSalaryPerDepartment: number;
    };
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default function SchoolReport({ 
    academicYear, 
    departmentsData, 
    schoolTotals 
}: SchoolReportProps) {
    
    const breadcrumbs = [
        { title: 'Tổng quan', href: '/dashboard' },
        { title: 'Báo cáo tiền dạy', href: '/reports' },
        { title: 'Báo cáo toàn trường', href: '#' }
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

    // Prepare pie chart data
    const pieChartData = departmentsData.map((dept, index) => ({
        name: dept.department.abbrName,
        value: dept.totalSalary,
        percentage: ((dept.totalSalary / schoolTotals.totalSalary) * 100).toFixed(1),
        color: COLORS[index % COLORS.length]
    }));

    // Prepare bar chart data
    const barChartData = departmentsData.map(dept => ({
        name: dept.department.abbrName,
        salary: dept.totalSalary,
        teachers: dept.teachersCount,
        classes: dept.totalClasses
    }));

    // Top teachers across all departments
    const allTeachers = departmentsData.flatMap(dept => 
        dept.teachers.map(t => ({
            ...t,
            departmentName: dept.department.abbrName
        }))
    ).sort((a, b) => b.totalSalary - a.totalSalary).slice(0, 10);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Báo cáo toàn trường - ${academicYear.name}`} />

            <div className="container mx-auto px-6 py-8 space-y-8">
                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <School className="h-6 w-6 text-purple-600" />
                                </div>
                                Báo cáo toàn trường
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Tổng hợp lương giảng viên - Năm học {academicYear.name}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const url = `/reports/export-pdf?type=school&academic_year_id=${academicYear.id}`;
                                    window.open(url, '_blank');
                                }}
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                Xem trước PDF
                            </Button>
                            <Button
                                onClick={() => {
                                    const url = `/reports/export-pdf?type=school&academic_year_id=${academicYear.id}`;
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
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tổng khoa</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{schoolTotals.totalDepartments}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tổng GV</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{schoolTotals.totalTeachers}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tổng lương</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(schoolTotals.totalSalary)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tổng lớp</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{schoolTotals.totalClasses}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">TB/GV</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(schoolTotals.averageSalaryPerTeacher)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">TB/Khoa</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(schoolTotals.averageSalaryPerDepartment)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Pie Chart - Salary Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Phân bổ lương theo khoa</CardTitle>
                            <CardDescription>
                                Tỷ lệ chi phí lương của từng khoa
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                            
                            {/* Legend with percentages */}
                            <div className="mt-4 space-y-2">
                                {pieChartData.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div 
                                                className="w-3 h-3 rounded-full" 
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span>{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{formatCurrency(item.value)}</span>
                                            <span className="text-muted-foreground">({item.percentage}%)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bar Chart - Department Comparison */}
                    <Card>
                        <CardHeader>
                            <CardTitle>So sánh các khoa</CardTitle>
                            <CardDescription>
                                Tổng lương và số lượng giảng viên theo khoa
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={barChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis 
                                        tickFormatter={(value) => (value / 1000000).toFixed(1) + 'M'}
                                    />
                                    <Tooltip 
                                        formatter={(value: any, name: string) => {
                                            if (name === 'salary') return [formatCurrency(value), 'Tổng lương'];
                                            return [value, name === 'teachers' ? 'Giảng viên' : 'Lớp học'];
                                        }}
                                    />
                                    <Bar dataKey="salary" fill="#10B981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Teachers */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Top 10 giảng viên có lương cao nhất
                        </CardTitle>
                        <CardDescription>
                            Xếp hạng giảng viên theo tổng lương trong năm học
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">Hạng</TableHead>
                                        <TableHead>Giảng viên</TableHead>
                                        <TableHead>Khoa</TableHead>
                                        <TableHead className="text-center">Lớp học</TableHead>
                                        <TableHead className="text-center">Tiết QĐ</TableHead>
                                        <TableHead className="text-right">Tổng lương</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allTeachers.map((item, index) => (
                                        <TableRow key={item.teacher.id}>
                                            <TableCell>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                    index === 1 ? 'bg-gray-100 text-gray-800' :
                                                    index === 2 ? 'bg-orange-100 text-orange-800' :
                                                    'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {item.teacher.fullName}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {item.departmentName}
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
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Departments Detail */}
                <Card>
                    <CardHeader>
                        <CardTitle>Chi tiết theo khoa</CardTitle>
                        <CardDescription>
                            Tổng hợp thông tin lương của từng khoa
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Khoa</TableHead>
                                        <TableHead className="text-center">Giảng viên</TableHead>
                                        <TableHead className="text-center">Lớp học</TableHead>
                                        <TableHead className="text-center">Tiết QĐ</TableHead>
                                        <TableHead className="text-right">Tổng lương</TableHead>
                                        <TableHead className="text-right">TB/GV</TableHead>
                                        <TableHead className="text-center">% Tổng</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {departmentsData.map((dept) => (
                                        <TableRow key={dept.department.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{dept.department.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {dept.department.abbrName}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {dept.teachersCount}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {dept.totalClasses}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {dept.totalLessons.toFixed(1)}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-green-600">
                                                {formatCurrency(dept.totalSalary)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(dept.totalSalary / dept.teachersCount)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary">
                                                    {((dept.totalSalary / schoolTotals.totalSalary) * 100).toFixed(1)}%
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* No Data */}
                {departmentsData.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <School className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground mb-2">
                                Chưa có dữ liệu lương
                            </h3>
                            <p className="text-muted-foreground text-center">
                                Chưa có khoa nào có dữ liệu lương trong năm học {academicYear.name}.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}