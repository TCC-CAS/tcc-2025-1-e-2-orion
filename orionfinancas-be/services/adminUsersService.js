const { getDB } = require("../config/database.js");

const ALLOWED_STATUS_FILTERS = new Set(["TODOS", "ATIVO", "INATIVO", "PENDENTE"]);

const normalizeStatusFilter = (status) => {
    if (!status) return "TODOS";

    const normalized = String(status).trim().toUpperCase();
    if (!ALLOWED_STATUS_FILTERS.has(normalized)) {
        throw new Error("status inválido. Use: TODOS, ATIVO, INATIVO ou PENDENTE");
    }

    return normalized;
};

const resolveRole = (user) => {
    const rawRole = user?.role
        || user?.userType
        || user?.profile?.role
        || user?.profile?.type
        || user?.profile?.perfil
        || user?.profile?.userType
        || "";

    const normalized = String(rawRole).trim().toLowerCase();

    if (["admin", "administrador"].includes(normalized)) {
        return "Admin";
    }

    if (["mentor", "mentora"].includes(normalized)) {
        return "Mentor";
    }

    return "Aluno";
};

const resolveAccountStatus = (user) => {
    if (user?.isActive === true) return "Ativo";
    if (user?.isActive === false) return "Inativo";
    return "Ativo";
};

const adminUsersService = {
    normalizeStatusFilter,

    getAdminUsers: async ({ status }) => {
        const db = getDB();
        const normalizedStatus = normalizeStatusFilter(status);

        const users = await db.collection("users").find(
            {},
            {
                projection: {
                    name: 1,
                    email: 1,
                    isActive: 1,
                    role: 1,
                    userType: 1,
                    "profile.role": 1,
                    "profile.type": 1,
                    "profile.perfil": 1,
                    "profile.userType": 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ).sort({ createdAt: -1 }).toArray();

        const mappedUsers = users.map((user) => {
            const accountStatus = resolveAccountStatus(user);

            return {
                id: user._id.toString(),
                name: user.name || "Usuário sem nome",
                email: user.email || "-",
                role: resolveRole(user),
                status: accountStatus,
                createdAt: user.createdAt || null,
                updatedAt: user.updatedAt || null
            };
        });

        if (normalizedStatus === "TODOS") {
            return mappedUsers;
        }

        const filterMap = {
            ATIVO: "Ativo",
            INATIVO: "Inativo",
            PENDENTE: "Pendente"
        };

        return mappedUsers.filter((user) => user.status === filterMap[normalizedStatus]);
    }
};

module.exports = adminUsersService;
