import hasAnyPermission from "@/utils/has-permissions";
import { BellRing, Calculator, ChefHat } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserMenuContent } from "@/components/user-menu-content";
import { usePage, Link } from "@inertiajs/react";
import { useInitials } from "@/hooks/use-initials";
import { SharedData } from "@/types";

export function QuickActions() {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();

    return (
        <div className="flex items-center gap-2 ml-auto">
            {/* Group POS & Dapur */}
            <div className="flex items-center overflow-hidden rounded-full border">
                {hasAnyPermission(["pos-data"]) && (
                    <Link href={route("apps.pos.index")}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2 rounded-none px-3 py-1"
                        >
                            <Calculator className="w-4 h-4" />
                            <span className="text-sm font-medium">POS</span>
                        </Button>
                    </Link>
                )}
                {hasAnyPermission(["transaction-kitchens-data"]) && (
                    <Link href={route("apps.kitchen.index")}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2 rounded-none px-3 py-1"
                        >
                            <ChefHat className="w-4 h-4" />
                            <span className="text-sm font-medium">Dapur</span>
                        </Button>
                    </Link>
                )}
            </div>

            {/* Avatar User */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="size-10 rounded-full p-1">
                        <Avatar className="size-8 overflow-hidden rounded-full">
                            <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                {getInitials(auth.user.name)}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                    <UserMenuContent user={auth.user} />
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
