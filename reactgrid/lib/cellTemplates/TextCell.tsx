import { FC, useEffect, useRef, useState } from "react";
import CellWrapper from "../components/CellWrapper";
import { useCellContext } from "../components/CellContext";
import { useDoubleTouch } from "../hooks/useDoubleTouch";
import { isAlphaNumericWithoutModifiers } from "../utils/keyCodeCheckings";

interface TextCellProps {
  text: string;
  onTextChanged: (newText: string) => void;
  style?: React.CSSProperties;
}

export const TextCell: FC<TextCellProps> = ({ text: initialText, onTextChanged }) => {
  const ctx = useCellContext();
  const targetInputRef = useRef<HTMLInputElement>(null);
  const [isEditMode, setEditMode] = useState(false);
  const [currentValue, setCurrentValue] = useState(initialText || "");
  const { handleDoubleTouch } = useDoubleTouch(ctx, setEditMode);

  useEffect(() => {
    setCurrentValue(initialText);
  }, [initialText]);

  return (
    <CellWrapper
      onStringValueRequsted={() => initialText}
      onStringValueReceived={(v) => onTextChanged?.(v)}
      onTouchEnd={handleDoubleTouch}
      style={{ padding: ".2rem", textAlign: "center", outline: "none", minHeight: 0 }}
      onDoubleClick={() => {
        if (ctx.isFocused) {
          setCurrentValue(initialText || "");
          setEditMode(true);
        }
      }}
      onKeyDown={(e) => {
        if (!isEditMode && isAlphaNumericWithoutModifiers(e)) {
          setCurrentValue("");
          setEditMode(true);
        } else if (!isEditMode && e.key === "Enter") {
          e.stopPropagation();
          setCurrentValue(initialText || "");
          setEditMode(true);
        }
      }}
    >
      {isEditMode ? (
        <input
          className="rg-input"
          value={currentValue}
          onChange={(e) => setCurrentValue(e.currentTarget.value)}
          onBlur={(e) => {
            onTextChanged?.(e.currentTarget.value);
            setEditMode(false);
          }}
          onCut={(e) => e.stopPropagation()}
          onCopy={(e) => e.stopPropagation()}
          onPaste={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            const controlKeys = ["Escape", "Enter", "Tab"];
            if (!controlKeys.includes(e.key)) {
              e.stopPropagation();
            }
            if (e.key === "Escape") {
              setEditMode(false);
            } else if (e.key === "Enter") {
              onTextChanged?.(e.currentTarget.value);
              setEditMode(false);
            }
          }}
          autoFocus
          ref={targetInputRef}
        />
      ) : (
        initialText
      )}
    </CellWrapper>
  );
};
