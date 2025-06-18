import React, { useState, useMemo } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SimpleSelect } from '@/components/ui/simple-select';
import { toast, Toaster } from 'sonner';
import { BreadcrumbItem } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Calculator,
    FileText,
    Lock,
    Plus,
    Info,
    DollarSign,
    Download,
    ChevronDown,
    Eye
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tính lương giáo viên',
        href: '/salary',
    },
];

interface AcademicYear {
    id: number;
    name: string;
}

interface Semester {
    id: number;
    name: string;
    academicYear: AcademicYear;
}

interface SalaryConfig {
    id: number;
    semester_id: number;
    semester: Semester;
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
    semesters: Semester[];
}

export default function SalaryIndex({ salaryConfigs, semesters }: Props) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        semester_id: '',
        base_salary_per_lesson: 50000,
    });

    // FIX: Memoize semester options để tránh re-render
    const semesterOptions = useMemo(() => {
        return semesters.map(semester => ({
            value: semester.id.toString(),
            label: semester.name,
            sublabel: semester.academicYear?.name || 'N/A'
        }));
    }, [semesters]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // FIX: Validate trước khi submit
        if (!data.semester_id) {
            toast.error('Vui lòng chọn học kỳ');
            return;
        }

        if (!data.base_salary_per_lesson || data.base_salary_per_lesson <= 0) {
            toast.error('Vui lòng nhập tiền dạy một tiết hợp lệ');
            return;
        }

        post(route('salary.store'), {
            onSuccess: () => {
                toast.success('Tạo cấu hình lương thành công!');
                reset();
                setCreateDialogOpen(false);
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                if (errors.semester_id) {
                    toast.error(`Lỗi học kỳ: ${errors.semester_id}`);
                } else if (errors.base_salary_per_lesson) {
                    toast.error(`Lỗi tiền/tiết: ${errors.base_salary_per_lesson}`);
                } else {
                    toast.error('Tạo cấu hình lương thất bại');
                }
            }
        });
    };

    const handleCalculate = (salaryConfig: SalaryConfig) => {
        const semesterName = salaryConfig.semester?.name || 'N/A';
        if (confirm(`Bạn có chắc muốn tính lương cho học kỳ ${semesterName}?\n\nHệ thống sẽ tính lương cho tất cả lớp học có giáo viên trong học kỳ này.`)) {
            router.post(route('salary.calculate', salaryConfig.id), {}, {
                onSuccess: () => {
                    toast.success('Tính lương thành công!');
                },
                onError: (errors) => {
                    console.error('Calculation errors:', errors);
                    if (errors.status) {
                        toast.error(errors.status);
                    } else if (errors.calculation) {
                        toast.error(errors.calculation);
                    } else {
                        toast.error('Tính lương thất bại');
                    }
                }
            });
        }
    };

    const handleClose = (salaryConfig: SalaryConfig) => {
        const semesterName = salaryConfig.semester?.name || 'N/A';
        if (confirm(`Bạn có chắc muốn đóng bảng lương học kỳ ${semesterName}?\n\nSau khi đóng sẽ không thể tính lại hoặc sửa đổi được nữa.`)) {
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

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: {
                label: 'Bản nháp',
                className: 'bg-gray-100 text-gray-800'
            },
            active: {
                label: 'Đã tính',
                className: 'bg-green-100 text-green-800'
            },
            closed: {
                label: 'Đã đóng',
                className: 'bg-red-100 text-red-800'
            }
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        return (
            <Badge className={config.className}>
                {config.label}
            </Badge>
        );
    };

    // FIX: Safe render function
    const renderSemesterInfo = (semester: Semester | null | undefined) => {
        if (!semester) {
            return (
                <div>
                    <div className="font-medium">N/A</div>
                    <div className="text-sm text-muted-foreground">N/A</div>
                </div>
            );
        }

        return (
            <div>
                <div className="font-medium">{semester.name}</div>
                <div className="text-sm text-muted-foreground">
                    {semester.academicYear?.name || 'N/A'}
                </div>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Toaster position="top-right" />
            <Head title="Tính lương giáo viên" />

            <div className="container mx-auto px-6 py-8 space-y-8">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <DollarSign className="h-6 w-6 text-blue-600" />
                            </div>
                            Tính lương giáo viên
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Quản lý và tính toán lương giảng dạy theo từng học kỳ
                        </p>
                    </div>

                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg" disabled={semesters.length === 0} className="shadow-md">
                                <Plus className="w-5 h-5 mr-2" />
                                Tạo cấu hình lương
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-blue-600" />
                                    Tạo cấu hình lương mới
                                </DialogTitle>
                                <DialogDescription>
                                    Chọn học kỳ và thiết lập mức lương cơ bản cho giảng viên
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="semester_id" className="text-sm font-medium">
                                        Học kỳ *
                                    </Label>
                                    <SimpleSelect
                                        value={data.semester_id}
                                        onValueChange={(value) => setData('semester_id', value)}
                                        options={semesterOptions}
                                        placeholder="Chọn học kỳ"
                                        disabled={processing}
                                    />
                                    {errors.semester_id && (
                                        <p className="text-sm text-red-500 mt-1">{errors.semester_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="base_salary_per_lesson" className="text-sm font-medium">
                                        Tiền dạy một tiết (VND) *
                                    </Label>
                                    <Input
                                        id="base_salary_per_lesson"
                                        type="number"
                                        min="0"
                                        step="1000"
                                        value={data.base_salary_per_lesson}
                                        onChange={(e) => setData('base_salary_per_lesson', parseInt(e.target.value) || 0)}
                                        placeholder="50,000"
                                        className="text-right"
                                        disabled={processing}
                                    />
                                    {errors.base_salary_per_lesson && (
                                        <p className="text-sm text-red-500 mt-1">{errors.base_salary_per_lesson}</p>
                                    )}
                                    <div className="bg-blue-50 p-3 rounded-md">
                                        <p className="text-sm text-blue-700 font-medium">
                                            Hiển thị: {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND'
                                            }).format(data.base_salary_per_lesson || 0)}
                                        </p>
                                    </div>
                                </div>
                            </form>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setCreateDialogOpen(false)}
                                    disabled={processing}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={processing}
                                    className="min-w-[100px]"
                                >
                                    {processing ? 'Đang tạo...' : 'Tạo mới'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Instructions Card */}
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Hướng dẫn sử dụng</AlertTitle>
                    <AlertDescription>
                        <ol className="list-decimal list-inside space-y-1 mt-2">
                            <li><strong>Tạo cấu hình:</strong> Chọn học kỳ và nhập tiền dạy một tiết</li>
                            <li><strong>Tính lương:</strong> Nhấn "Tính lương" để tính toán cho tất cả giáo viên</li>
                            <li><strong>Xem báo cáo:</strong> Xem chi tiết lương của từng giáo viên</li>
                            <li><strong>Đóng bảng lương:</strong> Đóng để khóa không cho sửa đổi</li>
                        </ol>
                    </AlertDescription>
                </Alert>

                {/* No semesters warning */}
                {semesters.length === 0 && (
                    <Alert variant="destructive">
                        <AlertTitle>Không có học kỳ khả dụng</AlertTitle>
                        <AlertDescription>
                            Tất cả học kỳ đã có cấu hình lương hoặc chưa có học kỳ nào được tạo.
                            Vui lòng tạo học kỳ mới hoặc kiểm tra lại các cấu hình hiện có.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Salary Configs Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Danh sách cấu hình lương
                        </CardTitle>
                        <CardDescription>
                            Quản lý các cấu hình lương theo từng học kỳ
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {salaryConfigs.data.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[200px]">Học kỳ</TableHead>
                                            <TableHead>Tiền/tiết</TableHead>
                                            <TableHead>Trạng thái</TableHead>
                                            <TableHead>Ngày tạo</TableHead>
                                            <TableHead className="text-right">Hành động</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {salaryConfigs.data.map((config) => (
                                            <TableRow key={config.id}>
                                                <TableCell>
                                                    {renderSemesterInfo(config.semester)}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono font-medium">
                                                        {new Intl.NumberFormat('vi-VN', {
                                                            style: 'currency',
                                                            currency: 'VND'
                                                        }).format(config.base_salary_per_lesson)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(config.status)}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(config.created_at).toLocaleDateString('vi-VN')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {config.status === 'draft' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleCalculate(config)}
                                                                className="bg-blue-600 hover:bg-blue-700"
                                                            >
                                                                <Calculator className="w-4 h-4 mr-1" />
                                                                Tính lương
                                                            </Button>
                                                        )}

                                                        {(config.status === 'active' || config.status === 'closed') && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => router.visit(route('salary.report', config.id))}
                                                                >
                                                                    <FileText className="w-4 h-4 mr-1" />
                                                                    Xem báo cáo
                                                                </Button>

                                                                {/* Thêm dropdown cho export options */}
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button size="sm" variant="outline">
                                                                            <Download className="w-4 h-4 mr-1" />
                                                                            Xuất file
                                                                            <ChevronDown className="w-3 h-3 ml-1" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem
                                                                            onClick={() => window.open(route('salary.preview-pdf', config.id), '_blank')}
                                                                        >
                                                                            <Eye className="w-4 h-4 mr-2" />
                                                                            Xem trước PDF
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => window.location.href = route('salary.export-pdf', config.id)}
                                                                        >
                                                                            <Download className="w-4 h-4 mr-2" />
                                                                            Tải PDF
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </>
                                                        )}

                                                        {config.status === 'active' && (
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleClose(config)}
                                                            >
                                                                <Lock className="w-4 h-4 mr-1" />
                                                                Đóng
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                                    Chưa có cấu hình lương nào
                                </h3>
                                <p className="text-muted-foreground">
                                    Tạo cấu hình lương đầu tiên để bắt đầu tính toán lương giảng viên.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}