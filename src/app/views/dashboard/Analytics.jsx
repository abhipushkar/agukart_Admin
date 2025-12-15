import {
  Container,
  Grid,
} from "@mui/material";
import { localStorageKey } from "app/constant/localStorageKey";
import RecentActivity from "./shared/RecentActivity";
import Graph from "./shared/Graph";
import TopSellingProduct from "./shared/TopSellingProduct";
import TotalBreakDown from "./shared/TotalBreakDown";
import ProductActivity from "./shared/ProductActivity";

export default function Analytics() {
  const designation_id = localStorage.getItem(localStorageKey.designation_id);

  return (
    <>
      <Graph />
      <Container sx={{ mb: 3, position: "relative", top: "-60px" }} maxWidth="100%">
        <Grid container spacing={2}>
          <Grid container item spacing={2} md={12} sm={12} xs={12} lg={8}>
            <Grid item sm={12} xs={12} lg={12}>
              <TopSellingProduct />
            </Grid>

          </Grid>

          <Grid container item spacing={2} md={12} lg={4}>

            <Grid item lg={12} md={6} sm={12} xs={12}>
              <TotalBreakDown />
            </Grid>
          </Grid>
        </Grid>
        {
          designation_id === "2" && <>
            <RecentActivity />
          </>
        }
        <ProductActivity />
      </Container>
    </>
  );
}
