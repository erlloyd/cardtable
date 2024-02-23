import React, { useState, useRef, useImperativeHandle } from "react";
import { IconMenuItem } from "./IconMenuItem";
import { Menu, MenuItemProps, MenuProps } from "@mui/material";
import { ChevronRight } from "../icons/ChevronRight";

export interface NestedMenuItemProps extends Omit<MenuItemProps, "button"> {
  parentMenuOpen: boolean;
  component?: React.ElementType;
  label?: string;
  labelHTML?: string;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  tabIndex?: number;
  disabled?: boolean;
  ContainerProps?: React.HTMLAttributes<HTMLElement> &
    React.RefAttributes<HTMLElement | null>;
  MenuProps?: Omit<MenuProps, "children">;
  button?: true | undefined;
}

const NestedMenuItem = React.forwardRef<
  HTMLLIElement | null,
  NestedMenuItemProps
>(function NestedMenuItem(props, ref) {
  const {
    parentMenuOpen,
    label,
    labelHTML,
    rightIcon = <ChevronRight />,
    leftIcon = null,
    children,
    className,
    tabIndex: tabIndexProp,
    ContainerProps: ContainerPropsProp = {},
    ...MenuItemProps
  } = props;

  const { ref: containerRefProp, ...ContainerProps } = ContainerPropsProp;

  const menuItemRef = useRef<HTMLLIElement>(null);
  useImperativeHandle(ref, () => menuItemRef.current as unknown as any);

  const containerRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(containerRefProp, () => containerRef.current);

  const menuContainerRef = useRef<HTMLDivElement>(null);

  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    setIsSubMenuOpen(true);

    if (ContainerProps.onMouseEnter) {
      ContainerProps.onMouseEnter(e);
    }
  };
  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    // There was an issue that came up in a Chrome release (detected in v122.0.6261.69) where
    // mousing over a file upload window results in a "MouseLeave" event. This didn't use to happen.
    // This is a problem if a submenu contains a file uploader, because when you go to upload the file,
    // you will close the submenu, but then that removes the file upload `input` element from the DOM,
    // so the file upload fails. So we need to try to detect if there is a window as part of the

    if (
      e.relatedTarget &&
      (e.relatedTarget as Window)?.self == e.relatedTarget
    ) {
      // it's a window, don't do anything
      return;
    }

    setIsSubMenuOpen(false);

    if (ContainerProps.onMouseLeave) {
      ContainerProps.onMouseLeave(e);
    }
  };

  // Check if any immediate children are active
  const isSubmenuFocused = () => {
    const active = containerRef?.current?.ownerDocument.activeElement;
    const children = menuContainerRef?.current?.children;
    if (!!children) {
      var childrenArr = Array.prototype.slice.call(children);
      for (const child of childrenArr) {
        if (child === active) {
          return true;
        }
      }
    }
    return false;
  };

  const handleFocus = (e: React.FocusEvent<HTMLElement>) => {
    if (e.target === containerRef.current) {
      setIsSubMenuOpen(true);
    }

    if (ContainerProps.onFocus) {
      ContainerProps.onFocus(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      return;
    }

    if (isSubmenuFocused()) {
      e.stopPropagation();
    }

    const active = containerRef?.current?.ownerDocument.activeElement ?? false;

    if (e.key === "ArrowLeft" && isSubmenuFocused()) {
      containerRef?.current?.focus();
    }

    if (
      e.key === "ArrowRight" &&
      e.target === containerRef.current &&
      e.target === active
    ) {
      const firstChild = menuContainerRef?.current?.children[0] ?? null;
      if ((firstChild as any)?.focus) {
        (firstChild as any)?.focus();
      }
    }
  };

  const open = isSubMenuOpen && parentMenuOpen;

  // Root element must have a `tabIndex` attribute for keyboard navigation
  let tabIndex;
  if (!props.disabled) {
    tabIndex = tabIndexProp !== undefined ? tabIndexProp : -1;
  }

  return (
    <div
      {...ContainerProps}
      ref={containerRef}
      onFocus={handleFocus}
      tabIndex={tabIndex}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
    >
      <IconMenuItem
        MenuItemProps={MenuItemProps}
        className={className}
        ref={menuItemRef}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        label={label}
        labelHTML={labelHTML}
        onClick={(e) => {
          // This was added so if we click on the submenu item
          // (specifically in a touch interface) the submenu will open
          setIsSubMenuOpen(true);
          e.stopPropagation();
        }}
      />

      <Menu
        // Set pointer events to 'none' to prevent the invisible Popover div
        // from capturing events for clicks and hovers
        style={{ pointerEvents: "none" }}
        anchorEl={menuItemRef.current}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        open={open}
        autoFocus={false}
        disableAutoFocus
        disableEnforceFocus
        onClose={() => {
          setIsSubMenuOpen(false);
        }}
      >
        <div ref={menuContainerRef} style={{ pointerEvents: "auto" }}>
          {children}
        </div>
      </Menu>
    </div>
  );
});

NestedMenuItem.displayName = "NestedMenuItem";
export { NestedMenuItem };
