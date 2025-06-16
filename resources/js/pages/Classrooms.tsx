import React, { useState, useEffect } from 'react';
import { DataTable } from "@/components/ui/data-table";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
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
    academic_year_id: number;
    academic_year: {
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
    courses: Course[];
    teachers: Teacher[];
    semesters: Semester[];
    academicYears: AcademicYear[];
}

export default function Classrooms({ classrooms, teachers, courses, semesters, academicYears }: ClassroomsPageProps) {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Toaster />
            <Head title="Quản lý lớp học" />

            <div className='m-4'>
                {/* Updated buttons with tabs */}
                <div className="flex gap-2 mb-4">
                    <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
                        <SheetTrigger asChild>
                            <Button variant="default" className='hover:cursor-pointer'>
                                Thêm lớp học đơn lẻ
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

                        <form onSubmit={handleSubmit} id="classroom-form" className="space-y-6 p-4">
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
                                                {semester.name} - {semester.academic_year?.name}
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
                                                {semester.name} - {semester.academic_year?.name}
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

                                {/* Tiền tố tên lớp */}
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
            </div>

            {/* DataTable thay thế cho Table thông thường */}
            <div className="m-4">
                <DataTable
                    columns={columns}
                    data={classroomData}
                    searchKey="name"
                    searchPlaceholder="Tìm kiếm theo tên lớp học..."
                />
                {/* Pagination */}
                {!Array.isArray(classrooms) && classrooms.links && (
                    <div className="mt-4">
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
            </div>

            {/* Dialog xác nhận xóa */}
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa lớp học <strong>{pendingDeleteName}</strong> không?
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className='hover:cursor-pointer'>Hủy</AlertDialogCancel>
                        <AlertDialogAction className='hover:cursor-pointer hover:bg-red-400 bg-red-500 text-white' onClick={confirmDelete}>
                            Xác nhận
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}