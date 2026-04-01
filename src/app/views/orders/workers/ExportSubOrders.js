/* eslint-env worker */
/* global importScripts, XLSX */
/* eslint-disable no-restricted-globals */

importScripts(
    "https://cdn.jsdelivr.net/npm/xlsx-js-style/dist/xlsx.bundle.js"
);

self.onmessage = function (e) {
    const { suborders } = e.data;

    try {
        const rows = suborders.map((order) => {
            const parent = order.parentSale || {};

            const nameParts = (parent.receiver_name || "").split(" ");

            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            const completeAddress = [
                parent.receiver_name,
                parent.address_line1,
                parent.address_line2 || null,
                `${parent.city}, ${parent.state} ${parent.pincode}`,
                parent.country,
                `${parent.phone_code}${parent.mobile}`,
            ]
                .filter(Boolean)
                .join("\r\n");

            return {
                "Order no.": parent.order_id,
                "Store name": order.items[0].shop_name || order.shop_name,
                "Sub order no.": order.sub_order_id,
                "First name": firstName,
                "Last name": lastName,
                "Address 1st line": parent.address_line1,
                "Address 2nd line": parent.address_line2,
                "Zip code": parent.pincode,
                City: parent.city,
                "State": parent.state,
                "Country name": parent.country,
                "Phone no.": `${parent.phone_code}${parent.mobile}`,
                "Buyer Email id": parent.userEmail,
                "Buyer Full Name": parent.receiver_name,
                "Complete Address": {
                    v: completeAddress,
                    t: "s",
                    s: {
                        alignment: {
                            wrapText: true,
                            vertical: "top",
                        },
                    },
                },
            };
        });

        const worksheet = XLSX.utils.json_to_sheet([]);

        // add header
        XLSX.utils.sheet_add_json(worksheet, rows, {
            origin: "A1",
            skipHeader: false,
        });

        // force column width (optional but recommended)
        worksheet["!cols"] = [
            { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 25 },
            { wch: 25 }, { wch: 25 }, { wch: 10 }, { wch: 15 }, { wch: 25 },
            { wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 25 }, { wch: 40 }
        ];
        // apply wrap to all cells in "Complete Address" column
        const range = XLSX.utils.decode_range(worksheet['!ref']);

        for (let R = range.s.r + 1; R <= range.e.r; ++R) {
            const cellRef = XLSX.utils.encode_cell({ r: R, c: 14 }); // column index 11 (Complete Address)
            if (worksheet[cellRef]) {
                worksheet[cellRef].s = {
                    alignment: { wrapText: true },
                };
            }
        }
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "SubOrders");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });

        self.postMessage({ success: true, buffer: excelBuffer });
    } catch (error) {
        self.postMessage({ success: false, error: error.message });
    }
};