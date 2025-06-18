// resources/js/pages/Reports/Index.tsx

import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    FileText, 
    User, 
    Building2, 
    School,
    Calendar,
    Download,
    Eye,
    BarChart3
} from 'lucide-react';

interface Teacher {
    id: number;
    fullName: string;
    department: {
        id: number;
        name: string;
        abbrName: string;
    };
}

interface Department {
    id: number;
    name: string;
    abbrName: string;
}

interface AcademicYear {
    id: number;
    name: string;
    semesters: Array<{
        id: number;
        name: string;
    }>;
}

interface ReportsIndexProps {
    academicYears: AcademicYear[];
    departments: Department[];
    teachers: Teacher[];
}

export default function ReportsIndex({ academicYears, departments, teachers }: ReportsIndexProps) {
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [selectedTeacher, setSelectedTeacher] = useState<string>('');

    const breadcrumbs = [
        { title: 'Tổng quan', href: '/dashboard' },
        { title: 'Báo cáo tiền dạy', href: '#' }
    ];

    const handleTeacherReport = () => {
        if (!selectedTeacher || !selectedAcademicYear) {
            alert('Vui lòng chọn giảng viên và năm học');
            return;
        }
        
        router.get('/reports/teacher-yearly', {
            teacher_id: selectedTeacher,
            academic_year_id: selectedAcademicYear
        });
    };

    const handleDepartmentReport = () => {
        if (!selectedDepartment || !selectedAcademicYear) {
            alert('Vui lòng chọn khoa và năm học');
            return;
        }
        
        router.get('/reports/department', {
            department_id: selectedDepartment,
            academic_year_id: selectedAcademicYear
        });
    };

    const handleSchoolReport = () => {
        if (!selectedAcademicYear) {
            alert('Vui lòng chọn năm học');
            return;
        }
        
        router.get('/reports/school', {
            academic_year_id: selectedAcademicYear
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Báo cáo tiền dạy" />

            <div className="container mx-auto px-6 py-8 space-y-8">
                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <BarChart3 className="h-6 w-6 text-blue-600" />
                                </div>
                                Báo cáo tiền dạy
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Tạo và xuất báo cáo lương giảng viên theo nhiều cấp độ
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Bộ lọc báo cáo</CardTitle>
                        <CardDescription>
                            Chọn thông tin để tạo báo cáo
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Năm học</label>
                                <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn năm học" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYears.map((year) => (
                                            <SelectItem key={year.id} value={year.id.toString()}>
                                                {year.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Khoa</label>
                                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn khoa" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                {dept.name} ({dept.abbrName})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Giảng viên</label>
                                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn giảng viên" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers
                                            .filter(teacher => !selectedDepartment || teacher.department.id.toString() === selectedDepartment)
                                            .map((teacher) => (
                                            <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                {teacher.fullName} - {teacher.department.abbrName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Report Types */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Teacher Report */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <User className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <CardTitle>Báo cáo cá nhân</CardTitle>
                                    <CardDescription>
                                        Báo cáo lương của một giảng viên
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                                • Chi tiết lương theo từng học kỳ<br/>
                                • Thống kê tổng quan<br/>
                                • Danh sách lớp học đã dạy
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    onClick={handleTeacherReport}
                                    className="flex-1"
                                    disabled={!selectedTeacher || !selectedAcademicYear}
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Xem báo cáo
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Department Report */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Building2 className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <CardTitle>Báo cáo theo khoa</CardTitle>
                                    <CardDescription>
                                        Báo cáo tổng hợp của một khoa
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                                • Danh sách giảng viên trong khoa<br/>
                                • So sánh lương giữa các giảng viên<br/>
                                • Thống kê tổng khoa
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    onClick={handleDepartmentReport}
                                    className="flex-1"
                                    disabled={!selectedDepartment || !selectedAcademicYear}
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Xem báo cáo
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* School Report */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <School className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <CardTitle>Báo cáo toàn trường</CardTitle>
                                    <CardDescription>
                                        Báo cáo tổng hợp toàn trường
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                                • Thống kê theo từng khoa<br/>
                                • Top giảng viên có lương cao<br/>
                                • Biểu đồ phân tích
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    onClick={handleSchoolReport}
                                    className="flex-1"
                                    disabled={!selectedAcademicYear}
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Xem báo cáo
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thống kê nhanh</CardTitle>
                        <CardDescription>
                            Tổng quan về dữ liệu có sẵn
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{academicYears.length}</div>
                                <div className="text-sm text-muted-foreground">Năm học</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{departments.length}</div>
                                <div className="text-sm text-muted-foreground">Khoa</div>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-lg">
                                <div className="text-2xl font-bold text-orange-600">{teachers.length}</div>
                                <div className="text-sm text-muted-foreground">Giảng viên</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">3</div>
                                <div className="text-sm text-muted-foreground">Loại báo cáo</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}