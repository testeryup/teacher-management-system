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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    degrees: {
        data: Degree[];
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
    const { data, setData, post, processing, errors, reset, delete: destroy, put } = useForm({
        name: '',
        baseSalaryFactor: 0.00,
        // specialization: ''
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
        if (!isUpdate) {
            post(route('degrees.store'), {
                onSuccess: () => {
                    toast.success('Thêm bằng cấp mới thành công');
                    reset();
                    setSheetOpen(false);
                },
                onError: () => {
                    toast.error('Thêm bằng cấp mới thất bại');
                    reset();
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
                    },
                    onError: () => {
                        toast.error('Cập nhật bằng cấp thất bại');
                        reset();
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
                                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="baseSalaryFactor" className="text-right">
                                        Hệ số lương
                                    </Label>
                                    <Input
                                        id="baseSalaryFactor"
                                        value={data.baseSalaryFactor}
                                        onChange={(e) => setData('baseSalaryFactor', parseFloat(e.target.value) || 0)}
                                        className="col-span-3"
                                        type='number'
                                        step='0.1'
                                        min='0'
                                    />
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
            {degrees.data.length > 0 ? (
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
                                degrees.data.map((degree: Degree) => (
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
            <div className="mx-4">
                <Pagination 
                    links={degrees.links}
                    from={degrees.from}
                    to={degrees.to}
                    total={degrees.total}
                />
            </div>
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
