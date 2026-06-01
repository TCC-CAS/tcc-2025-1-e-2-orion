const { getDB } = require("../config/database.js");

const ALLOWED_STATUS_FILTERS = new Set(["TODOS", "ATIVA", "RENOVADA", "CANCELADA", "PENDENTE"]);

const normalizeStatusFilter = (status) => {
    if (!status) return "TODOS";

    const normalized = String(status).trim().toUpperCase();
    if (!ALLOWED_STATUS_FILTERS.has(normalized)) {
        throw new Error("status inválido. Use: TODOS, ATIVA, RENOVADA, CANCELADA ou PENDENTE");
    }

    return normalized;
};

const formatDateShort = (value) => {
    if (!value) return "-";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";

    return parsed.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit"
    });
};

const inferPlanFromDates = (startDate, nextBillingDate) => {
    if (!startDate || !nextBillingDate) return null;

    const start = new Date(startDate);
    const next = new Date(nextBillingDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(next.getTime())) return null;

    const diffInDays = Math.round((next.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (diffInDays >= 330) return "Anual";
    if (diffInDays >= 25 && diffInDays <= 40) return "Mensal";
    return null;
};

const resolvePlan = (subscription) => {
    const rawPlan = String(subscription?.planType || subscription?.plan || "").trim().toUpperCase();

    if (rawPlan.includes("ANUAL") || rawPlan.includes("ANNUAL")) {
        return "Anual";
    }

    if (rawPlan.includes("MENSAL") || rawPlan.includes("MONTHLY")) {
        return "Mensal";
    }

    const inferredPlan = inferPlanFromDates(subscription?.startDate, subscription?.nextBillingDate);
    if (inferredPlan) {
        return inferredPlan;
    }

    return "Mensal";
};

const resolveStatus = (subscription) => {
    const rawStatus = String(subscription?.status || "").trim().toUpperCase();

    if (rawStatus === "RENEWED") return "renovada";
    if (["CANCELED", "CANCELLED", "INACTIVE"].includes(rawStatus)) return "cancelada";
    if (rawStatus === "PENDING") return "pendente";

    if (rawStatus === "ACTIVE") {
        const paymentHistory = Array.isArray(subscription?.paymentHistory)
            ? subscription.paymentHistory
            : [];

        return paymentHistory.length > 1 ? "renovada" : "ativa";
    }

    return "pendente";
};

const adminSubscriptionsService = {
    normalizeStatusFilter,

    getAdminSubscriptions: async ({ status }) => {
        const db = getDB();
        const normalizedStatus = normalizeStatusFilter(status);

        const subscriptions = await db.collection("subscriptions").aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    planType: 1,
                    plan: 1,
                    status: 1,
                    startDate: 1,
                    nextBillingDate: 1,
                    paymentHistory: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    userName: "$user.name"
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]).toArray();

        const mappedSubscriptions = subscriptions.map((subscription) => {
            const statusLabel = resolveStatus(subscription);

            return {
                id: subscription._id.toString(),
                userName: subscription.userName || "Usuário não encontrado",
                plan: resolvePlan(subscription),
                status: statusLabel,
                startedAt: formatDateShort(subscription.startDate || subscription.createdAt),
                nextBilling: formatDateShort(subscription.nextBillingDate)
            };
        });

        if (normalizedStatus === "TODOS") {
            return mappedSubscriptions;
        }

        const statusMap = {
            ATIVA: "ativa",
            RENOVADA: "renovada",
            CANCELADA: "cancelada",
            PENDENTE: "pendente"
        };

        return mappedSubscriptions.filter((item) => item.status === statusMap[normalizedStatus]);
    }
};

module.exports = adminSubscriptionsService;
