import React, { FC } from "react";
import CellWrapper from "../components/CellWrapper";

interface NonEditableCellProps {
  value?: string | number;
  style?: React.CSSProperties;
}

export const NonEditableCell: FC<NonEditableCellProps> = ({ value, style }) => {
  return (
    <CellWrapper onStringValueRequested={() => value?.toString() || ""} onStringValueReceived={() => {}} style={style}>
      {value}
    </CellWrapper>
  );
};
