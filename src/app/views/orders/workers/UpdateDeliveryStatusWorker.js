/* eslint-env worker */
/* global importScripts, XLSX */
/* eslint-disable no-restricted-globals */

importScripts("https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js");

const ALLOWED_DELIVERY_STATUS = [
    "Pre-Shipped",
    "No tracking",
    "track on",
    "Pre transit",
    "Out for delivery",
    "In transit",
    "Delivery attempt",
    "Delivered"
];

const normalize = (val) => String(val || "").trim();

const parseExcelDate = (val) => {
    if (val === undefined || val === null || val === "") return "";
    if (typeof val === "number") {
        // Handle Excel Date serial number
        // 25569 is days between 1900-01-01 and 1970-01-01
        const jsDate = new Date(Math.round((val - 25569) * 86400 * 1000));
        const year = jsDate.getUTCFullYear();
        const month = String(jsDate.getUTCMonth() + 1).padStart(2, "0");
        const day = String(jsDate.getUTCDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
    // If it's already a string, attempt to parse/format it or just return
    return String(val).trim();
};

self.onmessage = async (event) => {
    const { file, validSubOrdersMap } = event.data;

    try {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (!rows.length) {
            self.postMessage({ fatalError: "Empty Excel file" });
            return;
        }

        let invalid = [];
        const shipmentUpdatesMap = new Map();
        const orderUpdatesMap = new Map();

        const validOrdersMap = validSubOrdersMap && typeof validSubOrdersMap === 'object'
            ? validSubOrdersMap
            : null;

        rows.forEach((row, index) => {
            const rowNumber = index + 2;

            const sub_order_id = normalize(row.sub_order_id);
            const trackingNumber = normalize(row.trackingNumber);
            const tracking_delivery_status = normalize(row.tracking_delivery_status);
            const tracking_delivered_date = parseExcelDate(row.tracking_delivered_date);
            const order_status = normalize(row.order_status);
            const order_delivered_date = parseExcelDate(row.order_delivered_date);

            if (!sub_order_id) {
                invalid.push({ row: rowNumber, reason: "Missing sub_order_id", id: sub_order_id });
                return;
            }

            // Must have either a valid shipment update or valid order update
            if (!tracking_delivery_status && !order_status) {
                invalid.push({ row: rowNumber, reason: "Missing tracking_delivery_status or order_status", id: sub_order_id });
                return;
            }

            // Frontend validation pass against the 120 days of completed orders
            if (validOrdersMap && !(sub_order_id in validOrdersMap)) {
                invalid.push({ row: rowNumber, reason: "Order older than 120 days or not found", id: sub_order_id });
                return;
            }

            // Shipment Payload Generation
            if (tracking_delivery_status) {
                const matchedTrackingStatus = ALLOWED_DELIVERY_STATUS.find(s => s.toLowerCase() === tracking_delivery_status.toLowerCase());

                if (!matchedTrackingStatus) {
                    invalid.push({ row: rowNumber, reason: `Invalid tracking_delivery_status: ${tracking_delivery_status}`, id: sub_order_id });
                    return;
                }

                if (!trackingNumber) {
                    invalid.push({ row: rowNumber, reason: "Missing trackingNumber when trying to update shipment status", id: sub_order_id });
                    return;
                }

                // Identify if trackingNumber exists in the valid order item shipments
                const matchingSubOrder = validOrdersMap[sub_order_id]; // { sub_order_id: "", shipments: [{ trackingNumber: ... }] }
                let shipment_id = null;

                if (matchingSubOrder && matchingSubOrder.shipments) {
                    const matchedShipment = matchingSubOrder.shipments.find(s => normalize(s.trackingNumber) === trackingNumber);
                    if (matchedShipment && matchedShipment._id) {
                        shipment_id = matchedShipment._id;
                    } else {
                        // As per prompt: "either shipment_id:shipment._id(the worker will add it when matching but only if provided in excel in trackingNumber column) or trackingNumber(from the excel also validated from existing orders)"
                        // If we didn't match a tracking number from existing orders exactly, it might be invalid. Let's still proceed using trackingNumber since prompt states "or trackingNumber(...validated from existing orders)"
                    }
                }

                if (!shipmentUpdatesMap.has(sub_order_id + "_" + trackingNumber)) {
                    const shipmentPayload = {
                        sub_order_id,
                        delivery_status: matchedTrackingStatus
                    };

                    if (shipment_id) {
                        shipmentPayload.shipment_id = shipment_id;
                    } else {
                        shipmentPayload.trackingNumber = trackingNumber;
                    }

                    if (matchedTrackingStatus === "Delivered" && tracking_delivered_date) {
                        shipmentPayload.delivered_date = tracking_delivered_date;
                    }

                    shipmentUpdatesMap.set(sub_order_id + "_" + trackingNumber, shipmentPayload);
                }
            }

            // Order Payload Generation
            if (order_status) {
                const matchedOrderStatus = ALLOWED_DELIVERY_STATUS.find(s => s.toLowerCase() === order_status.toLowerCase());

                if (!matchedOrderStatus) {
                    invalid.push({ row: rowNumber, reason: `Invalid order_status: ${order_status}`, id: sub_order_id });
                    return;
                }

                if (!orderUpdatesMap.has(sub_order_id)) {
                    const orderPayload = {
                        sub_order_id,
                        delivery_status: matchedOrderStatus
                    };

                    if (matchedOrderStatus === "Delivered" && order_delivered_date) {
                        orderPayload.delivered_date = order_delivered_date;
                    }

                    orderUpdatesMap.set(sub_order_id, orderPayload);
                }
            }
        });

        const shipment_updates = Array.from(shipmentUpdatesMap.values());
        const order_updates = Array.from(orderUpdatesMap.values());

        // Let's count completely valid rows as one that generated at least 1 update
        const uniqueFailedRows = new Set(invalid.map(i => i.row)).size;
        const validCount = rows.length - uniqueFailedRows;

        self.postMessage({
            totalRows: rows.length,
            validCount: validCount,
            invalidCount: invalid.length,
            invalidRows: invalid,
            originalRows: rows,
            shipment_updates,
            order_updates
        });

    } catch (error) {
        self.postMessage({ fatalError: error.message || "Failed to process the Excel file." });
    }
};
