import { graphql } from "gatsby";
import { Page, Seo } from "gatsby-theme-portfolio-minimal";
import React from "react";

import { PlayersComparisonChart } from "src/components/players/PlayersComparisonChart";

const DEFAULT_PLAYERS = [ "Stephen Curry", "LeBron James" ];

const BAR_CHART_COLORS = [ "#55B4B0", "#D65076" ];

export default function ComparePlayers({ data }) {
  return (
    <>
      <Seo title="Compare Players" />
      <Page useSplashScreenAnimation>
        <PlayersComparisonChart defaultPlayers={DEFAULT_PLAYERS} barColors={BAR_CHART_COLORS} data={data}/>
      </Page>
    </>
  );
}

export const pageQuery = graphql`
  query pageQuery {
    allPlayersCsv {
      nodes {
        id
        name
        shortName
        startingRank
        maxRank
        ballHandlingBase
        perimeterShootingBase
        midRangeShootingBase
        dunkPowerBase
        defenseBase
        blockingBase
        stealingBase
        strengthBase
        speedBase
        staminaBase
        ballHandlingMax
        perimeterShootingMax
        midRangeShootingMax
        dunkPowerMax
        defenseMax
        blockingMax
        stealingMax
        strengthMax
        speedMax
        staminaMax
      }
    }
  }
`;
