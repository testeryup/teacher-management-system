import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Megaphone } from 'lucide-react';
import { PageProps } from '@inertiajs/core';

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: '/products',
    },
];
interface Product {
    id: number,
    name: string,
    price: number,
    description: string
}
interface CustomPageProps {
    products: Product[];
    flash?: {
        message?: string;
        error?: string;
        success?: string;
    };
}

// type PageProps = InertiaPageProps<Props>;

export default function Index({ products }: CustomPageProps) {
    const page = usePage<PageProps>();
    const flash = page.props?.flash as CustomPageProps['flash'];
    const { processing, delete: destroy } = useForm();
    const handleDelete = (id: number, name: string) => {
        if (confirm("Do you want to delete " + name + ' ' + id)) {
            destroy(route('products.destroy', id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <div className='m-4'>
                <Link href={route('products.create')}>
                    <Button>
                        Create a Product
                    </Button>
                </Link>
            </div>
            <div className="m-4">
                <div>
                    {flash?.message && (
                        <Alert>
                            <Megaphone className="h-4 w-4" />
                            <AlertTitle>Notification</AlertTitle>
                            <AlertDescription>
                                {flash.message}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
            {products.length > 0 && (
                <div className="m-4">
                    <Table>
                        <TableCaption>A list of your recent invoices.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Id</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                products.map((product) => (
                                    <TableRow>
                                        <TableCell className="font-medium">{product.id}</TableCell>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.price}</TableCell>
                                        <TableCell>{product.description}</TableCell>
                                        <TableCell className="text-center space-x-2">
                                            <Link href={route('products.edit', product.id)}>
                                                <Button
                                                className='bg-slate-600 hover:bg-slate-700 hover:cursor-pointer'
                                            >Edit</Button>
                                            </Link>
                                            <Button
                                                disabled={processing}
                                                onClick={() => handleDelete(product.id, product.name)}
                                                className="bg-red-500 hover:bg-red-700 hover:cursor-pointer"
                                            >Delete</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </div>

            )}
        </AppLayout>
    );
}
