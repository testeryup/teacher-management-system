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
import { Textarea } from '@/components/ui/textarea';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Quản lý khoa',
        href: '/departments',
    },
];
interface Department {
    id: number,
    name: string,
    abbrName: string,
    description: string,
    createdAt: Date,
    updatedAt: Date
}
interface CustomPageProps {
    departments: {
        data: Department[];
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

export default function Index({ departments }: CustomPageProps) {
    const page = usePage<PageProps>();
    const flash = page.props?.flash as CustomPageProps['flash'];
    const { data, setData, post, processing, errors, reset, delete: destroy } = useForm({
        name: '',
        abbrName: '',
        description: ''
    });
    const [sheetOpen, setSheetOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const [pendingDeleteName, setPendingDeleteName] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const validateForm = () => {
        if (!data.name.trim()) {
            toast.error('Tên khoa là bắt buộc');
            return false;
        }

        if (!data.abbrName.trim()) {
            toast.error('Tên viết tắt là bắt buộc');
            return false;
        }

        if (data.name.length > 255) {
            toast.error('Tên khoa không được vượt quá 255 ký tự');
            return false;
        }

        if (data.abbrName.length > 10) {
            toast.error('Tên viết tắt không được vượt quá 10 ký tự');
            return false;
        }

        return true;
    };
    const handleDelete = (id: number, name: string) => {
        setPendingDeleteId(id);
        setPendingDeleteName(name);
        setIsDialogOpen(true);
    }
    const confirmDelete = () => {
        if (pendingDeleteId !== null) {
            destroy(route('departments.destroy', pendingDeleteId));
            setIsDialogOpen(false);
        }
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        post(route('departments.store'), {
            onSuccess: () => {
                toast.success('Thêm khoa mới thành công');
                reset();
                setSheetOpen(false);
                
            },
            onError: () => {
                toast.error('Thêm khoa mới thất bại');
            }
        })
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Toaster />
            <Head title="Quản lý khoa" />
            <div className='m-4'>
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="default" className='hover:cursor-pointer'>Thêm khoa mới</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Thêm khoa mới</SheetTitle>
                            <SheetDescription>
                                Nhập thông tin ở đây, sau đó nhấn lưu
                            </SheetDescription>
                        </SheetHeader>
                        <form onSubmit={handleSubmit} id="department-form" className='p-4'>
                            <div>
                                <div className="grid grid-rows-2 items-center ">
                                    <Label htmlFor="name">
                                        Tên khoa
                                    </Label>
                                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                </div>
                                <div className="grid grid-rows-2 items-center">
                                    <Label htmlFor="abbrName">
                                        Tên viết tắt
                                    </Label>
                                    <Input id="abbrName" value={data.abbrName} onChange={(e) => setData('abbrName', e.target.value)} />
                                </div>
                                <div className="grid grid-rows-2 items-center">
                                    <Label htmlFor="description">
                                        Mô tả
                                    </Label>
                                    <Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                                </div>
                            </div>

                        </form>
                        <SheetFooter>
                            <SheetClose asChild>
                                <Button variant="outline" type='button' className='hover:cursor-pointer'>Thoát</Button>
                            </SheetClose>
                            <Button
                                type="submit" form="department-form" disabled={processing}
                                className='hover:cursor-pointer'
                            >
                                {processing ? 'Đang thêm...' : 'Thêm mới'}
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
            {departments.data.length > 0 ? (
                <div className="m-4">

                    <Table>
                        {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Id</TableHead>
                                <TableHead>Tên khoa</TableHead>
                                <TableHead>Tên viết tắt</TableHead>
                                <TableHead>Mô tả</TableHead>
                                <TableHead className="text-center">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                departments.data.map((department: Department) => (
                                    <TableRow key={department.id}>
                                        <TableCell className="font-medium">{department.id}</TableCell>
                                        <TableCell>{department.name}</TableCell>
                                        <TableCell>{department.abbrName}</TableCell>
                                        <TableCell>{department.description}</TableCell>
                                        <TableCell className="text-center space-x-2">
                                            <Button
                                                disabled={processing}
                                                onClick={() => handleDelete(department.id, department.name)}
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
                                    <TableHead>Tên khoa</TableHead>
                                    <TableHead>Tên viết tắt</TableHead>
                                    <TableHead className="text-center">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                        </Table>
                    </div>
                )
            }
            <div className="mx-4">
                <Pagination
                    links={departments.links}
                    from={departments.from}
                    to={departments.to}
                    total={departments.total}
                />
            </div>
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xoá</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xoá khoa <strong>{pendingDeleteName}</strong> không? Hành động này không thể hoàn tác.
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
