import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, GitFork, Hospital,UsersRound, 
    GraduationCap, Notebook, LandPlot, CalendarCog, NotepadTextDashed, DollarSign, FileText  } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Tổng quan',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Khoa',
        href: '/departments',
        icon: Hospital,
    },
    {
        title: 'Bằng cấp',
        href: '/degrees',
        icon: GraduationCap,
    },
    {
        title: 'Giáo viên',
        href: '/teachers',
        icon: UsersRound,
    },
    {
        title: 'Năm học',
        href: '/academicyears',
        icon: LandPlot,
    },
    {
        title: 'Khoá học',
        href: '/courses',
        icon: Notebook,
    },
    {
        title: 'Lớp học',
        href: '/classrooms',
        icon: GitFork,
    },
    // {
    //     title: 'Phân công',
    //     href: '/assignments',
    //     icon: GitFork,
    // },

];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const {props} = usePage();
    const user = (props as any).auth?.user;
    const isAdmin = user?.role === 'admin';
    const isDepartmentHead = user?.role === 'department_head';

    const mainNavItems: NavItem[] = [
        {
            title: 'Tổng quan',
            href: '/dashboard',
            icon: LayoutGrid,
        }
    ];
     // Admin-only items
    if (isAdmin) {
        mainNavItems.push(
            {
                title: 'Khoa',
                href: '/departments',
                icon: Hospital,
            },
            {
                title: 'Năm học',
                href: '/academicyears',
                icon: LandPlot,
            },
            // {
            //     title: 'Học kỳ',
            //     href: '/semesters',
            //     icon: CalendarCog,
            // }
        );
    }

    // Items for both admin and department head
    if (isAdmin || isDepartmentHead) {
        mainNavItems.push(
            {
                title: 'Bằng cấp',
                href: '/degrees',
                icon: GraduationCap,
            },
            {
                title: 'Giáo viên',
                href: '/teachers',
                icon: UsersRound,
            },
            {
                title: 'Khoá học',
                href: '/courses',
                icon: Notebook,
            },
            {
                title: 'Lớp học',
                href: '/classrooms',
                icon: GitFork,
            },
            {
                title: 'Tính lương',
                href: '/salary',
                icon: DollarSign,
            },
            {
                title: 'Báo cáo',
                href: '/reports',
                icon: FileText,
            }
        );
    }

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: Folder,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
