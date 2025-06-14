import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Megaphone } from 'lucide-react';
import { PageProps } from '@inertiajs/core';
import { Toaster } from "@/components/ui/sonner"
import { toast } from 'sonner';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Quản lý giáo viên',
        href: '/degrees',
    },
];
interface Degree {
    id: number,
    name: string,
    baseSalaryFactor: number,
    // issueDate: Date,
    specialization: string,
    createdAt: Date,
    updatedAt: Date
}
interface Department {
    id: number,
    name: string,
    abbrName: string,
    createdAt: Date,
    updatedAt: Date
}
interface Teacher {
    id: number,
    fullName: string,
    DOB: Date,
    phone: string,
    email: string,
    department_id: number | null,
    degree_id: number | null,
    department?: Department,
    degree?: Degree,
    createdAt: Date,
    updatedAt: Date,
}
interface CustomPageProps {
    teachers: Teacher[];
    degrees: Degree[];
    departments: Department[];
    flash?: {
        message?: string;
        error?: string;
        success?: string;
    };
}

// type PageProps = InertiaPageProps<Props>;

export default function Index({ teachers, degrees, departments }: CustomPageProps) {
    const page = usePage<PageProps>();
    const flash = page.props?.flash as CustomPageProps['flash'];
    const { data, setData, post, processing, errors, reset, delete: destroy, put } = useForm<
        {
            fullName: string;
            DOB: string;
            phone: string;
            email: string;
            department_id: number | null;  // Allow both number and null
            degree_id: number | null;
        }
    >({
        fullName: '',
        DOB: new Date().toISOString().split('T')[0],
        phone: '',
        email: '',
        department_id: null,
        degree_id: null
    });
    const [sheetOpen, setSheetOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const [pendingDeleteName, setPendingDeleteName] = useState<string | null>(null);
    const [pendingUpdateId, setPendingUpdateId] = useState<number | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const handleDelete = (id: number, name: string) => {
        setPendingDeleteId(id);
        setPendingDeleteName(name);
        setIsDialogOpen(true);
    }
    const confirmDelete = () => {
        if (pendingDeleteId !== null) {
            destroy(route('teachers.destroy', pendingDeleteId));
            setIsDialogOpen(false);
        }
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isUpdate) {
            post(route('teachers.store'), {
                onSuccess: () => {
                    toast.success('Thêm giáo viên mới thành công');
                    reset();
                    setSheetOpen(false);
                },
                onError: () => {
                    toast.error('Thêm giáo viên mới thất bại');
                    reset();
                }
            })
        }
        else {
            if (pendingUpdateId !== null) {
                put(route('teachers.update', pendingUpdateId), {
                    onSuccess: () => {
                        toast.success('Cập nhật giáo viên thành công');
                        reset();
                        setSheetOpen(false);
                        setIsUpdate(false);
                    },
                    onError: () => {
                        toast.error('Cập nhật giáo viên thất bại');
                        reset();
                        setIsUpdate(false);
                    }
                });
            }
            else {
                toast.error("Thông tin giáo viên không được để trống khi update");
            }
        }
    }
    function handleUpdate(teacher: Teacher): void {
        setIsUpdate(true);
        setData({
            fullName: teacher.fullName,
            DOB: typeof teacher.DOB === 'object'
                ? teacher.DOB.toISOString().split('T')[0] // Convert Date to YYYY-MM-DD string
                : String(teacher.DOB), // Handle if it's already a string
            phone: teacher.phone,
            email: teacher.email,
            department_id: teacher.department_id,
            degree_id: teacher.degree_id
        });
        setPendingUpdateId(teacher.id);
        setSheetOpen(true);
    }

    const handleSheetOpenChange = (open: boolean) => {
        setSheetOpen(open);
        if (!open) {
            reset();
            setIsUpdate(false);
            setPendingUpdateId(null);
        }
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Toaster />
            <Head title="Quản lý giáo viên" />
            <div className='m-4'>
                <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
                    <SheetTrigger asChild>
                        <Button variant="default" className='hover:cursor-pointer'>Thêm giáo viên mới</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>{isUpdate ?
                                'Chỉnh sửa thông tin giáo viên' : 'Thêm giáo viên mới'}</SheetTitle>
                            <SheetDescription>
                                Nhập thông tin ở đây, sau đó nhấn lưu
                            </SheetDescription>
                        </SheetHeader>
                        <form onSubmit={handleSubmit} id="teacher-form" className="space-y-6 p-4">
                            <div className="space-y-4">
                                {/* Full Name Field */}
                                <div className="grid gap-2">
                                    <Label htmlFor="fullName">
                                        Tên giáo viên
                                    </Label>
                                    <Input
                                        id="fullName"
                                        value={data.fullName}
                                        onChange={(e) => setData('fullName', e.target.value)}
                                        className="w-full"
                                    />
                                    {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                                </div>

                                {/* DOB Field */}
                                <div className="grid gap-2">
                                    <Label htmlFor="DOB">
                                        Ngày tháng năm sinh
                                    </Label>
                                    <Input
                                        id="DOB"
                                        value={data.DOB}
                                        onChange={(e) => setData('DOB', e.target.value)}
                                        type="date"
                                        className="w-full"
                                    />
                                    {errors.DOB && <p className="text-sm text-red-500">{errors.DOB}</p>}
                                </div>

                                {/* Phone Field */}
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">
                                        Số điện thoại
                                    </Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="w-full"
                                    />
                                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                                </div>

                                {/* Email Field */}
                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full"
                                    />
                                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                </div>

                                {/* Department Field */}
                                <div className="grid gap-2">
                                    <Label htmlFor="department_id">
                                        Khoa
                                    </Label>
                                    <select
                                        id="department_id"
                                        value={data.department_id || ''}
                                        onChange={(e) => setData('department_id', (e.target.value ? parseInt(e.target.value) : null) as any)}
                                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="">Chọn khoa</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </select>
                                    {errors.department_id && <p className="text-sm text-red-500">{errors.department_id}</p>}
                                </div>

                                {/* Degree Field */}
                                <div className="grid gap-2">
                                    <Label htmlFor="degree_id">
                                        Bằng cấp
                                    </Label>
                                    <select
                                        id="degree_id"
                                        value={data.degree_id || ''}
                                        onChange={(e) => setData('degree_id', (e.target.value ? parseInt(e.target.value) : null) as any)}
                                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="">Chọn bằng cấp</option>
                                        {degrees.map(degree => (
                                            <option key={degree.id} value={degree.id}>{degree.name}</option>
                                        ))}
                                    </select>
                                    {errors.degree_id && <p className="text-sm text-red-500">{errors.degree_id}</p>}
                                </div>
                            </div>
                        </form>
                        <SheetFooter>
                            <SheetClose asChild>
                                <Button variant="outline" type='button' className='hover:cursor-pointer'>Thoát</Button>
                            </SheetClose>
                            <Button
                                type="submit" form="teacher-form" disabled={processing}
                                className='hover:cursor-pointer'
                            >
                                {isUpdate ? 'Sửa thông tin' : 'Thêm mới'}
                            </Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>
            {/* <div className="m-4">
                <div>
                    {flash?.message && (
                        <Alert>
                            <Megaphone className="h-4 w-4" />
                            <AlertTitle>Thông báo</AlertTitle>
                            <AlertDescription>
                                {flash.message}
                            </AlertDescription>
                        </Alert>
                    )}

                </div>

            </div> */}
            {teachers.length > 0 ? (
                <div className="m-4">
                    <Table>
                        {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Id</TableHead>
                                <TableHead>Tên giáo viên</TableHead>
                                <TableHead>Ngày sinh</TableHead>
                                <TableHead>Số điện thoại</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Khoa</TableHead>
                                <TableHead>Bằng cấp</TableHead>
                                <TableHead className="text-center">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                teachers.map((teacher) => (
                                    <TableRow key={teacher.id}>
                                        <TableCell className="font-medium">{teacher.id}</TableCell>
                                        <TableCell>{teacher.fullName}</TableCell>
                                        <TableCell>
                                            {teacher.DOB
                                                ? new Date(teacher.DOB).toLocaleDateString('vi-VN')
                                                : ''}
                                        </TableCell>
                                        <TableCell>{teacher.phone}</TableCell>
                                        <TableCell>{teacher.email}</TableCell>
                                        <TableCell>{teacher.department?.abbrName || '-'}</TableCell>
                                        <TableCell>{teacher.degree?.name || '-'}</TableCell>
                                        <TableCell className="text-center space-x-2">
                                            <Button
                                                disabled={processing}
                                                onClick={() => handleUpdate(teacher)}
                                                className='bg-yellow-500 hover:bg-yellow-700 hover:cursor-pointer'
                                            >Sửa</Button>
                                            <Button
                                                disabled={processing}
                                                onClick={() => handleDelete(teacher.id, teacher.fullName)}
                                                className="bg-red-500 hover:bg-red-700 hover:cursor-pointer"
                                            >Xoá</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </div>
            )
                :
                (
                    <div className="m-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Id</TableHead>
                                    <TableHead>Tên giáo viên</TableHead>
                                    <TableHead>Ngày sinh</TableHead>
                                    <TableHead>Số điện thoại</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Khoa</TableHead>
                                    <TableHead>Bằng cấp</TableHead>
                                    <TableHead className="text-center">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                        </Table>
                    </div>
                )
            }
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xoá</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xoá giáo viên <strong>{pendingDeleteName}</strong> không? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className='hover:cursor-pointer'>Huỷ</AlertDialogCancel>
                        <AlertDialogAction className='hover:cursor-pointer' onClick={confirmDelete}>
                            Xác nhận
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
