import React, { useEffect, useState } from 'react';
import { DataTable } from "@/components/ui/data-table";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageProps } from '@inertiajs/core';
import { Pagination } from '@/components/ui/pagination';
import { toast, Toaster } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Quản lý môn học',
        href: '/courses',
    },
];

// Updated Course interface
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
    createdAt: string;
    updatedAt: string;
}

// Updated Department interface
interface Department {
    id: number;
    name: string;
    abbrName?: string;
}

interface PaginatedCourses {
    data: Course[];
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
    departments: Department[];
}

interface CustomPageProps {
    courses: PaginatedCourses;
    departments: Department[];
    flash?: {
        message?: string;
        error?: string;
        success?: string;
    };
}

// Updated columns with department
// export const columns: ColumnDef<Course>[] = [
//     {
//         accessorKey: "id",
//         header: "ID",
//     },
//     {
//         accessorKey: "code",
//         header: "Mã môn học",
//     },
//     {
//         accessorKey: "name",
//         header: "Tên môn học",
//     },
//     {
//         accessorKey: "credits",
//         header: "Số tín chỉ",
//     },
//     {
//         accessorKey: "lessons",
//         header: "Số tiết học",
//     },
//     {
//         accessorKey: "department",
//         header: "Khoa",
//         cell: ({ row }) => {
//             const department = row.getValue("department") as Course["department"];
//             return <div>{department?.abbrName || 'Chưa phân khoa'}</div>;
//         },
//     },
//     {
//         id: "actions",
//         header: () => <div className="text-center">Hành động</div>,
//         cell: ({ row }) => {
//             const course = row.original;
//             return <CourseActions course={course} />;
//         },
//     },
// ];

// Separate component for actions
function CourseActions({ course, departments }: { course: Course, departments: Department[] }) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isUpdateSheetOpen, setIsUpdateSheetOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { delete: destroy, put, processing } = useForm();
    const { data: updateData, setData: setUpdateData, reset: resetUpdate } = useForm({
        name: course.name,
        credits: course.credits,
        lessons: course.lessons,
        department_id: course.department_id,
    });
    useEffect(() => {
        console.log('CourseActions state:', {
            isUpdateSheetOpen,
            dropdownOpen,
            isDeleteDialogOpen
        });
    }, [isUpdateSheetOpen, dropdownOpen, isDeleteDialogOpen]);


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
            onError: () => {
                toast.error('Cập nhật môn học thất bại');
            }
        });
    };

    return (
        <>
            <DropdownMenu
                open={dropdownOpen}
                onOpenChange={(open) => {
                    console.log('Dropdown state changing to:', open);
                    setDropdownOpen(open);
                }}>
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
                            e.preventDefault(); // Prevent default behavior
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
                <SheetContent>
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
                    <SheetFooter className="mt-4">
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
    const isAdmin = user?.role === 'admin';
    const isDepartmentHead = user?.role === 'department_head';

    const [sheetOpen, setSheetOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        credits: 1,
        lessons: 1,
        department_id: null as number | null
    });
    const columns: ColumnDef<Course>[] = [
        {
            accessorKey: "id",
            header: "ID",
        },
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
                return <CourseActions course={course} departments={departments} />;
            },
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('courses.store'), {
            onSuccess: () => {
                toast.success('Thêm môn học mới thành công');
                reset();
                setSheetOpen(false);
            },
            onError: () => {
                toast.error('Thêm môn học mới thất bại');
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
                        <Button className="mb-4">Thêm môn học mới</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Thêm môn học mới</SheetTitle>
                            <SheetDescription>
                                Nhập thông tin môn học ở đây, sau đó nhấn lưu
                            </SheetDescription>
                        </SheetHeader>
                        <form onSubmit={handleSubmit} id="course-form" className="space-y-6 p-4">
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Tên môn học</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="VD: Lập trình cơ bản"
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="credits">Số tín chỉ</Label>
                                    <Input
                                        id="credits"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={data.credits}
                                        onChange={(e) => setData('credits', parseInt(e.target.value) || 1)}
                                    />
                                    {errors.credits && <p className="text-sm text-red-500">{errors.credits}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="lessons">Số tiết học</Label>
                                    <Input
                                        id="lessons"
                                        type="number"
                                        min="1"
                                        value={data.lessons}
                                        onChange={(e) => setData('lessons', parseInt(e.target.value) || 1)}
                                    />
                                    {errors.lessons && <p className="text-sm text-red-500">{errors.lessons}</p>}
                                </div>

                                {/* Department Field */}
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
                                <Button variant="outline" type="button">Thoát</Button>
                            </SheetClose>
                            <Button
                                type="submit"
                                form="course-form"
                                disabled={processing}
                            >
                                {processing ? 'Đang xử lý...' : 'Thêm mới'}
                            </Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>

                <div className="space-y-4">
                    <DataTable columns={columns} data={courses.data} />
                    <div className="mt-4">
                        <Pagination
                            links={courses.links.map(link => ({
                                ...link,
                                url: link.url === undefined ? null : link.url
                            }))}
                            from={courses.from}
                            to={courses.to}
                            total={courses.total}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}