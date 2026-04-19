'use client';

import { RoundTable, RectTable, RectTable8ft, CocktailTable } from './Tables';
import { ChiavariChair, KidChiavariChair, GardenChair, ResinChair, WoodenChair } from './Chairs';
import { DanceFloor } from './DanceFloor';
import { Cooler, Heater, WaterBarrel, PropaneTank } from './Others';
import { ProposalArch } from './ProposalArch';

const TABLE_TYPES = new Set(['round-table', 'rect-table', 'rect-table-8ft', 'cocktail-table']);

export function isTableType(type) {
  return TABLE_TYPES.has(type);
}

export default function Furniture({ item }) {
  const tableclothed = !!item.tableclothed;
  switch (item.type) {
    case 'round-table':
      return <RoundTable tableclothed={tableclothed} />;
    case 'rect-table':
      return <RectTable tableclothed={tableclothed} />;
    case 'rect-table-8ft':
      return <RectTable8ft tableclothed={tableclothed} />;
    case 'cocktail-table':
      return <CocktailTable tableclothed={tableclothed} />;
    case 'chiavari':
      return <ChiavariChair />;
    case 'kid-chiavari':
      return <KidChiavariChair />;
    case 'garden':
      return <GardenChair />;
    case 'resin':
      return <ResinChair />;
    case 'wooden':
      return <WoodenChair />;
    case 'dance-floor':
      return <DanceFloor width={12} depth={12} />;
    case 'dance-floor-16':
      return <DanceFloor width={16} depth={16} />;
    case 'proposal-arch':
      return <ProposalArch />;
    case 'cooler':
      return <Cooler />;
    case 'heater':
      return <Heater />;
    case 'water-barrel':
      return <WaterBarrel />;
    case 'propane-tank':
      return <PropaneTank />;
    default:
      return null;
  }
}
