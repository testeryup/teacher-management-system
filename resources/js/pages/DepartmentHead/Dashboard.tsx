import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from '@inertiajs/react';

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
    degree: {
        name: string;
    };
}

interface Classroom {
    id: number;
    name: string;
    code: string;
    students: number;
    teacher: Teacher;
    course: {
        name: string;
    };
    semester: {
        name: string;
        academicYear: {
            name: string;
        };
    };
}

interface Stats {
    teacherCount: number;
    assignedClassroomsCount: number;
    unassignedTeacherCount: number;
}

interface Props {
    department: Department;
    teachers: Teacher[];
    classrooms: Classroom[];
    stats: Stats;
}

export default function DepartmentHeadDashboard({ department, teachers, classrooms, stats }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Department Head Dashboard',
            href: '/department-head/dashboard',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Department Head Dashboard" />
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Department</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{department.name}</div>
                        <p className="text-xs text-muted-foreground">{department.abbrName}</p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.teacherCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.unassignedTeacherCount} unassigned to classes
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Classrooms</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.assignedClassroomsCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Classes with department teachers
                        </p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 p-4">
                <Card className="col-span-1">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Recent Teachers</CardTitle>
                            <Button asChild>
                                <Link href="/department-head/teachers">View All</Link>
                            </Button>
                        </div>
                        <CardDescription>Recent teachers in your department</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Degree</TableHead>
                                    <TableHead>Email</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teachers.slice(0, 5).map((teacher) => (
                                    <TableRow key={teacher.id}>
                                        <TableCell className="font-medium">{teacher.fullName}</TableCell>
                                        <TableCell>{teacher.degree.name}</TableCell>
                                        <TableCell>{teacher.email}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                
                <Card className="col-span-1">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Recent Classrooms</CardTitle>
                            <Button asChild>
                                <Link href="/department-head/classrooms">View All</Link>
                            </Button>
                        </div>
                        <CardDescription>Recent classes assigned to your department</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Teacher</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {classrooms.slice(0, 5).map((classroom) => (
                                    <TableRow key={classroom.id}>
                                        <TableCell className="font-medium">{classroom.name}</TableCell>
                                        <TableCell>{classroom.course.name}</TableCell>
                                        <TableCell>{classroom.teacher?.fullName || 'Unassigned'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
