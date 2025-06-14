import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/ui/pagination';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast, Toaster } from 'sonner';
import { BreadcrumbItem } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { createClassroomColumns, type Classroom } from '@/components/columns/classroom-columns';
interface Teacher {
    id: number;
    fullName: string;
    department?: {
        id: number;
        name: string;
        abbrName: string;
    };
}

interface Course {
    id: number;
    name: string;
    code: string;
}

interface AcademicYear {
    id: number;
    name: string;
}

interface Semester {
    id: number;
    name: string;
    academic_year: AcademicYear;
}

interface ClassroomsPageProps {
    classrooms: Classroom[] | {
        data: Classroom[];
        current_page?: number;
        last_page?: number;
        total?: number;
        from?: number;
        to?: number;
        links?: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
    teachers: Teacher[];
    courses: Course[];
    semesters: Semester[];
    academicYears: AcademicYear[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Quản lý lớp học',
        href: '/classrooms',
    },
];

export default function Classrooms({ classrooms, teachers, courses, semesters, academicYears }: ClassroomsPageProps) {
    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        course_id: null as number | null,
        semester_id: null as number | null,
        teacher_id: null as number | null,
        students: 0,
    });

    const [sheetOpen, setSheetOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const [pendingDeleteName, setPendingDeleteName] = useState<string>('');
    const [pendingUpdateId, setPendingUpdateId] = useState<number | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);

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
                    toast.error('Thêm lớp học mới thất bại');
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
                        toast.error('Cập nhật lớp học thất bại');
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
            teacher_id: classroom.teacher.id,
            students: classroom.students,
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

    // HANDLE BOTH DATA FORMATS
    const classroomData = Array.isArray(classrooms) ? classrooms : classrooms.data || [];

    // Tạo columns với callbacks
    const columns = createClassroomColumns({
        onEdit: handleUpdate,
        onDelete: handleDelete,
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Toaster />
            <Head title="Quản lý lớp học" />

            <div className='m-4'>
                <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
                    <SheetTrigger asChild>
                        <Button variant="default" className='hover:cursor-pointer'>
                            Thêm lớp học mới
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
                                        disabled={isUpdate} // Không cho sửa học kỳ khi update
                                    >
                                        <option value="">Chọn học kỳ</option>
                                        {semesters.map(semester => (
                                            <option key={semester.id} value={semester.id}>
                                                {semester.name} - {semester.academic_year.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.semester_id && <p className="text-sm text-red-500">{errors.semester_id}</p>}
                                </div>

                                {/* Khóa học */}
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
                                            </option>
                                        ))}
                                    </select>
                                    {errors.course_id && <p className="text-sm text-red-500">{errors.course_id}</p>}
                                </div>

                                {/* Giáo viên */}
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
                                                {teacher.fullName} {teacher.department && `(${teacher.department.abbrName})`}
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
                            links={classrooms.links}
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