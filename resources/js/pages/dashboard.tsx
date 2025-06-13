import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { PieChartComponent } from "@/components/charts/PieChartComponent"
import BarChartComponent from "@/components/charts/BarChartComponent";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    GraduationCap,
    Building2,
    TrendingUp,
    BookOpen,
    Award,
    BarChart3,
    PieChart,
    CalendarRange
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Department {
    abbrName: string;
    teachers_count: number;
}

interface TeacherDegree {
    id: number;
    name: string;
    teachers_count: number;
}

interface ViewTeacherDegreesProps {
    teacherDegrees: TeacherDegree[];
}

interface InputProps {
    departments: Department[];
    teacherDegrees: TeacherDegree[];
}

function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    color = "blue"
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    trend?: string;
    color?: "blue" | "green" | "purple" | "orange";
}) {
    const colorClasses = {
        blue: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300",
        green: "bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300",
        purple: "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-300",
        orange: "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-300"
    };

    return (
        <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <div className="flex items-baseline space-x-2">
                            <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
                            {trend && (
                                <Badge variant="secondary" className="text-xs">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    {trend}
                                </Badge>
                            )}
                        </div>
                        {subtitle && (
                            <p className="text-xs text-muted-foreground">{subtitle}</p>
                        )}
                    </div>
                    <div className={`p-3 rounded-full ${colorClasses[color]}`}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function ViewTeacherDegrees({ teacherDegrees }: ViewTeacherDegreesProps) {
    return (
        <Card className="text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm h-full bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-lg">Phân bố theo bằng cấp</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {teacherDegrees.map((degree, index) => (
                    <div
                        key={degree.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 transition-colors hover:bg-muted"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                            <span className="font-medium text-sm">{degree.name}</span>
                        </div>
                        <Badge variant="outline" className="font-semibold">
                            {degree.teachers_count}
                        </Badge>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

function ViewTeacherCount({ teacherDegrees }: ViewTeacherDegreesProps) {
    const teacherCount = teacherDegrees.reduce((acc, degree) => acc + degree.teachers_count, 0);

    return (
        <Card className="h-full bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
            <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="p-4 bg-green-100 dark:bg-green-900 rounded-full">
                    <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-2">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        Tổng số giáo viên
                    </p>
                    <p className="text-4xl font-bold text-green-800 dark:text-green-200">
                        {teacherCount}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                        Đang hoạt động
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

function DepartmentStats({ departments }: { departments: Department[] }) {
    const totalDepartments = departments.length;
    const avgTeachersPerDept = departments.length > 0
        ? Math.round(departments.reduce((acc, dept) => acc + dept.teachers_count, 0) / departments.length)
        : 0;

    return (
        <Card className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6 space-y-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200">Thống kê khoa</h3>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-600 dark:text-blue-400">Tổng số khoa:</span>
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {totalDepartments}
                        </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-600 dark:text-blue-400">TB giáo viên/khoa:</span>
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {avgTeachersPerDept}
                        </Badge>
                    </div>
                </div>

                <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-500 dark:text-blue-400 text-center">
                        Dữ liệu cập nhật: {new Date().toLocaleDateString('vi-VN')}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

export default function Dashboard({ departments, teacherDegrees }: InputProps) {
    const totalTeachers = teacherDegrees.reduce((acc, degree) => acc + degree.teachers_count, 0);
    const totalDepartments = departments.length;
    const totalDegreeTypes = teacherDegrees.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tổng quan" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header Section */}
                {/* <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Tổng quan hệ thống quản lý giáo viên
                    </p>
                </div> */}

                {/* Stats Cards Row */}
                {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Tổng giáo viên"
                        value={totalTeachers}
                        subtitle="Đang hoạt động"
                        icon={Users}
                        trend="+12%"
                        color="green"
                    />
                    <StatCard
                        title="Số khoa"
                        value={totalDepartments}
                        subtitle="Khoa/Viện"
                        icon={Building2}
                        color="blue"
                    />
                    <StatCard
                        title="Loại bằng cấp"
                        value={totalDegreeTypes}
                        subtitle="Phân loại"
                        icon={GraduationCap}
                        color="purple"
                    />
                    <StatCard
                        title="TB giáo viên/khoa"
                        value={Math.round(totalTeachers / totalDepartments)}
                        subtitle="Trung bình"
                        icon={BarChart3}
                        trend="+5%"
                        color="orange"
                    />
                </div> */}

                {/* Charts Section */}
                <div className="grid gap-6 md:grid-cols-3">
                    <ViewTeacherCount teacherDegrees={teacherDegrees} />
                    <ViewTeacherDegrees teacherDegrees={teacherDegrees} />
                    <DepartmentStats departments={departments} />
                </div>

                {/* Main Chart Section */}
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card className="h-full">
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <BarChart3 className="h-5 w-5 text-chart-1" />
                                    <CardTitle>Phân bố giáo viên theo khoa</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <BarChartComponent data={departments} />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* <Card>
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <PieChart className="h-5 w-5 text-chart-2" />
                                    <CardTitle className="text-lg">Biểu đồ tỷ lệ</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <PieChartComponent />
                            </CardContent>
                        </Card> */}

                        <Card>
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <BookOpen className="h-5 w-5 text-chart-3" />
                                    <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center space-x-3 text-sm">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Thêm mới 3 giáo viên</span>
                                    <span className="text-muted-foreground text-xs ml-auto">2h trước</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Cập nhật thông tin khoa CNTT</span>
                                    <span className="text-muted-foreground text-xs ml-auto">4h trước</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <span>Thêm lớp học mới</span>
                                    <span className="text-muted-foreground text-xs ml-auto">1d trước</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <CalendarRange className="h-5 w-5 text-chart-3" />
                                    <CardTitle className="text-lg">Hoạt động sắp tới</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center space-x-3 text-sm">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Tổ chức khai giảng năm học mới</span>
                                    <span className="text-muted-foreground text-xs ml-auto">13/06/2025</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Tổ chức team-building cho giáo viên</span>
                                    <span className="text-muted-foreground text-xs ml-auto">15/06/2025</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <span>Thành lập khoa chính trị</span>
                                    <span className="text-muted-foreground text-xs ml-auto">17/06/2025</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}