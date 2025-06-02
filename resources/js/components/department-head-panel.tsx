import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';

interface Props {
    departmentName: string;
}

export function DepartmentHeadPanel({ departmentName }: Props) {
    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Department Head Panel</CardTitle>
                <CardDescription>
                    Manage teachers and classrooms for {departmentName}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
                <Button asChild>
                    <Link href="/department-head/dashboard">Department Dashboard</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/department-head/teachers">Manage Teachers</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/department-head/classrooms">Assign Classrooms</Link>
                </Button>
            </CardContent>
        </Card>
    );
}
