import { DebugHelper } from '../helpers/debug.helper';
import { paramDecoratorTest } from './param-decorator';

console.clear();
DebugHelper.config();
(function () {
	paramDecoratorTest();
})();
