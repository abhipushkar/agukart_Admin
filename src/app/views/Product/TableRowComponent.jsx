import React, { useState } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { Checkbox, Switch } from "@mui/material";

const TableRowComponent = ({
  comb,
  handleCombChange,
  handleToggle,
  combindex,
  formValues,
  variationsData,
  combinationError, // Accept combinationError as a prop
  showAll,
  setShowAll
}) => {
  const label = { inputProps: { "aria-label": "Switch demo" } };
  const handleSeeMore = () => {
    setShowAll((prev) => !prev);
  };

  const itemsToShow = showAll ? comb.combinations : comb.combinations.slice(0, 5);

  return (
    <>
      {itemsToShow?.map((item, index) => (
        <TableRow
          key={index}
          sx={{
            wordBreak: "keep-all"
          }}
        >
          <TableCell align="center">
            <Checkbox {...label} size="small" />
          </TableCell>
          {
            item?.value1 && <TableCell align="center">{item?.value1}</TableCell>
          }
          {
            item?.value2 && <TableCell align="center">{item?.value2}</TableCell>
          }
          {
            (variationsData.length >= 2 ? formValues?.prices === comb.variant_name : true) &&
            item?.isCheckedPrice &&
            item?.isVisible && (
            <TableCell align="center">
                <input
                  type="text"
                  name="price"
                  value={comb?.combinations[index]?.price || ""}
                  onChange={(e) => handleCombChange(e, combindex, index)}
                  style={{
                    height: "30px",
                    width: "100px",
                    border: "2px solid green"
                  }}
                />
                {/* Display price error */}
                {combinationError[`Price-${comb.variant_name}-${index}`] && (
                  <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                    {combinationError[`Price-${comb.variant_name}-${index}`]}
                  </div>
                )}
            </TableCell>
            )
          }
          {
            (variationsData.length >= 2 ? formValues?.quantities === comb.variant_name : true) &&
            item?.isCheckedQuantity &&
            item?.isVisible && (
              <TableCell align="center">
                <input
                  type="text"
                  name="qty"
                  value={comb?.combinations[index]?.qty || ""}
                  onChange={(e) => handleCombChange(e, combindex, index)}
                  style={{
                    height: "30px",
                    width: "100px",
                    border: "2px solid green"
                  }}
                />
                {/* Display quantity error */}
                {combinationError[`Quantity-${comb.variant_name}-${index}`] && (
                  <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                    {combinationError[`Quantity-${comb.variant_name}-${index}`]}
                  </div>
                )}
              </TableCell>
            )
          }
          <TableCell align="center">
            <Switch
              {...label}
              checked={item.isVisible}
              onChange={() => handleToggle(combindex, index)}
            />
          </TableCell>
        </TableRow>
      ))}

      {/* See More / See Less Button */}
      {comb.combinations.length > 5 && (
        <TableRow>
          <TableCell colSpan={6} align="center">
            <button
              onClick={handleSeeMore}
              style={{
                padding: "5px 10px",
                background: "lightblue",
                border: "none",
                cursor: "pointer",
                borderRadius: "4px"
              }}
            >
              {showAll ? "See Less" : "See More"}
            </button>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default TableRowComponent;
