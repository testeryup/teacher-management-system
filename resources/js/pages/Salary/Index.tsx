// resources/js/pages/Salary/Index.tsx

import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { toast, Toaster } from 'sonner';
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
import { Calculator, FileText, Lock } from 'lucide-react';

interface SalaryConfig {
    id: number;
    month: string;
    base_salary_per_lesson: number;
    status: 'draft' | 'active' | 'closed';
    created_at: string;
}

interface Props {
    salaryConfigs: {
        data: SalaryConfig[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function SalaryIndex({ salaryConfigs }: Props) {
    const [sheetOpen, setSheetOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        month: '',
        base_salary_per_lesson: 50000,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('salary.store'), {
            onSuccess: () => {
                toast.success('Tạo cấu hình lương thành công');
                reset();
                setSheetOpen(false);
            },
            onError: () => {
                toast.error('Tạo cấu hình lương thất bại');
            }
        });
    };

    // SỬA LẠI FUNCTION NÀY - ĐÂY LÀ LỖI CHÍNH!
    const handleCalculate = (salaryConfig: SalaryConfig) => {
        if (confirm(`Bạn có chắc muốn tính lương cho tháng ${salaryConfig.month}?`)) {
            router.post(route('salary.calculate', salaryConfig.id), {}, {
                onSuccess: () => {
                    toast.success('Tính lương thành công');
                },
                onError: (errors) => {
                    console.error('Calculation errors:', errors);
                    toast.error('Tính lương thất bại');
                }
            });
        }
    };

    const handleClose = (salaryConfig: SalaryConfig) => {
        if (confirm(`Bạn có chắc muốn đóng bảng lương tháng ${salaryConfig.month}? Sau khi đóng sẽ không thể sửa được nữa.`)) {
            router.patch(route('salary.close', salaryConfig.id), {}, {
                onSuccess: () => {
                    toast.success('Đã đóng bảng lương');
                },
                onError: () => {
                    toast.error('Đóng bảng lương thất bại');
                }
            });
        }
    };

    const columns = [
        {
            accessorKey: "month",
            header: "Tháng",
        },
        {
            accessorKey: "base_salary_per_lesson",
            header: "Tiền/tiết",
            cell: ({ row }: any) => {
                const amount = row.getValue("base_salary_per_lesson") as number;
                return new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                }).format(amount);
            },
        },
        {
            accessorKey: "status",
            header: "Trạng thái",
            cell: ({ row }: any) => {
                const status = row.getValue("status") as string;
                const statusMap = {
                    draft: { label: 'Nháp', className: 'bg-gray-100 text-gray-800' },
                    active: { label: 'Đang tính', className: 'bg-green-100 text-green-800' },
                    closed: { label: 'Đã đóng', className: 'bg-red-100 text-red-800' }
                };
                
                return (
                    <Badge className={statusMap[status as keyof typeof statusMap].className}>
                        {statusMap[status as keyof typeof statusMap].label}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            header: "Hành động",
            cell: ({ row }: any) => {
                const salaryConfig = row.original as SalaryConfig;
                return (
                    <div className="flex gap-2">
                        {salaryConfig.status === 'draft' && (
                            <Button
                                size="sm"
                                onClick={() => handleCalculate(salaryConfig)}
                                className="bg-blue-500 hover:bg-blue-600"
                            >
                                <Calculator className="w-4 h-4 mr-1" />
                                Tính lương
                            </Button>
                        )}
                        
                        {(salaryConfig.status === 'active' || salaryConfig.status === 'closed') && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.visit(route('salary.report', salaryConfig.id))}
                            >
                                <FileText className="w-4 h-4 mr-1" />
                                Xem báo cáo
                            </Button>
                        )}
                        
                        {salaryConfig.status === 'active' && (
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleClose(salaryConfig)}
                            >
                                <Lock className="w-4 h-4 mr-1" />
                                Đóng
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Quản lý lương', href: '/salary' }]}>
            <Toaster />
            <Head title="Quản lý lương giáo viên" />

            <div className="m-4">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                        <Button className="mb-4">Tạo cấu hình lương mới</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Tạo cấu hình lương</SheetTitle>
                            <SheetDescription>
                                Tạo cấu hình lương cho tháng mới
                            </SheetDescription>
                        </SheetHeader>
                        
                        <form onSubmit={handleSubmit} className="space-y-4 p-4">
                            <div className="grid gap-2">
                                <Label htmlFor="month">Tháng (YYYY-MM)</Label>
                                <Input
                                    id="month"
                                    type="month"
                                    value={data.month}
                                    onChange={(e) => setData('month', e.target.value)}
                                    required
                                />
                                {errors.month && <p className="text-sm text-red-500">{errors.month}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="base_salary_per_lesson">Tiền dạy một tiết (VND)</Label>
                                <Input
                                    id="base_salary_per_lesson"
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={data.base_salary_per_lesson}
                                    onChange={(e) => setData('base_salary_per_lesson', parseInt(e.target.value) || 0)}
                                    required
                                />
                                {errors.base_salary_per_lesson && <p className="text-sm text-red-500">{errors.base_salary_per_lesson}</p>}
                            </div>
                        </form>
                        
                        <SheetFooter>
                            <SheetClose asChild>
                                <Button variant="outline">Hủy</Button>
                            </SheetClose>
                            <Button onClick={handleSubmit} disabled={processing}>
                                {processing ? 'Đang tạo...' : 'Tạo mới'}
                            </Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>

                <DataTable
                    columns={columns}
                    data={salaryConfigs.data}
                    searchKey="month"
                    searchPlaceholder="Tìm theo tháng..."
                />
            </div>
        </AppLayout>
    );
}