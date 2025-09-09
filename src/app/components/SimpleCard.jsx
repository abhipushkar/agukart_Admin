import { Card, Box, styled } from "@mui/material";

// STYLED COMPONENTS
const CardRoot = styled(Card)({
  height: "100%",
  padding: "20px 24px"
});

const CardTitle = styled("div")(({ subtitle }) => ({
  fontSize: "1.25rem",
  fontWeight: "500",
  textTransform: "capitalize",
  marginBottom: !subtitle && "16px",
  lineHeight: "1.6",
  letterSpacing: "0.0075em"
}));

export default function SimpleCard({ children, title, subtitle }) {
  return (
    <CardRoot elevation={6}>
      <CardTitle subtitle={subtitle}>{title}</CardTitle>
      {subtitle && <Box mb={2}>{subtitle}</Box>}
      {children}
    </CardRoot>
  );
}
