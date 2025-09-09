export const authRoles = {
    sa: ["SA"], // Only Super Admin has access
    admin: ["SA", "ADMIN"], // Only SA & Admin has access
    manager: ["SA", "ADMIN", "MANAGER"], // only Manager admin and SA can access
    editor: ["SA", "ADMIN", "EDITOR"], // Only SA & Admin & Editor has access
    guest: ["SA", "ADMIN", "EDITOR", "GUEST"] // Everyone has access
};
