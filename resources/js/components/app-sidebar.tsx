import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, GitFork, Hospital,UsersRound, 
    GraduationCap, Notebook, LandPlot, CalendarCog  } from 'lucide-react';
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
        icon: CalendarCog,
    },
    {
        title: 'Khoá học',
        href: '/courses',
        icon: LandPlot,
    },
    {
        title: 'Lớp học',
        href: '/classrooms',
        icon: Notebook,
    },
    {
        title: 'Phân công',
        href: '/assignments',
        icon: GitFork,
    },

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
