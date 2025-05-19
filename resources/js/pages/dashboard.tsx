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
const departmentData = [
    { department: "CNTT", employees: 12 },
    { department: "Kinh tế", employees: 18 },
    { department: "Ngôn ngữ", employees: 9 },
    { department: "Dược", employees: 15 },
    { department: "Cơ khí", employees: 7 },
    { department: "Hóa học", employees: 11 },
];

export default function Dashboard() {
    // const data = [];
    useEffect(() => {
        async function fetchData() {
            const response = await fetch(route('dashboard.reports'));
            const data = await response.json();
            console.log(data);
        }
        fetchData();
        // return () => {
        //     console.log("Cleanup before component unmounts or updates!");
        // };
    }, []);
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

                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative  overflow-hidden rounded-xl border ">
                    <BarChartComponent data={departmentData}></BarChartComponent>
                </div>
            </div>
        </AppLayout>
    );
}
