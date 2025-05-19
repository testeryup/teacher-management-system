import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CircleAlert } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Edit a Product',
        href: '/products/edit',
    },
];

interface Product{
    id: number,
    name: string,
    description: string,
    price: number
}

interface Props{
    product: Product
}
export default function Edit({product} : Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: product.name,
        price: product.price,
        description: product.description
    });

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('products.update', product.id));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit a Product" />
            <div className='w-8/12 p-4'>
                <form onSubmit={(e) => handleUpdate(e)} className='space-y-4'>
                    {/* Display error */}
                    {
                        Object.keys(errors).length > 0 && (
                            <Alert>
                            <CircleAlert  className="h-4 w-4" />
                            <AlertTitle>Heads up!</AlertTitle>
                            <AlertDescription>
                                <ul>
                                    {
                                        Object.entries(errors).map(([key, message]) => (
                                            <li key={key}>{message as string}</li>
                                        ))
                                    }
                                </ul>
                            </AlertDescription>
                            </Alert>
                        )
                    }
                    <div className='gap-1.5'>
                        <Label htmlFor="product name">Name</Label>
                        <Input
                            placeholder='test input'
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        ></Input>
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="product price">Price</Label>
                        <Input
                            placeholder='Price'
                            type='number'
                            step={'1'}
                            value={data.price}
                            onChange={(e) => setData('price', parseInt(e.target.value) || 0)}

                        ></Input>
                    </div>
                    <div className='gap-1.5'>
                        <Label htmlFor="product description">Description</Label>
                        <Textarea
                            placeholder='description'
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                    </div>
                    <Button disabled={processing} type='submit'>Update Product</Button>
                </form>
            </div>
        </AppLayout>
    );
}
