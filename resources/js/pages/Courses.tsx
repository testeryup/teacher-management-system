import React, { useEffect, useState } from 'react';
import { DataTable } from "@/components/ui/data-table";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from 'sonner';
import { ColumnDef } from "@tanstack/react-table";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MoreHorizontal } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Quản lý môn học',
        href: '/courses',
    },
];

// Course interface khớp với backend
interface Course {
    id: number;
    name: string;
    code: string;
    credits: number;
    lessons: number;
    course_coefficient: number;
    department_id: number | null;
    department?: Department;
}

// Department interface
interface Department {
    id: number;
    name: string;
    abbrName: string;
}

interface PaginatedCourses {
    data: Course[];
    links: any[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface CustomPageProps {
    courses: PaginatedCourses;
    departments: Department[];
}

// Course Actions Component
function CourseActions({ course, departments }: { course: Course, departments: Department[] }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isUpdateSheetOpen, setIsUpdateSheetOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { data: updateData, setData: setUpdateData, put, processing, reset: resetUpdate } = useForm({
        name: course.name,
        credits: course.credits,
        lessons: course.lessons,
        department_id: course.department_id,
        course_coefficient: course.course_coefficient
    });

    const { delete: destroy } = useForm();

    const handleDelete = () => {
        destroy(route('courses.destroy', course.id), {
            onSuccess: () => {
                toast.success('Xóa môn học thành công');
                setIsDeleteDialogOpen(false);
            },
            onError: () => {
                toast.error('Xóa môn học thất bại');
            }
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('courses.update', course.id), {
            onSuccess: () => {
                toast.success('Cập nhật môn học thành công');
                setIsUpdateSheetOpen(false);
                resetUpdate();
            },
            onError: (errors) => {
                if (errors.department_id) {
                    toast.error(errors.department_id);
                } else {
                    toast.error('Cập nhật môn học thất bại');
                }
            }
        });
    };

    return (
        <>
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Mở menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                    <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault();
                            setDropdownOpen(false);
                            setTimeout(() => setIsUpdateSheetOpen(true), 300);
                        }}
                    >
                        Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.preventDefault();
                            setDropdownOpen(false);
                            setTimeout(() => setIsDeleteDialogOpen(true), 300);
                        }}
                        className="text-red-600"
                    >
                        Xóa
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Update Sheet */}
            <Sheet open={isUpdateSheetOpen} onOpenChange={setIsUpdateSheetOpen}>
                <SheetContent className="w-[500px]">
                    <SheetHeader>
                        <SheetTitle>Chỉnh sửa môn học</SheetTitle>
                        <SheetDescription>
                            Cập nhật thông tin môn học
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleUpdate} className="space-y-4 p-4">
                        <div className="grid gap-2">
                            <Label htmlFor="update-name">Tên môn học</Label>
                            <Input
                                id="update-name"
                                value={updateData.name}
                                onChange={(e) => setUpdateData('name', e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="update-credits">Số tín chỉ</Label>
                            <Input
                                id="update-credits"
                                type="number"
                                min="1"
                                max="10"
                                value={updateData.credits}
                                onChange={(e) => setUpdateData('credits', parseInt(e.target.value) || 1)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="update-lessons">Số tiết học</Label>
                            <Input
                                id="update-lessons"
                                type="number"
                                min="1"
                                value={updateData.lessons}
                                onChange={(e) => setUpdateData('lessons', parseInt(e.target.value) || 1)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="update-coefficient">Hệ số học phần (1.0 - 1.5)</Label>
                            <Input
                                id="update-coefficient"
                                type="number"
                                step="0.1"
                                min="1.0"
                                max="1.5"
                                value={updateData.course_coefficient}
                                onChange={(e) => setUpdateData('course_coefficient', parseFloat(e.target.value) || 1.0)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="update-department">Khoa</Label>
                            <select
                                id="update-department"
                                value={updateData.department_id || ''}
                                onChange={(e) => setUpdateData('department_id', e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Chọn khoa</option>
                                {departments.map((dept: Department) => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                    </form>
                    <SheetFooter>
                        <SheetClose asChild>
                            <Button variant="outline">Hủy</Button>
                        </SheetClose>
                        <Button onClick={handleUpdate} disabled={processing}>
                            {processing ? 'Đang cập nhật...' : 'Cập nhật'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Delete Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa môn học "{course.name}"?
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={processing}>
                            {processing ? 'Đang xóa...' : 'Xóa'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default function Courses({ courses, departments }: CustomPageProps) {
    const { props } = usePage();
    const user = (props as any).auth?.user;

    const [sheetOpen, setSheetOpen] = useState(false);

    // Form data khớp với backend validation
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        credits: 1,
        lessons: 1,
        department_id: null as number | null,
        course_coefficient: 1.0
    });

    // Columns definition
    const columns: ColumnDef<Course>[] = [
        {
            accessorKey: "code",
            header: "Mã môn học",
        },
        {
            accessorKey: "name",
            header: "Tên môn học",
        },
        {
            accessorKey: "credits",
            header: "Số tín chỉ",
        },
        {
            accessorKey: "lessons",
            header: "Số tiết học",
        },
        {
            accessorKey: "course_coefficient",
            header: "Hệ số học phần",
            cell: ({ row }) => {
                const coefficient = row.getValue("course_coefficient") as number;
                return (
                    <span className={`font-medium px-2 py-1 rounded text-sm ${coefficient >= 1.4 ? 'bg-red-100 text-red-800' :
                        coefficient >= 1.2 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                        }`}>
                        {coefficient}
                    </span>
                );
            },
        },
        {
            accessorKey: "department",
            header: "Khoa",
            cell: ({ row }) => {
                const department = row.getValue("department") as Course["department"];
                return <div>{department?.abbrName || 'Chưa phân khoa'}</div>;
            },
        },
        {
            id: "actions",
            header: () => <div className="text-center">Hành động</div>,
            cell: ({ row }) => {
                const course = row.original;
                return <div className="text-center">
                    <CourseActions course={course} departments={departments} />
                </div>;
            },
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.name.trim()) {
            toast.error('Tên môn học là bắt buộc');
            return;
        }

        if (!data.credits || data.credits < 1 || data.credits > 10) {
            toast.error('Số tín chỉ phải từ 1 đến 10');
            return;
        }

        if (!data.lessons || data.lessons < 1) {
            toast.error('Số tiết học phải lớn hơn 0');
            return;
        }

        if (!data.course_coefficient || data.course_coefficient < 1.0 || data.course_coefficient > 1.5) {
            toast.error('Hệ số môn học phải từ 1.0 đến 1.5');
            return;
        }
        post(route('courses.store'), {
            onSuccess: () => {
                toast.success('Thêm môn học mới thành công');
                reset();
                setSheetOpen(false);
            },
            onError: (errors) => {
                console.log('Course errors:', errors);
                // FIX: Handle specific validation errors
                if (errors.name) {
                    toast.error(`Lỗi tên môn học: ${errors.name}`);
                } else if (errors.code) {
                    toast.error(`Lỗi mã môn học: ${errors.code}`);
                } else if (errors.department_id) {
                    toast.error(errors.department_id);
                } else {
                    toast.error('Thêm môn học mới thất bại');
                }
            }
        });
    };

    const handleSheetOpenChange = (open: boolean) => {
        setSheetOpen(open);
        if (!open) {
            reset();
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Toaster />
            <Head title="Quản lý môn học" />

            <div className="m-4">
                <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
                    <SheetTrigger asChild>
                        <Button className="mb-4 cursor-pointer">Thêm môn học mới</Button>
                    </SheetTrigger>
                    <SheetContent className="w-[500px]">
                        <SheetHeader>
                            <SheetTitle>Thêm môn học mới</SheetTitle>
                            <SheetDescription>
                                Nhập thông tin môn học ở đây, sau đó nhấn lưu
                            </SheetDescription>
                        </SheetHeader>

                        <form onSubmit={handleSubmit} id="course-form" className="space-y-6 p-4 overflow-auto">
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Tên môn học *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="VD: Lập trình cơ bản"
                                        required
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="credits">Số tín chỉ *</Label>
                                    <Input
                                        id="credits"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={data.credits}
                                        onChange={(e) => setData('credits', parseInt(e.target.value) || 1)}
                                        required
                                    />
                                    {errors.credits && <p className="text-sm text-red-500">{errors.credits}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="lessons">Số tiết học *</Label>
                                    <Input
                                        id="lessons"
                                        type="number"
                                        min="1"
                                        value={data.lessons}
                                        onChange={(e) => setData('lessons', parseInt(e.target.value) || 1)}
                                        required
                                    />
                                    {errors.lessons && <p className="text-sm text-red-500">{errors.lessons}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="course_coefficient">Hệ số học phần (1.0 - 1.5) *</Label>
                                    <Input
                                        id="course_coefficient"
                                        type="number"
                                        step="0.1"
                                        min="1.0"
                                        max="1.5"
                                        value={data.course_coefficient}
                                        onChange={(e) => setData('course_coefficient', parseFloat(e.target.value) || 1.0)}
                                        required
                                    />
                                    {errors.course_coefficient && <p className="text-sm text-red-500">{errors.course_coefficient}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="department_id">Khoa</Label>
                                    <select
                                        id="department_id"
                                        value={data.department_id || ''}
                                        onChange={(e) => setData('department_id', e.target.value ? parseInt(e.target.value) : null)}
                                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="">Chọn khoa</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </select>
                                    {errors.department_id && <p className="text-sm text-red-500">{errors.department_id}</p>}
                                </div>
                            </div>
                        </form>

                        <SheetFooter>
                            <SheetClose asChild>
                                <Button variant="outline" type="button" className='cursor-pointer'>Thoát</Button>
                            </SheetClose>
                            <Button
                                type="submit"
                                form="course-form"
                                className='cursor-pointer'
                                disabled={processing}
                            >
                                {processing ? 'Đang xử lý...' : 'Thêm mới'}
                            </Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>

                <div className="space-y-4">
                    <DataTable
                        columns={columns}
                        data={courses.data}
                        searchKey="name"
                        searchPlaceholder="Tìm kiếm môn học..."
                    />
                </div>
            </div>
        </AppLayout>
    );
}