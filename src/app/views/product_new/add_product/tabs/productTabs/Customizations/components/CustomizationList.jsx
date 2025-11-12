// components/CustomizationList.jsx
import React from 'react';
import { Stack } from "@mui/material";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableCustomizationItem from './DraggableCustomizationItem';
import TextCustomization from './TextCustomisation';
import OptionDropdown from './OptionDropdown';
import VariantCustomizationTable from './VariantCustomizationTable';
import {useProductFormStore} from "../../../../../states/useAddProducts";

const CustomizationList = () => {
    const { customizationData, setCustomizationData } = useProductFormStore();

    const moveCustomizationItem = (fromIndex, toIndex) => {
        const updatedCustomizations = [...customizationData.customizations];
        const [movedItem] = updatedCustomizations.splice(fromIndex, 1);
        updatedCustomizations.splice(toIndex, 0, movedItem);

        setCustomizationData({
            ...customizationData,
            customizations: updatedCustomizations,
        });
    };

    const handleCustomizationDelete = (index) => {
        setCustomizationData({
            ...customizationData,
            customizations: customizationData.customizations.filter((_, i) => i !== index)
        });
    };

    const handleTitleEdit = (index, newTitle) => {
        setCustomizationData({
            ...customizationData,
            customizations: customizationData.customizations.map((item, idx) =>
                idx === index ? { ...item, title: newTitle } : item
            )
        });
    };

    const renderCustomizationContent = (item, index) => {
        console.log("Rendering customization:", {
            title: item.title,
            isVariant: item.isVariant,
            hasOptionList: !!item.optionList,
            optionList: item.optionList
        });

        // First check if it's a variant customization
        if (item.isVariant === true || item.isVariant === "true") {
            console.log("Is Variant: true - rendering VariantCustomizationTable");
            return (
                <VariantCustomizationTable index={index} />
            );
        }
        // Then check if it has optionList (Option Dropdown)
        else if (item.optionList) {
            console.log("Has optionList - rendering OptionDropdown");
            return (
                <OptionDropdown index={index} />
            );
        }
        // Otherwise it's a Text customization
        else {
            console.log("No optionList, not variant - rendering TextCustomization");
            return (
                <TextCustomization index={index} />
            );
        }
    };

    return (
        <Stack gap={2} mt={2}>
            <DndProvider backend={HTML5Backend}>
                {customizationData?.customizations?.length > 0 &&
                    customizationData?.customizations?.map((item, i) => (
                        <DraggableCustomizationItem
                            key={i}
                            id={i}
                            index={i}
                            moveItem={moveCustomizationItem}
                            title={item.label || item.title}
                            onTitleEdit={(newTitle) => handleTitleEdit(i, newTitle)}
                            onDelete={() => handleCustomizationDelete(i)}
                        >
                            {renderCustomizationContent(item, i)}
                        </DraggableCustomizationItem>
                    ))}
            </DndProvider>
        </Stack>
    );
};

export default CustomizationList;
