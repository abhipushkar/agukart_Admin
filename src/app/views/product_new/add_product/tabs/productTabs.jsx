// productTabs.jsx
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import * as React from "react";
import { Box } from "@mui/material";
import PropTypes from "prop-types";
import { useProductFormStore } from "../../states/useAddProducts";
import useTabsList from "./tabsList";

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`
    };
}

export default function ProductTabs({
                                        tabsComponents = [],
                                        currentTab,
                                        setCurrentTab,
                                        ...props
                                    }) {
    const store = useProductFormStore();
    const tabsList = useTabsList();

    function handleTabChanges(event, newValue) {
        setCurrentTab(newValue);
    }

    // Enhanced tab component that passes store
    const renderTabComponent = (TabComponent, index) => {
        const tabProps = {
            ...props,
            store,
            currentTab,
            tabIndex: index
        };

        return <TabComponent {...tabProps} />;
    };

    // Filter tabs components based on available tabs
    const filteredTabsComponents = tabsComponents.filter((component, index) => {
        const componentName = component.name || "";
        if (componentName.includes("Customization") || componentName.includes("Customisations")) {
            return store.formData.customization === "Yes";
        }
        return true;
    });

    return (
        <Box>
            <Tabs value={currentTab} onChange={handleTabChanges}>
                {tabsList.map((tab, index) => (
                    <Tab
                        key={index}
                        label={tab}
                        {...a11yProps(index)}
                    />
                ))}
            </Tabs>
            {filteredTabsComponents.map((TabComponent, index) => (
                <TabPanel key={index} index={index} value={currentTab}>
                    {renderTabComponent(TabComponent, index)}
                </TabPanel>
            ))}
        </Box>
    );
}
