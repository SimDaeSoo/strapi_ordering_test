import React from 'react';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { rectSortingStrategy } from '@dnd-kit/sortable';
import { GridContainer } from '../components';
import { Sortable } from './Sortable';

const props = {
  adjustScale: true,
  Container: (props) => <GridContainer {...props} columns={5} />,
  strategy: rectSortingStrategy,
  wrapperStyle: () => ({
    width: 140,
    height: 140,
  }),
  modifiers: [restrictToWindowEdges],
};

const BasicSetup = () => <Sortable {...props} />;

export default BasicSetup;