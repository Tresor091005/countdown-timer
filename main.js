import * as dom from './modules/dom.js'
import { runClock } from './modules/flip.js'
import { ChangePathColor } from './modules/function.js';

for (const link of dom.links) {
    link.addEventListener('mouseover', () => {ChangePathColor(link.firstChild, "#fb6087")})
    link.addEventListener('mouseleave', () => {ChangePathColor(link.firstChild, "#8385A9")})
}

runClock(dom.flip, "July 17, 2024", () => { alert('Heureux Jour de Fête') });
