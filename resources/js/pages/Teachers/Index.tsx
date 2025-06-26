// resources/js/pages/Teachers/Index.tsx

import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { PageProps } from '@inertiajs/core';
import { Toaster } from "@/components/ui/sonner"
import { toast } from 'sonner';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
} from "@/components/ui/sheet"
import {
    Table,
    TableBody,
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
} from "@/components/ui/alert-dialog"

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Quản lý giáo viên',
        href: '/teachers', // FIX: Correct href
    },
];

interface Degree {
    id: number,
    name: string,
    baseSalaryFactor: number,
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
    teachers: {
        data: Teacher[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    degrees: Degree[];
    departments: Department[];
    flash?: {
        message?: string;
        error?: string;
        success?: string;
    };
}

export default function Index({ teachers, degrees, departments }: CustomPageProps) {
    const page = usePage<PageProps>();
    const flash = page.props?.flash as CustomPageProps['flash'];

    // FIX: Add all required fields theo backend
    const { data, setData, post, processing, errors, reset, delete: destroy, put } = useForm<{
        fullName: string;
        DOB: string;
        phone: string;
        email: string;
        department_id: number | null;
        degree_id: number | null;
        password: string;           // FIX: Add password
        password_confirmation: string; // FIX: Add password confirmation
        role: string;              // FIX: Add role
    }>({
        fullName: '',
        DOB: new Date().toISOString().split('T')[0],
        phone: '',
        email: '',
        department_id: null,
        degree_id: null,
        password: '',              // FIX: Initialize
        password_confirmation: '', // FIX: Initialize
        role: 'teacher',          // FIX: Default role
    });

    const [sheetOpen, setSheetOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const [pendingDeleteName, setPendingDeleteName] = useState<string | null>(null);
    const [pendingUpdateId, setPendingUpdateId] = useState<number | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);

    // FIX: Add password visibility states
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const handleDelete = (id: number, name: string) => {
        setPendingDeleteId(id);
        setPendingDeleteName(name);
        setIsDialogOpen(true);
    }

    const confirmDelete = () => {
        if (pendingDeleteId !== null) {
            destroy(route('teachers.destroy', pendingDeleteId), {
                onSuccess: () => {
                    toast.success('Xóa giáo viên thành công');
                    setIsDialogOpen(false);
                    setPendingDeleteId(null);
                    setPendingDeleteName(null);
                },
                onError: (errors) => {
                    console.log('Delete errors:', errors);
                    if (errors.reference) {
                        toast.error(errors.reference);
                    } else if (errors.permission) {
                        toast.error(errors.permission);
                    } else {
                        toast.error('Không thể xóa giáo viên');
                    }
                    setIsDialogOpen(false);
                }
            });
        }
    };

    const validatePhone = (phone: string) => {
        const phoneRegex = /^[0-9]{10,11}$/;
        return phoneRegex.test(phone);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Client validation
        if (!data.fullName.trim()) {
            toast.error('Họ tên là bắt buộc');
            return;
        }

        if (!validatePhone(data.phone)) {
            toast.error('Số điện thoại chỉ được chứa số và có độ dài 10-11 chữ số');
            return;
        }

        if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            toast.error('Email không hợp lệ');
            return;
        }

        if (!data.department_id) {
            toast.error('Vui lòng chọn khoa');
            return;
        }

        if (!data.degree_id) {
            toast.error('Vui lòng chọn bằng cấp');
            return;
        }

        // FIX: Password validation
        if (!isUpdate) {
            if (!data.password || data.password.length < 8) {
                toast.error('Mật khẩu phải có ít nhất 8 ký tự');
                return;
            }

            if (data.password !== data.password_confirmation) {
                toast.error('Xác nhận mật khẩu không khớp');
                return;
            }
        } else {
            if (data.password && data.password.length < 8) {
                toast.error('Mật khẩu phải có ít nhất 8 ký tự');
                return;
            }

            if (data.password && data.password !== data.password_confirmation) {
                toast.error('Xác nhận mật khẩu không khớp');
                return;
            }
        }

        if (!isUpdate) {
            post(route('teachers.store'), {
                onSuccess: () => {
                    toast.success('Thêm giáo viên và tài khoản thành công');
                    reset();
                    setSheetOpen(false);
                },
                onError: (errors) => {
                    console.log('Teacher store errors:', errors);
                    if (errors.phone) {
                        toast.error(`Lỗi SDT: ${errors.phone}`);
                    } else if (errors.email) {
                        toast.error(`Lỗi email: ${errors.email}`);
                    } else if (errors.department_id) {
                        toast.error(errors.department_id);
                    } else if (errors.password) {
                        toast.error(errors.password);
                    } else if (errors.role) {
                        toast.error(errors.role);
                    } else if (errors.error) {
                        toast.error(errors.error);
                    } else {
                        toast.error('Thêm giáo viên mới thất bại');
                    }
                }
            });
        } else {
            if (pendingUpdateId !== null) {
                put(route('teachers.update', pendingUpdateId), {
                    onSuccess: () => {
                        toast.success('Cập nhật giáo viên thành công');
                        reset();
                        setSheetOpen(false);
                        setIsUpdate(false);
                        setPendingUpdateId(null);
                    },
                    onError: (errors) => {
                        console.log('Teacher update errors:', errors);
                        if (errors.phone) {
                            toast.error(`Lỗi SDT: ${errors.phone}`);
                        } else if (errors.email) {
                            toast.error(`Lỗi email: ${errors.email}`);
                        } else if (errors.department_id) {
                            toast.error(errors.department_id);
                        } else if (errors.permission) {
                            toast.error(errors.permission);
                        } else if (errors.password) {
                            toast.error(errors.password);
                        } else if (errors.error) {
                            toast.error(errors.error);
                        } else {
                            toast.error('Cập nhật giáo viên thất bại');
                        }
                    }
                });
            }
        }
    }

    function handleUpdate(teacher: Teacher): void {
        setIsUpdate(true);
        setData({
            fullName: teacher.fullName,
            DOB: typeof teacher.DOB === 'object'
                ? teacher.DOB.toISOString().split('T')[0]
                : String(teacher.DOB),
            phone: teacher.phone,
            email: teacher.email,
            department_id: teacher.department_id,
            degree_id: teacher.degree_id,
            password: '',              // FIX: Empty for update
            password_confirmation: '', // FIX: Empty for update
            role: 'teacher'           // FIX: Default role
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
            setShowPassword(false);
            setShowPasswordConfirm(false);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Toaster />
            <Head title="Quản lý giáo viên" />

            <div className='m-4'>
                <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
                    <SheetTrigger asChild>
                        <Button variant="default" className='hover:cursor-pointer'>
                            Thêm giáo viên mới
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>
                                {isUpdate ? 'Chỉnh sửa thông tin giáo viên' : 'Thêm giáo viên mới'}
                            </SheetTitle>
                            <SheetDescription>
                                {isUpdate
                                    ? 'Cập nhật thông tin giáo viên. Để trống mật khẩu nếu không muốn thay đổi.'
                                    : 'Nhập thông tin giáo viên và tạo tài khoản đăng nhập.'
                                }
                            </SheetDescription>
                        </SheetHeader>

                        <form onSubmit={handleSubmit} id="teacher-form" className="space-y-6 p-4 overflow-auto">
                            <div className="space-y-4">
                                {/* Full Name Field */}
                                <div className="grid gap-2">
                                    <Label htmlFor="fullName">
                                        Tên giáo viên <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="fullName"
                                        value={data.fullName}
                                        onChange={(e) => setData('fullName', e.target.value)}
                                        className="w-full"
                                        placeholder="Nhập họ tên đầy đủ"
                                    />
                                    {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                                </div>

                                {/* DOB Field */}
                                <div className="grid gap-2">
                                    <Label htmlFor="DOB">
                                        Ngày sinh <span className="text-red-500">*</span>
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
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9]/g, '');
                                            if (value.length <= 11) {
                                                setData('phone', value);
                                            }
                                        }}
                                        placeholder="0123456789"
                                        pattern="[0-9]{10,11}"
                                        maxLength={11}
                                        className="w-full"
                                    />
                                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                                </div>

                                {/* Email Field */}
                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        Email <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full"
                                        placeholder="email@example.com"
                                    />
                                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                </div>

                                {/* Department Field */}
                                <div className="grid gap-2">
                                    <Label htmlFor="department_id">
                                        Khoa <span className="text-red-500">*</span>
                                    </Label>
                                    <select
                                        id="department_id"
                                        value={data.department_id || ''}
                                        onChange={(e) => setData('department_id', e.target.value ? parseInt(e.target.value) : null)}
                                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="">Chọn khoa</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.id}>
                                                {dept.name} ({dept.abbrName})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.department_id && <p className="text-sm text-red-500">{errors.department_id}</p>}
                                </div>

                                {/* Degree Field */}
                                <div className="grid gap-2">
                                    <Label htmlFor="degree_id">
                                        Bằng cấp <span className="text-red-500">*</span>
                                    </Label>
                                    <select
                                        id="degree_id"
                                        value={data.degree_id || ''}
                                        onChange={(e) => setData('degree_id', e.target.value ? parseInt(e.target.value) : null)}
                                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="">Chọn bằng cấp</option>
                                        {degrees.map(degree => (
                                            <option key={degree.id} value={degree.id}>
                                                {degree.name} (Hệ số: {degree.baseSalaryFactor})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.degree_id && <p className="text-sm text-red-500">{errors.degree_id}</p>}
                                </div>

                                {/* FIX: Role Field */}
                                <div className="grid gap-2">
                                    <Label htmlFor="role">
                                        Vai trò <span className="text-red-500">*</span>
                                    </Label>
                                    <select
                                        id="role"
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="teacher">Giảng viên</option>
                                        <option value="department_head">Trưởng khoa</option>
                                        <option value="accountant">Kế toán</option>
                                    </select>
                                    {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
                                </div>

                                {/* FIX: Password Fields */}
                                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">
                                            {isUpdate ? 'Đổi mật khẩu (tùy chọn)' : 'Tạo tài khoản đăng nhập'}
                                        </Label>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password">
                                            Mật khẩu {!isUpdate && <span className="text-red-500">*</span>}
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder={isUpdate ? "Để trống nếu không đổi" : "Nhập mật khẩu (tối thiểu 8 ký tự)"}
                                                className="pr-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation">
                                            Xác nhận mật khẩu {!isUpdate && <span className="text-red-500">*</span>}
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password_confirmation"
                                                type={showPasswordConfirm ? "text" : "password"}
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                placeholder={isUpdate ? "Để trống nếu không đổi" : "Nhập lại mật khẩu"}
                                                className="pr-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                            >
                                                {showPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                        {errors.password_confirmation && <p className="text-sm text-red-500">{errors.password_confirmation}</p>}
                                    </div>
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
                                form="teacher-form"
                                disabled={processing}
                                className='hover:cursor-pointer'
                            >
                                {processing ? 'Đang xử lý...' : (isUpdate ? 'Cập nhật' : 'Thêm mới')}
                            </Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Teachers Table - Giữ nguyên style cũ */}
            {teachers.data.length > 0 ? (
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
                        <TableBody>
                            {teachers.data.map((teacher: Teacher) => (
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
                                        >
                                            Sửa
                                        </Button>
                                        <Button
                                            disabled={processing}
                                            onClick={() => handleDelete(teacher.id, teacher.fullName)}
                                            className="bg-red-500 hover:bg-red-700 hover:cursor-pointer"
                                        >
                                            Xoá
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
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
            )}

            {/* Pagination */}
            <div className="mx-4">
                <Pagination
                    links={teachers.links}
                    from={teachers.from}
                    to={teachers.to}
                    total={teachers.total}
                />
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xoá</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xoá giáo viên <strong>{pendingDeleteName}</strong> không?
                            <br />
                            <span className="text-red-600 font-medium">
                                Hành động này sẽ xóa cả tài khoản đăng nhập và không thể hoàn tác.
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            className='hover:cursor-pointer'
                            disabled={processing}
                        >
                            Huỷ
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className='hover:cursor-pointer'
                            onClick={confirmDelete}
                            disabled={processing}
                        >
                            {processing ? 'Đang xóa...' : 'Xác nhận'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}