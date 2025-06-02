import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Toaster, toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
// import { Calendar } from '@/components/ui/calendar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';

interface Department {
    id: number;
    name: string;
    abbrName: string;
    description: string;
}

interface Degree {
    id: number;
    name: string;
    baseSalaryFactor: number;
}

interface Teacher {
    id: number;
    fullName: string;
    DOB: string;
    phone: string;
    email: string;
    department_id: number;
    degree_id: number;
    degree: Degree;
    classrooms_count: number;
}

interface Props {
    department: Department;
    teachers: Teacher[];
    degrees?: Degree[];
}

export default function DepartmentHeadTeachers({ department, teachers, degrees = [] }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Department Head Dashboard',
            href: '/department-head/dashboard',
        },
        {
            title: 'Manage Teachers',
            href: '/department-head/teachers',
        }
    ];

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const [pendingDeleteName, setPendingDeleteName] = useState<string | null>(null);
    const [teacherDialogOpen, setTeacherDialogOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(undefined);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        fullName: '',
        DOB: '',
        phone: '',
        email: '',
        degree_id: '' as any,
        department_id: department.id as any // Pre-filled with the department head's department
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('teachers.store'), {
            onSuccess: () => {
                toast.success('Teacher added successfully');
                reset();
                setTeacherDialogOpen(false);
            },
            onError: () => {
                toast.error('Failed to add teacher');
            }
        });
    };

    const handleDelete = (id: number, name: string) => {
        setPendingDeleteId(id);
        setPendingDeleteName(name);
        setIsDialogOpen(true);
    };

    const confirmDelete = () => {
        if (pendingDeleteId !== null) {
            router.delete(route('teachers.destroy', pendingDeleteId), {
                onSuccess: () => {
                    toast.success('Teacher deleted successfully');
                    setIsDialogOpen(false);
                },
                onError: () => {
                    toast.error('Failed to delete teacher');
                }
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Manage ${department.name} Teachers`} />
            <Toaster />
            
            <div className="p-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Teachers in {department.name}</CardTitle>
                            <Button onClick={() => setTeacherDialogOpen(true)}>
                                Add New Teacher
                            </Button>
                        </div>
                        <CardDescription>Manage teachers in your department</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Degree</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Classes</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teachers.map((teacher) => (
                                    <TableRow key={teacher.id}>
                                        <TableCell className="font-medium">{teacher.fullName}</TableCell>
                                        <TableCell>{teacher.degree.name}</TableCell>
                                        <TableCell>{teacher.email}</TableCell>
                                        <TableCell>{teacher.phone}</TableCell>
                                        <TableCell>{teacher.classrooms_count}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button 
                                                variant="destructive" 
                                                size="sm"
                                                onClick={() => handleDelete(teacher.id, teacher.fullName)}
                                                disabled={teacher.classrooms_count > 0}
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {teachers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-4">
                                            No teachers found in this department
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Teacher</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {pendingDeleteName}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Teacher Dialog */}
            <Dialog open={teacherDialogOpen} onOpenChange={setTeacherDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New Teacher</DialogTitle>
                        <DialogDescription>
                            Add a new teacher to your department
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                value={data.fullName}
                                onChange={(e) => setData('fullName', e.target.value)}
                                required
                            />
                            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="DOB">Date of Birth</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(date: Date | undefined) => {
                                            setDate(date);
                                            if (date) {
                                                setData('DOB', format(date, 'yyyy-MM-dd'));
                                            }
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.DOB && <p className="text-sm text-red-500">{errors.DOB}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                required
                            />
                            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="degree_id">Degree</Label>
                            <select
                                id="degree_id"
                                value={data.degree_id}
                                onChange={(e) => setData('degree_id', e.target.value ? parseInt(e.target.value) : '' as any)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                required
                            >
                                <option value="">Select a degree</option>
                                {degrees.map((degree) => (
                                    <option key={degree.id} value={degree.id}>
                                        {degree.name}
                                    </option>
                                ))}
                            </select>
                            {errors.degree_id && <p className="text-sm text-red-500">{errors.degree_id}</p>}
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={processing}>Add Teacher</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
