/* eslint-env worker */
/* global importScripts, XLSX */
/* eslint-disable no-restricted-globals */

importScripts(
    "https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"
);

const ALLOWED_STATUS = [
    "Pre-Shipped",
    "No tracking",
    "track on",
    "Pre transit",
    "Out for delivery",
    "In transit",
    "Delivery attempt",
    "Delivered",
    "Cancelled"
];

const normalize = (val) => String(val || "").trim();

self.onmessage = async (event) => {
    const { file, validSubOrdersMap, allowedCouriers } = event.data;

    console.log(`[Worker Sanity Check] Started parsing Excel file.`);
    console.log(`[Worker Sanity Check] Number of validSubOrders allowed: ${validSubOrdersMap ? Object.keys(validSubOrdersMap).length : 'None'}`);
    console.log(`[Worker Sanity Check] Allowed Couriers:`, allowedCouriers);

    try {
        const buffer = await file.arrayBuffer();

        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rows = XLSX.utils.sheet_to_json(sheet, {
            defval: ""
        });

        console.log(`[Worker Sanity Check] Parsed ${rows.length} rows from Excel sheet.`);

        if (!rows.length) {
            self.postMessage({ fatalError: "Empty Excel file" });
            return;
        }

        const requiredColumns = [
            "sub_order_id",
            "courierName",
        ];

        const headers = Object.keys(rows[0] || {});
        const missing = requiredColumns.filter(col => !headers.includes(col));

        const hasTrackingStatus = headers.includes("trackingStatus");
        const hasDeliveryStatus = headers.includes("delivery_status");

        if (!hasTrackingStatus && !hasDeliveryStatus) {
            missing.push("trackingStatus or delivery_status");
        }

        if (missing.length) {
            self.postMessage({
                fatalError: `Missing columns: ${missing.join(", ")}`
            });
            return;
        }

        let invalid = [];
        let ignoredNotInSystemCount = 0;
        const uniqueMap = new Map();

        console.log("[Worker Sanity Check] Checking each row...");

        const validOrdersMap = validSubOrdersMap && typeof validSubOrdersMap === 'object'
            ? validSubOrdersMap
            : null;

        const allowedCouriersSet = Array.isArray(allowedCouriers) && allowedCouriers.length > 0
            ? new Set(allowedCouriers)
            : null;

        rows.forEach((row, index) => {
            const rowNumber = index + 2;
            const sub_order_id = normalize(row.sub_order_id);
            const courierName = normalize(row.courierName);
            const trackingNumber = normalize(row.trackingNumber);
            const trackingStatus = normalize(row.trackingStatus || row.delivery_status);

            console.log(`[Worker Row Check] Row ${rowNumber}: sub_order_id="${sub_order_id}", courierName="${courierName}", trackingNumber="${trackingNumber}", trackingStatus="${trackingStatus}"`);

            // Verify that this sub_order_id exists in the frontend valid set
            if (validOrdersMap && !(sub_order_id in validOrdersMap)) {
                // Ignoring if not present in frontend state as requested
                ignoredNotInSystemCount++;
                return;
            }

            const currentStatus = validOrdersMap ? validOrdersMap[sub_order_id] : null;

            // Only unshipped, in-progress, or cancelled statuses can be updated
            if (currentStatus === "new") {
                invalid.push({ row: rowNumber, reason: `Sub-order status '${currentStatus}' cannot be updated`, id: sub_order_id });
                return;
            }

            if (!sub_order_id || !courierName || !trackingNumber || !trackingStatus) {
                invalid.push({ row: rowNumber, reason: "Missing required field", id: sub_order_id });
                return;
            }

            // Verify courier is accepted by the platform
            const matchedCourier = allowedCouriersSet
                ? Array.from(allowedCouriersSet).find(c => c.toLowerCase() === courierName.toLowerCase())
                : courierName; // fallback if no set

            if (allowedCouriersSet && !matchedCourier) {
                invalid.push({ row: rowNumber, reason: `Invalid courier: ${courierName}`, id: sub_order_id });
                return;
            }

            const matchedStatus = ALLOWED_STATUS.find(s => s.toLowerCase() === trackingStatus.toLowerCase());

            if (!matchedStatus) {
                invalid.push({ row: rowNumber, reason: `Invalid trackingStatus: ${trackingStatus}`, id: sub_order_id });
                return;
            }

            if (uniqueMap.has(sub_order_id)) {
                invalid.push({ row: rowNumber, reason: "Duplicate sub_order_id", id: sub_order_id });
                return;
            }

            uniqueMap.set(sub_order_id, {
                sub_order_id,
                courierName: matchedCourier,
                trackingNumber,
                trackingStatus: matchedStatus
            });
        });

        const validShipments = Array.from(uniqueMap.values());

        self.postMessage({
            totalRows: rows.length,
            validCount: validShipments.length,
            invalidCount: invalid.length,
            invalidRows: invalid,
            shipments: validShipments
        });

    } catch (error) {
        self.postMessage({ fatalError: error.message || "Failed to process the Excel file." });
    }
};
