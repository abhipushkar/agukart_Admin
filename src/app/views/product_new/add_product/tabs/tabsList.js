// tabsList.js
import { useProductFormStore } from "../../states/useAddProducts";

export const useTabsList = () => {
    const { formData } = useProductFormStore();

    const baseTabs = [
        "Product Identity",
        "Description",
        "Dynamic Tabs",
        "Product Details",
        "Variations",
        "Offer",
    ];

    if (formData.customization === "Yes") {
        return [...baseTabs, "Customizations"];
    }

    return baseTabs;
};

export default useTabsList;
