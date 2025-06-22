// resources/js/pages/Teacher/Classrooms.tsx

import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Pagination } from '@/components/ui/pagination';
import { 
    BookOpen, 
    Users, 
    Calendar,
    Building2,
    Filter,
    RotateCcw
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Lớp học của tôi',
        href: '/teacher/classrooms',
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

interface Course {
    id: number;
    name: string;
    code: string;
    department: {
        name: string;
        abbrName: string;
    };
}

interface Classroom {
    id: number;
    name: string;
    students: number;
    course: Course;
    semester: {
        id: number;
        name: string;
        academicYear: {
            id: number;
            name: string;
        };
    };
    teacher: {
        fullName: string;
    };
    created_at: string;
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

interface Props {
    teacher: Teacher;
    classrooms: {
        data: Classroom[];
        links: any[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    courses: Course[];
    academicYears: AcademicYear[];
    semesters: Semester[];
    filters: {
        academic_year_id?: string;
        semester_id?: string;
        course_id?: string;
    };
}

export default function TeacherClassrooms({ 
    teacher, 
    classrooms, 
    courses, 
    academicYears, 
    semesters, 
    filters 
}: Props) {
    // FIX: Sử dụng 'all' thay vì empty string
    const [localFilters, setLocalFilters] = useState({
        academic_year_id: filters.academic_year_id || 'all',
        semester_id: filters.semester_id || 'all',
        course_id: filters.course_id || 'all',
    });

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
        
        router.get('/teacher/classrooms', backendFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        setLocalFilters({
            academic_year_id: 'all',
            semester_id: 'all',
            course_id: 'all',
        });
        router.get('/teacher/classrooms', {}, {
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
            <Head title="Lớp học của tôi" />
            
            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Lớp học của tôi</h1>
                        <p className="text-muted-foreground">
                            Quản lý và theo dõi các lớp học bạn đang giảng dạy
                        </p>
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
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Họ tên:</span>
                                <span>{teacher.fullName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Khoa:</span>
                                <Badge variant="outline">{teacher.department.abbrName}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Bằng cấp:</span>
                                <span>{teacher.degree.name}</span>
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
                        <div className="grid gap-4 md:grid-cols-4">
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
                                <Label>Môn học</Label>
                                <Select 
                                    value={localFilters.course_id} 
                                    onValueChange={(value) => handleFilterChange('course_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn môn học" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả môn học</SelectItem>
                                        {courses.map(course => (
                                            <SelectItem key={course.id} value={course.id.toString()}>
                                                {course.name} ({course.code})
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

                {/* Classrooms Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Danh sách lớp học ({classrooms.total} lớp)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {classrooms.data.length > 0 ? (
                            <div className="space-y-4">
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tên lớp</TableHead>
                                                <TableHead>Môn học</TableHead>
                                                <TableHead>Học kỳ</TableHead>
                                                <TableHead>Năm học</TableHead>
                                                <TableHead className="text-center">Số sinh viên</TableHead>
                                                <TableHead>Ngày tạo</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {classrooms.data.map((classroom) => (
                                                <TableRow key={classroom.id}>
                                                    <TableCell className="font-medium">
                                                        {classroom.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{classroom.course.name}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {classroom.course.code}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {classroom.semester.name}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {classroom.semester.academicYear.name}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="secondary">
                                                            <Users className="w-3 h-3 mr-1" />
                                                            {classroom.students}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(classroom.created_at).toLocaleDateString('vi-VN')}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                <Pagination
                                    links={classrooms.links}
                                    from={classrooms.from}
                                    to={classrooms.to}
                                    total={classrooms.total}
                                />
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                                    Không có lớp học nào
                                </h3>
                                <p className="text-muted-foreground">
                                    {Object.values(localFilters).some(f => f && f !== 'all') 
                                        ? 'Thử thay đổi bộ lọc để xem thêm kết quả.'
                                        : 'Bạn chưa được phân công dạy lớp học nào.'
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