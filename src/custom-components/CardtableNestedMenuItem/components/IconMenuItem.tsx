import React, { forwardRef, RefObject } from "react";
import { MenuItem, MenuItemProps, Typography } from "@mui/material";
import { Box, styled } from "@mui/system";

const StyledMenuItem = styled(MenuItem)({
  paddingLeft: "4px",
  paddingRight: "4px",
  display: "flex",
  justifyContent: "space-between",
});

const StyledTypography = styled(Typography)({
  paddingLeft: "8px",
  paddingRight: "8px",
  textAlign: "left",
});

const FlexBox = styled(Box)({
  display: "flex",
});

interface IconMenuItemProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLLIElement>;
  label?: string;
  labelHTML?: string;
  className?: string;
  MenuItemProps?: MenuItemProps;
  ref?: RefObject<HTMLLIElement>;
}

const IconMenuItem = forwardRef<HTMLLIElement, IconMenuItemProps>(
  (
    {
      leftIcon,
      rightIcon,
      onClick,
      label,
      labelHTML,
      MenuItemProps,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <StyledMenuItem
        {...(MenuItemProps as any)}
        ref={ref}
        className={className}
        onClick={onClick}
        {...props}
      >
        <FlexBox>
          {leftIcon}
          <StyledTypography
            dangerouslySetInnerHTML={
              labelHTML ? { __html: labelHTML } : undefined
            }
          >
            {labelHTML ? null : label}
          </StyledTypography>
        </FlexBox>
        {rightIcon}
      </StyledMenuItem>
    );
  }
);

IconMenuItem.displayName = "IconMenuItem";
export { IconMenuItem };
