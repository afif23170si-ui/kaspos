import { SharedData } from "@/types";
import { usePage } from "@inertiajs/react";

export default function useHasAnyPermission(requiredPermissions: string[]): boolean {
    const { auth } = usePage<SharedData>().props;

    // Grant permission if the user is a super admin
    if (auth.super) {
        return true;
    }

    // Check if any permission in auth.permissions ends with the required suffix
    return requiredPermissions.some(permission => {
        if (permission.startsWith('*-')) {
            const suffix = permission.slice(1);
            return Object.keys(auth.permissions).some(
                userPermission => userPermission.endsWith(suffix) && auth.permissions[userPermission]
            );
        }
        return auth.permissions[permission] === true;
    });
}
