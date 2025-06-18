import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    Users,
    GraduationCap,
    BookOpen,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Building2,
    Calendar,
    Award,
    Target,
    Activity,
    BarChart3,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle
} from 'lucide-react';
import { Line, LineChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart as RechartsPieChart, Cell, Area, AreaChart, Pie } from 'recharts';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';

interface DashboardProps {
    userRole: 'admin' | 'department_head' | 'teacher';
    stats: {
        totalTeachers: number;
        totalDepartments: number;
        totalCourses: number;
        totalClassrooms: number;
        activeSemesters: number;
        avgTeachersPerDept: number;
    };
    teachersByDepartment: Array<{
        name: string;
        abbrName: string;
        teachers_count: number;
        color: string;
    }>;
    teachersByDegree: Array<{
        id: number;
        name: string;
        teachers_count: number;
        baseSalaryFactor: number;
        percentage: number;
    }>;
    salaryStats: {
        totalPaidSalary: number;
        averageSalaryPerTeacher: number;
        highestSalary: number;
        totalSalaryConfigs: number;
        activeSalaryConfigs: number;
        closedSalaryConfigs: number;
        currentYearSalary: number;
    };
    recentActivities: Array<{
        type: string;
        title: string;
        subtitle: string;
        time: string;
        icon: string;
        color: string;
    }>;
    monthlyTrends: Array<{
        month: string;
        teachers: number;
        classrooms: number;
        salary: number;
    }>;
    classroomStats: {
        totalClassrooms: number;
        classroomsWithTeacher: number;
        classroomsWithoutTeacher: number;
        averageStudentsPerClass: number;
        totalStudents: number;
        largestClass: number;
        smallestClass: number;
        classesBySize: {
            small: number;
            medium: number;
            large: number;
        };
    };
    performanceMetrics: {
        teachersGrowth: number;
        classroomsGrowth: number;
        salaryGrowth: number;
    };
    departmentInfo?: {
        id: number;
        name: string;
        abbrName: string;
    };
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export default function Dashboard({
    userRole,
    stats,
    teachersByDepartment,
    teachersByDegree,
    salaryStats,
    recentActivities,
    monthlyTrends,
    classroomStats,
    performanceMetrics,
    departmentInfo
}: DashboardProps) {

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('vi-VN').format(num);
    };

    const getGrowthIcon = (growth: number) => {
        if (growth > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
        if (growth < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
        return <div className="h-4 w-4" />;
    };

    const getActivityIcon = (iconName: string) => {
        const icons: Record<string, any> = {
            'user-plus': Users,
            'book-open': BookOpen,
            'dollar-sign': DollarSign,
        };
        const IconComponent = icons[iconName] || Activity;
        return <IconComponent className="h-4 w-4" />;
    };

    // Calculate percentages for degree pie chart
    const totalTeachersByDegree = teachersByDegree.reduce((sum, degree) => sum + degree.teachers_count, 0);
    const degreeData = teachersByDegree.map(degree => ({
        ...degree,
        percentage: totalTeachersByDegree > 0 ? ((degree.teachers_count / totalTeachersByDegree) * 100).toFixed(1) : 0
    }));

    return (
        <AppLayout breadcrumbs={[{ title: 'Tổng quan', href: '/dashboard' }]}>
            <Head title="Tổng quan" />

            <div className="flex-1 space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {userRole === 'admin' ? 'Tổng quan hệ thống' :
                                userRole === 'department_head' ? `Tổng quan khoa ${departmentInfo?.name}` :
                                    'Tổng quan cá nhân'}
                        </h1>
                        <p className="text-muted-foreground">
                            Quản lý và theo dõi hiệu suất hệ thống
                        </p>
                    </div>
                    <Badge variant="outline" className="px-3 py-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date().toLocaleDateString('vi-VN')}
                    </Badge>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-700">
                                Tổng giáo viên
                            </CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900">{formatNumber(stats.totalTeachers)}</div>
                            <div className="flex items-center text-xs text-blue-600 mt-1">
                                {getGrowthIcon(performanceMetrics.teachersGrowth)}
                                <span className="ml-1">
                                    {performanceMetrics.teachersGrowth > 0 ? '+' : ''}{performanceMetrics.teachersGrowth}% so với tháng trước
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-700">
                                Tổng lớp học
                            </CardTitle>
                            <BookOpen className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">{formatNumber(stats.totalClassrooms)}</div>
                            <div className="flex items-center text-xs text-green-600 mt-1">
                                {getGrowthIcon(performanceMetrics.classroomsGrowth)}
                                <span className="ml-1">
                                    {performanceMetrics.classroomsGrowth > 0 ? '+' : ''}{performanceMetrics.classroomsGrowth}% so với tháng trước
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-purple-700">
                                Tổng lương đã trả
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900">
                                {formatCurrency(salaryStats.totalPaidSalary)}
                            </div>
                            <div className="flex items-center text-xs text-purple-600 mt-1">
                                {getGrowthIcon(performanceMetrics.salaryGrowth)}
                                <span className="ml-1">
                                    {performanceMetrics.salaryGrowth > 0 ? '+' : ''}{performanceMetrics.salaryGrowth}% so với tháng trước
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-orange-700">
                                Lương TB/GV
                            </CardTitle>
                            <Target className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-900">
                                {formatCurrency(salaryStats.averageSalaryPerTeacher)}
                            </div>
                            <p className="text-xs text-orange-600 mt-1">
                                Cao nhất: {formatCurrency(salaryStats.highestSalary)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Department Distribution Chart */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Phân bố giáo viên theo khoa
                            </CardTitle>
                            <CardDescription>
                                Số lượng giáo viên trong từng khoa
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={teachersByDepartment}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="abbrName"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value, name) => [value, 'Số giáo viên']}
                                        labelFormatter={(label) => {
                                            const dept = teachersByDepartment.find(d => d.abbrName === label);
                                            return dept ? dept.name : label;
                                        }}
                                    />
                                    <Bar
                                        dataKey="teachers_count"
                                        fill="#3B82F6"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Degree Distribution Pie Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PieChart className="h-5 w-5" />
                                Phân bố theo bằng cấp
                            </CardTitle>
                            <CardDescription>
                                Tỷ lệ giáo viên theo từng bằng cấp
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <RechartsPieChart>
                                    <Pie
                                        data={degreeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="teachers_count"
                                    >
                                        {degreeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value, name) => [value, 'Giáo viên']} />
                                    <Legend />
                                </RechartsPieChart>
                            </ResponsiveContainer>

                            {/* Legend */}
                            <div className="mt-4 space-y-2">
                                {degreeData.map((degree, index) => (
                                    <div key={degree.id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                            />
                                            <span>{degree.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{degree.teachers_count}</span>
                                            <span className="text-muted-foreground">({degree.percentage}%)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Trends & Classroom Stats */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Monthly Trends */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Xu hướng theo tháng
                            </CardTitle>
                            <CardDescription>
                                Số lượng giáo viên và lớp học mới theo tháng
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={monthlyTrends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="teachers"
                                        stackId="1"
                                        stroke="#3B82F6"
                                        fill="#3B82F6"
                                        fillOpacity={0.6}
                                        name="Giáo viên"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="classrooms"
                                        stackId="1"
                                        stroke="#10B981"
                                        fill="#10B981"
                                        fillOpacity={0.6}
                                        name="Lớp học"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Classroom Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Thống kê lớp học
                            </CardTitle>
                            <CardDescription>
                                Thông tin chi tiết về các lớp học
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Teacher Assignment Progress */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Lớp đã có giáo viên</span>
                                    <span>{classroomStats.classroomsWithTeacher}/{classroomStats.totalClassrooms}</span>
                                </div>
                                <Progress
                                    value={(classroomStats.classroomsWithTeacher / classroomStats.totalClassrooms) * 100}
                                    className="h-2"
                                />
                            </div>

                            <Separator />

                            {/* Students Statistics */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Tổng sinh viên</p>
                                    <p className="text-2xl font-bold">{formatNumber(classroomStats.totalStudents)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground">TB SV/lớp</p>
                                    <p className="text-2xl font-bold">{Math.round(classroomStats.averageStudentsPerClass)}</p>
                                </div>
                            </div>

                            <Separator />

                            {/* Class Size Distribution */}
                            <div className="space-y-3">
                                <p className="font-medium text-sm">Phân loại theo quy mô</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            Nhỏ (&lt;30 SV)
                                        </span>
                                        <Badge variant="secondary">{classroomStats.classesBySize.small}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                            Vừa (30-50 SV)
                                        </span>
                                        <Badge variant="secondary">{classroomStats.classesBySize.medium}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            Lớn (&gt;50 SV)
                                        </span>
                                        <Badge variant="secondary">{classroomStats.classesBySize.large}</Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Salary Overview & Activities */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Salary Overview */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Tổng quan lương
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Cấu hình lương</span>
                                    <Badge variant="outline">{salaryStats.totalSalaryConfigs}</Badge>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div className="text-center p-2 bg-gray-50 rounded">
                                        <div className="font-medium">{salaryStats.activeSalaryConfigs}</div>
                                        <div className="text-muted-foreground">Đang tính</div>
                                    </div>
                                    <div className="text-center p-2 bg-green-50 rounded">
                                        <div className="font-medium">{salaryStats.closedSalaryConfigs}</div>
                                        <div className="text-muted-foreground">Đã đóng</div>
                                    </div>
                                    <div className="text-center p-2 bg-blue-50 rounded">
                                        <div className="font-medium">
                                            {salaryStats.totalSalaryConfigs - salaryStats.activeSalaryConfigs - salaryStats.closedSalaryConfigs}
                                        </div>
                                        <div className="text-muted-foreground">Nháp</div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Lương năm nay</span>
                                </div>
                                <p className="text-lg font-bold text-green-600">
                                    {formatCurrency(salaryStats.currentYearSalary)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activities */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Hoạt động gần đây
                            </CardTitle>
                            <CardDescription>
                                Các thay đổi và cập nhật mới nhất
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 max-h-80 overflow-y-auto">
                                {recentActivities.map((activity, index) => (
                                    <div key={index} className="flex items-start space-x-3">
                                        <div className={`p-2 rounded-full bg-${activity.color}-100`}>
                                            {getActivityIcon(activity.icon)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {activity.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {activity.subtitle}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}