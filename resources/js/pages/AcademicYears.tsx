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
} from "@/components/ui/alert-dialog"
import { Pagination } from '@/components/ui/pagination';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Quản lý năm học',
        href: '/academicyears',
    },
];

interface Semester {
    id: number;
    name: string;
    academicYear_id: number;
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
}

interface AcademicYear {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    semesters?: Semester[];
    createdAt: string;
    updatedAt: string;
}

interface CustomPageProps {
    academicYears: {
        data: AcademicYear[];
        current_page: number;
        last_page: number;
        total: number;
        from?: number;
        to?: number;
        links?: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
    flash?: {
        message?: string;
        error?: string;
        success?: string;
    };
}

interface AcademicYearFormData {
    name: string;
    startDate: string;
    endDate: string;
    semesterCount: number;
    [key: string]: any;
}

export default function Index({ academicYears }: CustomPageProps) {
    const page = usePage<PageProps>();
    const flash = page.props?.flash as CustomPageProps['flash'];

    const { data, setData, post, processing, errors, reset, delete: destroy, put } = useForm<AcademicYearFormData>({
        name: '',
        startDate: '',
        endDate: '',
        semesterCount: 2
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
            destroy(route('academicyears.destroy', pendingDeleteId), {
                onSuccess: () => {
                    toast.success('Xoá năm học thành công');
                    setIsDialogOpen(false);
                },
                onError: (errors) => {
                    if (errors.error) {
                        toast.error(errors.error as string);
                    } else {
                        toast.error('Không thể xoá năm học này');
                    }
                    setIsDialogOpen(false);
                }
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isUpdate) {
            post(route('academicyears.store'), {
                onSuccess: () => {
                    toast.success('Thêm năm học mới thành công');
                    reset();
                    setSheetOpen(false);
                },
                onError: () => {
                    toast.error('Thêm năm học mới thất bại');
                }
            })
        } else {
            if (pendingUpdateId !== null) {
                put(route('academicyears.update', pendingUpdateId), {
                    onSuccess: () => {
                        toast.success('Cập nhật năm học thành công');
                        reset();
                        setSheetOpen(false);
                        setIsUpdate(false);
                    },
                    onError: () => {
                        toast.error('Cập nhật năm học thất bại');
                        setIsUpdate(false);
                    }
                });
            } else {
                toast.error("Thông tin năm học không được để trống khi cập nhật");
            }
        }
    }

    function handleUpdate(academicYear: AcademicYear): void {
        setIsUpdate(true);

        // Helper function to safely format dates
        const formatDateForInput = (dateString: string) => {
            try {
                // Handle different date formats
                const date = new Date(dateString);
                if (isNaN(date.getTime())) {
                    console.warn('Invalid date:', dateString);
                    return '';
                }
                return date.toISOString().split('T')[0];
            } catch (error) {
                console.error('Error formatting date:', error);
                return '';
            }
        };

        console.log('Original dates:', {
            startDate: academicYear.startDate,
            endDate: academicYear.endDate,
            startDateType: typeof academicYear.startDate,
            endDateType: typeof academicYear.endDate
        });

        const formattedStartDate = formatDateForInput(academicYear.startDate);
        const formattedEndDate = formatDateForInput(academicYear.endDate);

        console.log('Formatted dates:', {
            startDate: formattedStartDate,
            endDate: formattedEndDate
        });

        setData({
            name: academicYear.name,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            semesterCount: academicYear.semesters?.length || 2
        });

        setPendingUpdateId(academicYear.id);
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
            <Head title="Quản lý năm học" />
            <div className='m-4'>
                <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
                    <SheetTrigger asChild>
                        <Button variant="default" className='hover:cursor-pointer'>Thêm năm học mới</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>
                                {isUpdate ? 'Chỉnh sửa thông tin năm học' : 'Thêm năm học mới'}
                            </SheetTitle>
                            <SheetDescription>
                                Nhập thông tin năm học và số lượng học kỳ
                            </SheetDescription>
                        </SheetHeader>
                        <form onSubmit={handleSubmit} id="academic-year-form" className="space-y-6 p-4">
                            <div className="space-y-4">
                                {/* Academic Year Name */}
                                <div className="grid gap-2">
                                    <Label htmlFor="name">
                                        Tên năm học
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full"
                                        placeholder="VD: Năm học 2023-2024"
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>

                                {/* Start Date */}
                                <div className="grid gap-2">
                                    <Label htmlFor="startDate">
                                        Ngày bắt đầu
                                    </Label>
                                    <Input
                                        id="startDate"
                                        value={data.startDate}
                                        onChange={(e) => setData('startDate', e.target.value)}
                                        type="date"
                                        className="w-full"
                                    />
                                    {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
                                </div>

                                {/* End Date */}
                                <div className="grid gap-2">
                                    <Label htmlFor="endDate">
                                        Ngày kết thúc
                                    </Label>
                                    <Input
                                        id="endDate"
                                        value={data.endDate}
                                        onChange={(e) => setData('endDate', e.target.value)}
                                        type="date"
                                        className="w-full"
                                    />
                                    {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
                                </div>

                                {/* Semester Count - Only show when adding new */}
                                {!isUpdate && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="semesterCount">
                                            Số lượng học kỳ
                                        </Label>
                                        <select
                                            id="semesterCount"
                                            value={data.semesterCount}
                                            onChange={(e) => setData('semesterCount', parseInt(e.target.value))}
                                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value={1}>1 học kỳ</option>
                                            <option value={2}>2 học kỳ</option>
                                            <option value={3}>3 học kỳ</option>
                                        </select>
                                        {errors.semesterCount && <p className="text-sm text-red-500">{errors.semesterCount}</p>}
                                    </div>
                                )}
                            </div>
                        </form>
                        <SheetFooter>
                            <SheetClose asChild>
                                <Button variant="outline" type='button' className='hover:cursor-pointer'>Thoát</Button>
                            </SheetClose>
                            <Button
                                type="submit"
                                form="academic-year-form"
                                disabled={processing}
                                className='hover:cursor-pointer'
                            >
                                {processing ? 'Đang xử lý...' : (isUpdate ? 'Cập nhật' : 'Thêm mới')}
                            </Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Flash Messages */}
            <div className="m-4">
                <div>
                    {flash?.message && (
                        <Alert>
                            <Megaphone className="h-4 w-4" />
                            <AlertTitle>Thông báo</AlertTitle>
                            <AlertDescription>{flash.message}</AlertDescription>
                        </Alert>
                    )}
                    {flash?.error && (
                        <Alert variant="destructive">
                            <Megaphone className="h-4 w-4" />
                            <AlertTitle>Lỗi</AlertTitle>
                            <AlertDescription>{flash.error}</AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>

            {/* Academic Years Table */}
            {academicYears.data.length > 0 ? (
                <div className="m-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead>Tên năm học</TableHead>
                                <TableHead>Ngày bắt đầu</TableHead>
                                <TableHead>Ngày kết thúc</TableHead>
                                <TableHead>Số học kỳ</TableHead>
                                <TableHead className="text-center">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {academicYears.data.map((academicYear) => (
                                <TableRow key={academicYear.id}>
                                    <TableCell className="font-medium">{academicYear.id}</TableCell>
                                    <TableCell>{academicYear.name}</TableCell>
                                    <TableCell>
                                        {new Date(academicYear.startDate).toLocaleDateString('vi-VN')}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(academicYear.endDate).toLocaleDateString('vi-VN')}
                                    </TableCell>
                                    <TableCell>{academicYear.semesters?.length || 0}</TableCell>
                                    <TableCell className="text-center space-x-2">
                                        {/* <Button
                                            disabled={processing}
                                            onClick={() => handleUpdate(academicYear)}
                                            className='bg-yellow-500 hover:bg-yellow-700 hover:cursor-pointer'
                                        >
                                            Sửa
                                        </Button> */}
                                        <Button
                                            disabled={processing}
                                            onClick={() => handleDelete(academicYear.id, academicYear.name)}
                                            className="bg-red-500 hover:bg-red-700 hover:cursor-pointer"
                                        >
                                            Xoá
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    
                    {/* Pagination Component */}
                    <div className="mt-4">
                        <Pagination
                            links={academicYears.links || []}
                            from={academicYears.from || 0}
                            to={academicYears.to || 0}
                            total={academicYears.total || 0}
                        />
                    </div>
                </div>
            ) : (
                <div className="m-4">
                    <div className="text-center py-8">
                        <p className="text-gray-500">Chưa có năm học nào được tạo</p>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xoá</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xoá năm học <strong>{pendingDeleteName}</strong> không?
                            Hành động này sẽ xoá tất cả học kỳ liên quan và không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className='hover:cursor-pointer'>Huỷ</AlertDialogCancel>
                        <AlertDialogAction
                            className='hover:cursor-pointer bg-red-600 hover:bg-red-700'
                            onClick={confirmDelete}
                        >
                            Xác nhận
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}