import { buildsrc, resolveDependency } from './buildsrc.mjs';
import * as fs from 'fs';
const f = fs.readFileSync('util/option.json');
const option = JSON.parse(f);
const srcs = resolveDependency('src/index.ts');
buildsrc(
	['util/pacruntime/runtime.d.ts', 'util/context/env.d.ts', ...srcs],
	option
);
