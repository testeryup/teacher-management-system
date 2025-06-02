import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Toaster, toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';

interface Department {
    id: number;
    name: string;
    abbrName: string;
    description: string;
}

interface Teacher {
    id: number;
    fullName: string;
    email: string;
    department_id: number;
}

interface Classroom {
    id: number;
    name: string;
    code: string;
    students: number;
    teacher_id: number | null;
    teacher: Teacher | null;
    course: {
        id: number;
        name: string;
    };
    semester: {
        id: number;
        name: string;
        academicYear: {
            id: number;
            name: string;
        };
    };
}

interface Props {
    department: Department;
    classrooms: Classroom[];
    teachers: Teacher[];
}

export default function DepartmentHeadClassrooms({ department, classrooms, teachers }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Department Head Dashboard',
            href: '/department-head/dashboard',
        },
        {
            title: 'Manage Classrooms',
            href: '/department-head/classrooms',
        }
    ];

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [currentClassroom, setCurrentClassroom] = useState<Classroom | null>(null);

    const { data, setData, put, processing, errors, reset } = useForm({
        name: '',
        teacher_id: '' as any,
        students: 0
    });

    const handleEdit = (classroom: Classroom) => {
        setCurrentClassroom(classroom);
        setData({
            name: classroom.name,
            teacher_id: classroom.teacher_id || '' as any,
            students: classroom.students
        });
        setEditDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentClassroom) return;

        put(route('classrooms.update', currentClassroom.id), {
            onSuccess: () => {
                toast.success('Classroom updated successfully');
                reset();
                setEditDialogOpen(false);
            },
            onError: () => {
                toast.error('Failed to update classroom');
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Manage Classrooms - ${department.name}`} />
            <Toaster />
            
            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Classrooms Assigned to {department.name}</CardTitle>
                        <CardDescription>
                            Manage classroom assignments for teachers in your department
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Semester</TableHead>
                                    <TableHead>Teacher</TableHead>
                                    <TableHead>Students</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {classrooms.map((classroom) => (
                                    <TableRow key={classroom.id}>
                                        <TableCell className="font-medium">{classroom.name}</TableCell>
                                        <TableCell>{classroom.code}</TableCell>
                                        <TableCell>{classroom.course.name}</TableCell>
                                        <TableCell>
                                            {classroom.semester.name} ({classroom.semester.academicYear.name})
                                        </TableCell>
                                        <TableCell>
                                            {classroom.teacher ? classroom.teacher.fullName : 'Unassigned'}
                                        </TableCell>
                                        <TableCell>{classroom.students}</TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleEdit(classroom)}
                                            >
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {classrooms.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-4">
                                            No classrooms assigned to teachers in this department
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Edit Classroom Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Classroom</DialogTitle>
                        <DialogDescription>
                            Update classroom details and teacher assignment
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Class Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="teacher_id">Assigned Teacher</Label>
                            <select
                                id="teacher_id"
                                value={data.teacher_id}
                                onChange={(e) => setData('teacher_id', e.target.value ? parseInt(e.target.value) : '' as any)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                required
                            >
                                <option value="">Select a teacher</option>
                                {teachers.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.fullName}
                                    </option>
                                ))}
                            </select>
                            {errors.teacher_id && <p className="text-sm text-red-500">{errors.teacher_id}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="students">Number of Students</Label>
                            <Input
                                id="students"
                                type="number"
                                min="0"
                                value={data.students}
                                onChange={(e) => setData('students', parseInt(e.target.value))}
                                required
                            />
                            {errors.students && <p className="text-sm text-red-500">{errors.students}</p>}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={() => setEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
