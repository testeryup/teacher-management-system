import React, { useState } from 'react';
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

// Course interface matching your Course model
interface Course {
    id: number;
    name: string;
    code: string;
    credits: number;
    lessons: number;
    createdAt: string;
    updatedAt: string;
}

// Pagination interface matching Laravel's pagination
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
}

interface CustomPageProps {
    courses: PaginatedCourses;
    flash?: {
        message?: string;
        error?: string;
        success?: string;
    };
}

// Update columns for Course data
export const columns: ColumnDef<Course>[] = [
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
        id: "actions",
        header: () => <div className="text-center">Hành động</div>,
        cell: ({ row }) => {
            const course = row.original;
            return <CourseActions course={course}/>;
        },
    },
];

// Separate component for actions to handle state
function CourseActions({ course }: { course: Course }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false); // Add this state

    const { delete: destroy, processing } = useForm();

    const handleDelete = () => {
        destroy(route('courses.destroy', course.id), {
            onSuccess: () => {
                toast.success('Xoá môn học thành công');
                setIsDialogOpen(false);
            },
            onError: (errors) => {
                if (errors.error) {
                    toast.error(errors.error as string);
                } else {
                    toast.error('Không thể xoá môn học này');
                }
                setIsDialogOpen(false);
            }
        });
    };

    return (
        <div className='text-center'>
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {/* <DropdownMenuLabel>Hành động</DropdownMenuLabel> */}
                    <DropdownMenuItem
                        onClick={() => navigator.clipboard.writeText(course.code.toString())}
                    >
                        Copy mã môn học
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {/* <DropdownMenuItem>Sửa thông tin</DropdownMenuItem> */}
                    <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => {
                            setDropdownOpen(false)
                            setTimeout(() => setIsDialogOpen(true), 100);
                        }}
                    >
                        Xoá
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xoá</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xoá môn học <strong>{course.name}</strong> không? 
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Huỷ</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete}
                            disabled={processing}
                            className="bg-red-600 hover:bg-red-700"
                            type="button"
                        >
                            Xác nhận
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// Pagination component
function Pagination({ courses }: { courses: PaginatedCourses }) {
    if (courses.last_page <= 1) return null;

    return (
        <div className="flex items-center justify-between px-2">
            <div className="text-sm text-muted-foreground">
                Hiển thị {courses.from} đến {courses.to} trong tổng số {courses.total} kết quả
            </div>
            <div className="flex items-center space-x-1">
                {courses.links.map((link, index) => {
                    if (!link.url && link.label.includes('...')) {
                        return <span key={index} className="px-2">...</span>;
                    }
                    
                    return (
                        <Link
                            key={index}
                            href={link.url || '#'}
                            className={`px-3 py-1 rounded-md text-sm ${
                                link.active 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'hover:bg-muted'
                            } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default function Courses({ courses }: CustomPageProps) {
    const [sheetOpen, setSheetOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        credits: 1,
        lessons: 1,
    });

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
                <div className="">
                    {/* <h1 className="text-2xl font-semibold">Quản lý môn học</h1> */}
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
                                            // type="number"
                                            // min="1"
                                            value={data.lessons}
                                            onChange={(e) => setData('lessons', parseInt(e.target.value) || 1)}
                                        />
                                        {errors.lessons && <p className="text-sm text-red-500">{errors.lessons}</p>}
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
                </div>
                
                <div className="space-y-4">
                    <DataTable columns={columns} data={courses.data} />
                    <Pagination courses={courses} />
                </div>
            </div>
        </AppLayout>
    );
}