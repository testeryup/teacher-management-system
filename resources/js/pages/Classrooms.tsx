import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { SimplePagination } from "@/components/ui/simple-pagination"
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
    classrooms: Classroom[] | { data: Classroom[] };
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
        class_count: 1,
    });

    const [sheetOpen, setSheetOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const [pendingDeleteName, setPendingDeleteName] = useState<string>('');
    const [pendingUpdateId, setPendingUpdateId] = useState<number | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    
    // Filter states
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('all');
    const [selectedSemester, setSelectedSemester] = useState<string>('all');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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
                    // Reload trang ngay lập tức để cập nhật dữ liệu
                    router.reload();
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
                    const successMessage = data.class_count > 1 
                        ? `Thêm thành công ${data.class_count} lớp học mới`
                        : 'Thêm lớp học mới thành công';
                    toast.success(successMessage);
                    reset();
                    setSheetOpen(false);
                    // Reload trang ngay lập tức để cập nhật dữ liệu
                    router.reload();
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
                        // Reload trang ngay lập tức để cập nhật dữ liệu
                        router.reload();
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
            class_count: 1, // Default to 1 for updates
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
    
    // Debug log to check data
    console.log('Classrooms data:', classroomData);
    console.log('Semesters:', semesters);
    console.log('Academic Years:', academicYears);

    // Filter data based on selected academic year and semester
    const filteredClassroomData = React.useMemo(() => {
        let filtered = classroomData;

        if (selectedAcademicYear && selectedAcademicYear !== 'all') {
            filtered = filtered.filter((classroom: Classroom) => 
                classroom.semester.academic_year.name === selectedAcademicYear
            );
        }

        if (selectedSemester && selectedSemester !== 'all') {
            filtered = filtered.filter((classroom: Classroom) => 
                classroom.semester.name === selectedSemester
            );
        }

        return filtered;
    }, [classroomData, selectedAcademicYear, selectedSemester]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredClassroomData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentClassrooms = filteredClassroomData.slice(startIndex, endIndex);

    // Debug pagination
    console.log('Pagination Debug:', {
        totalClassrooms: classroomData.length,
        filteredClassrooms: filteredClassroomData.length,
        itemsPerPage,
        totalPages,
        currentPage,
        currentClassrooms: currentClassrooms.length
    });

    // Reset to page 1 when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [selectedAcademicYear, selectedSemester]);

    // Get filtered semesters based on selected academic year
    const filteredSemesters = React.useMemo(() => {
        if (!selectedAcademicYear || selectedAcademicYear === 'all') return semesters;
        return semesters.filter(semester => 
            semester.academic_year.name === selectedAcademicYear
        );
    }, [semesters, selectedAcademicYear]);

    // Reset semester when academic year changes
    React.useEffect(() => {
        if (selectedAcademicYear && selectedAcademicYear !== 'all') {
            const availableSemesters = semesters.filter(semester => 
                semester.academic_year.name === selectedAcademicYear
            );
            if (selectedSemester && selectedSemester !== 'all' && !availableSemesters.find(s => s.name === selectedSemester)) {
                setSelectedSemester('all');
            }
        }
    }, [selectedAcademicYear, semesters, selectedSemester]);

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
                                        placeholder={!isUpdate ? "VD: N (sẽ tạo N01, N02, ...)" : ""}
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>

                                {/* Số lớp mở - chỉ hiện khi thêm mới */}
                                {!isUpdate && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="class_count">
                                            Số lớp mở
                                        </Label>
                                        <Input
                                            id="class_count"
                                            type="number"
                                            min="1"
                                            max="50"
                                            value={data.class_count}
                                            onChange={(e) => setData('class_count', parseInt(e.target.value) || 1)}
                                            className="w-full"
                                        />
                                        {data.name && data.class_count > 1 && (
                                            <p className="text-sm text-blue-600">
                                                Xem trước: {Array.from({ length: Math.min(data.class_count, 5) }, (_, i) => (
                                                    data.name + ' (N' + String(i + 1).padStart(2, '0') + ')'
                                                )).join(', ')}
                                                {data.class_count > 5 && '...'}
                                            </p>
                                        )}
                                        {errors.class_count && <p className="text-sm text-red-500">{errors.class_count}</p>}
                                    </div>
                                )}

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

            {/* Filters Section */}
            <div className="m-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
                    <div className="min-w-[200px]">
                        <Label htmlFor="academic-year-filter" className="text-sm font-medium mb-2 block">
                            Năm học
                        </Label>
                        <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                            <SelectTrigger id="academic-year-filter">
                                <SelectValue placeholder="Tất cả năm học" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả năm học</SelectItem>
                                {academicYears.map(year => (
                                    <SelectItem key={year.id} value={year.name}>
                                        {year.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="min-w-[200px]">
                        <Label htmlFor="semester-filter" className="text-sm font-medium mb-2 block">
                            Học kỳ
                        </Label>
                        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                            <SelectTrigger id="semester-filter">
                                <SelectValue placeholder="Tất cả học kỳ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả học kỳ</SelectItem>
                                {filteredSemesters.map(semester => (
                                    <SelectItem key={semester.id} value={semester.name}>
                                        {semester.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {(selectedAcademicYear && selectedAcademicYear !== 'all') || (selectedSemester && selectedSemester !== 'all') ? (
                        <div className="flex items-end">
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setSelectedAcademicYear('all');
                                    setSelectedSemester('all');
                                }}
                                className="mb-0"
                            >
                                Xóa bộ lọc
                            </Button>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* DataTable thay thế cho Table thông thường */}
            <div className="m-4">
                <DataTable
                    columns={columns}
                    data={currentClassrooms}
                    searchKey="name"
                    searchPlaceholder="Tìm kiếm theo tên lớp học..."
                    disablePagination={true}
                />
                <SimplePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredClassroomData.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
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