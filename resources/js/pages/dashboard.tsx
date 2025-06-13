import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { PieChartComponent } from "@/components/charts/PieChartComponent"
import BarChartComponent from "@/components/charts/BarChartComponent";
import { useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];


interface Department{
    // id: number,
    // name: string,
    abbrName: string,
    teachers_count: number
}

interface TeacherDegree{
    id: number,
    name: string,
    teachers_count: number
}

interface ViewTeacherDegreesProps{
    teacherDegrees: TeacherDegree[]
}
interface InputProps{
    departments: Department[],
    teacherDegrees: TeacherDegree[]
}

function ViewTeacherDegrees({teacherDegrees}: ViewTeacherDegreesProps){
    return (
    <>
        {
            teacherDegrees.map(degree => {
                return (
                    <div className='mb-2' key={degree.id}>
                        <span className='text-blue-600 font-medium'>{`${degree.name ?? ''} `}</span>
                        <span className="text-gray-600"> {degree.teachers_count ?? 0} Giáo viên</span>
                    </div>
                )
            })
        }
    </>
    )
}
export default function Dashboard({departments, teacherDegrees} : InputProps) {
    // const data = [];
    // useEffect(() => {
    //     async function fetchData() {
    //         const response = await fetch(route('dashboard.reports'));
    //         const data = await response.json();
    //         console.log(data);
    //     }
    //     fetchData();
    //     // return () => {
    //     //     console.log("Cleanup before component unmounts or updates!");
    //     // };
    // }, []);
    console.log("check departments:", departments);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <PieChartComponent />
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        {/* <BarChartComponent></BarChartComponent> */}
                        <ViewTeacherDegrees teacherDegrees={teacherDegrees}></ViewTeacherDegrees>

                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative  overflow-hidden rounded-xl border ">
                    <BarChartComponent data={departments}></BarChartComponent>
                </div>
            </div>
        </AppLayout>
    );
}
