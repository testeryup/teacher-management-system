import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { PieChartComponent } from "@/components/charts/PieChartComponent"
import BarChartComponent from "@/components/charts/BarChartComponent";
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Department {
    id: number;
    name: string;
    teachers_count: number;
}

interface Degree {
    id: number;
    name: string;
    teachers_count: number;
}

interface Teacher {
    id: number;
    fullName: string;
    DOB: string;
    department_id: number;
    degree_id: number;
    department: {
        name: string;
    };
    degree: {
        name: string;
    };
}

interface AcademicYear {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
}

interface Semester {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    academicYear: AcademicYear;
}

interface ClassroomStat {
    course_name: string;
    semester_name: string;
    academic_year: string;
    class_count: number;
    total_students: number;
}

interface DashboardData {
    departments: Department[];
    degrees: Degree[];
    teachers: Teacher[];
    academic_years: AcademicYear[];
    semesters: Semester[];
    classroom_stats: ClassroomStat[];
    total_teachers: number;
}

export default function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [selectedDegree, setSelectedDegree] = useState<string>('');
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
    const [selectedSemester, setSelectedSemester] = useState<string>('');

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const params = new URLSearchParams();
                if (selectedAcademicYear) params.append('academic_year', selectedAcademicYear);
                if (selectedSemester) params.append('semester', selectedSemester);
                
                const url = route('dashboard.reports') + (params.toString() ? `?${params.toString()}` : '');
                const response = await fetch(url);
                const responseData = await response.json();
                console.log('Dashboard data:', responseData);
                setData(responseData);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [selectedAcademicYear, selectedSemester]);

    // Lọc giáo viên theo khoa và bằng cấp
    const filteredTeachers = data?.teachers.filter((teacher) => {
        const departmentMatch = !selectedDepartment || teacher.department_id.toString() === selectedDepartment;
        const degreeMatch = !selectedDegree || teacher.degree_id.toString() === selectedDegree;
        return departmentMatch && degreeMatch;
    }) || [];

    // Chuẩn bị dữ liệu cho biểu đồ
    const departmentChartData = data?.departments.map((dept) => ({
        department: dept.name,
        employees: dept.teachers_count,
    })) || [];

    const degreeChartData = data?.degrees.map((degree) => ({
        name: degree.name,
        value: degree.teachers_count,
    })) || [];

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        <span className="ml-3">Đang tải dữ liệu...</span>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Thống kê tổng quan */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                        <div className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Tổng số giáo viên</div>
                        <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{data?.total_teachers || 0}</div>
                    </div>
                    
                    {/* Phân bố theo bằng cấp */}
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border">
                        <div className="p-4">
                            <div className="text-lg font-semibold mb-3">Phân bố theo bằng cấp</div>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {data?.degrees.map((degree) => (
                                    <div key={degree.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                        <span className="text-sm font-medium">{degree.name}</span>
                                        <span className="text-sm bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
                                            {degree.teachers_count} người
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Phân bố theo khoa */}
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border">
                        <div className="p-4">
                            <div className="text-lg font-semibold mb-3">Phân bố theo khoa</div>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {data?.departments.map((dept) => (
                                    <div key={dept.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                        <span className="text-sm font-medium">{dept.name}</span>
                                        <span className="text-sm bg-green-100 dark:bg-green-800 px-2 py-1 rounded">
                                            {dept.teachers_count} người
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bộ lọc */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border p-4">
                    <h3 className="text-lg font-semibold mb-4">Bộ lọc giáo viên</h3>
                    <div className="flex gap-4 items-end mb-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">Lọc theo khoa:</label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                            >
                                <option value="">Tất cả khoa</option>
                                {data?.departments.map((dept) => (
                                    <option key={dept.id} value={dept.id.toString()}>
                                        {dept.name} ({dept.teachers_count} giáo viên)
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">Lọc theo bằng cấp:</label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                value={selectedDegree}
                                onChange={(e) => setSelectedDegree(e.target.value)}
                            >
                                <option value="">Tất cả bằng cấp</option>
                                {data?.degrees.map((degree) => (
                                    <option key={degree.id} value={degree.id.toString()}>
                                        {degree.name} ({degree.teachers_count} giáo viên)
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Hiển thị: <span className="font-semibold">{filteredTeachers.length}</span> / {data?.total_teachers} giáo viên
                            </div>
                        </div>
                    </div>
                </div>

                

                {/* Bảng danh sách giáo viên */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border">
                    <div className="p-4">
                        <h3 className="text-lg font-semibold mb-4">Danh sách giáo viên</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            STT
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Tên giáo viên
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Khoa
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Bằng cấp
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Ngày sinh
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredTeachers.length > 0 ? (
                                        filteredTeachers.map((teacher, index) => (
                                            <tr key={teacher.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {teacher.fullName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {teacher.department?.name || 'Chưa xác định'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {teacher.degree?.name || 'Chưa xác định'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {new Date(teacher.DOB).toLocaleDateString('vi-VN')}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                Không có dữ liệu giáo viên
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {/* Bộ lọc thống kê lớp học */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border p-4">
                    <h3 className="text-lg font-semibold mb-4">Thống kê lớp học theo học phần</h3>
                    <div className="flex gap-4 items-end mb-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">Năm học:</label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                value={selectedAcademicYear}
                                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                            >
                                <option value="">Tất cả năm học</option>
                                {data?.academic_years?.map((year) => (
                                    <option key={year.id} value={year.id.toString()}>
                                        {year.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">Học kỳ:</label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(e.target.value)}
                            >
                                <option value="">Tất cả học kỳ</option>
                                {data?.semesters?.map((semester) => (
                                    <option key={semester.id} value={semester.id.toString()}>
                                        {semester.name} - {semester.academicYear?.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Tổng lớp: <span className="font-semibold">{data?.classroom_stats?.reduce((sum, stat) => sum + stat.class_count, 0) || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Bảng thống kê lớp học */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        STT
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Tên học phần
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Học kỳ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Năm học
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Số lớp mở
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Tổng sinh viên
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {data?.classroom_stats && data.classroom_stats.length > 0 ? (
                                    data.classroom_stats.map((stat, index) => (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {stat.course_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                {stat.semester_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                {stat.academic_year}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                <span className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded text-blue-800 dark:text-blue-200">
                                                    {stat.class_count} lớp
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                <span className="bg-green-100 dark:bg-green-800 px-2 py-1 rounded text-green-800 dark:text-green-200">
                                                    {stat.total_students} SV
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                            Không có dữ liệu thống kê lớp học
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
