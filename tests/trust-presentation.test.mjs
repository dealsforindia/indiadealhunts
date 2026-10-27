import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

function renderComponent(file, name, bindings, props) {
  const source = readFileSync(new URL(`../src/components/${file}`, import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  const exports = {};
  const react = { ...React, useId: () => 'fixture', useRef: () => ({ current: null }), useState: value => [value, () => {}] };
  const require = id => id === 'react' ? { ...react, default: react, __esModule: true } : bindings[id] || {};
  new Function('require', 'exports', 'React', code)(require, exports, React);
  return renderToStaticMarkup(React.createElement(exports[name], props));
}

test('missing review evidence never claims a verified deal', () => {
  for (const status of ['idle', 'failed', 'unavailable']) {
    const html = renderComponent('CardReviewEvidence.tsx', 'CardReviewEvidence', {
      'lucide-react': { Star: () => null },
      '../utils/reviewEvidence': { useAutomaticReviews: () => ({ result: null, load: { status } }) },
    }, { id: 'fixture', url: 'https://www.amazon.in/dp/B012345678', title: 'Fixture' });
    assert.doesNotMatch(html, /Verified Deal/);
    assert.match(html, /Reviews unavailable/);
  }
});

test('unknown delivery displays a subtotal rather than a payable total', () => {
  const html = renderComponent('CheckoutPlanner.tsx', 'CheckoutPlanner', {
    'lucide-react': { Calculator: () => null, ChevronDown: () => null },
    '../utils/checkout': {
      checkoutAmount: () => null,
      calculateCheckout: () => ({ subtotal: 1000, payNow: null, afterCashback: null, cashback: 0, discount: 0 }),
    },
  }, { offer: { price: 1000 } });
  assert.doesNotMatch(html, /Pay at checkout/);
  assert.match(html, /Subtotal before delivery/);
  assert.match(html, /Enter the delivery fee/);
});
