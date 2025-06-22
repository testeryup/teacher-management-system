// resources/js/pages/Teacher/Reports/Index.tsx

import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    BarChart3, 
    Users, 
    Building2,
    GraduationCap,
    FileText,
    Calendar,
    Download,
    Eye
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Báo cáo lương',
        href: '/teacher/reports',
    },
];

interface Teacher {
    id: number;
    fullName: string;
    email: string;
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
    semesters: Array<{
        id: number;
        name: string;
    }>;
}

interface Props {
    teacher: Teacher;
    academicYears: AcademicYear[];
}

export default function TeacherReportsIndex({ teacher, academicYears }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Báo cáo lương - Giảng viên" />
            
            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Báo cáo lương cá nhân
                            </h1>
                        </div>
                        <p className="text-muted-foreground text-lg">
                            Xem và xuất báo cáo lương theo năm học
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
                        <div className="grid gap-4 md:grid-cols-4">
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
                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Bằng cấp:</span>
                                <span>{teacher.degree.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Hệ số lương:</span>
                                <Badge variant="secondary">{teacher.degree.baseSalaryFactor}</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Academic Years */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Chọn năm học để xem báo cáo
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {academicYears.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {academicYears.map((academicYear) => (
                                    <Card key={academicYear.id} className="border-2 hover:border-blue-300 hover:shadow-md transition-all">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <CardTitle className="text-lg">{academicYear.name}</CardTitle>
                                                </div>
                                                <Badge variant="outline">
                                                    {academicYear.semesters.length} học kỳ
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="space-y-2 mb-4">
                                                <div className="text-sm text-muted-foreground">
                                                    Các học kỳ:
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {academicYear.semesters.map((semester) => (
                                                        <Badge key={semester.id} variant="secondary" className="text-xs">
                                                            {semester.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <Button 
                                                    asChild 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="flex-1"
                                                >
                                                    <Link href={`/teacher/reports/${academicYear.id}`}>
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Xem báo cáo
                                                    </Link>
                                                </Button>
                                                <Button 
                                                    asChild 
                                                    size="sm"
                                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                                >
                                                    <Link href={`/teacher/reports/${academicYear.id}/pdf`}>
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Tải PDF
                                                    </Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                                    Chưa có báo cáo nào
                                </h3>
                                <p className="text-muted-foreground">
                                    Bạn chưa có dữ liệu lương trong năm học nào. Vui lòng liên hệ quản trị viên để được tính lương.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Help Card */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="text-blue-800 flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Hướng dẫn sử dụng
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-blue-700 space-y-2">
                            <p className="font-medium">Cách xem báo cáo lương:</p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li><strong>Xem báo cáo:</strong> Nhấn "Xem báo cáo" để xem chi tiết lương trên web</li>
                                <li><strong>Tải PDF:</strong> Nhấn "Tải PDF" để tải báo cáo dạng PDF về máy</li>
                                <li><strong>Thông tin báo cáo:</strong> Bao gồm tổng lương, số lớp, tiết quy đổi theo từng học kỳ</li>
                                <li><strong>Chi tiết lương:</strong> Xem chi tiết lương từng lớp học với các hệ số tính toán</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}