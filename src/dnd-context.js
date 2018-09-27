import React from 'react'

import {DragDropContext} from 'react-dnd'

import HTML5Backend from 'react-dnd-html5-backend';
import TouchBackend from 'react-dnd-touch-backend';
import MultiBackend, {TouchTransition} from 'react-dnd-multi-backend';

const HTML5toTouch = {
    backends: [
        {
            backend: HTML5Backend,
        },
        {
            backend: TouchBackend, // Note that you can call your backends with options
            preview: true,
            transition: TouchTransition
        }
    ]
};
const context = DragDropContext(MultiBackend(HTML5toTouch));

export default (component) => context(component)
