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
import { SimplePagination } from "@/components/ui/simple-pagination"

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Quản lý bằng cấp',
        href: '/degrees',
    },
];
interface Degree {
    id: number,
    name: string,
    baseSalaryFactor: number,
    createdAt: Date,
    updatedAt: Date
}
interface CustomPageProps {
    degrees: Degree[];
    flash?: {
        message?: string;
        error?: string;
        success?: string;
    };
}

// type PageProps = InertiaPageProps<Props>;

export default function Index({ degrees }: CustomPageProps) {
    const page = usePage<PageProps>();
    const flash = page.props?.flash as CustomPageProps['flash'];
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(degrees.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentDegrees = degrees.slice(startIndex, endIndex);
    
    const { data, setData, post, processing, errors, reset, delete: destroy, put } = useForm({
        name: '',
        baseSalaryFactor: 1.0,
        // specialization: ''
    });
    const [sheetOpen, setSheetOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const [pendingDeleteName, setPendingDeleteName] = useState<string | null>(null);
    const [pendingUpdateId, setPendingUpdateId] = useState<number | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const [localErrors, setLocalErrors] = useState<{[key: string]: string}>({});
    
    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};
        
        if (!data.name.trim()) {
            newErrors.name = 'Tên bằng cấp là bắt buộc';
        } else {
            // Check for duplicate name
            const trimmedName = data.name.trim().toLowerCase();
            const existingDegree = degrees.find(degree => {
                // For update, exclude current degree from check
                if (isUpdate && degree.id === pendingUpdateId) {
                    return false;
                }
                return degree.name.toLowerCase() === trimmedName;
            });
            
            if (existingDegree) {
                newErrors.name = 'Tên bằng cấp đã tồn tại trong hệ thống';
            }
        }
        
        if (data.baseSalaryFactor < 1.0 || data.baseSalaryFactor > 2.0) {
            newErrors.baseSalaryFactor = 'Hệ số lương phải từ 1.0 đến 2.0';
        }
        
        if (data.baseSalaryFactor === 0) {
            newErrors.baseSalaryFactor = 'Hệ số lương không được để trống hoặc bằng 0';
        }
        
        setLocalErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleDelete = (id: number, name: string) => {
        setPendingDeleteId(id);
        setPendingDeleteName(name);
        setIsDialogOpen(true);
    }

    const confirmDelete = () => {
        if (pendingDeleteId !== null) {
            destroy(route('degrees.destroy', pendingDeleteId), {
                onSuccess: () => {
                    toast.success('Xoá bằng cấp thành công');
                    setIsDialogOpen(false);
                },
                onError: (errors) => {
                    if (errors.reference) {
                        toast.error(`Không thể xoá bằng cấp này: ${errors.reference}`);
                    } else {
                        toast.error('Xoá bằng cấp thất bại');
                    }
                    setIsDialogOpen(false);
                }
            });
        }
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clear any existing local errors
        setLocalErrors({});
        
        // Validate form before submission
        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin đã nhập');
            return;
        }
        
        if (!isUpdate) {
            post(route('degrees.store'), {
                onSuccess: () => {
                    toast.success('Thêm bằng cấp mới thành công');
                    reset();
                    setSheetOpen(false);
                    setLocalErrors({});
                },
                onError: () => {
                    toast.error('Thêm bằng cấp mới thất bại');
                }
            })
        }
        else {
            if (pendingUpdateId !== null) {
                put(route('degrees.update', pendingUpdateId), {
                    onSuccess: () => {
                        toast.success('Cập nhật bằng cấp thành công');
                        reset();
                        setSheetOpen(false);
                        setIsUpdate(false);
                        setLocalErrors({});
                    },
                    onError: () => {
                        toast.error('Cập nhật bằng cấp thất bại');
                        setIsUpdate(false);
                    }
                });
            }
            else {
                toast.error("Bằng cấp không được để trống khi update");
            }
        }
    }
    function handleUpdate(degree: Degree): void {
        setIsUpdate(true);
        setData({
            ...degree
        });
        setPendingUpdateId(degree.id);
        setSheetOpen(true);
    }

    const handleSheetOpenChange = (open: boolean) => {
        setSheetOpen(open);
        if (!open) {
            reset();
            setIsUpdate(false);
            setPendingUpdateId(null);
            setLocalErrors({});
        }
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Toaster />
            <Head title="Quản lý bằng cấp" />
            <div className='m-4'>
                <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
                    <SheetTrigger asChild>
                        <Button variant="default" className='hover:cursor-pointer'>Thêm bằng cấp mới</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>{isUpdate ?
                                'Chỉnh sửa thông tin bằng cấp' : 'Thêm bằng cấp mới'}</SheetTitle>
                            <SheetDescription>
                                Nhập thông tin ở đây, sau đó nhấn lưu
                            </SheetDescription>
                        </SheetHeader>
                        <form onSubmit={handleSubmit} id="degree-form">
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Tên bằng cấp
                                    </Label>
                                    <div className="col-span-3">
                                        <Input 
                                            id="name" 
                                            value={data.name} 
                                            onChange={(e) => {
                                                setData('name', e.target.value);
                                                // Clear local errors when user starts typing
                                                if (localErrors.name) {
                                                    setLocalErrors(prev => ({...prev, name: ''}));
                                                }
                                            }} 
                                            className={errors.name || localErrors.name ? "border-red-500" : ""} 
                                        />
                                        {(errors.name || localErrors.name) && (
                                            <p className="text-sm text-red-500 mt-1">{errors.name || localErrors.name}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="baseSalaryFactor" className="text-right">
                                        Hệ số lương
                                    </Label>
                                    <div className="col-span-3">
                                        <Input
                                            id="baseSalaryFactor"
                                            value={data.baseSalaryFactor}
                                            onChange={(e) => {
                                                const value = parseFloat(e.target.value);
                                                if (!isNaN(value)) {
                                                    setData('baseSalaryFactor', value);
                                                } else if (e.target.value === '') {
                                                    setData('baseSalaryFactor', 1.0);
                                                }
                                                // Clear local errors when user starts typing
                                                if (localErrors.baseSalaryFactor) {
                                                    setLocalErrors(prev => ({...prev, baseSalaryFactor: ''}));
                                                }
                                            }}
                                            className={`${errors.baseSalaryFactor || localErrors.baseSalaryFactor ? "border-red-500" : ""}`}
                                            type='number'
                                            step='0.1'
                                            min='1.0'
                                            max='2.0'
                                            placeholder="1.0 - 2.0"
                                        />
                                        {(errors.baseSalaryFactor || localErrors.baseSalaryFactor) && (
                                            <p className="text-sm text-red-500 mt-1">{errors.baseSalaryFactor || localErrors.baseSalaryFactor}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">Hệ số lương phải từ 1.0 đến 2.0</p>
                                    </div>
                                </div>
                                {/* <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="issueDate" className="text-right">
                                        Ngày cấp
                                    </Label>
                                    <Input
                                        id="issueDate"
                                        value={data.issueDate}
                                        onChange={(e) => setData('issueDate', e.target.value)}
                                        className="col-span-3"
                                        type="date"
                                    />
                                </div> */}
                                {/* <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="specialization" className="text-right">
                                        Chuyên ngành
                                    </Label>
                                    <Input
                                        id="specialization"
                                        value={data.specialization}
                                        onChange={(e) => setData('specialization', e.target.value)}
                                        className="col-span-3" />
                                </div> */}
                            </div>

                        </form>
                        <SheetFooter>
                            <SheetClose asChild>
                                <Button variant="outline" type='button' className='hover:cursor-pointer'>Thoát</Button>
                            </SheetClose>
                            <Button
                                type="submit" form="degree-form" disabled={processing}
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
            {degrees.length > 0 ? (
                <div className="m-4">
                    <Table>
                        {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Id</TableHead>
                                <TableHead>Tên bằng cấp</TableHead>
                                <TableHead>Hệ số lương</TableHead>
                                {/* <TableHead>Chuyên ngành</TableHead> */}
                                <TableHead className="text-center">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                currentDegrees.map((degree) => (
                                    <TableRow key={degree.id}>
                                        <TableCell className="font-medium">{degree.id}</TableCell>
                                        <TableCell>{degree.name}</TableCell>
                                        <TableCell>{degree.baseSalaryFactor}</TableCell>
                                        {/* <TableCell>{degree.specialization}</TableCell> */}
                                        <TableCell className="text-center space-x-2">
                                            <Button
                                                disabled={processing}
                                                onClick={() => handleUpdate(degree)}
                                                className='bg-yellow-500 hover:bg-yellow-700 hover:cursor-pointer'
                                            >Sửa</Button>
                                            <Button
                                                disabled={processing}
                                                onClick={() => handleDelete(degree.id, degree.name)}
                                                className="bg-red-500 hover:bg-red-700 hover:cursor-pointer"
                                            >Xoá</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                    <SimplePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={degrees.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )
                :
                (
                    <div className="m-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Id</TableHead>
                                    <TableHead>Tên bằng cấp</TableHead>
                                    <TableHead>Hệ số lương</TableHead>
                                    {/* <TableHead>Ngày cấp</TableHead> */}
                                    {/* <TableHead>Chuyên ngành</TableHead> */}
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
                            Bạn có chắc chắn muốn xoá bằng cấp <strong>{pendingDeleteName}</strong> không? Hành động này không thể hoàn tác.
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
