import AppLayout from '@/layouts/app-layout'
import { User, type BreadcrumbItem } from '@/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Head, usePage } from "@inertiajs/react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: route('apps.users.index'),
    },
    {
        title: 'Detail User',
        href: '#',
    }
];

interface ShowProps {
    user: User;
    [key: string]: unknown;
}

export default function Show() {

    const { user } = usePage<ShowProps>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Detail User'/>
            <div className='p-6'>
                <Tabs defaultValue="information">
                    <TabsList>
                        <TabsTrigger value="information">Personal Information</TabsTrigger>
                        <TabsTrigger value="access">Roles & Permissions</TabsTrigger>
                    </TabsList>
                    <TabsContent value="information">
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>
                                    This form for showing personal information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="px-6 w-10 font-bold dark:text-white">Name</TableCell>
                                            <TableCell className="px-6">{user.name}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="px-6 font-bold dark:text-white">Username</TableCell>
                                            <TableCell className="px-6">{user.username}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="px-6 font-bold dark:text-white">Email</TableCell>
                                            <TableCell className="px-6">{user.email}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="access" className="w-full">
                        <Card>
                            <CardHeader>
                                <CardTitle>Roles & Permissions</CardTitle>
                                <CardDescription>
                                    This form for showing roles & permissions user
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="px-6 font-bold dark:text-white">Role</TableHead>
                                            <TableHead className="px-6 font-bold dark:text-white">Permissions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {user.roles.map((role, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="px-6">{role.name}</TableCell>
                                                <TableCell className="px-6">
                                                    <div className="flex flex-wrap gap-2">
                                                        {role.name === 'super-admin' ?
                                                            <Badge variant='default'>All Permissions</Badge>
                                                            :
                                                            role.permissions.map((permission, index) => (
                                                                <Badge variant='default' key={index}>{permission.name}</Badge>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    )
}
