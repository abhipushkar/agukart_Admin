import { ApiService } from "../../services/ApiService";
import { apiEndpoints } from "../../constant/apiEndpoints";
import { localStorageKey } from "../../constant/localStorageKey";

let globalSubOrders = [];
let auth_key = localStorage.getItem(localStorageKey.auth_key);

export const getGlobalSubOrders = () => {
    return globalSubOrders;
};

export const setGlobalSubOrders = (subOrders) => {
    globalSubOrders = subOrders;
};

export const fetchAllActiveSubOrders = async () => {
    const statuses = ["unshipped", "in-progress", "cancelled", "completed"];
    const today = new Date();
    const fromDate = new Date();
    fromDate.setDate(today.getDate() - 90);

    const fromStr = fromDate.toISOString().split("T")[0];
    const toStr = today.toISOString().split("T")[0];

    let allSubOrders = [];

    try {
        // Fetch all order statuses in parallel for efficiency
        const fetchPromises = statuses.map(status => {
            return ApiService.get(
                `${apiEndpoints.getOrders}/${status}?startDate=${fromStr}&endDate=${toStr}&page=1&limit=5000`,
                auth_key
            ).catch(err => {
                console.error(`Failed to fetch orders for status ${status}`, err);
                return null;
            });
        });

        const responses = await Promise.all(fetchPromises);

        responses.forEach(res => {
            if (res?.status === 200 && res?.data?.sales) {
                res.data.sales.forEach((dateGroup) => {
                    dateGroup?.sales?.forEach((sale) => {
                        if (sale?.saleDetaildata?.length) {
                            sale.saleDetaildata.forEach(subOrder => {
                                const subOrderId = subOrder._id || subOrder.sub_order_id;
                                if (subOrderId) {
                                    allSubOrders.push({
                                        ...subOrder,
                                        parentSale: sale,
                                        order_id: sale.order_id,
                                        sale_id: sale._id,
                                    });
                                }
                            });
                        }
                    });
                });
            }
        });

        setGlobalSubOrders(allSubOrders);
        return allSubOrders;
    } catch (error) {
        console.error("Failed to fetch all sub orders", error);
        return [];
    }
};
