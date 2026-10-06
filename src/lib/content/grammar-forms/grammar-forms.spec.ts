import { studiedBeforeLaterGrammar } from '../testing/corpus';
import { describeGrammarUnit } from '../testing/unit-rules';
import { grammarFormsUnit } from './index';

describeGrammarUnit(grammarFormsUnit, {
	studied: studiedBeforeLaterGrammar,
	after: 'grammar-later'
});
