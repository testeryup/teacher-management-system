import React, { useState, useEffect } from 'react';
import { DataTable } from "@/components/ui/data-table";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, Link, useForm, usePage, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from '@/components/ui/pagination';
import { toast, Toaster } from 'sonner';
import { createClassroomColumns } from '@/components/columns/classroom-columns';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search,
    Filter,
    Calendar,
    GraduationCap,
    X,
    RefreshCw,
    Plus,
    Copy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Quản lý lớp học',
        href: '/classrooms',
    },
];

interface Course {
    id: number;
    name: string;
    code: string;
    credits: number;
    lessons: number;
    department_id: number | null;
    department?: {
        id: number;
        name: string;
        abbrName: string;
    };
}

interface Teacher {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    department_id: number | null;
    department?: {
        id: number;
        name: string;
        abbrName: string;
    };
    degree?: {
        id: number;
        name: string;
    };
}

interface Semester {
    id: number;
    name: string;
    academicYear_id: number;
    academicYear: {
        id: number;
        name: string;
    };
}

interface AcademicYear {
    id: number;
    name: string;
}

interface Classroom {
    id: number;
    name: string;
    code: string;
    students: number;
    course_id: number;
    semester_id: number;
    teacher_id: number | null;
    department_id: number | null;
    course: Course;
    semester: Semester;
    teacher: Teacher | null;
}

interface PaginatedClassrooms {
    data: Classroom[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: {
        url?: string;
        label: string;
        active: boolean;
    }[];
}

interface ClassroomsPageProps {
    classrooms: PaginatedClassrooms;
    teachers: Teacher[];
    courses: Course[];
    semesters: Semester[];
    academicYears: AcademicYear[];
    filters: {
        academic_year_id?: string;
        semester_id?: string;
        search?: string;
    };
}

export default function Classrooms({
    classrooms,
    teachers,
    courses,
    semesters,
    academicYears,
    filters = {}
}: ClassroomsPageProps) {
    const { props } = usePage();
    const user = (props as any).auth?.user;
    const isAdmin = user?.role === 'admin';
    const isDepartmentHead = user?.role === 'department_head';

    const [sheetOpen, setSheetOpen] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const [pendingUpdateId, setPendingUpdateId] = useState<number | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const [pendingDeleteName, setPendingDeleteName] = useState('');
    const [bulkSheetOpen, setBulkSheetOpen] = useState(false);

    // FIX: Filter states với fallback và sử dụng 'all' thay vì ''
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(filters?.academic_year_id || 'all');
    const [selectedSemester, setSelectedSemester] = useState<string>(filters?.semester_id || 'all');
    const [searchTerm, setSearchTerm] = useState<string>(filters?.search || '');
    const [isFilterOpen, setIsFilterOpen] = useState(true);


    console.log("check semesters:", semesters);
    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        course_id: null as number | null,
        semester_id: null as number | null,
        teacher_id: null as number | null,
        students: 0,
        department_id: null as number | null
    });

    // Form cho tạo hàng loạt
    const { data: bulkData, setData: setBulkData, post: postBulk, processing: bulkProcessing, errors: bulkErrors, reset: resetBulk } = useForm({
        course_id: null as number | null,
        semester_id: null as number | null,
        teacher_id: null as number | null,
        students_per_class: 30,
        number_of_classes: 1,
        class_name_prefix: '',
    });
    // FIX: Filter semesters dựa trên năm học đã chọn
    const filteredSemesters = selectedAcademicYear === 'all'
        ? semesters
        : semesters.filter(semester => semester.academicYear_id.toString() === selectedAcademicYear);

    // FIX: Auto-reset semester khi thay đổi năm học
    useEffect(() => {
        if (selectedAcademicYear !== 'all' && selectedSemester !== 'all') {
            const semesterExists = filteredSemesters.some(s => s.id.toString() === selectedSemester);
            if (!semesterExists) {
                setSelectedSemester('all');
            }
        }
    }, [selectedAcademicYear, filteredSemesters]);

    const handleDelete = (id: number, name: string) => {
        setPendingDeleteId(id);
        setPendingDeleteName(name);
        setIsDialogOpen(true);
    };

    const confirmDelete = () => {
        if (pendingDeleteId !== null) {
            destroy(route('classrooms.destroy', pendingDeleteId), {
                onSuccess: () => {
                    toast.success('Xóa lớp học thành công');
                    setIsDialogOpen(false);
                    setPendingDeleteId(null);
                    setPendingDeleteName('');
                },
                onError: (errors) => {
                    if (errors.reference) {
                        toast.error(`Không thể xóa lớp học này: ${errors.reference}`);
                    } else if (errors.permission) {
                        toast.error(errors.permission);
                    } else {
                        toast.error('Xóa lớp học thất bại');
                    }
                    setIsDialogOpen(false);
                }
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isUpdate) {
            post(route('classrooms.store'), {
                onSuccess: () => {
                    toast.success('Thêm lớp học mới thành công');
                    reset();
                    setSheetOpen(false);
                },
                onError: (errors) => {
                    console.log('Errors:', errors);
                    if (errors.course_id) {
                        toast.error(errors.course_id);
                    } else if (errors.teacher_id) {
                        toast.error(errors.teacher_id);
                    } else {
                        toast.error('Thêm lớp học mới thất bại');
                    }
                }
            });
        } else {
            if (pendingUpdateId !== null) {
                put(route('classrooms.update', pendingUpdateId), {
                    onSuccess: () => {
                        toast.success('Cập nhật lớp học thành công');
                        reset();
                        setSheetOpen(false);
                        setIsUpdate(false);
                        setPendingUpdateId(null);
                    },
                    onError: (errors) => {
                        console.log('Update errors:', errors);
                        if (errors.permission) {
                            toast.error(errors.permission);
                        } else if (errors.teacher_id) {
                            toast.error(errors.teacher_id);
                        } else {
                            toast.error('Cập nhật lớp học thất bại');
                        }
                    }
                });
            }
        }
    };

    const handleUpdate = (classroom: Classroom) => {
        setIsUpdate(true);
        setData({
            name: classroom.name,
            course_id: classroom.course.id,
            semester_id: classroom.semester.id,
            teacher_id: classroom.teacher?.id || null,
            students: classroom.students,
            department_id: classroom.department_id || null
        });
        setPendingUpdateId(classroom.id);
        setSheetOpen(true);
    };

    const handleSheetOpenChange = (open: boolean) => {
        setSheetOpen(open);
        if (!open) {
            reset();
            setIsUpdate(false);
            setPendingUpdateId(null);
        }
    };

    const handleBulkSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postBulk(route('classrooms.bulk-store'), {
            onSuccess: () => {
                toast.success('Tạo lớp học hàng loạt thành công');
                resetBulk();
                setBulkSheetOpen(false);
            },
            onError: (errors) => {
                console.log('Bulk creation errors:', errors);
                if (errors.course_id) {
                    toast.error(errors.course_id);
                } else if (errors.teacher_id) {
                    toast.error(errors.teacher_id);
                } else if (errors.class_name_prefix) {
                    toast.error(errors.class_name_prefix);
                } else {
                    toast.error('Tạo lớp học hàng loạt thất bại');
                }
            }
        });
    };

    const handleBulkSheetOpenChange = (open: boolean) => {
        setBulkSheetOpen(open);
        if (!open) {
            resetBulk();
        }
    };

    // Tự động tạo prefix khi chọn khóa học
    useEffect(() => {
        if (bulkData.course_id) {
            const selectedCourse = courses.find(c => c.id === bulkData.course_id);
            if (selectedCourse) {
                const prefix = selectedCourse.code || selectedCourse.name.split(' ').map(word => word[0]).join('').toUpperCase();
                setBulkData('class_name_prefix', prefix);
            }
        }
    }, [bulkData.course_id]);

    // HANDLE BOTH DATA FORMATS
    const classroomData = Array.isArray(classrooms) ? classrooms : classrooms.data || [];

    // Tạo columns với callbacks
    const columns = createClassroomColumns({
        onEdit: (classroom: any) => handleUpdate(classroom),
        onDelete: (id: number, name: string) => handleDelete(id, name),
    });

    // FIX: Apply filters với URLSearchParams
    const applyFilters = () => {
        const params = new URLSearchParams();

        if (selectedAcademicYear && selectedAcademicYear !== 'all') {
            params.append('academic_year_id', selectedAcademicYear);
        }
        if (selectedSemester && selectedSemester !== 'all') {
            params.append('semester_id', selectedSemester);
        }
        if (searchTerm.trim()) {
            params.append('search', searchTerm.trim());
        }

        const url = params.toString() ?
            `${route('classrooms.index')}?${params.toString()}` :
            route('classrooms.index');

        router.visit(url, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // FIX: Clear all filters
    const clearFilters = () => {
        setSelectedAcademicYear('all');
        setSelectedSemester('all');
        setSearchTerm('');

        router.visit(route('classrooms.index'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Check if any filters are active
    const hasActiveFilters = selectedAcademicYear !== 'all' || selectedSemester !== 'all' || searchTerm;

    // FIX: Auto-apply filters when Enter is pressed
    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    };

    // Calculate stats for current filter
    const totalClassrooms = Array.isArray(classrooms) ? classrooms.length : classrooms.total || 0;
    const classroomsWithTeacher = Array.isArray(classrooms)
        ? classrooms.filter(c => c.teacher_id).length
        : classrooms.data?.filter(c => c.teacher_id).length || 0;
    const classroomsWithoutTeacher = totalClassrooms - classroomsWithTeacher;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Quản lý lớp học" />
            <Toaster />

            <div className="flex-1 space-y-6 p-6">
                {/* Header with Stats */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Quản lý lớp học</h1>
                        <p className="text-muted-foreground">
                            Tạo và quản lý các lớp học trong hệ thống
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{totalClassrooms}</div>
                            <div className="text-sm text-muted-foreground">Tổng lớp</div>
                        </div>
                        <Separator orientation="vertical" className="h-12" />
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{classroomsWithTeacher}</div>
                            <div className="text-sm text-muted-foreground">Có GV</div>
                        </div>
                        <Separator orientation="vertical" className="h-12" />
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{classroomsWithoutTeacher}</div>
                            <div className="text-sm text-muted-foreground">Chưa có GV</div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {/* Add Single Classroom */}
                    <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
                        <SheetTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Thêm lớp học
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>
                                    {isUpdate ? 'Chỉnh sửa thông tin lớp học' : 'Thêm lớp học mới'}
                                </SheetTitle>
                                <SheetDescription>
                                    Nhập thông tin ở đây, sau đó nhấn lưu
                                </SheetDescription>
                            </SheetHeader>

                            <form onSubmit={handleSubmit} id="classroom-form" className="space-y-6 p-4 overflow-auto">
                                <div className="space-y-4">
                                    {/* Tên lớp học */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Tên lớp học</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full"
                                        />
                                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                    </div>

                                    {/* Học kỳ */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="semester_id">Học kỳ</Label>
                                        <select
                                            id="semester_id"
                                            value={data.semester_id || ''}
                                            onChange={(e) => setData('semester_id', e.target.value ? parseInt(e.target.value) : null)}
                                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            disabled={isUpdate}
                                        >
                                            <option value="">Chọn học kỳ</option>
                                            {semesters.map(semester => (
                                                <option key={semester.id} value={semester.id}>
                                                    {semester.name} - {semester.academicYear?.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.semester_id && <p className="text-sm text-red-500">{errors.semester_id}</p>}
                                    </div>

                                    {/* Khóa học - Chỉ hiển thị môn học thuộc khoa */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="course_id">Khóa học</Label>
                                        <select
                                            id="course_id"
                                            value={data.course_id || ''}
                                            onChange={(e) => setData('course_id', e.target.value ? parseInt(e.target.value) : null)}
                                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            disabled={isUpdate} // Không cho sửa khóa học khi update
                                        >
                                            <option value="">Chọn khóa học</option>
                                            {courses.map(course => (
                                                <option key={course.id} value={course.id}>
                                                    {course.name} ({course.code})
                                                    {course.department && ` - ${course.department.abbrName}`}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.course_id && <p className="text-sm text-red-500">{errors.course_id}</p>}
                                    </div>

                                    {/* Giáo viên - Chỉ hiển thị giáo viên thuộc khoa */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="teacher_id">Giáo viên phụ trách</Label>
                                        <select
                                            id="teacher_id"
                                            value={data.teacher_id || ''}
                                            onChange={(e) => setData('teacher_id', e.target.value ? parseInt(e.target.value) : null)}
                                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="">Chọn giáo viên</option>
                                            {teachers.map(teacher => (
                                                <option key={teacher.id} value={teacher.id}>
                                                    {teacher.fullName}
                                                    {teacher.department && ` (${teacher.department.abbrName})`}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.teacher_id && <p className="text-sm text-red-500">{errors.teacher_id}</p>}
                                    </div>

                                    {/* Số lượng học sinh */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="students">Số lượng học sinh</Label>
                                        <Input
                                            id="students"
                                            type="number"
                                            min="0"
                                            max="200"
                                            value={data.students}
                                            onChange={(e) => setData('students', parseInt(e.target.value) || 0)}
                                            className="w-full"
                                        />
                                        {errors.students && <p className="text-sm text-red-500">{errors.students}</p>}
                                    </div>
                                </div>
                            </form>

                            <SheetFooter>
                                <SheetClose asChild>
                                    <Button variant="outline" type='button' className='hover:cursor-pointer'>
                                        Thoát
                                    </Button>
                                </SheetClose>
                                <Button
                                    type="submit"
                                    form="classroom-form"
                                    disabled={processing}
                                    className='hover:cursor-pointer'
                                >
                                    {processing ? 'Đang xử lý...' : (isUpdate ? 'Cập nhật' : 'Thêm mới')}
                                </Button>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>

                    {/* Bulk Creation Sheet */}
                    <Sheet open={bulkSheetOpen} onOpenChange={handleBulkSheetOpenChange}>
                        <SheetTrigger asChild>
                            <Button variant="outline" className='hover:cursor-pointer'>
                                <Copy className="w-4 h-4 mr-2" />
                                Thêm lớp học hàng loạt
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[600px] sm:w-[700px]">
                            <SheetHeader>
                                <SheetTitle>Thêm lớp học hàng loạt</SheetTitle>
                                <SheetDescription>
                                    Tạo nhiều lớp học cùng lúc với thông tin tương tự
                                </SheetDescription>
                            </SheetHeader>

                            <form onSubmit={handleBulkSubmit} id="bulk-classroom-form" className="space-y-6 p-4">
                                <div className="space-y-4">
                                    {/* Khóa học */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="bulk-course_id">Khóa học *</Label>
                                        <select
                                            id="bulk-course_id"
                                            value={bulkData.course_id || ''}
                                            onChange={(e) => setBulkData('course_id', e.target.value ? parseInt(e.target.value) : null)}
                                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            required
                                        >
                                            <option value="">Chọn khóa học</option>
                                            {courses.map(course => (
                                                <option key={course.id} value={course.id}>
                                                    {course.name} ({course.code})
                                                    {course.department && ` - ${course.department.abbrName}`}
                                                </option>
                                            ))}
                                        </select>
                                        {bulkErrors.course_id && <p className="text-sm text-red-500">{bulkErrors.course_id}</p>}
                                    </div>

                                    {/* Học kỳ */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="bulk-semester_id">Học kỳ *</Label>
                                        <select
                                            id="bulk-semester_id"
                                            value={bulkData.semester_id || ''}
                                            onChange={(e) => setBulkData('semester_id', e.target.value ? parseInt(e.target.value) : null)}
                                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            required
                                        >
                                            <option value="">Chọn học kỳ</option>
                                            {semesters.map(semester => (
                                                <option key={semester.id} value={semester.id}>
                                                    {semester.name} - ({semester.academicYear?.name})
                                                </option>
                                            ))}
                                        </select>
                                        {bulkErrors.semester_id && <p className="text-sm text-red-500">{bulkErrors.semester_id}</p>}
                                    </div>

                                    {/* Giáo viên phụ trách */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="bulk-teacher_id">Giáo viên phụ trách</Label>
                                        <select
                                            id="bulk-teacher_id"
                                            value={bulkData.teacher_id || ''}
                                            onChange={(e) => setBulkData('teacher_id', e.target.value ? parseInt(e.target.value) : null)}
                                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="">Chưa phân công (có thể chỉ định sau)</option>
                                            {teachers.map(teacher => (
                                                <option key={teacher.id} value={teacher.id}>
                                                    {teacher.fullName}
                                                    {teacher.department && ` (${teacher.department.abbrName})`}
                                                </option>
                                            ))}
                                        </select>
                                        {bulkErrors.teacher_id && <p className="text-sm text-red-500">{bulkErrors.teacher_id}</p>}
                                    </div>

                                    {/* Cấu hình lớp học */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="bulk-number_of_classes">Số lượng lớp học *</Label>
                                            <Input
                                                id="bulk-number_of_classes"
                                                type="number"
                                                min="1"
                                                max="20"
                                                value={bulkData.number_of_classes}
                                                onChange={(e) => setBulkData('number_of_classes', parseInt(e.target.value) || 1)}
                                                className="w-full"
                                                required
                                            />
                                            {bulkErrors.number_of_classes && <p className="text-sm text-red-500">{bulkErrors.number_of_classes}</p>}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="bulk-students_per_class">Số học sinh mỗi lớp *</Label>
                                            <Input
                                                id="bulk-students_per_class"
                                                type="number"
                                                min="1"
                                                max="200"
                                                value={bulkData.students_per_class}
                                                onChange={(e) => setBulkData('students_per_class', parseInt(e.target.value) || 30)}
                                                className="w-full"
                                                required
                                            />
                                            {bulkErrors.students_per_class && <p className="text-sm text-red-500">{bulkErrors.students_per_class}</p>}
                                        </div>
                                    </div>

                                    {/* Tiền tố tên lớp học */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="bulk-class_name_prefix">Tiền tố tên lớp *</Label>
                                        <Input
                                            id="bulk-class_name_prefix"
                                            value={bulkData.class_name_prefix}
                                            onChange={(e) => setBulkData('class_name_prefix', e.target.value)}
                                            placeholder="VD: CNTT2024"
                                            className="w-full"
                                            required
                                        />
                                        <p className="text-xs text-gray-500">
                                            Tên lớp sẽ được tạo theo định dạng: {bulkData.class_name_prefix} N01, {bulkData.class_name_prefix} N02, ...
                                        </p>
                                        {bulkErrors.class_name_prefix && <p className="text-sm text-red-500">{bulkErrors.class_name_prefix}</p>}
                                    </div>

                                    {/* Preview */}
                                    {bulkData.class_name_prefix && bulkData.number_of_classes > 0 && (
                                        <div className="grid gap-2">
                                            <Label>Xem trước tên các lớp học sẽ được tạo:</Label>
                                            <div className="p-3 bg-gray-50 rounded-md">
                                                <div className="flex flex-wrap gap-2">
                                                    {Array.from({ length: Math.min(bulkData.number_of_classes, 10) }, (_, i) => (
                                                        <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                                            {bulkData.class_name_prefix} N{String(i + 1).padStart(2, '0')}
                                                        </span>
                                                    ))}
                                                    {bulkData.number_of_classes > 10 && (
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                                                            ... và {bulkData.number_of_classes - 10} lớp khác
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </form>

                            <SheetFooter>
                                <SheetClose asChild>
                                    <Button variant="outline" type='button' className='hover:cursor-pointer'>
                                        Hủy
                                    </Button>
                                </SheetClose>
                                <Button
                                    type="submit"
                                    form="bulk-classroom-form"
                                    disabled={bulkProcessing}
                                    className='hover:cursor-pointer'
                                >
                                    {bulkProcessing ? 'Đang tạo...' : `Tạo ${bulkData.number_of_classes} lớp học`}
                                </Button>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* FIX: Filter Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Bộ lọc lớp học
                                {hasActiveFilters && (
                                    <Badge variant="secondary" className="ml-2">
                                        {[selectedAcademicYear, selectedSemester, searchTerm].filter(f => f && f !== 'all').length} bộ lọc
                                    </Badge>
                                )}
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                            >
                                {isFilterOpen ? 'Thu gọn' : 'Mở rộng'}
                            </Button>
                        </div>
                    </CardHeader>

                    {isFilterOpen && (
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Search Input */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium flex items-center gap-2">
                                        <Search className="h-4 w-4" />
                                        Tìm kiếm
                                    </Label>
                                    <Input
                                        placeholder="Tên lớp, môn học, giáo viên..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={handleSearchKeyPress}
                                        className="w-full"
                                    />
                                </div>

                                {/* Academic Year Filter */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Năm học
                                    </Label>
                                    <Select
                                        value={selectedAcademicYear}
                                        onValueChange={setSelectedAcademicYear}
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

                                {/* Semester Filter */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4" />
                                        Học kỳ
                                    </Label>
                                    <Select
                                        value={selectedSemester}
                                        onValueChange={setSelectedSemester}
                                        disabled={selectedAcademicYear === 'all' || !filteredSemesters.length}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn học kỳ" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả học kỳ</SelectItem>
                                            {filteredSemesters.map(semester => (
                                                <SelectItem key={semester.id} value={semester.id.toString()}>
                                                    {semester.name}
                                                    {semester.academicYear && ` - ${semester.academicYear.name}`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Filter Actions */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium opacity-0">Actions</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={applyFilters}
                                            size="lg"
                                            className="flex-1"
                                        >
                                            <Search className="h-4 w-4 mr-1" />
                                            Lọc
                                        </Button>
                                        <Button
                                            onClick={clearFilters}
                                            variant="outline"
                                            size="lg"
                                            disabled={!hasActiveFilters}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Active Filters Display */}
                            {hasActiveFilters && (
                                <div className="flex flex-wrap gap-2 pt-4 border-t">
                                    <span className="text-sm text-muted-foreground">Đang lọc theo:</span>

                                    {selectedAcademicYear && selectedAcademicYear !== 'all' && (
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                            Năm: {academicYears.find(y => y.id.toString() === selectedAcademicYear)?.name}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-4 w-4 p-0 hover:bg-transparent"
                                                onClick={() => setSelectedAcademicYear('all')}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </Badge>
                                    )}

                                    {selectedSemester && selectedSemester !== 'all' && (
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                            HK: {filteredSemesters.find(s => s.id.toString() === selectedSemester)?.name}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-4 w-4 p-0 hover:bg-transparent"
                                                onClick={() => setSelectedSemester('all')}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </Badge>
                                    )}

                                    {searchTerm && (
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                            "{searchTerm}"
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-4 w-4 p-0 hover:bg-transparent"
                                                onClick={() => setSearchTerm('')}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </Badge>
                                    )}

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="text-xs h-6"
                                    >
                                        Xóa tất cả
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    )}
                </Card>

                {/* Results Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>
                                Danh sách lớp học
                                {hasActiveFilters && (
                                    <span className="text-sm font-normal text-muted-foreground ml-2">
                                        ({classrooms.from}-{classrooms.to} / {totalClassrooms} - đã lọc)
                                    </span>
                                )}
                                {!hasActiveFilters && (
                                    <span className="text-sm font-normal text-muted-foreground ml-2">
                                        ({classrooms.from}-{classrooms.to} / {totalClassrooms})
                                    </span>
                                )}
                            </CardTitle>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.location.reload()}
                                >
                                    <RefreshCw className="h-4 w-4 mr-1" />
                                    Làm mới
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* DataTable with existing data */}
                        <DataTable
                            columns={columns}
                            data={classroomData}
                            searchKey="name"
                            searchPlaceholder="Tìm kiếm theo tên lớp học..."
                        />

                        {/* Pagination */}
                        {classrooms.links && (
                            <div className="mt-6">
                                <Pagination
                                    links={classrooms.links.map(link => ({
                                        ...link,
                                        url: link.url ?? null
                                    }))}
                                    from={classrooms.from || 0}
                                    to={classrooms.to || 0}
                                    total={classrooms.total || 0}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Dialog xác nhận xóa */}
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa lớp học "{pendingDeleteName}"?
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}